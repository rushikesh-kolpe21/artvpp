import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import { products } from './data/products';
import './styles/CustomerDashboard.css';

function CustomerDashboard() {
  return (
    <div className="customer-app">
      <Navbar />
      
      <div className="customer-container">
        <div className="products-header">
          <h1>Explore Artworks</h1>
          <p>Discover unique and beautiful art pieces from talented artists</p>
        </div>

        {products.length > 0 ? (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h2>No Products Available</h2>
            <p>Check back soon for amazing artworks!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerDashboard;
