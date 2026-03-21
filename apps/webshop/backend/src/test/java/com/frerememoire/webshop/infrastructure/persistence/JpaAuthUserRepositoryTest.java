package com.frerememoire.webshop.infrastructure.persistence;

import com.frerememoire.webshop.domain.auth.AuthUser;
import com.frerememoire.webshop.domain.auth.Role;
import com.frerememoire.webshop.domain.auth.UserProfile;
import com.frerememoire.webshop.domain.auth.port.AuthUserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Import(JpaAuthUserRepository.class)
class JpaAuthUserRepositoryTest {

    @Autowired
    private AuthUserRepository repository;

    @Test
    void ユーザーを保存して取得できる() {
        UserProfile profile = new UserProfile("山田", "太郎", "090-1234-5678");
        AuthUser user = AuthUser.create("test@example.com", "encoded_pass",
                Role.CUSTOMER, profile);

        AuthUser saved = repository.save(user);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getEmail()).isEqualTo("test@example.com");
        assertThat(saved.getProfile().getFirstName()).isEqualTo("山田");
    }

    @Test
    void メールアドレスでユーザーを検索できる() {
        UserProfile profile = new UserProfile("山田", "太郎", null);
        AuthUser user = AuthUser.create("find@example.com", "encoded_pass",
                Role.CUSTOMER, profile);
        repository.save(user);

        Optional<AuthUser> found = repository.findByEmail("find@example.com");

        assertThat(found).isPresent();
        assertThat(found.get().getEmail()).isEqualTo("find@example.com");
    }

    @Test
    void 存在しないメールアドレスは空を返す() {
        Optional<AuthUser> found = repository.findByEmail("notfound@example.com");

        assertThat(found).isEmpty();
    }

    @Test
    void メールアドレスの存在確認ができる() {
        UserProfile profile = new UserProfile("山田", "太郎", null);
        AuthUser user = AuthUser.create("exists@example.com", "encoded_pass",
                Role.CUSTOMER, profile);
        repository.save(user);

        assertThat(repository.existsByEmail("exists@example.com")).isTrue();
        assertThat(repository.existsByEmail("notexists@example.com")).isFalse();
    }

    @Test
    void ユーザー情報を更新できる() {
        UserProfile profile = new UserProfile("山田", "太郎", null);
        AuthUser user = AuthUser.create("update@example.com", "encoded_pass",
                Role.CUSTOMER, profile);
        AuthUser saved = repository.save(user);

        AuthUser toUpdate = repository.findByEmail("update@example.com").get();
        toUpdate.resetFailedLoginCount();
        repository.save(toUpdate);

        AuthUser updated = repository.findByEmail("update@example.com").get();
        assertThat(updated.getFailedLoginCount()).isEqualTo(0);
    }
}
