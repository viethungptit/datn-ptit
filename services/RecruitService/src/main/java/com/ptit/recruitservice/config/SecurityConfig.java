package com.ptit.recruitservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                                .requestMatchers(HttpMethod.GET, "/api/recruit-service/jobs/**").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/recruit-service/job-tag/mapping").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/recruit-service/job-tag/all").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/recruit-service/group-tag/mapping").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/recruit-service/group-tag/all").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/recruit-service/cv-templates/all").permitAll()
                                .requestMatchers(HttpMethod.PUT, "/api/recruit-service/jobs/company/**").permitAll()
                                .requestMatchers(
                                        "/swagger-ui/**",
                                        "/swagger-ui.html",
                                        "/v3/api-docs/**",
                                        "/swagger-resources/**",
                                        "/webjars/**",
                                        "/api/recruit-service/health/**",
                                        "/api/recruit-service/cvs/*/status-embedding",
                                        "/api/recruit-service/jobs/*/status-embedding"
                                ).permitAll()
                                .anyRequest().authenticated()
                )
                .addFilterBefore(new HeaderAuthFilter(), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}

