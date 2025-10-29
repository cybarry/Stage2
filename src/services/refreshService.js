// src/services/refreshService.js
import axios from "axios";
import Country from "../models/countryModel.js";
import Metadata from "../models/metadataModel.js";
import { createSummaryImage } from "../utils/image.js";
import path from "path";
import sequelize from "../config/database.js";

export async function refreshAllCountries() {
  const countriesUrl = "https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies";
  const ratesUrl = "https://open.er-api.com/v6/latest/USD";

  try {
    const [countriesRes, ratesRes] = await Promise.all([
      axios.get(countriesUrl, { timeout: 15000 }),
      axios.get(ratesUrl, { timeout: 15000 }),
    ]);

    if (countriesRes.status !== 200 || ratesRes.status !== 200) {
      throw {
        status: 503,
        message: "External data source unavailable",
        details: "Could not fetch data from one or both APIs",
      };
    }

    const countriesData = countriesRes.data;
    const ratesData = ratesRes.data?.rates || {};

    const savedCountries = [];

    // Transaction ensures consistency
    await sequelize.transaction(async (t) => {
      for (const c of countriesData) {
        const name = c.name?.trim();
        const capital = c.capital || null;
        const region = c.region || null;
        const population = c.population || 0;
        const flag_url = c.flag || null;

        // Handle currencies
        const currency_code =
          Array.isArray(c.currencies) && c.currencies.length > 0
            ? c.currencies[0].code
            : null;

        const exchange_rate =
          currency_code && ratesData[currency_code]
            ? ratesData[currency_code]
            : null;

        // Compute estimated_gdp
        let estimated_gdp = null;
        if (exchange_rate && population) {
          const multiplier = Math.floor(Math.random() * (2000 - 1000 + 1)) + 1000;
          estimated_gdp = (population * multiplier) / exchange_rate;
        } else if (currency_code === null) {
          estimated_gdp = 0;
        }

        const last_refreshed_at = new Date();

        const existing = await Country.findOne({
          where: sequelize.where(
            sequelize.fn("lower", sequelize.col("name")),
            name.toLowerCase()
          ),
          transaction: t,
        });

        if (existing) {
          await existing.update(
            {
              capital,
              region,
              population,
              currency_code,
              exchange_rate,
              estimated_gdp,
              flag_url,
              last_refreshed_at,
            },
            { transaction: t }
          );
          savedCountries.push(existing);
        } else {
          const newCountry = await Country.create(
            {
              name,
              capital,
              region,
              population,
              currency_code,
              exchange_rate,
              estimated_gdp,
              flag_url,
              last_refreshed_at,
            },
            { transaction: t }
          );
          savedCountries.push(newCountry);
        }
      }

      // Update metadata
      const timestamp = new Date().toISOString();
      await Metadata.upsert(
        { key: "last_refreshed_at", value: timestamp },
        { transaction: t }
      );

      // Generate summary image
      const total = savedCountries.length;
      const top5 = savedCountries
        .filter((c) => c.estimated_gdp)
        .sort((a, b) => b.estimated_gdp - a.estimated_gdp)
        .slice(0, 5)
        .map((c) => ({
          name: c.name,
          estimated_gdp: c.estimated_gdp,
        }));

      const outPath = path.resolve(process.env.CACHE_DIR || "./cache", "summary.png");
      await createSummaryImage({ total, top5, timestamp, outPath });
    });

    return { message: "Countries data fetched and saved successfully", count: savedCountries.length };
  } catch (err) {
    if (err.status === 503) throw err;
    console.error("❌ Refresh failed:", err.message);
    throw { status: 500, message: "Internal server error", details: err.message };
  }
}
