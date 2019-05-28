const Sequelize = require('sequelize');
const config = require('../../../config.json');


const dbOptions: object = {
    host: config.db.host,
    dialect: 'mysql',
    define: {timestamps: false}
};

const sequelize = new Sequelize()