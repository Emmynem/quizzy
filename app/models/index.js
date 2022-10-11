import { DB, USER, PASSWORD, HOST, dialect as _dialect, logging as _logging, pool as _pool, dialectOptions as _dialectOptions, timezone, production } from "../config/db.config.js";
import Sequelize from "sequelize";
import apiKeysModel from "./apiKeys.model.js";
import appDefaultsModel from "./appDefaults.model.js";
import usersModel from "./users.model.js";
import privatesModel from "./privates.model.js";
import notificationsModel from "./notifications.model.js";
import platformsModel from "./platforms.model.js";
import platformUsersModel from "./platformUsers.model.js";
import assessmentsModel from "./assessments.model.js";
import questionsModel from "./questions.model.js";
import answersModel from "./answers.model.js";
import logsModel from "./logs.model.js";
import userAssessmentsModel from "./userAssessments.model.js";
import resultsModel from "./results.model.js";
import reviewsModel from "./reviews.model.js";
import platformNotificationsModel from "./platformNotifications.model.js";
import badgesModel from "./badges.model.js";
import userBadgesModel from "./userBadges.model.js";
import otpsModel from "./otps.model.js";

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
db.platform_users = platformUsersModel(sequelize, Sequelize);
db.assessments = assessmentsModel(sequelize, Sequelize);
db.questions = questionsModel(sequelize, Sequelize);
db.answers = answersModel(sequelize, Sequelize);
db.logs = logsModel(sequelize, Sequelize);
db.user_assessments = userAssessmentsModel(sequelize, Sequelize);
db.results = resultsModel(sequelize, Sequelize);
db.reviews = reviewsModel(sequelize, Sequelize);
db.platform_notifications = platformNotificationsModel(sequelize, Sequelize);
db.badges = badgesModel(sequelize, Sequelize);
db.user_badges = userBadgesModel(sequelize, Sequelize);
db.otps = otpsModel(sequelize, Sequelize);

// Associations
//    - Privates Associations
db.privates.hasMany(db.users, { foreignKey: 'unique_id', sourceKey: 'user_unique_id' });
db.users.belongsTo(db.privates, { foreignKey: 'unique_id', targetKey    : 'user_unique_id' });

//    - Notifications Associations
db.notifications.hasMany(db.users, { foreignKey: 'unique_id', sourceKey: 'user_unique_id' });
db.users.belongsTo(db.notifications, { foreignKey: 'unique_id', targetKey   : 'user_unique_id' });

//    - Platform Users Associations
db.platform_users.hasMany(db.platforms, { foreignKey: 'unique_id', sourceKey: 'platform_unique_id' });
db.platforms.belongsTo(db.platform_users, { foreignKey: 'unique_id', targetKey: 'platform_unique_id' });

//    - Assessments Associations
db.assessments.hasMany(db.platforms, { foreignKey: 'unique_id', sourceKey: 'platform_unique_id' });
db.platforms.belongsTo(db.assessments, { foreignKey: 'unique_id', targetKey: 'platform_unique_id' });

db.assessments.hasMany(db.platform_users, { foreignKey: 'unique_id', sourceKey: 'platform_user_unique_id' });
db.platform_users.belongsTo(db.assessments, { foreignKey: 'unique_id', targetKey: 'platform_user_unique_id' });

//    - Questions Associations
db.questions.hasMany(db.platforms, { foreignKey: 'unique_id', sourceKey: 'platform_unique_id' });
db.platforms.belongsTo(db.questions, { foreignKey: 'unique_id', targetKey: 'platform_unique_id' });

db.questions.hasMany(db.assessments, { foreignKey: 'unique_id', sourceKey: 'assessment_unique_id' });
db.assessments.belongsTo(db.questions, { foreignKey: 'unique_id', targetKey: 'assessment_unique_id' });

db.questions.hasMany(db.platform_users, { foreignKey: 'unique_id', sourceKey: 'platform_user_unique_id' });
db.platform_users.belongsTo(db.questions, { foreignKey: 'unique_id', targetKey: 'platform_user_unique_id' });

//    - Answers Associations
db.answers.hasMany(db.platforms, { foreignKey: 'unique_id', sourceKey: 'platform_unique_id' });
db.platforms.belongsTo(db.answers, { foreignKey: 'unique_id', targetKey: 'platform_unique_id' });

db.answers.hasMany(db.questions, { foreignKey: 'unique_id', sourceKey: 'question_unique_id' });
db.questions.belongsTo(db.answers, { foreignKey: 'unique_id', targetKey: 'question_unique_id' });

