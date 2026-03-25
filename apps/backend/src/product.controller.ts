import { Body, Controller, Get, Inject, Post } from "@nestjs/common";

import { CustomerProduct, Product, ProductService, SaveProductRequest } from "./product.service";

@Controller()
export class ProductController {
  private readonly productService: ProductService;

  constructor(@Inject(ProductService) productService: ProductService) {
    this.productService = productService;
  }

  @Get("customer/products")
  listCustomerProducts(): CustomerProduct[] {
    return this.productService.listCustomerProducts();
  }

  @Get("admin/products")
  listProducts(): Product[] {
    return this.productService.listProducts();
  }

  @Post("admin/products")
  saveProduct(@Body() request: SaveProductRequest): Product {
    return this.productService.saveProduct(request);
  }
}
