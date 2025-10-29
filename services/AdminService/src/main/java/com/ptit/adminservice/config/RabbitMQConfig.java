package com.ptit.adminservice.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    @Value("${log.exchange}")
    private String exchangeName;

    @Value("${log.activity.queue}")
    private String queueName;

    @Value("${log.activity.routing-key}")
    private String routingKey;

    @Bean
    public TopicExchange logExchange() {
        return new TopicExchange(exchangeName);
    }

    @Bean
    public Queue activityQueue() {
        return new Queue(queueName, true);
    }

    @Bean
    public Binding adminBinding() {
        return BindingBuilder.bind(activityQueue())
                .to(logExchange())
                .with(routingKey);
    }
}
