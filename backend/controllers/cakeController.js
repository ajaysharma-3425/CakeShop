const Cake = require("../models/cakeModel");
const User = require("../models/User");
const createNotification = require("../utils/createNotification");

// @desc   Create Cake (Admin)
// @route  POST /api/cakes
// @access Admin
exports.createCake = async (req, res) => {
  try {
    const { name, description, price, image, category } = req.body;

    if (!name || !description || !price || !image) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const cake = await Cake.create({
      name,
      description,
      price,
      image,
      category,
      createdBy: req.user._id,
    });

    res.status(201).json(cake);


    const users = await User.find({}, "_id");

    await createNotification({
      role: "user",
      title: "New Cake Added 🎂",
      message: `New cake "${cake.name}" is now available`,
      type: "cake",
      redirectTo: `/cakes/${cake._id}`, // 🔥
      broadcast: true, // 🔥 THIS IS KEY
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get All Cakes
// @route  GET /api/cakes
// @access Public
exports.getAllCakes = async (req, res) => {
  try {
    const cakes = await Cake.find({ isAvailable: true })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
    res.json(cakes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get Single Cake
// @route  GET /api/cakes/:id
// @access Public
exports.getCakeById = async (req, res) => {
  try {
    const cake = await Cake.findById(req.params.id)
      .populate({
        path: "createdBy",
        select: "name email",
        strictPopulate: false, // 🔥 FIX
      });

    if (!cake) {
      return res.status(404).json({ message: "Cake not found" });
    }

    res.json(cake);
  } catch (error) {
    console.error("GET CAKE ERROR:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};


// @desc   Update Cake (Admin)
// @route  PUT /api/cakes/:id
// @access Admin
exports.updateCake = async (req, res) => {
  try {
    const cake = await Cake.findById(req.params.id);

    if (!cake) {
      return res.status(404).json({ message: "Cake not found" });
    }

    Object.assign(cake, req.body);
    const updatedCake = await cake.save();
    // after cake.save()
    await createNotification({
      role: "user",
      title: "Cake Updated ✏️",
      message: `Cake "${updatedCake.name}" has been updated. Check out the latest details.`,
      type: "cake",
      broadcast: true,
    });


    res.json(updatedCake);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Delete Cake (Admin)
// @route  DELETE /api/cakes/:id
// @access Admin
exports.deleteCake = async (req, res) => {
  try {
    const cake = await Cake.findById(req.params.id);

    if (!cake) {
      return res.status(404).json({ message: "Cake not found" });
    }

    const cakeName = cake.name;

    await cake.deleteOne();

    await createNotification({
      role: "user",
      title: "Cake Unavailable ❌",
      message: `Cake "${cakeName}" is no longer available.`,
      type: "cake",
      broadcast: true,
    });


    res.json({ message: "Cake deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
