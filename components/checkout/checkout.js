"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ToastContainer, toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import {AuthModal} from '@/components/AuthModal';

// Dynamically load Razorpay script
const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};


export default function CheckoutPage() {
  const router = useRouter();
  
  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    businessName: "",
    country: "",
    address: "",
    landmark: "",
    city: "",
    state: "",
    postCode: "",
    phonenumber: "",
    email: "",
    additionalInfo: "",
  });

  const [useraddress, setUseraddress] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [useSavedAddress, setUseSavedAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [error, setError] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authError, setAuthError] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch cart data and user address
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setShowAuthModal(true);
        setLoading(false);
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const userId = decoded.userId;

        // Fetch cart data
        const cartResponse = await fetch('/api/cart', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!cartResponse.ok) {
          throw new Error('Failed to fetch cart data');
        }

        const cartData = await cartResponse.json();
        setCartItems(cartData.cart.items);

        // Fetch user address
        const addressResponse = await fetch(`/api/useraddress?user_id=${userId}`);
        if (!addressResponse.ok) {
          throw new Error('Failed to fetch address data');
        }

        const addressData = await addressResponse.json();
        setUseraddress(addressData.userAddress);

        // Pre-fill form with first address if available
        if (addressData.userAddress.length > 0) {
          const addr = addressData.userAddress[0];
          setFormData(prev => ({
            ...prev,
            firstName: addr.firstName || "",
            lastName: addr.lastName || "",
            country: addr.country || "",
            address: addr.address || "",
            city: addr.city || "",
            state: addr.state || "",
            postCode: addr.postCode || "",
            phonenumber: addr.phonenumber || "",
            landmark: addr.landmark || "",
            email: addr.email || "",
            businessName: addr.businessName || "",
            additionalInfo: addr.additionalInfo || ""
          }));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load checkout data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle Form Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Payment Selection
  const handlePaymentChange = (e) => {
    setPaymentMethod(e.target.value);
  };

    // Initialize Razorpay
    const initializeRazorpay = async () => {
      return await loadRazorpay();
    };
  
    // Create Razorpay Order
    const createRazorpayOrder = async (amount) => {
      try {
        const res = await fetch('/api/create-razorpay-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: amount * 100 }) // Convert to paise
        });
        return await res.json();
      } catch (error) {
        throw new Error('Failed to create Razorpay order');
      }
    };
  
    // Handle Online Payment
    const handleOnlinePayment = async (totalAmount) => {
      try {
        const razorpayLoaded = await initializeRazorpay();
        if (!razorpayLoaded) {
          toast.error('Razorpay SDK failed to load');
          return;
        }
    
        const orderResponse = await createRazorpayOrder(totalAmount);
        const { order } = orderResponse;
    
        return new Promise((resolve, reject) => {
          const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_TEST_KEY,
            amount: order.amount,
            currency: "INR",
            name: "BEA",
            description: "Product Purchase",
            order_id: order.id,
            handler: async function (response) {
              try {
                const verificationRes = await fetch('/api/verify-payment', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature
                  })
                });
    
                if (verificationRes.ok) {
                  resolve({
                    paymentId: response.razorpay_payment_id,
                    status: "paid",
                    mode: "online"
                  });
                } else {
                  reject(new Error('Payment verification failed'));
                }
              } catch (err) {
                reject(err);
              }
            },
            prefill: {
              name: `${formData.firstName} ${formData.lastName}`,
              email: formData.email,
              contact: formData.phonenumber
            },
            theme: {
              color: "#F37254"
            }
          };
    
          const razorpay = new window.Razorpay(options);
          razorpay.open();
    
          razorpay.on('payment.failed', function (response) {
            reject(new Error(response.error.description));
          });
        });
    
      } catch (error) {
        console.error('Razorpay error:', error);
        toast.error('Payment processing failed');
        throw error;
      }
    };
    

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setShowAuthModal(true);
        return;
      }
      const decoded = jwtDecode(token);
      const userId = decoded.userId;
  
      // Use saved address data if selected, otherwise use form data
      const addressData = useSavedAddress && selectedAddress !== null 
        ? useraddress[selectedAddress]
        : formData;
  
      // Validation Checks (only if not using saved address)
      if (!useSavedAddress || selectedAddress === null) {
        // Email Validation Regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // Phone Validation (10-digit number)
        const phoneRegex = /^[0-9]{10}$/;
        // Postal Code Validation (4 to 6 digits)
        const postCodeRegex = /^[0-9]{4,6}$/;
  
        if (!addressData.firstName || !addressData.lastName || !addressData.email || 
            !addressData.phonenumber || !addressData.postCode) {
          toast.error("Please fill in all required fields.");
          return;
        }
        if (!emailRegex.test(addressData.email)) {
          toast.error("Please enter a valid email address.");
          return;
        }
        if (!phoneRegex.test(addressData.phonenumber)) {
          toast.error("Please enter a valid 10-digit phone number.");
          return;
        }
        if (!postCodeRegex.test(addressData.postCode)) {
          toast.error("Please enter a valid postal code (4-6 digits).");
          return;
        }
      }
  
      setError("");
  
      const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      let paymentId = "";
      let paymentStatus = "";
      let paymentMode = "";
  
      if (paymentMethod === 'cash') {
        paymentId = "COD_" + Date.now();
        paymentStatus = "pending";
        paymentMode = "cash";
      } else if (paymentMethod === 'online') {
        console.log("Online Payment");
        // const paymentResult = await handleOnlinePayment(totalAmount);
        // if (!paymentResult.ok) {
        //   throw new Error('Online payment processing failed');
        // }
        // paymentId = paymentResult.paymentId;
        // paymentStatus = paymentResult.status;
        // paymentMode = paymentResult.mode;

        try {
          const result = await handleOnlinePayment(totalAmount);
          paymentId = result.paymentId;
          paymentStatus = result.status;
          paymentMode = result.mode;
        } catch (error) {
          toast.error(`Payment failed: ${error.message}`);
          return;
        }
      } else {
        console.log("Invalid Payment Method");
        return;
      }
 
      // Only save new address if not using saved address
      if (!useSavedAddress || selectedAddress === null) {
        const formDataToSend = new FormData();
        formDataToSend.append('userId', userId);
        formDataToSend.append('firstname', addressData.firstName);
        formDataToSend.append('lastName', addressData.lastName);
        formDataToSend.append('businessName', addressData.businessName || '');
        formDataToSend.append('country', addressData.country);
        formDataToSend.append('email', addressData.email);
        formDataToSend.append('address', addressData.address);
        formDataToSend.append('postCode', addressData.postCode);
        formDataToSend.append('city', addressData.city);
        formDataToSend.append('state', addressData.state);
        formDataToSend.append('landmark', addressData.landmark || '');
        formDataToSend.append('phonenumber', addressData.phonenumber);
        formDataToSend.append('altnumber', addressData.altnumber || '');
        formDataToSend.append('gst_name', addressData.gst_name || '');
        formDataToSend.append('gst_number', addressData.gst_number || '');
        formDataToSend.append('additionalInfo', addressData.additionalInfo || '');
  
        const addressRes = await fetch('/api/useraddress/add', {
          method: 'POST',
          body: formDataToSend,
        });
  
        if (!addressRes.ok) {
          throw new Error('Failed to save address');
        }
        const newAddressData = await addressRes.json();

        setUseraddress(prev => [...prev, newAddressData.userAddress]);
      }
  
      // Save Payment
      const paymentRes = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          payment_mode: paymentMode,
          status: paymentStatus,
          modevalue: totalAmount,
          payment_id: paymentId,
          payment_Date: new Date(),
        }),
      });
  
      if (!paymentRes.ok) {
        throw new Error('Payment processing failed');
      }
  
      const res = await paymentRes.json();
      const paymentData = res.paymentData;
      // Prepare delivery address string
      const deliveryAddress = useSavedAddress && selectedAddress !== null
        ? `${useraddress[selectedAddress].address}, ${useraddress[selectedAddress].city}, ${useraddress[selectedAddress].state}, ${useraddress[selectedAddress].country}, ${useraddress[selectedAddress].postCode}`
        : `${addressData.address}, ${addressData.city}, ${addressData.state}, ${addressData.country}, ${addressData.postCode}`;
  
      // Save Order
      console.log(addressData,paymentData);
      console.log(useSavedAddress,selectedAddress,useraddress);

      const orderRes = await fetch('/api/orders/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          user_adddeliveryid: useSavedAddress && selectedAddress !== null 
            ? useraddress[selectedAddress]._id 
            :  useraddress[0]?._id,
          order_username: `${addressData.firstName} ${addressData.lastName}`,
          order_phonenumber: addressData.phonenumber,
          email_address: addressData.email,
          order_item: cartItems,
          order_amount: totalAmount,
          order_deliveryaddress: deliveryAddress,
          payment_method: paymentMethod,
          payment_type: paymentMode,
          order_status: "pending",
          delivery_type: "standard",
          payment_id: paymentData._id,
          payment_status: paymentData.status,
          order_number: "ORD" + Date.now(),
          order_details: cartItems.map((item) => ({
            item_code: `ITEM${item.id}`,
            product_id: item.id,
            product_name: item.name,
            product_price: item.price,
            model: "N/A",
            user_id: userId,
            coupondiscount: 0,
            created_at: new Date(),
            updated_at: new Date(),
            quantity: 1,
            store_id: "STORE01",
            orderNumber: "ORD" + Date.now(),
          })),
        }),
      });
      if (!orderRes.ok) {
        throw new Error('Order creation failed');
      }

      // Clear cart after successful order
      const cartdelte = await fetch('/api/cart', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ clearAll: true })
      });

      if (cartdelte.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      if (cartdelte.status === 200) {
          const orderData = await orderRes.json()
          // Prepare email data
          const emailData = {
            orderDetails: {
              order_number: orderData.order_number || "ORD" + Date.now(),
              order_amount: totalAmount,
              payment_method: paymentMethod === 'cash' ? 'Cash on Delivery' : 'Online Payment',
              order_item: cartItems,
              order_username: `${addressData.firstName} ${addressData.lastName}`,
              order_phonenumber: addressData.phonenumber,
              order_deliveryaddress: deliveryAddress
            },
            customerEmail: addressData.email,
            adminEmail: 'msivaranjani2036@gmail.com' // Replace with your admin email
          };
          console.log(emailData);
          alert("fgg");
          // Send confirmation emails
          const emailResponse = await fetch('/api/send-order-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emailData)
          });

          if (!emailResponse.ok) {
            const errorData = await emailResponse.json();
            console.error('Email sending failed:', errorData.error);
            // Don't fail the order if email fails, just log it
          }
        }

      toast.success("Order placed successfully!");
      router.push('/order');
      
    } catch (error) {
      console.error("Error submitting order:", error);
      toast.error("Failed to place order. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <ToastContainer position="top-right" autoClose={5000} />
      
      {/* 🟠 Checkout Header Bar */}
      <div className="bg-blue-50 py-6 px-8 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Checkout</h2>
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">🏠 Home</span>
          <span className="text-gray-500">›</span>
          <span className="text-orange-500 font-semibold">Checkout</span>
        </div>
      </div>

      <div className="max-w-9xl mx-auto rounded-lg p-8">
        {useraddress && useraddress.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Saved Addresses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {useraddress.map((item, index) => (
                <div 
                  key={`address-${index}`} 
                  className={`border p-4 rounded-lg cursor-pointer transition-all ${selectedAddress === index ? 'border-orange-500 bg-orange-50' : 'hover:border-gray-300'}`}
                  onClick={() => setSelectedAddress(index)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{item.firstName} {item.lastName}</p>
                      <p className="text-sm text-gray-600">{item.address}</p>
                      <p className="text-sm text-gray-600">{item.city}, {item.state}, {item.postCode}</p>
                      <p className="text-sm text-gray-600">{item.country}</p>
                      <p className="text-sm text-gray-600">Phone: {item.phonenumber}</p>
                    </div>
                    {selectedAddress === index && (
                      <span className="text-orange-500">✓ Selected</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <button 
                onClick={() => setUseSavedAddress(!useSavedAddress)}
                className="text-orange-500 hover:text-orange-700 text-sm font-medium"
              >
                {useSavedAddress ? 'Use new address instead' : 'Use saved address'}
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left - Checkout Form */}
          <div className="w-full lg:w-2/3 bg-white border p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {useSavedAddress && selectedAddress !== null ? 'Selected Address' : 'Billing Details'}
            </h2>

            {error && <p className="text-red-500 text-bold-sm mb-4">{error}</p>}

            {useSavedAddress && selectedAddress !== null ? (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <p><span className="font-medium">Name:</span> {useraddress[selectedAddress].firstName} {useraddress[selectedAddress].lastName}</p>
                  <p><span className="font-medium">Phone:</span> {useraddress[selectedAddress].phonenumber}</p>
                  <p><span className="font-medium">Address:</span> {useraddress[selectedAddress].address}</p>
                  <p><span className="font-medium">City:</span> {useraddress[selectedAddress].city}</p>
                  <p><span className="font-medium">State:</span> {useraddress[selectedAddress].state}</p>
                  <p><span className="font-medium">Country:</span> {useraddress[selectedAddress].country}</p>
                  <p><span className="font-medium">Postal Code:</span> {useraddress[selectedAddress].postCode}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} className="border p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-200" required/>
                  <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} className="border p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-200" required/>
                </div>

                <input type="text" name="businessName" placeholder="Business Name (Optional)" value={formData.businessName} onChange={handleChange} className="border p-2 rounded-md w-full mt-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-200"/>
                <input type="text" name="country" placeholder="Country" value={formData.country} onChange={handleChange} className="border p-2 rounded-md w-full mt-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-200"/>
                <input type="text" name="address" placeholder="House number and street name" value={formData.address} onChange={handleChange} className="border p-2 rounded-md w-full mt-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-200"/>
                <input type="text" name="landmark" placeholder="landmark, suite, unit, etc. (Optional)" value={formData.landmark} onChange={handleChange} className="border p-2 rounded-md w-full mt-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-200"/>

                <div className="grid grid-cols-2 gap-4 mt-3">
                  <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} className="border p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-200"/>
                  <input type="text" name="state" placeholder="State/Province" value={formData.state} onChange={handleChange} className="border p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-200"/>
                </div>

                <input type="text" name="postCode" placeholder="Post Code" value={formData.postCode} onChange={handleChange} className="border p-2 rounded-md w-full mt-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-200"/>
                <input type="text" name="phonenumber" placeholder="phonenumber" value={formData.phonenumber} onChange={handleChange} className="border p-2 rounded-md w-full mt-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-200" />
                <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} className="border p-2 rounded-md w-full mt-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-200" />

                <h3 className="text-lg font-semibold text-gray-700 mt-6 mb-2">Additional Information</h3>
                <textarea name="additionalInfo" placeholder="Notes about your order" value={formData.additionalInfo} onChange={handleChange} className="border p-2 rounded-md w-full h-20 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-200"></textarea>
              </form>
            )}
          </div>

          {/* Right - Order Summary */}
          <div className="w-full lg:w-1/3 bg-gray-50 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Orders</h3>

            <div className="border-b pb-3 mb-3">
              {cartItems.map((item) => (
                <div key={`order-item-${item.productId}`} className="flex justify-between text-gray-600 mb-2">
                  <div>
                    <span>{item.name}</span>
                    <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between text-gray-800 font-semibold">
              <span>Subtotal:</span>
              <span>₹{cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-gray-800 font-semibold border-t pt-2 mt-2">
              <span>Total:</span>
              <span>₹{cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Payment Method</h3>
              <div className="space-y-2">
                {["bank", "online", "cash"].map((method) => (
                  <label key={`payment-method-${method}`} className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      name="payment" 
                      value={method} 
                      checked={paymentMethod === method} 
                      onChange={handlePaymentChange} 
                      className="w-4 h-4 text-orange-500"
                    />
                    <span>{method === "bank" ? "Direct Bank Transfer" : method === "online" ? "Check Payment" : "Cash on Delivery"}</span>
                  </label>
                ))}
              </div>
            </div>

            <button 
              onClick={handleSubmit} 
              disabled={loading || cartItems.length === 0}
              className={`mt-6 w-full text-white font-semibold py-3 rounded-lg transition ${
                loading || cartItems.length === 0 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-orange-500 hover:bg-orange-600'
              }`}
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>

      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false);
            window.location.reload(); // Refresh to load cart data
          }}
          error={authError}
        />
      )}
    </div>
  );
}