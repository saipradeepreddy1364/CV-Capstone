package com.example.smartattendance.service;

import com.example.smartattendance.dto.AuthResponse;
import com.example.smartattendance.dto.LoginRequest;
import com.example.smartattendance.dto.RefreshTokenRequest;
import com.example.smartattendance.dto.UserDto;
import com.example.smartattendance.entity.Faculty;
import com.example.smartattendance.entity.Organization;
import com.example.smartattendance.entity.Student;
import com.example.smartattendance.entity.User;
import com.example.smartattendance.exception.ApiException;
import com.example.smartattendance.exception.UnauthorizedException;
import com.example.smartattendance.repository.FacultyRepository;
import com.example.smartattendance.repository.OrganizationRepository;
import com.example.smartattendance.repository.StudentRepository;
import com.example.smartattendance.repository.UserRepository;
import com.example.smartattendance.security.JwtUtils;
import com.example.smartattendance.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;
    private final JwtUtils jwtUtils;
    private final AuditService auditService;

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       OrganizationRepository organizationRepository,
                       FacultyRepository facultyRepository,
                       StudentRepository studentRepository,
                       JwtUtils jwtUtils,
                       AuditService auditService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.facultyRepository = facultyRepository;
        this.studentRepository = studentRepository;
        this.jwtUtils = jwtUtils;
        this.auditService = auditService;
    }

    public AuthResponse login(LoginRequest request, String ipAddress) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().trim().toLowerCase(), request.getPassword())
        );

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (!user.isActive()) {
            throw new ApiException("User account is inactive", HttpStatus.FORBIDDEN, "ACCOUNT_INACTIVE");
        }

        String accessToken = jwtUtils.generateAccessToken(
                user.getId(),
                user.getOrganizationId(),
                user.getEmail(),
                user.getRole().name()
        );
        String refreshToken = jwtUtils.generateRefreshToken(user.getId());

        UserDto userDto = buildUserDto(user);

        auditService.log(user.getOrganizationId(), user.getId(), "LOGIN", "User", user.getId().toString(), "User logged in", ipAddress);

        return new AuthResponse(accessToken, refreshToken, userDto);
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        if (!jwtUtils.validateToken(request.getRefreshToken())) {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }

        UUID userId = jwtUtils.getUserIdFromToken(request.getRefreshToken());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (!user.isActive()) {
            throw new ApiException("User account is inactive", HttpStatus.FORBIDDEN, "ACCOUNT_INACTIVE");
        }

        String accessToken = jwtUtils.generateAccessToken(
                user.getId(),
                user.getOrganizationId(),
                user.getEmail(),
                user.getRole().name()
        );
        String newRefreshToken = jwtUtils.generateRefreshToken(user.getId());

        return new AuthResponse(accessToken, newRefreshToken, buildUserDto(user));
    }

    public UserDto getCurrentUserDto() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal)) {
            throw new UnauthorizedException("User is not authenticated");
        }
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        return buildUserDto(user);
    }

    public UserPrincipal getCurrentPrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal)) {
            throw new UnauthorizedException("User is not authenticated");
        }
        return (UserPrincipal) auth.getPrincipal();
    }

    public UserDto buildUserDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setOrganizationId(user.getOrganizationId());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setFullName(user.getFullName());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole());

        if (user.getOrganizationId() != null) {
            organizationRepository.findById(user.getOrganizationId())
                    .ifPresent(org -> dto.setOrganizationName(org.getName()));
        }

        switch (user.getRole()) {
            case FACULTY -> {
                Optional<Faculty> facultyOpt = facultyRepository.findByUserId(user.getId());
                facultyOpt.ifPresent(faculty -> {
                    dto.setFacultyId(faculty.getId());
                    dto.setIdentificationNumber(faculty.getFacultyNumber());
                });
            }
            case STUDENT -> {
                Optional<Student> studentOpt = studentRepository.findByUserId(user.getId());
                studentOpt.ifPresent(student -> {
                    dto.setStudentId(student.getId());
                    dto.setIdentificationNumber(student.getStudentNumber());
                });
            }
            default -> {}
        }

        return dto;
    }
}
