import express from "express";
import jwt from "jsonwebtoken";
import { db } from "../db.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

function verifyToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "Unauthorized" });
  try {
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ error: "Invalid token" });
  }
}

// Public: list rooms
router.get("/rooms", async (req, res) => {
  const [rows] = await db.execute("SELECT * FROM rooms");
  res.json(rows);
});

// User: book room
router.post("/book", verifyToken, async (req, res) => {
  const { room_id, check_in, check_out } = req.body;
  const userId = req.user.id;
  try {
    await db.execute("INSERT INTO bookings (user_id, room_id, check_in, check_out) VALUES (?, ?, ?, ?)", [userId, room_id, check_in, check_out]);
    await db.execute("UPDATE rooms SET status = 'booked' WHERE id = ?", [room_id]);
    res.json({ message: "Room booked successfully" });
  } catch (err) {
    res.status(500).json({ error: "DB error" });
  }
});

// Admin: get all bookings
router.get("/all", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Access denied" });
  const [rows] = await db.execute("SELECT b.id, b.check_in, b.check_out, b.user_id, b.room_id, u.name AS user_name, r.room_number FROM bookings b JOIN users u ON b.user_id=u.id JOIN rooms r ON b.room_id=r.id");
  res.json(rows);
});

// Admin: add room
router.post("/rooms/add", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Access denied" });
  const { room_number, room_type, price } = req.body;
  try {
    await db.execute("INSERT INTO rooms (room_number, room_type, price) VALUES (?, ?, ?)", [room_number, room_type, price]);
    res.json({ message: "Room added successfully" });
  } catch {
    res.status(500).json({ error: "DB error" });
  }
});

// Admin: update room
router.put("/rooms/:id", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Access denied" });
  const { id } = req.params;
  const { room_number, room_type, price, status } = req.body;
  try {
    await db.execute("UPDATE rooms SET room_number=?, room_type=?, price=?, status=? WHERE id=?", [room_number, room_type, price, status, id]);
    res.json({ message: "Room updated successfully" });
  } catch {
    res.status(500).json({ error: "DB error" });
  }
});



export default router;
// Admin: delete room
router.delete("/rooms/:id", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Access denied" });
  const { id } = req.params;
  try {
    // Check if room is booked
    const [bookings] = await db.execute("SELECT * FROM bookings WHERE room_id = ?", [id]);
    if (bookings.length) return res.status(400).json({ error: "Cannot delete room: it has bookings" });

    await db.execute("DELETE FROM rooms WHERE id = ?", [id]);
    res.json({ message: "Room deleted successfully" });
  } catch {
    res.status(500).json({ error: "DB error" });
  }
});
