import platformsModel from "./platforms.model.js";
import platformUsersModel from "./platformUsers.model.js";

export default (sequelize, Sequelize) => {

    const platforms = platformsModel(sequelize, Sequelize);
    const platform_users = platformUsersModel(sequelize, Sequelize);

    const assessments = sequelize.define("assessment", {
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
        name: {
            type: Sequelize.STRING(100),
            allowNull: false,
        },
        stripped: {
            type: Sequelize.STRING(100),
            allowNull: false,
        },
        identifier: {
            type: Sequelize.STRING(10),
            allowNull: false,
            unique: true
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: false,
        },
        background_image_base_url: {
            type: Sequelize.STRING(200),
            allowNull: true,
        },
        background_image_dir: {
            type: Sequelize.STRING(100),
            allowNull: true,
        },
        background_image: {
            type: Sequelize.STRING(500),
            allowNull: false,
        },
        background_image_file: {
            type: Sequelize.STRING(255),
            allowNull: true,
        },
        background_image_size: {
            type: Sequelize.BIGINT,
            allowNull: true,
        },
        candidate_limit: {
            type: Sequelize.BIGINT,
            allowNull: true,
        },
        private: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
        start: {
            type: Sequelize.DATE,
            allowNull: false,
        },
        end: {
            type: Sequelize.DATE,
            allowNull: true,
        },
        duration: {
            type: Sequelize.INTEGER(5),
            allowNull: true,
        },
        retakes: {
            type: Sequelize.INTEGER(3),
            allowNull: true,
        },
        status: {
            type: Sequelize.INTEGER(1),
            allowNull: false,
        }
    }, {
        tableName: 'quizzy_assessments_tbl'
    });
    return assessments;
};