
import React from 'react';
import { motion } from 'framer-motion';
import { Search, Eye, Edit, Ban, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const UserManagement = () => {
  // Mock user data
  const users = [
    {
      id: 1,
      name: "Alice Johnson",
      email: "alice@example.com",
      phone: "+91 9876543210",
      joinDate: "2024-01-15",
      orders: 25,
      status: "active"
    },
    {
      id: 2,
      name: "Bob Smith",
      email: "bob@example.com",
      phone: "+91 9876543211",
      joinDate: "2024-02-20",
      orders: 12,
      status: "inactive"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
        <p className="text-gray-600">Manage customer accounts and activities</p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="Search users..." className="pl-10" />
            </div>
            <select className="p-2 border rounded-md">
              <option>All Users</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Name</th>
                  <th className="text-left p-4">Email</th>
                  <th className="text-left p-4">Phone</th>
                  <th className="text-left p-4">Join Date</th>
                  <th className="text-left p-4">Orders</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <motion.tr
                    key={user.id}
                    className="border-b hover:bg-gray-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td className="p-4 font-medium">{user.name}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">{user.phone}</td>
                    <td className="p-4">{user.joinDate}</td>
                    <td className="p-4">{user.orders}</td>
                    <td className="p-4">
                      <Badge variant={user.status === "active" ? "default" : "secondary"}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Ban className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;