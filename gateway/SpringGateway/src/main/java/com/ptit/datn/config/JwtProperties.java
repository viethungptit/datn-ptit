package com.ptit.datn.config;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import java.util.List;

@Configuration
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {
    private String secret;
    private List<PublicEndpoint> publicEndpoints;

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public List<PublicEndpoint> getPublicEndpoints() {
        return publicEndpoints;
    }

    public void setPublicEndpoints(List<PublicEndpoint> publicEndpoints) {
        this.publicEndpoints = publicEndpoints;
    }

    public static class PublicEndpoint {
        private String path;
        private List<HttpMethod> methods;

        public String getPath() {
            return path;
        }

        public void setPath(String path) {
            this.path = path;
        }

        public List<HttpMethod> getMethods() {
            return methods;
        }

        public void setMethods(List<HttpMethod> methods) {
            this.methods = methods;
        }
    }

    @PostConstruct
    public void init() {
        if (publicEndpoints != null) {
            publicEndpoints.forEach(ep ->
                    System.out.println("✅ Loaded public endpoint: " + ep.getPath() + " " + ep.getMethods())
            );
        } else {
            System.out.println("⚠️ publicEndpoints is null");
        }
    }

}
