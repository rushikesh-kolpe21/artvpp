import { useCart } from '../context/CartContext';

function ProductCard({ product, onProductClick }) {
  const { addToCart, removeFromCart, getCartItem, incrementQuantity, decrementQuantity } = useCart();
  
  const cartItem = getCartItem(product.id);
  const quantity = cartItem?.quantity || 0;

  const handleAddClick = (e) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    incrementQuantity(product.id);
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    decrementQuantity(product.id);
  };

  return (
    <div
      onClick={() => onProductClick(product)}
      className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col h-full shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer"
    >
      {/* Image Placeholder */}
      <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center text-gray-600 text-sm">
        [Image]
      </div>

      {/* Category Badge */}
      <span className="inline-block bg-green-100 text-green-800 px-2.5 py-1 rounded text-xs font-semibold uppercase mb-2 w-fit">
        {product.category}
      </span>

      {/* Product Name */}
      <h3 className="text-base font-bold text-gray-900 mb-1 leading-tight line-clamp-2">
        {product.name}
      </h3>

      {/* Vendor Name */}
      <p className="text-xs text-gray-600 mb-3 font-medium">By {product.vendor}</p>

      {/* Price */}
      <div className="text-lg font-bold text-green-700 mb-3">
        <span className="text-sm">₹</span>{product.price}
      </div>

      {/* Add to Cart / Quantity Selector */}
      {quantity === 0 ? (
        <button
          onClick={handleAddClick}
          className="w-full py-2 px-3 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 transition"
        >
          Add to Cart
        </button>
      ) : (
        <div className="flex items-center justify-between bg-green-50 rounded-lg border border-green-200 p-2">
          <button
            onClick={handleDecrement}
            className="w-6 h-6 flex items-center justify-center hover:bg-green-100 font-bold text-green-700 transition"
          >
            −
          </button>
          <span className="font-semibold text-green-700 text-sm">{quantity}</span>
          <button
            onClick={handleIncrement}
            className="w-6 h-6 flex items-center justify-center hover:bg-green-100 font-bold text-green-700 transition"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}

export default ProductCard;
