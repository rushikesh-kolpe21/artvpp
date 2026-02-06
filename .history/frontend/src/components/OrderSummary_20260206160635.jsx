function OrderSummary({ cart, total, showButton = true, buttonText = "Place Order", onButtonClick }) {
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Summary</h2>

      {/* Items List */}
      <div className="space-y-3 mb-6 max-h-80 overflow-y-auto">
        <div className="pb-4 border-b border-gray-200">
          {cart && cart.length > 0 ? (
            cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-2">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                  <p className="text-xs text-gray-600">
                    Qty: {item.quantity} × ₹{item.price}
                  </p>
                </div>
                <p className="font-semibold text-gray-900">
                  ₹{item.price * item.quantity}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No items in cart</p>
          )}
        </div>
      </div>

      {/* Summary Details */}
      <div className="space-y-3 border-b border-gray-200 pb-4 mb-4">
        <div className="flex justify-between text-gray-600">
          <span className="text-sm">Subtotal</span>
          <span className="text-sm font-medium">₹{total}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span className="text-sm">Delivery Charges</span>
          <span className="text-sm font-medium text-green-600">FREE</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span className="text-sm">Taxes & Fees</span>
          <span className="text-sm font-medium">₹0</span>
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-between items-center mb-6 bg-green-50 p-3 rounded-lg">
        <span className="font-bold text-gray-900">Total Amount</span>
        <span className="text-2xl font-bold text-green-700">₹{total}</span>
      </div>

      {/* Action Button */}
      {showButton && (
        <button
          onClick={onButtonClick}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-bold text-lg hover:bg-green-700 transition"
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}

export default OrderSummary;
