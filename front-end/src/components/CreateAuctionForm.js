import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import { useAuth } from '../contexts/AuthContext';

const CreateAuctionForm = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    basePrice: '',
    buyNowPrice: '',
    duration: '1', // in days
    status: 'pending'
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/v1/products/${productId}`);
        setProduct(response.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load product information');
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    } else {
      setLoading(false);
      setError('Product ID is required to create an auction');
    }
  }, [productId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Calculate end time based on selected duration
      const endTime = moment().add(formData.duration, 'days').toISOString();
      
      const auctionData = {
        product: productId,
        seller: user._id,  // Assuming the user is the seller
        basePrice: parseFloat(formData.basePrice),
        buyNowPrice: formData.buyNowPrice ? parseFloat(formData.buyNowPrice) : undefined,
        endTime,
        status: formData.status,
      };
      
      const response = await axios.post(`http://localhost:5000/api/v1/auctions/products/${productId}/auctions `, auctionData);
      
      // Redirect to auction page
      navigate(`/auctions/${response.data.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create auction');
    }
  };

  if (loading) return <div className="text-center py-8">Loading product information...</div>;
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;
  if (!product) return <div className="text-center py-8">Product not found</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Auction</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-2">Product Details</h2>
          <p className="text-gray-600">{product.name}</p>
          <p className="text-sm text-gray-500 mt-2">{product.description}</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Base Price ($)
            </label>
            <input
              type="number"
              name="basePrice"
              min="0.01"
              step="0.01"
              value={formData.basePrice}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Buy Now Price ($) (Optional)
            </label>
            <input
              type="number"
              name="buyNowPrice"
              min="0"
              step="0.01"
              value={formData.buyNowPrice}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Duration
            </label>
            <select
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="1">1 day</option>
              <option value="3">3 days</option>
              <option value="5">5 days</option>
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
            </select>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Auction Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="pending">Pending (requires admin approval)</option>
              <option value="active">Active (starts immediately)</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Create Auction
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateAuctionForm;
