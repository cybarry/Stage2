import express from "express";
import sequelize from "./config/database.js";
import countryRoutes from './routes/countryRoutes.js';
import Country from "./models/countryModel.js";

import dotenv from "dotenv";
dotenv.config();


const app = express();
app.use(express.json());

app.use('/countries', countryRoutes);

// GET /status as top-level route if you prefer:
app.get("/status", async (req, res, next) => {
  try {
    const metadata = await import("./models/metadataModel.js");
    const CountryModel = (await import("./models/countryModel.js")).default;
    const total = await CountryModel.count();
    const last = await metadata.default.findByPk("last_refreshed_at");
    res.json({ total_countries: total, last_refreshed_at: last ? last.value : null });
  } catch (err) { next(err); }
});

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to HNG Country Currency API 🚀" });
});

// Try connecting to DB
sequelize
  .authenticate()
  .then(() => console.log("✅ Database connected successfully"))
  .catch((err) => console.error("❌ Database connection failed:", err.message));

await sequelize.sync({ alter: true }); 
console.log("🗃️  Database & tables created!");


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🌍 Server running on port ${PORT}`));
