// frontend/app/(customer)/stores/[id]/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger
} from "@/components/ui/sheet";
import { Toast } from "@/lib/toast";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ChevronLeft,
  Calendar,
  Truck,
  Info,
  AlertCircle
} from "lucide-react";

// Product Card Component
const ProductCard = ({ product, addToCart }) => {
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    addToCart({
      ...product,
      quantity
    });
    setQuantity(1);
    Toast.success(`${product.name} added to cart`);
  };

  return (
    <Card className="h-full flex flex-col">
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
      <CardHeader className="pb-2 flex-grow">
        <CardTitle className="text-lg">{product.name}</CardTitle>
        <CardDescription className="mt-1 line-clamp-2">
          {product.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex justify-between items-center">
          <div className="font-bold text-lg">${product.price.toFixed(2)}</div>
          {product.inventory > 0 ? (
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 hover:bg-green-50"
            >
              In Stock
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-red-50 text-red-700 hover:bg-red-50"
            >
              Out of Stock
            </Badge>
          )}
        </div>

        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {product.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        {product.inventory > 0 ? (
          <div className="w-full flex items-center gap-2">
            <div className="flex border rounded-md">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-none"
                disabled={quantity <= 1}
                onClick={() =>
                  setQuantity((prevQty) => Math.max(1, prevQty - 1))
                }
              >
                <Minus className="h-3 w-3" />
              </Button>
              <div className="flex items-center justify-center w-10">
                {quantity}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-none"
                disabled={quantity >= product.inventory}
                onClick={() =>
                  setQuantity((prevQty) =>
                    Math.min(product.inventory, prevQty + 1)
                  )
                }
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <Button className="flex-1" size="sm" onClick={handleAddToCart}>
              Add to Cart
            </Button>
          </div>
        ) : (
          <Button className="w-full" disabled>
            Out of Stock
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

// Cart Component
const Cart = ({
  cartItems,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
  store,
  isOpen,
  setIsOpen,
  handleCheckout
}) => {
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // If cart is empty, show empty state
  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12">
        <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Your cart is empty</h3>
        <p className="text-muted-foreground text-center mt-2 mb-6 max-w-xs">
          Add products from {store?.name} to place an order
        </p>
        <Button variant="outline" onClick={() => setIsOpen(false)}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-4 flex-grow overflow-auto pb-4">
        {cartItems.map((item) => (
          <div key={item._id} className="flex gap-4">
            <div className="w-16 h-16 bg-muted rounded-md flex-shrink-0 overflow-hidden">
              <img
                src={
                  item.images && item.images.length > 0
                    ? item.images[0]
                    : "/placeholder-product.png"
                }
                alt={item.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-grow">
              <h4 className="font-medium">{item.name}</h4>
              <div className="flex justify-between items-center mt-1">
                <div className="font-bold">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
                <div className="flex items-center border rounded-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-none"
                    disabled={item.quantity <= 1}
                    onClick={() =>
                      updateCartItemQuantity(item._id, item.quantity - 1)
                    }
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <div className="flex items-center justify-center w-8 text-sm">
                    {item.quantity}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-none"
                    disabled={item.quantity >= item.inventory}
                    onClick={() =>
                      updateCartItemQuantity(item._id, item.quantity + 1)
                    }
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 -mt-1"
              onClick={() => removeFromCart(item._id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t">
        <div className="flex justify-between mb-2">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">${cartTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mb-4">
          <span className="font-medium">Total</span>
          <span className="font-bold">${cartTotal.toFixed(2)}</span>
        </div>

        <div className="space-y-2">
          {!isAuthenticated ? (
            <>
              <Button
                className="w-full"
                onClick={() =>
                  router.push(`/login?redirect=/stores/${store._id}`)
                }
              >
                Sign in to Checkout
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                You need to be signed in to place an order
              </p>
            </>
          ) : (
            <Button className="w-full" onClick={handleCheckout}>
              Checkout
            </Button>
          )}
          <Button variant="outline" className="w-full" onClick={clearCart}>
            Clear Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

// Checkout Form Component
const CheckoutForm = ({
  store,
  cartItems,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const [formData, setFormData] = useState({
    pickupDate: "",
    pickupTime: "",
    notes: ""
  });

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Set default pickup date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Format date as YYYY-MM-DD
    const formattedDate = tomorrow.toISOString().split("T")[0];

    setFormData({
      ...formData,
      pickupDate: formattedDate
    });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate pickup date and time
    if (!formData.pickupDate || !formData.pickupTime) {
      Toast.error("Please select a pickup date and time");
      return;
    }

    // Ensure pickup date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(formData.pickupDate);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      Toast.error("Pickup date cannot be in the past");
      return;
    }

    onSubmit(formData);
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Order Summary</h3>
        <div className="bg-muted p-4 rounded-md space-y-2">
          {cartItems.map((item) => (
            <div key={item._id} className="flex justify-between text-sm">
              <span>
                {item.quantity}x {item.name}
              </span>
              <span className="font-medium">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
          <Separator className="my-2" />
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 flex items-start">
            <Info className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-700">
              <p className="font-medium mb-1">Important information</p>
              <p>
                This is a pickup order. You'll need to visit {store.name} to
                collect your items. Payment will be made in person upon pickup.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="pickupDate" className="text-sm font-medium">
              Pickup Date*
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="pickupDate"
                name="pickupDate"
                type="date"
                className="pl-9"
                value={formData.pickupDate}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="pickupTime" className="text-sm font-medium">
              Pickup Time*
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="pickupTime"
                name="pickupTime"
                type="time"
                className="pl-9"
                value={formData.pickupTime}
                onChange={handleInputChange}
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Please select a time during the store's operating hours
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">
              Notes (Optional)
            </label>
            <Input
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any special requests or instructions"
            />
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Placing Order..." : "Place Order"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

// Order Confirmation Component
const OrderConfirmation = ({ order, store, onClose }) => {
  return (
    <div className="text-center py-4">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Truck className="h-8 w-8 text-green-600" />
      </div>

      <h3 className="text-xl font-bold mb-2">Order Confirmed!</h3>
      <p className="text-muted-foreground mb-6">
        Your order has been placed successfully
      </p>

      <div className="bg-muted p-4 rounded-md text-left mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-muted-foreground">Order ID</span>
          <span className="text-sm font-medium">
            #{order._id.substring(order._id.length - 6)}
          </span>
        </div>

        <div className="flex justify-between mb-2">
          <span className="text-sm text-muted-foreground">Total Amount</span>
          <span className="text-sm font-medium">
            ${order.totalAmount.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between mb-2">
          <span className="text-sm text-muted-foreground">Pickup Date</span>
          <span className="text-sm font-medium">
            {new Date(order.pickupDate).toLocaleDateString()}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Pickup Time</span>
          <span className="text-sm font-medium">{order.pickupTime}</span>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-left mb-6">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-700">
            <p className="font-medium mb-1">Payment Information</p>
            <p>
              Remember to bring payment when you pick up your order at{" "}
              {store.name}. They accept cash and card payments.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Button
          className="w-full"
          onClick={() => (window.location.href = "/orders")}
        >
          View My Orders
        </Button>
        <Button variant="outline" className="w-full" onClick={onClose}>
          Continue Shopping
        </Button>
      </div>
    </div>
  );
};

// Main Store Page Component
export default function StorePage({ params }) {
  const { id } = params;

  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutMode, setCheckoutMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Check if cart has items in local storage
  useEffect(() => {
    const storedCart = localStorage.getItem(`cart_${id}`);
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (e) {
        console.error("Error parsing cart data:", e);
        localStorage.removeItem(`cart_${id}`);
      }
    }
  }, [id]);

  // Save cart to local storage whenever it changes
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem(`cart_${id}`, JSON.stringify(cartItems));
    } else {
      localStorage.removeItem(`cart_${id}`);
    }
  }, [cartItems, id]);

  // Fetch store and products data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch store data
        const storeRes = await fetch(`/api/stores/${id}`);

        if (!storeRes.ok) {
          throw new Error("Store not found");
        }

        const storeData = await storeRes.json();
        setStore(storeData.data.store);

        // Fetch products for this store
        const productsRes = await fetch(`/api/products/store/${id}`);

        if (!productsRes.ok) {
          throw new Error("Failed to load products");
        }

        const productsData = await productsRes.json();
        setProducts(productsData.data.products || []);
        setFilteredProducts(productsData.data.products || []);

        // Extract unique categories from products
        const categorySet = new Set();
        productsData.data.products.forEach((product) => {
          if (product.category) {
            categorySet.add(product.category);
          }
        });

        setCategories(Array.from(categorySet));
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message || "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Filter products based on search query and selected category
  useEffect(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          (product.tags &&
            product.tags.some((tag) => tag.toLowerCase().includes(query)))
      );
    }

    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, products]);

  // Add product to cart
  const addToCart = (product) => {
    setCartItems((prevItems) => {
      // Check if product already exists in cart
      const existingItem = prevItems.find((item) => item._id === product._id);

      if (existingItem) {
        // Update quantity if it exists
        return prevItems.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + product.quantity }
            : item
        );
      } else {
        // Add new item if it doesn't exist
        return [...prevItems, product];
      }
    });

    // Open cart after adding item
    setIsCartOpen(true);
  };

  // Remove product from cart
  const removeFromCart = (productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item._id !== productId)
    );
  };

  // Update cart item quantity
  const updateCartItemQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item._id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Clear cart
  const clearCart = () => {
    if (confirm("Are you sure you want to clear your cart?")) {
      setCartItems([]);
      setIsCartOpen(false);
    }
  };

  // Handle checkout
  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/stores/${id}`);
      return;
    }

    setCheckoutMode(true);
  };

  // Handle order submission
  const handlePlaceOrder = async (formData) => {
    if (cartItems.length === 0) {
      Toast.error("Your cart is empty");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare order data
      const orderData = {
        storeId: store._id,
        orderItems: cartItems.map((item) => ({
          product: item._id,
          quantity: item.quantity
        })),
        pickupDate: formData.pickupDate,
        pickupTime: formData.pickupTime,
        notes: formData.notes
      };

      // Submit order
      const res = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(orderData)
      });

      const data = await res.json();

      if (res.ok) {
        setCompletedOrder(data.data.order);
        setCartItems([]);
        Toast.success("Order placed successfully");
      } else {
        Toast.error(data.message || "Failed to place order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      Toast.error("Failed to place order");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-lg">Loading store information...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{error}</h2>
            <p className="text-muted-foreground mb-6">
              We couldn't find the store you're looking for.
            </p>
            <Button onClick={() => router.push("/stores")}>
              Browse Other Stores
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Back button */}
      <Link
        href="/stores"
        className="inline-flex items-center mb-6 text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Stores
      </Link>

      {/* Store header */}
      <div className="mb-8">
        <div className="h-48 bg-muted rounded-lg overflow-hidden mb-6">
          <img
            src={store.coverImage || "/placeholder-store-cover.png"}
            alt={store.name}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex flex-col md:flex-row md:items-start gap-4">
          {store.logo && (
            <div className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border -mt-10 md:-mt-12 bg-background">
              <img
                src={store.logo}
                alt={`${store.name} logo`}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex-grow">
            <h1 className="text-3xl font-bold">{store.name}</h1>
            <p className="text-muted-foreground mt-2">{store.description}</p>

            {store.categories && store.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {store.categories.map((category) => (
                  <Badge key={category} variant="secondary">
                    {category}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex-shrink-0 mt-4 md:mt-0">
            <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
              <SheetTrigger asChild>
                <Button className="relative">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Cart
                  {cartItems.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full text-xs w-5 h-5 flex items-center justify-center">
                      {cartItems.length}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="sm:max-w-md flex flex-col">
                <SheetHeader>
                  <SheetTitle>
                    {completedOrder
                      ? "Order Confirmed"
                      : checkoutMode
                      ? "Checkout"
                      : "Your Cart"}
                  </SheetTitle>
                  <SheetDescription>
                    {!completedOrder &&
                      !checkoutMode &&
                      `Items from ${store.name}`}
                  </SheetDescription>
                </SheetHeader>
                <div className="flex-grow overflow-y-auto py-4">
                  {completedOrder ? (
                    <OrderConfirmation
                      order={completedOrder}
                      store={store}
                      onClose={() => {
                        setCompletedOrder(null);
                        setCheckoutMode(false);
                        setIsCartOpen(false);
                      }}
                    />
                  ) : checkoutMode ? (
                    <CheckoutForm
                      store={store}
                      cartItems={cartItems}
                      onSubmit={handlePlaceOrder}
                      onCancel={() => setCheckoutMode(false)}
                      isSubmitting={isSubmitting}
                    />
                  ) : (
                    <Cart
                      cartItems={cartItems}
                      removeFromCart={removeFromCart}
                      updateCartItemQuantity={updateCartItemQuantity}
                      clearCart={clearCart}
                      store={store}
                      isOpen={isCartOpen}
                      setIsOpen={setIsCartOpen}
                      handleCheckout={handleCheckout}
                    />
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Store info tabs */}
      <Tabs defaultValue="products" className="mb-8">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="info">Store Info</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="pt-6">
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search products..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  addToCart={addToCart}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No products found</h3>
              <p className="text-muted-foreground">
                {searchQuery || selectedCategory !== "all"
                  ? "Try changing your search or filter"
                  : "This store doesn't have any products yet"}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="info" className="pt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">
                    Location & Contact
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Address</p>
                        <p className="text-muted-foreground">
                          {store.address.street}, {store.address.city}
                          <br />
                          {store.address.state}, {store.address.zipCode},{" "}
                          {store.address.country}
                        </p>
                      </div>
                    </div>

                    {store.contact?.phone && (
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

                    {store.contact?.email && (
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

                    {store.contact?.website && (
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Website</p>
                          <a
                            href={store.contact.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {store.contact.website}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-3">Operating Hours</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                    {store.operatingHours?.map((hours) => {
                      // Check if today
                      const isToday =
                        hours.day ===
                        new Date().toLocaleDateString("en-US", {
                          weekday: "long"
                        });

                      return (
                        <div
                          key={hours.day}
                          className={`flex justify-between items-center ${
                            isToday ? "font-medium" : ""
                          }`}
                        >
                          <span>
                            {hours.day} {isToday && "(Today)"}
                          </span>
                          <span
                            className={
                              hours.open ? "" : "text-muted-foreground"
                            }
                          >
                            {hours.open
                              ? `${hours.openTime} - ${hours.closeTime}`
                              : "Closed"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
