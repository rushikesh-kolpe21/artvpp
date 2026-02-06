import { useCart } from '../context/CartContext';

function ProductDetail({ product, onClose }) {
  const { addToCart, removeFromCart, incrementQuantity, decrementQuantity, getCartItem } = useCart();
  
  const cartItem = getCartItem(product.id);
  const quantity = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    addToCart(product);
  };

  const handleRemoveFromCart = () => {
    removeFromCart(product.id);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Product Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 text-2xl font-light"
          >
            ×
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Side - Product Image */}
          <div className="flex items-center justify-center">
            <div className="w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-gray-600">
              [Product Image]
            </div>
          </div>

          {/* Right Side - Product Info */}
          <div className="flex flex-col justify-between">
            {/* Product Details */}
            <div>
              {/* Category Badge */}
              <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold uppercase mb-3">
                {product.category}
              </span>

              {/* Product Name */}
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>

              {/* Vendor */}
              <p className="text-gray-600 text-sm mb-6">By {product.vendor}</p>

              {/* Price */}
              <div className="mb-6">
                <p className="text-gray-600 text-sm mb-1">Price</p>
                <p className="text-4xl font-bold text-green-700">
                  <span className="text-2xl">₹</span>{product.price}
                </p>
              </div>

              {/* Description */}
              <div className="mb-8">
                <p className="text-gray-600 text-sm mb-2">Description</p>
                <p className="text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {quantity > 0 ? (
                <>
                  {/* Quantity Selector */}
                  <div className="flex items-center justify-between bg-gray-100 rounded-lg p-3">
                    <span className="text-gray-600 font-medium">Quantity</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => decrementQuantity(product.id)}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded border border-gray-300 hover:bg-gray-50 font-bold text-gray-900 transition"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-semibold text-gray-900">
                        {quantity}
                      </span>
                      <button
                        onClick={() => incrementQuantity(product.id)}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded border border-gray-300 hover:bg-gray-50 font-bold text-gray-900 transition"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Total Price */}
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-gray-600 text-xs mb-1">Total</p>
                    <p className="text-2xl font-bold text-green-700">
                      ₹{product.price * quantity}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={handleRemoveFromCart}
                    className="w-full py-3 px-4 border-2 border-red-500 text-red-500 font-semibold rounded-lg hover:bg-red-50 transition text-center"
                  >
                    Remove from Cart
                  </button>
                </>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-green-600 text-white py-4 px-4 rounded-lg font-bold text-lg hover:bg-green-700 transition shadow-md"
                >
                  Add to Cart
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
