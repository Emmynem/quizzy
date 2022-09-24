export default (sequelize, Sequelize) => {
    
    const platforms = sequelize.define("platform", {
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
        name: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        stripped: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        email: {
            type: Sequelize.STRING(255),
            allowNull: false,
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: false,
        },
        token: {
            type: Sequelize.STRING(40),
            allowNull: false,
            unique: true
        },
        access_url: {
            type: Sequelize.STRING(300),
            allowNull: false
        },
        live_api_key: {
            type: Sequelize.STRING(50),
            allowNull: false,
            unique: true
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
        tableName: 'quizzy_platforms_tbl'
    });
    return platforms;
};