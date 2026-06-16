package com.taskflow.controller;

import com.taskflow.dto.request.ChangePasswordRequest;
import com.taskflow.dto.request.ProfileUpdateRequest;
import com.taskflow.dto.response.UserResponse;
import com.taskflow.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@Tag(name = "Profil", description = "Gestion du profil de l'utilisateur connecté")
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    @Operation(summary = "Obtenir mon profil")
    public ResponseEntity<UserResponse> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(profileService.getProfile(userDetails.getUsername()));
    }

    @PutMapping
    @Operation(summary = "Mettre à jour mon profil")
    public ResponseEntity<UserResponse> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ProfileUpdateRequest request) {
        return ResponseEntity.ok(profileService.updateProfile(userDetails.getUsername(), request));
    }

    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Uploader mon avatar")
    public ResponseEntity<UserResponse> uploadAvatar(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(profileService.uploadAvatar(userDetails.getUsername(), file));
    }

    @PatchMapping("/password")
    @Operation(summary = "Changer mon mot de passe")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest request) {
        profileService.changePassword(userDetails.getUsername(), request);
        return ResponseEntity.noContent().build();
    }
}
