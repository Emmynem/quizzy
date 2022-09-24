import platformsModel from "./platforms.model.js";

export default (sequelize, Sequelize) => {

    const platforms = platformsModel(sequelize, Sequelize);

    const platform_notifications = sequelize.define("platform_notification", {
        id: {
            type: Sequelize.BIGINT,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        unique_id: {
            type: Sequelize.STRING(40),
            allowNull: false,
            unique: true
        },
        platform_unique_id: {
            type: Sequelize.STRING(40),
            allowNull: true,
            references: {
                model: platforms,
                key: "unique_id"
            }
        },
        type: {
            type: Sequelize.STRING(20),
            allowNull: false,
        },
        action: {
            type: Sequelize.STRING(200),
            allowNull: false,
        },
        details: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        seen: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
        status: {
            type: Sequelize.INTEGER(1),
            allowNull: false,
        }
    }, {
        tableName: 'quizzy_platform_notifications_tbl'
    });
    return platform_notifications;
};