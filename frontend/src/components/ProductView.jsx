import { useState } from 'react';
import ProductViewCard from './ProductViewCard';
import { products } from '../data/products';

function ProductView() {
  const [activeTab, setActiveTab] = useState('Art Products');

  const filteredProducts = products.filter(
    (product) => product.mainCategory === activeTab
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('Art Products')}
              className={`py-4 px-2 font-semibold text-sm uppercase tracking-wider transition-colors border-b-2 ${
                activeTab === 'Art Products'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Art Products
            </button>
            <button
              onClick={() => setActiveTab('Digital Art')}
              className={`py-4 px-2 font-semibold text-sm uppercase tracking-wider transition-colors border-b-2 ${
                activeTab === 'Digital Art'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Digital Art
            </button>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Tab Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {activeTab}
          </h1>
          <p className="text-gray-600 text-sm">
            {activeTab === 'Art Products'
              ? 'Explore our collection of handcrafted and traditional art pieces'
              : 'Discover digital artworks and downloadable creative assets'}
          </p>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductViewCard
                key={product.id}
                product={product}
                isDigitalArt={activeTab === 'Digital Art'}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Products Found
            </h2>
            <p className="text-gray-600 text-sm">
              Check back soon for more {activeTab.toLowerCase()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductView;
