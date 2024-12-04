const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config.js");
const Pitch = require("../models/pitchs.models.js");

const Facility = sequelize.define("facility", {
  Id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  PitchId: {
    type: DataTypes.NUMBER,
    allowNull: false
  },
  Shirt: {
    type: DataTypes.NUMBER,
    default: 0,
    allowNull: true
  },
  Water: {
    type: DataTypes.NUMBER,
    default: 0,
    allowNull: true
  },
  Referee: {
    type: DataTypes.NUMBER,
    default: 0,
    allowNull: true
  },
  Shoe: {
    type: DataTypes.NUMBER,
    default: 0,
    allowNull: true
  },
  Bathroom: {
    type: DataTypes.NUMBER,
    default: 0,
    allowNull: true
  },
  Ball: {
    type: DataTypes.NUMBER,
    default: 0,
    allowNull: true
  },
}, {
  tableName: "facility" 
});

module.exports = Facility;

// Facility.belongsTo(Pitch, { foreignKey: 'PitchId' });
