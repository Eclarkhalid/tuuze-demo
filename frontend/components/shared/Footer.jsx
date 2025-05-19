// frontend/components/shared/Footer.jsx
import Link from "next/link";
import { Store } from "lucide-react";

export default function Footer() {
  return (
    <footer className="container mx-auto border-t py-8 md:py-12">
      <div className="container grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Link href="/" className="font-bold text-xl flex items-center">
            <Store className="h-6 w-6 mr-2" />
            Tuuze
          </Link>
          <p className="text-sm text-muted-foreground max-w-xs">
            Tuuze is a local marketplace that connects vendors with customers in
            your neighborhood, making it easy to discover and shop from local
            stores.
          </p>
        </div>
        <div>
          <h3 className="font-medium text-sm mb-4">Quick Links</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link
                href="/"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/stores"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Browse Stores
              </Link>
            </li>
            <li>
              <Link
                href="/login"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign In
              </Link>
            </li>
            <li>
              <Link
                href="/register"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign Up
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-medium text-sm mb-4">For Vendors</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link
                href="/vendor/create-store"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Create a Store
              </Link>
            </li>
            <li>
              <Link
                href="/vendor/dashboard"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Vendor Dashboard
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-medium text-sm mb-4">Help & Support</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link
                href="/contact"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact Us
              </Link>
            </li>
            <li>
              <Link
                href="/faq"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                FAQ
              </Link>
            </li>
            <li>
              <Link
                href="/privacy"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="container mt-8 pt-8 border-t">
        <p className="text-sm text-muted-foreground text-center">
          © {new Date().getFullYear()} Tuuze. All rights reserved.
        </p>
      </div>
    </footer>
  );
}