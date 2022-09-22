import usersModel from "./users.model.js";
import platformsModel from "./platforms.model.js";

export default (sequelize, Sequelize) => {

    const platforms = platformsModel(sequelize, Sequelize);
    const users = usersModel(sequelize, Sequelize);

    const platformsUsers = sequelize.define("platform_user", {
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
        user_unique_id: {
            type: Sequelize.STRING(40), 
            allowNull: false,
            references: {
                model: users,
                key: "unique_id"
            }
        },
        added_unique_id: {
            type: Sequelize.STRING(40),
            allowNull: false,
            references: {
                model: users,
                key: "unique_id"
            }
        },
        edit_unique_id: {
            type: Sequelize.STRING(40),
            allowNull: false,
            references: {
                model: users,
                key: "unique_id"
            }
        },
        routes: {
            type: Sequelize.TEXT,
            allowNull: false,
        },
        access: {
            type: Sequelize.INTEGER(1),
            allowNull: false,
        },
        status: {
            type: Sequelize.INTEGER(1),
            allowNull: false,
        }
    }, {
        tableName: 'quizzy_platforms_users_tbl'
    });
    return platformsUsers;
};