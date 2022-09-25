import { check } from 'express-validator';
import db from "../models/index.js";
import { default_status, validate_platform_user_route, super_admin_routes, validate_platform_user_route_max_length } from '../config/config.js';

const PLATFORMS = db.platforms;
const PLATFORM_USERS = db.platform_users;
const Op = db.Sequelize.Op;

export const platform_user_rules = {
    forFindingPlatformUser: [
        check('platform_unique_id', "Platform Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(platform_unique_id => {
                return PLATFORMS.findOne({ where: { unique_id: platform_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Platform not found!');
                });
            })
            .withMessage('Platform not found'),
        check('unique_id', "Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom((unique_id, {req}) => {
                return PLATFORM_USERS.findOne({ 
                    where: { 
                        unique_id, 
                        platform_unique_id: req.query.platform_unique_id || req.body.platform_unique_id || '', 
                        status: default_status 
                    } 
                }).then(data => {
                    if (!data) return Promise.reject('Platform user not found!');
                });
            })
            .withMessage('Platform user not found')
    ],
    forAdding: [
        check('platform_unique_id', "Platform Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(platform_unique_id => {
                return PLATFORMS.findOne({ where: { unique_id: platform_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Platform not found!');
                });
            })
            .withMessage('Platform not found'),
        check('firstname', "Firstname is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters"),
        check('middlename')
            .optional({ checkFalsy: false })
            .bail()
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters"),
        check('lastname', "Lastname is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters"),
        check('email', "Email is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isEmail()
            .withMessage('Invalid email format')
            .bail()
            .custom((email, {req}) => {
                return PLATFORM_USERS.findOne({ 
                    where: { 
                        email,
                        platform_unique_id: req.query.platform_unique_id || req.body.platform_unique_id || '', 
                    } 
                }).then(data => {
                    if (data) return Promise.reject('Email already exists!');
                });
            })
            .withMessage('Email already exists'),
        check('mobile_number', "Invalid mobile number")
            .optional({ checkFalsy: false })
            .isMobilePhone()
            .bail()
            .custom((mobile_number, {req}) => {
                return PLATFORM_USERS.findOne({ 
                    where: { 
                        mobile_number,
                        platform_unique_id: req.query.platform_unique_id || req.body.platform_unique_id || '', 
                    } 
                }).then(data => {
                    if (data) return Promise.reject('Mobile number already exists!');
                });
            })
            .withMessage('Mobile number already exists'),
        check('gender', "Gender is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 20 })
            .withMessage("Invalid length (3 - 20) characters"),
        check('routes', "Routes is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(routes => !!validate_platform_user_route(routes)).withMessage(`Invalid route, accepts '${super_admin_routes}' or an array(not empty)`)
            .bail()
            .custom(routes => !!validate_platform_user_route_max_length(routes)).withMessage(`Max length reached`)
    ],
    forUpdatingDetails: [
        check('firstname', "Firstname is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters"),
        check('middlename')
            .optional({ checkFalsy: false })
            .bail()
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters"),
        check('lastname', "Lastname is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters"),
        check('email', "Invalid email format")
            .isEmail()
            .bail()
            .custom((email, { req }) => {
                return PLATFORM_USERS.findOne({
                    where: {
                        email,
                        unique_id: {
                            [Op.ne]: req.query.unique_id || req.body.unique_id || '',
                        },
                        platform_unique_id: req.query.platform_unique_id || req.body.platform_unique_id || ''
                    }
                }).then(data => {
                    if (data) return Promise.reject('Email already exists!');
                });
            })
            .withMessage('Email already exists'),
        check('mobile_number', "Invalid mobile number")
            .optional({ checkFalsy: false })
            .isMobilePhone()
            .bail()
            .custom((mobile_number, { req }) => {
                return PLATFORM_USERS.findOne({
                    where: {
                        mobile_number,
                        unique_id: {
                            [Op.ne]: req.query.unique_id || req.body.unique_id || '',
                        },
                        platform_unique_id: req.query.platform_unique_id || req.body.platform_unique_id || ''
                    }
                }).then(data => {
                    if (data) return Promise.reject('Mobile number already exists!');
                });
            })
            .withMessage('Mobile number already exists'),
        check('gender', "Gender is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 20 })
            .withMessage("Invalid length (3 - 20) characters")
    ],
    forUpdatingRoutes: [
        check('routes', "Routes is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(routes => !!validate_platform_user_route(routes)).withMessage(`Invalid route, accepts '${super_admin_routes}' or an array(not empty)`)
            .bail()
            .custom(routes => !!validate_platform_user_route_max_length(routes)).withMessage(`Max length reached`)
    ]
};  