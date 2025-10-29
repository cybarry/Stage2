// src/models/countryModel.js
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Country = sequelize.define("Country", {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  capital: { type: DataTypes.STRING, allowNull: true },
  region: { type: DataTypes.STRING, allowNull: true },
  population: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  currency_code: { type: DataTypes.STRING, allowNull: true },
  exchange_rate: { type: DataTypes.DOUBLE, allowNull: true },
  estimated_gdp: { type: DataTypes.DOUBLE, allowNull: true },
  flag_url: { type: DataTypes.STRING, allowNull: true },
  last_refreshed_at: { type: DataTypes.DATE, allowNull: true }
}, {
  tableName: "countries",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at"
});

export default Country;
