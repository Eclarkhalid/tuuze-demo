"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { Store, User, ShoppingBag, LogIn, UserPlus } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Tuuze</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          A local marketplace connecting vendors with customers in your neighborhood
        </p>
      </div>

      {isAuthenticated ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <Store className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Browse Stores</CardTitle>
              <CardDescription>
                Discover local stores and vendors in your area
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Find unique products from local businesses, browse by category or search for specific items.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/stores" className="w-full">
                <Button className="w-full">Browse Stores</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <ShoppingBag className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>My Orders</CardTitle>
              <CardDescription>
                View and manage your orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Track order status, view order history, and manage upcoming pickups.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/orders" className="w-full">
                <Button className="w-full">View Orders</Button>
              </Link>
            </CardFooter>
          </Card>

          {user?.role === "vendor" ? (
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <Store className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Vendor Dashboard</CardTitle>
                <CardDescription>
                  Manage your store and products
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Add products, manage inventory, and process customer orders.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/vendor/dashboard" className="w-full">
                  <Button className="w-full">Go to Dashboard</Button>
                </Link>
              </CardFooter>
            </Card>
          ) : (
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <Store className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Become a Vendor</CardTitle>
                <CardDescription>
                  Start selling your products on Tuuze
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Create your store, add products, and reach customers in your area.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/vendor/create-store" className="w-full">
                  <Button className="w-full">Create Store</Button>
                </Link>
              </CardFooter>
            </Card>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <LogIn className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Sign In</CardTitle>
              <CardDescription>
                Log in to your Tuuze account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Access your account to browse stores, place orders, or manage your store if you're a vendor.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/login" className="w-full">
                <Button className="w-full">Sign In</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <UserPlus className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Register</CardTitle>
              <CardDescription>
                Create a new Tuuze account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Join as a customer to shop from local stores or as a vendor to sell your products.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/register" className="w-full">
                <Button className="w-full">Create Account</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      )}

      <div className="mt-12 bg-muted rounded-lg p-6 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">How Tuuze Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center mb-4">1</div>
            <h3 className="text-lg font-medium mb-2">Browse Local Stores</h3>
            <p className="text-sm text-muted-foreground">Discover stores in your area offering unique products and services.</p>
          </div>
          <div>
            <div className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center mb-4">2</div>
            <h3 className="text-lg font-medium mb-2">Place Your Order</h3>
            <p className="text-sm text-muted-foreground">Select products, schedule a pickup time, and reserve your items.</p>
          </div>
          <div>
            <div className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center mb-4">3</div>
            <h3 className="text-lg font-medium mb-2">Pickup & Pay</h3>
            <p className="text-sm text-muted-foreground">Visit the store at your scheduled time, pick up your items, and pay in person.</p>
          </div>
        </div>
      </div>
    </div>
  );
}