package com.taskflow.controller;

import com.taskflow.dto.request.ChangePasswordRequest;
import com.taskflow.dto.request.UserCreateRequest;
import com.taskflow.dto.request.UserUpdateRequest;
import com.taskflow.dto.response.DashboardStatsResponse;
import com.taskflow.dto.response.PageResponse;
import com.taskflow.dto.response.UserResponse;
import com.taskflow.entity.Role;
import com.taskflow.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Gestion des Utilisateurs", description = "CRUD complet — réservé aux ADMIN")
public class UserController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "Liste paginée avec recherche et filtres")
    public ResponseEntity<PageResponse<UserResponse>> findAll(
            @RequestParam(defaultValue = "0")    int page,
            @RequestParam(defaultValue = "10")   int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false)      String search,
            @RequestParam(required = false)      Role role,
            @RequestParam(required = false)      Boolean enabled) {
        return ResponseEntity.ok(userService.findAll(page, size, sort, direction, search, role, enabled));
    }

    @GetMapping("/stats")
    @Operation(summary = "Statistiques du tableau de bord")
    public ResponseEntity<DashboardStatsResponse> getStats() {
        return ResponseEntity.ok(userService.getStats());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Détail d'un utilisateur")
    public ResponseEntity<UserResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Créer un utilisateur")
    public ResponseEntity<UserResponse> create(@Valid @RequestBody UserCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifier un utilisateur")
    public ResponseEntity<UserResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(userService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un utilisateur")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-status")
    @Operation(summary = "Activer / désactiver un utilisateur")
    public ResponseEntity<UserResponse> toggleStatus(@PathVariable Long id) {
        return ResponseEntity.ok(userService.toggleStatus(id));
    }

    @PatchMapping("/{id}/role")
    @Operation(summary = "Changer le rôle d'un utilisateur")
    public ResponseEntity<UserResponse> updateRole(
            @PathVariable Long id,
            @RequestParam Role role) {
        return ResponseEntity.ok(userService.updateRole(id, role));
    }

    @PostMapping(value = "/{id}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Uploader l'avatar d'un utilisateur")
    public ResponseEntity<UserResponse> uploadAvatar(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(userService.uploadProfileImage(id, file));
    }

    @PatchMapping("/{id}/password")
    @Operation(summary = "Changer le mot de passe d'un utilisateur")
    public ResponseEntity<Void> changePassword(
            @PathVariable Long id,
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(id, request);
        return ResponseEntity.noContent().build();
    }
}
