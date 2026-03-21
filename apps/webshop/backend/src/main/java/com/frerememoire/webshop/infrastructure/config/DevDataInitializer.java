package com.frerememoire.webshop.infrastructure.config;

import com.frerememoire.webshop.application.auth.RegistrationUseCase;
import com.frerememoire.webshop.application.item.ItemUseCase;
import com.frerememoire.webshop.application.product.ProductUseCase;
import com.frerememoire.webshop.domain.auth.AuthUser;
import com.frerememoire.webshop.domain.auth.port.AuthUserRepository;
import com.frerememoire.webshop.domain.customer.Customer;
import com.frerememoire.webshop.domain.customer.port.CustomerRepository;
import com.frerememoire.webshop.domain.item.Item;
import com.frerememoire.webshop.domain.item.port.ItemRepository;
import com.frerememoire.webshop.domain.product.Product;
import com.frerememoire.webshop.domain.product.port.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Profile("default")
public class DevDataInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DevDataInitializer.class);

    private final RegistrationUseCase registrationUseCase;
    private final AuthUserRepository authUserRepository;
    private final ItemUseCase itemUseCase;
    private final ItemRepository itemRepository;
    private final ProductUseCase productUseCase;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;

    public DevDataInitializer(RegistrationUseCase registrationUseCase,
                               AuthUserRepository authUserRepository,
                               ItemUseCase itemUseCase,
                               ItemRepository itemRepository,
                               ProductUseCase productUseCase,
                               ProductRepository productRepository,
                               CustomerRepository customerRepository) {
        this.registrationUseCase = registrationUseCase;
        this.authUserRepository = authUserRepository;
        this.itemUseCase = itemUseCase;
        this.itemRepository = itemRepository;
        this.productUseCase = productUseCase;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        createDevUser();
        createCustomerUser();
        createSeedItems();
        createSeedProducts();
    }

    private void createDevUser() {
        if (!authUserRepository.existsByEmail("dev@example.com")) {
            registrationUseCase.register(
                    "dev@example.com", "Password1",
                    "太郎", "開発", null);
            log.info("開発用ユーザーを作成しました: dev@example.com / Password1");
        }
    }

    private void createCustomerUser() {
        if (!authUserRepository.existsByEmail("customer@example.com")) {
            AuthUser user = registrationUseCase.register(
                    "customer@example.com", "Password1",
                    "太郎", "山田", "090-1234-5678");
            // CUSTOMER ロール登録時に Customer レコードを自動作成
            if (!customerRepository.existsByUserId(user.getId())) {
                Customer customer = Customer.create(user.getId(),
                        user.getProfile().getLastName() + " " + user.getProfile().getFirstName(),
                        user.getProfile().getPhone());
                customerRepository.save(customer);
            }
            log.info("得意先ユーザーを作成しました: customer@example.com / Password1");
        }
    }

    private void createSeedItems() {
        if (!itemRepository.findAll().isEmpty()) {
            return;
        }

        itemUseCase.create("赤バラ", 7, 10, 3, "花材卸A社");
        itemUseCase.create("ピンクバラ", 7, 10, 3, "花材卸A社");
        itemUseCase.create("白バラ", 7, 10, 3, "花材卸A社");
        itemUseCase.create("カスミソウ", 10, 20, 2, "花材卸B社");
        itemUseCase.create("ユリ", 5, 5, 4, "花材卸A社");
        itemUseCase.create("チューリップ", 5, 10, 3, "花材卸C社");
        itemUseCase.create("ガーベラ", 7, 10, 2, "花材卸B社");
        itemUseCase.create("カーネーション", 10, 20, 2, "花材卸C社");
        itemUseCase.create("スターチス", 14, 20, 2, "花材卸B社");
        itemUseCase.create("ユーカリ（グリーン）", 14, 10, 3, "花材卸A社");

        log.info("開発用単品データを作成しました（10件）");
    }

    private void createSeedProducts() {
        if (productRepository.existsById(1L)) {
            return;
        }

        var items = itemRepository.findAll();
        if (items.isEmpty()) {
            return;
        }

        // 商品1: 赤バラのクラシックブーケ
        Product p1 = productUseCase.create("赤バラのクラシックブーケ", 5500, "情熱的な赤バラを中心に、カスミソウとユーカリで仕上げた定番のブーケです。");
        addCompositionIfItemExists(p1, items, "赤バラ", 5);
        addCompositionIfItemExists(p1, items, "カスミソウ", 3);
        addCompositionIfItemExists(p1, items, "ユーカリ（グリーン）", 2);

        // 商品2: パステルミックスブーケ
        Product p2 = productUseCase.create("パステルミックスブーケ", 4800, "ピンクバラとガーベラのやさしい色合いの花束。誕生日や記念日のプレゼントに。");
        addCompositionIfItemExists(p2, items, "ピンクバラ", 3);
        addCompositionIfItemExists(p2, items, "ガーベラ", 3);
        addCompositionIfItemExists(p2, items, "カスミソウ", 2);
        addCompositionIfItemExists(p2, items, "ユーカリ（グリーン）", 2);

        // 商品3: ホワイトエレガンス
        Product p3 = productUseCase.create("ホワイトエレガンス", 7000, "白バラとユリを贅沢に使った上品な花束。ウェディングや特別な日に。");
        addCompositionIfItemExists(p3, items, "白バラ", 5);
        addCompositionIfItemExists(p3, items, "ユリ", 3);
        addCompositionIfItemExists(p3, items, "スターチス", 2);

        // 商品4: 春のチューリップブーケ
        Product p4 = productUseCase.create("春のチューリップブーケ", 3800, "色とりどりのチューリップをメインにした春らしい花束です。");
        addCompositionIfItemExists(p4, items, "チューリップ", 7);
        addCompositionIfItemExists(p4, items, "カスミソウ", 3);

        // 商品5: 感謝のカーネーションブーケ
        Product p5 = productUseCase.create("感謝のカーネーションブーケ", 3500, "母の日や感謝を伝えたい日に。カーネーションとスターチスの温かい花束。");
        addCompositionIfItemExists(p5, items, "カーネーション", 8);
        addCompositionIfItemExists(p5, items, "スターチス", 3);
        addCompositionIfItemExists(p5, items, "ユーカリ（グリーン）", 2);

        log.info("開発用商品データを作成しました（5件、構成付き）");
    }

    private void addCompositionIfItemExists(Product product, java.util.List<Item> items, String itemName, int quantity) {
        items.stream()
                .filter(item -> item.getName().equals(itemName))
                .findFirst()
                .ifPresent(item -> productUseCase.addComposition(product.getId(), item.getId(), quantity));
    }
}
