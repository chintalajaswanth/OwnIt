import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { Camera } from 'lucide-react';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    condition: 'new',
    images: []
  });

  const [previewImages, setPreviewImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProductData();
  }, [id]);

  const fetchProductData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/v1/products/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = response.data;
      
      if (data.success) {
        setFormData({
          name: data.data.name,
          description: data.data.description,
          category: data.data.category,
          condition: data.data.condition,
          images: data.data.image
        });

        // Set existing images for preview
        if (data.data.images && data.data.images.length > 0) {
          setPreviewImages(data.data.images.map(img => ({
            url: `http://localhost:5000/uploads/products/${img}`,
            filename: img,
            isExisting: true
          })));
        }
        
        setLoading(false);
      } else {
        setError('Failed to fetch product data');
        setLoading(false);
      }
    } catch (err) {
      setError('An error occurred while fetching the product');
      console.error(err);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (previewImages.length + files.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    const newPreviewImages = files.map(file => ({
      url: URL.createObjectURL(file),
      file,
      isExisting: false
    }));

    setPreviewImages(prev => [...prev, ...newPreviewImages]);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index) => {
    const removedImage = previewImages[index];

    setPreviewImages(prev => prev.filter((_, i) => i !== index));

    if (!removedImage.isExisting) {
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index - previewImages.filter(img => img.isExisting).length)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const formDataToSend = new FormData();
  
      // Add basic fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('condition', formData.condition);
  
      // Add the single uploaded image file (not as an array)
      if (formData.images.length > 0) {
        formDataToSend.append('image', formData.images[0]);  // Append single image field
      }
  
      // If there's an existing image, pass its filename (not full URL)
      if (previewImages.length > 0 && previewImages[0].isExisting) {
        formDataToSend.append('image', previewImages[0].url.split('/').pop());  // Only append filename
      }
  
      const response = await axios.put(
        `http://localhost:5000/api/v1/products/${id}`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
  
      if (response.data.success) {
        // Successfully updated product
        navigate('/products');
      } else {
        setError('Failed to update product');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during update');
    }
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Edit Product</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Condition
          </label>
          <select
            name="condition"
            value={formData.condition}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="new">New</option>
            <option value="used">Used</option>
            <option value="refurbished">Refurbished</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Images
          </label>
          <div className="mt-2 grid grid-cols-3 gap-4">
            {previewImages.map((image, index) => (
              <div key={index} className="w-24 h-24 relative">
                <img
                  src={image.url}
                  alt={`Preview ${index}`}
                  className="w-full h-full object-cover rounded"
                />
                <button
                  className="absolute top-0 right-0 text-white bg-red-500 rounded-full p-1"
                  onClick={() => removeImage(index)}
                >
                  X
                </button>
              </div>
            ))}
            {previewImages.length < 5 && (
              <label className="h-24 w-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Camera className="h-8 w-8 text-gray-400" />
              </label>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Upload up to 5 images (PNG, JPG, JPEG)
          </p>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(`/products/${id}`)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Updating...' : 'Update Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
