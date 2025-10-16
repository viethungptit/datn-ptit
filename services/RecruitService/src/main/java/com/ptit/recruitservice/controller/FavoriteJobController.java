package com.ptit.recruitservice.controller;

import com.ptit.recruitservice.dto.FavoriteJobRequest;
import com.ptit.recruitservice.dto.FavoriteJobResponse;
import com.ptit.recruitservice.service.FavoriteJobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/recruit-service/favorite")
public class FavoriteJobController {
    @Autowired
    private FavoriteJobService favoriteJobService;

    @PreAuthorize("hasRole('CANDIDATE')")
    @PostMapping
    public ResponseEntity<FavoriteJobResponse> addFavorite(@RequestBody FavoriteJobRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        FavoriteJobResponse response = favoriteJobService.addFavorite(request, UUID.fromString(currentUserId));
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('CANDIDATE')")
    @DeleteMapping("/{favoriteId}")
    public ResponseEntity<?> removeFavorite(@PathVariable UUID favoriteId) {
        favoriteJobService.removeFavorite(favoriteId);
        return ResponseEntity.ok().body(java.util.Collections.singletonMap("message", "Xóa khỏi danh sách yêu thích thành công"));
    }

    @PreAuthorize("hasRole('CANDIDATE')")
    @GetMapping
    public ResponseEntity<List<FavoriteJobResponse>> getFavorites() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        List<FavoriteJobResponse> favorites = favoriteJobService.getFavoritesByUser(UUID.fromString(currentUserId));
        return ResponseEntity.ok(favorites);
    }
}

