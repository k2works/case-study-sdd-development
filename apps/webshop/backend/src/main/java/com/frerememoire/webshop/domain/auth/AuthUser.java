package com.frerememoire.webshop.domain.auth;

import com.frerememoire.webshop.domain.shared.BusinessRuleViolationException;

import java.time.LocalDateTime;

public class AuthUser {

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int LOCK_DURATION_MINUTES = 30;

    private Long id;
    private final String email;
    private final String passwordHash;
    private final Role role;
    private final UserProfile profile;
    private int failedLoginCount;
    private LocalDateTime lockedUntil;
    private final LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public AuthUser(Long id, String email, String passwordHash, Role role,
                    UserProfile profile, int failedLoginCount,
                    LocalDateTime lockedUntil, LocalDateTime createdAt,
                    LocalDateTime updatedAt) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("メールアドレスは必須です");
        }
        if (passwordHash == null || passwordHash.isBlank()) {
            throw new IllegalArgumentException("パスワードは必須です");
        }
        if (role == null) {
            throw new IllegalArgumentException("ロールは必須です");
        }
        this.id = id;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.profile = profile;
        this.failedLoginCount = failedLoginCount;
        this.lockedUntil = lockedUntil;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static AuthUser create(String email, String encodedPassword,
                                   Role role, UserProfile profile) {
        LocalDateTime now = LocalDateTime.now();
        return new AuthUser(null, email, encodedPassword, role, profile,
                0, null, now, now);
    }

    public boolean authenticate(String rawPassword, PasswordEncoder encoder) {
        if (isLocked()) {
            throw new BusinessRuleViolationException(
                    "アカウントがロックされています。しばらくしてから再試行してください");
        }
        if (encoder.matches(rawPassword, this.passwordHash)) {
            resetFailedLoginCount();
            return true;
        }
        recordFailedAttempt();
        return false;
    }

    public boolean isLocked() {
        return lockedUntil != null && LocalDateTime.now().isBefore(lockedUntil);
    }

    public void resetFailedLoginCount() {
        this.failedLoginCount = 0;
        this.lockedUntil = null;
        this.updatedAt = LocalDateTime.now();
    }

    private void recordFailedAttempt() {
        this.failedLoginCount++;
        if (this.failedLoginCount >= MAX_FAILED_ATTEMPTS) {
            this.lockedUntil = LocalDateTime.now().plusMinutes(LOCK_DURATION_MINUTES);
        }
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public Role getRole() {
        return role;
    }

    public UserProfile getProfile() {
        return profile;
    }

    public int getFailedLoginCount() {
        return failedLoginCount;
    }

    public LocalDateTime getLockedUntil() {
        return lockedUntil;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
