const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config.js");
const Pitch = require("./pitchs.models.js");
const Customer = require("./customer.models.js");

const Orders = sequelize.define("orders", {
  Id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Code: {
    type: DataTypes.STRING,
    allowNull: false
  },
  PitchId : {
    type: DataTypes.NUMBER,
    allowNull: false
  },
  Date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  Time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  Total: {
    type: DataTypes.NUMBER,
    allowNull: false
  },
  CustomerId: {
    type: DataTypes.NUMBER,
    allowNull: true
  },
  FullName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  Email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  Phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  StatusOrder: {
    type: DataTypes.NUMBER,
    allowNull: false
  },
  StatusPay: {
    type: DataTypes.NUMBER,
    allowNull: false
  },
  OwnerId: {
    type: DataTypes.NUMBER,
    allowNull: true
  }
}, {
  tableName: "orders" 
});

module.exports = Orders;

Orders.belongsTo(Pitch, { foreignKey: 'PitchId', as: 'pitch' });
Orders.belongsTo(Customer, { foreignKey: 'CustomerId', as: 'customer' });
