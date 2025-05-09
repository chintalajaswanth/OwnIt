import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';

const CommunityContext = createContext();

export const useCommunity = () => useContext(CommunityContext);

export const CommunityProvider = ({ children }) => {
  const { user } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [userCommunities, setUserCommunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCommunities = async (params = {}) => {
    setLoading(true);
    try {
      let queryString = new URLSearchParams(params).toString();
      const res = await axios.get(`http://localhost:5000/api/v1/communities?${queryString}`);
      setCommunities(res.data.data);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching communities');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCommunities = async () => {
    if (!user) {
      setUserCommunities([]);
      return [];
    }
    
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/v1/communities?member=${user._id}`);
      setUserCommunities(res.data.data);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching your communities');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getCommunity = async (id) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/v1/communities/${id}`);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching community');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createCommunity = async (communityData) => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/v1/communities', communityData);
      setCommunities([...communities, res.data.data]);
      setUserCommunities([...userCommunities, res.data.data]);
      toast.success('Community created successfully');
      return res.data.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Error creating community';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateCommunity = async (id, communityData) => {
    setLoading(true);
    try {
      const res = await axios.put(`http://localhost:5000/api/v1/communities/${id}`, communityData);
      
      // Update communities list
      setCommunities(communities.map(community => 
        community._id === id ? res.data.data : community
      ));
      
      // Update user communities list if present
      setUserCommunities(userCommunities.map(community => 
        community._id === id ? res.data.data : community
      ));
      
      toast.success('Community updated successfully');
      return res.data.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Error updating community';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteCommunity = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/v1/communities/${id}`);
      
      // Remove from communities list
      setCommunities(communities.filter(community => community._id !== id));
      
      // Remove from user communities list
      setUserCommunities(userCommunities.filter(community => community._id !== id));
      
      toast.success('Community deleted successfully');
      return true;
    } catch (err) {
      const message = err.response?.data?.message || 'Error deleting community';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const joinCommunity = async (id) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/v1/communities/${id}/join`);
      
      // Update communities list
      setCommunities(communities.map(community => 
        community._id === id ? res.data.data : community
      ));
      
      // Add to user communities if not already there
      if (!userCommunities.find(c => c._id === id)) {
        setUserCommunities([...userCommunities, res.data.data]);
      } else {
        setUserCommunities(userCommunities.map(community => 
          community._id === id ? res.data.data : community
        ));
      }
      
      toast.success('Successfully joined community');
      return res.data.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Error joining community';
      toast.error(message);
      return null;
    }
  };

  const leaveCommunity = async (id) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/v1/communities/${id}/leave`);
      
      // Update communities list
      setCommunities(communities.map(community => 
        community._id === id ? res.data.data : community
      ));
      
      // Remove from user communities if user is not part of members anymore
      const updatedCommunity = res.data.data;
      if (!updatedCommunity.members.includes(user._id)) {
        setUserCommunities(userCommunities.filter(community => community._id !== id));
      } else {
        setUserCommunities(userCommunities.map(community => 
          community._id === id ? res.data.data : community
        ));
      }
      
      toast.success('Successfully left community');
      return res.data.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Error leaving community';
      toast.error(message);
      return null;
    }
  };

  const addCommunityEvent = async (communityId, eventData) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/v1/communities/${communityId}/events`, eventData);
      
      // Update communities list
      setCommunities(communities.map(community => 
        community._id === communityId ? res.data.data : community
      ));
      
      // Update user communities list if present
      setUserCommunities(userCommunities.map(community => 
        community._id === communityId ? res.data.data : community
      ));
      
      toast.success('Event added successfully');
      return res.data.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Error adding event';
      toast.error(message);
      return null;
    }
  };

  return (
    <CommunityContext.Provider
      value={{
        communities,
        userCommunities,
        loading,
        error,
        fetchCommunities,
        fetchUserCommunities,
        getCommunity,
        createCommunity,
        updateCommunity,
        deleteCommunity,
        joinCommunity,
        leaveCommunity,
        addCommunityEvent
      }}
    >
      {children}
    </CommunityContext.Provider>
  );
};