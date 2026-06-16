package com.taskflow.service;

import com.taskflow.dto.request.ChangePasswordRequest;
import com.taskflow.dto.request.UserCreateRequest;
import com.taskflow.dto.request.UserUpdateRequest;
import com.taskflow.dto.response.DashboardStatsResponse;
import com.taskflow.dto.response.PageResponse;
import com.taskflow.dto.response.UserResponse;
import com.taskflow.entity.Role;
import com.taskflow.entity.User;
import com.taskflow.exception.BadRequestException;
import com.taskflow.exception.EmailAlreadyExistsException;
import com.taskflow.exception.ResourceNotFoundException;
import com.taskflow.mapper.UserMapper;
import com.taskflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final FileStorageService fileStorageService;

    @Transactional(readOnly = true)
    public PageResponse<UserResponse> findAll(int page, int size, String sort, String direction,
                                               String search, Role role, Boolean enabled) {
        Sort.Direction sortDir = "desc".equalsIgnoreCase(direction)
                ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDir, sort));

        Page<User> userPage = userRepository.searchUsers(
                (search != null && !search.isBlank()) ? search : null,
                role, enabled, pageable);

        return PageResponse.of(userPage.map(userMapper::toResponse));
    }

    @Transactional(readOnly = true)
    public UserResponse findById(Long id) {
        return userMapper.toResponse(getUser(id));
    }

    @Transactional
    public UserResponse create(UserCreateRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyExistsException(request.email());
        }
        User user = User.builder()
                .firstName(request.firstName())
                .lastName(request.lastName())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .phone(request.phone())
                .role(request.role())
                .enabled(request.enabled())
                .build();
        return userMapper.toResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse update(Long id, UserUpdateRequest request) {
        User user = getUser(id);

        if (!user.getEmail().equals(request.email())
                && userRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyExistsException(request.email());
        }

        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setEmail(request.email());
        user.setPhone(request.phone());
        user.setRole(request.role());
        user.setEnabled(request.enabled());

        return userMapper.toResponse(userRepository.save(user));
    }

    @Transactional
    public void delete(Long id) {
        User user = getUser(id);
        if (user.getProfileImage() != null) {
            fileStorageService.deleteFile(user.getProfileImage());
        }
        userRepository.delete(user);
    }

    @Transactional
    public UserResponse toggleStatus(Long id) {
        User user = getUser(id);
        user.setEnabled(!user.isEnabled());
        return userMapper.toResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse updateRole(Long id, Role role) {
        User user = getUser(id);
        user.setRole(role);
        return userMapper.toResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse uploadProfileImage(Long id, MultipartFile file) {
        User user = getUser(id);
        if (user.getProfileImage() != null) {
            fileStorageService.deleteFile(user.getProfileImage());
        }
        String filename = fileStorageService.storeFile(file);
        user.setProfileImage(filename);
        return userMapper.toResponse(userRepository.save(user));
    }

    @Transactional
    public void changePassword(Long id, ChangePasswordRequest request) {
        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new BadRequestException("Les mots de passe ne correspondent pas");
        }
        User user = getUser(id);
        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new BadRequestException("Mot de passe actuel incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public DashboardStatsResponse getStats() {
        long total    = userRepository.count();
        long active   = userRepository.countByEnabled(true);
        long inactive = userRepository.countByEnabled(false);
        long admins   = userRepository.countByRole(Role.ADMIN);
        long pms      = userRepository.countByRole(Role.PROJECT_MANAGER);
        long members  = userRepository.countByRole(Role.MEMBER);
        return new DashboardStatsResponse(total, active, inactive, admins, pms, members);
    }

    private User getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", id));
    }
}
