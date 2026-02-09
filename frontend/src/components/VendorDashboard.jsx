import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Invoice from './Invoice';
import '../styles/VendorDashboard.css';
import API_URL from '../config/api';

function VendorDashboard() {
  const { user, token, logout } = useAuth();
  const [activeMenu, setActiveMenu] = useState('profile');
  const [formData, setFormData] = useState({
    name: '',
    mainCategory: 'Physical Art',
    subCategory: '',
    price: '',
    description: '',
    productType: 'PHYSICAL',
  });
  const [digitalAssetFile, setDigitalAssetFile] = useState(null);
  const [digitalAssetUrl, setDigitalAssetUrl] = useState('');
  const [imageFiles, setImageFiles] = useState([]); // Store actual File objects
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [commissionData, setCommissionData] = useState(null);
  const [limitedWorks, setLimitedWorks] = useState([]);
  const [limitedPreOrders, setLimitedPreOrders] = useState([]);
  const [limitedWorkForm, setLimitedWorkForm] = useState({
    title: '',
    workType: 'LIMITED_PRINT',
    isLimited: true,
    editionLimit: '',
    price: '',
    description: '',
    certificationInfo: '',
    artistBio: '',
    imageUrls: '',
  });
  const [limitedLoading, setLimitedLoading] = useState(false);
  const [limitedError, setLimitedError] = useState('');
  const [professionalBookings, setProfessionalBookings] = useState([]);
  const [professionalLoading, setProfessionalLoading] = useState(false);
  const [professionalError, setProfessionalError] = useState('');

  // Fetch user profile on mount
  useEffect(() => {
    if (token) {
      fetchProfile();
      fetchCategories();
      fetchVendorProducts();
      fetchVendorOrders();
      fetchCommissionData();
      fetchLimitedWorks();
      fetchLimitedPreOrders();
      fetchProfessionalBookings();
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setProfileData({
          name: data.user.name,
          email: data.user.email,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMessage('Profile updated successfully!');
        setIsEditingProfile(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/vendor/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
        // Set first subcategory as default
        const firstPhysicalArtCategory = data.categories.find(c => c.mainCategory === 'Physical Art');
        if (firstPhysicalArtCategory) {
          setFormData(prev => ({
            ...prev,
            subCategory: firstPhysicalArtCategory.name,
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchVendorProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/vendor/products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/vendor/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchCommissionData = async () => {
    try {
      const response = await fetch(`${API_URL}/vendor/commission`, {
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

  const fetchLimitedWorks = async () => {
    try {
      setLimitedLoading(true);
      const response = await fetch(`${API_URL}/vendor/limited-works`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setLimitedWorks(data.works || []);
      } else {
        setLimitedError(data.message || 'Failed to load limited works');
      }
    } catch (error) {
      console.error('Error fetching limited works:', error);
      setLimitedError('Failed to load limited works');
    } finally {
      setLimitedLoading(false);
    }
  };

  const fetchLimitedPreOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/vendor/limited-works/preorders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setLimitedPreOrders(data.preOrders || []);
      }
    } catch (error) {
      console.error('Error fetching limited pre-orders:', error);
    }
  };

  const fetchLimitedPreOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/vendor/limited-works/preorders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setLimitedPreOrders(data.preOrders || []);
      }
    } catch (error) {
      console.error('Error fetching limited pre-orders:', error);
    }
  };

  const fetchProfessionalBookings = async () => {
    try {
      setProfessionalLoading(true);
      setProfessionalError('');

      const response = await fetch(`${API_URL}/vendor/professional-bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setProfessionalBookings(data.data || []);
      } else {
        setProfessionalError(data.message || 'Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Error fetching professional bookings:', error);
      setProfessionalError('Failed to load bookings');
    } finally {
      setProfessionalLoading(false);
    }
  };

  const handleAcceptBooking = async (bookingId, proposedPrice, deliveryDate, deliverables) => {
    try {
      const response = await fetch(`${API_URL}/vendor/professional-bookings/${bookingId}/accept`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposedPrice,
          deliveryDate,
          deliverables,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Booking accepted! Customer will be notified.');
        await fetchProfessionalBookings();
      } else {
        alert(data.message || 'Failed to accept booking');
      }
    } catch (error) {
      console.error('Error accepting booking:', error);
      alert('Failed to accept booking');
    }
  };

  const handleRejectBooking = async (bookingId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      const response = await fetch(`${API_URL}/vendor/professional-bookings/${bookingId}/reject`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Booking rejected. Customer will be notified.');
        await fetchProfessionalBookings();
      } else {
        alert(data.message || 'Failed to reject booking');
      }
    } catch (error) {
      console.error('Error rejecting booking:', error);
      alert('Failed to reject booking');
    }
  };

  const handleLimitedWorkSubmit = async (e) => {
    e.preventDefault();
    setLimitedError('');

    try {
      setLimitedLoading(true);
      const payload = {
        title: limitedWorkForm.title,
        description: limitedWorkForm.description,
        workType: limitedWorkForm.workType,
        isLimited: limitedWorkForm.isLimited,
        editionLimit: limitedWorkForm.isLimited ? Number(limitedWorkForm.editionLimit) : null,
        price: Number(limitedWorkForm.price),
        certificationInfo: limitedWorkForm.certificationInfo,
        artistBio: limitedWorkForm.artistBio,
        images: limitedWorkForm.imageUrls
          ? limitedWorkForm.imageUrls.split(',').map((url) => url.trim()).filter(Boolean)
          : [],
      };

      const response = await fetch(`${API_URL}/vendor/limited-works`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success) {
        alert(data.message || 'Limited work created successfully');
        setLimitedWorkForm({
          title: '',
          workType: 'LIMITED_PRINT',
          isLimited: true,
          editionLimit: '',
          price: '',
          description: '',
          certificationInfo: '',
          artistBio: '',
          imageUrls: '',
        });
        fetchLimitedWorks();
      } else {
        setLimitedError(data.message || 'Failed to create limited work');
      }
    } catch (error) {
      console.error('Error creating limited work:', error);
      setLimitedError('Failed to create limited work');
    } finally {
      setLimitedLoading(false);
    }
  };

  const handlePreOrderUpdate = async (preOrderId, status) => {
    try {
      const response = await fetch(`${API_URL}/vendor/preorders/${preOrderId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      if (data.success) {
        fetchLimitedPreOrders();
        fetchLimitedWorks();
      } else {
        alert(data.message || 'Failed to update pre-order');
      }
    } catch (error) {
      console.error('Error updating pre-order:', error);
      alert('Failed to update pre-order');
    }
  };

  const fetchInvoice = async (orderId) => {
    try {
      setLoadingInvoice(true);
      const response = await fetch(`${API_URL}/order/${orderId}/invoice`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setSelectedInvoice(data.invoice);
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
      alert('Failed to load invoice');
    } finally {
      setLoadingInvoice(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [];
    const newFiles = [];

    files.forEach((file, index) => {
      // Create preview URL for display
      const previewUrl = URL.createObjectURL(file);
      newImages.push({
        id: Date.now() + index,
        src: previewUrl,
        name: file.name,
      });
      newFiles.push(file);
    });

    setUploadedImages([...uploadedImages, ...newImages]);
    setImageFiles([...imageFiles, ...newFiles]);
  };

  const removeImage = (imageId) => {
    const imageIndex = uploadedImages.findIndex(img => img.id === imageId);
    if (imageIndex !== -1) {
      // Revoke object URL to prevent memory leak
      URL.revokeObjectURL(uploadedImages[imageIndex].src);
      
      const updatedImages = uploadedImages.filter(img => img.id !== imageId);
      const updatedFiles = imageFiles.filter((_, index) => index !== imageIndex);
      
      setUploadedImages(updatedImages);
      setImageFiles(updatedFiles);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mainCategory') {
      // When main category changes, set first subcategory of that main category
      const firstSubCategory = categories.find(c => c.mainCategory === value);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        subCategory: firstSubCategory ? firstSubCategory.name : '',
        productType: firstSubCategory ? firstSubCategory.productType : 'PHYSICAL',
      }));
    } else if (name === 'subCategory') {
      // When subcategory changes, update product type from category
      const selectedCategory = categories.find(c => c.name === value);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        productType: selectedCategory ? selectedCategory.productType : 'PHYSICAL',
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleDigitalAssetChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDigitalAssetFile(file);
    }
  };

  // Get subcategories for selected main category
  const getSubCategories = (mainCat) => {
    return categories.filter(c => c.mainCategory === mainCat);
  };

  // Get unique main categories
  const mainCategories = [...new Set(categories.map(c => c.mainCategory))];

  // Calculate analytics from real data
  const totalEarnings = orders.reduce((sum, order) => {
    // Calculate earnings from this vendor's products in the order
    const vendorEarnings = order.products
      .filter(p => p.vendorId === user?.id)
      .reduce((vendorSum, p) => vendorSum + p.price, 0);
    return sum + vendorEarnings;
  }, 0);

  // Category distribution from real products
  const categoryData = mainCategories.map(cat => ({
    name: cat,
    value: products.filter(p => p.category === cat).length,
  })).filter(c => c.value > 0);

  const COLORS = ['#667eea', '#764ba2', '#f093fb'];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.mainCategory || !formData.subCategory || !formData.price || !formData.description) {
      alert('Please fill all required fields');
      return;
    }

    // Validate digital asset for DIGITAL products
    if (formData.productType === 'DIGITAL' && !digitalAssetFile && !digitalAssetUrl) {
      alert('Digital products require a digital asset file or URL');
      return;
    }

    try {
      setLoading(true);
      
      // Create FormData for multipart/form-data upload
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('mainCategory', formData.mainCategory);
      formDataToSend.append('subCategory', formData.subCategory);
      formDataToSend.append('price', parseFloat(formData.price));
      formDataToSend.append('description', formData.description);
      formDataToSend.append('productType', formData.productType);
      
      // Append digital asset for DIGITAL products
      if (formData.productType === 'DIGITAL') {
        if (digitalAssetFile) {
          formDataToSend.append('digitalAsset', digitalAssetFile);
        } else if (digitalAssetUrl) {
          formDataToSend.append('digitalAssetUrl', digitalAssetUrl);
        }
      }
      
      // Append image files (OPTIONAL)
      imageFiles.forEach((file) => {
        formDataToSend.append('images', file);
      });

      const response = await fetch(`${API_URL}/vendor/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // DO NOT set Content-Type - browser will set it with boundary automatically
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(`Product "${data.product.name}" added successfully!`);
        await fetchVendorProducts();
        
        // Reset form
        const firstCategory = categories.find(c => c.mainCategory === 'Physical Art');
        setFormData({
          name: '',
          mainCategory: 'Physical Art',
          subCategory: firstCategory ? firstCategory.name : '',
          price: '',
          description: '',
          productType: firstCategory ? firstCategory.productType : 'PHYSICAL',
        });
        
        // Clean up image previews
        uploadedImages.forEach(img => URL.revokeObjectURL(img.src));
        setUploadedImages([]);
        setImageFiles([]);
        
        // Clear digital asset fields
        setDigitalAssetFile(null);
        setDigitalAssetUrl('');
        
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  // Placeholder image for products without images
  const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';

  // Render content based on active menu
  const renderContent = () => {
    switch (activeMenu) {
      case 'profile':
        return (
          <div className="content-section">
            <h2>Vendor Profile</h2>
            {successMessage && (
              <div className="success-message">{successMessage}</div>
            )}
            {!isEditingProfile ? (
              <div className="profile-card">
                <div className="profile-item">
                  <label>Vendor Name</label>
                  <p className="profile-value">{profileData.name || 'Loading...'}</p>
                </div>
                <div className="profile-item">
                  <label>Email</label>
                  <p className="profile-value">{profileData.email || 'Loading...'}</p>
                </div>
                <div className="profile-item">
                  <label>Role</label>
                  <p className="profile-value vendor-badge">Vendor</p>
                </div>
                <div className="profile-item">
                  <label>Member Since</label>
                  <p className="profile-value">February 2026</p>
                </div>
                <button 
                  className="btn-edit-profile"
                  onClick={() => setIsEditingProfile(true)}
                >
                  Edit Profile
                </button>
              </div>
            ) : (
              <form onSubmit={handleProfileUpdate} className="profile-form">
                <div className="form-group">
                  <label>Name <span className="required">*</span></label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email <span className="required">*</span></label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-save">Save Changes</button>
                  <button 
                    type="button" 
                    className="btn-cancel"
                    onClick={() => {
                      setIsEditingProfile(false);
                      fetchProfile();
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        );

      case 'addProduct':
        return (
          <div className="content-section">
            <h2>Add New Product</h2>
            {successMessage && (
              <div className="success-message">{successMessage}</div>
            )}
            <form onSubmit={handleSubmit} className="product-form">
              {/* Product Name */}
              <div className="form-group">
                <label>Product Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  required
                />
              </div>

              {/* Main Category */}
              <div className="form-group">
                <label>Main Category <span className="required">*</span></label>
                <select
                  name="mainCategory"
                  value={formData.mainCategory}
                  onChange={handleInputChange}
                  required
                >
                  {mainCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* SubCategory */}
              <div className="form-group">
                <label>Sub-Category <span className="required">*</span></label>
                <select
                  name="subCategory"
                  value={formData.subCategory}
                  onChange={handleInputChange}
                  required
                >
                  {getSubCategories(formData.mainCategory).map(subCat => (
                    <option key={subCat._id} value={subCat.name}>{subCat.name}</option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div className="form-group">
                <label>Price (₹) <span className="required">*</span></label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Enter price"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label>Description <span className="required">*</span></label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your product..."
                  rows="5"
                  required
                />
              </div>

              {/* Product Type - Auto-set by category */}
              <div className="form-group">
                <label>Product Type</label>
                <div className="product-type-display">
                  <span className={`product-type-badge ${formData.productType.toLowerCase()}`}>
                    {formData.productType}
                  </span>
                  <small className="hint">Auto-detected from category</small>
                </div>
              </div>

              {/* Digital Asset Upload - ONLY for DIGITAL products */}
              {formData.productType === 'DIGITAL' && (
                <div className="form-group digital-asset-section">
                  <label>Digital Asset <span className="required">* (Required for Digital Products)</span></label>
                  <p className="asset-note">
                    📥 Upload the digital file that customers will download after purchase
                  </p>
                  
                  <div className="digital-asset-upload">
                    <input
                      type="file"
                      accept="*/*"
                      onChange={handleDigitalAssetChange}
                      className="asset-input"
                    />
                    {digitalAssetFile && (
                      <div className="asset-selected">
                        ✅ Selected: {digitalAssetFile.name} ({(digitalAssetFile.size / 1024 / 1024).toFixed(2)} MB)
                      </div>
                    )}
                  </div>

                  <div className="or-divider">
                    <span>OR</span>
                  </div>

                  <div className="form-group">
                    <label>Digital Asset URL <span className="optional">(Alternative to file upload)</span></label>
                    <input
                      type="url"
                      value={digitalAssetUrl}
                      onChange={(e) => setDigitalAssetUrl(e.target.value)}
                      placeholder="https://your-cloud-storage.com/asset.zip"
                    />
                    <small className="hint">Provide a direct download link if you've hosted the file elsewhere</small>
                  </div>
                </div>
              )}

              {/* Image Upload - OPTIONAL */}
              <div className="form-group">
                <label>Upload Images <span className="optional">(Optional - Multiple allowed)</span></label>
                <div className="image-upload">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="image-input"
                  />
                  <p>Click or drag images here</p>
                  <p className="hint">If no images are uploaded, a placeholder will be used</p>
                </div>
              </div>

              {/* Image Preview */}
              {uploadedImages.length > 0 && (
                <div className="image-preview">
                  <h4>Uploaded Images ({uploadedImages.length})</h4>
                  <div className="preview-grid">
                    {uploadedImages.map(img => (
                      <div key={img.id} className="preview-item">
                        <img src={img.src} alt={img.name} />
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => removeImage(img.id)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="btn-add-product"
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Product'}
              </button>
            </form>
          </div>
        );

      case 'myProducts':
        return (
          <div className="content-section">
            <h2>My Products ({products.length})</h2>
            {loading && <p>Loading products...</p>}
            {products.length === 0 ? (
              <div className="empty-state">
                <p>No products added yet.</p>
                <button onClick={() => setActiveMenu('addProduct')} className="btn-primary">
                  Add Your First Product
                </button>
              </div>
            ) : (
              <div className="products-grid">
                {products.map(product => (
                  <div key={product._id} className="product-card">
                    {product.images && product.images[0] && (
                      <img src={product.images[0]} alt={product.name} />
                    )}
                    <div className="product-info">
                      <h3>{product.name}</h3>
                      <p className="product-category">{product.subCategory}</p>
                      <p className="product-price">₹ {product.price.toLocaleString('en-IN')}</p>
                      <p className="product-description">{product.description}</p>
                      <span className={`product-type-badge ${product.productType.toLowerCase()}`}>
                        {product.productType}
                      </span>
                      {product.productType === 'DIGITAL' && (
                        <div className="digital-asset-status">
                          {product.digitalAssetUrl ? (
                            <span className="asset-status uploaded">
                              ✅ Digital Asset Uploaded
                            </span>
                          ) : (
                            <span className="asset-status missing">
                              ⚠️ Digital Asset Missing
                            </span>
                          )}
                          {product.isAssetEnabled !== undefined && (
                            <span className={`asset-enabled ${product.isAssetEnabled ? 'enabled' : 'disabled'}`}>
                              {product.isAssetEnabled ? '🟢 Active' : '🔴 Disabled by Admin'}
                            </span>
                          )}
                          {product.downloadCount > 0 && (
                            <span className="download-count">
                              📥 {product.downloadCount} download{product.downloadCount !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'limitedWorks':
        return (
          <div className="content-section">
            <h2>Limited & Signature Works</h2>

            <div className="product-form" style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '16px' }}>List Limited Work</h3>
              {limitedError && (
                <div className="error-message" style={{ marginBottom: '12px' }}>
                  {limitedError}
                </div>
              )}
              <form onSubmit={handleLimitedWorkSubmit}>
                <div className="form-group">
                  <label>Title <span className="required">*</span></label>
                  <input
                    type="text"
                    value={limitedWorkForm.title}
                    onChange={(e) => setLimitedWorkForm({ ...limitedWorkForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Work Type <span className="required">*</span></label>
                  <select
                    value={limitedWorkForm.workType}
                    onChange={(e) => setLimitedWorkForm({ ...limitedWorkForm, workType: e.target.value })}
                    required
                  >
                    <option value="LIMITED_PRINT">Limited Edition Print</option>
                    <option value="ART_INSTALLATION">Art Installation</option>
                    <option value="SPECIAL_SERIES">Special Art Series</option>
                    <option value="SIGNED_CERTIFIED">Signed & Certified Artwork</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Price (₹) <span className="required">*</span></label>
                  <input
                    type="number"
                    min="0"
                    value={limitedWorkForm.price}
                    onChange={(e) => setLimitedWorkForm({ ...limitedWorkForm, price: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={limitedWorkForm.isLimited}
                      onChange={(e) => setLimitedWorkForm({ ...limitedWorkForm, isLimited: e.target.checked })}
                      style={{ marginRight: '8px' }}
                    />
                    Limited Editions
                  </label>
                </div>

                {limitedWorkForm.isLimited && (
                  <div className="form-group">
                    <label>Edition Limit <span className="required">*</span></label>
                    <input
                      type="number"
                      min="1"
                      value={limitedWorkForm.editionLimit}
                      onChange={(e) => setLimitedWorkForm({ ...limitedWorkForm, editionLimit: e.target.value })}
                      required
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Description <span className="required">*</span></label>
                  <textarea
                    rows="4"
                    value={limitedWorkForm.description}
                    onChange={(e) => setLimitedWorkForm({ ...limitedWorkForm, description: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Certification Info</label>
                  <input
                    type="text"
                    value={limitedWorkForm.certificationInfo}
                    onChange={(e) => setLimitedWorkForm({ ...limitedWorkForm, certificationInfo: e.target.value })}
                    placeholder="e.g., Signed certificate included"
                  />
                </div>

                <div className="form-group">
                  <label>Artist Bio</label>
                  <textarea
                    rows="3"
                    value={limitedWorkForm.artistBio}
                    onChange={(e) => setLimitedWorkForm({ ...limitedWorkForm, artistBio: e.target.value })}
                    placeholder="Short bio for the artist"
                  />
                </div>

                <div className="form-group">
                  <label>Image URLs (comma separated)</label>
                  <input
                    type="text"
                    value={limitedWorkForm.imageUrls}
                    onChange={(e) => setLimitedWorkForm({ ...limitedWorkForm, imageUrls: e.target.value })}
                    placeholder="https://..., https://..."
                  />
                </div>

                <button type="submit" className="btn-add-product" disabled={limitedLoading}>
                  {limitedLoading ? 'Submitting...' : 'Submit Limited Work'}
                </button>
              </form>
            </div>

            <div className="content-section" style={{ padding: 0 }}>
              <h3>My Limited Works ({limitedWorks.length})</h3>
              {limitedLoading && <p>Loading limited works...</p>}
              {limitedWorks.length === 0 ? (
                <div className="empty-state">
                  <p>No limited works added yet.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Type</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Remaining</th>
                      </tr>
                    </thead>
                    <tbody>
                      {limitedWorks.map((work) => (
                        <tr key={work._id}>
                          <td>{work.title}</td>
                          <td>{work.workType.replace(/_/g, ' ')}</td>
                          <td>₹{work.price?.toLocaleString('en-IN')}</td>
                          <td>
                            <span className={`status-badge ${work.adminStatus?.toLowerCase() || 'pending'}`}>
                              {work.adminStatus || 'PENDING'}
                            </span>
                          </td>
                          <td>
                            {work.isLimited && work.editionLimit
                              ? work.preOrderCounts?.remaining ?? work.editionLimit
                              : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="content-section" style={{ padding: 0, marginTop: '24px' }}>
              <h3>Pre-Order Requests ({limitedPreOrders.length})</h3>
              {limitedPreOrders.length === 0 ? (
                <div className="empty-state">
                  <p>No pre-order requests yet.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Work</th>
                        <th>Customer</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {limitedPreOrders.map((preOrder) => (
                        <tr key={preOrder._id}>
                          <td>{preOrder.workId?.title || 'Unknown'}</td>
                          <td>{preOrder.customerId?.name || 'Customer'}</td>
                          <td>
                            <span className={`status-badge ${preOrder.status.toLowerCase()}`}>
                              {preOrder.status}
                            </span>
                          </td>
                          <td>
                            {preOrder.status === 'PENDING' ? (
                              <div className="action-buttons">
                                <button
                                  className="btn-approve"
                                  onClick={() => handlePreOrderUpdate(preOrder._id, 'ACCEPTED')}
                                >
                                  Accept
                                </button>
                                <button
                                  className="btn-reject"
                                  onClick={() => handlePreOrderUpdate(preOrder._id, 'REJECTED')}
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span>-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );

      case 'orders':
        return (
          <div className="content-section">
            <h2>My Orders ({orders.length})</h2>
            {orders.length === 0 ? (
              <div className="empty-state">
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>📦</div>
                <h3 style={{ margin: '0 0 10px', color: '#333' }}>No Orders Yet!</h3>
                <p style={{ fontSize: '16px', color: '#666' }}>
                  Orders containing your products will appear here.
                </p>
              </div>
            ) : (
              <div className="vendor-orders-list">
                {orders.map(order => (
                  <div key={order.id} className="vendor-order-card">
                    <div className="order-card-header">
                      <div>
                        <strong>Order ID: </strong>#{order.id.toString().substring(0, 8).toUpperCase()}
                      </div>
                      <span className={`status-badge ${order.orderStatus.toLowerCase()}`}>
                        {order.orderStatus}
                      </span>
                    </div>
                    
                    <div className="order-customer-info">
                      <p><strong>Customer:</strong> {order.customerName}</p>
                      <p><strong>Email:</strong> {order.customerEmail}</p>
                      <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}</p>
                    </div>

                    <div className="order-products-section">
                      <h4>Your Products in this Order:</h4>
                      <div className="vendor-products-list">
                        {order.products.map((product, idx) => (
                          <div key={idx} className="vendor-product-item">
                            <div className="product-details">
                              <span className="product-name">{product.productName}</span>
                              <span className="product-category">{product.subCategory}</span>
                              <span className={`product-type-badge ${product.productType.toLowerCase()}`}>
                                {product.productType}
                              </span>
                            </div>
                            <div className="product-price">
                              ₹{product.price.toLocaleString('en-IN', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="vendor-earnings">
                        <strong>Your Total Earnings: </strong>
                        <span className="earnings-amount">
                          ₹{order.products.reduce((sum, p) => sum + p.price, 0).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="order-payment-info">
                      <p>
                        <strong>Payment Method: </strong>{order.paymentMethod}
                      </p>
                      <p>
                        <strong>Payment Status: </strong>
                        <span className={`payment-badge ${order.paymentStatus.toLowerCase()}`}>
                          {order.paymentStatus}
                        </span>
                      </p>
                    </div>

                    <div className="order-actions">
                      <button 
                        onClick={() => fetchInvoice(order.id)}
                        className="btn-view-invoice"
                        disabled={loadingInvoice}
                      >
                        {loadingInvoice ? '📄 Loading...' : '📄 View Invoice'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'analytics':
        // Calculate monthly earnings from real order data
        const monthlyEarnings = [];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const earningsByMonth = {};
        
        orders.forEach(order => {
          const orderDate = new Date(order.createdAt);
          const monthKey = `${orderDate.getFullYear()}-${orderDate.getMonth()}`;
          const monthName = monthNames[orderDate.getMonth()];
          
          if (!earningsByMonth[monthKey]) {
            earningsByMonth[monthKey] = { month: monthName, earnings: 0 };
          }
          
          // Add this vendor's earnings from the order
          const vendorEarning = order.products
            .filter(p => p.vendorId === user?.id)
            .reduce((sum, p) => sum + p.price, 0);
          
          earningsByMonth[monthKey].earnings += vendorEarning;
        });
        
        // Convert to array for chart (last 6 months)
        const monthlyData = Object.values(earningsByMonth).slice(-6);
        
        return (
          <div className="content-section">
            <h2>Earnings & Analytics</h2>
            
            {/* Summary Cards */}
            <div className="analytics-cards">
              <div className="analytics-card">
                <div className="card-icon">📦</div>
                <div className="card-content">
                  <h4>Total Products</h4>
                  <p className="big-number">{products.length}</p>
                </div>
              </div>
              <div className="analytics-card">
                <div className="card-icon">🛍️</div>
                <div className="card-content">
                  <h4>Total Bookings</h4>
                  <p className="big-number">{commissionData?.summary?.totalOrders || 0}</p>
                </div>
              </div>
              <div className="analytics-card">
                <div className="card-icon">💵</div>
                <div className="card-content">
                  <h4>Total Sales</h4>
                  <p className="big-number">₹ {parseFloat(commissionData?.summary?.totalSales || 0).toLocaleString('en-IN')}</p>
                </div>
              </div>
              <div className="analytics-card">
                <div className="card-icon">📊</div>
                <div className="card-content">
                  <h4>Commission Deducted (10%)</h4>
                  <p className="big-number">₹ {parseFloat(commissionData?.summary?.totalCommissionDeducted || 0).toLocaleString('en-IN')}</p>
                </div>
              </div>
              <div className="analytics-card">
                <div className="card-icon">💰</div>
                <div className="card-content">
                  <h4>Net Earnings</h4>
                  <p className="big-number" style={{ color: '#10b981' }}>₹ {parseFloat(commissionData?.summary?.netEarnings || 0).toLocaleString('en-IN')}</p>
                </div>
              </div>
              <div className="analytics-card">
                <div className="card-icon">✅</div>
                <div className="card-content">
                  <h4>Settled Amount</h4>
                  <p className="big-number" style={{ color: '#10b981' }}>₹ {parseFloat(commissionData?.summary?.settledAmount || 0).toLocaleString('en-IN')}</p>
                </div>
              </div>
              <div className="analytics-card">
                <div className="card-icon">⏳</div>
                <div className="card-content">
                  <h4>Pending Amount</h4>
                  <p className="big-number" style={{ color: '#f59e0b' }}>₹ {parseFloat(commissionData?.summary?.pendingAmount || 0).toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>

            {/* Booking Details Table */}
            <div className="orders-section" style={{ marginTop: '30px' }}>
              <h3>Recent Bookings</h3>
              {commissionData?.bookings && commissionData.bookings.length > 0 ? (
                <div className="orders-table-container">
                  <table className="orders-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Products</th>
                        <th>Order Amount</th>
                        <th>Commission (10%)</th>
                        <th>Your Earning</th>
                        <th>Payment</th>
                        <th>Commission Status</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commissionData.bookings.map((booking) => (
                        <tr key={booking.orderId}>
                          <td>#{booking.orderId.substring(0, 8).toUpperCase()}</td>
                          <td>{new Date(booking.orderDate).toLocaleDateString('en-IN')}</td>
                          <td>{booking.products}</td>
                          <td>₹{booking.orderAmount.toLocaleString('en-IN')}</td>
                          <td style={{ color: '#ef4444' }}>₹{parseFloat(booking.commission).toLocaleString('en-IN')}</td>
                          <td style={{ color: '#10b981' }}>₹{parseFloat(booking.earning).toLocaleString('en-IN')}</td>
                          <td>
                            <span className={`payment-badge ${booking.paymentStatus.toLowerCase()}`}>
                              {booking.paymentStatus}
                            </span>
                          </td>
                          <td>
                            <span className={`commission-status-badge ${(booking.commissionStatus || 'CALCULATED').toLowerCase()}`}>
                              {booking.commissionStatus || 'CALCULATED'}
                            </span>
                            {booking.settledAt && (
                              <small style={{ display: 'block', color: '#666', fontSize: '11px' }}>
                                Settled: {new Date(booking.settledAt).toLocaleDateString('en-IN')}
                              </small>
                            )}
                          </td>
                          <td>
                            <span className={`order-status-badge ${booking.orderStatus.toLowerCase()}`}>
                              {booking.orderStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No bookings yet</p>
              )}
            </div>

            <div className="commission-info-box">
              <h4>💡 Commission Information</h4>
              <ul>
                <li>Platform deducts <strong>10% commission</strong> from each paid order</li>
                <li><strong>CALCULATED</strong> - Commission calculated, awaiting admin settlement</li>
                <li><strong>SETTLED</strong> - Commission settled by admin, payment processed</li>
                <li>You can track settled vs pending amounts in your summary above</li>
              </ul>
            </div>

            {/* Charts */}
            <div className="charts-container">
              {/* Monthly Earnings */}
              <div className="chart-box">
                <h3>Monthly Earnings</h3>
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="earnings" fill="#667eea" name="Earnings (₹)" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="empty-chart">No earnings data yet</p>
                )}
              </div>

              {/* Category Distribution */}
              <div className="chart-box">
                <h3>Products by Category</h3>
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="empty-chart">No products yet</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'professionalBookings':
        return (
          <div className="content-section">
            <h2>Professional Service Bookings ({professionalBookings.length})</h2>

            {professionalLoading && <p>Loading bookings...</p>}
            {professionalError && <div className="error-message">{professionalError}</div>}

            {!professionalLoading && !professionalError && (
              <>
                {professionalBookings.length === 0 ? (
                  <div className="empty-state">
                    <p>No professional service bookings yet.</p>
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Customer</th>
                          <th>Service Type</th>
                          <th>Description</th>
                          <th>Budget</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {professionalBookings.map((booking) => (
                          <tr key={booking._id}>
                            <td>{booking.customerName}</td>
                            <td>{booking.serviceTypeName}</td>
                            <td>{booking.description.substring(0, 50)}...</td>
                            <td>₹{booking.budget.toLocaleString('en-IN')}</td>
                            <td>
                              <span className={`status-badge ${booking.status.toLowerCase()}`}>
                                {booking.status}
                              </span>
                            </td>
                            <td>
                              {booking.status === 'PENDING_VENDOR_APPROVAL' && (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button
                                    className="btn-accept"
                                    onClick={() => {
                                      const proposedPrice = prompt('Enter your proposed price (₹):', booking.budget);
                                      if (proposedPrice) {
                                        const deliveryDate = prompt('Delivery date (YYYY-MM-DD):');
                                        const deliverables = prompt('Deliverables:');
                                        handleAcceptBooking(booking._id, proposedPrice, deliveryDate, deliverables);
                                      }
                                    }}
                                  >
                                    Accept
                                  </button>
                                  <button
                                    className="btn-reject"
                                    onClick={() => handleRejectBooking(booking._id)}
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                              {booking.status === 'ACCEPTED' && (
                                <span>Proposed: ₹{booking.proposedPrice?.toLocaleString('en-IN')}</span>
                              )}
                              {['IN_PROGRESS', 'COMPLETED', 'REJECTED', 'CANCELLED'].includes(booking.status) && (
                                <span>-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        );

      default:
        return <div>Select a menu item</div>;
    }
  };

  return (
    <div className="vendor-dashboard">
      {/* Left Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>ArtVPP</h1>
          <p>Vendor Panel</p>
        </div>

        <nav className="sidebar-menu">
          <button
            className={`menu-item ${activeMenu === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveMenu('profile')}
          >
            <span className="menu-icon">👤</span>
            <span className="menu-text">Vendor Profile</span>
          </button>

          <button
            className={`menu-item ${activeMenu === 'addProduct' ? 'active' : ''}`}
            onClick={() => setActiveMenu('addProduct')}
          >
            <span className="menu-icon">➕</span>
            <span className="menu-text">Add New Product</span>
          </button>

          <button
            className={`menu-item ${activeMenu === 'myProducts' ? 'active' : ''}`}
            onClick={() => setActiveMenu('myProducts')}
          >
            <span className="menu-icon">📦</span>
            <span className="menu-text">My Products</span>
          </button>

          <button
            className={`menu-item ${activeMenu === 'limitedWorks' ? 'active' : ''}`}
            onClick={() => setActiveMenu('limitedWorks')}
          >
            <span className="menu-icon">🌟</span>
            <span className="menu-text">Limited Works</span>
          </button>

          <button
            className={`menu-item ${activeMenu === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveMenu('orders')}
          >
            <span className="menu-icon">🛍️</span>
            <span className="menu-text">Orders</span>
          </button>

          <button
            className={`menu-item ${activeMenu === 'professionalBookings' ? 'active' : ''}`}
            onClick={() => setActiveMenu('professionalBookings')}
          >
            <span className="menu-icon">💼</span>
            <span className="menu-text">Professional Bookings</span>
          </button>

          <button
            className={`menu-item ${activeMenu === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveMenu('analytics')}
          >
            <span className="menu-icon">📊</span>
            <span className="menu-text">Earnings & Analytics</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar">⭐</div>
            <div className="user-name">{user?.name}</div>
            <div className="user-email">{user?.email}</div>
          </div>
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>

      {/* Right Content Area */}
      <main className="content-area">
        {renderContent()}
      </main>

      {/* INVOICE MODAL */}
      {selectedInvoice && (
        <Invoice 
          invoice={selectedInvoice} 
          onClose={() => setSelectedInvoice(null)} 
        />
      )}
    </div>
  );
}

export default VendorDashboard;
