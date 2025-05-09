import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ProductContext from '../../contexts/ProductContext';
import Spinner from '../layout/Spinner';
import ProductItem from './ProductItem';

const ProductList = () => {
  const { products, loading, error, getProducts } = useContext(ProductContext);
  const { user } = useAuth();
  const [initialLoad, setInitialLoad] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (initialLoad) {
      getProducts();
      setInitialLoad(false);
    }
  }, [initialLoad, getProducts]);

  if (loading && initialLoad) return <Spinner />;
  if (error) return <ErrorDisplay error={error} />;
  if (!products?.length) return <EmptyState />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        {user?.role === 'seller' && (
          <button 
            onClick={() => navigate('/products/new')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add Product
          </button>
        )}
      </div>

      {/* Adjusted grid layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <ProductItem product={product} />

            {/* Action Buttons */}
            <div className="p-4 flex flex-wrap gap-2">
              <button
                onClick={() => navigate(`/products/${product._id}`)}
                className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded flex-grow"
              >
                View Details
              </button>

              {/* Create Auction Button - Only for seller's approved products */}
              {user && 
               user._id === product.seller._id && 
               product.status === 'approved' && (
                <Link
                  to={`/products/${product._id}/create-auction`}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded flex-grow text-center"
                >
                  Create Auction
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper components
const ErrorDisplay = ({ error }) => (
  <div className="text-center p-8">
    <p className="text-red-500 mb-4">Error loading products: {error.message}</p>
    <button 
      onClick={() => window.location.reload()}
      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
    >
      Retry
    </button>
  </div>
);

const EmptyState = () => (
  <div className="text-center p-8">
    <p className="text-gray-500 mb-4">No products found</p>
    <Link 
      to="/products/new" 
      className="text-blue-500 hover:text-blue-600 hover:underline"
    >
      Create your first product
    </Link>
  </div>
);

export default ProductList;
