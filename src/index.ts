import "./lib/db";
import express from "express";
import cors from "cors"; // Import the cors module
import countryRoutes from "./routes/country";
import dayRoutes from "./routes/days";

const app = express();
const port = process.env.PORT || 3333;

// Use cors middleware
app.use(cors());

app.use(express.json());
app.use(express.raw({ type: "application/vnd.custom-type" }));
app.use(express.text({ type: "text/html" }));

app.get("/", async (req, res) => {
  res.json({ message: "Please visit /countries to view all the countries" });
});

app.use("/countries", countryRoutes);
app.use("/days", dayRoutes);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
