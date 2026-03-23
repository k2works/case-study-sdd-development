import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './providers/AuthProvider'
import { ProtectedRoute } from './features/auth/ProtectedRoute'
import { LoginPage } from './features/auth/LoginPage'
import { RegisterPage } from './features/auth/RegisterPage'
import { AppLayout } from './components/layout/AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import { ItemListPage } from './features/item/ItemListPage'
import { ItemFormPage } from './features/item/ItemFormPage'
import { ProductListPage } from './features/product/ProductListPage'
import { ProductFormPage } from './features/product/ProductFormPage'
import { ProductCompositionPage } from './features/product/ProductCompositionPage'
import { ProductCatalogPage } from './features/product/ProductCatalogPage'
import { ProductDetailPage } from './features/product/ProductDetailPage'
import { MyOrdersPage } from './features/order/MyOrdersPage'
import { OrderFormPage } from './features/order/OrderFormPage'
import { OrderConfirmPage } from './features/order/OrderConfirmPage'
import { OrderCompletePage } from './features/order/OrderCompletePage'
import { OrderListPage } from './features/order/OrderListPage'
import { OrderDetailPage } from './features/order/OrderDetailPage'
import { InventoryTransitionPage } from './features/inventory/InventoryTransitionPage'
import { PurchaseOrderPage } from './features/purchase/PurchaseOrderPage'
import { ArrivalRegistrationPage } from './features/purchase/ArrivalRegistrationPage'
import { BundlingTargetsPage } from './features/shipping/BundlingTargetsPage'
import { ShipmentPage } from './features/shipping/ShipmentPage'
import './App.css'

const queryClient = new QueryClient()

function DefaultRedirect() {
  const { isAuthenticated } = useAuth()
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/items" element={<ItemListPage />} />
              <Route path="/items/new" element={<ItemFormPage />} />
              <Route path="/items/:id/edit" element={<ItemFormPage />} />
              <Route path="/products" element={<ProductListPage />} />
              <Route path="/products/new" element={<ProductFormPage />} />
              <Route path="/products/:id/edit" element={<ProductFormPage />} />
              <Route path="/products/:id/compositions" element={<ProductCompositionPage />} />
              <Route path="/catalog/products" element={<ProductCatalogPage />} />
              <Route path="/catalog/products/:id" element={<ProductDetailPage />} />
              <Route path="/orders/my" element={<MyOrdersPage />} />
              <Route path="/orders/new/:productId" element={<OrderFormPage />} />
              <Route path="/orders/confirm" element={<OrderConfirmPage />} />
              <Route path="/orders/complete" element={<OrderCompletePage />} />
              <Route path="/admin/orders" element={<OrderListPage />} />
              <Route path="/admin/orders/:id" element={<OrderDetailPage />} />
              <Route path="/admin/inventory" element={<InventoryTransitionPage />} />
              <Route path="/admin/purchase-orders" element={<PurchaseOrderPage />} />
              <Route path="/admin/purchase-orders/:id/arrivals/new" element={<ArrivalRegistrationPage />} />
              <Route path="/admin/bundling" element={<BundlingTargetsPage />} />
              <Route path="/admin/shipments" element={<ShipmentPage />} />
            </Route>
            <Route path="*" element={<DefaultRedirect />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
