import api from './api'

export interface DeliveryDestinationResponse {
  id: number
  recipientName: string
  postalCode: string
  address: string
  phone: string | null
}

export const deliveryDestinationApi = {
  getMyDestinations: () =>
    api.get<DeliveryDestinationResponse[]>('/customers/me/delivery-destinations').then(res => res.data),
}
