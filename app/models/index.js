import { DB, USER, PASSWORD, HOST, dialect as _dialect, logging as _logging, pool as _pool, dialectOptions as _dialectOptions, timezone, production } from "../config/db.config.js";
import Sequelize from "sequelize";
import apiKeysModel from "./apiKeys.model.js";
import appDefaultsModel from "./appDefaults.model.js";
import usersModel from "./users.model.js";
import privatesModel from "./privates.model.js";
import notificationsModel from "./notifications.model.js";
import platformsModel from "./platforms.model.js";
import platformsUsersModel from "./platformsUsers.model.js";
import assessmentsModel from "./assessments.model.js";

const sequelize = new Sequelize(
    DB,
    USER,
    PASSWORD,
    {
        host: HOST,
        dialect: _dialect,
        logging: _logging,
        operatorsAliases: 0,
        pool: {
            max: _pool.max,
            min: _pool.min,
            acquire: _pool.acquire,
            idle: _pool.idle
        },
        dialectOptions: {
            // useUTC: _dialectOptions.useUTC, 
            dateStrings: _dialectOptions.dateStrings,
            typeCast: _dialectOptions.typeCast
        },
        timezone: timezone
    }
);
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// * Binding models
db.api_keys = apiKeysModel(sequelize, Sequelize);
db.app_defaults = appDefaultsModel(sequelize, Sequelize);
db.users = usersModel(sequelize, Sequelize);
db.privates = privatesModel(sequelize, Sequelize);
db.notifications = notificationsModel(sequelize, Sequelize);
db.platforms = platformsModel(sequelize, Sequelize);
db.platforms_users = platformsUsersModel(sequelize, Sequelize);
db.assessments = assessmentsModel(sequelize, Sequelize);

// Associations
//    - Privates Associations
db.privates.hasMany(db.users, { foreignKey: 'unique_id', sourceKey: 'user_unique_id' });
db.users.belongsTo(db.privates, { foreignKey: 'unique_id', targetKey    : 'user_unique_id' });

//    - Notifications Associations
db.notifications.hasMany(db.users, { foreignKey: 'unique_id', sourceKey: 'user_unique_id' });
db.users.belongsTo(db.notifications, { foreignKey: 'unique_id', targetKey   : 'user_unique_id' });

//    - Platforms Associations
db.platforms.hasMany(db.users, { foreignKey: 'unique_id', sourceKey: 'user_unique_id' });
db.users.belongsTo(db.platforms, { foreignKey: 'unique_id', targetKey   : 'user_unique_id' });

//    - Platforms Users Associations
db.platforms_users.hasMany(db.platforms, { foreignKey: 'unique_id', sourceKey: 'platform_unique_id' });
db.platforms.belongsTo(db.platforms_users, { foreignKey: 'unique_id', targetKey: 'platform_unique_id' });

db.platforms_users.hasMany(db.users, { foreignKey: 'unique_id', sourceKey: 'added_unique_id' });
db.users.belongsTo(db.platforms_users, { foreignKey: 'unique_id', targetKey: 'added_unique_id' });

db.platforms_users.hasMany(db.users, { foreignKey: 'unique_id', sourceKey: 'edit_unique_id' });
db.users.belongsTo(db.platforms_users, { foreignKey: 'unique_id', targetKey: 'edit_unique_id' });

db.platforms_users.hasMany(db.users, { foreignKey: 'unique_id', sourceKey: 'user_unique_id' });
db.users.belongsTo(db.platforms_users, { foreignKey: 'unique_id', targetKey: 'user_unique_id' });

//    - Assessments Associations
db.assessments.hasMany(db.platforms, { foreignKey: 'unique_id', sourceKey: 'platform_unique_id' });
db.platforms.belongsTo(db.assessments, { foreignKey: 'unique_id', targetKey: 'platform_unique_id' });

db.assessments.hasMany(db.users, { foreignKey: 'unique_id', sourceKey: 'user_unique_id' });
db.users.belongsTo(db.assessments, { foreignKey: 'unique_id', targetKey: 'user_unique_id' });

export default db;
