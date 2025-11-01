import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Phone, Clock, CheckCircle, XCircle, Loader, Store, Navigation, Map } from "lucide-react";

export default function PharmaStore() {
  const navigate = useNavigate();
  const [requestData, setRequestData] = useState(null);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapUrl, setMapUrl] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const mapRef = useRef(null);
  const [googleReady, setGoogleReady] = useState(false);

  const googleApiKey = useMemo(() => {
    // Expect key in Vite env: VITE_GOOGLE_MAPS_API_KEY
    return import.meta?.env?.VITE_GOOGLE_MAPS_API_KEY;
  }, []);

  useEffect(() => {
    // Load request data
    try {
      const saved = sessionStorage.getItem("pharmafast_request");
      const savedResp = sessionStorage.getItem("pharmafast_response");
      if (saved) {
        const data = JSON.parse(saved);
        setRequestData(data);
        
        // If location coordinates available, use them for map
        if (data.delivery.latitude && data.delivery.longitude) {
          setUserLocation({
            latitude: data.delivery.latitude,
            longitude: data.delivery.longitude
          });
          
          // Prefer backend-provided map URL (e.g., Google Maps) if present
          if (savedResp) {
            try {
              const resp = JSON.parse(savedResp);
              if (resp.mapUrl) {
                setMapUrl(resp.mapUrl);
              }
            } catch {}
          }
          
          // Fallback to OpenStreetMap embed URL
          if (!savedResp || !JSON.parse(savedResp || '{}').mapUrl) {
            const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${data.delivery.longitude-0.01},${data.delivery.latitude-0.01},${data.delivery.longitude+0.01},${data.delivery.latitude+0.01}&layer=mapnik&marker=${data.delivery.latitude},${data.delivery.longitude}`;
            setMapUrl(osmUrl);
          }
        }
        
        // Use backend stores if available; else simulate
        if (savedResp) {
          try {
            const resp = JSON.parse(savedResp);
            if (resp.success && Array.isArray(resp.stores)) {
              setStores(resp.stores);
              setLoading(false);
              return;
            }
          } catch {}
        }

        // Fallback simulation
        setTimeout(() => {
          const nearbyStores = generateNearbyStores(data.delivery.pincode, data.delivery.latitude, data.delivery.longitude);
          setStores(nearbyStores);
          setLoading(false);
        }, 1000);
      } else {
        navigate("/user/pharmafast");
      }
    } catch (e) {
      navigate("/user/pharmafast");
    }
  }, [navigate]);

  const generateNearbyStores = (pincode, userLat, userLon) => {
    // Simulate nearby medical stores
    const storeNames = [
      "Apollo Pharmacy",
      "MedPlus Health Services",
      "Wellness Forever",
      "Netmeds",
      "PharmEasy Store",
      "HealthKart Pharmacy",
      "1mg Store",
      "Cure+ Pharmacy"
    ];

    const statuses = ["pending", "accepted", "rejected"];
    
    return storeNames.slice(0, 5 + Math.floor(Math.random() * 3)).map((name, index) => {
      const distance = (0.5 + Math.random() * 4).toFixed(1);
      const status = index === 0 ? "accepted" : index === 1 ? "pending" : statuses[Math.floor(Math.random() * statuses.length)];
      
      return {
        id: index + 1,
        name: name,
        address: `Shop ${10 + index}, ${["Main Road", "Market Street", "Gandhi Nagar", "Station Road"][index % 4]}, Near ${pincode}`,
        phone: `+91 ${9000000000 + Math.floor(Math.random() * 99999999)}`,
        distance: `${distance} km`,
        rating: (4.0 + Math.random() * 1).toFixed(1),
        status: status,
        estimatedTime: status === "accepted" ? `${20 + Math.floor(Math.random() * 30)} mins` : null,
        respondedAt: status !== "pending" ? new Date(Date.now() - Math.random() * 300000).toLocaleTimeString() : null
      };

  // Load Google Maps JS if API key present
  useEffect(() => {
    if (!googleApiKey) return;
    if (window.google && window.google.maps) {
      setGoogleReady(true);
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleReady(true);
    script.onerror = () => setGoogleReady(false);
    document.body.appendChild(script);
    return () => {
      // do not remove script to avoid reload flicker
    };
  }, [googleApiKey]);

  // Initialize Google Map with markers when ready
  useEffect(() => {
    if (!googleReady || !userLocation || !stores?.length) return;
    if (!mapRef.current) return;
    try {
      const center = { lat: Number(userLocation.latitude), lng: Number(userLocation.longitude) };
      const map = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 14,
        mapTypeControl: false,
        streetViewControl: false,
      });
      // User marker
      new window.google.maps.Marker({
        position: center,
        map,
        title: 'Your location',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#0ea5e9',
          fillOpacity: 1,
          strokeColor: '#0369a1',
          strokeWeight: 2,
        },
      });
      // Store markers
      const bounds = new window.google.maps.LatLngBounds(center);
      stores.forEach((s) => {
        if (!s.latitude || !s.longitude) return;
        const pos = { lat: Number(s.latitude), lng: Number(s.longitude) };
        const marker = new window.google.maps.Marker({
          position: pos,
          map,
          title: s.name,
        });
        const info = new window.google.maps.InfoWindow({
          content: `<div style="font-size:13px"><strong>${s.name}</strong><br/>${s.address || ''}<br/>${(s.distance ?? '').toString()} km • ⭐ ${(s.rating ?? '').toString()}</div>`
        });
        marker.addListener('click', () => info.open({ map, anchor: marker }));
        bounds.extend(pos);
      });
      map.fitBounds(bounds);
    } catch (e) {
      // ignore map errors and rely on iframe fallback
    }
  }, [googleReady, userLocation, stores]);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-cyan-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Finding nearby medical stores...</p>
        </div>
      </div>
    );
  }

  if (!requestData) {
    return null;
  }

  const acceptedStore = stores.find(s => s.status === "accepted");
  const pendingStores = stores.filter(s => s.status === "pending");
  const rejectedStores = stores.filter(s => s.status === "rejected");

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Nearby Medical Stores</h1>
          <p className="text-gray-600">Request sent to {stores.length} stores near {requestData.delivery.pincode}</p>
        </div>

        {/* Request Summary */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Your Order Request</h2>
              <p className="text-sm text-gray-600">Delivery to: {requestData.delivery.address}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Total Amount</div>
              <div className="text-xl font-bold text-cyan-600">₹ {requestData.total.toFixed(2)}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-700">{requestData.delivery.pincode}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-700">{requestData.delivery.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-700">Requested: {new Date(requestData.requestedAt).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* Map View */}
        {(userLocation && (googleApiKey || mapUrl)) && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Map className="w-5 h-5 text-cyan-600" />
              Nearby Medical Stores Map
            </h2>
            {googleApiKey && (
              <div ref={mapRef} className="w-full h-[400px] rounded-lg border border-gray-300" />
            )}
            {!googleApiKey && mapUrl && (
              <div className="rounded-lg overflow-hidden border border-gray-300">
                <iframe
                  src={mapUrl}
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  loading="lazy"
                  title="Medical Stores Map"
                />
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Your location: {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
            </p>
          </div>
        )}

        {/* Accepted Store (if any) */}
        {acceptedStore && (
          <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-green-900">{acceptedStore.name}</h3>
                    <p className="text-sm text-green-700">✓ Request Accepted</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-green-700">Estimated Delivery</div>
                    <div className="text-lg font-bold text-green-900">{acceptedStore.estimatedTime}</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-green-800">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{acceptedStore.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{acceptedStore.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4" />
                    <span>{acceptedStore.distance} away • Rating: {acceptedStore.rating} ⭐</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-green-200">
                  <p className="text-sm text-green-700">
                    Your order is being prepared. You will receive a call shortly for confirmation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pending Stores */}
        {pendingStores.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Loader className="w-5 h-5 text-orange-500 animate-spin" />
              Awaiting Response ({pendingStores.length})
            </h2>
            <div className="space-y-3">
              {pendingStores.map((store) => (
                <div key={store.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Store className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{store.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{store.address}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Navigation className="w-3 h-3" />
                            {store.distance}
                          </span>
                          <span>⭐ {store.rating}</span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {store.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                        Pending
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rejected Stores */}
        {rejectedStores.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              Unavailable ({rejectedStores.length})
            </h2>
            <div className="space-y-3">
              {rejectedStores.map((store) => (
                <div key={store.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 opacity-75">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <Store className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-700">{store.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{store.address}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Navigation className="w-3 h-3" />
                            {store.distance}
                          </span>
                          <span>⭐ {store.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        Not Available
                      </span>
                      {store.respondedAt && (
                        <p className="text-xs text-gray-500 mt-1">{store.respondedAt}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/user/pharmascan")}
            className="flex-1 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Back to Home
          </button>
          {acceptedStore && (
            <button
              onClick={() => {
                // In real app, navigate to order tracking
                alert("Order tracking feature coming soon!");
              }}
              className="flex-1 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-medium transition-colors"
            >
              Track Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
