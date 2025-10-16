package com.ptit.userservice.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.parameters.Parameter;
import io.swagger.v3.oas.models.media.StringSchema;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.customizers.OperationCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.List;

@Configuration
public class SwaggerConfig {
    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";
        return new OpenAPI()
                .info(new Info()
                        .title("User Service API")
                        .version("1.0")
                        .description("API documentation for User Service"))
                .servers(List.of(new Server().url("/")))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")));
    }

    @Bean
    public OperationCustomizer customizeGlobalHeaders() {
        return (operation, handlerMethod) -> {
            String path = operation.getTags() != null && !operation.getTags().isEmpty() ? operation.getTags().getFirst() : "";
            if (path.toLowerCase().contains("auth")) {
                return operation; // Skip route with /auth in path
            }
            operation.addParametersItem(new Parameter()
                    .in("header")
                    .name("X-User-Id")
                    .description("User ID (UUID from Gateway)")
                    .required(false)
                    .schema(new StringSchema()));

            operation.addParametersItem(new Parameter()
                    .in("header")
                    .name("X-User-Role")
                    .description("User Role (mock from Gateway)")
                    .required(false)
                    .schema(new StringSchema()));
            return operation;
        };
    }
}
