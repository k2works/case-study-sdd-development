export interface CompositionDto {
  itemId: number;
  quantity: number;
}

export interface ProductDto {
  id: number;
  name: string;
  price: number;
  compositions: CompositionDto[];
}

export interface CreateProductInput {
  name: string;
  price: number;
  compositions: CompositionDto[];
}
