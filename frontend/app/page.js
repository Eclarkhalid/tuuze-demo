"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Toast } from "@/lib/toast";

export default function Home() {
  return (
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Tuuze Platform</CardTitle>
          <CardDescription>Connect with local stores</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Welcome to Tuuze, a platform connecting local store owners with nearby customers.
          </p>
          <div className="flex space-x-2">
            <Button 
              onClick={() => Toast.success("Successfully tested!")}
              className="w-full"
            >
              Test Success Toast
            </Button>
            <Button 
              onClick={() => Toast.error("Error occurred!")}
              variant="destructive"
              className="w-full"
            >
              Test Error Toast
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            © 2025 Tuuze. All rights reserved.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}