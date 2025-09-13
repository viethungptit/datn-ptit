package com.ptit.adminservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ptit.adminservice.dto.CreateAdminLogRequest;
import com.ptit.adminservice.dto.UserResponse;
import com.ptit.adminservice.feign.UserServiceFeign;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Service
public class LogEventListener {

    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private AdminLogService adminLogService;
    @Autowired
    private UserServiceFeign externalUserServiceFeignClient;

    public UserResponse getUserByEmail(String email) {
        return externalUserServiceFeignClient.getUserByEmail(email);
    }

    @RabbitListener(queues = "${log.admin.queue}")
    public void receiveLogEvent(String message) {
        try {
            JsonNode event = objectMapper.readTree(message);
            String email = event.get("email").asText();
            String action = event.get("action").asText();
            String detail = event.get("detail").asText();

            UserResponse user = null;
            try {
                user = getUserByEmail(email);
            } catch (Exception ex) {
                ex.printStackTrace();
            }

            CreateAdminLogRequest create = new CreateAdminLogRequest();
            create.setUserId(user != null ? user.getUserId() : null);
            create.setAction(action);
            create.setDetails(detail);
            adminLogService.createAdminLog(create);


        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}

