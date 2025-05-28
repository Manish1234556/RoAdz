const express = require("express");
const cors = require("cors");
const db = require("./db");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize visitor count if not exists
async function initializeVisitorCount() {
  const visitorsCollection = await db.getCollection("visitors");
  const visitor = await visitorsCollection.findOne({ id: 1 });
  if (!visitor) {
    await visitorsCollection.insertOne({ id: 1, count: 0 });
  }
}

// Routes
app.get("/api/visitors", async (req, res) => {
  try {
    const visitorsCollection = await db.getCollection("visitors");
    const visitor = await visitorsCollection.findOne({ id: 1 });
    if (!visitor) {
      await visitorsCollection.insertOne({ id: 1, count: 0 });
      return res.status(200).json({ count: 0 });
    }
    res.status(200).json({ count: visitor.count });
  } catch (error) {
    console.error("Error fetching visitor count:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/visitors", async (req, res) => {
  try {
    const visitorsCollection = await db.getCollection("visitors");
    console.log("Incrementing visitor count...");
    const result = await visitorsCollection.findOneAndUpdate(
      { id: 1 },
      { $inc: { count: 1 } },
      { returnDocument: "after" }
    );
    console.log("Updated visitor count:", result.value);
    if (!result.value) {
      await visitorsCollection.insertOne({ id: 1, count: 1 });
      return res.status(200).json({ count: 1 });
    }
    res.status(200).json({ count: result.value.count });
  } catch (error) {
    console.error("Error incrementing visitor count:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }
  try {
    const contactsCollection = await db.getCollection("contacts");
    await contactsCollection.insertOne({
      name,
      email,
      message,
      created_at: new Date(),
    });
    res.status(201).json({ message: "Contact form submitted successfully" });
  } catch (error) {
    console.error("Error submitting contact form:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/bookings", async (req, res) => {
  const { name, email, service, units, message } = req.body;
  if (!name || !email || !service || !units || units < 1 || !message) {
    return res
      .status(400)
      .json({ error: "All fields are required and units must be at least 1" });
  }
  try {
    const bookingsCollection = await db.getCollection("bookings");
    console.log("Attempting to save booking:", {
      name,
      email,
      service,
      units,
      message,
    });
    await bookingsCollection.insertOne({
      name,
      email,
      service,
      units: parseInt(units),
      message,
      created_at: new Date(),
    });
    console.log("Booking saved successfully");
    res.status(201).json({ message: "Booking submitted successfully" });
  } catch (error) {
    console.error("Error submitting booking:", error.message);
    console.error("Full error:", error);
    console.error("Error stack:", error.stack);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

// Serve static files after API routes
app.use(express.static("public"));

// Start the server after connecting to the database (for local development)
if (process.env.NODE_ENV !== "production") {
  async function startServer() {
    try {
      await db.connect();
      await initializeVisitorCount();
      const collections = await db.getCollectionNames();
      console.log("Available collections:", collections);
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    } catch (error) {
      console.error("Failed to start server:", error);
      process.exit(1);
    }
  }
  startServer();
}

// Export the app for Vercel
module.exports = app;
