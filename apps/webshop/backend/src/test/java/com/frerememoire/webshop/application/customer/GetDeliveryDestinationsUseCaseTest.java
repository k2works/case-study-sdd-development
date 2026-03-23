package com.frerememoire.webshop.application.customer;

import com.frerememoire.webshop.domain.customer.DeliveryDestination;
import com.frerememoire.webshop.domain.customer.port.DeliveryDestinationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GetDeliveryDestinationsUseCaseTest {

    @Mock
    private DeliveryDestinationRepository deliveryDestinationRepository;

    private GetDeliveryDestinationsUseCase useCase;

    @BeforeEach
    void setUp() {
        useCase = new GetDeliveryDestinationsUseCase(deliveryDestinationRepository);
    }

    @Test
    void 顧客IDで過去の届け先一覧を取得できる() {
        Long customerId = 1L;
        List<DeliveryDestination> destinations = List.of(
            new DeliveryDestination(1L, customerId, "山田太郎", "100-0001",
                    "東京都千代田区", "090-1234-5678", LocalDateTime.now()),
            new DeliveryDestination(2L, customerId, "鈴木花子", "530-0001",
                    "大阪府大阪市北区", "080-9876-5432", LocalDateTime.now())
        );
        when(deliveryDestinationRepository.findByCustomerId(customerId))
                .thenReturn(destinations);

        List<DeliveryDestination> result = useCase.execute(customerId);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getRecipientName()).isEqualTo("山田太郎");
        assertThat(result.get(1).getRecipientName()).isEqualTo("鈴木花子");
    }

    @Test
    void 過去の届け先が0件の場合は空リストを返す() {
        when(deliveryDestinationRepository.findByCustomerId(99L))
                .thenReturn(List.of());

        List<DeliveryDestination> result = useCase.execute(99L);

        assertThat(result).isEmpty();
    }
}
