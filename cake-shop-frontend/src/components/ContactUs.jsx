import { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  User,
  Cake,
  CheckCircle,
  ChevronDown,
} from "lucide-react";
import {
  FaInstagram,
  FaFacebookF,
  FaTwitter,
} from "react-icons/fa";

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
@keyframes cs-rise  { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
.cs-float { animation: cs-float 5s ease-in-out infinite; }
.cs-rise  { animation: cs-rise .45s ease-out both; }
`;

const SPRINKLES = [
  { top: "14%", left: "6%", color: "bg-[#C9A227]", rot: "25deg", delay: "0s" },
  { top: "62%", left: "14%", color: "bg-[#FDFBF7]", rot: "-35deg", delay: ".6s" },
  { top: "20%", left: "32%", color: "bg-[#E8C84A]", rot: "60deg", delay: "1.2s" },
  { top: "70%", left: "48%", color: "bg-[#D4AF37]", rot: "-15deg", delay: ".3s" },
  { top: "16%", right: "26%", color: "bg-[#E8C84A]", rot: "40deg", delay: ".9s" },
  { top: "58%", right: "12%", color: "bg-[#FDFBF7]", rot: "75deg", delay: "1.5s" },
  { top: "22%", right: "6%", color: "bg-[#C9A227]", rot: "-50deg", delay: "1.8s" },
];

const PHONE_DISPLAY = "+91 98765 43210";
const PHONE_DIGITS = "919876543210";
const EMAIL = "hello@cakezone.com";

const OCCASIONS = [
  { value: "Birthday", emoji: "🎉" },
  { value: "Anniversary", emoji: "💝" },
  { value: "Wedding", emoji: "💒" },
  { value: "Corporate Event", emoji: "🏢" },
  { value: "Just Because", emoji: "🎈" },
  { value: "Other", emoji: "✨" },
];

/* 🎨 ICON GRADIENTS RESTORED (Original Vibrant Colors) */
const CONTACT_INFO = [
  {
    icon: <Phone className="w-6 h-6" />,
    title: "Call Us",
    details: PHONE_DISPLAY,
    subtitle: "Mon-Sun: 8AM - 10PM",
    gradient: "from-pink-500 to-rose-500",
    href: `tel:+${PHONE_DIGITS}`,
  },
  {
    icon: <Mail className="w-6 h-6" />,
    title: "Email Us",
    details: EMAIL,
    subtitle: "Response within 2 hours",
    gradient: "from-orange-500 to-amber-500",
    href: `mailto:${EMAIL}`,
  },
  {
    icon: <MapPin className="w-6 h-6" />,
    title: "Visit Us",
    details: "Delhi, Mumbai, Bangalore",
    subtitle: "25+ stores across India",
    gradient: "from-rose-500 to-pink-600",
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: "Quick Response",
    details: "Live Chat Available",
    subtitle: `WhatsApp: ${PHONE_DISPLAY}`,
    gradient: "from-amber-500 to-orange-500",
    href: `https://wa.me/${PHONE_DIGITS}`,
  },
];

const FAQS = [
  {
    question: "How do I place a custom cake order?",
    answer:
      "You can place custom orders through our 'Custom Cake' page, call us directly, or fill out the contact form. We'll get back to you within 2 hours.",
  },
  {
    question: "What's the minimum order time?",
    answer:
      "We require at least 24 hours notice for all orders. For elaborate custom designs, we recommend 48-72 hours.",
  },
  {
    question: "Do you deliver outside city limits?",
    answer:
      "Yes! We deliver across 25+ cities in India. Additional delivery charges may apply for distant locations.",
  },
  {
    question: "Can I change my order after placing it?",
    answer:
      "Changes can be made up to 12 hours before delivery. Please contact our customer support immediately for modifications.",
  },
];

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
  occasion: "",
};

const inputBase =
  "w-full px-4 py-3.5 rounded-2xl bg-[#FFFDF9] border-2 border-[#E8E0D5] hover:border-[#C9A227]/50 focus:outline-none focus:ring-4 focus:ring-[#C9A227]/20 focus:border-[#C9A227] transition-all text-[#3E2C1C] placeholder-[#8B7355]/60";

