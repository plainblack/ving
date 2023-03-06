import { Sequelize } from 'sequelize';

import fullConfig from '~/sequelize/config.js';

type fullConfig = Record<string, object>;

const env = process.env.NODE_ENV || 'development';

const config = fullConfig[env];
export default new Sequelize(config.database, config.username, config.password, config);