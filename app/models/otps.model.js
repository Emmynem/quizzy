import platformsModel from "./platforms.model.js";
import platformUsersModel from "./platformUsers.model.js";

export default (sequelize, Sequelize) => {

    const platforms = platformsModel(sequelize, Sequelize);
    const platform_users = platformUsersModel(sequelize, Sequelize);

    const otp_2fas = sequelize.define("otp_2fa", {
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
            allowNull: false,
            references: {
                model: platforms,
                key: "unique_id"
            }
        },
        origin: {
            type: Sequelize.STRING(40),
            allowNull: false,
            references: {
                model: platform_users,
                key: "unique_id"
            }
        },
        code: {
            type: Sequelize.STRING(6),
            allowNull: false,
        },
        valid: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
        expiration: {
            type: Sequelize.DATE,
            allowNull: false,
        },
        status: {
            type: Sequelize.INTEGER(1),
            allowNull: false,
        }
    }, {
        tableName: 'quizzy_otp_2fas_tbl'
    });
    return otp_2fas;
};