
package com.ptit.recruitservice.exception;

import com.ptit.recruitservice.dto.ApiError;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;

import jakarta.validation.ConstraintViolationException;
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

    // 400 Bad Request
    @ExceptionHandler({
            IllegalArgumentException.class,
            MethodArgumentNotValidException.class,
            ConstraintViolationException.class,
            HttpMessageNotReadableException.class
    })
    public ResponseEntity<ApiError> handleBadRequest(Exception ex, WebRequest request) {
        return buildError(HttpStatus.BAD_REQUEST, "Bad Request", ex.getMessage(), request);
    }

    // 401 Unauthorized
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiError> handleUnauthorized(AuthenticationException ex, WebRequest request) {
        return buildError(HttpStatus.UNAUTHORIZED, "Unauthorized", ex.getMessage(), request);
    }

    // 403 Forbidden
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> handleForbidden(AccessDeniedException ex, WebRequest request) {
        return buildError(HttpStatus.FORBIDDEN, "Forbidden", ex.getMessage(), request);
    }

    // 404 Not Found
    @ExceptionHandler({ResourceNotFoundException.class, NoHandlerFoundException.class})
    public ResponseEntity<ApiError> handleNotFound(Exception ex, WebRequest request) {
        return buildError(HttpStatus.NOT_FOUND, "Not Found", ex.getMessage(), request);
    }

    // 405 Method Not Allowed
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiError> handleMethodNotAllowed(HttpRequestMethodNotSupportedException ex, WebRequest request) {
        return buildError(HttpStatus.METHOD_NOT_ALLOWED, "Method Not Allowed", ex.getMessage(), request);
    }

    // 409 Conflict
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> handleConflict(DataIntegrityViolationException ex, WebRequest request) {
        return buildError(HttpStatus.CONFLICT, "Conflict", ex.getMessage(), request);
    }

    // 422 Unprocessable Entity
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiError> handleUnprocessable(BusinessException ex, WebRequest request) {
        return buildError(HttpStatus.UNPROCESSABLE_ENTITY, "Unprocessable Entity", ex.getMessage(), request);
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
