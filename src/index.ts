import "./lib/db";
import express from "express";
import cors from "cors"; // Import the cors module
import countryRoutes from "./routes/country";
import dayRoutes from "./routes/days";
import bookingRoutes from './routes/bookings';
import emailRoutes from './routes/email';

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
app.use('/email', emailRoutes);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
