package com.frerememoire.webshop.application.auth;

import com.frerememoire.webshop.domain.auth.AuthUser;
import com.frerememoire.webshop.domain.auth.PasswordEncoder;
import com.frerememoire.webshop.domain.auth.PasswordPolicy;
import com.frerememoire.webshop.domain.auth.Role;
import com.frerememoire.webshop.domain.auth.UserProfile;
import com.frerememoire.webshop.domain.auth.port.AuthUserRepository;
import com.frerememoire.webshop.domain.customer.Customer;
import com.frerememoire.webshop.domain.customer.port.CustomerRepository;
import com.frerememoire.webshop.domain.shared.BusinessRuleViolationException;

public class RegistrationUseCase {

    private final AuthUserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    public RegistrationUseCase(AuthUserRepository userRepository,
                                CustomerRepository customerRepository,
                                PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthUser register(String email, String rawPassword,
                              String firstName, String lastName, String phone) {
        PasswordPolicy.validate(rawPassword);

        if (userRepository.existsByEmail(email)) {
            throw new BusinessRuleViolationException(
                    "このメールアドレスは既に登録されています");
        }

        UserProfile profile = new UserProfile(firstName, lastName, phone);
        String encodedPassword = passwordEncoder.encode(rawPassword);
        AuthUser user = AuthUser.create(email, encodedPassword, Role.CUSTOMER, profile);
        AuthUser savedUser = userRepository.save(user);
        Customer customer = Customer.create(savedUser.getId(), lastName + " " + firstName, phone);
        customerRepository.save(customer);
        return savedUser;
    }
}
