// LocationPicker.tsx

import { Circle, GoogleMap, Libraries, Marker, useLoadScript } from '@react-google-maps/api';
import { Loader2, LocateFixed } from 'lucide-react';
import { useTheme } from 'next-themes';
import React, { useEffect, useRef, useState } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { googleMapsDarkStyles, googleMapsLightStyles } from '@/shared/google-maps-styles';

interface LocationPickerProps {
  initialAddress?: string;
  initialLatitude?: number | null;
  initialLongitude?: number | null;
  showExactLocationSwitch?: boolean;
  initialShowExactLocation?: boolean;
  onAddressChange?: (address: string) => void;
  onLocationChange?: (lat: number, lng: number) => void;
  onShowExactLocationChange?: (showExactLocation: boolean) => void;
  errors?: {
    address?: string;
  };
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  initialAddress = '',
  initialLatitude,
  initialLongitude,
  showExactLocationSwitch = true,
  initialShowExactLocation = true,
  onAddressChange,
  onLocationChange,
  onShowExactLocationChange,
  errors = { address: undefined },
}) => {
  const [addressInput, setAddressInput] = useState(initialAddress);
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<google.maps.LatLngLiteral | null>(
    initialLatitude && initialLongitude ? { lat: initialLatitude, lng: initialLongitude } : null,
  );
  const [showExactLocation, setShowExactLocation] = useState(initialShowExactLocation);
  const [isFetchingCurrentLocation, setIsFetchingCurrentLocation] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);

  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral | null>(selectedLocation);
  const [mapZoom, setMapZoom] = useState<number>(14);
  const [customPin, setCustomPin] = useState<google.maps.Icon | null>(null);
  const [activePredictionIndex, setActivePredictionIndex] = useState<number>(-1);
  const libraries: Libraries = ['places', 'geometry'];

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries,
  });
  const { theme } = useTheme();

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddressInput(value);
    onAddressChange?.(value);

    if (!value) {
      setPredictions([]);
      setActivePredictionIndex(-1);
      return;
    }

    const service = new google.maps.places.AutocompleteService();
    return service.getPlacePredictions(
      {
        input: value,
        types: ['address'],
      },
      (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          // Filter predictions to only include residential addresses
          const residentialPredictions = predictions.filter(
            (prediction) =>
              prediction.types.includes('street_address') || prediction.types.includes('premise'),
          );
          setPredictions(residentialPredictions);
          setActivePredictionIndex(-1);
        } else {
          setPredictions([]);
          setActivePredictionIndex(-1);
        }
      },
    );
  };

  const handleSelectPrediction = (prediction: google.maps.places.AutocompletePrediction) => {
    setAddressInput(prediction.description);
    onAddressChange?.(prediction.description);
    setPredictions([]);
    setActivePredictionIndex(-1);

    const geocoder = new google.maps.Geocoder();
    return geocoder.geocode({ placeId: prediction.place_id }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
        const location = results[0].geometry?.location;
        if (location) {
          const lat = location.lat();
          const lng = location.lng();
          if (typeof lat === 'number' && typeof lng === 'number') {
            setSelectedLocation({ lat, lng });
            setMapCenter({ lat, lng });
            setMapZoom(14); // Default zoom level
            onLocationChange?.(lat, lng);
          }
        }
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (predictions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActivePredictionIndex((prevIndex) =>
          prevIndex + 1 >= predictions.length ? 0 : prevIndex + 1,
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActivePredictionIndex((prevIndex) =>
          prevIndex <= 0 ? predictions.length - 1 : prevIndex - 1,
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activePredictionIndex >= 0 && activePredictionIndex < predictions.length) {
          return handleSelectPrediction(predictions[activePredictionIndex]);
        }
      } else if (e.key === 'Escape') {
        setPredictions([]);
        setActivePredictionIndex(-1);
      }
    }
  };

  // New function to handle fetching user's current location
  const handleFetchCurrentLocation = (e: React.MouseEvent<SVGSVGElement>) => {
    e.preventDefault();
    if (navigator.geolocation) {
      setIsFetchingCurrentLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setSelectedLocation({ lat: latitude, lng: longitude });
          setMapCenter({ lat: latitude, lng: longitude });
          setMapZoom(14);
          onLocationChange?.(latitude, longitude);

          // Reverse geocode to get address
          const geocoder = new google.maps.Geocoder();
          return geocoder.geocode(
            { location: { lat: latitude, lng: longitude } },
            (results, status) => {
              setIsFetchingCurrentLocation(false);
              if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
                const address = results[0].formatted_address;
                setAddressInput(address);
                onAddressChange?.(address);
              }
            },
          );
        },
        (error) => {
          alert(`Unable to retrieve your location: ${error.message}`);
        },
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  useEffect(() => {
    if (!isLoaded) return;
    if (selectedLocation && google.maps.geometry) {
      if (showExactLocation) {
        setMapCenter(selectedLocation);
        setMapZoom(14);
      } else {
        const { lat, lng } = selectedLocation;
        const radiusInMeters = 1000; // 1km radius

        const bounds = new google.maps.LatLngBounds();

        const center = new google.maps.LatLng(lat, lng);

        const north = google.maps.geometry.spherical.computeOffset(center, radiusInMeters, 0);
        const east = google.maps.geometry.spherical.computeOffset(center, radiusInMeters, 90);
        const south = google.maps.geometry.spherical.computeOffset(center, radiusInMeters, 180);
        const west = google.maps.geometry.spherical.computeOffset(center, radiusInMeters, 270);

        bounds.extend(north);
        bounds.extend(east);
        bounds.extend(south);
        bounds.extend(west);

        const paddingMultiplier = 1.2;
        const paddedBounds = expandBounds(bounds, paddingMultiplier);

        if (mapRef.current) {
          mapRef.current.fitBounds(paddedBounds);

          const newCenter = mapRef.current.getCenter()?.toJSON();
          const newZoom = mapRef.current.getZoom();

          if (newCenter) {
            setMapCenter(newCenter);
          }
          if (newZoom !== undefined) {
            setMapZoom(newZoom);
          }
        }
      }
    }
  }, [selectedLocation, showExactLocation, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    const image = new Image();
    image.src = '/images/map-pin.png';
    image.onload = () => {
      setCustomPin({
        url: image.src,
        scaledSize: new google.maps.Size(40, 40),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(20, 40),
      });
    };
  }, [isLoaded]);

  // Helper function to expand bounds
  const expandBounds = (
    bounds: google.maps.LatLngBounds,
    multiplier: number,
  ): google.maps.LatLngBounds => {
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();

    const latDiff = ne.lat() - sw.lat();
    const lngDiff = ne.lng() - sw.lng();

    const newSw = new google.maps.LatLng(
      sw.lat() - (latDiff * (multiplier - 1)) / 2,
      sw.lng() - (lngDiff * (multiplier - 1)) / 2,
    );
    const newNe = new google.maps.LatLng(
      ne.lat() + (latDiff * (multiplier - 1)) / 2,
      ne.lng() + (lngDiff * (multiplier - 1)) / 2,
    );

    return new google.maps.LatLngBounds(newSw, newNe);
  };

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  return (
    <div className='min-h-64 space-y-4'>
      {!isLoaded ? (
        <div className='flex h-64 items-center justify-center'>
          <Loader2 className='animate-spin motion-reduce:animate-none' />
        </div>
      ) : (
        <>
          <div className='relative'>
            <Label htmlFor='address'>Address</Label>
            <div className='relative'>
              <Input
                id='address'
                value={addressInput}
                onChange={handleAddressChange}
                onKeyDown={handleKeyDown}
                placeholder='Enter your address'
                autoComplete='off'
                className='pr-10' // Add padding to the right
              />
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger className='absolute right-2 top-1/2 -translate-y-1/2 transform'>
                    <LocateFixed
                      className='text-muted-foreground hover: cursor-pointer'
                      onClick={handleFetchCurrentLocation}
                    />
                  </TooltipTrigger>
                  <TooltipContent className='bg-foreground text-background'>
                    <span className=''>Use current location</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            {isFetchingCurrentLocation && (
              <span className='text-muted-foreground'>
                <div className='flex items-center gap-2'>
                  <Loader2 className='h-4 w-4 animate-spin motion-reduce:animate-none' />
                  <span>Fetching current location...</span>
                </div>
              </span>
            )}
            {errors.address && <span className='text-red-500'>{errors.address}</span>}
            {predictions.length > 0 && (
              <ul className='border-border/15 bg-background absolute z-10 mt-1 w-full rounded-md border shadow-lg'>
                {predictions.map((prediction, index) => (
                  <li
                    key={prediction.place_id}
                    className={`hover:bg-muted-foreground/50 cursor-pointer px-4 py-2 ${
                      index === activePredictionIndex ? 'bg-muted' : ''
                    }`}
                    onClick={() => handleSelectPrediction(prediction)}
                  >
                    {prediction.description}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {mapCenter && (
            <>
              {showExactLocationSwitch && (
                <div className='mt-4 flex items-center'>
                  <Switch
                    id='showExactLocation'
                    checked={showExactLocation}
                    onCheckedChange={(checked) => {
                      setShowExactLocation(checked);
                      onShowExactLocationChange?.(checked);
                    }}
                  />
                  <Label htmlFor='showExactLocation' className='ml-2'>
                    Show exact location
                  </Label>
                </div>
              )}
              <div className='mt-4 h-64 w-full'>
                <GoogleMap
                  onLoad={(map) => {
                    mapRef.current = map;
                  }}
                  center={mapCenter}
                  zoom={mapZoom}
                  mapContainerStyle={{ height: '100%', width: '100%' }}
                  options={{
                    styles: theme === 'dark' ? googleMapsDarkStyles : googleMapsLightStyles,
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false,
                  }}
                >
                  {selectedLocation && (
                    <Marker
                      title='Your property location'
                      position={selectedLocation}
                      visible={showExactLocation}
                      icon={customPin || undefined}
                      options={{
                        optimized: false,
                      }}
                    />
                  )}

                  {selectedLocation && (
                    <Circle
                      center={selectedLocation}
                      radius={1000} // 1km radius
                      options={{
                        strokeColor: '#4285F4',
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                        fillColor: '#4285F4',
                        fillOpacity: 0.35,
                      }}
                      visible={!showExactLocation}
                    />
                  )}
                </GoogleMap>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};
