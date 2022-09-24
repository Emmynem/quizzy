import platformUsersModel from "./platformUsers.model.js";
import assessmentsModel from "./assessments.model.js";

export default (sequelize, Sequelize) => {

    const platform_users = platformUsersModel(sequelize, Sequelize);
    const assessments = assessmentsModel(sequelize, Sequelize);

    const questions = sequelize.define("question", {
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
        platform_user_unique_id: {
            type: Sequelize.STRING(40),
            allowNull: false,
            references: {
                model: platform_users,
                key: "unique_id"
            }
        },
        assessment_unique_id: {
            type: Sequelize.STRING(40),
            allowNull: false,
            references: {
                model: assessments,
                key: "unique_id"
            }
        },
        order: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        question: {
            type: Sequelize.TEXT,
            allowNull: false,
        },
        status: {
            type: Sequelize.INTEGER(1),
            allowNull: false,
        }
    }, {
        tableName: 'quizzy_questions_tbl'
    });
    return questions;
};