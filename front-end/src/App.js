import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import { ProductProvider } from './contexts/ProductContext';
import { CommunityProvider } from './contexts/CommunityContext';
import { WalletProvider } from './contexts/WalletContext'; // Add wallet provider

import PrivateRoute from './components/routing/PrivateRoute';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import Home from './components/pages/Home';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';

// Profile
import UserProfile from './components/profile/UserProfile';
import EditProfile from './components/profile/EditProfile';

// Products
import ProductList from './components/products/ProductList';
import ProductForm from './components/products/ProductForm';
import ProductDetails from './components/products/ProductDetails';

// Auctions
import AuctionList from './components/auctions/AuctionList';
import AuctionDetails from './components/auctions/AuctionDetails';
import CreateAuctionForm from './components/CreateAuctionForm';

// Bids
import BidList from './components/bids/BidList';

// Wallet & Payments
import WalletDetails from './components/wallet/WalletDetails';
import EntryFeePayment from './components/payments/PayEntryFeeButton';

// Chat Components
import ChatLayout from './components/chat/ChatLayout';
import ChatRoom from './components/chat/ChatRoom';

// Communities
import CommunityList from './components/communities/CommunityList';
import CommunityDetails from './components/communities/CommunityDetails';
import CommunityForm from './components/communities/CommunityForm';
import AddEventForm from './components/communities/AddEventForm';

// Admin Dashboard
import AdminDashboard from './components/admin/Dashboard';

// Initialize auction service
import { initializeAuctionService } from './api/auction.service';

initializeAuctionService('/api');

function App() {
  return (
    <Router>
      <AuthProvider>
        <WalletProvider> {/* Add WalletProvider */}
          <ProductProvider>
            <CommunityProvider>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:resetToken" element={<ResetPassword />} />

                    {/* Profile Routes */}
                    <Route path="/profile/:id" element={<UserProfile />} />
                    <Route
                      path="/profile/edit"
                      element={
                        <PrivateRoute>
                          <EditProfile />
                        </PrivateRoute>
                      }
                    />

                    {/* Product Routes */}
                    <Route path="/products" element={<ProductList />} />
                    <Route
                      path="/products/new"
                      element={
                        <PrivateRoute roles={['seller']}>
                          <ProductForm />
                        </PrivateRoute>
                      }
                    />
                    <Route path="/products/:id" element={<ProductDetails />} />
                    <Route
                      path="/products/:id/edit"
                      element={
                        <PrivateRoute>
                          <ProductForm />
                        </PrivateRoute>
                      }
                    />

                    {/* Auction Routes */}
                    <Route path="/auctions" element={<AuctionList />} />
                    <Route
                      path="/products/:productId/create-auction"
                      element={
                        <PrivateRoute roles={['seller']}>
                          <CreateAuctionForm />
                        </PrivateRoute>
                      }
                    />
                    <Route path="/auctions/:id" element={<AuctionDetails />} />
                    
                    {/* Bid Routes */}
                    <Route
                      path="/auctions/:auctionId/bids"
                      element={<BidList />}
                    />
                    <Route
                      path="/bids/:id"
                      element={<BidList />}
                    />

                    {/* Wallet Routes */}
                    <Route
                      path="/wallet"
                      element={
                        <PrivateRoute>
                          <WalletDetails />
                        </PrivateRoute>
                      }
                    />
                    
                    {/* Entry Fee Routes */}
                    <Route
                      path="/auctions/:auctionId/pay-entry"
                      element={
                        <PrivateRoute>
                          <EntryFeePayment />
                        </PrivateRoute>
                      }
                    />

                    {/* Community Routes */}
                    <Route path="/communities" element={<CommunityList />} />
                    <Route path="/communities/:id" element={<CommunityDetails />} />
                    <Route
                      path="/communities/new"
                      element={
                        <PrivateRoute>
                          <CommunityForm />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/communities/:id/edit"
                      element={
                        <PrivateRoute>
                          <CommunityForm />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/communities/:id/events/new"
                      element={
                        <PrivateRoute>
                          <AddEventForm />
                        </PrivateRoute>
                      }
                    />

                    {/* Chat Routes */}
                    <Route
                      path="/chat"
                      element={
                        <PrivateRoute>
                          <ChatLayout />
                        </PrivateRoute>
                      }
                    >
                      {/* Nested route for individual chat rooms */}
                      <Route path=":roomId" element={<ChatRoom />} />
                    </Route>

                    {/* Admin Routes */}
                    <Route
                      path="/admin/dashboard/*"
                      element={
                        <PrivateRoute roles={['admin']}>
                          <AdminDashboard />
                        </PrivateRoute>
                      }
                    />
                  </Routes>
                </main>
                <Footer />
              </div>
              <ToastContainer position="bottom-right" />
            </CommunityProvider>
          </ProductProvider>
        </WalletProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;