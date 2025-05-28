const db = require("../db");

module.exports = async (req, res) => {
  try {
    const visitorsCollection = await db.getCollection("visitors");

    if (req.method === "GET") {
      const visitor = await visitorsCollection.findOne({ id: 1 });
      if (!visitor) {
        await visitorsCollection.insertOne({ id: 1, count: 0 });
        return res.status(200).json({ count: 0 });
      }
      return res.status(200).json({ count: visitor.count });
    } else if (req.method === "POST") {
      const result = await visitorsCollection.findOneAndUpdate(
        { id: 1 },
        { $inc: { count: 1 } },
        { returnDocument: "after" }
      );

      if (!result.value) {
        return res
          .status(500)
          .json({ error: "Failed to increment visitor count" });
      }

      return res.status(200).json({ count: result.value.count });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Visitor handler error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
