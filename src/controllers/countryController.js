// src/controllers/countriesController.js
import sequelize from "../config/database.js";
import Country from "../models/countryModel.js";
import Metadata from "../models/metadataModel.js";
import { refreshAllCountries } from "../services/refreshService.js";
import fs from "fs";
import path from "path";
import { Op } from "sequelize";

export async function postRefresh(req, res, next) {
  try {
    const result = await refreshAllCountries();
    res.json(result);
  } catch (err) {
    if (err.status === 503) return res.status(503).json({ error: err.message, details: err.details });
    next(err);
  }
}

export async function getCountries(req, res, next) {
  try {
    const { region, currency, sort } = req.query;
    const where = {};
    if (region) where.region = region;
    if (currency) where.currency_code = currency;
    const order = [];
    if (sort === "gdp_desc") order.push(["estimated_gdp", "DESC"]);

    const rows = await Country.findAll({ where, order });
    const data = rows.map(r => ({
      id: r.id,
      name: r.name,
      capital: r.capital,
      region: r.region,
      population: Number(r.population),
      currency_code: r.currency_code,
      exchange_rate: r.exchange_rate === null ? null : Number(r.exchange_rate),
      estimated_gdp: r.estimated_gdp === null ? null : Number(r.estimated_gdp),
      flag_url: r.flag_url,
      last_refreshed_at: r.last_refreshed_at ? r.last_refreshed_at.toISOString() : null
    }));
    res.json(data);
  } catch (err) { next(err); }
}

export async function getCountryByName(req, res, next) {
  try {
    const name = req.params.name;
    const row = await Country.findOne({
      where: sequelize.where(sequelize.fn("lower", sequelize.col("name")), name.toLowerCase())
    });
    if (!row) return res.status(404).json({ error: "Country not found" });
    res.json({
      id: row.id,
      name: row.name,
      capital: row.capital,
      region: row.region,
      population: Number(row.population),
      currency_code: row.currency_code,
      exchange_rate: row.exchange_rate === null ? null : Number(row.exchange_rate),
      estimated_gdp: row.estimated_gdp === null ? null : Number(row.estimated_gdp),
      flag_url: row.flag_url,
      last_refreshed_at: row.last_refreshed_at ? row.last_refreshed_at.toISOString() : null
    });
  } catch (err) { next(err); }
}

export async function deleteCountryByName(req, res, next) {
  try {
    const name = req.params.name;
    const row = await Country.findOne({
      where: sequelize.where(sequelize.fn("lower", sequelize.col("name")), name.toLowerCase())
    });
    if (!row) return res.status(404).json({ error: "Country not found" });
    await row.destroy();
    res.json({ success: true });
  } catch (err) { next(err); }
}

export async function getStatus(req, res, next) {
  try {
    const total = await Country.count();
    const last = await Metadata.findByPk("last_refreshed_at");
    res.json({ total_countries: total, last_refreshed_at: last ? last.value : null });
  } catch (err) { next(err); }
}

export async function getImage(req, res, next) {
  try {
    const imagePath = path.resolve(process.env.CACHE_DIR || "./cache", "summary.png");
    if (!fs.existsSync(imagePath)) return res.status(404).json({ error: "Summary image not found" });
    res.sendFile(imagePath);
  } catch (err) { next(err); }
}
