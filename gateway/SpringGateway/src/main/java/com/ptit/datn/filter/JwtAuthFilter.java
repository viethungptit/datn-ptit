package com.ptit.datn.filter;

import com.ptit.datn.exception.UnauthorizedException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Component
public class JwtAuthFilter implements GlobalFilter, Ordered {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getPath().value();

        // Bypass JWT check for /api/auth/**
        if (path.startsWith("/api/auth/")) {
            return chain.filter(exchange);
        }

        if (path.startsWith("/api/test/")) {
            return chain.filter(exchange);
        }

        // Get JWT from Authorization header only
        String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("JWT token is missing or invalid");
        }
        String token = authHeader.substring(7); // Remove 'Bearer '

        // Validate JWT
        Claims claims;
        try {
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
            claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (JwtException e) {
            if (e.getMessage() != null && e.getMessage().toLowerCase().contains("expired")) {
                throw new UnauthorizedException("Access token expired");
            }
            throw new UnauthorizedException("JWT token is missing or invalid");
        } catch (IllegalArgumentException e) {
            throw new UnauthorizedException("JWT token is missing or invalid");
        }

        // Get userId (subject) and role
        String userId = claims.getSubject();
        String role = claims.get("role", String.class);

        // Add headers
        ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                .header("X-User-Id", userId)
                .header("X-User-Role", role)
                .build();

        ServerWebExchange mutatedExchange = exchange.mutate().request(mutatedRequest).build();
        return chain.filter(mutatedExchange);
    }

    @Override
    public int getOrder() {
        return -1; // Highest precedence
    }
}
