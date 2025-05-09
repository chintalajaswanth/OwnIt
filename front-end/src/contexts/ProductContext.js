// src/context/ProductContext.js
import { createContext, useState, useEffect ,useCallback} from 'react';
import axios from 'axios';

// Configure Axios instance with base URL and auth headers
const axio = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to inject token
axio.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const getProducts = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/v1/products');
      
      const products = res.data.data || res.data;
      
      setProducts(Array.isArray(products) ? products : []);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Server Error');
      setLoading(false);
    }
  }, []);
  // Create product (with FormData support for images)
  const createProduct = async (formData) => {
    try {
      const token = localStorage.getItem('token'); // Or however you store it
  
      const config = {
        headers: {
          ...(formData instanceof FormData && { 'Content-Type': 'multipart/form-data' }),
          Authorization: `Bearer ${token}`,
        },
      };
  
      const res = await axio.post('/api/v1/products', formData, config);
      return res.data.data;
    } catch (err) {
      throw err.response?.data?.error || 'Server Error';
    }
  };
  const getProduct = async (id) => {
    try {
      const res = await axio.get(`/api/v1/products/${id}`);
      return res.data.data;
    } catch (err) {
      throw err.response?.data?.error || 'Server Error';
    }
  };
  // Update product
  const updateProduct = async (id, formData) => {
    try {
      const res = await axio.put(`/api/v1/products/${id}`, formData);
      return res.data.data;
    } catch (err) {
      throw err.response?.data?.error || 'Server Error';
    }
  };

  // Delete product
  const deleteProduct = async (id) => {
    try {
      await axio.delete(`/api/v1/products/${id}`);
    } catch (err) {
      throw err.response?.data?.error || 'Server Error';
    }
  };

  // Approve product (admin)
  const approveProduct = async (id) => {
    try {
      const res = await axio.put(`/api/v1/products/${id}/approve`);
      return res.data.data;
    } catch (err) {
      throw err.response?.data?.error || 'Server Error';
    }
  };

  // Reject product (admin)
  const rejectProduct = async (id, reason) => {
    try {
      const res = await axio.put(`/api/v1/products/${id}/reject`, { reason });
      return res.data.data;
    } catch (err) {
      throw err.response?.data?.error || 'Server Error';
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        error,
        getProducts,
        getProduct,
        createProduct,
        updateProduct,
        deleteProduct,
        approveProduct,
        rejectProduct
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export default ProductContext;