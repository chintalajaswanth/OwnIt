import React from 'react';
import { Link } from 'react-router-dom';

const ProductItem = ({ product }) => {
  return (
    <div className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">
          <Link to={`/products/${product._id}`} className="hover:text-blue-500">
            {product.name}
          </Link>
        </h2>
        <p className="text-gray-600 mb-2">{product.description.substring(0, 100)}...</p>

        {/* Image Display */}
        {product.image ? (
          <div className="relative w-full mb-4">
            <img
              src={`http://localhost:5000/uploads/products/${product.image}`} // Adjust the path as per your server's configuration
              alt={product.name}
              className="w-full object-cover rounded-lg"
              style={{ height: 'auto', maxHeight: '300px' }} // You can adjust maxHeight if necessary
            />
          </div>
        ) : (
          <div className="h-56 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">No image available</span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
            {product.category}
          </span>
          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
            {product.condition}
          </span>
        </div>
        <div className="mt-4">
          <span className={`px-2 py-1 rounded text-sm ${
            product.status === 'approved' ? 'bg-green-100 text-green-800' :
            product.status === 'rejected' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {product.status}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
