import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import CommunityCard from './CommunityCard';
import Spinner from '../layout/Spinner';

const CommunityList = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'joined', 'created'
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadCommunities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filter]);

  const loadCommunities = async () => {
    try {
      setLoading(true);

      let url = `http://localhost:5000/api/v1/communities`;

   

   



      const res = await axios.get(url);
      const communityData = res.data?.data || [];

      if (page === 1) {
        setCommunities(communityData);
      } else {
        setCommunities(prev => [...prev, ...communityData]);
      }

      setHasMore(res.data?.pagination?.next !== null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error loading communities');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadCommunities();
  };

  const loadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  if (loading && page === 1) return <Spinner />;

  return (
    <div className="container mx-auto px-4 py-8 bg-[#FFFDD0]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-indigo-900">Communities</h1>
        <Link 
          to="/communities/new" 
          className="bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded"
        >
          Create Community
        </Link>
      </div>
  
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <input
            type="text"
            placeholder="Search communities..."
            className="border p-2 rounded flex-1 border-indigo-100 bg-white text-indigo-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            type="submit" 
            className="bg-indigo-100 hover:bg-indigo-200 px-4 py-2 rounded text-indigo-900"
          >
            Search
          </button>
        </form>
        
        <div className="flex gap-2">
          <button 
            className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-teal-600 text-white' : 'bg-indigo-100 text-indigo-900'}`}
            onClick={() => { setFilter('all'); setPage(1); }}
          >
            All
          </button>
          <button 
            className={`px-4 py-2 rounded ${filter === 'joined' ? 'bg-teal-600 text-white' : 'bg-indigo-100 text-indigo-900'}`}
            onClick={() => { setFilter('joined'); setPage(1); }}
          >
            Joined
          </button>
          <button 
            className={`px-4 py-2 rounded ${filter === 'created' ? 'bg-teal-600 text-white' : 'bg-indigo-100 text-indigo-900'}`}
            onClick={() => { setFilter('created'); setPage(1); }}
          >
            Created
          </button>
        </div>
      </div>
  
      {!Array.isArray(communities) || communities.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-xl text-indigo-200">No communities found.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map(community => (
              <CommunityCard key={community._id} community={community} />
            ))}
          </div>
  
          {hasMore && (
            <div className="text-center mt-8">
              <button 
                onClick={loadMore} 
                className="bg-indigo-100 hover:bg-indigo-200 px-6 py-2 rounded text-indigo-900"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CommunityList;
