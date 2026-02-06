function ProductCard({ product }) {
  const handleAddToCart = () => {
    alert(`"${product.name}" added to cart!`);
  };

  return (
    <div className="product-card">
      <div className="product-image-placeholder">
        [Image]
      </div>
      
      <span className="product-category">{product.category}</span>
      
      <h3 className="product-name">{product.name}</h3>
      
      <p className="product-vendor">By {product.vendor}</p>
      
      <p className="product-description">{product.description}</p>
      
      <div className="product-price">
        <span className="price-currency">₹</span>{product.price}
      </div>
      
      <button className="add-to-cart-btn" onClick={handleAddToCart}>
        Add to Cart
      </button>
    </div>
  );
}

export default ProductCard;
