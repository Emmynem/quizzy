import usersModel from "./users.model.js";
import assessmentsModel from "./assessments.model.js";
import questionsModel from "./questions.model.js";
import answersModel from "./answers.model.js";
import logsModel from "./logs.model.js";

export default (sequelize, Sequelize) => {

    const users = usersModel(sequelize, Sequelize);
    const assessments = assessmentsModel(sequelize, Sequelize);
    const questions = questionsModel(sequelize, Sequelize);
    const answers = answersModel(sequelize, Sequelize);
    const logs = logsModel(sequelize, Sequelize);

    const userAssessments = sequelize.define("user_assessment", {
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
        user_unique_id: {
            type: Sequelize.STRING(40),
            allowNull: false,
            references: {
                model: users,
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
        question_unique_id: {
            type: Sequelize.STRING(40),
            allowNull: false,
            references: {
                model: questions,
                key: "unique_id"
            }
        },
        answer_unique_id: {
            type: Sequelize.STRING(40),
            allowNull: false,
            references: {
                model: answers,
                key: "unique_id"
            }
        },
        log_unique_id: {
            type: Sequelize.STRING(40),
            allowNull: false,
            references: {
                model: logs,
                key: "unique_id"
            }
        },
        status: {
            type: Sequelize.INTEGER(1),
            allowNull: false,
        }
    }, {
        tableName: 'quizzy_user_assessments_tbl'
    });
    return userAssessments;
};