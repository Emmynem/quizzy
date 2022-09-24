import usersModel from "./users.model.js";
import badgesModel from "./badges.model.js";

export default (sequelize, Sequelize) => {

    const users = usersModel(sequelize, Sequelize);
    const badges = badgesModel(sequelize, Sequelize);

    const userBadges = sequelize.define("user_badge", {
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
        badge_unique_id: {
            type: Sequelize.STRING(40),
            allowNull: false,
            references: {
                model: badges,
                key: "unique_id"
            }
        },
        status: {
            type: Sequelize.INTEGER(1),
            allowNull: false,
        }
    }, {
        tableName: 'quizzy_user_badges_tbl'
    });
    return userBadges;
};