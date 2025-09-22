package com.ptit.recruitservice.controller;

import com.ptit.recruitservice.dto.FavoriteJobRequest;
import com.ptit.recruitservice.dto.FavoriteJobResponse;
import com.ptit.recruitservice.service.FavoriteJobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/favorite")
public class FavoriteJobController {
    @Autowired
    private FavoriteJobService favoriteJobService;

    @PostMapping
    public ResponseEntity<FavoriteJobResponse> addFavorite(@RequestBody FavoriteJobRequest request, @RequestParam("userId") UUID userId) {
        FavoriteJobResponse response = favoriteJobService.addFavorite(request, userId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{favoriteId}")
    public ResponseEntity<?> removeFavorite(@PathVariable UUID favoriteId) {
        favoriteJobService.removeFavorite(favoriteId);
        return ResponseEntity.ok().body(java.util.Collections.singletonMap("message", "Xóa khỏi danh sách yêu thích thành công"));
    }

    @GetMapping
    public ResponseEntity<List<FavoriteJobResponse>> getFavorites(@RequestParam("user_id") UUID userId) {
        List<FavoriteJobResponse> favorites = favoriteJobService.getFavoritesByUser(userId);
        return ResponseEntity.ok(favorites);
    }
}

