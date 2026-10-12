import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/axios";
import {
  Save,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Package,
  DollarSign,
  Tag,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Circle,
  Store,
  EyeOff,
} from "lucide-react";

/* ---------- Cake-shop typography + small custom effects ---------- */
const shopStyles = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700;800&family=Pacifico&family=Quicksand:wght@400;500;600;700&display=swap');

.cs-body    { font-family: 'Quicksand', system-ui, sans-serif; }
.cs-display { font-family: 'Playfair Display', Georgia, serif; } /* Bade Letters ke liye */
.cs-script  { font-family: 'Pacifico', cursive; }

.cs-frosting {
  height: 22px;
  background-image: radial-gradient(circle at 50% 0, #C9A227 0 15px, transparent 16px);
  background-size: 36px 22px;
  background-repeat: repeat-x;
}

@keyframes cs-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
@keyframes cs-rise  { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
.cs-float { animation: cs-float 4s ease-in-out infinite; }
.cs-rise  { animation: cs-rise 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
`;

const CATEGORIES = [
  { value: "birthday", label: "Birthday", emoji: "🎉" },
  { value: "wedding", label: "Wedding", emoji: "💒" },
  { value: "anniversary", label: "Anniversary", emoji: "💝" },
  { value: "custom", label: "Custom", emoji: "🎨" },
  { value: "premium", label: "Premium", emoji: "👑" },
  { value: "vegan", label: "Vegan", emoji: "🌱" },
];

const WEIGHTS = [
  { value: "0.5kg", label: "0.5 kg", sub: "4-6 people" },
  { value: "1kg", label: "1 kg", sub: "8-10 people" },
  { value: "1.5kg", label: "1.5 kg", sub: "12-15 people" },
  { value: "2kg", label: "2 kg", sub: "16-20 people" },
  { value: "3kg", label: "3 kg", sub: "25-30 people" },
];

const FLAVORS = [
  { value: "vanilla", label: "Vanilla", emoji: "🌿" },
  { value: "chocolate", label: "Chocolate", emoji: "🍫" },
  { value: "strawberry", label: "Strawberry", emoji: "🍓" },
  { value: "red-velvet", label: "Red Velvet", emoji: "❤️" },
  { value: "butterscotch", label: "Butterscotch", emoji: "🍯" },
  { value: "pineapple", label: "Pineapple", emoji: "🍍" },
];

// same category tints the customer sees on the cake page (RESTORED ORIGINAL VIBRANT COLORS)
const getCategoryColor = (category) => {
  const colors = {
    birthday: "bg-pink-50 text-pink-700 border-pink-200",
    wedding: "bg-purple-50 text-purple-700 border-purple-200",
    anniversary: "bg-red-50 text-red-700 border-red-200",
    custom: "bg-blue-50 text-blue-700 border-blue-200",
    vegan: "bg-green-50 text-green-700 border-green-200",
    premium: "bg-amber-50 text-amber-700 border-amber-200",
  };
  return colors[category?.toLowerCase()] || "bg-orange-50 text-orange-700 border-orange-200";
};

const inputBase =
  "w-full px-4 py-3.5 rounded-2xl bg-[#FFFDF9] border-2 focus:outline-none focus:ring-4 focus:ring-[#C9A227]/20 focus:border-[#C9A227] transition-all text-[#3E2C1C] placeholder-[#8B7355]/60 font-semibold";

const CakeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "birthday",
    isAvailable: true,
    weight: "1kg",
    flavor: "vanilla",
    ingredients: "",
    servings: "8-10",
  });

  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [errors, setErrors] = useState({});
  const [imageLoading, setImageLoading] = useState(false);

  // EDIT MODE → load the existing cake
  useEffect(() => {
    if (id) {
      fetchCake();
    }
  }, [id]);

  // Image preview effect
  useEffect(() => {
    let cancelled = false;

    if (formData.image) {
      setImageLoading(true);
      setImageError(false);
      const img = new Image();
      img.src = formData.image;
      img.onload = () => {
        if (cancelled) return;
        setPreviewImage(formData.image);
        setImageLoading(false);
      };
      img.onerror = () => {
        if (cancelled) return;
        setPreviewImage("");
        setImageError(true);
        setImageLoading(false);
      };
    } else {
      setPreviewImage("");
      setImageLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [formData.image]);

  const fetchCake = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/cakes/${id}`);
      setFormData({
        name: data.name || "",
        description: data.description || "",
        price: data.price || "",
        image: data.image || "",
        category: data.category || "birthday",
        isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
        weight: data.weight || "1kg",
        flavor: data.flavor || "vanilla",
        ingredients: data.ingredients || "",
        servings: data.servings || "8-10",
      });
    } catch (err) {
      toast.error("Couldn't load this cake. Go back and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Cake name is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.price || Number(formData.price) <= 0) newErrors.price = "Enter a valid price";
    if (!formData.image.trim()) newErrors.image = "Image URL is required";
    if (imageError) newErrors.image = "This image URL doesn't load. Check the link.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // input handler
  const changeHandler = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (name === "image") {
      setImageError(false);
    }
  };

  // chip pickers (category / weight / flavor)
  const setField = (name, value) => setFormData((prev) => ({ ...prev, [name]: value }));

  // submit
  const submitHandler = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    setLoading(true);

    try {
      if (id) {
        await api.put(`/cakes/${id}`, formData);
        toast.success("Cake updated 🎉");
      } else {
        await api.post("/cakes", formData);
        toast.success("Cake added to inventory 🎂");
      }

      navigate("/admin/products");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- derived ---------- */
  const checklist = [
    { label: "Cake name", done: Boolean(formData.name.trim()) },
    { label: "Description", done: Boolean(formData.description.trim()) },
    { label: "Price above ₹0", done: Number(formData.price) > 0 },
    { label: "Image loads correctly", done: Boolean(formData.image && previewImage && !imageError) },
  ];
  const doneCount = checklist.filter((c) => c.done).length;
  const allDone = doneCount === checklist.length;

  const selectedCategory = CATEGORIES.find((c) => c.value === formData.category);
  const selectedWeight = WEIGHTS.find((w) => w.value === formData.weight);

  /* ---------------- Loading (edit mode) ---------------- */
  if (loading && id) {
    return (
      <div className="cs-body min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <style>{shopStyles}</style>
        <div className="text-center">
          <div className="text-6xl cs-float">🎂</div>
          <p className="cs-script mt-4 text-2xl text-[#8B6914]">Loading cake details...</p>
          <div className="mt-4 mx-auto h-1.5 w-40 rounded-full bg-[#E8E0D5] overflow-hidden">
            <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-[#C9A227] to-[#D4AF37] animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cs-body min-h-screen bg-[#FDFBF7] text-[#3E2C1C]">
      <style>{shopStyles}</style>

      {/* Header banner */}
      <div className="bg-gradient-to-r from-[#4A2E1B] to-[#2E1B0F] text-[#FDFBF7]">
        <div className="max-w-6xl mx-auto px-4 pt-6 pb-5">
          <button
            onClick={() => navigate("/admin/products")}
            className="inline-flex items-center gap-2 rounded-full bg-[#FDFBF7]/10 hover:bg-[#FDFBF7]/20 backdrop-blur px-4 py-2 text-sm font-bold transition mb-5 border border-[#C9A227]/30"
          >
            <ArrowLeft className="w-4 h-4 text-[#E8C84A]" />
            Back to Cake Inventory
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-[#FDFBF7]/10 backdrop-blur flex items-center justify-center text-3xl border border-[#C9A227]/30">
                {id ? "✏️" : "🎂"}
              </div>
              <div>
                <p className="cs-script text-xl text-[#E8C84A]">{id ? "Fine-tune the recipe" : "A new creation"}</p>
                <h1 className="cs-display text-3xl md:text-4xl font-extrabold">
                  {id ? "Edit Cake" : "Add New Cake"}
                </h1>
                <p className="text-[#E8E0D5] text-sm mt-0.5 font-semibold">
                  {id
                    ? "Update this cake's details. Changes go live in the shop right away."
                    : "Fill in the details below to list a new cake in your shop."}
                </p>
              </div>
            </div>

            <span
              className={`inline-flex items-center gap-2 self-start md:self-auto rounded-full px-4 py-2 text-sm font-bold border ${
                formData.isAvailable 
                  ? "bg-green-50 text-green-700 border-green-200" 
                  : "bg-[#FDFBF7]/10 text-[#E8E0D5] border-[#C9A227]/30"
              }`}
            >
              {formData.isAvailable ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Visible in shop
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4 text-[#E8C84A]" />
                  Hidden from shop
                </>
              )}
            </span>
          </div>
        </div>
      </div>
      <div className="cs-frosting"></div>

      <div className="max-w-6xl mx-auto px-4 pt-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ---------------- Form ---------------- */}
          <form onSubmit={submitHandler} className="lg:col-span-2 space-y-6 cs-rise">
            {/* 1 · Basics */}
            <Section step="1" title="The Basics" subtitle="Name and describe the cake">
              <div className="space-y-5">
                <Field label="Cake Name *" icon={<Package className="w-4 h-4" />} error={errors.name}>
                  <input
                    type="text"
                    name="name"
                    placeholder="Delicious Chocolate Truffle"
                    value={formData.name}
                    onChange={changeHandler}
                    className={`${inputBase} ${errors.name ? "border-red-400" : "border-[#E8E0D5] hover:border-[#C9A227]/50"}`}
                  />
                </Field>

                <Field label="Description *" error={errors.description}>
                  <textarea
                    name="description"
                    placeholder="Describe the cake: layers, flavors, decorations, anything special..."
                    value={formData.description}
                    onChange={changeHandler}
                    rows="4"
                    className={`${inputBase} resize-none ${
                      errors.description ? "border-red-400" : "border-[#E8E0D5] hover:border-[#C9A227]/50"
                    }`}
                  />
                </Field>
              </div>
            </Section>

            {/* 2 · Price & category */}
            <Section step="2" title="Price & Category" subtitle="How it's priced and where it shows up">
              <div className="space-y-5">
                <Field label="Price (₹) *" icon={<DollarSign className="w-4 h-4" />} error={errors.price}>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B6914] font-bold">₹</span>
                    <input
                      type="number"
                      name="price"
                      placeholder="1299"
                      value={formData.price}
                      onChange={changeHandler}
                      min="0"
                      step="1"
                      className={`${inputBase} pl-9 ${
                        errors.price ? "border-red-400" : "border-[#E8E0D5] hover:border-[#C9A227]/50"
                      }`}
                    />
                  </div>
                </Field>

                <Field label="Category *" icon={<Tag className="w-4 h-4" />}>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <Chip
                        key={cat.value}
                        active={formData.category === cat.value}
                        onClick={() => setField("category", cat.value)}
                      >
                        <span>{cat.emoji}</span> {cat.label}
                      </Chip>
                    ))}
                  </div>
                </Field>
              </div>
            </Section>

            {/* 3 · Photo */}
            <Section step="3" title="Cake Photo" subtitle="Paste a link to the cake's image">
              <Field label="Image URL *" icon={<ImageIcon className="w-4 h-4" />} error={errors.image || (imageError ? "This image URL doesn't load. Check the link." : "")}>
                <div className="relative">
                  <Upload className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C9A227]" />
                  <input
                    type="text"
                    name="image"
                    placeholder="https://images.unsplash.com/photo-1578985545062-69928b1d9587"
                    value={formData.image}
                    onChange={changeHandler}
                    className={`${inputBase} pl-12 ${
                      errors.image || imageError ? "border-red-400" : "border-[#E8E0D5] hover:border-[#C9A227]/50"
                    }`}
                  />
                </div>
                <p className="text-xs font-semibold text-[#8B7355] mt-1">
                  Use a bright, well-lit photo, ideally square. Unsplash links work well.
                </p>
              </Field>
            </Section>

            {/* 4 · Details */}
            <Section step="4" title="Size & Flavor" subtitle="Optional details customers see on the cake page">
              <div className="space-y-5">
                <Field label="Weight / Size">
                  <div className="flex flex-wrap gap-2">
                    {WEIGHTS.map((w) => (
                      <Chip key={w.value} active={formData.weight === w.value} onClick={() => setField("weight", w.value)}>
                        <span className="flex flex-col items-start leading-tight text-left">
                          <span>{w.label}</span>
                          <span className="text-[10px] font-semibold opacity-75">{w.sub}</span>
                        </span>
                      </Chip>
                    ))}
                  </div>
                </Field>

                <Field label="Flavor">
                  <div className="flex flex-wrap gap-2">
                    {FLAVORS.map((f) => (
                      <Chip key={f.value} active={formData.flavor === f.value} onClick={() => setField("flavor", f.value)}>
                        <span>{f.emoji}</span> {f.label}
                      </Chip>
                    ))}
                  </div>
                </Field>

                <Field label="Ingredients (optional)">
                  <textarea
                    name="ingredients"
                    placeholder="List the main ingredients, separated by commas..."
                    value={formData.ingredients}
                    onChange={changeHandler}
                    rows="3"
                    className={`${inputBase} resize-none border-[#E8E0D5] hover:border-[#C9A227]/50`}
                  />
                  <p className="text-xs font-semibold text-[#8B7355] mt-1">Example: Flour, Sugar, Eggs, Butter, Vanilla Extract, Chocolate</p>
                </Field>

                <Field label="Servings (optional)">
                  <input
                    type="text"
                    name="servings"
                    placeholder="8-10 people"
                    value={formData.servings}
                    onChange={changeHandler}
                    className={`${inputBase} border-[#E8E0D5] hover:border-[#C9A227]/50`}
                  />
                </Field>
              </div>
            </Section>

            {/* 5 · Availability */}
            <Section step="5" title="Shop Visibility" subtitle="Control whether customers can see and order this cake">
              <div className="flex items-center justify-between gap-4 p-4 bg-[#F5F0E8]/60 rounded-2xl border border-[#E8E0D5]">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-11 w-11 rounded-2xl flex items-center justify-center text-white shadow ${
                      formData.isAvailable ? "bg-gradient-to-br from-emerald-500 to-green-500" : "bg-gradient-to-br from-[#8B7355] to-[#5C3A21]"
                    }`}
                  >
                    {formData.isAvailable ? <Store className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="font-bold text-[#3E2C1C]">
                      {formData.isAvailable ? "Available for sale" : "Hidden from customers"}
                    </div>
                    <div className="text-sm font-semibold text-[#8B7355]">
                      {formData.isAvailable
                        ? "Customers can see and order this cake"
                        : "Customers can't see or order this cake until you turn it back on"}
                    </div>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={formData.isAvailable}
                    onChange={changeHandler}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-[#E8E0D5] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#C9A227]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-[#E8E0D5] after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>
            </Section>

            {/* Sticky save bar */}
            <div className="sticky bottom-4 z-20 flex items-center gap-3 rounded-[1.75rem] bg-[#FFFDF9]/95 backdrop-blur border border-[#E8E0D5] shadow-xl shadow-[#E8E0D5]/50 p-3">
              <button
                type="button"
                onClick={() => navigate("/admin/products")}
                disabled={loading}
                className="h-12 px-6 rounded-full border-2 border-[#E8E0D5] text-[#8B7355] font-bold hover:bg-[#F5F0E8] transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 h-12 rounded-full bg-gradient-to-r from-[#C9A227] to-[#D4AF37] text-[#2E1B0F] font-bold shadow-lg hover:from-[#B8911E] hover:to-[#C9A227] hover:shadow-xl transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="h-5 w-5 rounded-full border-2 border-[#2E1B0F]/30 border-t-[#2E1B0F] animate-spin"></span>
                    {id ? "Saving changes..." : "Adding cake..."}
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {id ? "Save Changes" : "Add Cake to Inventory"}
                  </>
                )}
              </button>
            </div>
          </form>

          {/* ---------------- Live preview column ---------------- */}
          <div className="lg:sticky lg:top-6 lg:self-start space-y-6 cs-rise">
            {/* Customer-view preview */}
            <div className="bg-[#FFFDF9] rounded-[1.75rem] shadow-lg shadow-[#E8E0D5]/60 border border-[#E8E0D5] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="cs-display text-lg font-bold text-[#3E2C1C]">Customer View</h3>
                <span className="rounded-full bg-[#FDF8E8] text-[#8B6914] border border-[#E8D58A] text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1">
                  Live preview
                </span>
              </div>

              <div className="rounded-[1.5rem] overflow-hidden border border-[#E8E0D5] shadow-md">
                <div className="relative h-52 bg-[#F5F0E8] p-4 flex items-center justify-center">
                  {imageLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="h-8 w-8 rounded-full border-4 border-[#E8D58A] border-t-[#C9A227] animate-spin"></span>
                    </div>
                  ) : previewImage ? (
                    <img src={previewImage} alt="Cake preview" className="w-full h-full object-contain" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
                      <div className="text-5xl cs-float">🎂</div>
                      <p className="text-xs font-semibold text-[#8B7355] mt-2">
                        {imageError ? "Image couldn't be loaded" : "Add an image URL to preview the photo"}
                      </p>
                    </div>
                  )}

                  <span
                    className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold border shadow bg-[#FFFDF9]/95 ${getCategoryColor(
                      formData.category
                    )}`}
                  >
                    {selectedCategory?.emoji} {selectedCategory?.label}
                  </span>

                  {!formData.isAvailable && (
                    <div className="absolute inset-0 bg-[#2E1B0F]/60 flex items-center justify-center">
                      <span className="rounded-full bg-[#FFFDF9] px-4 py-1.5 text-sm font-bold text-[#5C3A21] flex items-center gap-2 border border-[#E8E0D5]">
                        <EyeOff className="w-4 h-4 text-[#8B6914]" /> Hidden from shop
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h4 className={`cs-display text-lg font-bold line-clamp-1 ${formData.name ? "text-[#3E2C1C]" : "text-[#8B7355]"}`}>
                    {formData.name || "Cake name"}
                  </h4>
                  <p className={`text-sm mt-1 line-clamp-2 ${formData.description ? "text-[#8B7355]" : "text-[#8B7355]/60"}`}>
                    {formData.description || "The description will appear here..."}
                  </p>
                  <div className="flex items-end justify-between mt-3">
                    <div className="cs-display text-2xl font-extrabold text-[#3E2C1C]">
                      <span className="text-[#8B6914]">₹</span>
                      {Number(formData.price) > 0 ? Number(formData.price).toLocaleString("en-IN") : "—"}
                    </div>
                    <span className="rounded-full bg-[#F5F0E8] border border-[#E8E0D5] px-3 py-1 text-xs font-bold text-[#5C3A21]">
                      {selectedWeight?.label || formData.weight}
                    </span>
                  </div>
                </div>
              </div>

              {formData.image && !imageLoading && !imageError && (
                <div className="mt-4 text-center">
                  <a
                    href={formData.image}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-bold text-[#8B6914] hover:text-[#C9A227] transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Open full image
                  </a>
                </div>
              )}
            </div>

            {/* Listing checklist */}
            <div className="bg-[#FFFDF9] rounded-[1.75rem] shadow-lg shadow-[#E8E0D5]/60 border-2 border-dashed border-[#E8D58A] p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="cs-display text-lg font-bold text-[#3E2C1C]">Listing Checklist</h3>
                <span className="text-sm font-extrabold text-[#8B6914]">
                  {doneCount}/{checklist.length}
                </span>
              </div>

              <div className="h-2 w-full rounded-full bg-[#F5F0E8] overflow-hidden mb-4 border border-[#E8E0D5]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#C9A227] to-[#D4AF37] transition-all duration-500"
                  style={{ width: `${(doneCount / checklist.length) * 100}%` }}
                ></div>
              </div>

              <ul className="space-y-2.5">
                {checklist.map((item) => (
                  <li key={item.label} className="flex items-center gap-2.5 text-sm font-semibold">
                    {item.done ? (
                      <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-[#E8E0D5] shrink-0" />
                    )}
                    <span className={item.done ? "text-[#3E2C1C]" : "text-[#8B7355]"}>{item.label}</span>
                  </li>
                ))}
              </ul>

              <p
                className={`mt-4 rounded-2xl px-4 py-2.5 text-xs font-bold border ${
                  allDone ? "bg-green-50 text-green-700 border-green-200" : "bg-[#FDF8E8] text-[#8B6914] border-[#E8D58A]"
                }`}
              >
                {allDone ? "✓ All required details are in. Ready to save." : "Complete the required items before saving."}
              </p>
            </div>

            {/* Admin tips */}
            <div className="rounded-[1.75rem] bg-gradient-to-br from-[#F5F0E8] to-[#FDFBF7] border border-[#E8E0D5] p-5">
              <h3 className="cs-display text-lg font-bold text-[#3E2C1C] mb-3">Listing Tips</h3>
              <ul className="space-y-2.5 text-sm font-semibold text-[#8B7355]">
                {[
                  "Use a bright, well-lit photo. It's the first thing customers see.",
                  "Mention layers, flavors and decorations in the description.",
                  "Price by size and design complexity.",
                  "Switch the cake to hidden when it's out of stock instead of deleting it.",
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="h-6 w-6 shrink-0 rounded-full bg-gradient-to-br from-[#C9A227] to-[#D4AF37] text-[#2E1B0F] text-xs font-extrabold flex items-center justify-center border border-[#E8D58A]">
                      {i + 1}
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------- small building blocks ---------- */

const Section = ({ step, title, subtitle, children }) => (
  <div className="bg-[#FFFDF9] rounded-[1.75rem] shadow-lg shadow-[#E8E0D5]/60 border border-[#E8E0D5] p-6 md:p-7">
    <div className="flex items-center gap-3 mb-5 pb-4 border-b-2 border-dashed border-[#E8E0D5]">
      <div className="h-10 w-10 shrink-0 rounded-2xl bg-gradient-to-br from-[#C9A227] to-[#D4AF37] text-[#2E1B0F] shadow-md flex items-center justify-center cs-display font-extrabold text-lg border border-[#E8D58A]">
        {step}
      </div>
      <div>
        <h2 className="cs-display text-xl font-bold text-[#3E2C1C] leading-tight">{title}</h2>
        {subtitle && <p className="text-sm font-semibold text-[#8B7355]">{subtitle}</p>}
      </div>
    </div>
    {children}
  </div>
);

const Field = ({ label, icon, error, children }) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-bold text-[#5C3A21]">
      {icon && <span className="text-[#C9A227]">{icon}</span>}
      {label}
    </label>
    {children}
    {error && (
      <p className="text-sm text-red-600 flex items-center gap-1 font-semibold">
        <AlertCircle className="w-4 h-4" />
        {error}
      </p>
    )}
  </div>
);

const Chip = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold border-2 transition ${
      active
        ? "bg-gradient-to-r from-[#C9A227] to-[#D4AF37] text-[#2E1B0F] border-transparent shadow"
        : "bg-[#FFFDF9] text-[#8B6914] border-[#E8E0D5] hover:bg-[#FDF8E8] hover:border-[#E8D58A]"
    }`}
  >
    {children}
  </button>
);

export default CakeForm;