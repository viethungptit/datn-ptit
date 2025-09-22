package com.ptit.datn.exception;
import com.ptit.datn.dto.ApiError;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import java.net.SocketTimeoutException;
import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private ResponseEntity<ApiError> buildError(HttpStatus status, String error, String message, WebRequest request) {
        ApiError apiError = new ApiError(
                status.value(),
                error,
                message,
                request.getDescription(false),
                LocalDateTime.now()
        );
        return new ResponseEntity<>(apiError, status);
    }

    // 401 Unauthorized
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiError> handleUnauthorized(UnauthorizedException ex, WebRequest request) {
        return buildError(HttpStatus.UNAUTHORIZED, "Unauthorized", ex.getMessage(), request);
    }

    // 500 Internal Server Error
    @ExceptionHandler({Exception.class, RuntimeException.class})
    public ResponseEntity<ApiError> handleInternal(Exception ex, WebRequest request) {
        return buildError(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error", ex.getMessage(), request);
    }

    // 502 Bad Gateway
    @ExceptionHandler(HttpServerErrorException.class)
    public ResponseEntity<ApiError> handleBadGateway(HttpServerErrorException ex, WebRequest request) {
        return buildError(HttpStatus.BAD_GATEWAY, "Bad Gateway", ex.getMessage(), request);
    }

    // 503 Service Unavailable
    @ExceptionHandler(ResourceAccessException.class)
    public ResponseEntity<ApiError> handleServiceUnavailable(ResourceAccessException ex, WebRequest request) {
        return buildError(HttpStatus.SERVICE_UNAVAILABLE, "Service Unavailable", ex.getMessage(), request);
    }

    // 504 Gateway Timeout
    @ExceptionHandler(SocketTimeoutException.class)
    public ResponseEntity<ApiError> handleGatewayTimeout(SocketTimeoutException ex, WebRequest request) {
        return buildError(HttpStatus.GATEWAY_TIMEOUT, "Gateway Timeout", ex.getMessage(), request);
    }
}
