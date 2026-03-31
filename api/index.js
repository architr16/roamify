require('dotenv').config();
console.log("ENV CHECK:", process.env.MONGODB_URI);
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
// Proper connection options are set by default in Mongoose 6+, but we can add them to be explicit as per instructions.
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) return;
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

// --- Mongoose Schemas & Models ---

const ContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  destination: { type: String },
  message: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const BookingSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  packageId: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

// Since Vercel Serverless handles hot reloading, cache the models
const Contact = mongoose.models.Contact || mongoose.model('Contact', ContactSchema);
const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);

// --- API Routes ---

// Health check route
app.get('/api', (req, res) => {
  res.json({ message: 'Roamify API is running!' });
});

// POST: Handle contact form submissions
app.post('/api/contact', async (req, res) => {
  try {
    await connectDB();
    const { name, email, phone, destination, message } = req.body;

    // Basic validation
    if (!name || !email) {
      return res.status(400).json({ success: false, error: 'Name and email are required fields.' });
    }

    const newContact = new Contact({ name, email, phone, destination, message });
    await newContact.save();

    res.status(201).json({ success: true, message: 'Contact saved successfully.', data: newContact });
  } catch (error) {
    console.error('Error saving contact:', error);
    res.status(500).json({ success: false, error: 'Internal server error processing contact.' });
  }
});

// POST: Handle booking form submissions
app.post('/api/booking', async (req, res) => {
  try {
    await connectDB();
    const { fullName, email, phone, packageId } = req.body;

    // Basic validation
    if (!fullName || !email || !phone || !packageId) {
      return res.status(400).json({ success: false, error: 'All fields are required for a booking.' });
    }

    const newBooking = new Booking({ fullName, email, phone, packageId });
    await newBooking.save();

    res.status(201).json({ success: true, message: 'Booking saved successfully.', data: newBooking });
  } catch (error) {
    console.error('Error saving booking:', error);
    res.status(500).json({ success: false, error: 'Internal server error processing booking.' });
  }
});

// GET: Fetch all bookings
app.get('/api/booking', async (req, res) => {
  try {
    await connectDB();
    const bookings = await Booking.find().sort({ date: -1 });
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ success: false, error: 'Internal server error fetching bookings.' });
  }
});

// Start server locally if not in a Vercel environment
if (process.env.NODE_ENV !== 'production' && require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
