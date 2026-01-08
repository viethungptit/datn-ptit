package com.ptit.userservice.service;

import com.ptit.userservice.config.EventPublisher;
import com.ptit.userservice.dto.EmployerUpdateRequest;
import com.ptit.userservice.dto.InviteEmployerRequest;
import com.ptit.userservice.dto.InvitationVerifyResponse;
import com.ptit.userservice.entity.Company;
import com.ptit.userservice.entity.Invitation;
import com.ptit.userservice.entity.User;
import com.ptit.userservice.entity.enums.EmployerStatus;
import com.ptit.userservice.exception.BusinessException;
import com.ptit.userservice.repository.CompanyRepository;
import com.ptit.userservice.repository.EmployerRepository;
import com.ptit.userservice.repository.InvitationRepository;
import com.ptit.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InvitationService {

    private final InvitationRepository invitationRepository;
    private final EmployerRepository employerRepository;
    private final UserRepository userRepository;
    private final EventPublisher eventPublisher;
    private final CompanyRepository companyRepository;
    private final UserProfileService userProfileService;
    @Value("${notification.exchange}")
    private String notificationExchange;

    @Value("${notification.invite.routing-key}")
    private String inviteRoutingKey;

    @Value("${frontend.invite-url}")
    private String inviteBaseUrl;

    // ===============================
    // 1️⃣ GỬI LỜI MỜI
    // ===============================

    @Transactional
    public void inviteEmployer(InviteEmployerRequest request, String inviterUserId) {

        // 1️⃣ Đã có invite pending chưa
        if (invitationRepository.existsByEmailAndCompanyIdAndStatus(
                request.getEmail(),
                request.getCompanyId(),
                Invitation.Status.PENDING)) {
            throw new BusinessException("Email này đã được mời trước đó");
        }

        // 2️⃣ Check company tồn tại
        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new BusinessException("Công ty không tồn tại"));

        // 3️⃣ Nếu user đã tồn tại → check role + company
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isPresent()) {
            User user = userOpt.get();


            if (user.getRole() == User.Role.admin) {
                throw new BusinessException("Tài khoản quản trị không thể được mời vào công ty");
            }


            if (user.getRole() == User.Role.candidate) {
                throw new BusinessException("Ứng viên không thể được mời làm nhân viên tuyển dụng");
            }


            if (employerRepository.existsById(user.getUserId())) {
                throw new BusinessException(
                        "Người dùng đó đã tồn tại trong công ty khác. " +
                                "Hãy nhắn người đó rời công ty đó trước khi mời"
                );
            }
        }

        // 4️⃣ Tạo invite
        String token = UUID.randomUUID().toString();

        Invitation invitation = Invitation.builder()
                .email(request.getEmail())
                .companyId(request.getCompanyId())
                .role("EMPLOYER")
                .token(token)
                .status(Invitation.Status.PENDING)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();

        invitationRepository.save(invitation);

        // 5️⃣ Send notification event
        Map<String, Object> data = new HashMap<>();
        data.put("email", request.getEmail());
        data.put("inviteLink", inviteBaseUrl + "?token=" + token);
        data.put("company_name", company.getCompanyName());
        data.put("role", "Nhân viên tuyển dụng");

        Map<String, Object> event = new HashMap<>();
        event.put("event_type", inviteRoutingKey);
        event.put("to", request.getEmail());
        event.put("data", data);

        eventPublisher.publish(notificationExchange, inviteRoutingKey, event);
    }


    // ===============================
    // 2️⃣ VERIFY INVITE TOKEN
    // ===============================
    public InvitationVerifyResponse verifyToken(String token) {

        Invitation invitation = invitationRepository.findByToken(token)
                .orElseThrow(() -> new BusinessException("Invite token không hợp lệ"));

        if (invitation.getStatus() != Invitation.Status.PENDING) {
            throw new BusinessException("Invite đã được sử dụng");
        }

        if (invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
            invitation.setStatus(Invitation.Status.EXPIRED);
            invitationRepository.save(invitation);
            throw new BusinessException("Invite đã hết hạn");
        }
        Optional<User> userOpt = userRepository.findByEmail(invitation.getEmail());
        boolean alreadyInCompany = false;
        boolean userExists = userRepository.findByEmail(invitation.getEmail()).isPresent();
        if (userExists) {
            UUID userId = userOpt.get().getUserId();

            // user đã thuộc 1 công ty nào đó chưa
            alreadyInCompany = employerRepository.existsById(userId);
            if (alreadyInCompany) {
                throw new BusinessException(
                        "Người dùng đó đã tồn tại trong công ty khác. " +
                                "Hãy nhắn người đó rời công ty đó trước khi mời"
                );
            }
        }
        return InvitationVerifyResponse.builder()
                .valid(true)
                .userExists(userExists)
                .email(invitation.getEmail())
                .companyId(invitation.getCompanyId())
                .role(invitation.getRole())
                .build();
    }

    // ===============================
    // 3️⃣ ACCEPT INVITE (USER ĐÃ LOGIN)
    // ===============================
    @Transactional
    public void acceptInvite(String token, UUID userId) {

        Invitation invitation = invitationRepository.findByToken(token)
                .orElseThrow(() -> new BusinessException("Invite token không hợp lệ"));

        if (invitation.getStatus() != Invitation.Status.PENDING) {
            throw new BusinessException("Invite đã được xử lý");
        }

        if (invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
            invitation.setStatus(Invitation.Status.EXPIRED);
            invitationRepository.save(invitation);
            throw new BusinessException("Invite đã hết hạn");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy user"));

        if (!user.getEmail().equals(invitation.getEmail())) {
            throw new BusinessException("Email đăng nhập không khớp email được mời");
        }
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {


            if (user.getRole() == User.Role.admin) {
                throw new BusinessException("Tài khoản quản trị không thể được mời vào công ty");
            }


            if (user.getRole() == User.Role.candidate) {
                throw new BusinessException("Ứng viên không thể được mời làm nhân viên tuyển dụng");
            }


            if (employerRepository.existsById(user.getUserId())) {
                throw new BusinessException(
                        "Người dùng đó đã tồn tại trong công ty khác. " +
                                "Hãy nhắn người đó rời công ty đó trước khi mời"
                );
            }
        }
        EmployerUpdateRequest employerRequest = new EmployerUpdateRequest();
        employerRequest.setCompanyId(invitation.getCompanyId());
        employerRequest.setStatus(EmployerStatus.VERIFIED);
        employerRequest.setAdmin(false);
        employerRequest.setPosition("Nhân viên tuyển dụng");

        userProfileService.upsertEmployerByUserId(userId, employerRequest);

        invitation.setStatus(Invitation.Status.ACCEPTED);
        invitation.setAcceptedAt(LocalDateTime.now());
        invitationRepository.save(invitation);
    }
}
