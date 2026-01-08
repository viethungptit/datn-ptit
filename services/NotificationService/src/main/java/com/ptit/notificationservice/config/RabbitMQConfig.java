package com.ptit.notificationservice.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    @Value("${notification.exchange}")
    private String notificationExchange;

    @Value("${notification.queue}")
    private String userQueue;

    @Value("${notification.user.register.routing-key}")
    private String userRegisterRoutingKey;

    @Value("${notification.user.reset-password.routing-key}")
    private String userResetPasswordRoutingKey;

    @Value("${notification.application.status.routing-key}")
    private String applicationStatusRoutingKey;

    @Value("${notification.application.created.routing-key}")
    private String applicationCreatedRoutingKey;

    @Value("${notification.invite.routing-key}")
    private String inviteRoutingKey;

    @Value("${notification.cv.upload.routing-key}")
    private String cvUploadRoutingKey;

    @Value("${alert.exchange}")
    private String alertExchange;

    @Value("${alert.queue}")
    private String alertQueue;

    @Value("${alert.system.routing-key}")
    private String systemAlertRoutingKey;

    @Bean
    public TopicExchange notificationExchange() {
        return new TopicExchange(notificationExchange);
    }

    @Bean
    public Queue userQueue() {
        return new Queue(userQueue, true);
    }

    @Bean
    public Binding userRegisterBinding() {
        return BindingBuilder.bind(userQueue())
                .to(notificationExchange())
                .with(userRegisterRoutingKey);
    }

    @Bean
    public Binding userInviteBinding() {
        return BindingBuilder.bind(userQueue())
                .to(notificationExchange())
                .with(inviteRoutingKey);
    }

    @Bean
    public Binding userResetPasswordBinding() {
        return BindingBuilder.bind(userQueue())
                .to(notificationExchange())
                .with(userResetPasswordRoutingKey);
    }

    @Bean
    public Binding applicationStatusBinding() {
        return BindingBuilder.bind(userQueue())
                .to(notificationExchange())
                .with(applicationStatusRoutingKey);
    }

    @Bean
    public Binding applicationCreatedBinding() {
        return BindingBuilder.bind(userQueue())
                .to(notificationExchange())
                .with(applicationCreatedRoutingKey);
    }

    @Bean
    public Binding cvUploadBinding() {
        return BindingBuilder.bind(userQueue())
                .to(notificationExchange())
                .with(cvUploadRoutingKey);
    }

    @Bean
    public TopicExchange alertExchange() {
        return new TopicExchange(alertExchange);
    }

    @Bean
    public Queue alertQueue() {
        return new Queue(alertQueue, true);
    }

    @Bean
    public Binding systemAlertBinding() {
        return BindingBuilder.bind(alertQueue())
                .to(alertExchange())
                .with(systemAlertRoutingKey);
    }
}
