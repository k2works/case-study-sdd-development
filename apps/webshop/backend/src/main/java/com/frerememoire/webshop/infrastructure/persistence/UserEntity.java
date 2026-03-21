package com.frerememoire.webshop.infrastructure.persistence;

import com.frerememoire.webshop.domain.auth.AuthUser;
import com.frerememoire.webshop.domain.auth.Role;
import com.frerememoire.webshop.domain.auth.UserProfile;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(length = 20)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(name = "failed_login_count", nullable = false)
    private int failedLoginCount;

    @Column(name = "locked_until")
    private LocalDateTime lockedUntil;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected UserEntity() {
    }

    public static UserEntity fromDomain(AuthUser user) {
        UserEntity entity = new UserEntity();
        entity.id = user.getId();
        entity.email = user.getEmail();
        entity.passwordHash = user.getPasswordHash();
        entity.firstName = user.getProfile().getFirstName();
        entity.lastName = user.getProfile().getLastName();
        entity.phone = user.getProfile().getPhone();
        entity.role = user.getRole();
        entity.failedLoginCount = user.getFailedLoginCount();
        entity.lockedUntil = user.getLockedUntil();
        entity.createdAt = user.getCreatedAt();
        entity.updatedAt = user.getUpdatedAt();
        return entity;
    }

    public AuthUser toDomain() {
        UserProfile profile = new UserProfile(firstName, lastName, phone);
        return new AuthUser(id, email, passwordHash, role, profile,
                failedLoginCount, lockedUntil, createdAt, updatedAt);
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }
}
