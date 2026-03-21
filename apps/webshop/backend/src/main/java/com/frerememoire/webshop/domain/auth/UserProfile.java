package com.frerememoire.webshop.domain.auth;

public class UserProfile {

    private final String firstName;
    private final String lastName;
    private final String phone;

    public UserProfile(String firstName, String lastName, String phone) {
        if (firstName == null || firstName.isBlank()) {
            throw new IllegalArgumentException("姓は必須です");
        }
        if (lastName == null || lastName.isBlank()) {
            throw new IllegalArgumentException("名は必須です");
        }
        if (firstName.length() > 100) {
            throw new IllegalArgumentException("姓は100文字以内で入力してください");
        }
        if (lastName.length() > 100) {
            throw new IllegalArgumentException("名は100文字以内で入力してください");
        }
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getPhone() {
        return phone;
    }
}
