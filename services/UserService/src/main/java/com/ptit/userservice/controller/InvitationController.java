package com.ptit.userservice.controller;

import com.ptit.userservice.dto.InviteEmployerRequest;
import com.ptit.userservice.dto.InvitationVerifyResponse;
import com.ptit.userservice.service.InvitationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/user-service/invitations")
@RequiredArgsConstructor
public class InvitationController {

    private final InvitationService invitationService;

    @PreAuthorize("hasRole('EMPLOYER')")
    @PostMapping
    public void invite(@RequestBody InviteEmployerRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String inviterId = (String) auth.getPrincipal();
        invitationService.inviteEmployer(request, inviterId);
    }

    @GetMapping("/verify")
    public InvitationVerifyResponse verify(@RequestParam String token) {
        return invitationService.verifyToken(token);
    }

    @PreAuthorize("hasRole('EMPLOYER')")
    @PostMapping("/accept")
    public void accept(@RequestBody Map<String, String> body) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String token = body.get("token");
        invitationService.acceptInvite(token, UUID.fromString((String) auth.getPrincipal()));
    }
}
