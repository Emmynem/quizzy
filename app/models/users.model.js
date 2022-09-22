export default (sequelize, Sequelize) => {

    const users = sequelize.define("user", {
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
        method: {
            type: Sequelize.STRING(20),
            allowNull: false,
        },
        firstname: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        middlename: {
            type: Sequelize.STRING(50),
            allowNull: true,
        },
        lastname: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        email: {
            type: Sequelize.STRING(255),
            allowNull: false,
            unique: true
        },
        email_verification: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
        mobile_number: {
            type: Sequelize.STRING(20),
            allowNull: true,
            unique: true
        },
        mobile_number_verification: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
        gender: {
            type: Sequelize.STRING(20),
            allowNull: false,
        },
        dob: {
            type: Sequelize.DATEONLY,
            allowNull: false,
        },
        user_private: {
            type: Sequelize.STRING(255),
            allowNull: false,
        },
        profile_image_base_url: {
            type: Sequelize.STRING(200),
            allowNull: true,
        },
        profile_image_dir: {
            type: Sequelize.STRING(100),
            allowNull: true,
        },
        profile_image: {
            type: Sequelize.STRING(500),
            allowNull: false,
        },
        profile_image_file: {
            type: Sequelize.STRING(255),
            allowNull: true,
        },
        profile_image_size: {
            type: Sequelize.BIGINT,
            allowNull: true,
        },
        pro: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
        pro_expiring: {
            type: Sequelize.DATE,
            allowNull: true,
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
        tableName: 'quizzy_users_tbl'
    });
    return users;
};