import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const PendingProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPendingProducts();
  }, []);

  const fetchPendingProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/v1/admin/products/pending');
      setProducts(res.data.data);
      setLoading(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error fetching pending products');
      setLoading(false);
    }
  };

  const handleApproveProduct = async (productId) => {
    try {
      await axios.put(`http://localhost:5000/api/v1/admin/products/${productId}/approve`);
      toast.success('Product approved successfully');
      
      // Remove approved product from list
      setProducts(products.filter(product => product._id !== productId));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error approving product');
    }
  };

  const openRejectModal = (product) => {
    setSelectedProduct(product);
    setRejectionReason('');
  };

  const handleRejectProduct = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/v1/admin/products/${selectedProduct._id}/reject`, {
        reason: rejectionReason
      });
      toast.success('Product rejected successfully');
      
      // Remove rejected product from list
      setProducts(products.filter(product => product._id !== selectedProduct._id));
      
      // Close modal
      setSelectedProduct(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error rejecting product');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><div className="loader">Loading...</div></div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Pending Product Approvals</h2>
      
      {products.length === 0 ? (
        <div className="bg-gray-50 p-8 text-center rounded">
          <p className="text-gray-600">No pending products found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{product.name}</h3>

                {/* Display the product image */}
                {product.imageUrl && (
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-48 object-cover rounded-md mb-4" 
                  />
                )}
                
                <div className="mb-2 text-sm">
                  <span className="font-semibold">Seller:</span> {product.seller.username}
                </div>
                
                <div className="mb-4 text-sm">
                  <span className="font-semibold">Created:</span> {new Date(product.createdAt).toLocaleDateString()}
                </div>
                
                <div className="mb-4">
                  <p className="text-gray-600 text-sm line-clamp-3">{product.description}</p>
                </div>
                
                <div className="flex justify-between">
                  <Link 
                    to={`/products/${product._id}`}
                    className="text-blue-500 hover:text-blue-700 text-sm"
                  >
                    View Details
                  </Link>
                </div>
                
                <div className="flex justify-between mt-4 space-x-2">
                  <button
                    onClick={() => handleApproveProduct(product._id)}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded text-sm flex-1"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => openRejectModal(product)}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded text-sm flex-1"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rejection Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Reject Product</h3>
            <p className="mb-4">
              Product: <span className="font-semibold">{selectedProduct.name}</span>
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Reason for Rejection</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-2 border rounded h-32"
                placeholder="Please provide a reason for rejecting this product..."
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setSelectedProduct(null)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button 
                onClick={handleRejectProduct}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
              >
                Reject Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingProducts;
