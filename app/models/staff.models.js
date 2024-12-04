const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config.js");

const Staff = sequelize.define("staff", {
  Id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  FullName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  Username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  Password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  CustomerId: {
    type: DataTypes.NUMBER,
    allowNull: true
  }
}, {
  tableName: "staff" 
});

module.exports = Staff;
