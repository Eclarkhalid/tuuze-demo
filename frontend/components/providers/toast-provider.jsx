"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "hsl(var(--background))",
          color: "hsl(var(--foreground))",
          border: "1px solid hsl(var(--border))"
        },
        success: {
          style: {
            background: "hsl(var(--primary))",
            color: "hsl(var(--primary-foreground))"
          },
        },
        error: {
          style: {
            background: "hsl(var(--destructive))",
            color: "hsl(var(--destructive-foreground))"
          },
        },
      }}
    />
  );
}