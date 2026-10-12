import { Link } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Cake,
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowUp,
  Send,
  CheckCircle,
  Heart,
  MessageCircle
} from "lucide-react";

/* ============================================================
   Small inline social icons (brand icons are not in all lucide versions)
   ============================================================ */
const InstagramIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
  </svg>
);

const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

/* ============================================================
   Animation presets
   ============================================================ */
const SPRING = { type: "spring", bounce: 0.2, visualDuration: 0.5 };

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } }
};

const item = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: SPRING }
};

/* Floating sprinkles / crumbs in the background */
const SPRINKLES = [
  { left: "6%", top: "18%", size: 10, color: "#FFD58A", delay: 0, dur: 5 },
  { left: "18%", top: "70%", size: 7, color: "#F5E6D3", delay: 1.2, dur: 6 },
  { left: "34%", top: "28%", size: 8, color: "#D97706", delay: 0.6, dur: 5.5 },
  { left: "52%", top: "78%", size: 11, color: "#FFF8E7", delay: 2, dur: 6.5 },
  { left: "68%", top: "22%", size: 7, color: "#FFD58A", delay: 0.3, dur: 5.2 },
  { left: "82%", top: "64%", size: 9, color: "#F5E6D3", delay: 1.6, dur: 6 },
  { left: "93%", top: "30%", size: 8, color: "#D97706", delay: 0.9, dur: 5.8 }
];

/* ============================================================
   Footer pieces
   ============================================================ */
function FooterLink({ to, children }) {
  return (
    <li>
      <Link to={to} className="group inline-flex items-center gap-2 text-[#F5E6D3] hover:text-white transition-colors">
        <span className="relative">
          <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">{children}</span>
          <span className="absolute left-0 -bottom-0.5 h-px w-full origin-left scale-x-0 bg-[#FFD58A] transition-transform duration-300 group-hover:scale-x-100" />
        </span>
      </Link>
    </li>
  );
}

function ContactRow({ icon: Icon, children, href }) {
  const content = (
    <>
      <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-[#FFD58A] transition-colors duration-200 group-hover:bg-[#FFF8E7] group-hover:text-[#6B4423]">
        <Icon className="h-4 w-4" />
      </span>
      <span className="text-sm text-[#F5E6D3] group-hover:text-white transition-colors">{children}</span>
    </>
  );
  return href ? (
    <a href={href} className="group flex items-start gap-3">{content}</a>
  ) : (
    <div className="group flex items-start gap-3">{content}</div>
  );
}

function SocialButton({ href, label, children }) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      whileHover={{ y: -4, scale: 1.1 }}
      whileTap={{ scale: 0.92 }}
      transition={SPRING}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-[#FFF8E7] ring-1 ring-white/15 hover:bg-[#FFF8E7] hover:text-[#6B4423] transition-colors"
    >
      {children}
    </motion.a>
  );
}

