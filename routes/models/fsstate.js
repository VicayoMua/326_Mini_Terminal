'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FSState extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  FSState.init({
    id: DataTypes.STRING,
    data: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'FSState',
  });
  return FSState;
};