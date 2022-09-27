import usersModel from "./users.model.js";
import assessmentsModel from "./assessments.model.js";

export default (sequelize, Sequelize) => {

    const users = usersModel(sequelize, Sequelize);
    const assessments = assessmentsModel(sequelize, Sequelize);

    const logs = sequelize.define("log", {
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
        start_time: {
            type: Sequelize.DATE,
            allowNull: false,
        },
        end_time: {
            type: Sequelize.DATE,
            allowNull: true,
        },
        status: {
            type: Sequelize.INTEGER(1),
            allowNull: false,
        }
    }, {
        tableName: 'quizzy_logs_tbl'
    });
    return logs;
};