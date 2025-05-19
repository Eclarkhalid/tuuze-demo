// frontend/app/(customer)/orders/page.jsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Toast } from '@/lib/toast';
import { PackageCheck, Store, Clock, Calendar, MapPin, AlertCircle, ChevronRight, ShoppingBag } from 'lucide-react';

// Order Status Badge Component
const OrderStatusBadge = ({ status }) => {
  let color;
  
  switch (status) {
    case 'pending':
      color = 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      break;
    case 'accepted':
      color = 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      break;
    case 'ready':
      color = 'bg-green-100 text-green-800 hover:bg-green-100';
      break;
    case 'completed':
      color = 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      break;
    case 'rejected':
    case 'cancelled':
      color = 'bg-red-100 text-red-800 hover:bg-red-100';
      break;
    default:
      color = 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  }
  
  return (
    <Badge variant="outline" className={color}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('all');
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/login?redirect=/orders');
    }
  }, [isAuthenticated, isLoading, router]);
  
  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders/me');
        
        if (res.ok) {
          const data = await res.json();
          setOrders(data.data.orders || []);
        } else {
          Toast.error('Failed to load orders');
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        Toast.error('Failed to load orders');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);
  
  // Handle cancel order
  const handleCancelOrder = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this order?')) {
      return;
    }
    
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'PATCH'
      });
      
      if (res.ok) {
        // Update order in local state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId ? { ...order, status: 'cancelled' } : order
          )
        );
        
        Toast.success('Order cancelled successfully');
      } else {
        const error = await res.json();
        Toast.error(error.message || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      Toast.error('Failed to cancel order');
    }
  };
  
  // Filter orders based on selected tab
  const filteredOrders = orders.filter(order => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'active') {
      return ['pending', 'accepted', 'ready'].includes(order.status);
    }
    if (selectedTab === 'completed') {
      return order.status === 'completed';
    }
    if (selectedTab === 'cancelled') {
      return ['cancelled', 'rejected'].includes(order.status);
    }
    return true;
  });
  
  // Sort orders by creation date (newest first)
  const sortedOrders = [...filteredOrders].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-lg">Loading your orders...</p>
        </div>
      </div>
    );
  }
  
  // If not authenticated, don't render anything (redirect handled in useEffect)
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Orders</h1>
        <p className="text-muted-foreground mt-2">
          Track and manage your orders from local stores
        </p>
      </div>
      
      <Tabs 
        defaultValue="all" 
        value={selectedTab} 
        onValueChange={setSelectedTab}
        className="mb-8"
      >
        <TabsList>
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        
        <TabsContent value={selectedTab} className="pt-6">
          {sortedOrders.length > 0 ? (
            <div className="space-y-6">
              {sortedOrders.map(order => (
                <Card key={order._id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Order #{order._id.substring(order._id.length - 6)}
                        </p>
                        <CardTitle className="text-lg">
                          {order.store?.name || 'Store'}
                        </CardTitle>
                      </div>
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Pickup Date</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.pickupDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Pickup Time</p>
                            <p className="text-sm text-muted-foreground">
                              {order.pickupTime}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Pickup Location</p>
                          <p className="text-sm text-muted-foreground">
                            {order.store?.address?.street}, {order.store?.address?.city}
                          </p>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <p className="text-sm font-medium mb-2">Order Items</p>
                        <div className="space-y-2">
                          {order.orderItems.map((item, index) => (
                            <div key={index} className="flex justify-between">
                              <span className="text-sm">
                                {item.quantity}x {item.name}
                              </span>
                              <span className="text-sm font-medium">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex justify-between mt-4 font-bold">
                          <span>Total</span>
                          <span>${order.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      {order.notes && (
                        <div>
                          <p className="text-sm font-medium">Notes</p>
                          <p className="text-sm text-muted-foreground">
                            {order.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between border-t pt-4 bg-muted/30">
                    <div className="text-sm text-muted-foreground">
                      Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                    </div>
                    
                    <div className="flex gap-2">
                      {order.status === 'pending' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleCancelOrder(order._id)}
                        >
                          Cancel Order
                        </Button>
                      )}
                      
                      <Link href={`/stores/${order.store?._id}`}>
                        <Button size="sm">
                          Visit Store
                        </Button>
                      </Link>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center py-12">
                <PackageCheck className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No orders found</h3>
                <p className="text-muted-foreground mb-6 text-center max-w-md">
                  {selectedTab === 'all' 
                    ? "You haven't placed any orders yet. Browse local stores and place your first order."
                    : `You don't have any ${selectedTab} orders.`}
                </p>
                <Link href="/stores">
                  <Button>
                    <Store className="mr-2 h-4 w-4" />
                    Browse Stores
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}