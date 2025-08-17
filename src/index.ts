import "./lib/db";
import express from "express";
import cors from "cors"; // Import the cors module
import countryRoutes from "./routes/country";
import dayRoutes from "./routes/days";
import bookingRoutes from './routes/bookings';
import emailRoutes from './routes/email';

const app = express();
const port = parseInt(process.env.PORT || "3333", 10);

const host = process.env.HOSTNAME || "0.0.0.0";

const allowedOrigins = [
  'http://localhost:3000',
  'https://create-react-app-site-production-d956.up.railway.app',
  'https://frombelowstudio.com'
];

// CORS configuration
const corsOptions: cors.CorsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // include this if you're using cookies/auth
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

app.listen(port, host, () => {
  console.log(`Server listening at http://${host}:${port}`);
});