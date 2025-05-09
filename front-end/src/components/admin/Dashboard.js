// src/components/admin/Dashboard.js
import React from 'react';
import { Link, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import DashboardStats from './DashboardStats';
import UsersList from './UsersList';
import PendingProducts from './PendingProducts';

const Dashboard = () => {
  const { pathname } = useLocation();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="w-full md:w-64 mb-6 md:mb-0 md:mr-8">
          <div className="bg-white rounded-lg shadow p-4">
            <ul>
              <li className="mb-2">
                <Link
                  to="/admin/dashboard/stats"
                  className={`block px-4 py-2 rounded ${pathname.endsWith('/stats') ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
                >
                  Dashboard
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/admin/dashboard/users"
                  className={`block px-4 py-2 rounded ${pathname.endsWith('/users') ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
                >
                  User Management
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/admin/dashboard/pending-products"
                  className={`block px-4 py-2 rounded ${pathname.endsWith('/pending-products') ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
                >
                  Product Approvals
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow p-6">
            <Routes>
              <Route path="/" element={<Navigate to="stats" replace />} />
              <Route path="stats" element={<DashboardStats />} />
              <Route path="users" element={<UsersList />} />
              <Route path="pending-products" element={<PendingProducts />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
