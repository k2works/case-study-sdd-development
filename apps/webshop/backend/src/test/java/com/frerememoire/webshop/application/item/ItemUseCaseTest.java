package com.frerememoire.webshop.application.item;

import com.frerememoire.webshop.domain.item.Item;
import com.frerememoire.webshop.domain.item.port.ItemRepository;
import com.frerememoire.webshop.domain.shared.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ItemUseCaseTest {

    private ItemRepository itemRepository;
    private ItemUseCase useCase;

    @BeforeEach
    void setUp() {
        itemRepository = mock(ItemRepository.class);
        useCase = new ItemUseCase(itemRepository);
    }

    @Test
    void 単品一覧を取得できる() {
        Item item = Item.create("バラ", 7, 10, 3, "花卸問屋A");
        when(itemRepository.findAll()).thenReturn(List.of(item));

        List<Item> result = useCase.findAll();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("バラ");
    }

    @Test
    void IDで単品を取得できる() {
        Item item = Item.create("バラ", 7, 10, 3, "花卸問屋A");
        item.setId(1L);
        when(itemRepository.findById(1L)).thenReturn(Optional.of(item));

        Item result = useCase.findById(1L);

        assertThat(result.getName()).isEqualTo("バラ");
    }

    @Test
    void 存在しないIDで例外が発生する() {
        when(itemRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> useCase.findById(99L))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void 単品を登録できる() {
        when(itemRepository.save(any())).thenAnswer(invocation -> {
            Item item = invocation.getArgument(0);
            item.setId(1L);
            return item;
        });

        Item result = useCase.create("バラ", 7, 10, 3, "花卸問屋A");

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("バラ");
    }

    @Test
    void 単品を更新できる() {
        Item existing = Item.create("バラ", 7, 10, 3, "花卸問屋A");
        existing.setId(1L);
        when(itemRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(itemRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        Item result = useCase.update(1L, "チューリップ", 5, 20, 2, "花卸問屋B");

        assertThat(result.getName()).isEqualTo("チューリップ");
    }

    @Test
    void 単品を削除できる() {
        when(itemRepository.existsById(1L)).thenReturn(true);

        useCase.delete(1L);

        verify(itemRepository).deleteById(1L);
    }

    @Test
    void 存在しない単品の削除で例外が発生する() {
        when(itemRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> useCase.delete(99L))
                .isInstanceOf(EntityNotFoundException.class);
    }
}
