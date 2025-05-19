// frontend/app/(admin)/admin/dashboard/page.jsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Toast } from '@/lib/toast';
import { 
  User,
  Store,
  ShieldCheck,
  Search,
  Check,
  X,
  AlertCircle,
  Eye,
  UserCheck,
  UserX,
  ChevronDown,
  MapPin,
  Mail,
  Phone
} from 'lucide-react';

// User Management Component
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`/api/admin/users?page=${page}&search=${searchQuery}`);
        
        if (res.ok) {
          const data = await res.json();
          setUsers(data.data.users);
          setTotalPages(Math.ceil(data.totalCount / 10)); // Assuming 10 users per page
        } else {
          Toast.error('Failed to load users');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        Toast.error('Failed to load users');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, [page, searchQuery]);
  
  // Handle user role update
  const handleRoleUpdate = async (userId, newRole) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });
      
      if (res.ok) {
        setUsers(users.map(user => 
          user._id === userId ? { ...user, role: newRole } : user
        ));
        Toast.success(`User role updated to ${newRole}`);
      } else {
        Toast.error('Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      Toast.error('Failed to update user role');
    }
  };
  
  // Handle user account toggle (active/inactive)
  const handleToggleActive = async (userId, isCurrentlyActive) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: !isCurrentlyActive }),
      });
      
      if (res.ok) {
        setUsers(users.map(user => 
          user._id === userId ? { ...user, active: !isCurrentlyActive } : user
        ));
        Toast.success(`User account ${!isCurrentlyActive ? 'activated' : 'deactivated'}`);
      } else {
        Toast.error('Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      Toast.error('Failed to update user status');
    }
  };
  
  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Users</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <CardDescription>
            Manage user accounts and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-4 py-3 text-left text-sm font-medium">User</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Role</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">{user.email}</td>
                        <td className="px-4 py-3 text-sm">
                          <Badge 
                            variant={
                              user.role === 'admin' ? 'default' : 
                              user.role === 'vendor' ? 'secondary' : 
                              'outline'
                            }
                          >
                            {user.role}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Badge 
                            variant={user.active ? 'outline' : 'destructive'}
                            className={user.active ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                          >
                            {user.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="relative">
                              <Button 
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-1"
                                onClick={() => {
                                  const dropdown = document.getElementById(`role-dropdown-${user._id}`);
                                  dropdown.classList.toggle('hidden');
                                }}
                              >
                                Change Role
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                              <div 
                                id={`role-dropdown-${user._id}`} 
                                className="absolute right-0 mt-1 w-32 bg-background shadow-lg rounded-md border hidden z-10"
                              >
                                <div className="py-1">
                                  <button 
                                    className="text-left px-4 py-2 text-sm hover:bg-muted w-full"
                                    onClick={() => {
                                      handleRoleUpdate(user._id, 'customer');
                                      document.getElementById(`role-dropdown-${user._id}`).classList.add('hidden');
                                    }}
                                  >
                                    Customer
                                  </button>
                                  <button 
                                    className="text-left px-4 py-2 text-sm hover:bg-muted w-full"
                                    onClick={() => {
                                      handleRoleUpdate(user._id, 'vendor');
                                      document.getElementById(`role-dropdown-${user._id}`).classList.add('hidden');
                                    }}
                                  >
                                    Vendor
                                  </button>
                                  <button 
                                    className="text-left px-4 py-2 text-sm hover:bg-muted w-full"
                                    onClick={() => {
                                      handleRoleUpdate(user._id, 'admin');
                                      document.getElementById(`role-dropdown-${user._id}`).classList.add('hidden');
                                    }}
                                  >
                                    Admin
                                  </button>
                                </div>
                              </div>
                            </div>
                            
                            <Button 
                              variant={user.active ? 'destructive' : 'outline'}
                              size="sm"
                              onClick={() => handleToggleActive(user._id, user.active)}
                            >
                              {user.active ? (
                                <>
                                  <UserX className="h-4 w-4 mr-1" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-4 w-4 mr-1" />
                                  Activate
                                </>
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <User className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium">No users found</h3>
              <p className="text-muted-foreground mt-1">
                Try adjusting your search query
              </p>
            </div>
          )}
        </CardContent>
        {totalPages > 1 && (
          <CardFooter className="flex justify-center">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

// Store Verification Component
const StoreVerification = () => {
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // pending, verified, all
  
  // Fetch stores
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await fetch(`/api/admin/stores?filter=${filter}`);
        
        if (res.ok) {
          const data = await res.json();
          setStores(data.data.stores);
        } else {
          Toast.error('Failed to load stores');
        }
      } catch (error) {
        console.error('Error fetching stores:', error);
        Toast.error('Failed to load stores');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStores();
  }, [filter]);
  
  // Handle store verification
  const handleVerifyStore = async (storeId) => {
    try {
      const res = await fetch(`/api/stores/${storeId}/verify`, {
        method: 'PATCH'
      });
      
      if (res.ok) {
        // Update store in local state
        setStores(stores.map(store => 
          store._id === storeId ? { ...store, isVerified: true } : store
        ));
        Toast.success('Store verified successfully');
      } else {
        Toast.error('Failed to verify store');
      }
    } catch (error) {
      console.error('Error verifying store:', error);
      Toast.error('Failed to verify store');
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Store Verification</CardTitle>
            <div className="flex gap-2">
              <Button 
                variant={filter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('pending')}
              >
                Pending
              </Button>
              <Button 
                variant={filter === 'verified' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('verified')}
              >
                Verified
              </Button>
              <Button 
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
            </div>
          </div>
          <CardDescription>
            Approve or reject store applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : stores.length > 0 ? (
            <div className="space-y-4">
              {stores.map(store => (
                <Card key={store._id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3 h-40 bg-muted">
                      <img 
                        src={store.coverImage || '/placeholder-store-cover.png'} 
                        alt={store.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-4 md:p-6 flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold">{store.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {store.owner?.name || 'Unknown Owner'} • Created {new Date(store.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge 
                          variant={store.isVerified ? 'default' : 'outline'}
                          className={store.isVerified ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'}
                        >
                          {store.isVerified ? 'Verified' : 'Pending'}
                        </Badge>
                      </div>
                      
                      <p className="text-sm mb-4 line-clamp-2">
                        {store.description}
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm truncate">
                            {store.address?.city}, {store.address?.state}
                          </span>
                        </div>
                        
                        {store.contact?.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm truncate">{store.contact.email}</span>
                          </div>
                        )}
                        
                        {store.contact?.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm truncate">{store.contact.phone}</span>
                          </div>
                        )}
                      </div>
                      
                      {store.categories && store.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2 mb-4">
                          {store.categories.map((category) => (
                            <span 
                              key={category} 
                              className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex gap-2 mt-4">
                        {!store.isVerified && (
                          <Button onClick={() => handleVerifyStore(store._id)}>
                            <Check className="h-4 w-4 mr-2" /> Verify Store
                          </Button>
                        )}
                        
                        <Button variant="outline">
                          <Eye className="h-4 w-4 mr-2" /> View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Store className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium">
                {filter === 'pending' 
                  ? 'No pending stores' 
                  : filter === 'verified' 
                    ? 'No verified stores'
                    : 'No stores found'}
              </h3>
              <p className="text-muted-foreground mt-1">
                {filter === 'pending' 
                  ? 'All stores have been verified' 
                  : filter === 'verified'
                    ? 'No stores have been verified yet'
                    : 'There are no stores in the system'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Platform Overview Component
const PlatformOverview = () => {
  const [stats, setStats] = useState({
    userCount: 0,
    storeCount: 0,
    pendingStores: 0,
    verifiedStores: 0,
    productCount: 0,
    orderCount: 0,
    activeOrders: 0,
    completedOrders: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch platform stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        
        if (res.ok) {
          const data = await res.json();
          setStats(data.data);
        } else {
          Toast.error('Failed to load platform statistics');
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        Toast.error('Failed to load platform statistics');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Platform Overview</CardTitle>
          <CardDescription>
            Key performance metrics for the Tuuze marketplace
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-3xl font-bold mt-2">{stats.userCount}</p>
                  </div>
                  <User className="h-8 w-8 text-primary opacity-80" />
                </div>
              </div>
              
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Stores</p>
                    <p className="text-3xl font-bold mt-2">{stats.storeCount}</p>
                  </div>
                  <Store className="h-8 w-8 text-primary opacity-80" />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-4">
                  <span>Verified: {stats.verifiedStores}</span>
                  <span>Pending: {stats.pendingStores}</span>
                </div>
              </div>
              
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Products</p>
                    <p className="text-3xl font-bold mt-2">{stats.productCount}</p>
                  </div>
                  <Package className="h-8 w-8 text-primary opacity-80" />
                </div>
              </div>
              
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="text-3xl font-bold mt-2">{stats.orderCount}</p>
                  </div>
                  <ShoppingBag className="h-8 w-8 text-primary opacity-80" />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-4">
                  <span>Active: {stats.activeOrders}</span>
                  <span>Completed: {stats.completedOrders}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Main Admin Dashboard Component
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  // Check if user is admin
  useEffect(() => {
    if (isAuthenticated && user && user.role !== 'admin') {
      Toast.error('You do not have permission to access the admin dashboard');
      router.push('/');
    } else if (!isAuthenticated) {
      router.push('/login?redirect=/admin/dashboard');
    }
  }, [isAuthenticated, user, router]);
  
  // If not authenticated or not admin, show loading
  if (!isAuthenticated || (user && user.role !== 'admin')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 flex-shrink-0">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <ShieldCheck className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">Admin Dashboard</CardTitle>
                  <CardDescription>{user?.name || 'Administrator'}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-2 pb-6">
              <Tabs 
                value={activeTab} 
                onValueChange={setActiveTab} 
                orientation="vertical"
                className="w-full"
              >
                <TabsList className="flex flex-col h-auto gap-1">
                  <TabsTrigger 
                    value="overview" 
                    className="justify-start w-full px-4 py-2"
                  >
                    Platform Overview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="users" 
                    className="justify-start w-full px-4 py-2"
                  >
                    User Management
                  </TabsTrigger>
                  <TabsTrigger 
                    value="stores" 
                    className="justify-start w-full px-4 py-2"
                  >
                    Store Verification
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex-1">
          <TabsContent value="overview" className="m-0">
            <PlatformOverview />
          </TabsContent>
          
          <TabsContent value="users" className="m-0">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="stores" className="m-0">
            <StoreVerification />
          </TabsContent>
        </div>
      </div>
    </div>
  );
}