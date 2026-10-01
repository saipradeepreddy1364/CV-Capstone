package com.example.smartattendance.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

@Component
public class JwtUtils {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${smartattendance.jwt.secret}")
    private String jwtSecret;

    @Value("${smartattendance.jwt.expiration-ms}")
    private long jwtExpirationMs;

    @Value("${smartattendance.jwt.refresh-expiration-ms}")
    private long jwtRefreshExpirationMs;

    private SecretKey getSigningKey() {
        try {
            byte[] keyBytes;
            if (jwtSecret.length() >= 64) {
                try {
                    keyBytes = Decoders.BASE64.decode(jwtSecret);
                } catch (Exception e) {
                    keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
                }
            } else {
                // Generate a deterministic 256-bit SHA-256 hash if provided secret is short
                MessageDigest sha256 = MessageDigest.getInstance("SHA-256");
                keyBytes = sha256.digest(jwtSecret.getBytes(StandardCharsets.UTF_8));
            }
            return Keys.hmacShaKeyFor(keyBytes);
        } catch (Exception e) {
            throw new RuntimeException("Error initializing JWT signing key", e);
        }
    }

    public String generateAccessToken(UUID userId, UUID organizationId, String email, String role) {
        return Jwts.builder()
                .subject(userId.toString())
                .claim("email", email)
                .claim("organizationId", organizationId != null ? organizationId.toString() : null)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    public String generateRefreshToken(UUID userId) {
        return Jwts.builder()
                .subject(userId.toString())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtRefreshExpirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            logger.warn("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    public UUID getUserIdFromToken(String token) {
        return UUID.fromString(parseClaims(token).getSubject());
    }

    public UUID getOrganizationIdFromToken(String token) {
        String orgIdStr = parseClaims(token).get("organizationId", String.class);
        return orgIdStr != null ? UUID.fromString(orgIdStr) : null;
    }

    public String getRoleFromToken(String token) {
        return parseClaims(token).get("role", String.class);
    }
}
