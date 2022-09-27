import platformsModel from "./platforms.model.js";

export default (sequelize, Sequelize) => {

    const platforms = platformsModel(sequelize, Sequelize);

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
            type: Sequelize.STRING(255),
            allowNull: false,
        },
        code: {
            type: Sequelize.STRING(6),
            allowNull: false,
        },
        valid: {
            type: Sequelize.BOOLEAN,
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