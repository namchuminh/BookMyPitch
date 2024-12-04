const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config.js");

const Image = sequelize.define("image", {
  Id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  PitchId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  Image: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: "image" 
});

module.exports = Image;
