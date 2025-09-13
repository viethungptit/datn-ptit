package com.ptit.userservice.config;

import com.ptit.userservice.entity.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.Claims;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;

import java.util.Date;
import java.util.UUID;
import java.util.Base64;

@Component
public class JwtUtil {
    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expirationMs:3600000}")
    private long jwtExpirationMs;

    @Value("${jwt.refreshExpirationMs:604800000}")
    private long refreshExpirationMs;

    public String generateToken(User user) {
        byte[] secretBytes = Base64.getDecoder().decode(jwtSecret);
        return Jwts.builder()
                .setSubject(user.getUserId().toString())
                .claim("role", user.getRole().name())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(SignatureAlgorithm.HS512, secretBytes)
                .compact();
    }

    public String generateRefreshToken(User user) {
        byte[] secretBytes = Base64.getDecoder().decode(jwtSecret);
        return Jwts.builder()
                .setSubject(user.getUserId().toString())
                .claim("type", "refresh")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshExpirationMs))
                .signWith(SignatureAlgorithm.HS512, secretBytes)
                .compact();
    }

    public Claims validateToken(String token) {
        byte[] secretBytes = Base64.getDecoder().decode(jwtSecret);
        return Jwts.parser().setSigningKey(secretBytes).parseClaimsJws(token).getBody();
    }

    public UUID getUserIdFromToken(String token) {
        Claims claims = validateToken(token);
        return UUID.fromString(claims.getSubject());
    }
}
