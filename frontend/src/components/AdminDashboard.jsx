import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import AnalyticsDashboard from './AnalyticsDashboard';
import '../styles/AdminDashboard.css';
import API_URL from '../config/api';

function AdminDashboard({ onLogout }) {
  const { user, token } = useAuth();
  const [activeMenu, setActiveMenu] = useState('profile');
  const [vendors, setVendors] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newCategoryForm, setNewCategoryForm] = useState({
    name: '',
    mainCategory: 'Physical Art',
    productType: 'PHYSICAL',
  });
  const [categoryError, setCategoryError] = useState('');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [commissionData, setCommissionData] = useState(null);
  const [vendorCommissionSummary, setVendorCommissionSummary] = useState([]);
  const [adminCommission, setAdminCommission] = useState(null);
  const [digitalAssets, setDigitalAssets] = useState([]);
  const [downloadLogs, setDownloadLogs] = useState([]);
  const [limitedWorks, setLimitedWorks] = useState([]);
  const [pendingLimitedWorks, setPendingLimitedWorks] = useState([]);
  const [professionalBookings, setProfessionalBookings] = useState([]);

  // Fetch all data on mount
  useEffect(() => {
    fetchAllData();
  }, [token]);

  const fetchAllData = async () => {
    await Promise.all([
      fetchVendors(),
      fetchCustomers(),
      fetchProducts(),
      fetchOrders(),
      fetchCategories(),
      fetchServices(),
      fetchLimitedWorks(),
      fetchPendingLimitedWorks(),
      fetchProfessionalBookings(),
      fetchCommissionData(),
      fetchVendorCommissionSummary(),
      fetchAdminCommission(),
      fetchDigitalAssets(),
    ]);
  };

  const fetchVendors = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/vendors`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setVendors(data.vendors || []);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setVendors([]);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/customers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setCustomers(data.customers || []);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/admin/products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        const serviceProducts = data.products?.filter(p => p.productType === 'SERVICE') || [];
        setServices(serviceProducts);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
    }
  };

  const fetchLimitedWorks = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/limited-works`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setLimitedWorks(data.works || []);
      }
    } catch (error) {
      console.error('Error fetching limited works:', error);
      setLimitedWorks([]);
    }
  };

  const fetchPendingLimitedWorks = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/limited-works/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setPendingLimitedWorks(data.works || []);
      }
    } catch (error) {
      console.error('Error fetching pending limited works:', error);
      setPendingLimitedWorks([]);
    }
  };

  const handleApproveLimitedWork = async (workId) => {
    try {
      const response = await fetch(`${API_URL}/admin/limited-works/${workId}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        fetchPendingLimitedWorks();
        fetchLimitedWorks();
      } else {
        alert(data.message || 'Failed to approve limited work');
      }
    } catch (error) {
      console.error('Error approving limited work:', error);
      alert('Failed to approve limited work');
    }
  };

  const handleRejectLimitedWork = async (workId) => {
    try {
      const response = await fetch(`${API_URL}/admin/limited-works/${workId}/reject`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        fetchPendingLimitedWorks();
        fetchLimitedWorks();
      } else {
        alert(data.message || 'Failed to reject limited work');
      }
    } catch (error) {
      console.error('Error rejecting limited work:', error);
      alert('Failed to reject limited work');
    }
  };

  const fetchProfessionalBookings = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/professional-bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setProfessionalBookings(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching professional bookings:', error);
      setProfessionalBookings([]);
    }
  };

  const fetchCommissionData = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/commission`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setCommissionData(data);
      }
    } catch (error) {
      console.error('Error fetching commission data:', error);
    }
  };

  const fetchVendorCommissionSummary = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/commission/vendor-summary`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setVendorCommissionSummary(data.vendorSummary || []);
      }
    } catch (error) {
      console.error('Error fetching vendor commission summary:', error);
    }
  };

  const fetchAdminCommission = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/commission`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setAdminCommission(data);
      }
    } catch (error) {
      console.error('Error fetching admin commission:', error);
    }
  };

  const settleCommission = async (orderId) => {
    if (!window.confirm('Are you sure you want to settle this commission?')) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/admin/commission/settle/${orderId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        alert('Commission settled successfully');
        await fetchVendorCommissionSummary();
        await fetchAdminCommission();
        await fetchOrders();
      } else {
        alert('Error settling commission: ' + data.message);
      }
    } catch (error) {
      console.error('Error settling commission:', error);
      alert('Error settling commission');
    }
  };

  const fetchDigitalAssets = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/digital-assets`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setDigitalAssets(data.assets || []);
      }
    } catch (error) {
      console.error('Error fetching digital assets:', error);
    }
  };

  const fetchDownloadLogs = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/download-logs?limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setDownloadLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Error fetching download logs:', error);
    }
  };

  const toggleAssetAccess = async (productId, currentStatus) => {
    const action = currentStatus ? 'disable' : 'enable';
    if (!window.confirm(`Are you sure you want to ${action} this digital asset?`)) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/admin/digital-assets/${productId}/toggle`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        await fetchDigitalAssets();
      } else {
        alert('Error toggling asset: ' + data.message);
      }
    } catch (error) {
      console.error('Error toggling asset access:', error);
      alert('Error toggling asset access');
    }
  };

  // Analytics data
  const monthlyRevenue = [
    { month: 'Jan', revenue: 125000 },
    { month: 'Feb', revenue: 185000 },
    { month: 'Mar', revenue: 220000 },
    { month: 'Apr', revenue: 195000 },
    { month: 'May', revenue: 280000 },
    { month: 'Jun', revenue: 320000 },
  ];

  // Get unique main categories
  const mainCategoriesList = [...new Set(categories.map(c => c.mainCategory))];
  const categoryData = mainCategoriesList.map(cat => ({
    name: cat,
    value: products.filter(p => p.category === cat).length,
  })).filter(c => c.value > 0);

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe'];

  // Revenue calculations from real orders
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const commission = totalRevenue * 0.1; // 10% commission
  const vendorPayout = totalRevenue - commission;

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      onLogout();
    }
  };

  // Handle adding a new category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    setCategoryError('');

    if (!newCategoryForm.name.trim()) {
      setCategoryError('Category name is required');
      return;
    }

    // Auto-set productType based on mainCategory
    let productType = newCategoryForm.productType;
    if (newCategoryForm.mainCategory === 'Digital Art') {
      productType = 'DIGITAL';
    }

    try {
      const response = await fetch(`${API_URL}/admin/categories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCategoryForm.name.trim(),
          mainCategory: newCategoryForm.mainCategory,
          productType: productType,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchCategories();
        setNewCategoryForm({
          name: '',
          mainCategory: 'Physical Art',
          productType: 'PHYSICAL',
        });
        alert('Category added successfully!');
      } else {
        setCategoryError(data.message || 'Failed to add category');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      setCategoryError('Failed to add category');
    }
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (!confirm(`Are you sure you want to delete "${categoryName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        await fetchCategories();
        alert('Category deleted successfully');
      } else {
        alert(data.message || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  };

  // Vendor management handlers
  const handleApprove = async (vendorId) => {
    try {
      const response = await fetch(`${API_URL}/admin/vendor/approve/${vendorId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        // Refresh vendors list
        await fetchVendors();
      }
    } catch (error) {
      console.error('Error approving vendor:', error);
    }
  };

  const handleReject = async (vendorId) => {
    try {
      const response = await fetch(`${API_URL}/admin/vendor/reject/${vendorId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        // Refresh vendors list
        await fetchVendors();
      }
    } catch (error) {
      console.error('Error rejecting vendor:', error);
    }
  };

  const handleViewProfile = (vendor) => {
    setSelectedVendor(vendor);
  };

  const handleBackToVendorList = () => {
    setSelectedVendor(null);
  };

  // Render content based on active menu
  const renderContent = () => {
    switch (activeMenu) {
      case 'profile':
        return (
          <div className="content-section">
            <h2>Admin Profile</h2>
            <div className="profile-card">
              <div className="profile-item">
                <label>Admin Name</label>
                <p className="profile-value">{user?.name || 'Loading...'}</p>
              </div>
              <div className="profile-item">
                <label>Email</label>
                <p className="profile-value">{user?.email || 'Loading...'}</p>
              </div>
              <div className="profile-item">
                <label>Role</label>
                <p className="profile-value admin-badge">Admin</p>
              </div>
              <div className="profile-item">
                <label>Member Since</label>
                <p className="profile-value">February 2026</p>
              </div>
            </div>
          </div>
        );

      case 'vendors':
        if (selectedVendor) {
          return (
            <div className="content-section">
              <button className="btn-back" onClick={handleBackToVendorList}>
                ← Back to Vendor List
              </button>
              <h2>Vendor Profile</h2>
              <div className="vendor-profile-card">
                <div className="profile-item">
                  <label>Vendor Name</label>
                  <p className="profile-value">{selectedVendor.name}</p>
                </div>
                <div className="profile-item">
                  <label>Email</label>
                  <p className="profile-value">{selectedVendor.email}</p>
                </div>
                <div className="profile-item">
                  <label>Role</label>
                  <p className="profile-value vendor-badge">Vendor</p>
                </div>
                <div className="profile-item">
                  <label>Status</label>
                  <p className="profile-value">
                    <span className={`status-badge ${selectedVendor.status.toLowerCase()}`}>
                      {selectedVendor.status}
                    </span>
                  </p>
                </div>
                <div className="profile-item">
                  <label>Total Products</label>
                  <p className="profile-value">
                    <span className="badge-count">{selectedVendor.totalProducts}</span>
                  </p>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div className="content-section">
            <h2>Vendor Management ({vendors.length})</h2>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Vendor Name</th>
                    <th>Email</th>
                    <th>Total Products</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map(vendor => (
                    <tr key={vendor.id}>
                      <td>{vendor.name}</td>
                      <td>{vendor.email}</td>
                      <td>
                        <span className="badge-count">{vendor.totalProducts}</span>
                      </td>
                      <td>
                        <span className={`status-badge ${vendor.status.toLowerCase()}`}>
                          {vendor.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {vendor.status !== 'Approved' && (
                            <button 
                              className="btn-approve"
                              onClick={() => handleApprove(vendor.id)}
                            >
                              Approve
                            </button>
                          )}
                          {vendor.status !== 'Rejected' && (
                            <button 
                              className="btn-reject"
                              onClick={() => handleReject(vendor.id)}
                            >
                              Reject
                            </button>
                          )}
                          <button 
                            className="btn-view"
                            onClick={() => handleViewProfile(vendor)}
                          >
                            View Profile
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'customers':
        return (
          <div className="content-section">
            <h2>All Customers ({customers.length})</h2>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Email</th>
                    <th>Total Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map(customer => (
                    <tr key={customer.id}>
                      <td>{customer.name}</td>
                      <td>{customer.email}</td>
                      <td>
                        <span className="badge-count">{customer.totalOrders}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'products':
        return (
          <div className="content-section">
            <h2>All Products ({products.length})</h2>
            <div className="products-grid">
              {products.length > 0 ? (
                products.map(product => (
                  <div key={product._id || product.id} className="product-card-admin">
                    <div className="product-info">
                      <h3>{product.name}</h3>
                      <p className="product-category">{product.category}</p>
                      <p className="product-price">₹{product.price}</p>
                      <p className="product-description">{product.description?.substring(0, 80)}...</p>
                      <p className="product-vendor">{product.vendorName || 'Unknown Vendor'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data">
                  <p>No products found in the system.</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'categories':
        return (
          <div className="content-section">
            <h2>Category Management</h2>

            <div className="category-container">
              {/* Add Category Form */}
              <div className="add-category-card">
                <h3>Add New Category</h3>
                <form onSubmit={handleAddCategory} className="category-form">
                  <div className="form-group">
                    <label htmlFor="categoryName">Category Name</label>
                    <input
                      id="categoryName"
                      type="text"
                      placeholder="e.g., Paintings, Digital Illustrations, T-shirts"
                      value={newCategoryForm.name}
                      onChange={(e) => setNewCategoryForm({ ...newCategoryForm, name: e.target.value })}
                      className="category-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="mainCategory">Main Category</label>
                    <select
                      id="mainCategory"
                      value={newCategoryForm.mainCategory}
                      onChange={(e) => {
                        const mainCat = e.target.value;
                        let newType = 'PHYSICAL';
                        if (mainCat === 'Digital Art') newType = 'DIGITAL';
                        if (mainCat === 'Services') newType = 'SERVICE';
                        setNewCategoryForm({
                          ...newCategoryForm,
                          mainCategory: mainCat,
                          productType: newType
                        });
                      }}
                      className="category-input"
                    >
                      <option value="Physical Art">Physical Art</option>
                      <option value="Merchandise">Merchandise</option>
                      <option value="Digital Art">Digital Art</option>
                      <option value="Services">Services</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="productType">Product Type</label>
                    <select
                      id="productType"
                      value={newCategoryForm.productType}
                      onChange={(e) => setNewCategoryForm({ ...newCategoryForm, productType: e.target.value })}
                      className="category-input"
                      disabled={newCategoryForm.mainCategory === 'Digital Art' || newCategoryForm.mainCategory === 'Services'}
                    >
                      <option value="PHYSICAL">Physical (Shippable)</option>
                      <option value="DIGITAL">Digital (Instant Download)</option>
                      <option value="SERVICE">Service (Booking)</option>
                    </select>
                    {newCategoryForm.mainCategory === 'Digital Art' && (
                      <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
                        Digital Art categories must be DIGITAL type
                      </small>
                    )}
                    {newCategoryForm.mainCategory === 'Services' && (
                      <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
                        Services categories must be SERVICE type
                      </small>
                    )}
                  </div>

                  {categoryError && (
                    <div className="error-message-category">
                      {categoryError}
                    </div>
                  )}

                  <button type="submit" className="btn-add-category">
                    + Add Category
                  </button>
                </form>
              </div>

              {/* Categories List */}
              <div className="categories-list-card">
                <h3>All Categories ({categories.length})</h3>
                <div className="categories-grid">
                  {categories.length > 0 ? (
                    categories.map(category => (
                      <div key={category._id} className="category-item">
                        <div className="category-name">
                          <span><strong>{category.name}</strong></span>
                          <small style={{ color: '#666', display: 'block' }}>
                            {category.mainCategory} • {category.productType}
                          </small>
                        </div>
                        <div className="category-actions">
                          <span className={`status-badge ${category.status === 'Active' ? 'active' : 'inactive'}`}>
                            {category.status}
                          </span>
                          <button
                            onClick={() => handleDeleteCategory(category._id, category.name)}
                            className="btn-delete-small"
                            title="Delete category"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-data">
                      <p>No categories added yet. Create your first category above.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'services':
        return (
          <div className="content-section">
            <h2>Services Management ({services.length})</h2>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Service Name</th>
                    <th>Category</th>
                    <th>Vendor</th>
                    <th>Price</th>
                    <th>Booking Type</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {services.length > 0 ? (
                    services.map(service => (
                      <tr key={service._id || service.id}>
                        <td>
                          <strong>{service.name}</strong>
                        </td>
                        <td>{service.category || 'Services'}</td>
                        <td>{service.vendorName || 'Unknown Vendor'}</td>
                        <td>₹{service.price?.toLocaleString()}</td>
                        <td>
                          <span className="badge-service">Session-based</span>
                        </td>
                        <td>
                          <span className="status-badge active">Active</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                        No services found in the system.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f4f8', borderRadius: '6px' }}>
              <h4 style={{ margin: '0 0 10px 0' }}>📌 Service Types Available:</h4>
              <ul style={{ margin: '0', paddingLeft: '20px', color: '#555', fontSize: '14px' }}>
                <li>Workshops & Training</li>
                <li>Custom Art Commissions</li>
                <li>Styling Consultations</li>
                <li>Other Service-Based Offerings</li>
              </ul>
            </div>
          </div>
        );

      case 'limited-works':
        return (
          <div className="content-section">
            <h2>Limited & Signature Works</h2>

            <div className="table-container" style={{ marginBottom: '24px' }}>
              <h3 style={{ padding: '16px 16px 0' }}>Pending Approvals ({pendingLimitedWorks.length})</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Vendor</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingLimitedWorks.length > 0 ? (
                    pendingLimitedWorks.map((work) => (
                      <tr key={work._id}>
                        <td>{work.title}</td>
                        <td>{work.workType.replace(/_/g, ' ')}</td>
                        <td>{work.vendorName}</td>
                        <td>₹{work.price?.toLocaleString('en-IN')}</td>
                        <td>
                          <div className="action-buttons">
                            <button className="btn-approve" onClick={() => handleApproveLimitedWork(work._id)}>
                              Approve
                            </button>
                            <button className="btn-reject" onClick={() => handleRejectLimitedWork(work._id)}>
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                        No pending approvals.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="table-container">
              <h3 style={{ padding: '16px 16px 0' }}>All Limited Works ({limitedWorks.length})</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Vendor</th>
                    <th>Status</th>
                    <th>Edition Limit</th>
                    <th>Remaining</th>
                  </tr>
                </thead>
                <tbody>
                  {limitedWorks.length > 0 ? (
                    limitedWorks.map((work) => (
                      <tr key={work._id}>
                        <td>{work.title}</td>
                        <td>{work.workType.replace(/_/g, ' ')}</td>
                        <td>{work.vendorName}</td>
                        <td>
                          <span className={`status-badge ${work.adminStatus?.toLowerCase() || 'pending'}`}>
                            {work.adminStatus || 'PENDING'}
                          </span>
                        </td>
                        <td>{work.isLimited ? work.editionLimit || '-' : 'N/A'}</td>
                        <td>
                          {work.isLimited
                            ? (work.preOrderCounts?.remaining ?? work.editionLimit)
                            : 'N/A'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                        No limited works found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'orders':
        return (
          <div className="content-section">
            <h2>Orders Management ({orders.length})</h2>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer Name</th>
                    <th>Products</th>
                    <th>Total Amount</th>
                    <th>Payment Method</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order._id}>
                      <td>
                        <span className="order-id">{order._id.substring(0, 8)}</span>
                      </td>
                      <td>{order.customerName}</td>
                      <td>{order.products?.length || 0} item(s)</td>
                      <td>₹{order.totalAmount}</td>
                      <td>{order.paymentMethod}</td>
                      <td>
                        <span className={`order-status ${order.orderStatus?.toLowerCase()}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'commission':
        return (
          <div className="content-section">
            <h2>Commission & Revenue Management</h2>
            
            {/* Summary Cards */}
            <div className="revenue-cards">
              <div className="revenue-card">
                <div className="revenue-header">
                  <h3>Total Platform Revenue</h3>
                  <span className="revenue-icon">💰</span>
                </div>
                <p className="revenue-amount">₹{totalRevenue.toLocaleString('en-IN')}</p>
                <p className="revenue-description">Total revenue from all transactions</p>
              </div>

              <div className="revenue-card commission">
                <div className="revenue-header">
                  <h3>Total Commission (10%)</h3>
                  <span className="revenue-icon">📊</span>
                </div>
                <p className="revenue-amount">₹{commission.toLocaleString('en-IN')}</p>
                <p className="revenue-description">Calculated at 10% of platform revenue</p>
              </div>

              <div className="revenue-card payout">
                <div className="revenue-header">
                  <h3>Total Vendor Payout</h3>
                  <span className="revenue-icon">💳</span>
                </div>
                <p className="revenue-amount">₹{vendorPayout.toLocaleString('en-IN')}</p>
                <p className="revenue-description">After deducting commission</p>
              </div>
            </div>

            {/* Vendor-wise Commission Summary */}
            <div className="commission-section">
              <h3>Vendor-wise Commission Summary</h3>
              {vendorCommissionSummary.length > 0 ? (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Vendor Name</th>
                        <th>Total Sales</th>
                        <th>Commission (10%)</th>
                        <th>Vendor Earning</th>
                        <th>Total Orders</th>
                        <th>Settled Orders</th>
                        <th>Pending Orders</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendorCommissionSummary.map((vendor) => (
                        <tr key={vendor.vendorId}>
                          <td>{vendor.vendorName}</td>
                          <td>₹{parseFloat(vendor.totalSales).toLocaleString('en-IN')}</td>
                          <td>₹{parseFloat(vendor.totalCommission).toLocaleString('en-IN')}</td>
                          <td className="vendor-earning">₹{parseFloat(vendor.totalEarnings).toLocaleString('en-IN')}</td>
                          <td>{vendor.ordersCount}</td>
                          <td><span className="badge-success">{vendor.settledOrders}</span></td>
                          <td><span className="badge-warning">{vendor.pendingOrders}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="no-data">No vendor commission data available</p>
              )}
            </div>

            {/* Pending Commission Settlement */}
            <div className="commission-section">
              <h3>Pending Commission Settlement</h3>
              {orders && orders.length > 0 && orders.some(order => order.commissionStatus !== 'SETTLED') ? (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Vendor Name</th>
                        <th>Order Amount</th>
                        <th>Commission (10%)</th>
                        <th>Vendor Earning</th>
                        <th>Status</th>
                        <th>Payment Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders
                        .filter(order => order.commissionStatus !== 'SETTLED' && order.paymentStatus === 'PAID')
                        .map((order) => (
                          <tr key={order._id}>
                            <td>{order._id.substring(0, 8)}...</td>
                            <td>{order.vendorName || 'Multiple Vendors'}</td>
                            <td>₹{parseFloat(order.totalAmount).toLocaleString('en-IN')}</td>
                            <td>₹{parseFloat(order.commissionAmount || order.totalAmount * 0.1).toLocaleString('en-IN')}</td>
                            <td>₹{parseFloat(order.vendorEarning || order.totalAmount * 0.9).toLocaleString('en-IN')}</td>
                            <td>
                              <span className="badge-warning">
                                {order.commissionStatus || 'CALCULATED'}
                              </span>
                            </td>
                            <td>
                              <span className="badge-success">
                                {order.paymentStatus}
                              </span>
                            </td>
                            <td>
                              <button
                                className="btn-settle"
                                onClick={() => settleCommission(order._id)}
                              >
                                Settle
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="no-data">All commissions have been settled</p>
              )}
            </div>

            <div className="commission-note">
              <h4>📌 Commission Structure</h4>
              <p>
                Commission is calculated during order processing. A <strong>10% commission</strong> is deducted
                from the total revenue. The remaining amount is paid out to vendors based on their sales.
                Admins can track and settle commissions to ensure transparent payment tracking.
              </p>
            </div>
          </div>
        );

      case 'analytics':
        return <AnalyticsDashboard />;

      case 'digital-assets':
        return (
          <div className="content-section">
            <h2>Digital Assets Management</h2>

            {/* Summary Cards */}
            <div className="digital-assets-summary">
              <div className="summary-card">
                <div className="summary-icon">💾</div>
                <div className="summary-content">
                  <h3>{digitalAssets.length}</h3>
                  <p>Total Digital Products</p>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon">✅</div>
                <div className="summary-content">
                  <h3>{digitalAssets.filter(a => a.isAssetEnabled).length}</h3>
                  <p>Active Assets</p>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon">🚫</div>
                <div className="summary-content">
                  <h3>{digitalAssets.filter(a => !a.isAssetEnabled).length}</h3>
                  <p>Disabled Assets</p>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon">📥</div>
                <div className="summary-content">
                  <h3>{digitalAssets.reduce((sum, a) => sum + (a.totalDownloads || 0), 0)}</h3>
                  <p>Total Downloads</p>
                </div>
              </div>
            </div>

            {/* Digital Assets Table */}
            <div className="assets-section">
              <div className="section-header">
                <h3>📦 All Digital Products</h3>
                <button 
                  className="btn-refresh" 
                  onClick={() => { fetchDigitalAssets(); fetchDownloadLogs(); }}
                >
                  🔄 Refresh
                </button>
              </div>
              
              {digitalAssets.length > 0 ? (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Vendor</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Purchases</th>
                        <th>Downloads</th>
                        <th>Blocked</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {digitalAssets.map((asset) => (
                        <tr key={asset._id}>
                          <td>
                            <div className="product-info-cell">
                              {asset.images && asset.images[0] && (
                                <img 
                                  src={asset.images[0]} 
                                  alt={asset.name} 
                                  className="product-thumbnail"
                                />
                              )}
                              <span className="product-name">{asset.name}</span>
                            </div>
                          </td>
                          <td>{asset.vendorName}</td>
                          <td>
                            <div className="category-cell">
                              <div>{asset.category}</div>
                              <small>{asset.subCategory}</small>
                            </div>
                          </td>
                          <td>₹{parseFloat(asset.price).toLocaleString('en-IN')}</td>
                          <td>
                            <span className="badge-count">{asset.totalPurchases || 0}</span>
                          </td>
                          <td>
                            <span className="badge-success">{asset.totalDownloads || 0}</span>
                          </td>
                          <td>
                            {asset.blockedAttempts > 0 && (
                              <span className="badge-error">{asset.blockedAttempts}</span>
                            )}
                          </td>
                          <td>
                            <span className={`status-badge ${asset.isAssetEnabled ? 'approved' : 'rejected'}`}>
                              {asset.isAssetEnabled ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td>
                            <button
                              className={`btn-toggle ${asset.isAssetEnabled ? 'btn-disable' : 'btn-enable'}`}
                              onClick={() => toggleAssetAccess(asset._id, asset.isAssetEnabled)}
                            >
                              {asset.isAssetEnabled ? '🚫 Disable' : '✅ Enable'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="no-data">No digital products found</p>
              )}
            </div>

            {/* Download Logs Section */}
            <div className="logs-section">
              <div className="section-header">
                <h3>📊 Recent Download Activity</h3>
                <button 
                  className="btn-view-logs" 
                  onClick={fetchDownloadLogs}
                >
                  View Logs
                </button>
              </div>

              {downloadLogs.length > 0 && (
                <div className="table-container">
                  <table className="data-table logs-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Customer</th>
                        <th>Status</th>
                        <th>Downloaded At</th>
                        <th>IP Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {downloadLogs.slice(0, 20).map((log, idx) => (
                        <tr key={idx}>
                          <td>{log.productName}</td>
                          <td>{log.customerName}</td>
                          <td>
                            <span className={`status-badge ${
                              log.status === 'SUCCESS' ? 'approved' : 
                              log.status === 'BLOCKED' ? 'rejected' : 'pending'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td>{new Date(log.downloadedAt).toLocaleString('en-IN')}</td>
                          <td><code>{log.ipAddress || 'N/A'}</code></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Security Notice */}
            <div className="security-notice">
              <h4>🔒 Digital Asset Security</h4>
              <ul>
                <li>✅ All downloads are verified against paid orders</li>
                <li>✅ Direct file URLs are never exposed to unauthorized users</li>
                <li>✅ Disabled assets cannot be downloaded even by authorized customers</li>
                <li>✅ All download attempts are logged with IP addresses</li>
                <li>⚠️ Disable assets only for policy violations or security concerns</li>
              </ul>
            </div>
          </div>
        );

      case 'professional-bookings':
        return (
          <div className="content-section">
            <h2>Professional Service Bookings ({professionalBookings.length})</h2>

            {professionalBookings.length === 0 ? (
              <div className="empty-state">
                <p>No professional service bookings yet.</p>
              </div>
            ) : (
              <>
                {/* Statistics Summary */}
                <div className="admin-stats">
                  <div className="stat-card">
                    <h4>Total Bookings</h4>
                    <p className="stat-number">{professionalBookings.length}</p>
                  </div>
                  <div className="stat-card">
                    <h4>Pending Approval</h4>
                    <p className="stat-number">{professionalBookings.filter(b => b.status === 'PENDING_VENDOR_APPROVAL').length}</p>
                  </div>
                  <div className="stat-card">
                    <h4>Accepted</h4>
                    <p className="stat-number">{professionalBookings.filter(b => b.status === 'ACCEPTED').length}</p>
                  </div>
                  <div className="stat-card">
                    <h4>In Progress</h4>
                    <p className="stat-number">{professionalBookings.filter(b => b.status === 'IN_PROGRESS').length}</p>
                  </div>
                  <div className="stat-card">
                    <h4>Completed</h4>
                    <p className="stat-number">{professionalBookings.filter(b => b.status === 'COMPLETED').length}</p>
                  </div>
                </div>

                {/* Bookings Table */}
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Service Type</th>
                        <th>Description</th>
                        <th>Budget</th>
                        <th>Vendor</th>
                        <th>Status</th>
                        <th>Proposed Price</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {professionalBookings.map((booking) => (
                        <tr key={booking._id}>
                          <td>{booking.customerId?.name || booking.customerName}</td>
                          <td>{booking.serviceTypeName}</td>
                          <td>{booking.description.substring(0, 50)}...</td>
                          <td>₹{booking.budget?.toLocaleString('en-IN')}</td>
                          <td>{booking.vendorId?.name || booking.vendorName || '-'}</td>
                          <td>
                            <span className={`status-badge ${booking.status.toLowerCase().replace(/_/g, '-')}`}>
                              {booking.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td>{booking.proposedPrice ? `₹${booking.proposedPrice.toLocaleString('en-IN')}` : '-'}</td>
                          <td>{new Date(booking.createdAt).toLocaleDateString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="admin-dashboard">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>ArtVPP</h1>
          <p>Admin Panel</p>
        </div>

        <nav className="sidebar-menu">
          <button
            className={`menu-item ${activeMenu === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveMenu('profile')}
          >
            <span className="menu-icon">👤</span>
            <span className="menu-text">Admin Profile</span>
          </button>

          <button
            className={`menu-item ${activeMenu === 'vendors' ? 'active' : ''}`}
            onClick={() => setActiveMenu('vendors')}
          >
            <span className="menu-icon">🏪</span>
            <span className="menu-text">All Vendors</span>
          </button>

          <button
            className={`menu-item ${activeMenu === 'customers' ? 'active' : ''}`}
            onClick={() => setActiveMenu('customers')}
          >
            <span className="menu-icon">👥</span>
            <span className="menu-text">All Customers</span>
          </button>

          <button
            className={`menu-item ${activeMenu === 'products' ? 'active' : ''}`}
            onClick={() => setActiveMenu('products')}
          >
            <span className="menu-icon">🎨</span>
            <span className="menu-text">All Products</span>
          </button>

          <button
            className={`menu-item ${activeMenu === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveMenu('categories')}
          >
            <span className="menu-icon">🏷️</span>
            <span className="menu-text">Categories</span>
          </button>

          <button
            className={`menu-item ${activeMenu === 'services' ? 'active' : ''}`}
            onClick={() => setActiveMenu('services')}
          >
            <span className="menu-icon">🔧</span>
            <span className="menu-text">Services</span>
          </button>

          <button
            className={`menu-item ${activeMenu === 'limited-works' ? 'active' : ''}`}
            onClick={() => setActiveMenu('limited-works')}
          >
            <span className="menu-icon">🌟</span>
            <span className="menu-text">Limited Works</span>
          </button>

          <button
            className={`menu-item ${activeMenu === 'professional-bookings' ? 'active' : ''}`}
            onClick={() => setActiveMenu('professional-bookings')}
          >
            <span className="menu-icon">💼</span>
            <span className="menu-text">Professional Bookings</span>
          </button>

          <button
            className={`menu-item ${activeMenu === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveMenu('orders')}
          >
            <span className="menu-icon">📦</span>
            <span className="menu-text">Orders Management</span>
          </button>

          <button
            className={`menu-item ${activeMenu === 'commission' ? 'active' : ''}`}
            onClick={() => setActiveMenu('commission')}
          >
            <span className="menu-icon">💵</span>
            <span className="menu-text">Commission & Revenue</span>
          </button>

          <button
            className={`menu-item ${activeMenu === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveMenu('analytics')}
          >
            <span className="menu-icon">📈</span>
            <span className="menu-text">Analytics Dashboard</span>
          </button>

          <button
            className={`menu-item ${activeMenu === 'digital-assets' ? 'active' : ''}`}
            onClick={() => setActiveMenu('digital-assets')}
          >
            <span className="menu-icon">💾</span>
            <span className="menu-text">Digital Assets</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar">👤</div>
            <div className="user-name">{user?.name || 'Admin'}</div>
            <div className="user-email">{user?.email || 'admin@example.com'}</div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      {/* CONTENT AREA */}
      <main className="content-area">
        {loading && <div className="loading">Loading...</div>}
        {!loading && renderContent()}
      </main>
    </div>
  );
}

export default AdminDashboard;
