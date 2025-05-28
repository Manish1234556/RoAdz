const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

// Define Booking Schema
const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  service: { type: String, required: true },
  units: { type: Number, required: true },
  message: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

const Booking = mongoose.model("Booking", bookingSchema);

// POST /api/bookings
router.post("/", async (req, res) => {
  try {
    const { name, email, service, units, message } = req.body;

    // Log incoming request body for debugging
    console.log("Received booking request:", {
      name,
      email,
      service,
      units,
      message,
    });

    // Validate required fields
    if (!name || !email || !service || !units || !message) {
      console.log("Validation failed: Missing required fields");
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.log("Validation failed: Invalid email format");
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Validate units
    if (units < 1) {
      console.log("Validation failed: Units must be at least 1");
      return res.status(400).json({ error: "Units must be at least 1" });
    }

    // Create new booking
    const booking = new Booking({
      name,
      email,
      service,
      units,
      message,
    });

    // Save to database
    console.log("Attempting to save booking to database...");
    await booking.save();
    console.log("Booking saved successfully:", booking);

    res.status(201).json({ message: "Booking submitted successfully" });
  } catch (error) {
    console.error("Error saving booking:", error.message);
    console.error("Full error:", error);
    console.error("Error stack:", error.stack);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

module.exports = router;
