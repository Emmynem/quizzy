import platformsModel from "./platforms.model.js";
import platformUsersModel from "./platformUsers.model.js";
import questionsModel from "./questions.model.js";

export default (sequelize, Sequelize) => {

    const platforms = platformsModel(sequelize, Sequelize);
    const platform_users = platformUsersModel(sequelize, Sequelize);
    const questions = questionsModel(sequelize, Sequelize);

    const answers = sequelize.define("answer", {
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
        platform_user_unique_id: {
            type: Sequelize.STRING(40),
            allowNull: false,
            references: {
                model: platform_users,
                key: "unique_id"
            }
        },
        question_unique_id: {
            type: Sequelize.STRING(40),
            allowNull: false,
            references: {
                model: questions,
                key: "unique_id"
            }
        },
        order: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        option: {
            type: Sequelize.TEXT,
            allowNull: false,
        },
        answer: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
        status: {
            type: Sequelize.INTEGER(1),
            allowNull: false,
        }
    }, {
        tableName: 'quizzy_answers_tbl'
    });
    return answers;
};