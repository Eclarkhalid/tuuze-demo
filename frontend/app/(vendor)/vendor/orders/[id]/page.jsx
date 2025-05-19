// frontend/app/(vendor)/vendor/orders/[id]/page.jsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Toast } from '@/lib/toast';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Package,
  Loader2
} from 'lucide-react';

// Order Status Badge Component
const OrderStatusBadge = ({ status }) => {
  let bgColor, textColor;
  
  switch (status) {
    case 'pending':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      break;
    case 'accepted':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      break;
    case 'ready':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      break;
    case 'completed':
      bgColor = 'bg-purple-100';
      textColor = 'text-purple-800';
      break;
    case 'rejected':
    case 'cancelled':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      break;
    default:
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
  }
  
  return (
    <div className={`px-3 py-1 rounded-full text-sm font-medium ${bgColor} ${textColor}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </div>
  );
};

export default function OrderDetailPage({ params }) {
  const { id } = params;
  
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();
  
  // Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${id}`);
        
        if (!res.ok) {
          throw new Error('Order not found');
        }
        
        const data = await res.json();
        setOrder(data.data.order);
      } catch (error) {
        console.error('Error fetching order:', error);
        setError(error.message || 'Failed to load order');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrder();
  }, [id]);
  
  // Handle order status update
  const handleUpdateStatus = async (newStatus) => {
    if (!confirm(`Are you sure you want to mark this order as ${newStatus}?`)) {
      return;
    }
    
    setIsUpdating(true);
    
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        const data = await res.json();
        setOrder(data.data.order);
        Toast.success(`Order marked as ${newStatus}`);
      } else {
        const error = await res.json();
        Toast.error(error.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      Toast.error('Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-lg">Loading order details...</p>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Button
          variant="ghost" 
          className="mb-6" 
          onClick={() => router.push('/vendor/dashboard?tab=orders')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
        </Button>
        
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{error}</h2>
            <p className="text-muted-foreground mb-6">
              We couldn't find the order you're looking for.
            </p>
            <Button onClick={() => router.push('/vendor/dashboard?tab=orders')}>
              Back to Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Button
        variant="ghost" 
        className="mb-6" 
        onClick={() => router.push('/vendor/dashboard?tab=orders')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center mb-2">
                <CardTitle className="text-xl">Order Details</CardTitle>
                <OrderStatusBadge status={order.status} />
              </div>
              <CardDescription>
                Order #{id.substring(id.length - 6)} • {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Pickup Date</p>
                    <p className="text-muted-foreground">
                      {new Date(order.pickupDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Pickup Time</p>
                    <p className="text-muted-foreground">
                      {order.pickupTime}
                    </p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-3">Order Items</h3>
                <div className="rounded-md border overflow-hidden">
                  <table className="min-w-full divide-y">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">Item</th>
                        <th className="px-4 py-3 text-center text-sm font-medium">Quantity</th>
                        <th className="px-4 py-3 text-right text-sm font-medium">Price</th>
                        <th className="px-4 py-3 text-right text-sm font-medium">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {order.orderItems.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm">{item.name}</td>
                          <td className="px-4 py-3 text-sm text-center">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-right">${item.price.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium">
                            ${(item.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-muted/30">
                      <tr>
                        <td colSpan="3" className="px-4 py-3 text-sm font-bold text-right">
                          Total
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-right">
                          ${order.totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              
              {order.notes && (
                <>
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium mb-2">Customer Notes</h3>
                    <p className="text-muted-foreground text-sm whitespace-pre-line">
                      {order.notes}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-1">
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Customer Information</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Name</p>
                    <p className="text-muted-foreground text-sm">
                      {order.customer?.name || 'Not available'}
                    </p>
                  </div>
                </div>
                
                {order.customer?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Email</p>
                      <p className="text-muted-foreground text-sm">
                        {order.customer.email}
                      </p>
                    </div>
                  </div>
                )}
                
                {order.customer?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Phone</p>
                      <p className="text-muted-foreground text-sm">
                        {order.customer.phone}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Order Status</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-2">
                  {order.status === 'pending' && (
                    <>
                      <Button 
                        onClick={() => handleUpdateStatus('accepted')}
                        disabled={isUpdating}
                        className="w-full"
                      >
                        {isUpdating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Accept Order
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={() => handleUpdateStatus('rejected')}
                        disabled={isUpdating}
                        className="w-full"
                      >
                        {isUpdating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject Order
                          </>
                        )}
                      </Button>
                    </>
                  )}
                  
                  {order.status === 'accepted' && (
                    <Button 
                      onClick={() => handleUpdateStatus('ready')}
                      disabled={isUpdating}
                      className="w-full"
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Package className="h-4 w-4 mr-2" />
                          Mark as Ready
                        </>
                      )}
                    </Button>
                  )}
                  
                  {order.status === 'ready' && (
                    <Button 
                      onClick={() => handleUpdateStatus('completed')}
                      disabled={isUpdating}
                      className="w-full"
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Complete Order
                        </>
                      )}
                    </Button>
                  )}
                  
                  {['completed', 'rejected', 'cancelled'].includes(order.status) && (
                    <div className="text-center p-4 bg-muted rounded-md">
                      <p className="text-sm text-muted-foreground">
                        This order is {order.status} and cannot be modified.
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="pt-2">
                  <h4 className="text-sm font-medium mb-2">Order Timeline</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Order Placed</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    
                    {order.status !== 'pending' && (
                      <div className="flex items-start gap-2">
                        <div className={`w-5 h-5 rounded-full ${order.status === 'rejected' || order.status === 'cancelled' ? 'bg-red-500' : 'bg-blue-500'} flex items-center justify-center mt-0.5`}>
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {order.status === 'rejected' ? 'Order Rejected' : 
                             order.status === 'cancelled' ? 'Order Cancelled' : 'Order Accepted'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {/* We don't have the timestamp for status updates in our model */}
                            After order was placed
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {['ready', 'completed'].includes(order.status) && (
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mt-0.5">
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Ready for Pickup</p>
                          <p className="text-xs text-muted-foreground">
                            Order is prepared and ready
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {order.status === 'completed' && (
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center mt-0.5">
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Order Completed</p>
                          <p className="text-xs text-muted-foreground">
                            Customer has picked up the order
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}