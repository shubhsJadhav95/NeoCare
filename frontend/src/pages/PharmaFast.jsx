import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Clock, Package, Phone, Home, Plus, Minus, Trash2, Image as ImageIcon, Navigation } from "lucide-react";
import pharmafastLogo from "../assets/images/pharmafast.png";
import { submitDeliveryRequest } from "../services/pharmafastService";

export default function PharmaFast() {
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [items, setItems] = useState([]);
  const [prescriptionImage, setPrescriptionImage] = useState(null);
  const [deliveryInfo, setDeliveryInfo] = useState({
    name: "",
    phone: "",
    address: "",
    pincode: "",
    landmark: "",
    latitude: null,
    longitude: null,
  });
  const [requestSent, setRequestSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("pharmafast_order");
      if (saved) {
        const data = JSON.parse(saved);
        setOrderData(data);
        setPrescriptionImage(data.prescriptionImage || null);
        // Add quantity field to each item
        const itemsWithQuantity = data.items.map(item => ({
          ...item,
          quantity: item.quantity || 1
        }));
        setItems(itemsWithQuantity);
      } else {
        // No order data, redirect back
        navigate("/user/pharmascan");
      }
    } catch (e) {
      navigate("/user/pharmascan");
    }
  }, [navigate]);

  const updateQuantity = (itemId, change) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQuantity = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const removeItem = (itemId) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDeliveryInfo((prev) => ({ ...prev, [name]: value }));
  };

  const getCurrentLocation = () => {
    setGettingLocation(true);
    
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        setDeliveryInfo((prev) => ({
          ...prev,
          latitude,
          longitude,
        }));

        // Reverse geocode to get address (using a free API)
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          if (data.address) {
            const addr = data.address;
            const fullAddress = `${addr.road || ''}, ${addr.suburb || addr.neighbourhood || ''}, ${addr.city || addr.town || ''}`.replace(/^,\s*|,\s*$/g, '');
            
            setDeliveryInfo((prev) => ({
              ...prev,
              address: fullAddress || data.display_name,
              pincode: addr.postcode || prev.pincode,
            }));
          }
        } catch (error) {
          console.error("Error getting address:", error);
        }
        
        setGettingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to get your location. Please enter manually.");
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSubmitRequest = async () => {
    // Validate
    if (items.length === 0) {
      alert("Please add at least one item to your order");
      return;
    }
    
    if (!deliveryInfo.name || !deliveryInfo.phone || !deliveryInfo.address || !deliveryInfo.pincode) {
      alert("Please fill all required fields");
      return;
    }
    if (!deliveryInfo.latitude || !deliveryInfo.longitude) {
      const proceed = confirm("Live location not set. Continue with address and pincode only?");
      if (!proceed) return;
    }

    setLoading(true);
    try {
      // Simulate API call to send request to nearby medicals
      // await new Promise((resolve) => setTimeout(resolve, 2000));

      // Store request details
      const requestData = {
        items: items,
        total: calculateTotal(),
        delivery: deliveryInfo,
        prescriptionImage: prescriptionImage,
        status: "pending",
        requestedAt: new Date().toISOString(),
      };

      // Send to backend (Places-enabled) and store response
      try {
        const apiResponse = await submitDeliveryRequest(requestData);
        sessionStorage.setItem('pharmafast_request', JSON.stringify(requestData));
        sessionStorage.setItem('pharmafast_response', JSON.stringify(apiResponse));
      } catch (e) {
        // Fallback: store only request, page will simulate stores
        console.warn('PharmaFast API unavailable, using fallback simulation', e);
        sessionStorage.setItem('pharmafast_request', JSON.stringify(requestData));
      }

      // Navigate to pharmastore page
      navigate('/user/pharmafast/pharmastore');
    } catch (error) {
      alert("Failed to send request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!orderData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">Loading order details...</div>
      </div>
    );
  }

  if (requestSent) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Sent!</h2>
          <p className="text-gray-600 mb-6">
            Your medicine delivery request has been sent to nearby medical stores. You will be notified once a store
            accepts your order.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <Clock className="w-4 h-4 inline mr-1" />
              Estimated delivery: 30-60 minutes after acceptance
            </p>
          </div>
          <button
            onClick={() => navigate("/user/pharmascan")}
            className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white transition-colors font-medium"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <img src={pharmafastLogo} alt="PharmaFast" className="h-16 object-contain" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">PharmaFast Delivery</h1>
            <p className="text-gray-600">Get your medicines delivered from nearby medical stores</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-cyan-600" />
                Order Summary
              </h2>
              {items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No items in order</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500">{item.form}</div>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600">Quantity:</span>
                            <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="p-1.5 hover:bg-gray-100 rounded-l-lg"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="w-4 h-4 text-gray-600" />
                              </button>
                              <span className="px-3 font-medium text-gray-900">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="p-1.5 hover:bg-gray-100 rounded-r-lg"
                              >
                                <Plus className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500">₹ {item.price.toFixed(2)} each</div>
                            <div className="text-gray-900 font-semibold">₹ {(item.price * item.quantity).toFixed(2)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total Amount</span>
                    <span className="text-xl font-bold text-cyan-600">₹ {calculateTotal().toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Prescription Image */}
            {prescriptionImage && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-cyan-600" />
                  Uploaded Prescription
                </h2>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <img 
                    src={prescriptionImage} 
                    alt="Prescription" 
                    className="w-full h-auto object-contain max-h-96"
                  />
                </div>
              </div>
            )}

            {/* Delivery Information Form */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Home className="w-5 h-5 text-cyan-600" />
                Delivery Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={deliveryInfo.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={deliveryInfo.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Enter 10-digit phone number"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Delivery Address <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={gettingLocation}
                      className="flex items-center gap-1 text-xs text-cyan-600 hover:text-cyan-700 font-medium disabled:opacity-50"
                    >
                      <Navigation className="w-3 h-3" />
                      {gettingLocation ? "Getting location..." : "Use Live Location"}
                    </button>
                  </div>
                  <textarea
                    name="address"
                    value={deliveryInfo.address}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="House/Flat No., Street, Area"
                  />
                  {deliveryInfo.latitude && deliveryInfo.longitude && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Location detected: {deliveryInfo.latitude.toFixed(6)}, {deliveryInfo.longitude.toFixed(6)}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={deliveryInfo.pincode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="6-digit pincode"
                      maxLength="6"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Landmark</label>
                    <input
                      type="text"
                      name="landmark"
                      value={deliveryInfo.landmark}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">How it works</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-cyan-600 font-semibold text-sm">1</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">Submit Request</div>
                    <div className="text-xs text-gray-600">Your order is sent to nearby medical stores</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-cyan-600 font-semibold text-sm">2</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">Store Accepts</div>
                    <div className="text-xs text-gray-600">A nearby store confirms availability</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-cyan-600 font-semibold text-sm">3</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">Fast Delivery</div>
                    <div className="text-xs text-gray-600">Medicines delivered to your doorstep</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-900 text-sm">Quick Delivery</div>
                  <div className="text-xs text-blue-700 mt-1">
                    Estimated delivery time: 30-60 minutes after store acceptance
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmitRequest}
              disabled={loading}
              className={`w-full py-3 rounded-xl text-white font-medium transition-colors ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-cyan-600 hover:bg-cyan-700"
              }`}
            >
              {loading ? "Sending Request..." : "Send Request to Nearby Stores"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
