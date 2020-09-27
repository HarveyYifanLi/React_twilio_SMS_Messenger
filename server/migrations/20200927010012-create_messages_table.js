"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    //must return a promise
    await queryInterface.createTable("messages", {
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
      //Those are added by default on insertion (make sure to create the their columns)
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("messages");
  },
};
