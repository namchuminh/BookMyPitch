const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config.js");

const Customer = sequelize.define("customer", {
  Id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  FullName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  Phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  Email: {
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
  IsOwner: {
    type: DataTypes.NUMBER,
    allowNull: true
  }
}, {
  tableName: "customer" 
});

module.exports = Customer;
