package com.frerememoire.webshop.infrastructure.config;

import com.frerememoire.webshop.application.auth.RegistrationUseCase;
import com.frerememoire.webshop.application.item.ItemUseCase;
import com.frerememoire.webshop.application.order.PlaceOrderCommand;
import com.frerememoire.webshop.application.order.PlaceOrderUseCase;
import com.frerememoire.webshop.application.product.ProductUseCase;
import com.frerememoire.webshop.application.purchaseorder.PlacePurchaseOrderUseCase;
import com.frerememoire.webshop.domain.auth.AuthUser;
import com.frerememoire.webshop.domain.auth.PasswordEncoder;
import com.frerememoire.webshop.domain.auth.Role;
import com.frerememoire.webshop.domain.auth.UserProfile;
import com.frerememoire.webshop.domain.auth.port.AuthUserRepository;
import com.frerememoire.webshop.domain.customer.Customer;
import com.frerememoire.webshop.domain.customer.port.CustomerRepository;
import com.frerememoire.webshop.domain.item.Item;
import com.frerememoire.webshop.domain.item.port.ItemRepository;
import com.frerememoire.webshop.domain.order.Order;
import com.frerememoire.webshop.domain.order.port.OrderRepository;
import com.frerememoire.webshop.domain.product.Product;
import com.frerememoire.webshop.domain.product.port.ProductRepository;
import com.frerememoire.webshop.domain.purchaseorder.PurchaseOrder;
import com.frerememoire.webshop.domain.purchaseorder.port.PurchaseOrderRepository;
import com.frerememoire.webshop.domain.stock.Stock;
import com.frerememoire.webshop.domain.stock.port.StockRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@Profile("default")
public class DevDataInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DevDataInitializer.class);

    private record SeedOrderSpec(
            String productName,
            java.time.LocalDate deliveryDate,
            String recipientName,
            String postalCode,
            String address,
            String phone,
            String message,
            boolean accepted) {
    }

    private final RegistrationUseCase registrationUseCase;
    private final AuthUserRepository authUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final ItemUseCase itemUseCase;
    private final ItemRepository itemRepository;
    private final ProductUseCase productUseCase;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final PlaceOrderUseCase placeOrderUseCase;
    private final OrderRepository orderRepository;
    private final PlacePurchaseOrderUseCase placePurchaseOrderUseCase;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final StockRepository stockRepository;

    public DevDataInitializer(RegistrationUseCase registrationUseCase,
                               AuthUserRepository authUserRepository,
                               PasswordEncoder passwordEncoder,
                               ItemUseCase itemUseCase,
                               ItemRepository itemRepository,
                               ProductUseCase productUseCase,
                               ProductRepository productRepository,
                               CustomerRepository customerRepository,
                               PlaceOrderUseCase placeOrderUseCase,
                               OrderRepository orderRepository,
                               PlacePurchaseOrderUseCase placePurchaseOrderUseCase,
                               PurchaseOrderRepository purchaseOrderRepository,
                               StockRepository stockRepository) {
        this.registrationUseCase = registrationUseCase;
        this.authUserRepository = authUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.itemUseCase = itemUseCase;
        this.itemRepository = itemRepository;
        this.productUseCase = productUseCase;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.placeOrderUseCase = placeOrderUseCase;
        this.orderRepository = orderRepository;
        this.placePurchaseOrderUseCase = placePurchaseOrderUseCase;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.stockRepository = stockRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        createOwnerUser();
        createStaffUser();
        createPurchaseStaffUser();
        createCustomerUser();
        createSecondCustomerUser();
        createSeedItems();
        createSeedProducts();
        createSeedStocksAndPurchaseOrders();
        createSeedOrders();
        createSecondCustomerOrders();
    }

    private void createOwnerUser() {
        ensurePrivilegedUser("dev@example.com", "太郎", "開発", null, Role.OWNER, "オーナー");
    }

    private void createStaffUser() {
        ensurePrivilegedUser("staff@example.com", "花子", "受注", null, Role.ORDER_STAFF, "受注スタッフ");
    }

    private void createPurchaseStaffUser() {
        ensurePrivilegedUser("purchase@example.com", "次郎", "仕入", null, Role.PURCHASE_STAFF, "仕入スタッフ");
    }

    private void createCustomerUser() {
        var existingCustomer = authUserRepository.findByEmail("customer@example.com");
        if (existingCustomer.isPresent()) {
            ensureCustomerRecord(existingCustomer.get());
            return;
        }

        registrationUseCase.register(
                "customer@example.com", "Password1",
                "太郎", "山田", "090-1234-5678");
        log.info("得意先ユーザーを作成しました: customer@example.com / Password1");
    }

    private void createSecondCustomerUser() {
        var existing = authUserRepository.findByEmail("customer2@example.com");
        if (existing.isPresent()) {
            ensureCustomerRecord(existing.get());
            return;
        }

        registrationUseCase.register(
                "customer2@example.com", "Password1",
                "花子", "鈴木", "080-9876-5432");
        log.info("得意先ユーザー2を作成しました: customer2@example.com / Password1");
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

    private void createSeedOrders() {
        if (!orderRepository.findAll().isEmpty()) {
            return;
        }

        var customerUser = authUserRepository.findByEmail("customer@example.com");
        if (customerUser.isEmpty()) {
            return;
        }

        var products = productRepository.findAll();
        if (products.isEmpty()) {
            return;
        }

        createSeedOrder(customerUser.get().getId(), products, new SeedOrderSpec(
                "赤バラのクラシックブーケ",
                java.time.LocalDate.now().plusDays(3),
                "山田 太郎",
                "150-0001",
                "東京都渋谷区神宮前 1-2-3",
                "090-1234-5678",
                "誕生日祝いです。",
                false
        ));

        createSeedOrder(customerUser.get().getId(), products, new SeedOrderSpec(
                "パステルミックスブーケ",
                java.time.LocalDate.now().plusDays(5),
                "山田 太郎",
                "220-0004",
                "神奈川県横浜市西区北幸 2-4-6",
                "090-1234-5678",
                "午前中着でお願いします。",
                true
        ));

        createSeedOrder(customerUser.get().getId(), products, new SeedOrderSpec(
                "ホワイトエレガンス",
                java.time.LocalDate.now().plusDays(7),
                "山田 太郎",
                "530-0001",
                "大阪府大阪市北区梅田 3-1-1",
                "090-1234-5678",
                null,
                false
        ));

        log.info("開発用受注データを作成しました（3件）");
    }

    private void createSeedStocksAndPurchaseOrders() {
        if (!stockRepository.findAll().isEmpty()) {
            return;
        }
        var items = itemRepository.findAll();
        if (items.isEmpty()) {
            return;
        }
        java.time.LocalDate today = java.time.LocalDate.now();
        createSeedStocks(items, today);
        createSeedPurchaseOrders(items, today);
        log.info("開発用在庫・発注データを作成しました（在庫 {}件、発注 8件）", items.size());
    }

    private void createSeedStocks(java.util.List<Item> items, java.time.LocalDate today) {
        for (Item item : items) {
            Stock stock = Stock.create(
                    item.getId(), item.getPurchaseUnit() * 3,
                    today.minusDays(2), item.getQualityRetentionDays());
            stockRepository.save(stock);
        }
    }

    private void createSeedPurchaseOrders(java.util.List<Item> items, java.time.LocalDate today) {
        // 受注商品の構成単品に対応する発注を作成
        // 赤バラのクラシックブーケ: 赤バラ5, カスミソウ3, ユーカリ2
        // パステルミックスブーケ: ピンクバラ3, ガーベラ3, カスミソウ2, ユーカリ2
        // ホワイトエレガンス: 白バラ5, ユリ3, スターチス2
        createPurchaseOrderForItem(items, "赤バラ", 2, today);
        createPurchaseOrderForItem(items, "ピンクバラ", 1, today);
        createPurchaseOrderForItem(items, "白バラ", 1, today);
        createPurchaseOrderForItem(items, "カスミソウ", 1, today);
        createPurchaseOrderForItem(items, "ユリ", 1, today);
        createPurchaseOrderForItem(items, "ガーベラ", 1, today);
        createPurchaseOrderForItem(items, "スターチス", 1, today);
        createPurchaseOrderForItem(items, "ユーカリ（グリーン）", 1, today);
    }

    private void createPurchaseOrderForItem(java.util.List<Item> items, String name,
                                             int unitMultiplier, java.time.LocalDate today) {
        items.stream().filter(item -> item.getName().equals(name)).findFirst()
                .ifPresent(item -> {
                    int qty = item.getPurchaseUnit() * unitMultiplier;
                    PurchaseOrder po = placePurchaseOrderUseCase.place(
                            item.getId(), qty, today.plusDays(item.getLeadTimeDays()));
                    log.info("発注を作成: {} x {} 本（{}）", item.getName(), qty, po.getStatus());
                });
    }

    private void addCompositionIfItemExists(Product product, java.util.List<Item> items, String itemName, int quantity) {
        items.stream()
                .filter(item -> item.getName().equals(itemName))
                .findFirst()
                .ifPresent(item -> productUseCase.addComposition(product.getId(), item.getId(), quantity));
    }

    private void createSeedOrder(Long userId, java.util.List<Product> products, SeedOrderSpec spec) {
        products.stream()
                .filter(product -> product.getName().equals(spec.productName()))
                .findFirst()
                .ifPresent(product -> {
                    Order order = placeOrderUseCase.placeOrder(new PlaceOrderCommand(
                            userId,
                            product.getId(),
                            spec.deliveryDate(),
                            spec.recipientName(),
                            spec.postalCode(),
                            spec.address(),
                            spec.phone(),
                            spec.message()
                    ));

                    if (spec.accepted()) {
                        order.accept();
                        orderRepository.save(order);
                    }
                });
    }

    private void createSecondCustomerOrders() {
        var customerUser = authUserRepository.findByEmail("customer2@example.com");
        if (customerUser.isEmpty()) {
            return;
        }

        // customer2 の注文が既にある場合はスキップ
        var customer = customerRepository.findByUserId(customerUser.get().getId());
        if (customer.isPresent() && !orderRepository.findByCustomerId(customer.get().getId()).isEmpty()) {
            return;
        }

        var products = productRepository.findAll();
        if (products.isEmpty()) {
            return;
        }

        createSeedOrder(customerUser.get().getId(), products, new SeedOrderSpec(
                "パステルミックスブーケ",
                java.time.LocalDate.now().plusDays(4),
                "鈴木 一郎",
                "460-0008",
                "愛知県名古屋市中区栄 3-5-1",
                "080-1111-2222",
                "退院祝いです。お元気で。",
                false
        ));

        createSeedOrder(customerUser.get().getId(), products, new SeedOrderSpec(
                "感謝のカーネーションブーケ",
                java.time.LocalDate.now().plusDays(6),
                "鈴木 花子",
                "810-0001",
                "福岡県福岡市中央区天神 1-8-1",
                "080-9876-5432",
                "母の日のプレゼントです。",
                true
        ));

        log.info("得意先2の開発用受注データを作成しました（2件）");
    }

    private void ensurePrivilegedUser(String email, String firstName, String lastName,
                                      String phone, Role expectedRole, String label) {
        UserProfile expectedProfile = new UserProfile(firstName, lastName, phone);
        var existingUser = authUserRepository.findByEmail(email);

        if (existingUser.isEmpty()) {
            AuthUser user = AuthUser.create(
                    email, passwordEncoder.encode("Password1"),
                    expectedRole, expectedProfile);
            authUserRepository.save(user);
            log.info("{}ユーザーを作成しました: {} / Password1 ({})", label, email, expectedRole);
            return;
        }

        AuthUser currentUser = existingUser.get();
        if (currentUser.getRole() == expectedRole && hasSameProfile(currentUser.getProfile(), expectedProfile)) {
            return;
        }

        AuthUser repairedUser = new AuthUser(
                currentUser.getId(),
                currentUser.getEmail(),
                currentUser.getPasswordHash(),
                expectedRole,
                expectedProfile,
                currentUser.getFailedLoginCount(),
                currentUser.getLockedUntil(),
                currentUser.getCreatedAt(),
                LocalDateTime.now()
        );
        authUserRepository.save(repairedUser);
        log.info("{}ユーザーを補正しました: {} ({})", label, email, expectedRole);
    }

    private void ensureCustomerRecord(AuthUser user) {
        if (customerRepository.existsByUserId(user.getId())) {
            return;
        }

        Customer customer = Customer.create(
                user.getId(),
                user.getProfile().getLastName() + " " + user.getProfile().getFirstName(),
                user.getProfile().getPhone()
        );
        customerRepository.save(customer);
        log.info("得意先レコードを補正しました: userId={}", user.getId());
    }

    private boolean hasSameProfile(UserProfile currentProfile, UserProfile expectedProfile) {
        return currentProfile.getFirstName().equals(expectedProfile.getFirstName())
                && currentProfile.getLastName().equals(expectedProfile.getLastName())
                && java.util.Objects.equals(currentProfile.getPhone(), expectedProfile.getPhone());
    }
}
