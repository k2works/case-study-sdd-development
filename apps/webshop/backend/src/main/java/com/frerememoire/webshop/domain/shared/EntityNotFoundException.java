package com.frerememoire.webshop.domain.shared;

public class EntityNotFoundException extends DomainException {

    public EntityNotFoundException(String entityName, Object id) {
        super("%s(id=%s) が見つかりません".formatted(entityName, id));
    }
}
