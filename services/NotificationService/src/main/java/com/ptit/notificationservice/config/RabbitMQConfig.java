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

    @Value("${notification.user.queue}")
    private String userQueue;

    @Value("${notification.user.register.routing-key}")
    private String userRegisterRoutingKey;

    @Value("${notification.user.reset-password.routing-key}")
    private String userResetPasswordRoutingKey;

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
    public Binding userResetPasswordBinding() {
        return BindingBuilder.bind(userQueue())
                .to(notificationExchange())
                .with(userResetPasswordRoutingKey);
    }
}
