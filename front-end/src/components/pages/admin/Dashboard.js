import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getDashboardStats,
  getPendingProducts,
  approveProduct as apiApproveProduct
} from '../../api/admin';
import AdminLayout from '../../components/layout/AdminLayout';
import ProductApprovalCard from '../../components/admin/ProductApprovalCard';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, productsRes] = await Promise.all([
          getDashboardStats(),
          getPendingProducts()
        ]);
        setStats(statsRes.data);
        setProducts(productsRes.data);
      } catch (err) {
        if (err.response?.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const approveProduct = async (productId) => {
    try {
      const { data } = await apiApproveProduct(productId);
      setProducts(products.filter(p => p._id !== productId));
      setStats(prev => ({
        ...prev,
        pendingProducts: prev.pendingProducts - 1
      }));
    } catch (err) {
      console.error('Approval failed:', err);
    }
  };

  if (loading) return <AdminLayout>Loading...</AdminLayout>;

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title="Total Users" 
            value={stats?.totalUsers} 
            icon="👥"
          />
          <StatCard
            title="Pending Approvals"
            value={stats?.pendingProducts}
            icon="⏳"
          />
          <StatCard
            title="Active Auctions"
            value={stats?.activeAuctions}
            icon="🔨"
          />
          <StatCard
            title="Total Revenue"
            value={`$${stats?.totalRevenue[0]?.total.toLocaleString() || 0}`}
            icon="💰"
          />
        </div>

        {/* Product Approvals Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Pending Product Approvals ({products.length})
          </h2>
          <div className="space-y-4">
            {products.length > 0 ? (
              products.map(product => (
                <ProductApprovalCard
                  key={product._id}
                  product={product}
                  onApprove={approveProduct}
                />
              ))
            ) : (
              <p className="text-gray-500">No products pending approval</p>
            )}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}

// Helper components
const StatCard = ({ title, value, icon }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="flex justify-between items-center">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <span className="text-2xl">{icon}</span>
    </div>
  </div>
);