import { Injectable } from "@nestjs/common";

export type ProductMaterial = {
  materialId: string;
  quantity: number;
};

export type Product = {
  productId: string;
  productName: string;
  description: string;
  price: number;
  isActive: boolean;
  materials: ProductMaterial[];
};

export type CustomerProduct = Pick<Product, "productId" | "productName" | "description" | "price">;

export type SaveProductRequest = Product;

@Injectable()
export class ProductService {
  private readonly products: Product[] = [
    {
      productId: "rose-garden",
      productName: "ローズガーデン",
      description: "赤バラとグリーンを束ねた、記念日向けの定番ブーケです。",
      price: 5500,
      isActive: true,
      materials: [
        { materialId: "MAT-001", quantity: 10 },
        { materialId: "MAT-002", quantity: 2 },
      ],
    },
    {
      productId: "seasonal-mimosa",
      productName: "季節のミモザブーケ",
      description: "旬のミモザを主役にした、春の贈り物向けの花束です。",
      price: 4800,
      isActive: true,
      materials: [{ materialId: "MAT-002", quantity: 4 }],
    },
    {
      productId: "white-lily",
      productName: "ホワイトリリー",
      description: "白を基調にまとめた、上品で落ち着いたアレンジです。",
      price: 6200,
      isActive: true,
      materials: [
        { materialId: "MAT-001", quantity: 8 },
        { materialId: "MAT-002", quantity: 4 },
      ],
    },
  ];

  listProducts(): Product[] {
    return this.products.map((product) => ({
      ...product,
      materials: product.materials.map((material) => ({ ...material })),
    }));
  }

  listCustomerProducts(): CustomerProduct[] {
    return this.products
      .filter((product) => product.isActive)
      .map(({ productId, productName, description, price }) => ({
        productId,
        productName,
        description,
        price,
      }));
  }

  findProduct(productId: string): Product | undefined {
    return this.products.find((product) => product.productId === productId);
  }

  saveProduct(request: SaveProductRequest): Product {
    const normalized: Product = {
      ...request,
      materials: request.materials
        .filter((material) => material.quantity > 0)
        .map((material) => ({ ...material })),
    };
    const index = this.products.findIndex((product) => product.productId === normalized.productId);

    if (index >= 0) {
      this.products[index] = normalized;
      return this.products[index];
    }

    this.products.push(normalized);
    return normalized;
  }
}
