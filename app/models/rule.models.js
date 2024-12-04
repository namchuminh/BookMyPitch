const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config.js");

const Rule = sequelize.define("rule", {
  Id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  PitchId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  Rules: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: "rule" 
});

module.exports = Rule;
