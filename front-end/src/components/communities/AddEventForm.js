import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Spinner from '../layout/Spinner';

const AddEventForm = () => {
  const navigate = useNavigate();
  const { id: communityId } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [community, setCommunity] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: ''
  });
  
  useEffect(() => {
    loadCommunity();
  }, [communityId]);
  
  const loadCommunity = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/v1/communities/${communityId}`);
      setCommunity(res.data.data);
      setLoading(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error loading community');
      navigate('/communities');
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await axios.post(`http://localhost:5000/api/v1/communities/${communityId}/events`, formData);
      toast.success('Event added successfully');
      navigate(`/communities/${communityId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding event');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) return <Spinner />;
  
  if (!community) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-xl text-gray-600">Community not found.</p>
      </div>
    );
  }
  
  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-2">Add Event</h1>
        <p className="text-gray-600 mb-6">
          For community: {community.name}
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Event Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Date and Time
            </label>
            <input
type="datetime-local"
name="date"
value={formData.date}
onChange={handleChange}
min={today}
className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
required
/>
</div>

<div className="flex items-center justify-between">
<button
type="button"
onClick={() => navigate(`/communities/${communityId}`)}
className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
>
Cancel
</button>
<button
type="submit"
disabled={submitting}
className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
>
{submitting ? 'Adding...' : 'Add Event'}
</button>
</div>
</form>
</div>
</div>
);
};

export default AddEventForm;
