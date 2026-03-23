package com.frerememoire.webshop.infrastructure.persistence;

import com.frerememoire.webshop.domain.auth.AuthUser;
import com.frerememoire.webshop.domain.auth.Role;
import com.frerememoire.webshop.domain.auth.UserProfile;
import com.frerememoire.webshop.domain.customer.Customer;
import com.frerememoire.webshop.domain.customer.port.CustomerQueryPort;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Import(JpaCustomerQueryAdapter.class)
class JpaCustomerQueryAdapterTest {

    @Autowired
    private CustomerQueryPort customerQueryPort;

    @Autowired
    private SpringDataCustomerRepository springDataCustomerRepository;

    @Autowired
    private SpringDataUserRepository springDataUserRepository;

    @BeforeEach
    void setUp() {
        springDataCustomerRepository.deleteAll();
        springDataUserRepository.deleteAll();

        AuthUser user1 = AuthUser.create("user1@example.com", "pass",
                Role.CUSTOMER, new UserProfile("太郎", "山田", "090-1111-1111"));
        Long userId1 = springDataUserRepository.save(UserEntity.fromDomain(user1)).getId();

        AuthUser user2 = AuthUser.create("user2@example.com", "pass",
                Role.CUSTOMER, new UserProfile("花子", "山田", "090-2222-2222"));
        Long userId2 = springDataUserRepository.save(UserEntity.fromDomain(user2)).getId();

        AuthUser user3 = AuthUser.create("user3@example.com", "pass",
                Role.CUSTOMER, new UserProfile("一郎", "鈴木", "090-3333-3333"));
        Long userId3 = springDataUserRepository.save(UserEntity.fromDomain(user3)).getId();

        Customer customer1 = Customer.create(userId1, "山田太郎", "090-1111-1111");
        springDataCustomerRepository.save(CustomerEntity.fromDomain(customer1));

        Customer customer2 = Customer.create(userId2, "山田花子", "090-2222-2222");
        springDataCustomerRepository.save(CustomerEntity.fromDomain(customer2));

        Customer customer3 = Customer.create(userId3, "鈴木一郎", "090-3333-3333");
        springDataCustomerRepository.save(CustomerEntity.fromDomain(customer3));
    }

    @Test
    void 全顧客を取得できる() {
        List<Customer> customers = customerQueryPort.findAll();

        assertThat(customers).hasSize(3);
    }

    @Test
    void 名前で部分一致検索できる() {
        List<Customer> customers = customerQueryPort.searchByName("山田");

        assertThat(customers).hasSize(2);
        assertThat(customers).allMatch(c -> c.getName().contains("山田"));
    }

    @Test
    void 該当なしの名前検索では空リストを返す() {
        List<Customer> customers = customerQueryPort.searchByName("佐藤");

        assertThat(customers).isEmpty();
    }
}
