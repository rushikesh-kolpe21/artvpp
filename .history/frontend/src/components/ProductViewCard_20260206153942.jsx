function ProductViewCard({ product, isDigitalArt }) {
  const handleButtonClick = () => {
    const buttonText = isDigitalArt ? 'Buy & Download' : 'Add to Cart';
    alert(`"${product.name}" - ${buttonText} clicked!`);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col h-full shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
      {/* Image Placeholder */}
      <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-md mb-4 flex items-center justify-center text-gray-600 text-sm text-center">
        [Image]
      </div>

      {/* Category Badge */}
      <span className="inline-block bg-gray-100 text-gray-700 px-2.5 py-1 rounded text-xs font-semibold uppercase mb-2.5 w-fit">
        {product.category}
      </span>

      {/* Product Name */}
      <h3 className="text-base font-bold text-gray-900 mb-2 leading-snug">
        {product.name}
      </h3>

      {/* Vendor Name */}
      <p className="text-xs text-gray-600 mb-3 font-medium">
        By {product.vendor}
      </p>

      {/* Description */}
      <p className="text-sm text-gray-700 mb-4 line-clamp-2 flex-grow leading-relaxed">
        {product.description}
      </p>

      {/* Price */}
      <div className="text-xl font-bold text-green-700 mb-4">
        <span className="text-lg">₹</span>{product.price}
      </div>

      {/* Action Button */}
      <button
        onClick={handleButtonClick}
        className={`w-full py-3 px-4 rounded-md font-semibold uppercase text-sm tracking-wider transition-all duration-200 ${
          isDigitalArt
            ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
            : 'bg-gray-900 text-white hover:bg-gray-800 active:scale-95'
        }`}
      >
        {isDigitalArt ? 'Buy & Download' : 'Add to Cart'}
      </button>
    </div>
  );
}

export default ProductViewCard;
