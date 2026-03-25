package com.frerememoire.webshop.domain.model.user;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {

    private static final int MAX_FAILED_LOGIN_ATTEMPTS = 5;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private Role role;

    @Column(length = 20)
    private String phone;

    @Column(name = "is_locked", nullable = false)
    private boolean locked;

    @Column(name = "failed_login_count", nullable = false)
    private int failedLoginCount;

    protected User() {
        // JPA 用デフォルトコンストラクタ
    }

    public User(String name, String email,
                String passwordHash, Role role) {
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.locked = false;
        this.failedLoginCount = 0;
    }

    public void incrementFailedLoginCount() {
        this.failedLoginCount++;
        if (this.failedLoginCount >= MAX_FAILED_LOGIN_ATTEMPTS) {
            this.locked = true;
        }
    }

    public void resetFailedLoginCount() {
        this.failedLoginCount = 0;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
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

    public String getPhone() {
        return phone;
    }

    public boolean isLocked() {
        return locked;
    }

    public int getFailedLoginCount() {
        return failedLoginCount;
    }
}
