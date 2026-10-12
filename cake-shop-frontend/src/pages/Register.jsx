import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { register } from "../features/auth/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";

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

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const changeHandler = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (localError) setLocalError("");
  };

  const submitHandler = (e) => {
    e.preventDefault();
    
    if (form.password !== form.confirmPassword) {
      setLocalError("Passwords do not match!");
      return;
    }
    if (form.password.length < 6) {
      setLocalError("Password must be at least 6 characters long.");
      return;
    }

    const { confirmPassword, ...registerData } = form;
    dispatch(register(registerData));
  };

  const inputBase = "w-full pl-11 pr-4 py-3.5 bg-[#FFFDF9] border-2 rounded-xl focus:outline-none focus:ring-4 transition text-[#3E2C1C] placeholder-[#8B7355]/60 font-semibold";

  return (
    <div className="cs-body min-h-screen flex bg-[#FDFBF7] text-[#3E2C1C]">
      <style>{shopStyles}</style>

      {/* LEFT SIDE - Branding & Visuals (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#4A2E1B] via-[#5C3A21] to-[#2E1B0F] relative overflow-hidden flex-col justify-center px-16 text-[#FDFBF7]">
        {/* Decorative Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-[#C9A227] opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-[#C9A227] opacity-10 rounded-full blur-3xl"></div>
        
        {/* Floating Sprinkles */}
        {SPRINKLES.map((s, i) => (
          <span
            key={i}
            className={`cs-float absolute hidden sm:block h-3 w-8 rounded-full opacity-80 ${s.color}`}
            style={{ top: s.top, left: s.left, right: s.right, "--r": s.rot, animationDelay: s.delay }}
          ></span>
        ))}

        <div className="relative z-10 max-w-md cs-rise">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-[#C9A227] to-[#D4AF37] rounded-2xl flex items-center justify-center text-3xl shadow-lg border-2 border-[#E8D58A]">
              🎂
            </div>
            <h1 className="cs-display text-3xl font-extrabold tracking-wide">CakeZone</h1>
          </div>
          
          <h2 className="cs-display text-4xl sm:text-5xl font-extrabold leading-tight mb-4">
            Sweet delights, <br />
            <span className="cs-script text-[#E8C84A]">made with love.</span>
          </h2>
          
          <p className="text-[#E8E0D5] text-lg mb-10 leading-relaxed">
            Join our community and discover the finest artisan cakes, crafted with premium ingredients and a whole lot of passion.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-[#FDFBF7]/10 p-4 rounded-2xl backdrop-blur-sm border border-[#C9A227]/30 hover:bg-[#FDFBF7]/15 transition-all duration-300">
              <span className="text-2xl bg-[#C9A227]/20 p-2 rounded-xl">✨</span>
              <div>
                <h4 className="font-bold text-[#FDFBF7]">Premium Ingredients</h4>
                <p className="text-sm text-[#E8E0D5]">Only the best for your celebrations</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-[#FDFBF7]/10 p-4 rounded-2xl backdrop-blur-sm border border-[#C9A227]/30 hover:bg-[#FDFBF7]/15 transition-all duration-300">
              <span className="text-2xl bg-[#C9A227]/20 p-2 rounded-xl">🚚</span>
              <div>
                <h4 className="font-bold text-[#FDFBF7]">Free Delivery</h4>
                <p className="text-sm text-[#E8E0D5]">On all orders above ₹999</p>
              </div>
            </div>
          </div>
        </div>

        {/* Frosting Bottom Edge */}
        <div className="cs-frosting-bottom absolute bottom-0 left-0 right-0"></div>
      </div>

      {/* RIGHT SIDE - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-[#FDFBF7]">
        <div className="w-full max-w-md cs-rise">
          {/* Mobile Logo (Only shows on small screens) */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#C9A227] to-[#D4AF37] rounded-2xl flex items-center justify-center text-3xl shadow-lg border-2 border-[#E8D58A] mb-3">
              🎂
            </div>
            <h1 className="cs-display text-2xl font-extrabold text-[#3E2C1C]">CakeZone</h1>
            <p className="cs-script text-[#8B6914] mt-1">Sweet Delights, Fresh Every Day</p>
          </div>

          <div className="text-center lg:text-left mb-8">
            <h2 className="cs-display text-3xl font-extrabold text-[#3E2C1C] mb-2">Create an Account</h2>
            <p className="text-[#8B7355] font-semibold">Join CakeZone and start ordering your favorite treats.</p>
          </div>

          {/* Error Messages */}
          {(error || localError) && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-start gap-3 shadow-sm">
              <span className="text-lg">⚠️</span>
              <p className="font-semibold">{localError || error}</p>
            </div>
          )}

          <form onSubmit={submitHandler} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-bold text-[#5C3A21] mb-1.5 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-[#C9A227]" />
                </div>
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  className={`${inputBase} ${localError ? "border-red-400 focus:ring-red-100" : "border-[#E8E0D5] hover:border-[#C9A227]/50 focus:ring-[#C9A227]/20 focus:border-[#C9A227]"}`}
                  value={form.name}
                  onChange={changeHandler}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-[#5C3A21] mb-1.5 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-[#C9A227]" />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  className={`${inputBase} ${localError ? "border-red-400 focus:ring-red-100" : "border-[#E8E0D5] hover:border-[#C9A227]/50 focus:ring-[#C9A227]/20 focus:border-[#C9A227]"}`}
                  value={form.email}
                  onChange={changeHandler}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-[#5C3A21] mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#C9A227]" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  className={`${inputBase} ${localError ? "border-red-400 focus:ring-red-100" : "border-[#E8E0D5] hover:border-[#C9A227]/50 focus:ring-[#C9A227]/20 focus:border-[#C9A227]"}`}
                  value={form.password}
                  onChange={changeHandler}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-[#8B7355] hover:text-[#C9A227] transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-[#8B7355] hover:text-[#C9A227] transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-bold text-[#5C3A21] mb-1.5 uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#C9A227]" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="••••••••"
                  className={`${inputBase} ${localError ? "border-red-400 focus:ring-red-100" : "border-[#E8E0D5] hover:border-[#C9A227]/50 focus:ring-[#C9A227]/20 focus:border-[#C9A227]"}`}
                  value={form.confirmPassword}
                  onChange={changeHandler}
                  required
                />
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-center gap-2 pt-1">
              <input 
                type="checkbox" 
                id="terms" 
                className="w-4 h-4 text-[#C9A227] border-[#E8E0D5] rounded focus:ring-[#C9A227]" 
                required 
              />
              <label htmlFor="terms" className="text-sm font-semibold text-[#8B7355]">
                I agree to the <a href="#" className="font-bold text-[#8B6914] hover:text-[#C9A227] transition-colors underline decoration-2 underline-offset-4">Terms & Conditions</a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center py-4 px-4 rounded-xl font-bold shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-[#C9A227]/30 mt-6 ${
                loading
                  ? "bg-[#E8E0D5] text-[#8B7355] cursor-not-allowed"
                  : "bg-gradient-to-r from-[#C9A227] to-[#D4AF37] text-[#2E1B0F] hover:from-[#B8911E] hover:to-[#C9A227] hover:shadow-xl"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-[#2E1B0F]/30 border-t-[#2E1B0F] rounded-full animate-spin mr-2"></div>
                  Creating Account...
                </>
              ) : (
                "Register"
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center mt-8 text-sm font-semibold text-[#8B7355]">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-[#8B6914] hover:text-[#C9A227] transition-colors underline decoration-2 underline-offset-4">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;