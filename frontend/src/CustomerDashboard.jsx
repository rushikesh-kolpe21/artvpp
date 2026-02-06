import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import { products } from './data/products';

function CustomerDashboard() {
  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Artworks</h1>
          <p className="text-gray-600 text-sm">Discover unique and beautiful art pieces from talented artists</p>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-600">
            <h2 className="text-xl mb-2 text-gray-900">No Products Available</h2>
            <p className="text-sm">Check back soon for amazing artworks!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerDashboard;
