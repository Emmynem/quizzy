import usersModel from "./users.model.js";
import assessmentsModel from "./assessments.model.js";
import logsModel from "./logs.model.js";

export default (sequelize, Sequelize) => {

    const users = usersModel(sequelize, Sequelize);
    const assessments = assessmentsModel(sequelize, Sequelize);
    const logs = logsModel(sequelize, Sequelize);

    const results = sequelize.define("result", {
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
        log_unique_id: {
            type: Sequelize.STRING(40),
            allowNull: false,
            references: {
                model: logs,
                key: "unique_id"
            }
        },
        percentage: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        status: {
            type: Sequelize.INTEGER(1),
            allowNull: false,
        }
    }, {
        tableName: 'quizzy_results_tbl'
    });
    return results;
};