// frontend/app/(vendor)/vendor/dashboard/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Package,
  ShoppingBag,
  Settings,
  Edit,
  Trash2,
  Plus
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Toast } from "@/lib/toast";

// Store Overview Component
const StoreOverview = ({ store }) => {
  const [recentOrders, setRecentOrders] = useState([]);
  const [productCount, setProductCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        // Fetch recent orders
        const ordersRes = await fetch(
          "http://localhost:5000/api/orders/store?limit=5&sort=-createdAt"
        );

        // Fetch product count
        const productsRes = await fetch(
          "http://localhost:5000/api/products/me/products"
        );

        if (ordersRes.ok && productsRes.ok) {
          const ordersData = await ordersRes.json();
          const productsData = await productsRes.json();

          setRecentOrders(ordersData.data.orders || []);
          setProductCount(productsData.count || 0);
        }
      } catch (error) {
        console.error("Error fetching overview data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverviewData();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Store Overview</CardTitle>
          <CardDescription>
            Quick summary of your store activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col p-4 bg-muted rounded-lg">
              <span className="text-muted-foreground text-sm">Products</span>
              <span className="text-3xl font-bold mt-2">
                {isLoading ? "..." : productCount}
              </span>
            </div>
            <div className="flex flex-col p-4 bg-muted rounded-lg">
              <span className="text-muted-foreground text-sm">
                Pending Orders
              </span>
              <span className="text-3xl font-bold mt-2">
                {isLoading
                  ? "..."
                  : recentOrders.filter((order) => order.status === "pending")
                      .length}
              </span>
            </div>
            <div className="flex flex-col p-4 bg-muted rounded-lg">
              <span className="text-muted-foreground text-sm">
                Total Orders
              </span>
              <span className="text-3xl font-bold mt-2">
                {isLoading ? "..." : recentOrders.length}
              </span>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Store Information</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-muted-foreground">
                    {store?.address?.street}, {store?.address?.city}
                    <br />
                    {store?.address?.state}, {store?.address?.zipCode}
                  </p>
                </div>
              </div>

              {store?.contact?.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-muted-foreground">
                      {store.contact.phone}
                    </p>
                  </div>
                </div>
              )}

              {store?.contact?.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-muted-foreground">
                      {store.contact.email}
                    </p>
                  </div>
                </div>
              )}

              {store?.contact?.website && (
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Website</p>
                    <p className="text-muted-foreground">
                      {store.contact.website}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Operating Hours</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground">
                    {store?.operatingHours?.map((hours) => (
                      <div key={hours.day} className="flex justify-between">
                        <span>{hours.day}</span>
                        <span>
                          {hours.open
                            ? `${hours.openTime} - ${hours.closeTime}`
                            : "Closed"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            onClick={() => window.open(`/store/${store?._id}`, "_blank")}
          >
            View Public Store
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>
            Latest customer orders for your store
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">
                        Order #{order._id.substring(order._id.length - 6)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium 
                      ${
                        order.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "accepted"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "ready"
                          ? "bg-green-100 text-green-800"
                          : order.status === "completed"
                          ? "bg-purple-100 text-purple-800"
                          : order.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </div>
                  </div>
                  <p className="text-sm">
                    Customer: {order.customer?.name || "Anonymous"}
                  </p>
                  <p className="text-sm">Items: {order.orderItems.length}</p>
                  <p className="text-sm font-medium mt-2">
                    Pickup: {new Date(order.pickupDate).toLocaleDateString()} at{" "}
                    {order.pickupTime}
                  </p>
                  <div className="mt-3 flex justify-between items-center">
                    <p className="font-bold">${order.totalAmount.toFixed(2)}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        (window.location.href = `/vendor/orders/${order._id}`)
                      }
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              No orders yet
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => (window.location.href = "/vendor/orders")}
          >
            View All Orders
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

// Products Management Component
const ProductsManagement = ({ storeId }) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/products/me/products"
        );

        if (res.ok) {
          const data = await res.json();
          setProducts(data.data.products || []);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        Toast.error("Failed to load products");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDelete = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE"
      });

      if (res.ok) {
        Toast.success("Product deleted successfully");
        setProducts(products.filter((product) => product._id !== productId));
      } else {
        Toast.error("Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      Toast.error("Failed to delete product");
    }
  };

  const handleEdit = (productId) => {
    router.push(`/vendor/products/edit/${productId}`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Products</CardTitle>
            <CardDescription>Manage your store products</CardDescription>
          </div>
          <Button onClick={() => router.push("/vendor/products/new")}>
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="border rounded-lg overflow-hidden"
                >
                  <div className="h-40 bg-muted flex items-center justify-center">
                    <img
                      src={
                        product.images && product.images.length > 0
                          ? product.images[0]
                          : "/placeholder-product.png"
                      }
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium truncate">{product.name}</h3>
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.isAvailable
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.isAvailable ? "Available" : "Unavailable"}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {product.category}
                    </p>
                    <p className="font-bold mt-2">
                      ${product.price.toFixed(2)}
                    </p>
                    <p className="text-sm mt-1">
                      Inventory:{" "}
                      <span
                        className={`font-medium ${
                          product.inventory > 5
                            ? "text-green-600"
                            : product.inventory > 0
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {product.inventory}
                      </span>
                    </p>
                    <div className="flex mt-4 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleEdit(product._id)}
                      >
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleDelete(product._id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No products yet</h3>
              <p className="text-muted-foreground mb-4">
                Start adding products to your store
              </p>
              <Button onClick={() => router.push("/vendor/products/new")}>
                <Plus className="mr-2 h-4 w-4" /> Add Your First Product
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Orders Management Component
const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        let url = "/api/orders/store";
        if (statusFilter !== "all") {
          url += `?status=${statusFilter}`;
        }

        const res = await fetch(url);

        if (res.ok) {
          const data = await res.json();
          setOrders(data.data.orders || []);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        Toast.error("Failed to load orders");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        Toast.success(`Order marked as ${newStatus}`);

        // Update the order in the list
        setOrders(
          orders.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
      } else {
        Toast.error("Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      Toast.error("Failed to update order status");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            Manage customer orders and reservations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-medium">Filter by status:</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order._id} className="border rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <div>
                      <p className="font-medium">
                        Order #{order._id.substring(order._id.length - 6)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()} at{" "}
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium mt-2 sm:mt-0
                      ${
                        order.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "accepted"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "ready"
                          ? "bg-green-100 text-green-800"
                          : order.status === "completed"
                          ? "bg-purple-100 text-purple-800"
                          : order.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : order.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium">Customer</p>
                      <p className="text-muted-foreground">
                        {order.customer?.name || "Anonymous"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Pickup Time</p>
                      <p className="text-muted-foreground">
                        {new Date(order.pickupDate).toLocaleDateString()} at{" "}
                        {order.pickupTime}
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <p className="text-sm font-medium mb-2">Order Items</p>
                    <div className="space-y-2">
                      {order.orderItems.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center"
                        >
                          <div className="flex items-center">
                            <span className="font-medium">
                              {item.quantity}x
                            </span>
                            <span className="ml-2">{item.name}</span>
                          </div>
                          <span>
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-b py-3 my-3">
                    <div className="flex justify-between items-center font-bold">
                      <span>Total Amount</span>
                      <span>${order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-end mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/vendor/orders/${order._id}`)}
                    >
                      View Details
                    </Button>

                    {order.status === "pending" && (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() =>
                            handleStatusChange(order._id, "accepted")
                          }
                        >
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleStatusChange(order._id, "rejected")
                          }
                        >
                          Reject
                        </Button>
                      </>
                    )}

                    {order.status === "accepted" && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleStatusChange(order._id, "ready")}
                      >
                        Mark Ready
                      </Button>
                    )}

                    {order.status === "ready" && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() =>
                          handleStatusChange(order._id, "completed")
                        }
                      >
                        Complete Order
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No orders yet</h3>
              <p className="text-muted-foreground">
                Orders will appear here once customers place them
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Store Settings Component
const StoreSettings = ({ store, setStore }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: ""
    },
    contact: {
      email: "",
      phone: "",
      website: ""
    },
    operatingHours: [],
    categories: []
  });
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form data from store
  useEffect(() => {
    if (store) {
      setFormData({
        name: store.name || "",
        description: store.description || "",
        address: {
          street: store.address?.street || "",
          city: store.address?.city || "",
          state: store.address?.state || "",
          zipCode: store.address?.zipCode || "",
          country: store.address?.country || ""
        },
        contact: {
          email: store.contact?.email || "",
          phone: store.contact?.phone || "",
          website: store.contact?.website || ""
        },
        operatingHours: store.operatingHours || [],
        categories: store.categories || []
      });
    }
  }, [store]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [section, field] = name.split(".");
      setFormData({
        ...formData,
        [section]: {
          ...formData[section],
          [field]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    const categories = value
      .split(",")
      .map((cat) => cat.trim())
      .filter((cat) => cat);

    setFormData({
      ...formData,
      categories
    });
  };

  const handleHoursChange = (day, field, value) => {
    const updatedHours = formData.operatingHours.map((hours) => {
      if (hours.day === day) {
        return {
          ...hours,
          [field]: field === "open" ? value === "true" : value
        };
      }
      return hours;
    });

    setFormData({
      ...formData,
      operatingHours: updatedHours
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/stores/me/store", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const data = await res.json();
        setStore(data.data.store);
        Toast.success("Store updated successfully");
      } else {
        const error = await res.json();
        Toast.error(error.message || "Failed to update store");
      }
    } catch (error) {
      console.error("Error updating store:", error);
      Toast.error("Failed to update store");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Store Settings</CardTitle>
          <CardDescription>Update your store information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>

              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Store Name
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="categories" className="text-sm font-medium">
                  Categories (comma-separated)
                </label>
                <Input
                  id="categories"
                  name="categories"
                  value={formData.categories.join(", ")}
                  onChange={handleCategoryChange}
                  placeholder="e.g. Food, Beverages, Bakery"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Address</h3>

              <div className="space-y-2">
                <label htmlFor="address.street" className="text-sm font-medium">
                  Street
                </label>
                <Input
                  id="address.street"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="address.city" className="text-sm font-medium">
                    City
                  </label>
                  <Input
                    id="address.city"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="address.state"
                    className="text-sm font-medium"
                  >
                    State/Province
                  </label>
                  <Input
                    id="address.state"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="address.zipCode"
                    className="text-sm font-medium"
                  >
                    Zip/Postal Code
                  </label>
                  <Input
                    id="address.zipCode"
                    name="address.zipCode"
                    value={formData.address.zipCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="address.country"
                    className="text-sm font-medium"
                  >
                    Country
                  </label>
                  <Input
                    id="address.country"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Information</h3>

              <div className="space-y-2">
                <label htmlFor="contact.email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="contact.email"
                  name="contact.email"
                  type="email"
                  value={formData.contact.email}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="contact.phone" className="text-sm font-medium">
                  Phone
                </label>
                <Input
                  id="contact.phone"
                  name="contact.phone"
                  value={formData.contact.phone}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="contact.website"
                  className="text-sm font-medium"
                >
                  Website
                </label>
                <Input
                  id="contact.website"
                  name="contact.website"
                  type="url"
                  value={formData.contact.website}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Operating Hours</h3>

              {formData.operatingHours.map((hours) => (
                <div
                  key={hours.day}
                  className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center"
                >
                  <div className="font-medium">{hours.day}</div>

                  <div>
                    <Select
                      value={hours.open.toString()}
                      onValueChange={(value) =>
                        handleHoursChange(hours.day, "open", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Open</SelectItem>
                        <SelectItem value="false">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {hours.open && (
                    <>
                      <div>
                        <Input
                          type="time"
                          value={hours.openTime}
                          onChange={(e) =>
                            handleHoursChange(
                              hours.day,
                              "openTime",
                              e.target.value
                            )
                          }
                          disabled={!hours.open}
                        />
                      </div>

                      <div>
                        <Input
                          type="time"
                          value={hours.closeTime}
                          onChange={(e) =>
                            handleHoursChange(
                              hours.day,
                              "closeTime",
                              e.target.value
                            )
                          }
                          disabled={!hours.open}
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            type="button"
            onClick={() => window.location.reload()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} onClick={handleSubmit}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Store Status</CardTitle>
          <CardDescription>Activate or deactivate your store</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                Store is currently {store?.isActive ? "active" : "inactive"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {store?.isActive
                  ? "Your store is visible to customers and accepting orders"
                  : "Your store is hidden from customers and not accepting orders"}
              </p>
            </div>
            <Button
              variant={store?.isActive ? "destructive" : "default"}
              onClick={async () => {
                if (store?.isActive) {
                  if (
                    !confirm(
                      "Are you sure you want to deactivate your store? It will no longer be visible to customers."
                    )
                  ) {
                    return;
                  }

                  try {
                    const res = await fetch(
                      "http://localhost:5000/api/stores/me/store/deactivate",
                      {
                        method: "PATCH"
                      }
                    );

                    if (res.ok) {
                      setStore({ ...store, isActive: false });
                      Toast.success("Store deactivated successfully");
                    } else {
                      Toast.error("Failed to deactivate store");
                    }
                  } catch (error) {
                    console.error("Error deactivating store:", error);
                    Toast.error("Failed to deactivate store");
                  }
                } else {
                  // Reactivate store
                  try {
                    const res = await fetch(
                      "http://localhost:5000/api/stores/me/store",
                      {
                        method: "PATCH",
                        headers: {
                          "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ isActive: true })
                      }
                    );

                    if (res.ok) {
                      setStore({ ...store, isActive: true });
                      Toast.success("Store activated successfully");
                    } else {
                      Toast.error("Failed to activate store");
                    }
                  } catch (error) {
                    console.error("Error activating store:", error);
                    Toast.error("Failed to activate store");
                  }
                }
              }}
            >
              {store?.isActive ? "Deactivate Store" : "Activate Store"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Main Dashboard Component
export default function VendorDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [store, setStore] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/stores/me/store");

        if (res.ok) {
          const data = await res.json();
          setStore(data.data.store);
        } else {
          // No store found, redirect to create store page
          router.push("/vendor/create-store");
        }
      } catch (error) {
        console.error("Error fetching store:", error);
        Toast.error("Failed to load store data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStore();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-lg">Loading your store...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Tabs
        defaultValue={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="flex flex-col md:flex-row gap-4 items-start mb-8">
          <div className="w-full md:w-64 flex-shrink-0">
            <Card className="p-4">
              <div className="flex flex-col items-center">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarImage
                    src={store?.logo || "/placeholder-store.png"}
                    alt={store?.name}
                  />
                  <AvatarFallback>
                    {store?.name?.charAt(0) || "S"}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold text-center">{store?.name}</h2>
                <p className="text-muted-foreground text-sm text-center mt-1 mb-4">
                  {store?.isVerified
                    ? "Verified Store"
                    : "Pending Verification"}
                </p>
                <TabsList className="grid w-full grid-cols-1 gap-2">
                  <TabsTrigger value="overview" className="justify-start">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="products" className="justify-start">
                    Products
                  </TabsTrigger>
                  <TabsTrigger value="orders" className="justify-start">
                    Orders
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="justify-start">
                    Settings
                  </TabsTrigger>
                </TabsList>
              </div>
            </Card>
          </div>

          <div className="flex-1">
            <TabsContent value="overview" className="mt-0">
              <StoreOverview store={store} />
            </TabsContent>

            <TabsContent value="products" className="mt-0">
              <ProductsManagement storeId={store?._id} />
            </TabsContent>

            <TabsContent value="orders" className="mt-0">
              <OrdersManagement />
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              <StoreSettings store={store} setStore={setStore} />
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
