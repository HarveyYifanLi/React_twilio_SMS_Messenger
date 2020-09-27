const Sequelize = require("sequelize");

module.exports = sequelize.define("Message", {
  id: {
    type: Sequelize.UUID,
    allowNull: false,
    primaryKey: true,
    defaultValue: Sequelize.UUIDV4,
  },
  message: Sequelize.STRING(512),
  tel_from: {
    type: Sequelize.STRING(32),
    allowNull: false,
  },
  tel_to: {
    type: Sequelize.STRING(32),
    allowNull: false,
  },
});
