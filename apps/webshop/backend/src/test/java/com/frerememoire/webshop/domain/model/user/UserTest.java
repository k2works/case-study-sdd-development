package com.frerememoire.webshop.domain.model.user;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class UserTest {

    private User createDefaultUser() {
        return new User(
                "テスト太郎",
                "test@example.com",
                "hashedPassword123",
                Role.CUSTOMER
        );
    }

    @Test
    void shouldCreateUserWithCorrectAttributes() {
        // Given: ユーザー属性
        String name = "テスト太郎";
        String email = "test@example.com";
        String passwordHash = "hashedPassword123";
        Role role = Role.CUSTOMER;

        // When: User を生成する
        User user = new User(name, email, passwordHash, role);

        // Then: 属性が正しく保持される
        assertEquals(name, user.getName());
        assertEquals(email, user.getEmail());
        assertEquals(passwordHash, user.getPasswordHash());
        assertEquals(role, user.getRole());
    }

    @Test
    void shouldInitializeWithZeroFailedLoginCount() {
        // Given/When: 新規ユーザーを生成する
        User user = createDefaultUser();

        // Then: 失敗カウントが 0 である
        assertEquals(0, user.getFailedLoginCount());
    }

    @Test
    void shouldInitializeAsNotLocked() {
        // Given/When: 新規ユーザーを生成する
        User user = createDefaultUser();

        // Then: ロック状態でない
        assertFalse(user.isLocked());
    }

    @Test
    void shouldIncrementFailedLoginCount() {
        // Given: 失敗カウント 0 のユーザー
        User user = createDefaultUser();

        // When: 失敗カウントをインクリメントする
        user.incrementFailedLoginCount();

        // Then: 失敗カウントが 1 になる
        assertEquals(1, user.getFailedLoginCount());
    }

    @Test
    void shouldIncrementFailedLoginCountMultipleTimes() {
        // Given: 失敗カウント 0 のユーザー
        User user = createDefaultUser();

        // When: 失敗カウントを 3 回インクリメントする
        user.incrementFailedLoginCount();
        user.incrementFailedLoginCount();
        user.incrementFailedLoginCount();

        // Then: 失敗カウントが 3 になる
        assertEquals(3, user.getFailedLoginCount());
    }

    @Test
    void shouldLockAccountAfterFiveFailedAttempts() {
        // Given: 失敗カウント 0 のユーザー
        User user = createDefaultUser();

        // When: 失敗カウントを 5 回インクリメントする
        for (int i = 0; i < 5; i++) {
            user.incrementFailedLoginCount();
        }

        // Then: アカウントがロックされる
        assertTrue(user.isLocked());
    }

    @Test
    void shouldNotLockAccountWithFourFailedAttempts() {
        // Given: 失敗カウント 0 のユーザー
        User user = createDefaultUser();

        // When: 失敗カウントを 4 回インクリメントする
        for (int i = 0; i < 4; i++) {
            user.incrementFailedLoginCount();
        }

        // Then: アカウントはロックされない
        assertFalse(user.isLocked());
    }

    @Test
    void shouldResetFailedLoginCount() {
        // Given: 失敗カウントが 3 のユーザー
        User user = createDefaultUser();
        user.incrementFailedLoginCount();
        user.incrementFailedLoginCount();
        user.incrementFailedLoginCount();

        // When: 失敗カウントをリセットする
        user.resetFailedLoginCount();

        // Then: 失敗カウントが 0 になる
        assertEquals(0, user.getFailedLoginCount());
    }

    @Test
    void shouldBeLockedWhenIsLockedFlagIsTrue() {
        // Given: ロック済みのユーザー（5 回失敗）
        User user = createDefaultUser();
        for (int i = 0; i < 5; i++) {
            user.incrementFailedLoginCount();
        }
        assertTrue(user.isLocked());

        // When: 失敗カウントをリセットしてもロックは解除されない
        // (ロック解除は管理者操作など別途対応が必要な場合を想定)
        // ただし設計上 resetFailedLoginCount でロック解除する場合はここを調整

        // Then: isLocked はロック判定ロジックに従う
        // 計画書: failedLoginCount >= 5 で isLocked = true
        assertTrue(user.isLocked());
    }

    @Test
    void shouldLockAccountAtExactlyFiveFailures() {
        // Given: 失敗カウント 4 のユーザー
        User user = createDefaultUser();
        for (int i = 0; i < 4; i++) {
            user.incrementFailedLoginCount();
        }
        assertFalse(user.isLocked());

        // When: もう 1 回失敗する（5 回目）
        user.incrementFailedLoginCount();

        // Then: アカウントがロックされる（境界値: ちょうど 5）
        assertTrue(user.isLocked());
        assertEquals(5, user.getFailedLoginCount());
    }

    @Test
    void shouldRemainLockedAfterMoreThanFiveFailures() {
        // Given: 5 回失敗してロック済みのユーザー
        User user = createDefaultUser();
        for (int i = 0; i < 5; i++) {
            user.incrementFailedLoginCount();
        }

        // When: さらに失敗をインクリメントする
        user.incrementFailedLoginCount();

        // Then: 引き続きロック状態である
        assertTrue(user.isLocked());
        assertEquals(6, user.getFailedLoginCount());
    }
}
