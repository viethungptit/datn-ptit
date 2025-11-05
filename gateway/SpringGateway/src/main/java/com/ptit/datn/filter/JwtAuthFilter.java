package com.ptit.datn.filter;
import com.ptit.datn.config.JwtProperties;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import org.springframework.http.HttpMethod;
import org.springframework.util.AntPathMatcher;
import java.util.List;

@Component
public class JwtAuthFilter implements GlobalFilter, Ordered {

    private final JwtProperties jwtProperties;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    public JwtAuthFilter(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getPath().value();
        HttpMethod method = exchange.getRequest().getMethod();

        // 🔓 Bỏ qua các endpoint public
        if (isPublicEndpoint(path, method)) {
            return chain.filter(exchange);
        }

        // 🔒 Các route còn lại cần JWT
        String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new AuthenticationException("JWT không hợp lệ hoặc không tồn tại") {};
        }

        String token = authHeader.substring(7);
        Claims claims;
        try {
            SecretKey key = Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8));
            claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
        } catch (JwtException e) {
            if (e.getMessage() != null && e.getMessage().toLowerCase().contains("expired")) {
                throw new AuthenticationException("Access token đã hết hạn") {};
            }
            throw new AuthenticationException("JWT không hợp lệ hoặc không tồn tại") {};
        }

        // ✅ Thêm user info vào header để service con nhận
        String userId = claims.getSubject();
        String role = claims.get("role", String.class);

        ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                .header("X-User-Id", userId)
                .header("X-User-Role", role)
                .build();

        return chain.filter(exchange.mutate().request(mutatedRequest).build());
    }

    private boolean isPublicEndpoint(String path, HttpMethod method) {
        List<JwtProperties.PublicEndpoint> publicEndpoints = jwtProperties.getPublicEndpoints();
        if (publicEndpoints == null) return false;

        for (JwtProperties.PublicEndpoint endpoint : publicEndpoints) {
            if (pathMatcher.match(endpoint.getPath(), path)) {
                List<HttpMethod> allowedMethods = endpoint.getMethods();
                if (allowedMethods == null || allowedMethods.isEmpty() || allowedMethods.contains(method)) {
                    return true;
                }
            }
        }
        return false;
    }

    @Override
    public int getOrder() {
        return -1;
    }
}
