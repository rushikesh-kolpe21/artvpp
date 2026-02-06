import { useState } from 'react';
import { isDigitalCart } from '../utils/productHelpers';

function CheckoutForm({ onSubmit, cart }) {
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    houseFlat: '',
    streetArea: '',
    city: '',
    pincode: '',
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Only validate address fields for physical products
    if (!isDigitalOnly) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = 'Full name is required';
      }

      if (!formData.mobileNumber.trim()) {
        newErrors.mobileNumber = 'Mobile number is required';
      } else if (!/^\d{10}$/.test(formData.mobileNumber.replace(/\D/g, ''))) {
        newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
      }

      if (!formData.houseFlat.trim()) {
        newErrors.houseFlat = 'House/Flat number is required';
      }

      if (!formData.streetArea.trim()) {
        newErrors.streetArea = 'Street/Area is required';
      }

      if (!formData.city.trim()) {
        newErrors.city = 'City is required';
      }

      if (!formData.pincode.trim()) {
        newErrors.pincode = 'Pincode is required';
      } else if (!/^\d{6}$/.test(formData.pincode)) {
        newErrors.pincode = 'Please enter a valid 6-digit pincode';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const isDigitalOnly = isDigitalCart(cart);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 border border-gray-200">
      {isDigitalOnly ? (
        // Digital Product Message
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
              💾
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Digital Download Available
          </h2>
          <p className="text-gray-600 mb-4">
            No shipping address needed for digital products. Your files will be ready for download immediately after placing the order!
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-700 text-sm font-medium">
              ✓ Instant delivery | ✓ No physical shipping | ✓ Download anywhere, anytime
            </p>
          </div>
        </div>
      ) : (
        // Address Form
        <>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Delivery Address</h2>

          <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Full Name
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Enter your full name"
            className={`w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.fullName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
          )}
        </div>

        {/* Mobile Number */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Mobile Number
          </label>
          <input
            type="tel"
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={handleChange}
            placeholder="10-digit mobile number"
            className={`w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.mobileNumber ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.mobileNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.mobileNumber}</p>
          )}
        </div>

        {/* House / Flat No */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            House / Flat No
          </label>
          <input
            type="text"
            name="houseFlat"
            value={formData.houseFlat}
            onChange={handleChange}
            placeholder="e.g., 123, Apt 4B"
            className={`w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.houseFlat ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.houseFlat && (
            <p className="text-red-500 text-sm mt-1">{errors.houseFlat}</p>
          )}
        </div>

        {/* Street / Area */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Street / Area
          </label>
          <input
            type="text"
            name="streetArea"
            value={formData.streetArea}
            onChange={handleChange}
            placeholder="e.g., MG Road, Downtown"
            className={`w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.streetArea ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.streetArea && (
            <p className="text-red-500 text-sm mt-1">{errors.streetArea}</p>
          )}
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            City
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="e.g., Mumbai, Bangalore"
            className={`w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.city ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.city && (
            <p className="text-red-500 text-sm mt-1">{errors.city}</p>
          )}
        </div>

        {/* Pincode */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Pincode
          </label>
          <input
            type="text"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            placeholder="6-digit pincode"
            maxLength="6"
            className={`w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.pincode ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.pincode && (
            <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>
          )}
        </div>
        </div>
      </>
      )}

      <button
        type="submit"
        className="w-full mt-6 bg-green-600 text-white py-3 px-4 rounded-lg font-bold text-lg hover:bg-green-700 transition"
      >
        {isDigitalOnly ? 'Place Order' : 'Continue to Payment'}
      </button>
    </form>
  );
}

export default CheckoutForm;
