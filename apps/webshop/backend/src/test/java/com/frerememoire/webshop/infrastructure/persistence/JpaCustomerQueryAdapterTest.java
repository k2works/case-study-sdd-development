package com.frerememoire.webshop.infrastructure.persistence;

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

    @BeforeEach
    void setUp() {
        springDataCustomerRepository.deleteAll();

        Customer customer1 = Customer.create(1L, "山田太郎", "090-1111-1111");
        springDataCustomerRepository.save(CustomerEntity.fromDomain(customer1));

        Customer customer2 = Customer.create(2L, "山田花子", "090-2222-2222");
        springDataCustomerRepository.save(CustomerEntity.fromDomain(customer2));

        Customer customer3 = Customer.create(3L, "鈴木一郎", "090-3333-3333");
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
