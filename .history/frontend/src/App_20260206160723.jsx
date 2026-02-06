import { useState } from 'react'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderConfirmation from './components/OrderConfirmation'
import { CartProvider, useCart } from './context/CartContext'

function AppContent() {
  const [currentPage, setCurrentPage] = useState('cart') // 'cart', 'checkout', 'confirmation'
  const [orderData, setOrderData] = useState(null)
  const { cart, getTotalPrice, clearCart } = useCart()

  const handleNavigateCheckout = () => {
    setCurrentPage('checkout')
  }

  const handleOrderPlace = (formData) => {
    setOrderData(formData)
    clearCart()
    setCurrentPage('confirmation')
  }

  const handleContinueShopping = () => {
    setCurrentPage('cart')
  }

  return (
    <>
      {currentPage === 'cart' && (
        <CartPage onNavigateCheckout={handleNavigateCheckout} />
      )}
      {currentPage === 'checkout' && (
        <CheckoutPage onOrderPlace={handleOrderPlace} />
      )}
      {currentPage === 'confirmation' && (
        <OrderConfirmation
          orderData={orderData}
          cart={cart}
          total={getTotalPrice()}
          onContinueShopping={handleContinueShopping}
        />
      )}
    </>
  )
}

function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  )
}

export default App
