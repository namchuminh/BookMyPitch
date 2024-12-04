const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config.js");
const Category = require("./category.models.js");
const Facility = require("./facility.models.js");
const Customer = require("./customer.models.js");

const Pitch = sequelize.define("pitchs", {
  Id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  Description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  Avatar: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  Price: {
    type: DataTypes.NUMBER,
    allowNull: false
  },
  People: {
    type: DataTypes.NUMBER,
    allowNull: false
  },
  CategoryId: {
    type: DataTypes.NUMBER,
    allowNull: false
  },
  Slug: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  CustomerId: {
    type: DataTypes.NUMBER,
    allowNull: null
  },
  Address: {
    type: DataTypes.TEXT,
    allowNull: null
  },
  Status: {
    type: DataTypes.NUMBER,
    allowNull: false
  }
}, {
  tableName: "pitchs" 
});

module.exports = Pitch;

Pitch.hasOne(Facility, { foreignKey: 'PitchId' });
Pitch.belongsTo(Category, { foreignKey: 'CategoryId', as: 'category' });
Pitch.belongsTo(Customer, { foreignKey: 'CustomerId', as: 'customer' });

