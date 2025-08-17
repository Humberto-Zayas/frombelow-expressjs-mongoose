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
  'https://frombelowstudio.com',
  'https://expressjs-mongoose-production-6969.up.railway.app'
];

// CORS configuration
const corsOptions: cors.CorsOptions = {
  origin: function (origin, callback) {
    if (!origin) {
      // Allow requests with no origin (like Postman or server-to-server)
      return callback(null, true);
    }
    const isAllowed = allowedOrigins.some(o => origin.startsWith(o));
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS: ' + origin));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Use CORS middleware with the options
app.use(cors(corsOptions));

app.options('*', cors(corsOptions));

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