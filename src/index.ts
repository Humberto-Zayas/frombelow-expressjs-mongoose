import "./lib/db";
import express from "express";
import cors from "cors"; // Import the cors module
import countryRoutes from "./routes/country";
import dayRoutes from "./routes/days";
import bookingRoutes from './routes/bookings';
import { sendEmail, sendStatusEmail, sendBookingChangeEmail, sendPaymentStatusEmail } from './emailService';

const app = express();
const port = process.env.PORT || 3333;

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:3000', // Replace with your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers if needed
};

// Use CORS middleware with the options
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.raw({ type: "application/vnd.custom-type" }));
app.use(express.text({ type: "text/html" }));

app.get("/", async (req, res) => {
  res.json({ message: "Please visit /countries to view all the countries" });
});

app.use("/countries", countryRoutes);
app.use("/days", dayRoutes);
app.use('/bookings', bookingRoutes);

app.post('/send-email', async (req, res) => {
  const { to, subject, text } = req.body;

  try {
    await sendEmail(to, subject, text);
    res.json({ message: "Email sent successfully" });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send({message: 'Error sending email'});
  }
});

app.post('/send-status-email', async (req, res) => {
  const { to, status, bookingId, depositLink } = req.body;

  try {
    // Pass the depositLink to the sendStatusEmail function
    await sendStatusEmail(to, status, bookingId, depositLink);
    res.json({ message: `Status email (${status}) sent successfully to ${to}` });
  } catch (error) {
    console.error('Error sending status email:', error);
    res.status(500).send({ message: 'Error sending status email' });
  }
});

app.post('/send-booking-change-email', async (req, res) => {
  const { to, name, id, newDate, newHours } = req.body;

  try {
    await sendBookingChangeEmail(to, name, id, newDate, newHours);
    res.json({ message: `Booking change email sent successfully to ${to}` });
  } catch (error) {
    console.error('Error sending booking change email:', error);
    res.status(500).send({ message: 'Error sending booking change email' });
  }
});

app.post('/send-payment-status-email', async (req, res) => {
  const { to, name, id, paymentStatus } = req.body;

  try {
    await sendPaymentStatusEmail(to, name, id, paymentStatus);
    res.json({ message: `Payment status email sent successfully to ${to}` });
  } catch (error) {
    console.error('Error sending payment status email:', error);
    res.status(500).send({ message: 'Error sending payment status email' });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
