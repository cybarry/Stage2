// src/routes/countries.js
import express from "express";
import {
  postRefresh,
  getCountries,
  getCountryByName,
  deleteCountryByName,
  getStatus,
  getImage
} from "../controllers/countryController.js";

const router = express.Router();

router.post("/refresh", postRefresh);
router.get("/", getCountries);
router.get("/image", getImage);          // keep before :name
router.get("/status", getStatus);        // optional: or at top-level /status
router.get("/:name", getCountryByName);
router.delete("/:name", deleteCountryByName);

export default router;
