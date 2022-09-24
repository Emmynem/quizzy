import { check } from 'express-validator';
import db from "../models/index.js";
import { default_status, validate_platform_user_route, super_admin_routes, validate_platform_user_route_max_length } from '../config/config.js';

const PLATFORMS = db.platforms;
const PLATFORM_USERS = db.platform_users;
const Op = db.Sequelize.Op;

export const platform_user_rules = {
    forFindingPlatformUser: [
        check('unique_id').exists({ checkNull: true, checkFalsy: true }).withMessage("Unique Id is required"),
        check('platform_unique_id').exists({ checkNull: true, checkFalsy: true }).withMessage("Platform Unique Id is required"),
        check('platform_unique_id')
            .custom(platform_unique_id => {
                return PLATFORMS.findOne({ where: { unique_id: platform_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Platform not found!');
                });
            })
            .withMessage('Platform not found'),
        check('unique_id')  
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
        check('platform_unique_id').exists({ checkNull: true, checkFalsy: true }).withMessage("Platform Unique Id is required"),
        check('platform_unique_id')
            .custom(platform_unique_id => {
                return PLATFORMS.findOne({ where: { unique_id: platform_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Platform not found!');
                });
            })
            .withMessage('Platform not found'),
        check('firstname').exists({ checkNull: true, checkFalsy: true }).withMessage("Firstname is required"),
        check('firstname').isString().isLength({ min: 3, max: 50 }).withMessage("Invalid length (3 - 50) characters"),
        check('middlename').optional({ checkFalsy: false }).isString().isLength({ min: 3, max: 50 }).withMessage("Invalid length (3 - 50) characters"),
        check('lastname').exists({ checkNull: true, checkFalsy: true }).withMessage("Lastname is required"),
        check('lastname').isString().isLength({ min: 3, max: 50 }).withMessage("Invalid length (3 - 50) characters"),
        check('email').isEmail().withMessage('Invalid email format'),
        check('email')
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
        check('mobile_number').optional({ checkFalsy: false }).isMobilePhone().withMessage('Invalid mobile number'),
        check('mobile_number').optional({ checkFalsy: false })
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
        check('gender').exists({ checkNull: true, checkFalsy: true }).withMessage("Gender is required"),
        check('gender').isString().isLength({ min: 3, max: 20 }).withMessage("Invalid length (3 - 20) characters"),
        check('routes').exists({ checkNull: true, checkFalsy: true }).withMessage("Routes is required"),
        check('routes').custom(routes => !!validate_platform_user_route(routes)).withMessage(`Invalid route, accepts '${super_admin_routes}' or an array(not empty)`),
        check('routes').custom(routes => !!validate_platform_user_route_max_length(routes)).withMessage(`Max length reached`)
    ],
    forUpdatingDetails: [
        check('firstname').exists({ checkNull: true, checkFalsy: true }).withMessage("Firstname is required"),
        check('firstname').isString().isLength({ min: 3, max: 50 }).withMessage("Invalid length (3 - 50) characters"),
        check('middlename').optional({ checkFalsy: false }).isString().isLength({ min: 3, max: 50 }).withMessage("Invalid length (3 - 50) characters"),
        check('lastname').exists({ checkNull: true, checkFalsy: true }).withMessage("Lastname is required"),
        check('lastname').isString().isLength({ min: 3, max: 50 }).withMessage("Invalid length (3 - 50) characters"),
        check('email').isEmail().withMessage('Invalid email format'),
        check('email')
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
        check('mobile_number').optional({ checkFalsy: false }).isMobilePhone().withMessage('Invalid mobile number'),
        check('mobile_number').optional({ checkFalsy: false })
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
        check('gender').exists({ checkNull: true, checkFalsy: true }).withMessage("Gender is required"),
        check('gender').isString().isLength({ min: 3, max: 20 }).withMessage("Invalid length (3 - 20) characters")
    ],
    forUpdatingRoutes: [
        check('routes').exists({ checkNull: true, checkFalsy: true }).withMessage("Routes is required"),
        check('routes').custom(routes => !!validate_platform_user_route(routes)).withMessage(`Invalid route, accepts '${super_admin_routes}' or an array(not empty)`),
        check('routes').custom(routes => !!validate_platform_user_route_max_length(routes)).withMessage(`Max length reached`)
    ]
};  