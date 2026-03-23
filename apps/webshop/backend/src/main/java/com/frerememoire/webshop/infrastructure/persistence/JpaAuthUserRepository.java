package com.frerememoire.webshop.infrastructure.persistence;

import com.frerememoire.webshop.domain.auth.AuthUser;
import com.frerememoire.webshop.domain.auth.port.AuthUserRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class JpaAuthUserRepository implements AuthUserRepository {

    private final SpringDataUserRepository springDataRepository;

    public JpaAuthUserRepository(SpringDataUserRepository springDataRepository) {
        this.springDataRepository = springDataRepository;
    }

    @Override
    public Optional<AuthUser> findByEmail(String email) {
        return springDataRepository.findByEmail(email)
                .map(UserEntity::toDomain);
    }

    @Override
    public Optional<AuthUser> findById(Long id) {
        return springDataRepository.findById(id)
                .map(UserEntity::toDomain);
    }

    @Override
    public AuthUser save(AuthUser user) {
        UserEntity entity = UserEntity.fromDomain(user);
        UserEntity saved = springDataRepository.save(entity);
        return saved.toDomain();
    }

    @Override
    public boolean existsByEmail(String email) {
        return springDataRepository.existsByEmail(email);
    }
}
