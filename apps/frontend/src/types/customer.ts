export interface CustomerDto {
  customerId: number;
  name: string;
  phone: string;
  email: string | null;
}

export interface CreateCustomerInput {
  name: string;
  phone: string;
  email: string | null;
}

export interface DestinationDto {
  destinationId: number;
  customerId: number;
  name: string;
  address: string;
  phone: string;
}
