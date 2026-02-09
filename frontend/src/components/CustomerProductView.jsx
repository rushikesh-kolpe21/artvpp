import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import ProductDetails from './ProductDetails';
import '../styles/CustomerProductView.css';
import API_URL from '../config/api';

// Product categories - must match backend
const CATEGORIES = ['Art Products', 'Merchandise', 'Digital Art', 'Limited & Signature Works', 'Professional Services'];

function CustomerProductView({ onAddToCart, onProfileClick }) {
  const [activeTab, setActiveTab] = useState('Art Products');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [limitedWorks, setLimitedWorks] = useState([]);
  const [limitedLoading, setLimitedLoading] = useState(false);
  const [limitedError, setLimitedError] = useState(null);
  const [selectedLimitedWork, setSelectedLimitedWork] = useState(null);
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    serviceType: '',
    description: '',
    budget: '',
    timeline: '',
  });

  // Fetch products from API (only approved vendors)
  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (activeTab === 'Limited & Signature Works' && limitedWorks.length === 0) {
      fetchLimitedWorks();
    }
  }, [activeTab, limitedWorks.length]);

  useEffect(() => {
    if (activeTab === 'Professional Services' && services.length === 0) {
      fetchProfessionalServices();
    }
  }, [activeTab, services.length]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call customer API endpoint - returns products from approved vendors only
      const response = await fetch(`${API_URL}/products`);
      const data = await response.json();
      
      if (data.success) {
        // Use _id as id for compatibility with ProductDetails
        const formattedProducts = data.products.map(product => ({
          ...product,
          id: product._id,
        }));
        setProducts(formattedProducts);
      } else {
        setError(data.message || 'Failed to load products');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Unable to load products. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLimitedWorks = async () => {
    try {
      setLimitedLoading(true);
      setLimitedError(null);

      const response = await fetch(`${API_URL}/limited-works`);
      const data = await response.json();

      if (data.success) {
        setLimitedWorks(data.works || []);
      } else {
        setLimitedError(data.message || 'Failed to load limited works');
      }
    } catch (err) {
      console.error('Error fetching limited works:', err);
      setLimitedError('Unable to load limited works. Please check your connection.');
    } finally {
      setLimitedLoading(false);
    }
  };

  const handleRequestPreOrder = async (workId) => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        alert('Please login to request a pre-order.');
        return;
      }

      const response = await fetch(`${API_URL}/limited-works/${workId}/preorder`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        alert('Pre-order request submitted successfully.');
        await fetchLimitedWorks();
      } else {
        alert(data.message || 'Failed to submit pre-order request.');
      }
    } catch (err) {
      console.error('Error requesting pre-order:', err);
      alert('Failed to submit pre-order request.');
    }
  };

  const fetchProfessionalServices = async () => {
    try {
      setServicesLoading(true);
      setServicesError(null);

      const response = await fetch(`${API_URL}/professional-services`);
      const data = await response.json();

      if (data.success) {
        setServices(data.data || []);
      } else {
        setServicesError(data.message || 'Failed to load services');
      }
    } catch (err) {
      console.error('Error fetching professional services:', err);
      setServicesError('Unable to load services. Please check your connection.');
    } finally {
      setServicesLoading(false);
    }
  };

  const handleBookingFormChange = (field, value) => {
    setBookingForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmitBooking = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        alert('Please login to book a service.');
        return;
      }

      if (!bookingForm.serviceType || !bookingForm.description || !bookingForm.budget || !bookingForm.timeline) {
        alert('Please fill in all fields');
        return;
      }

      const response = await fetch(`${API_URL}/professional-services/book`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingForm),
      });

      const data = await response.json();
      if (data.success) {
        alert('Booking request submitted successfully. Please wait for vendor response.');
        setBookingForm({ serviceType: '', description: '', budget: '', timeline: '' });
        setSelectedService(null);
      } else {
        alert(data.message || 'Failed to submit booking request.');
      }
    } catch (err) {
      console.error('Error submitting booking:', err);
      alert('Failed to submit booking request.');
    }
  };

  // Filter products based on active tab (category)
  const filteredProducts = products.filter(
    product => product.category === activeTab
  );

  if (selectedProductId) {
    return (
      <ProductDetails 
        productId={selectedProductId}
        onClose={() => setSelectedProductId(null)}
        onAddToCart={onAddToCart}
      />
    );
  }

  if (selectedService) {
    return (
      <div className="customer-product-view">
        <Navbar onProfileClick={onProfileClick} />

        <div className="professional-booking">
          <button className="btn-back" onClick={() => {
            setSelectedService(null);
            setBookingForm({ serviceType: '', description: '', budget: '', timeline: '' });
          }}>
            ← Back to Professional Services
          </button>

          <div className="booking-form-card">
            <h2>Book {selectedService.name}</h2>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSubmitBooking();
            }}>
              <div className="form-group">
                <label>Service Type</label>
                <select
                  value={bookingForm.serviceType}
                  onChange={(e) => handleBookingFormChange('serviceType', e.target.value)}
                  required
                >
                  <option value="">Select service type</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Project Description</label>
                <textarea
                  value={bookingForm.description}
                  onChange={(e) => handleBookingFormChange('description', e.target.value)}
                  placeholder="Describe your project, requirements, and vision..."
                  rows="5"
                  required
                />
              </div>

              <div className="form-group">
                <label>Budget (₹)</label>
                <input
                  type="number"
                  value={bookingForm.budget}
                  onChange={(e) => handleBookingFormChange('budget', e.target.value)}
                  placeholder="Enter your budget"
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label>Timeline</label>
                <input
                  type="text"
                  value={bookingForm.timeline}
                  onChange={(e) => handleBookingFormChange('timeline', e.target.value)}
                  placeholder="e.g., 2 weeks, 1 month"
                  required
                />
              </div>

              <button type="submit" className="booking-submit-btn">
                Send Booking Request
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (selectedLimitedWork) {
    return (
      <div className="customer-product-view">
        <Navbar onProfileClick={onProfileClick} />

        <div className="limited-details">
          <button className="btn-back" onClick={() => setSelectedLimitedWork(null)}>
            ← Back to Limited Works
          </button>

          <div className="limited-details-card">
            <div className="limited-details-header">
              <h2>{selectedLimitedWork.title}</h2>
              <span className="limited-type-badge">
                {selectedLimitedWork.workType.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="limited-details-body">
              <p className="limited-description">{selectedLimitedWork.description}</p>

              <div className="limited-meta">
                <div>
                  <strong>Artist:</strong>{' '}
                  {selectedLimitedWork.artistInfo?.name || selectedLimitedWork.vendorName}
                </div>
                {selectedLimitedWork.isLimited && selectedLimitedWork.editionLimit && (
                  <div>
                    <strong>Edition Size:</strong> {selectedLimitedWork.editionLimit}
                  </div>
                )}
                <div>
                  <strong>Price:</strong> ₹{selectedLimitedWork.price.toLocaleString('en-IN')}
                </div>
                {selectedLimitedWork.certificationInfo && (
                  <div>
                    <strong>Certification:</strong> {selectedLimitedWork.certificationInfo}
                  </div>
                )}
              </div>

              {selectedLimitedWork.preOrderCounts?.remaining !== null && (
                <div className="limited-availability">
                  Remaining Editions: {selectedLimitedWork.preOrderCounts.remaining}
                </div>
              )}

              <button
                className="limited-preorder-btn"
                onClick={() => handleRequestPreOrder(selectedLimitedWork._id)}
              >
                Request Pre-Order
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-product-view">
      <Navbar 
        onProfileClick={onProfileClick}
      />
      
      {/* Tab Navigation - All 3 Categories */}
      <div className="tab-container">
        {CATEGORIES.map(category => (
          <button
            key={category}
            className={`tab-button ${activeTab === category ? 'active' : ''}`}
            onClick={() => setActiveTab(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Page Title */}
      <div className="page-header">
        <h1>View {activeTab}</h1>
        <p>
          {activeTab === 'Limited & Signature Works'
            ? 'Explore exclusive limited edition and signature works'
            : `Explore our collection of ${activeTab.toLowerCase()}`}
        </p>
      </div>

      {/* Loading State */}
      {activeTab !== 'Limited & Signature Works' && loading && (
        <div className="loading-state">
          <p>Loading products...</p>
        </div>
      )}

      {activeTab === 'Limited & Signature Works' && limitedLoading && (
        <div className="loading-state">
          <p>Loading limited works...</p>
        </div>
      )}

      {/* Error State */}
      {activeTab !== 'Limited & Signature Works' && error && !loading && (
        <div className="error-state">
          <p>⚠️ {error}</p>
          <button onClick={fetchProducts} className="retry-button">
            Retry
          </button>
        </div>
      )}

      {activeTab === 'Limited & Signature Works' && limitedError && !limitedLoading && (
        <div className="error-state">
          <p>⚠️ {limitedError}</p>
          <button onClick={fetchLimitedWorks} className="retry-button">
            Retry
          </button>
        </div>
      )}

      {/* Products Grid */}
      {activeTab !== 'Limited & Signature Works' && !loading && !error && (
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <div key={product.id} className="product-card" onClick={() => setSelectedProductId(product.id)}>
              
              {/* Category & SubCategory Badge */}
              <div className="category-badge">
                {product.category} - {product.subCategory}
              </div>

              {/* Product Name */}
              <h3 className="product-name">{product.name}</h3>

              {/* Vendor Name */}
              <p className="vendor-name">By {product.vendorName}</p>

              {/* Description */}
              <p className="product-description">
                {product.description?.substring(0, 100)}
                {product.description?.length > 100 ? '...' : ''}
              </p>

              {/* Price */}
              <div className="product-price">
                ₹{product.price.toLocaleString('en-IN')}
              </div>

              {/* Action Button - based on productType */}
              <button
                className={`action-button ${product.productType === 'DIGITAL' ? 'digital' : 'physical'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedProductId(product.id);
                }}
              >
                {product.productType === 'DIGITAL' ? 'Buy & Download' : 'View Details'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Limited Works Grid */}
      {activeTab === 'Limited & Signature Works' && !limitedLoading && !limitedError && (
        <div className="products-grid">
          {limitedWorks.map((work) => (
            <div key={work._id} className="product-card" onClick={() => setSelectedLimitedWork(work)}>
              <div className="category-badge">
                Limited & Signature Works
              </div>
              <h3 className="product-name">{work.title}</h3>
              <p className="vendor-name">By {work.artistInfo?.name || work.vendorName}</p>
              <p className="product-description">
                {work.description?.substring(0, 100)}
                {work.description?.length > 100 ? '...' : ''}
              </p>
              <div className="product-price">
                ₹{work.price.toLocaleString('en-IN')}
              </div>
              <button
                className="action-button physical"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedLimitedWork(work);
                }}
              >
                Request Pre-Order
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Professional Services Grid */}
      {activeTab === 'Professional Services' && !servicesLoading && !servicesError && (
        <div className="professional-services-grid">
          {services.map((service) => (
            <div key={service.id} className="service-card">
              <div className="service-name">{service.name}</div>
              <button
                className="service-book-btn"
                onClick={() => {
                  setSelectedService(service);
                  setBookingForm({ serviceType: service.id, description: '', budget: '', timeline: '' });
                }}
              >
                Book Service
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Professional Services' && servicesLoading && (
        <div className="loading-state">
          <p>Loading professional services...</p>
        </div>
      )}

      {activeTab === 'Professional Services' && servicesError && !servicesLoading && (
        <div className="error-state">
          <p>⚠️ {servicesError}</p>
          <button onClick={fetchProfessionalServices} className="retry-button">
            Retry
          </button>
        </div>
      )}

      {activeTab === 'Professional Services' && !servicesLoading && services.length === 0 && !servicesError && (
        <div className="no-products">
          <h2>No Professional Services Available</h2>
          <p>Check back soon for professional art services.</p>
        </div>
      )}

      {/* No Products Message */}
      {activeTab !== 'Limited & Signature Works' && !loading && filteredProducts.length === 0 && !error && (
        <div className="no-products">
          <h2>No Products Found</h2>
          <p>Check back soon for more products in this category.</p>
        </div>
      )}

      {activeTab === 'Limited & Signature Works' && !limitedLoading && limitedWorks.length === 0 && !limitedError && (
        <div className="no-products">
          <h2>No Limited Works Found</h2>
          <p>Check back soon for exclusive limited and signature works.</p>
        </div>
      )}
    </div>
  );
}

export default CustomerProductView;
