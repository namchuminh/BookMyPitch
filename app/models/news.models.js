const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config.js");
const Category = require("../models/category.models");


const News = sequelize.define("news", {
  Id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  Content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  Avatar: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  Tag: {
    type: DataTypes.STRING,
    allowNull: false
  },
  Slug: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  CategoryId : {
    type: DataTypes.NUMBER,
    allowNull: false
  }
}, {
  tableName: "news" 
});

module.exports = News;

News.belongsTo(Category, { foreignKey: 'CategoryId', as: 'category' });