function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    // TODO: connect to your newsletter API here
    setDone(true);
    setEmail("");
    setTimeout(() => setDone(false), 3500);
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex items-center rounded-full bg-white/10 p-1 ring-1 ring-white/20 focus-within:ring-[#FFD58A] transition-shadow">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className="min-w-0 flex-1 bg-transparent px-4 py-2 text-sm text-[#FFF8E7] placeholder-[#BCAAA4] outline-none"
        />
        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#FFF8E7] text-[#6B4423] sm:w-auto sm:gap-2 sm:px-4"
          aria-label="Subscribe"
        >
          <span className="hidden text-sm font-semibold sm:inline">Join</span>
          <Send className="h-4 w-4" />
        </motion.button>
      </div>

      <AnimatePresence>
        {done && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute -bottom-6 left-2 flex items-center gap-1.5 text-xs text-[#FFD58A]"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Thanks! A sweet surprise is on its way.
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  );
}

/* ============================================================
   Footer
   ============================================================ */
const Footer = () => {
  const year = new Date().getFullYear();
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="relative mt-20 overflow-hidden bg-gradient-to-br from-[#5D3A1A] via-[#6B4423] to-[#8B5E3C] text-[#FFF8E7]">
      {/* Wavy cream top edge (blends into the page background) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -translate-y-px">
        <motion.svg
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          className="block h-10 w-full sm:h-16"
          initial={{ y: -20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={SPRING}
        >
          <path
            fill="#FFFDF7"
            d="M0,0 L1440,0 L1440,30 C1320,70 1200,70 1080,40 C960,10 840,10 720,40 C600,70 480,70 360,40 C240,10 120,10 0,50 Z"
          />
        </motion.svg>
      </div>

      {/* Floating sprinkles */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {SPRINKLES.map((s, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full opacity-40"
            style={{ left: s.left, top: s.top, width: s.size, height: s.size, backgroundColor: s.color }}
            animate={{ y: [0, -14, 0], x: [0, 6, 0], rotate: [0, 180, 360] }}
            transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#FFD58A]/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-black/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-16 sm:px-6 sm:pt-24 lg:px-8">
        {/* Newsletter banner */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={SPRING}
          className="mb-14 grid items-center gap-6 rounded-3xl bg-white/10 p-6 ring-1 ring-white/15 backdrop-blur-sm md:grid-cols-2 md:p-8"
        >
          <div>
            <h3 className="text-xl font-bold sm:text-2xl">Get a slice of the sweet news</h3>
            <p className="mt-1 text-sm text-[#F5E6D3]">
              New flavours, festive specials and exclusive offers, straight to your inbox.
            </p>
          </div>
          <Newsletter />
        </motion.div>

        {/* Main grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4"
        >
          {/* Brand */}
          <motion.div variants={item} className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="group inline-flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: [0, -12, 12, 0] }}
                transition={{ duration: 0.6 }}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF8E7]"
              >
                <Cake className="h-6 w-6 text-[#6B4423]" />
              </motion.div>
              <div>
                <p className="text-2xl font-bold tracking-tight">CakeZone</p>
                <p className="text-xs text-[#F5E6D3]">Sweet Delights, Fresh Every Day</p>
              </div>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#F5E6D3]">
              Handcrafted cakes baked fresh with love, for birthdays, weddings and every little celebration in between.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <SocialButton href="https://instagram.com" label="Instagram"><InstagramIcon className="h-5 w-5" /></SocialButton>
              <SocialButton href="https://facebook.com" label="Facebook"><FacebookIcon className="h-5 w-5" /></SocialButton>
              <SocialButton href="https://wa.me/919876543210" label="WhatsApp"><MessageCircle className="h-5 w-5" /></SocialButton>
              <SocialButton href="mailto:hello@cakezone.com" label="Email"><Mail className="h-5 w-5" /></SocialButton>
            </div>
          </motion.div>

          {/* Explore */}
          <motion.div variants={item}>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#FFD58A]">Explore</h4>
            <ul className="space-y-3 text-sm">
              <FooterLink to="/">Home</FooterLink>
              <FooterLink to="/cakes">All Cakes</FooterLink>
              <FooterLink to="/custom-cake">Custom Cake</FooterLink>
              <FooterLink to="/my-orders">My Orders</FooterLink>
            </ul>
          </motion.div>

          {/* Company */}
          <motion.div variants={item}>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#FFD58A]">Company</h4>
            <ul className="space-y-3 text-sm">
              <FooterLink to="/about">About Us</FooterLink>
              <FooterLink to="/contact">Contact Us</FooterLink>
              <FooterLink to="/wishlist">Wishlist</FooterLink>
              <FooterLink to="/profile">My Profile</FooterLink>
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div variants={item}>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#FFD58A]">Visit & Call</h4>
            <div className="space-y-4">
              <ContactRow icon={Phone} href="tel:+919876543210">+91 98765 43210</ContactRow>
              <ContactRow icon={Mail} href="mailto:hello@cakezone.com">hello@cakezone.com</ContactRow>
              <ContactRow icon={MapPin}>Your Street, Your City, India</ContactRow>
              <ContactRow icon={Clock}>Open daily, 9:00 AM – 10:00 PM</ContactRow>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/15 pt-6 text-center sm:flex-row sm:text-left"
        >
          <p className="text-xs text-[#F5E6D3] sm:text-sm">
            © {year} CakeZone. All rights reserved.
          </p>

          <p className="flex items-center gap-1.5 text-xs text-[#F5E6D3] sm:text-sm">
            Baked with
            <motion.span
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="inline-flex"
            >
              <Heart className="h-4 w-4 fill-[#FFD58A] text-[#FFD58A]" />
            </motion.span>
            and a lot of sugar
          </p>

          <motion.button
            onClick={scrollTop}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.95 }}
            className="group inline-flex items-center gap-2 rounded-full bg-[#FFF8E7] px-4 py-2 text-xs font-semibold text-[#6B4423] shadow-md sm:text-sm"
            aria-label="Back to top"
          >
            Back to top
            <ArrowUp className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
          </motion.button>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;