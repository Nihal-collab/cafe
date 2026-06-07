import React, { useEffect, useState } from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { 
  TrendingUp, ShoppingBag, IndianRupee, AlertCircle, 
  Clock, CreditCard, Star, ArrowUpRight 
} from 'lucide-react';
import api from '../utils/api';

const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('analytics/summary/');
        setData(response.data);
        setError('');
      } catch (err) {
        console.error('Failed to fetch analytics data:', err);
        setError('Unable to load analytics data. Ensure backend is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-ivory">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 border-4 border-caramel border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="font-body text-espresso font-medium text-sm">Aggregating Business Intelligence...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-ivory text-center px-4 space-y-4">
        <AlertCircle className="h-12 w-12 text-red-600" />
        <h2 className="font-heading text-xl font-bold text-espresso">Dashboard Error</h2>
        <p className="font-body text-xs text-coffee/60 max-w-sm">{error}</p>
      </div>
    );
  }

  const COLORS = ['#4E342E', '#D4A373', '#588157', '#2D1B14', '#A855F7', '#3B82F6', '#EF4444'];
  const { kpis, daily_sales, best_sellers, least_sellers, category_share, hourly_stats, payment_share } = data;

  return (
    <div className="space-y-10">
      {/* 1. Header Title & Top Alert */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-espresso">Analytics & Insights</h1>
          <p className="font-body text-xs text-coffee/50 uppercase tracking-widest mt-1">Real-time Performance Metrics</p>
        </div>
        {kpis.low_stock_count > 0 && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-xs font-body font-bold flex items-center space-x-2 shadow-sm animate-pulse">
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
            <span>Warning: {kpis.low_stock_count} Inventory items are below threshold!</span>
          </div>
        )}
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* KPI 1 */}
        <div className="bg-white rounded-2xl border border-coffee/5 p-5 shadow-premium flex items-center space-x-4">
          <div className="h-10 w-10 bg-caramel/10 border border-caramel/20 rounded-xl flex items-center justify-center text-caramel">
            <IndianRupee className="h-5 w-5" />
          </div>
          <div>
            <span className="font-body text-[10px] text-coffee/40 uppercase font-bold tracking-wider">Today's Sales</span>
            <h3 className="font-body text-lg font-bold text-espresso">Rs. {kpis.todays_revenue.toFixed(2)}</h3>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-2xl border border-coffee/5 p-5 shadow-premium flex items-center space-x-4">
          <div className="h-10 w-10 bg-caramel/10 border border-caramel/20 rounded-xl flex items-center justify-center text-caramel">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="font-body text-[10px] text-coffee/40 uppercase font-bold tracking-wider">Weekly Revenue</span>
            <h3 className="font-body text-lg font-bold text-espresso">Rs. {kpis.weekly_revenue.toFixed(2)}</h3>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-2xl border border-coffee/5 p-5 shadow-premium flex items-center space-x-4">
          <div className="h-10 w-10 bg-forest/10 border border-forest/20 rounded-xl flex items-center justify-center text-forest">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="font-body text-[10px] text-coffee/40 uppercase font-bold tracking-wider">Monthly Revenue</span>
            <h3 className="font-body text-lg font-bold text-espresso">Rs. {kpis.monthly_revenue.toFixed(2)}</h3>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-2xl border border-coffee/5 p-5 shadow-premium flex items-center space-x-4">
          <div className="h-10 w-10 bg-coffee/10 border border-coffee/20 rounded-xl flex items-center justify-center text-coffee">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <span className="font-body text-[10px] text-coffee/40 uppercase font-bold tracking-wider">Total Orders</span>
            <h3 className="font-body text-lg font-bold text-espresso">{kpis.total_orders} Orders</h3>
          </div>
        </div>

        {/* KPI 5 */}
        <div className="bg-white rounded-2xl border border-coffee/5 p-5 shadow-premium flex items-center space-x-4">
          <div className="h-10 w-10 bg-coffee/10 border border-coffee/20 rounded-xl flex items-center justify-center text-coffee">
            <ArrowUpRight className="h-5 w-5" />
          </div>
          <div>
            <span className="font-body text-[10px] text-coffee/40 uppercase font-bold tracking-wider">Avg Order Value</span>
            <h3 className="font-body text-lg font-bold text-espresso">Rs. {kpis.avg_order_value.toFixed(2)}</h3>
          </div>
        </div>
      </div>

      {/* 3. Recharts Section 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Daily Sales Chart */}
        <div className="bg-white rounded-2xl border border-coffee/5 p-6 shadow-premium lg:col-span-2 space-y-4">
          <h3 className="font-heading text-lg font-bold text-espresso">Revenue Trend (Last 7 Days)</h3>
          <div className="h-80 font-body text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daily_sales}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4A373" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#D4A373" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`Rs. ${value}`, 'Revenue']} />
                <Legend />
                <Area type="monotone" dataKey="revenue" stroke="#D4A373" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" name="Revenue (Rs.)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share (Pie Chart) */}
        <div className="bg-white rounded-2xl border border-coffee/5 p-6 shadow-premium space-y-4">
          <h3 className="font-heading text-lg font-bold text-espresso">Revenue Share by Category</h3>
          <div className="h-80 font-body text-xs relative flex items-center justify-center">
            {category_share.length === 0 ? (
              <p className="text-coffee/40 text-center">No category sales recorded yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={category_share}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {category_share.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`Rs. ${value}`, 'Revenue']} />
                  <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* 4. Recharts Section 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Peak Ordering Hours */}
        <div className="bg-white rounded-2xl border border-coffee/5 p-6 shadow-premium lg:col-span-2 space-y-4">
          <h3 className="font-heading text-lg font-bold text-espresso">Peak Ordering Hours (Daily Average)</h3>
          <div className="h-80 font-body text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourly_stats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip formatter={(value) => [value, 'Orders']} />
                <Legend />
                <Bar dataKey="orders" fill="#4E342E" radius={[4, 4, 0, 0]} name="Orders Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Shares */}
        <div className="bg-white rounded-2xl border border-coffee/5 p-6 shadow-premium space-y-4">
          <h3 className="font-heading text-lg font-bold text-espresso">Payment Method Breakdown</h3>
          <div className="h-80 font-body text-xs">
            {payment_share.length === 0 ? (
              <p className="text-coffee/40 text-center">No payment data recorded yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={payment_share}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {payment_share.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index + 1 % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`Rs. ${value}`, 'Revenue']} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* 5. Food Sales: Best Sellers vs Least Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Best Selling Items Table */}
        <div className="bg-white rounded-2xl border border-coffee/5 p-6 shadow-premium space-y-4">
          <h3 className="font-heading text-lg font-bold text-espresso">Top 5 Best Sellers</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body text-xs border-collapse">
              <thead>
                <tr className="border-b border-coffee/10 text-coffee/50 font-bold uppercase tracking-wider">
                  <th className="pb-3">Item Name</th>
                  <th className="pb-3 text-center">Quantity Sold</th>
                  <th className="pb-3 text-right">Revenue Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-coffee/5">
                {best_sellers.map((item, idx) => (
                  <tr key={idx} className="hover:bg-ivory/20">
                    <td className="py-3.5 font-semibold text-espresso">{item.name}</td>
                    <td className="py-3.5 text-center font-bold text-caramel">{item.sales} units</td>
                    <td className="py-3.5 text-right font-bold text-espresso">Rs. {parseFloat(item.revenue).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Least Selling Items Table */}
        <div className="bg-white rounded-2xl border border-coffee/5 p-6 shadow-premium space-y-4">
          <h3 className="font-heading text-lg font-bold text-espresso text-red-600">Least Performing Items</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body text-xs border-collapse">
              <thead>
                <tr className="border-b border-coffee/10 text-coffee/50 font-bold uppercase tracking-wider">
                  <th className="pb-3">Item Name</th>
                  <th className="pb-3 text-center">Quantity Sold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-coffee/5">
                {least_sellers.map((item, idx) => (
                  <tr key={idx} className="hover:bg-ivory/20">
                    <td className="py-3.5 font-semibold text-espresso">{item.name}</td>
                    <td className="py-3.5 text-center font-bold text-red-600">{item.sales} units</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