db.answers.hasMany(db.platform_users, { foreignKey: 'unique_id', sourceKey: 'platform_user_unique_id' });
db.platform_users.belongsTo(db.answers, { foreignKey: 'unique_id', targetKey: 'platform_user_unique_id' });

//    - Logs Associations
db.logs.hasMany(db.assessments, { foreignKey: 'unique_id', sourceKey: 'assessment_unique_id' });
db.assessments.belongsTo(db.logs, { foreignKey: 'unique_id', targetKey: 'assessment_unique_id' });

db.logs.hasMany(db.users, { foreignKey: 'unique_id', sourceKey: 'user_unique_id' });
db.users.belongsTo(db.logs, { foreignKey: 'unique_id', targetKey: 'user_unique_id' });

//    - User Assessments Associations
db.user_assessments.hasMany(db.assessments, { foreignKey: 'unique_id', sourceKey: 'assessment_unique_id' });
db.assessments.belongsTo(db.user_assessments, { foreignKey: 'unique_id', targetKey: 'assessment_unique_id' });

db.user_assessments.hasMany(db.questions, { foreignKey: 'unique_id', sourceKey: 'question_unique_id' });
db.questions.belongsTo(db.user_assessments, { foreignKey: 'unique_id', targetKey: 'question_unique_id' });

db.user_assessments.hasMany(db.answers, { foreignKey: 'unique_id', sourceKey: 'answer_unique_id' });
db.answers.belongsTo(db.user_assessments, { foreignKey: 'unique_id', targetKey: 'answer_unique_id' });

db.user_assessments.hasMany(db.logs, { foreignKey: 'unique_id', sourceKey: 'log_unique_id' });
db.logs.belongsTo(db.user_assessments, { foreignKey: 'unique_id', targetKey: 'log_unique_id' });

db.user_assessments.hasMany(db.users, { foreignKey: 'unique_id', sourceKey: 'user_unique_id' });
db.users.belongsTo(db.user_assessments, { foreignKey: 'unique_id', targetKey: 'user_unique_id' });

//    - Results Associations
db.results.hasMany(db.assessments, { foreignKey: 'unique_id', sourceKey: 'assessment_unique_id' });
db.assessments.belongsTo(db.results, { foreignKey: 'unique_id', targetKey: 'assessment_unique_id' });

db.results.hasMany(db.logs, { foreignKey: 'unique_id', sourceKey: 'log_unique_id' });
db.logs.belongsTo(db.results, { foreignKey: 'unique_id', targetKey: 'log_unique_id' });

db.results.hasMany(db.users, { foreignKey: 'unique_id', sourceKey: 'user_unique_id' });
db.users.belongsTo(db.results, { foreignKey: 'unique_id', targetKey: 'user_unique_id' });

//    - Reviews Associations
db.reviews.hasMany(db.assessments, { foreignKey: 'unique_id', sourceKey: 'assessment_unique_id' });
db.assessments.belongsTo(db.reviews, { foreignKey: 'unique_id', targetKey: 'assessment_unique_id' });

db.reviews.hasMany(db.users, { foreignKey: 'unique_id', sourceKey: 'user_unique_id' });
db.users.belongsTo(db.reviews, { foreignKey: 'unique_id', targetKey: 'user_unique_id' });

//    - Platform Notifications Associations
db.platform_notifications.hasMany(db.platforms, { foreignKey: 'unique_id', sourceKey: 'platform_unique_id' });
db.platforms.belongsTo(db.platform_notifications, { foreignKey: 'unique_id', targetKey: 'platform_unique_id' });

//    - User Badges Associations
db.user_badges.hasMany(db.badges, { foreignKey: 'unique_id', sourceKey: 'badge_unique_id' });
db.badges.belongsTo(db.user_badges, { foreignKey: 'unique_id', targetKey: 'badge_unique_id' });

db.user_badges.hasMany(db.users, { foreignKey: 'unique_id', sourceKey: 'user_unique_id' });
db.users.belongsTo(db.user_badges, { foreignKey: 'unique_id', targetKey: 'user_unique_id' });

//    - OTPs Associations
db.otps.hasMany(db.platforms, { foreignKey: 'unique_id', sourceKey: 'platform_unique_id' });
db.platforms.belongsTo(db.otps, { foreignKey: 'unique_id', targetKey: 'platform_unique_id' });

db.otps.hasMany(db.platform_users, { foreignKey: 'unique_id', sourceKey: 'origin' });
db.platform_users.belongsTo(db.otps, { foreignKey: 'unique_id', targetKey: 'origin' });

export default db;
