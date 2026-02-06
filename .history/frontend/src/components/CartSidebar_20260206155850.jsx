import { useCart } from '../context/CartContext';

function CartSidebar({ isOpen, onClose }) {
  const { cart, removeFromCart, incrementQuantity, decrementQuantity, getTotalItems, getTotalPrice } = useCart();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black bg-opacity-40 z-30"
        />
      )}

      {/* Cart Sidebar */}
      <div
        className={`fixed right-0 top-0 h-screen w-full sm:w-96 bg-white shadow-xl z-40 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 text-2xl font-light"
          >
            ×
          </button>
        </div>

        {/* Cart Items */}
        <div className="overflow-y-auto h-[calc(100vh-320px)]">
          {cart.length > 0 ? (
            <div className="p-4 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  {/* Item Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {item.name}
                      </p>
                      <p className="text-gray-600 text-xs mt-1">
                        ₹{item.price} each
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 text-lg"
                    >
                      ×
                    </button>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-white border border-gray-300 rounded">
                      <button
                        onClick={() => decrementQuantity(item.id)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 text-gray-900 font-bold"
                      >
                        −
                      </button>
                      <span className="w-6 text-center font-semibold text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => incrementQuantity(item.id)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 text-gray-900 font-bold"
                      >
                        +
                      </button>
                    </div>
                    <p className="font-bold text-gray-900">
                      ₹{item.price * item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center">
              <div className="text-4xl mb-4">🛒</div>
              <p className="text-gray-600 font-medium">Your cart is empty</p>
              <p className="text-gray-500 text-sm mt-2">
                Add items to get started
              </p>
            </div>
          )}
        </div>

        {/* Sticky Footer with Summary */}
        {cart.length > 0 && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 space-y-4">
            {/* Summary Details */}
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600 text-sm">
                <span>Items ({getTotalItems()})</span>
                <span>₹{getTotalPrice()}</span>
              </div>
              <div className="flex justify-between text-gray-600 text-sm">
                <span>Delivery</span>
                <span className="text-green-600 font-medium">FREE</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-lg">
                <span className="text-gray-900">Total</span>
                <span className="text-green-700">₹{getTotalPrice()}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-md">
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default CartSidebar;
