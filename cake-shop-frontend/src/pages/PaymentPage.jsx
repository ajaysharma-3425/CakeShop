import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { CheckCircle, ShieldCheck, ShoppingBag, QrCode, CreditCard, XCircle } from "lucide-react";

/* ---------- Cake-shop typography + small custom effects ---------- */
const shopStyles = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700;800&family=Pacifico&family=Quicksand:wght@400;500;600;700&display=swap');

.cs-body    { font-family: 'Quicksand', system-ui, sans-serif; }
.cs-display { font-family: 'Playfair Display', Georgia, serif; } /* Bade Letters ke liye */
.cs-script  { font-family: 'Pacifico', cursive; }

.cs-frosting-bottom {
  height: 28px;
  background-image: radial-gradient(circle at 50% 100%, #FDFBF7 0 18px, transparent 19px);
  background-size: 44px 28px;
  background-repeat: repeat-x;
}

@keyframes cs-float { 0%,100% { transform: translateY(0) rotate(var(--r,0deg)); } 50% { transform: translateY(-10px) rotate(var(--r,0deg)); } }
@keyframes cs-rise  { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
.cs-float { animation: cs-float 5s ease-in-out infinite; }
.cs-rise  { animation: cs-rise 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
`;

const SPRINKLES = [
  { top: "10%", left: "10%", color: "bg-[#C9A227]", rot: "25deg", delay: "0s" },
  { top: "80%", left: "15%", color: "bg-[#E8C84A]", rot: "-35deg", delay: ".6s" },
  { top: "30%", left: "20%", color: "bg-[#D4AF37]", rot: "60deg", delay: "1.2s" },
  { top: "70%", right: "20%", color: "bg-[#FDFBF7]", rot: "-15deg", delay: ".3s" },
  { top: "20%", right: "15%", color: "bg-[#E8C84A]", rot: "40deg", delay: ".9s" },
];

const PaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // 🔹 Fetch order
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${orderId}`);
        setOrder(res.data);
      } catch (err) {
        toast.error("Order not found or unable to load");
        navigate("/my-orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, navigate]);

  // 🔹 Dummy Payment
  const handlePayment = async () => {
    try {
      setPaying(true);
      await api.put(`/payment/${orderId}`);
      toast.success("Payment successful 💰");
      setShowSuccess(true);

      setTimeout(() => {
        navigate("/my-orders");
      }, 2000);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Payment failed");
    } finally {
      setPaying(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="cs-body min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
        <style>{shopStyles}</style>
        <div className="text-center cs-rise">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#C9A227] border-t-transparent"></div>
          <p className="mt-4 text-[#8B7355] font-semibold cs-script text-xl">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="cs-body min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
        <style>{shopStyles}</style>
        <div className="text-center max-w-md bg-[#FFFDF9] rounded-3xl shadow-xl border border-[#E8E0D5] p-10 cs-rise">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="cs-display text-3xl font-extrabold text-[#3E2C1C] mb-2">Order Not Found</h2>
          <p className="text-[#8B7355] mb-6 font-semibold">The order you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate("/my-orders")}
            className="px-6 py-3 bg-gradient-to-r from-[#C9A227] to-[#D4AF37] text-[#2E1B0F] font-bold rounded-full hover:from-[#B8911E] hover:to-[#C9A227] transition duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Go to My Orders
          </button>
        </div>
      </div>
    );
  }

  // ✅ COD VIEW (NO PAYMENT PAGE)
  if (order.paymentMethod === "cod") {
    return (
      <div className="cs-body min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
        <style>{shopStyles}</style>
        <div className="max-w-lg w-full bg-[#FFFDF9] rounded-3xl shadow-xl overflow-hidden border border-[#E8E0D5] cs-rise">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-[#4A2E1B] via-[#5C3A21] to-[#2E1B0F] px-8 py-6 text-[#FDFBF7]">
            <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-[#C9A227]/10"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <h1 className="cs-display text-2xl font-extrabold">Cash on Delivery</h1>
                <p className="text-[#E8E0D5] mt-1 font-semibold">Pay when your order arrives</p>
              </div>
              <div className="w-16 h-16 bg-[#FDFBF7]/10 rounded-full flex items-center justify-center border border-[#C9A227]/30">
                <CreditCard className="w-8 h-8 text-[#E8C84A]" />
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-8">
            <div className="flex items-center justify-center mb-8">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-200">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="cs-display text-3xl font-extrabold text-[#3E2C1C] mb-2">Order Confirmed!</h2>
                <p className="text-[#8B7355] font-semibold">Your cake is being prepared with love ❤️</p>
              </div>
            </div>

            {/* Order Details */}
            <div className="bg-[#F5F0E8] rounded-2xl p-6 mb-6 border border-[#E8E0D5]">
              <h3 className="cs-display text-lg font-bold text-[#3E2C1C] mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#C9A227]" />
                Order Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#8B7355]">Order ID</p>
                  <p className="font-bold text-[#3E2C1C] truncate">{order._id}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#8B7355]">Total Amount</p>
                  <p className="cs-display text-2xl font-extrabold text-[#8B6914]">₹{order.totalPrice}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#8B7355]">Payment Method</p>
                  <p className="font-bold text-[#3E2C1C]">Cash on Delivery</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#8B7355]">Status</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 mt-1">
                    {order.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="bg-[#FDF8E8] border border-[#E8D58A] rounded-2xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">💡</span>
                <div>
                  <p className="text-sm font-semibold text-[#8B6914]">
                    Please keep exact change ready. Our delivery executive will collect the payment upon delivery.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => navigate("/my-orders")}
              className="w-full bg-gradient-to-r from-[#C9A227] to-[#D4AF37] hover:from-[#B8911E] hover:to-[#C9A227] text-[#2E1B0F] py-4 rounded-full text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
            >
              <ShoppingBag className="w-6 h-6" />
              View My Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ ONLINE (DUMMY PAYMENT)
  return (
    <div className="cs-body min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4 py-10">
      <style>{shopStyles}</style>
      
      {/* Floating sprinkles */}
      {SPRINKLES.map((s, i) => (
        <span
          key={i}
          className={`cs-float absolute hidden md:block h-3 w-8 rounded-full opacity-60 ${s.color}`}
          style={{ top: s.top, left: s.left, right: s.right, "--r": s.rot, animationDelay: s.delay }}
        ></span>
      ))}

      <div className="max-w-5xl w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-10 cs-rise">
          <p className="cs-script text-2xl text-[#8B6914]">Secure Checkout</p>
          <h1 className="cs-display text-4xl md:text-5xl font-extrabold text-[#3E2C1C] mb-2 mt-1">Complete Your Payment</h1>
          <p className="text-[#8B7355] font-semibold text-lg">Secure payment for your delicious cake order</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Left Column - Order Details */}
          <div className="bg-[#FFFDF9] rounded-3xl shadow-xl shadow-[#E8E0D5]/60 border border-[#E8E0D5] p-6 md:p-8 cs-rise">
            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-dashed border-[#E8E0D5]">
              <h2 className="cs-display text-2xl font-bold text-[#3E2C1C]">Order Summary</h2>
              <div className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                order.paymentStatus === "paid" 
                  ? "bg-green-50 text-green-700 border-green-200" 
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}>
                {order.paymentStatus === "paid" ? "Paid" : "Pending"}
              </div>
            </div>

            {/* Order Details */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between py-3 border-b border-[#F5F0E8]">
                <span className="text-[#8B7355] font-semibold">Order ID</span>
                <span className="font-bold text-[#3E2C1C] truncate max-w-[150px]">{order._id}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-[#F5F0E8]">
                <span className="text-[#8B7355] font-semibold">Shop</span>
                <span className="font-bold text-[#3E2C1C] flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#C9A227] rounded-full"></span>
                  CakeCraft 🎂
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-[#F5F0E8]">
                <span className="text-[#8B7355] font-semibold">Payment Method</span>
                <span className="font-bold text-[#3E2C1C]">Online Payment</span>
              </div>
            </div>

            {/* Total Amount */}
            <div className="bg-[#F5F0E8] rounded-2xl p-6 mb-8 border border-[#E8E0D5]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#8B7355] mb-1">Total Amount</p>
                  <p className="cs-display text-3xl font-extrabold text-[#8B6914]">₹{order.totalPrice}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-[#8B7355]">Including all taxes</p>
                  <p className="text-sm font-bold text-[#8B6914]">✓ Free Delivery</p>
                </div>
              </div>
            </div>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-3 p-4 bg-[#FDF8E8] rounded-2xl border border-[#E8D58A]">
              <ShieldCheck className="w-5 h-5 text-[#8B6914]" />
              <p className="text-sm font-bold text-[#8B6914]">Secure & encrypted payment</p>
            </div>
          </div>

          {/* Right Column - Payment */}
          <div className="bg-[#FFFDF9] rounded-3xl shadow-xl shadow-[#E8E0D5]/60 border border-[#E8E0D5] p-6 md:p-8 cs-rise">
            {order.paymentStatus !== "paid" ? (
              <>
                <h2 className="cs-display text-2xl font-bold text-[#3E2C1C] mb-6 flex items-center gap-2">
                  <QrCode className="w-6 h-6 text-[#C9A227]" />
                  Scan to Pay
                </h2>
                
                {/* QR Code */}
                <div className="mb-8">
                  <div className="bg-[#F5F0E8] border-2 border-dashed border-[#E8E0D5] rounded-2xl p-6 mb-4 flex justify-center">
                    <img
                      src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=CakeCraft@upi&margin=10&bgcolor=ffffff&color=1f2937"
                      alt="QR Code"
                      className="w-full max-w-[200px] rounded-xl shadow-sm border-2 border-white"
                    />
                  </div>
                  
                  <div className="text-center">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#8B7355] mb-1">UPI ID</p>
                    <p className="text-lg font-extrabold text-[#3E2C1C] bg-[#F5F0E8] py-2 px-6 rounded-full inline-block border border-[#E8E0D5]">
                      CakeCraft@upi
                    </p>
                  </div>
                </div>

                {/* Instructions */}
                <div className="mb-8">
                  <h3 className="cs-display text-lg font-bold text-[#3E2C1C] mb-3 flex items-center gap-2">
                    <span className="text-xl">💡</span>
                    How to Pay
                  </h3>
                  <ol className="space-y-3 text-[#8B7355] font-semibold">
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-[#FDF8E8] border border-[#E8D58A] rounded-full flex items-center justify-center text-xs font-bold text-[#8B6914] shrink-0 mt-0.5">1</span>
                      <span>Open your UPI app (Google Pay, PhonePe, Paytm)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-[#FDF8E8] border border-[#E8D58A] rounded-full flex items-center justify-center text-xs font-bold text-[#8B6914] shrink-0 mt-0.5">2</span>
                      <span>Scan the QR code above or enter UPI ID manually</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-[#FDF8E8] border border-[#E8D58A] rounded-full flex items-center justify-center text-xs font-bold text-[#8B6914] shrink-0 mt-0.5">3</span>
                      <span>Enter amount: <span className="font-extrabold text-[#8B6914]">₹{order.totalPrice}</span></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-[#FDF8E8] border border-[#E8D58A] rounded-full flex items-center justify-center text-xs font-bold text-[#8B6914] shrink-0 mt-0.5">4</span>
                      <span>Complete the payment and confirm below</span>
                    </li>
                  </ol>
                </div>

                {/* Payment Button */}
                <button
                  onClick={handlePayment}
                  disabled={paying}
                  className="w-full bg-gradient-to-r from-[#C9A227] to-[#D4AF37] hover:from-[#B8911E] hover:to-[#C9A227] text-[#2E1B0F] py-4 rounded-full text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {paying ? (
                    <>
                      <div className="w-6 h-6 border-2 border-[#2E1B0F]/30 border-t-[#2E1B0F] rounded-full animate-spin"></div>
                      Verifying Payment...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-6 h-6" />
                      I Have Made the Payment
                    </>
                  )}
                </button>
              </>
            ) : (
              <div className="text-center py-12 cs-rise">
                <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-200">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h3 className="cs-display text-3xl font-extrabold text-[#3E2C1C] mb-2">Payment Completed</h3>
                <p className="text-[#8B7355] font-semibold mb-6">Your payment was successful on {new Date(order.updatedAt).toLocaleDateString()}</p>
                <button
                  onClick={() => navigate("/my-orders")}
                  className="px-8 py-3.5 bg-[#4A2E1B] hover:bg-[#2E1B0F] text-[#FDFBF7] font-bold rounded-full transition-colors duration-200 shadow-lg"
                >
                  View Order Status
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🎉 SUCCESS POPUP */}
      {showSuccess && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop with blur */}
          <div className="fixed inset-0 bg-[#2E1B0F]/60 backdrop-blur-sm"></div>
          
          {/* Popup */}
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="bg-[#FFFDF9] rounded-3xl max-w-md w-full p-8 shadow-2xl border border-[#E8E0D5] text-center cs-rise">
              {/* Animated Checkmark */}
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-ping opacity-20"></div>
                <div className="relative w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
              </div>

              <h3 className="cs-display text-2xl font-extrabold text-[#3E2C1C] mb-2">Payment Successful! 🎉</h3>
              <p className="text-[#8B7355] font-semibold mb-6">
                Thank you for your payment. Your cake is being prepared with love! ❤️
              </p>
              
              <div className="animate-pulse text-sm font-bold text-[#8B6914] bg-[#FDF8E8] py-2 px-4 rounded-full inline-block border border-[#E8D58A]">
                Redirecting to My Orders...
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;