const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config.js");

const Category = sequelize.define("category", {
  Id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  Avatar: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  Slug: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  Type: {
    type: DataTypes.NUMBER,
    allowNull: false
  }
}, {
  tableName: "category" 
});

module.exports = Category;
