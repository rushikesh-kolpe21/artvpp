import Navbar from './Navbar';
import OrderSummary from './OrderSummary';
import DigitalDownload from './DigitalDownload';
import { getDigitalProducts } from '../utils/productHelpers';

function OrderConfirmation({ orderData, cart, total, onContinueShopping }) {
  const generateOrderId = () => {
    return `ORD${Date.now().toString().slice(-8)}`;
  };

  const orderId = generateOrderId();
  const digitalProducts = getDigitalProducts(cart);
  const isDigitalOnly = digitalProducts.length > 0 && digitalProducts.length === cart.length;

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
        {/* Success Message Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            {isDigitalOnly ? (
              // Digital Download Section
              <>
                <DigitalDownload digitalProducts={digitalProducts} orderData={orderData} />
                
                {/* Continue Shopping Button */}
                <button
                  onClick={onContinueShopping}
                  className="w-full mt-6 bg-green-600 text-white py-3 px-4 rounded-lg font-bold text-lg hover:bg-green-700 transition"
                >
                  Continue Shopping
                </button>
              </>
            ) : (
              // Physical Delivery Section
              <div className="bg-white rounded-lg p-8 border border-gray-200 text-center">
                {/* Success Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-4xl">✓</span>
                  </div>
                </div>

                {/* Success Message */}
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Order Placed Successfully!
                </h1>
                <p className="text-gray-600 mb-6">
                  Thank you for your order. We're preparing your items for delivery.
                </p>

                {/* Order ID */}
                <div className="bg-green-50 rounded-lg p-4 mb-6 border border-green-200">
                  <p className="text-gray-600 text-sm mb-1">Order ID</p>
                  <p className="text-2xl font-bold text-green-700 font-mono">
                    {orderId}
                  </p>
                </div>

                {/* Delivery Address */}
                <div className="text-left bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-3">Delivery Address</h3>
                  <div className="space-y-1 text-gray-700 text-sm">
                    <p className="font-semibold">{orderData?.fullName}</p>
                    <p>{orderData?.houseFlat}</p>
                    <p>{orderData?.streetArea}</p>
                    <p>
                      {orderData?.city} - {orderData?.pincode}
                    </p>
                    <p className="mt-3 pt-3 border-t border-gray-300">
                      <span className="font-medium">Mobile:</span> {orderData?.mobileNumber}
                    </p>
                  </div>
                </div>

                {/* Estimated Delivery */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6">
                  <p className="text-gray-600 text-sm mb-1">Estimated Delivery</p>
                  <p className="text-lg font-bold text-blue-700">
                    Today, 10:00 PM - 11:00 PM
                  </p>
                </div>

                {/* Continue Shopping Button */}
                <button
                  onClick={onContinueShopping}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-bold text-lg hover:bg-green-700 transition"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <OrderSummary
                cart={cart}
                total={total}
                showButton={false}
              />
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {isDigitalOnly ? (
            <>
              <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
                <div className="text-3xl mb-2">⚡</div>
                <h3 className="font-bold text-gray-900 mb-1">Instant Download</h3>
                <p className="text-gray-600 text-sm">
                  Your digital files are available immediately after order confirmation
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
                <div className="text-3xl mb-2">🔐</div>
                <h3 className="font-bold text-gray-900 mb-1">Secure & Safe</h3>
                <p className="text-gray-600 text-sm">
                  Files are encrypted and protected with your order credentials
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
                <div className="text-3xl mb-2">📧</div>
                <h3 className="font-bold text-gray-900 mb-1">Email Backup</h3>
                <p className="text-gray-600 text-sm">
                  Download links sent to your email for 30 days of access
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
                <div className="text-3xl mb-2">📦</div>
                <h3 className="font-bold text-gray-900 mb-1">Order Confirmed</h3>
                <p className="text-gray-600 text-sm">
                  We've confirmed your order and are preparing it for dispatch
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
                <div className="text-3xl mb-2">🚚</div>
                <h3 className="font-bold text-gray-900 mb-1">On the Way</h3>
                <p className="text-gray-600 text-sm">
                  Your order will be picked up and delivered to your address
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
                <div className="text-3xl mb-2">✨</div>
                <h3 className="font-bold text-gray-900 mb-1">Quality Assured</h3>
                <p className="text-gray-600 text-sm">
                  All items are verified before shipping for your satisfaction
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderConfirmation;
