package com.taskflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProfileUpdateRequest(
        @NotBlank(message = "Le prénom est obligatoire")
        @Size(min = 2, max = 100)
        String firstName,

        @NotBlank(message = "Le nom est obligatoire")
        @Size(min = 2, max = 100)
        String lastName,

        String phone
) {}
