package com.frerememoire.webshop.application.product;

import com.frerememoire.webshop.domain.product.Product;
import com.frerememoire.webshop.domain.product.port.ProductRepository;
import com.frerememoire.webshop.domain.shared.EntityNotFoundException;

import java.util.List;

public class ProductUseCase {

    private final ProductRepository productRepository;

    public ProductUseCase(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> findAll() {
        return productRepository.findAll();
    }

    public List<Product> findAllActive() {
        return productRepository.findAllActive();
    }

    public Product findById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("商品", id));
    }

    public Product create(String name, int price, String description) {
        Product product = Product.create(name, price, description);
        return productRepository.save(product);
    }

    public Product update(Long id, String name, int price, String description) {
        Product product = findById(id);
        product.update(name, price, description);
        return productRepository.save(product);
    }

    public void delete(Long id) {
        Product product = findById(id);
        product.deactivate();
        productRepository.save(product);
    }

    public Product addComposition(Long productId, Long itemId, int quantity) {
        Product product = findById(productId);
        product.addComposition(itemId, quantity);
        return productRepository.save(product);
    }

    public Product removeComposition(Long productId, Long itemId) {
        Product product = findById(productId);
        product.removeComposition(itemId);
        return productRepository.save(product);
    }
}
