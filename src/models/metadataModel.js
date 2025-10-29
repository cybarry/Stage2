// src/models/metadataModel.js
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Metadata = sequelize.define("Metadata", {
  key: { type: DataTypes.STRING, primaryKey: true },
  value: { type: DataTypes.TEXT, allowNull: true }
}, {
  tableName: "metadata",
  timestamps: false
});

export default Metadata;
