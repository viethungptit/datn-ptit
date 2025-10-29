package com.ptit.adminservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ptit.adminservice.dto.CreateActivityLogRequest;
import com.ptit.adminservice.dto.UserResponse;
import com.ptit.adminservice.feign.UserServiceFeign;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
public class LogEventListener {

    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private ActivityLogService activityLogService;

//    @Autowired
//    private UserServiceFeign externalUserServiceFeignClient;
//    @Value("${internal.secret}")
//    private String internalSecret;
//
//    public UserResponse getUserByEmail(String email) {
//        return externalUserServiceFeignClient.getUserByEmail(email, internalSecret);
//    }

    @RabbitListener(queues = "${log.activity.queue}")
    public void receiveActivityEvent(String message) {
        try {
            JsonNode event = objectMapper.readTree(message);
            Map<String, Object> data = objectMapper.convertValue(event, Map.class);

            CreateActivityLogRequest logRequest = new CreateActivityLogRequest();
            logRequest.setActorId(getUuid(data.get("actorId")));
            logRequest.setActorRole((String) data.get("actorRole"));
            logRequest.setAction((String) data.get("action"));
            logRequest.setTargetType((String) data.get("targetType"));
            logRequest.setTargetId(getUuid(data.get("targetId")));
            logRequest.setDescription((String) data.get("description"));

            activityLogService.createLog(logRequest);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private UUID getUuid(Object value) {
        return value != null ? UUID.fromString(value.toString()) : null;
    }

}

