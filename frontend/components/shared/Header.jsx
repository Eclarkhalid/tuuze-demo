// frontend/components/shared/Header.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Store,
  ShoppingBag,
  User,
  Menu,
  LogOut,
  ShieldCheck,
  Home
} from "lucide-react";

export default function Header() {
  const [isMounted, setIsMounted] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <header className="border-b container mx-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="font-bold text-xl flex items-center">
            <Store className="h-6 w-6 mr-2" />
            Tuuze
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Home
            </Link>
            <Link
              href="/stores"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname.startsWith("/stores")
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              Stores
            </Link>
            {isAuthenticated && (
              <Link
                href="/orders"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname.startsWith("/orders")
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                Orders
              </Link>
            )}
            {isAuthenticated && user?.role === "vendor" && (
              <Link
                href="/vendor/dashboard"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname.startsWith("/vendor")
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                Vendor Dashboard
              </Link>
            )}
            {isAuthenticated && user?.role === "admin" && (
              <Link
                href="/admin/dashboard"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname.startsWith("/admin")
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                Admin Dashboard
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {user?.name && (
                      <p className="font-medium">{user.name}</p>
                    )}
                    {user?.email && (
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/orders">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    <span>My Orders</span>
                  </Link>
                </DropdownMenuItem>
                {user?.role === "vendor" && (
                  <DropdownMenuItem asChild>
                    <Link href="/vendor/dashboard">
                      <Store className="mr-2 h-4 w-4" />
                      <span>Vendor Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                {user?.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/dashboard">
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => logout()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link href="/register">
                <Button>Sign up</Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4">
                <SheetClose asChild>
                  <Link
                    href="/"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <Home className="h-4 w-4" />
                    Home
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/stores"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <Store className="h-4 w-4" />
                    Stores
                  </Link>
                </SheetClose>
                {isAuthenticated ? (
                  <>
                    <SheetClose asChild>
                      <Link
                        href="/orders"
                        className="flex items-center gap-2 text-sm font-medium"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        Orders
                      </Link>
                    </SheetClose>
                    {user?.role === "vendor" && (
                      <SheetClose asChild>
                        <Link
                          href="/vendor/dashboard"
                          className="flex items-center gap-2 text-sm font-medium"
                        >
                          <Store className="h-4 w-4" />
                          Vendor Dashboard
                        </Link>
                      </SheetClose>
                    )}
                    {user?.role === "admin" && (
                      <SheetClose asChild>
                        <Link
                          href="/admin/dashboard"
                          className="flex items-center gap-2 text-sm font-medium"
                        >
                          <ShieldCheck className="h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      </SheetClose>
                    )}
                    <SheetClose asChild>
                      <Button
                        variant="ghost"
                        className="justify-start px-2"
                        onClick={() => logout()}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </Button>
                    </SheetClose>
                  </>
                ) : (
                  <>
                    <SheetClose asChild>
                      <Link
                        href="/login"
                        className="flex items-center gap-2 text-sm font-medium"
                      >
                        Log in
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/register">
                        <Button className="w-full">Sign up</Button>
                      </Link>
                    </SheetClose>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}