package com.frerememoire.webshop.application.product;

import com.frerememoire.webshop.domain.item.port.ItemRepository;
import com.frerememoire.webshop.domain.product.Product;
import com.frerememoire.webshop.domain.product.port.ProductRepository;
import com.frerememoire.webshop.domain.shared.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ProductUseCaseTest {

    private ProductRepository productRepository;
    private ItemRepository itemRepository;
    private ProductUseCase productUseCase;

    @BeforeEach
    void setUp() {
        productRepository = Mockito.mock(ProductRepository.class);
        itemRepository = Mockito.mock(ItemRepository.class);
        productUseCase = new ProductUseCase(productRepository, itemRepository);
    }

    @Test
    void 全商品を取得できる() {
        Product product = Product.create("春の花束", 5000, "説明");
        when(productRepository.findAll()).thenReturn(List.of(product));

        List<Product> result = productUseCase.findAll();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("春の花束");
    }

    @Test
    void アクティブな商品のみ取得できる() {
        Product product = Product.create("春の花束", 5000, "説明");
        when(productRepository.findAllActive()).thenReturn(List.of(product));

        List<Product> result = productUseCase.findAllActive();

        assertThat(result).hasSize(1);
        verify(productRepository).findAllActive();
    }

    @Test
    void IDで商品を取得できる() {
        Product product = Product.create("春の花束", 5000, "説明");
        product.setId(1L);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        Product result = productUseCase.findById(1L);

        assertThat(result.getName()).isEqualTo("春の花束");
    }

    @Test
    void 存在しないIDで取得すると例外が発生する() {
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productUseCase.findById(999L))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void 商品を新規作成できる() {
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
            Product p = invocation.getArgument(0);
            p.setId(1L);
            return p;
        });

        Product result = productUseCase.create("春の花束", 5000, "説明");

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("春の花束");
        assertThat(result.getPrice()).isEqualTo(5000);
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void 商品を更新できる() {
        Product product = Product.create("春の花束", 5000, "説明");
        product.setId(1L);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Product result = productUseCase.update(1L, "夏の花束", 6000, "夏の説明");

        assertThat(result.getName()).isEqualTo("夏の花束");
        assertThat(result.getPrice()).isEqualTo(6000);
    }

    @Test
    void 商品を削除できる() {
        Product product = Product.create("春の花束", 5000, "説明");
        product.setId(1L);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        productUseCase.delete(1L);

        verify(productRepository).save(argThat(p -> !p.isActive()));
    }

    @Test
    void 存在しない商品を削除すると例外が発生する() {
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productUseCase.delete(999L))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void 構成を追加できる() {
        Product product = Product.create("春の花束", 5000, "説明");
        product.setId(1L);
        when(itemRepository.existsById(10L)).thenReturn(true);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Product result = productUseCase.addComposition(1L, 10L, 3);

        assertThat(result.getCompositions()).hasSize(1);
        assertThat(result.getCompositions().get(0).getItemId()).isEqualTo(10L);
        assertThat(result.getCompositions().get(0).getQuantity()).isEqualTo(3);
    }

    @Test
    void 存在しないItemIDで構成追加すると例外が発生する() {
        when(itemRepository.existsById(999L)).thenReturn(false);

        assertThatThrownBy(() -> productUseCase.addComposition(1L, 999L, 3))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void 構成を削除できる() {
        Product product = Product.create("春の花束", 5000, "説明");
        product.setId(1L);
        product.addComposition(10L, 3);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Product result = productUseCase.removeComposition(1L, 10L);

        assertThat(result.getCompositions()).isEmpty();
    }

    @Test
    void findActiveByIdでアクティブな商品を取得できる() {
        Product product = Product.create("春の花束", 5000, "説明");
        product.setId(1L);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        Product result = productUseCase.findActiveById(1L);

        assertThat(result.getName()).isEqualTo("春の花束");
        assertThat(result.isActive()).isTrue();
    }

    @Test
    void findActiveByIdで非アクティブな商品は例外が発生する() {
        Product product = Product.create("春の花束", 5000, "説明");
        product.setId(1L);
        product.deactivate();
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        assertThatThrownBy(() -> productUseCase.findActiveById(1L))
                .isInstanceOf(EntityNotFoundException.class);
    }
}
