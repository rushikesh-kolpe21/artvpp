import CartPage from './pages/CartPage'
import { CartProvider } from './context/CartContext'

function App() {
  return (
    <CartProvider>
      <CartPage />
    </CartProvider>
  )
}

export default App
