export default (sequelize, Sequelize) => {

    const badges = sequelize.define("badge", {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        unique_id: {
            type: Sequelize.STRING(40),
            allowNull: false,
            unique: true
        },
        badge: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        badge_icon: {
            type: Sequelize.STRING(500),
            allowNull: false,
        },
        badge_description: {
            type: Sequelize.STRING(1000),
            allowNull: false,
        },
        status: {
            type: Sequelize.INTEGER(1),
            allowNull: false,
        }
    }, {
        tableName: 'quizzy_badges_tbl'
    });
    return badges;
};
