import { useState, useEffect } from 'react';
import {
  Cake,
  Heart,
  Trophy,
  Truck,
  Clock,
  Users,
  Star,
  MapPin,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Twitter,
  ChevronRight,
  Award,
  Shield,
  Leaf,
  Sparkles,
  X // Added X for modal close button
} from 'lucide-react';

/* ---------- Cake-shop typography + small custom effects ---------- */
const shopStyles = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700;800&family=Pacifico&family=Quicksand:wght@400;500;600;700&display=swap');

.cs-body    { font-family: 'Quicksand', system-ui, sans-serif; }
.cs-display { font-family: 'Playfair Display', Georgia, serif; } /* Bade Letters ke liye */
.cs-script  { font-family: 'Pacifico', cursive; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.6s ease-out;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
.animate-float {
  animation: float 4s ease-in-out infinite;
}
`;

const AboutUs = () => {
  const [activeTab, setActiveTab] = useState('story');
  const [selectedMember, setSelectedMember] = useState(null); // State for Modal

  // Animation for stats counter
  const [stats, setStats] = useState({
    cakes: 0,
    customers: 0,
    cities: 0,
    rating: 0
  });

  useEffect(() => {
    const targetStats = {
      cakes: 2500,
      customers: 10000,
      cities: 25,
      rating: 4.8
    };

    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = {
      cakes: targetStats.cakes / steps,
      customers: targetStats.customers / steps,
      cities: targetStats.cities / steps,
      rating: targetStats.rating / steps
    };

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      setStats({
        cakes: Math.min(Math.floor(increment.cakes * currentStep), targetStats.cakes),
        customers: Math.min(Math.floor(increment.customers * currentStep), targetStats.customers),
        cities: Math.min(Math.floor(increment.cities * currentStep), targetStats.cities),
        rating: Math.min(+(increment.rating * currentStep).toFixed(1), targetStats.rating)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, []);

  // Updated Team Data with Cake Shop related info and detailed bio
  const teamMembers = [
    {
      id: 1,
      name: "Chef Ramesh Sharma",
      role: "Master Baker & Founder",
      image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400",
      shortBio: "15+ years experience in French patisserie",
      fullBio: "Chef Ramesh discovered his passion for baking in Paris. With over 15 years of experience, he founded CakeZone to bring authentic French techniques to India. He specializes in creating melt-in-your-mouth sponges and perfectly balanced flavors.",
      specialties: ["French Macarons", "Artisanal Breads", "Classic Sponges"]
    },
    {
      id: 2,
      name: "Chef Anita Desai",
      role: "Head of Cake Design",
      image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400",
      shortBio: "Creates stunning cake designs that tell stories",
      fullBio: "Anita is the artistic genius behind our most intricate cakes. She believes that every cake is a canvas. From fondant sculpting to hand-painted details, she brings our customers' wildest imaginations to life.",
      specialties: ["Fondant Sculpting", "Hand-painted Cakes", "Wedding Tier Design"]
    },
    {
      id: 3,
      name: "Chef Vikas Verma",
      role: "Head Pastry Chef",
      image: "https://images.unsplash.com/photo-1607990283143-e81e7a2c93fa?w=400",
      shortBio: "Ensures every bite is a moment of pure bliss",
      fullBio: "Vikas is a chocolate wizard. He experiments with different cocoa percentages and exotic ingredients to create desserts that are not just sweet, but deeply flavorful and sophisticated.",
      specialties: ["Chocolate Truffles", "Gourmet Pastries", "Flavor Pairing"]
    },
    {
      id: 4,
      name: "Chef Sunita Rao",
      role: "Custom Cake Specialist",
      image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400",
      shortBio: "Makes every customer feel special with tailored creations",
      fullBio: "Sunita loves a challenge. Whether it's a gluten-free request, a sugar-free diet, or a specific themed cake, she works closely with customers to ensure their dietary needs and expectations are perfectly met.",
      specialties: ["Dietary Customization", "Themed Cakes", "Cupcake Artistry"]
    }
  ];

  // Updated Testimonials Data
  const testimonialsData = [
    {
      id: 1,
      name: "Priya Singh",
      location: "Delhi",
      event: "Birthday Celebration",
      text: "The best cake I've ever ordered! My daughter's birthday was magical because of the beautiful unicorn cake from CakeZone.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
    },
    {
      id: 2,
      name: "Rohan Mehta",
      location: "Mumbai",
      event: "Anniversary",
      text: "The red velvet cake was absolutely divine. Perfectly moist and the cream cheese frosting was out of this world. Highly recommended!",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
    },
    {
      id: 3,
      name: "Sneha Kapoor",
      location: "Bangalore",
      event: "Corporate Event",
      text: "We ordered 50 custom cupcakes for our office party. They were delivered on time and everyone loved them. Amazing quality and service.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150"
    }
  ];

  const values = [
    {
      icon: <Leaf className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />,
      title: "Fresh Ingredients",
      description: "100% natural, locally sourced ingredients"
    },
    {
      icon: <Shield className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />,
      title: "Quality Guarantee",
      description: "Every cake is taste-tested before delivery"
    },
    {
      icon: <Heart className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />,
      title: "Made with Love",
      description: "Each cake is crafted with passion and care"
    },
    {
      icon: <Clock className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />,
      title: "On-time Delivery",
      description: "Always fresh, always on time"
    }
  ];

  const milestones = [
    { year: "2018", title: "Started from Home Kitchen", description: "Baked first 100 cakes for friends & family" },
    { year: "2019", title: "Opened First Store", description: "Launched our flagship store in Delhi" },
    { year: "2020", title: "Went Online", description: "Started delivering across 10+ cities" },
    { year: "2021", title: "Award Winning", description: "Best Bakery Award by Food Magazine" },
    { year: "2022", title: "National Presence", description: "Expanded to 25+ cities across India" },
    { year: "2023", title: "Innovation Hub", description: "Launched AR cake preview feature" }
  ];

  return (
    <div className="cs-body min-h-screen bg-[#FDFBF7] text-[#3E2C1C]">
      <style>{shopStyles}</style>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#C9A227]/10 to-[#D4AF37]/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="animate-fadeIn order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 bg-[#FFFDF9]/80 backdrop-blur-sm px-4 py-2 rounded-full mb-4 sm:mb-6 border border-[#E8E0D5] shadow-sm">
                <Cake className="w-4 h-4 sm:w-5 sm:h-5 text-[#C9A227]" />
                <span className="text-xs sm:text-sm font-bold text-[#5C3A21]">Since 2018</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]"></span>
                <span className="text-xs sm:text-sm font-bold text-[#5C3A21]">Baked with Love</span>
              </div>
              {/* Playfair Display for Big Letters */}
              <h1 className="cs-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#3E2C1C] mb-4 sm:mb-6 leading-tight">
                More Than Just <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C9A227] to-[#D4AF37]">Cakes</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-[#8B7355] mb-6 sm:mb-8 max-w-lg">
                We're creators of sweet memories. Every cake tells a story, every bite creates a moment to remember.
              </p>
              <button className="group inline-flex items-center gap-2 bg-gradient-to-r from-[#C9A227] to-[#D4AF37] text-[#2E1B0F] px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold hover:shadow-xl hover:scale-105 transition-all duration-300 text-sm sm:text-base shadow-lg shadow-[#C9A227]/30">
                Explore Our Story
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="relative order-1 lg:order-2 mb-8 lg:mb-0">
              <div className="relative z-10">
                <img
                  src="https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800"
                  alt="Beautiful cake display"
                  className="rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl w-full object-cover border-4 border-[#FFFDF9]"
                />
                <div className="hidden sm:block absolute -bottom-4 sm:-bottom-6 -right-4 sm:-right-6 w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-r from-[#C9A227] to-[#D4AF37] rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl -z-10"></div>
                {/* Added floating badge */}
                <div className="absolute -top-4 -left-4 bg-[#FFFDF9] p-3 rounded-2xl shadow-lg border border-[#E8E0D5] animate-float flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#C9A227]" />
                  <span className="text-xs font-bold text-[#5C3A21]">Premium Quality</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            <div className="text-center p-4 bg-[#FFFDF9] rounded-3xl border border-[#E8E0D5] shadow-sm hover:shadow-md transition-shadow">
              <div className="cs-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#3E2C1C] mb-1 sm:mb-2">{stats.cakes}+</div>
              <div className="text-xs sm:text-sm md:text-base text-[#8B7355] font-semibold">Cakes Baked</div>
              <div className="mt-1 sm:mt-2 flex justify-center">
                <Cake className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#C9A227]" />
              </div>
            </div>
            <div className="text-center p-4 bg-[#FFFDF9] rounded-3xl border border-[#E8E0D5] shadow-sm hover:shadow-md transition-shadow">
              <div className="cs-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#3E2C1C] mb-1 sm:mb-2">{stats.customers.toLocaleString()}+</div>
              <div className="text-xs sm:text-sm md:text-base text-[#8B7355] font-semibold">Happy Customers</div>
              <div className="mt-1 sm:mt-2 flex justify-center">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#C9A227]" />
              </div>
            </div>
            <div className="text-center p-4 bg-[#FFFDF9] rounded-3xl border border-[#E8E0D5] shadow-sm hover:shadow-md transition-shadow">
              <div className="cs-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#3E2C1C] mb-1 sm:mb-2">{stats.cities}+</div>
              <div className="text-xs sm:text-sm md:text-base text-[#8B7355] font-semibold">Cities</div>
              <div className="mt-1 sm:mt-2 flex justify-center">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#C9A227]" />
              </div>
            </div>
            <div className="text-center p-4 bg-[#FFFDF9] rounded-3xl border border-[#E8E0D5] shadow-sm hover:shadow-md transition-shadow">
              <div className="cs-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#3E2C1C] mb-1 sm:mb-2">{stats.rating}★</div>
              <div className="text-xs sm:text-sm md:text-base text-[#8B7355] font-semibold">Average Rating</div>
              <div className="mt-1 sm:mt-2 flex justify-center">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#C9A227] fill-current" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 mb-8 sm:mb-12">
            {['story', 'values', 'team', 'journey'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full font-bold transition-all duration-300 text-sm sm:text-base border-2 ${activeTab === tab
                    ? 'bg-gradient-to-r from-[#C9A227] to-[#D4AF37] text-[#2E1B0F] border-transparent shadow-lg shadow-[#C9A227]/30'
                    : 'bg-[#FFFDF9] text-[#8B7355] border-[#E8E0D5] hover:bg-[#FDF8E8] hover:border-[#E8D58A]'
                  }`}
              >
                {tab === 'story' && 'Our Story'}
                {tab === 'values' && 'Our Values'}
                {tab === 'team' && 'Our Team'}
                {tab === 'journey' && 'Journey'}
              </button>
            ))}
          </div>

          {/* Story Tab */}
          {activeTab === 'story' && (
            <div className="animate-fadeIn">
              <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
                <div className="order-2 lg:order-1">
                  <h2 className="cs-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#3E2C1C] mb-4 sm:mb-6">From Kitchen to Celebration</h2>
                  <p className="text-[#8B7355] mb-4 sm:mb-6 text-base sm:text-lg">
                    CakeZone started as a passion project in a small home kitchen in 2018.
                    What began with baking cakes for family gatherings quickly grew into
                    a beloved brand known for creating unforgettable moments.
                  </p>
                  <p className="text-[#8B7355] mb-6 sm:mb-8 text-base">
                    Today, we're more than just a bakery. We're a team of passionate bakers,
                    designers, and dreamers who believe that every celebration deserves
                    a perfect cake. From birthdays to weddings, from "just because" moments
                    to grand anniversaries, we've been part of thousands of special occasions.
                  </p>
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    <div className="flex items-center gap-2 bg-[#FDF8E8] px-4 py-2 rounded-full border border-[#E8D58A]">
                      <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
                      <span className="font-bold text-sm sm:text-base text-[#8B6914]">Award Winning</span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#F0EBE3] px-4 py-2 rounded-full border border-[#E8E0D5]">
                      <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                      <span className="font-bold text-sm sm:text-base text-[#5C3A21]">Free Delivery</span>
                    </div>
                  </div>
                </div>
                <div className="order-1 lg:order-2 mb-8 lg:mb-0">
                  <img
                    src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800"
                    alt="Baking process"
                    className="rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl w-full object-cover border-4 border-[#FFFDF9]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Values Tab */}
          {activeTab === 'values' && (
            <div className="animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                {values.map((value, index) => (
                  <div
                    key={index}
                    className="bg-[#FFFDF9] p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-lg shadow-[#E8E0D5]/60 border border-[#E8E0D5] hover:shadow-xl hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-[#FDF8E8] to-[#E8E0D5] rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-105 sm:group-hover:scale-110 transition-transform border border-[#E8D58A]">
                      <div className="text-[#8B6914]">
                        {value.icon}
                      </div>
                    </div>
                    <h3 className="cs-display text-lg sm:text-xl font-bold text-[#3E2C1C] mb-2 sm:mb-3">{value.title}</h3>
                    <p className="text-[#8B7355] text-sm sm:text-base">{value.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team Tab */}
          {activeTab === 'team' && (
            <div className="animate-fadeIn">
              <h2 className="cs-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-center text-[#3E2C1C] mb-8 sm:mb-12">
                Meet Our <span className="text-[#8B6914]">Dream Team</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    onClick={() => setSelectedMember(member)} // Click to open modal
                    className="group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#FFFDF9] shadow-lg shadow-[#E8E0D5]/60 border border-[#E8E0D5] hover:shadow-xl sm:hover:shadow-2xl transition-all duration-500 cursor-pointer"
                  >
                    <div className="h-48 sm:h-56 md:h-64 overflow-hidden relative">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:scale-105 sm:group-hover:scale-110 transition-transform duration-500"
                      />
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#2E1B0F]/80 via-[#2E1B0F]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="bg-[#FFFDF9] text-[#3E2C1C] px-4 py-2 rounded-full font-bold text-sm shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                          View Profile
                        </span>
                      </div>
                      {/* Gold ring on hover */}
                      <div className="absolute inset-0 border-4 border-[#C9A227] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl sm:rounded-t-3xl pointer-events-none"></div>
                    </div>
                    <div className="p-4 sm:p-6">
                      <h3 className="cs-display text-lg sm:text-xl font-bold text-[#3E2C1C]">{member.name}</h3>
                      <div className="text-[#8B6914] font-bold mb-1 sm:mb-2 text-sm sm:text-base">{member.role}</div>
                      <p className="text-[#8B7355] text-xs sm:text-sm">{member.shortBio}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Journey Tab */}
          {activeTab === 'journey' && (
            <div className="animate-fadeIn">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 sm:left-6 md:left-1/2 h-full w-0.5 sm:w-1 bg-gradient-to-b from-[#C9A227] to-[#D4AF37] transform md:-translate-x-1/2"></div>

                {milestones.map((milestone, index) => (
                  <div
                    key={index}
                    className={`relative mb-8 sm:mb-12 ${index % 2 === 0 ? 'md:pr-1/2 md:pl-0 md:text-right' : 'md:pl-1/2 md:pr-0'
                      }`}
                  >
                    <div className={`flex items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : ''
                      }`}>
                      {/* Circle */}
                      <div className="absolute left-4 sm:left-6 md:left-1/2 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-[#FFFDF9] border-3 sm:border-4 border-[#C9A227] rounded-full transform md:-translate-x-1/2 z-10 shadow-md"></div>

                      {/* Content */}
                      <div className={`ml-12 sm:ml-16 md:ml-0 ${index % 2 === 0 ? 'md:pr-8 lg:pr-12' : 'md:pl-8 lg:pl-12'
                        }`}>
                        <div className="bg-[#FFFDF9] p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg shadow-[#E8E0D5]/60 border border-[#E8E0D5] hover:border-[#C9A227]/50 transition-colors">
                          <div className="text-xs sm:text-sm font-bold text-[#8B6914] mb-1 sm:mb-2">{milestone.year}</div>
                          <h3 className="cs-display text-base sm:text-lg md:text-xl font-bold text-[#3E2C1C] mb-1 sm:mb-2">{milestone.title}</h3>
                          <p className="text-[#8B7355] text-xs sm:text-sm md:text-base">{milestone.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials - Updated with different data */}
      <section className="py-12 sm:py-16 md:py-20 bg-[#F5F0E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="cs-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-center text-[#3E2C1C] mb-8 sm:mb-12">
            What Our <span className="text-[#8B6914]">Customers Say</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {testimonialsData.map((testimonial) => (
              <div key={testimonial.id} className="bg-[#FFFDF9] p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-lg shadow-[#E8E0D5]/60 border border-[#E8E0D5] flex flex-col justify-between">
                <div>
                  <div className="flex items-center mb-4 sm:mb-6">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-[#5C3A21] italic mb-6 text-sm sm:text-base">
                    "{testimonial.text}"
                  </p>
                </div>
                <div className="flex items-center mt-auto">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full mr-3 sm:mr-4 border-2 border-[#E8E0D5] object-cover"
                  />
                  <div>
                    <div className="font-bold text-[#3E2C1C] text-sm sm:text-base">{testimonial.name}</div>
                    <div className="text-xs sm:text-sm text-[#8B7355]">{testimonial.location} • {testimonial.event}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-[#4A2E1B] via-[#5C3A21] to-[#2E1B0F] rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-xl sm:shadow-2xl shadow-[#C9A227]/20 relative overflow-hidden">
            <div className="absolute -top-16 -left-16 h-48 w-48 rounded-full bg-[#C9A227]/10"></div>
            <div className="absolute -bottom-20 -right-12 h-56 w-56 rounded-full bg-[#C9A227]/10"></div>

            <div className="relative">
              <Award className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-[#E8C84A] mx-auto mb-4 sm:mb-6" />
              <h2 className="cs-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#FDFBF7] mb-4 sm:mb-6">
                Ready to Create Sweet Memories?
              </h2>
              <p className="text-lg sm:text-xl text-[#E8E0D5] mb-6 sm:mb-8 max-w-2xl mx-auto">
                Order your perfect cake today and make your celebration unforgettable.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <button className="bg-gradient-to-r from-[#C9A227] to-[#D4AF37] text-[#2E1B0F] px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold hover:from-[#B8911E] hover:to-[#C9A227] transition-colors text-sm sm:text-base shadow-lg shadow-[#C9A227]/30">
                  Order Now
                </button>
                <button className="border-2 border-[#C9A227] text-[#E8C84A] px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold hover:bg-[#C9A227]/15 transition-colors text-sm sm:text-base">
                  Contact Us
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Member Modal */}
      {/* Team Member Modal - Left Image, Right Content */}
      {selectedMember && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div
            className="bg-[#FFFDF9] rounded-2xl sm:rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl border border-[#E8E0D5] relative flex flex-row h-[65vh] sm:h-[70vh] max-h-[600px]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-3 right-3 z-20 bg-white/90 p-1.5 sm:p-2 rounded-full hover:bg-white text-[#3E2C1C] transition-colors shadow-md"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Left Side: Image */}
            <div className="w-1/2 h-full relative shrink-0 bg-[#F5F0E8]">
              <img
                src={selectedMember.image}
                alt={selectedMember.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Right Side: Scrollable Information */}
            <div className="w-1/2 h-full p-4 sm:p-6 md:p-8 overflow-y-auto custom-scrollbar">
              <h3 className="cs-display text-lg sm:text-2xl md:text-3xl font-bold text-[#3E2C1C] mb-1">{selectedMember.name}</h3>
              <div className="text-[#8B6914] font-bold text-xs sm:text-base md:text-lg mb-3 sm:mb-4">{selectedMember.role}</div>

              <p className="text-[#8B7355] mb-4 sm:mb-6 text-xs sm:text-sm md:text-base leading-relaxed">
                {selectedMember.fullBio}
              </p>

              <div className="mb-2 sm:mb-3 font-bold text-[#3E2C1C] text-[10px] sm:text-xs uppercase tracking-wider">Specialties</div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 pb-2">
                {selectedMember.specialties.map((spec, i) => (
                  <span key={i} className="bg-[#FDF8E8] text-[#8B6914] text-[10px] sm:text-xs font-semibold px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-[#E8D58A]">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AboutUs;