package com.ptit.adminservice.dto;

import lombok.Data;
import java.util.List;

@Data
public class CreateRecipientsRequest {
    private List<String> emails;
}

