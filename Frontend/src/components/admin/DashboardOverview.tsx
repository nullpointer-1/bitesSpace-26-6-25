
import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/api/axiosInstance';
import { Store, ShoppingCart, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

// Type definitions based on backend DTOs
interface DashboardSummary {
  totalRevenue: number;
  totalOrders: number;
  totalVendors: number;
}

interface RevenueDataPoint {
  month: string;
  revenue: number;
  orders: number;
}

interface DistributionDataPoint {
  name: string;
  value: number;
}

interface AnalyticsData {
  revenueAndOrdersTrend: RevenueDataPoint[];
  vendorDistributionByType: DistributionDataPoint[];
  vendorDistributionByLocation: DistributionDataPoint[];
}

// API fetching functions
const fetchDashboardSummary = async (): Promise<DashboardSummary> => {
  const { data } = await axiosInstance.get('/admin/dashboard/summary');
  return data;
};

const fetchAnalyticsData = async (): Promise<AnalyticsData> => {
  const { data } = await axiosInstance.get('/admin/dashboard/analytics');
  return data;
};


const DashboardOverview = () => {
  const { data: summary, isLoading: isLoadingSummary, isError: isErrorSummary } = useQuery<DashboardSummary>({
    queryKey: ['dashboardSummary'],
    queryFn: fetchDashboardSummary,
  });

  const { data: analytics, isLoading: isLoadingAnalytics, isError: isErrorAnalytics } = useQuery<AnalyticsData>({
    queryKey: ['dashboardAnalytics'],
    queryFn: fetchAnalyticsData,
  });

  const PIE_CHART_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#64748b'];
  const BAR_CHART_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#64748b'];

  const stats = [
    { title: 'Total Revenue', value: summary?.totalRevenue, icon: DollarSign, color: 'text-green-600', bgColor: 'bg-green-100', formatter: (val: number | undefined) => val ? `₹${new Intl.NumberFormat('en-IN').format(val)}` : 'N/A' },
    { title: 'Total Orders', value: summary?.totalOrders, icon: ShoppingCart, color: 'text-blue-600', bgColor: 'bg-blue-100', formatter: (val: number | undefined) => val ? new Intl.NumberFormat('en-IN').format(val) : 'N/A' },
    { title: 'Total Vendors', value: summary?.totalVendors, icon: Store, color: 'text-purple-600', bgColor: 'bg-purple-100', formatter: (val: number | undefined) => val ?? 'N/A' }
  ];

  if (isErrorSummary || isErrorAnalytics) {
    return <div className="text-center text-red-500">Failed to load dashboard data. Please try again later.</div>;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Message */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Welcome Admin!
        </h1>
        <p className="text-xl text-gray-600">
          Manage your Bites Space efficiently
        </p>
      </motion.div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoadingSummary ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
          ))
        ) : (
          stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{stat.formatter(stat.value)}</p>
                      </div>
                      <div className={`p-4 rounded-full ${stat.bgColor}`}>
                        <Icon className={`w-8 h-8 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Revenue and Orders Trend - Full Width Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Revenue & Orders Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingAnalytics ? (
                <Skeleton className="h-[400px] w-full" />
            ) : (
                <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analytics?.revenueAndOrdersTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: number, name: string) => [name === 'Revenue (₹)' ? `₹${value}`: value, name]} />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} name="Revenue (₹)" />
                    <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={3} name="Orders" />
                </LineChart>
                </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Two Side-by-Side Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Vendor Distribution by Type */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Distribution by Type</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingAnalytics ? (<Skeleton className="h-[300px] w-full" />) : (
                <>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                    <Pie
                        data={analytics?.vendorDistributionByType}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                        nameKey="name"
                    >
                        {analytics?.vendorDistributionByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Count']} />
                    </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {analytics?.vendorDistributionByType.map((entry, index) => (
                    <div key={index} className="flex items-center space-x-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_CHART_COLORS[index % PIE_CHART_COLORS.length] }}></div>
                        <span className="text-xs text-gray-600">{entry.name} ({entry.value})</span>
                    </div>
                    ))}
                </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Distribution by Location */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Distribution by Location</CardTitle>
            </CardHeader>
            <CardContent>
             {isLoadingAnalytics ? (<Skeleton className="h-[300px] w-full" />) : (
                <>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics?.vendorDistributionByLocation}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                        dataKey="name" 
                        tick={false}
                        tickFormatter={() => ''}
                    />
                    <YAxis domain={[0, 'dataMax']} tickCount={4} />
                    <Tooltip />
                    <Bar dataKey="value" name="Vendors">
                        {analytics?.vendorDistributionByLocation.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={BAR_CHART_COLORS[index % BAR_CHART_COLORS.length]} />
                        ))}
                    </Bar>
                    </BarChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {analytics?.vendorDistributionByLocation.map((entry, index) => (
                    <div key={index} className="flex items-center space-x-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: BAR_CHART_COLORS[index % BAR_CHART_COLORS.length] }}></div>
                        <span className="text-xs text-gray-600">{entry.name} ({entry.value})</span>
                    </div>
                    ))}
                </div>
                </>
             )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardOverview;