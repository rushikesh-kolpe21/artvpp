import Navbar from './Navbar';
import CheckoutForm from './CheckoutForm';
import OrderSummary from './OrderSummary';
import { useCart } from '../context/CartContext';

function CheckoutPage({ onOrderPlace }) {
  const { cart, getTotalPrice } = useCart();

  const handleFormSubmit = (formData) => {
    onOrderPlace(formData);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Navbar */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <Navbar />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your order in a few simple steps</p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form (2/3 width) */}
          <div className="lg:col-span-2">
            <CheckoutForm onSubmit={handleFormSubmit} />
          </div>

          {/* Right Column - Order Summary (1/3 width) */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <OrderSummary
                cart={cart}
                total={getTotalPrice()}
                buttonText="Place Order"
                onButtonClick={() => {
                  // Form submission will be handled by CheckoutForm
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