const ContactUs = () => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // TODO: replace this simulated call with a real API request
    await new Promise((resolve) => setTimeout(resolve, 1500));

    console.log("Form submitted:", formData);
    setLoading(false);
    setIsSubmitted(true);
  };

  const sendAnother = () => {
    setFormData(EMPTY_FORM);
    setIsSubmitted(false);
  };

  // opens WhatsApp with the form details already typed in
  const whatsappText = [
    "Hi CakeZone! 👋",
    formData.name && `I'm ${formData.name}.`,
    formData.occasion && `Occasion: ${formData.occasion}`,
    formData.subject && `Subject: ${formData.subject}`,
    formData.message,
  ]
    .filter(Boolean)
    .join("\n");
  const whatsappHref = `https://wa.me/${PHONE_DIGITS}?text=${encodeURIComponent(whatsappText)}`;

  return (
    <div className="cs-body min-h-screen bg-[#FDFBF7] text-[#3E2C1C]">
      <style>{shopStyles}</style>

      {/* ================= Banner ================= */}
      <section className="relative bg-gradient-to-br from-[#4A2E1B] via-[#5C3A21] to-[#2E1B0F] text-[#FDFBF7]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-[#C9A227]/10"></div>
          <div className="absolute -bottom-24 right-0 h-72 w-72 translate-x-1/3 rounded-full bg-[#C9A227]/10"></div>
          {SPRINKLES.map((s, i) => (
            <span
              key={i}
              className={`cs-float absolute hidden sm:block h-2 w-6 rounded-full opacity-80 ${s.color}`}
              style={{ top: s.top, left: s.left, right: s.right, "--r": s.rot, animationDelay: s.delay }}
            ></span>
          ))}
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-28 md:pt-20 md:pb-32 text-center">
          <p className="cs-script text-2xl md:text-3xl text-[#E8C84A] cs-rise">We're here to help</p>
          {/* Playfair Display for Big Letters */}
          <h1 className="cs-display mt-2 text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight cs-rise">
            Let's <span className="text-[#E8C84A]">Bake</span> Something Special Together
          </h1>
          <p className="mt-5 text-lg md:text-xl text-[#E8E0D5] max-w-2xl mx-auto cs-rise">
            Have questions about our cakes, need help with an order, or want to discuss a custom design? We're just a
            message away!
          </p>
        </div>

        <div className="cs-frosting-bottom absolute bottom-0 left-0 right-0"></div>
      </section>

      {/* ================= Info cards ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-14 relative z-10 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {CONTACT_INFO.map((info) => {
            const Tag = info.href ? "a" : "div";
            const linkProps = info.href
              ? {
                href: info.href,
                ...(info.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {}),
              }
              : {};
            return (
              <Tag
                key={info.title}
                {...linkProps}
                className="group relative overflow-hidden block bg-[#FFFDF9] rounded-[1.75rem] border border-[#E8E0D5] shadow-lg shadow-[#E8E0D5]/60 p-6 hover:-translate-y-1.5 hover:shadow-2xl hover:border-[#C9A227]/50 transition-all duration-300"
              >
                <div
                  className={`absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${info.gradient} opacity-10`}
                ></div>
                <div
                  className={`relative inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${info.gradient} text-white shadow-md mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform`}
                >
                  {info.icon}
                </div>
                <h3 className="relative cs-display text-lg font-bold text-[#3E2C1C] mb-1">{info.title}</h3>
                <p className="relative text-[#3E2C1C] font-bold mb-1 break-words">{info.details}</p>
                <p className="relative text-[#8B7355] text-sm">{info.subtitle}</p>
              </Tag>
            );
          })}
        </div>
      </div>

      {/* ================= Main ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-start">
          {/* ---------- Form ---------- */}
          <div className="bg-[#FFFDF9] rounded-[2.25rem] shadow-xl shadow-[#E8E0D5]/60 border border-[#E8E0D5] p-6 sm:p-8 md:p-10">
            <div className="flex items-center gap-3 mb-8 pb-5 border-b-2 border-dashed border-[#E8E0D5]">
              <div className="h-12 w-12 shrink-0 rounded-2xl bg-gradient-to-br from-[#C9A227] to-[#D4AF37] text-[#2E1B0F] shadow-md flex items-center justify-center">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <h2 className="cs-display text-2xl sm:text-3xl font-extrabold text-[#3E2C1C] leading-tight">
                  Send Us a Message
                </h2>
                <p className="text-sm text-[#8B7355]">We reply within 2 hours</p>
              </div>
            </div>

            {isSubmitted ? (
              <div className="text-center py-10 cs-rise">
                <div className="text-7xl mb-4">🎉</div>
                <h3 className="cs-display text-2xl font-extrabold text-[#3E2C1C] mb-3">Message Sent Successfully!</h3>
                <p className="text-[#8B7355] mb-8 max-w-sm mx-auto">
                  Thank you for reaching out! Our team will get back to you within 2 hours.
                </p>
                <button
                  onClick={sendAnother}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#C9A227] to-[#D4AF37] px-8 py-3 font-bold text-[#2E1B0F] shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                >
                  <CheckCircle className="w-5 h-5" />
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-5">
                  <Field label="Your Name *" icon={<User className="w-4 h-4" />}>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className={inputBase}
                      placeholder="Enter your full name"
                    />
                  </Field>
                  <Field label="Email Address *" icon={<Mail className="w-4 h-4" />}>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className={inputBase}
                      placeholder="you@example.com"
                    />
                  </Field>
                </div>

                <Field label="Phone Number" icon={<Phone className="w-4 h-4" />}>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={inputBase}
                    placeholder="+91 98765 43210"
                  />
                </Field>

                <Field label="Occasion" icon={<Cake className="w-4 h-4" />}>
                  <div className="flex flex-wrap gap-2">
                    {OCCASIONS.map((o) => {
                      const active = formData.occasion === o.value;
                      return (
                        <button
                          key={o.value}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, occasion: active ? "" : o.value }))
                          }
                          aria-pressed={active}
                          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold border-2 transition ${active
                              ? "bg-gradient-to-r from-[#C9A227] to-[#D4AF37] text-[#2E1B0F] border-transparent shadow-lg shadow-[#C9A227]/30"
                              : "bg-[#FFFDF9] text-[#8B6914] border-[#E8E0D5] hover:bg-[#FDF8E8] hover:border-[#E8D58A]"
                            }`}
                        >
                          <span>{o.emoji}</span>
                          {o.value}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                <Field label="Subject">
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={inputBase}
                    placeholder="What would you like to discuss?"
                  />
                </Field>

                <Field label="Your Message *" icon={<MessageSquare className="w-4 h-4" />}>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    className={`${inputBase} resize-none`}
                    placeholder="Tell us about your cake requirements, delivery details, or any special requests..."
                  />
                </Field>

                <div className="space-y-3 pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-full bg-gradient-to-r from-[#C9A227] to-[#D4AF37] py-4 font-bold text-[#2E1B0F] shadow-lg hover:from-[#B8911E] hover:to-[#C9A227] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="h-5 w-5 rounded-full border-2 border-[#2E1B0F]/30 border-t-[#2E1B0F] animate-spin"></span>
                        Sending Message...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-[#8B7355]">
                    <span className="flex-1 border-t-2 border-dashed border-[#E8E0D5]"></span>
                    or
                    <span className="flex-1 border-t-2 border-dashed border-[#E8E0D5]"></span>
                  </div>

                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full rounded-full bg-[#FFFDF9] border-2 border-[#E8E0D5] py-3.5 font-bold text-[#8B6914] hover:bg-[#FDF8E8] transition flex items-center justify-center gap-2"
                  >
                    <span>💬</span>
                    Chat with us on WhatsApp
                  </a>
                </div>
              </form>
            )}
          </div>

          {/* ---------- Right column ---------- */}
          <div className="space-y-8">
            {/* FAQ */}
            <div className="bg-[#FFFDF9] rounded-[2.25rem] shadow-xl shadow-[#E8E0D5]/60 border border-[#E8E0D5] p-6 sm:p-8">
              <p className="cs-script text-xl text-[#8B6914]">Quick answers</p>
              <h3 className="cs-display text-2xl font-extrabold text-[#3E2C1C] mb-5">Frequently Asked Questions</h3>

              <div className="space-y-3">
                {FAQS.map((faq, index) => {
                  const open = openFaq === index;
                  return (
                    <div
                      key={faq.question}
                      className={`rounded-2xl border-2 transition-colors ${open ? "border-[#C9A227] bg-[#FDF8E8]/50" : "border-[#E8E0D5] hover:border-[#C9A227]/50"
                        }`}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(open ? -1 : index)}
                        aria-expanded={open}
                        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                      >
                        <span className="font-bold text-[#3E2C1C]">{faq.question}</span>
                        <span
                          className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center transition-all duration-300 ${open ? "bg-gradient-to-br from-[#C9A227] to-[#D4AF37] text-[#2E1B0F] rotate-180" : "bg-[#FDF8E8] text-[#8B6914]"
                            }`}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </span>
                      </button>
                      {open && <p className="px-5 pb-5 -mt-1 text-[#8B7355] leading-relaxed">{faq.answer}</p>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Social + hours */}
            <div className="relative overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-[#4A2E1B] to-[#2E1B0F] p-6 sm:p-8 text-[#FDFBF7] shadow-2xl shadow-[#C9A227]/20">
              <div className="absolute -top-16 -left-16 h-48 w-48 rounded-full bg-[#C9A227]/10"></div>
              <div className="absolute -bottom-20 -right-12 h-56 w-56 rounded-full bg-[#C9A227]/10"></div>

              <div className="relative">
                <h3 className="cs-display text-2xl font-extrabold mb-6">Connect With Us</h3>

                <div className="mb-8">
                  <h4 className="font-bold mb-3">Follow Our Sweet Journey</h4>
                  <div className="flex gap-3">
                    {[
                      { icon: FaInstagram, label: "Instagram" },
                      { icon: FaFacebookF, label: "Facebook" },
                      { icon: FaTwitter, label: "Twitter" },
                    ].map(({ icon: Icon, label }) => (
                      <a
                        key={label}
                        href="#"
                        aria-label={label}
                        className="h-12 w-12 rounded-full bg-[#FDFBF7]/20 flex items-center justify-center hover:bg-[#C9A227] hover:text-[#2E1B0F] hover:-translate-y-1 transition-all"
                      >
                        <Icon className="w-6 h-6" />
                      </a>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold mb-3">Store Hours</h4>
                  <div className="space-y-2 text-[#E8E0D5]">
                    <div className="flex justify-between gap-4">
                      <span>Monday - Friday</span>
                      <span className="font-bold text-[#FDFBF7]">8:00 AM - 10:00 PM</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>Saturday - Sunday</span>
                      <span className="font-bold text-[#FDFBF7]">9:00 AM - 11:00 PM</span>
                    </div>
                    <div className="pt-4 mt-2 border-t border-[#FDFBF7]/20 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="absolute inline-flex h-full w-full rounded-full bg-[#C9A227] opacity-75 animate-ping"></span>
                          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#E8C84A]"></span>
                        </span>
                        <span className="font-semibold text-[#E8C84A]">Online orders: 24/7</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stores */}
            <div className="bg-[#FFFDF9] rounded-[2.25rem] shadow-xl shadow-[#E8E0D5]/60 border-2 border-dashed border-[#E8D58A] p-8 text-center">
              <div className="mx-auto mb-3 h-16 w-16 rounded-full bg-gradient-to-br from-[#FDF8E8] to-[#E8E0D5] flex items-center justify-center text-3xl cs-float">
                📍
              </div>
              <p className="cs-display text-xl font-extrabold text-[#3E2C1C]">Our Stores Across India</p>
              <p className="text-[#8B7355] text-sm mt-1">25+ locations • Free parking</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {["Delhi", "Mumbai", "Bangalore"].map((city) => (
                  <span
                    key={city}
                    className="rounded-full bg-[#FDF8E8] border border-[#E8D58A] px-4 py-1.5 text-sm font-bold text-[#8B6914]"
                  >
                    {city}
                  </span>
                ))}
                <span className="rounded-full bg-[#F5F0E8] border border-[#E8E0D5] px-4 py-1.5 text-sm font-bold text-[#5C3A21]">
                  & more
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= CTA ================= */}
      <section className="pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#4A2E1B] via-[#5C3A21] to-[#2E1B0F] p-8 md:p-12 text-center text-[#FDFBF7] shadow-2xl shadow-[#C9A227]/20">
            <div className="absolute -top-16 -left-16 h-48 w-48 rounded-full bg-[#C9A227]/10"></div>
            <div className="absolute -bottom-20 -right-12 h-56 w-56 rounded-full bg-[#C9A227]/10"></div>

            <div className="relative">
              <div className="text-5xl mb-3 cs-float inline-block">☎️</div>
              <h2 className="cs-display text-3xl md:text-4xl font-extrabold mb-2">
                Need Urgent Cake Help? <span className="text-[#E8C84A]">Call Now!</span>
              </h2>
              <p className="text-[#E8E0D5] mb-8">We'll sort it out together 💖</p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4">
                <a
                  href={`tel:+${PHONE_DIGITS}`}
                  className="flex items-center gap-3 rounded-full bg-[#FFFDF9] px-6 py-3 text-left text-[#8B6914] shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                >
                  <span className="h-11 w-11 shrink-0 rounded-full bg-gradient-to-br from-[#C9A227] to-[#D4AF37] text-[#2E1B0F] flex items-center justify-center">
                    <Phone className="w-5 h-5" />
                  </span>
                  <span>
                    <span className="block text-xs font-bold text-[#8B7355]">Emergency Orders</span>
                    <span className="block text-lg font-extrabold text-[#3E2C1C]">{PHONE_DISPLAY}</span>
                  </span>
                </a>

                <span className="text-[#E8E0D5] font-bold">OR</span>

                <a
                  href={`https://wa.me/${PHONE_DIGITS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-full border-2 border-[#C9A227] px-6 py-3 text-left hover:bg-[#C9A227]/15 transition-colors duration-200"
                >
                  <span className="h-11 w-11 shrink-0 rounded-full bg-[#FDFBF7]/20 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </span>
                  <span>
                    <span className="block text-xs font-bold text-[#E8E0D5]">WhatsApp Support</span>
                    <span className="block text-lg font-extrabold text-[#E8C84A]">{PHONE_DISPLAY}</span>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

/* ---------- small building block ---------- */

const Field = ({ label, icon, children }) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-bold text-[#5C3A21]">
      {icon && <span className="text-[#C9A227]">{icon}</span>}
      {label}
    </label>
    {children}
  </div>
);

export default ContactUs;