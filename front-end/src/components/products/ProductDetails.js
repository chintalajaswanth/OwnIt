import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const ProductDetails = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchProduct();
  }, [id]);
  const fetchProduct = async () => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/v1/products/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
  
      if (data.success) {
        setProduct(data.data);
        console.log(data.data); // Check the structure of the response here
      } else {
        setError('Failed to fetch product');
      }
    } catch (err) {
      setError('An error occurred while fetching the product');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const { data } = await axios.delete(`http://localhost:5000/api/v1/products/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (data.success) {
          navigate('/products');
        } else {
          setError('Failed to delete product');
        }
      } catch (err) {
        setError('An error occurred while deleting the product');
        console.error(err);
      }
    }
  };

  const handleApprove = async () => {
    try {
      const { data } = await axios.put(`http://localhost:5000/api/v1/products/${id}/approve`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (data.success) {
        setProduct(data.data);
      } else {
        setError('Failed to approve product');
      }
    } catch (err) {
      setError('An error occurred while approving the product');
      console.error(err);
    }
  };

  const handleReject = async () => {
    try {
      const { data } = await axios.put(`http://localhost:5000/api/v1/products/${id}/reject`, {
        reason: rejectReason
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (data.success) {
        setProduct(data.data);
      } else {
        setError('Failed to reject product');
      }
    } catch (err) {
      setError('An error occurred while rejecting the product');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Product not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <span className={`px-3 py-1 rounded-full text-sm ${
            product.status === 'approved' ? 'bg-green-100 text-green-800' :
            product.status === 'rejected' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {product.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
   
        {product.image ? (
  <img
    src={`http://localhost:5000/uploads/products/${product.image}`}
    alt={product.name}
    className="w-full h-96 object-cover rounded-lg shadow-md" // Adjusted to make the image cover more space
  />
) : (
  <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
    <span className="text-gray-500">No image available</span>
  </div>
)}
</div>

       

          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-gray-700">{product.description}</p>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Details</h2>
              <dl className="space-y-2">
                <div>
                  <dt className="font-medium text-gray-600">Category</dt>
                  <dd>{product.category}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-600">Condition</dt>
                  <dd className="capitalize">{product.condition}</dd>
                </div>
                {product.seller && (
                  <div>
                    <dt className="font-medium text-gray-600">Seller</dt>
                    <dd>{product.seller.username || 'Unknown'}</dd>
                  </div>
                )}
                {product.status === 'rejected' && product.rejectionReason && (
                  <div>
                    <dt className="font-medium text-gray-600">Rejection Reason</dt>
                    <dd className="text-red-600">{product.rejectionReason}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="flex flex-wrap gap-4">
              {user && (user._id === product.seller?._id || user.role === 'admin') && (
                <>
                  <Link
                    to={`/products/${product._id}/edit`}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                  >
                    Delete
                  </button>
                </>
              )}

              {user && user.role === 'admin' && product.status === 'pending' && (
                <div className="flex flex-wrap gap-4 w-full">
                  <button
                    onClick={handleApprove}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                  >
                    Approve
                  </button>

                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Rejection reason"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="px-3 py-2 border rounded"
                    />
                    <button
                      onClick={handleReject}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
