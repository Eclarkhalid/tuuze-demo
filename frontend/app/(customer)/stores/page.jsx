// frontend/app/(customer)/stores/page.jsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Toast } from '@/lib/toast';
import { MapPin, Store, Search, Navigation, Clock, ChevronRight } from 'lucide-react';

export default function StoreListingPage() {
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationStatus, setLocationStatus] = useState('idle'); // idle, loading, success, error
  const router = useRouter();
  
  // Detect user's location
  useEffect(() => {
    const detectLocation = () => {
      setLocationStatus('loading');
      
      if (!navigator.geolocation) {
        setLocationStatus('error');
        setError('Geolocation is not supported by your browser');
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          setUserLocation({ longitude, latitude });
          setLocationStatus('success');
          fetchNearbyStores(longitude, latitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationStatus('error');
          setError('Failed to get your location. Please enable location services and try again.');
        }
      );
    };
    
    const fetchNearbyStores = async (longitude, latitude) => {
      try {
        const res = await fetch(`/api/stores/nearby?longitude=${longitude}&latitude=${latitude}&distance=10000`);
        
        if (!res.ok) {
          throw new Error('Failed to fetch nearby stores');
        }
        
        const data = await res.json();
        setStores(data.data.stores || []);
      } catch (error) {
        console.error('Error fetching stores:', error);
        setError('Failed to load stores');
      } finally {
        setIsLoading(false);
      }
    };
    
    detectLocation();
  }, []);
  
  // Handle manual refresh location
  const handleRefreshLocation = () => {
    setIsLoading(true);
    setLocationStatus('loading');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        setUserLocation({ longitude, latitude });
        setLocationStatus('success');
        
        // Fetch nearby stores
        fetchNearbyStores(longitude, latitude);
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationStatus('error');
        setError('Failed to get your location. Please enable location services and try again.');
        setIsLoading(false);
      }
    );
  };
  
  const fetchNearbyStores = async (longitude, latitude) => {
    try {
      const res = await fetch(`/api/stores/nearby?longitude=${longitude}&latitude=${latitude}&distance=10000`);
      
      if (!res.ok) {
        throw new Error('Failed to fetch nearby stores');
      }
      
      const data = await res.json();
      setStores(data.data.stores || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching stores:', error);
      setError('Failed to load stores');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate distance between two coordinates in kilometers
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };
  
  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };
  
  // Filter stores based on search query
  const filteredStores = stores.filter(store => {
    return store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (store.categories && store.categories.some(category => 
        category.toLowerCase().includes(searchQuery.toLowerCase())
      ));
  });
  
  // Sort stores by distance
  const sortedStores = filteredStores.sort((a, b) => {
    if (!userLocation) return 0;
    
    const distanceA = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      a.location.coordinates[1],
      a.location.coordinates[0]
    );
    
    const distanceB = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      b.location.coordinates[1],
      b.location.coordinates[0]
    );
    
    return distanceA - distanceB;
  });
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold">Nearby Stores</h1>
        <p className="text-muted-foreground">
          Discover local stores around you
        </p>
        
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search stores by name or category..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button
            variant="outline"
            onClick={handleRefreshLocation}
            disabled={locationStatus === 'loading'}
          >
            <Navigation className="mr-2 h-4 w-4" />
            {locationStatus === 'loading' ? 'Detecting...' : 'Refresh Location'}
          </Button>
        </div>
        
        {locationStatus === 'success' && userLocation && (
          <p className="text-sm text-muted-foreground flex items-center">
            <MapPin className="mr-1 h-4 w-4" />
            Using your current location to find nearby stores
          </p>
        )}
        
        {locationStatus === 'error' && (
          <div className="bg-destructive/10 p-3 rounded-md text-sm text-destructive flex items-start">
            <MapPin className="mr-2 h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>
              {error || 'Location services are disabled. Please enable location access to find nearby stores.'}
            </p>
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-lg">Finding stores near you...</p>
          </div>
        </div>
      ) : error && locationStatus !== 'success' ? (
        <Card className="mb-8">
          <CardContent className="pt-6 text-center">
            <div className="mb-4 flex justify-center">
              <MapPin className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-medium mb-2">Unable to find nearby stores</h2>
            <p className="text-muted-foreground mb-4">
              {error}
            </p>
            <Button onClick={handleRefreshLocation}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : sortedStores.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedStores.map((store) => {
            // Calculate distance if user location is available
            let distance = null;
            if (userLocation) {
              distance = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                store.location.coordinates[1],
                store.location.coordinates[0]
              );
            }
            
            return (
              <Link href={`/stores/${store._id}`} key={store._id}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                  <div className="h-40 bg-muted flex items-center justify-center">
                    <img 
                      src={store.coverImage || '/placeholder-store-cover.png'} 
                      alt={store.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{store.name}</CardTitle>
                        <CardDescription className="mt-1 line-clamp-2">
                          {store.description}
                        </CardDescription>
                      </div>
                      {store.logo && (
                        <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden border">
                          <img 
                            src={store.logo} 
                            alt={`${store.name} logo`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <MapPin className="mr-1 h-3.5 w-3.5" />
                      <span className="line-clamp-1">
                        {store.address.city}, {store.address.state}
                      </span>
                      {distance !== null && (
                        <span className="ml-auto font-medium text-foreground">
                          {distance < 1 
                            ? `${(distance * 1000).toFixed(0)}m` 
                            : `${distance.toFixed(1)}km`}
                        </span>
                      )}
                    </div>
                    {store.categories && store.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {store.categories.slice(0, 3).map((category) => (
                          <span 
                            key={category} 
                            className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full"
                          >
                            {category}
                          </span>
                        ))}
                        {store.categories.length > 3 && (
                          <span className="text-xs text-muted-foreground px-1 py-1">
                            +{store.categories.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <div className="flex justify-between items-center w-full">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        <span>
                          {/* Check if today is open */}
                          {store.operatingHours && store.operatingHours.length > 0
                            ? store.operatingHours.find(
                                h => h.day === new Date().toLocaleDateString('en-US', { weekday: 'long' })
                              )?.open
                              ? 'Open Today'
                              : 'Closed Today'
                            : 'Hours not available'}
                        </span>
                      </div>
                      <span className="text-sm text-primary inline-flex items-center">
                        View Store <ChevronRight className="ml-1 h-4 w-4" />
                      </span>
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card className="mb-8">
          <CardContent className="pt-6 text-center">
            <div className="mb-4 flex justify-center">
              <Store className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-medium mb-2">No stores found</h2>
            <p className="text-muted-foreground mb-4">
              We couldn't find any stores near your location.
            </p>
            <Button onClick={handleRefreshLocation}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}