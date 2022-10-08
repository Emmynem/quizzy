import { check } from 'express-validator';
import db from "../models/index.js";
import { check_length_TEXT, strip_text, default_status, default_delete_status } from '../config/config.js';

const PLATFORMS = db.platforms;
const Op = db.Sequelize.Op;

export const platform_rules = {
    forFindingPlatform: [
        check('unique_id', "Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(unique_id => {
                return PLATFORMS.findOne({ where: { unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Platform not found!');
                });
            })
    ],
    forFindingPlatformFalsy: [
        check('unique_id', "Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(unique_id => {
                return PLATFORMS.findOne({ where: { unique_id, status: default_delete_status } }).then(data => {
                    if (!data) return Promise.reject('Platform not found!');
                });
            })
    ],
    forFindingPlatformAlt: [
        check('platform_unique_id', "Platform Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(platform_unique_id => {
                return PLATFORMS.findOne({ where: { unique_id: platform_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Platform not found!');
                });
            })
    ],
    forFindingPlatformViaToken: [
        check('token', "Token is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail() 
            .custom(token => {
                return PLATFORMS.findOne({ where: { token, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Platform not found!');
                });
            })
    ],
    forAdding: [
        check('name', "Name is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail() 
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters")
            .bail()
            .custom(name => {
                return PLATFORMS.findOne({ where: { stripped: strip_text(name), status: default_status } }).then(data => {
                    if (data) return Promise.reject('Platform already exists!');
                });
            }),
        check('email', "Email is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isEmail()
            .withMessage('Invalid email format'),
        check('description', "Description is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isLength({ min: 3, max: check_length_TEXT })
            .withMessage(`Invalid length (3 - ${check_length_TEXT}) characters`),
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
        check('user_email', "User email is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isEmail()
            .withMessage('Invalid user email format'),
        check('mobile_number', "Invalid mobile number")
            .optional({ checkFalsy: false })
            .isMobilePhone(),
        check('gender', "Gender is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 20 })
            .withMessage("Invalid length (3 - 20) characters"),
    ],
    forPlatformLogin: [
        check('email')
            .optional({ checkFalsy: false })
            .bail()
            .isEmail()
            .withMessage('Invalid email format'),
        check('mobile_number')
            .optional({ checkFalsy: false })
            .bail()
            .isMobilePhone()
            .withMessage('Invalid mobile number'),
        check('remember_me')
            .optional({ checkFalsy: false })
            .bail()
            .isBoolean()
            .withMessage("Value should be true or false")
    ],
    forVerifyingOtp: [
        check('email')
            .optional({ checkFalsy: false })
            .bail()
            .isEmail()
            .withMessage('Invalid email format'),
        check('mobile_number')
            .optional({ checkFalsy: false })
            .bail()
            .isMobilePhone()
            .withMessage('Invalid mobile number'),
        check('otp', "OTP is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isInt().isLength({ min: 6, max: 6 })
            .withMessage("Invalid OTP"),
        check('remember_me')
            .optional({ checkFalsy: false })
            .bail()
            .isBoolean()
            .withMessage("Value should be true or false")
    ],
    forEditing: [
        check('name', "Name is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail() 
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters")
            .bail()
            .custom((name, {req}) => {
                return PLATFORMS.findOne({ 
                    where: { 
                        stripped: strip_text(name), 
                        unique_id: {
                            [Op.ne]: req.query.unique_id || req.body.unique_id || '', 
                        },
                        status: default_status 
                    } 
                }).then(data => {
                    if (data) return Promise.reject('Platform already exists!');
                });
            }),
        check('description', "Description is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isLength({ min: 3, max: check_length_TEXT })
            .withMessage(`Invalid length (3 - ${check_length_TEXT}) characters`)
    ],
};  