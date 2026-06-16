package com.taskflow.dto.request;

import com.taskflow.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Le prénom est obligatoire")
        @Size(min = 2, max = 100)
        String firstName,

        @NotBlank(message = "Le nom est obligatoire")
        @Size(min = 2, max = 100)
        String lastName,

        @NotBlank(message = "L'email est obligatoire")
        @Email(message = "Format email invalide")
        String email,

        @NotBlank(message = "Le mot de passe est obligatoire")
        @Size(min = 8, message = "Le mot de passe doit comporter au moins 8 caractères")
        String password,

        String phone,

        Role role
) {}
