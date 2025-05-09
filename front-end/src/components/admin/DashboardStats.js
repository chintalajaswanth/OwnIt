// src/components/admin/DashboardStats.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const DashboardStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingProducts: 0,
    activeAuctions: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/v1/admin/stats');
        const statsData = res.data.data;

        const revenue = statsData.totalRevenue?.[0]?.total || 0;

        setStats({
          totalUsers: statsData.totalUsers,
          pendingProducts: statsData.pendingProducts,
          activeAuctions: statsData.activeAuctions,
          totalRevenue: revenue
        });
      } catch (err) {
        toast.error(err.response?.data?.error || 'Error fetching dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
          <div className="text-xl font-bold mb-2">Total Users</div>
          <div className="text-3xl font-bold">{stats.totalUsers}</div>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white shadow-lg">
          <div className="text-xl font-bold mb-2">Pending Products</div>
          <div className="text-3xl font-bold">{stats.pendingProducts}</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg">
          <div className="text-xl font-bold mb-2">Active Auctions</div>
          <div className="text-3xl font-bold">{stats.activeAuctions}</div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
          <div className="text-xl font-bold mb-2">Total Revenue</div>
          <div className="text-3xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
