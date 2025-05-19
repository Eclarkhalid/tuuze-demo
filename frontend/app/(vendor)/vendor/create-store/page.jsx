// frontend/app/(vendor)/vendor/create-store/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Toast } from "@/lib/toast";
import { MapPin, Store } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export default function CreateStore() {
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
    categories: [],
    longitude: null,
    latitude: null
  });

  const [isLoading, setIsLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState("idle"); // idle, loading, success, error
  const router = useRouter();
  const { user } = useAuth();

  // Redirect if already has a store
  useEffect(() => {
    const checkStore = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/stores/me/store");

        if (res.ok) {
          // User already has a store, redirect to dashboard
          router.push("/vendor/dashboard");
        }
      } catch (error) {
        // No store exists, stay on this page
        console.error("Error checking store:", error);
      }
    };

    if (user) {
      checkStore();
    }
  }, [user, router]);

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

  const handleGetLocation = () => {
    setLocationStatus("loading");

    if (!navigator.geolocation) {
      Toast.error("Geolocation is not supported by your browser");
      setLocationStatus("error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          longitude: position.coords.longitude,
          latitude: position.coords.latitude
        });
        setLocationStatus("success");
        Toast.success("Location detected successfully");
      },
      (error) => {
        console.error("Error getting location:", error);
        Toast.error(
          "Failed to get your location. Please try again or enter coordinates manually."
        );
        setLocationStatus("error");
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.name || !formData.description) {
      Toast.error("Please fill in all required fields");
      return;
    }

    if (!formData.longitude || !formData.latitude) {
      Toast.error("Please set your store location");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/stores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        Toast.success("Store created successfully");
        router.push("/vendor/dashboard");
      } else {
        Toast.error(data.message || "Failed to create store");
      }
    } catch (error) {
      console.error("Error creating store:", error);
      Toast.error("Failed to create store");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <Card className="mb-8">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create Your Store</CardTitle>
          <CardDescription>
            Set up your store profile to start selling on Tuuze
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>

              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Store Name*
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Riverside Fresh Market"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description*
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Tell customers about your store, products, and what makes you special"
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
                <p className="text-sm text-muted-foreground">
                  Enter categories that best describe your store
                </p>
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
                  placeholder="store@example.com"
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
                  placeholder="+1 (123) 456-7890"
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
              <h3 className="text-lg font-medium">Store Address*</h3>

              <div className="space-y-2">
                <label htmlFor="address.street" className="text-sm font-medium">
                  Street Address*
                </label>
                <Input
                  id="address.street"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                  placeholder="123 Main St"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="address.city" className="text-sm font-medium">
                    City*
                  </label>
                  <Input
                    id="address.city"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleInputChange}
                    placeholder="New York"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="address.state"
                    className="text-sm font-medium"
                  >
                    State/Province*
                  </label>
                  <Input
                    id="address.state"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleInputChange}
                    placeholder="NY"
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
                    Zip/Postal Code*
                  </label>
                  <Input
                    id="address.zipCode"
                    name="address.zipCode"
                    value={formData.address.zipCode}
                    onChange={handleInputChange}
                    placeholder="10001"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="address.country"
                    className="text-sm font-medium"
                  >
                    Country*
                  </label>
                  <Input
                    id="address.country"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleInputChange}
                    placeholder="United States"
                    required
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Store Location*</h3>
              <p className="text-sm text-muted-foreground">
                We need your store's precise location to help customers find
                you. Click the button below to use your current location.
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-4">
                <Button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={locationStatus === "loading"}
                  className="flex-shrink-0"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  {locationStatus === "loading"
                    ? "Detecting..."
                    : "Detect My Location"}
                </Button>

                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="space-y-2">
                    <label htmlFor="longitude" className="text-sm font-medium">
                      Longitude
                    </label>
                    <Input
                      id="longitude"
                      name="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          longitude: parseFloat(e.target.value)
                        })
                      }
                      placeholder="-73.935242"
                      className={
                        locationStatus === "success" ? "bg-green-50" : ""
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="latitude" className="text-sm font-medium">
                      Latitude
                    </label>
                    <Input
                      id="latitude"
                      name="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          latitude: parseFloat(e.target.value)
                        })
                      }
                      placeholder="40.730610"
                      className={
                        locationStatus === "success" ? "bg-green-50" : ""
                      }
                    />
                  </div>
                </div>
              </div>

              {locationStatus === "success" && (
                <p className="text-sm text-green-600">
                  ✓ Location detected successfully
                </p>
              )}

              {locationStatus === "error" && (
                <p className="text-sm text-red-600">
                  ✗ Failed to detect location. You may need to enter coordinates
                  manually or enable location permissions.
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.push("/")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Store"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <div className="bg-muted p-4 rounded-lg">
        <div className="flex items-start space-x-4">
          <Store className="h-6 w-6 text-muted-foreground flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-medium">What happens next?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              After creating your store, you'll be able to add products and
              start accepting orders. Our team will review your store
              information to ensure it meets our guidelines. Once verified, your
              store will be visible to customers in your area.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
