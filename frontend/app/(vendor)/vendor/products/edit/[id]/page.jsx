// frontend/app/(vendor)/vendor/products/edit/[id]/page.jsx
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Toast } from "@/lib/toast";
import { Package, ArrowLeft, AlertCircle } from "lucide-react";

export default function EditProduct({ params }) {
  const { id } = params;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    inventory: 0,
    category: "",
    subcategory: "",
    isAvailable: true,
    tags: []
  });

  const [store, setStore] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Fetch product and store data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch store data
        const storeRes = await fetch(
          "http://localhost:5000/api/stores/me/store"
        );

        if (!storeRes.ok) {
          setError("You need to create a store first");
          router.push("/vendor/create-store");
          return;
        }

        const storeData = await storeRes.json();
        setStore(storeData.data.store);

        // Extract unique categories from store
        if (
          storeData.data.store.categories &&
          storeData.data.store.categories.length > 0
        ) {
          setCategories(storeData.data.store.categories);
        }

        // Fetch product data
        const productRes = await fetch(`/api/products/${id}`);

        if (!productRes.ok) {
          setError("Product not found");
          return;
        }

        const productData = await productRes.json();
        const product = productData.data.product;

        // Verify the product belongs to the vendor's store
        if (product.store !== storeData.data.store._id) {
          setError("You are not authorized to edit this product");
          return;
        }

        // Set form data
        setFormData({
          name: product.name || "",
          description: product.description || "",
          price: product.price || "",
          inventory: product.inventory || 0,
          category: product.category || "",
          subcategory: product.subcategory || "",
          isAvailable:
            product.isAvailable !== undefined ? product.isAvailable : true,
          tags: product.tags || []
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load product data");
      } finally {
        setIsInitializing(false);
      }
    };

    fetchData();
  }, [id, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleNumberInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseFloat(value) || 0
    });
  };

  const handleTagsChange = (e) => {
    const value = e.target.value;
    const tags = value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);

    setFormData({
      ...formData,
      tags
    });
  };

  const handleToggleChange = (name, checked) => {
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (
      !formData.name ||
      !formData.description ||
      !formData.price ||
      !formData.category
    ) {
      Toast.error("Please fill in all required fields");
      return;
    }

    if (formData.price <= 0) {
      Toast.error("Price must be greater than 0");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        Toast.success("Product updated successfully");
        router.push("/vendor/dashboard?tab=products");
      } else {
        Toast.error(data.message || "Failed to update product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      Toast.error("Failed to update product");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error message
  if (error) {
    return (
      <div className="container mx-auto py-8 max-w-3xl">
        <Card>
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-2" />
            <CardTitle className="text-2xl">{error}</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => router.push("/vendor/dashboard")}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show message if store is not verified
  if (store && !store.isVerified) {
    return (
      <div className="container mx-auto py-8 max-w-3xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Store Not Verified</CardTitle>
            <CardDescription>
              Your store needs to be verified before you can edit products.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <p className="text-center mb-6">
              Our team is currently reviewing your store information. This
              process usually takes 1-2 business days. You'll receive a
              notification when your store is verified.
            </p>
            <Button onClick={() => router.push("/vendor/dashboard")}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => router.push("/vendor/dashboard?tab=products")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Edit Product</CardTitle>
          <CardDescription>Update your product information</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>

              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Product Name*
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Organic Avocado"
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
                  placeholder="Describe your product, its features, and benefits"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="price" className="text-sm font-medium">
                    Price*
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">
                      $
                    </span>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.price}
                      onChange={handleNumberInputChange}
                      className="pl-7"
                      placeholder="9.99"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="inventory" className="text-sm font-medium">
                    Inventory*
                  </label>
                  <Input
                    id="inventory"
                    name="inventory"
                    type="number"
                    min="0"
                    value={formData.inventory}
                    onChange={handleNumberInputChange}
                    placeholder="100"
                    required
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Categories & Tags</h3>

              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">
                  Category*
                </label>
                {categories.length > 0 ? (
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="e.g. Fruits, Electronics, Clothing"
                    required
                  />
                )}
                <p className="text-sm text-muted-foreground">
                  Categorizing your product helps customers find it
                </p>
              </div>

              {formData.category && (
                <div className="space-y-2">
                  <label htmlFor="subcategory" className="text-sm font-medium">
                    Subcategory
                  </label>
                  <Input
                    id="subcategory"
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleInputChange}
                    placeholder="e.g. Tropical Fruits, Smartphones, T-shirts"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="tags" className="text-sm font-medium">
                  Tags (comma-separated)
                </label>
                <Input
                  id="tags"
                  name="tags"
                  value={formData.tags.join(", ")}
                  onChange={handleTagsChange}
                  placeholder="e.g. organic, fresh, sale"
                />
                <p className="text-sm text-muted-foreground">
                  Tags help improve search results for your product
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Product Status</h3>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label htmlFor="isAvailable" className="text-sm font-medium">
                    Available for Sale
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Customers can see and order this product
                  </p>
                </div>
                <Switch
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onCheckedChange={(checked) =>
                    handleToggleChange("isAvailable", checked)
                  }
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.push("/vendor/dashboard?tab=products")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
