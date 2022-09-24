import { check } from 'express-validator';
import { password_options, validate_pg_age_signup, pg_age } from '../config/config.js';
import db from "../models/index.js";

const Users = db.users;

export const user_rules = {
    forFindingUser: [
        check('unique_id').exists({ checkNull: true, checkFalsy: true }).withMessage("Unique Id is required"),
        check('unique_id')
            .custom(unique_id => {
                return Users.findOne({ where: { unique_id } }).then(data => {
                    if (!data) return Promise.reject('User not found!');
                });
            }
        ).withMessage('User not found')
    ],
    forAdding: [
        check('firstname').exists({ checkNull: true, checkFalsy: true }).withMessage("Firstname is required"),
        check('firstname').isString().isLength({ min: 3, max: 50 }).withMessage("Invalid length (3 - 50) characters"),
        check('middlename').optional({ checkFalsy: false }).isString().isLength({ min: 3, max: 50 }).withMessage("Invalid length (3 - 50) characters"),
        check('lastname').exists({ checkNull: true, checkFalsy: true }).withMessage("Lastname is required"),
        check('lastname').isString().isLength({ min: 3, max: 50 }).withMessage("Invalid length (3 - 50) characters"),
        check('email').isEmail().withMessage('Invalid email format'),
        check('email')
            .custom(email => {
                return Users.findOne({ where: { email } }).then(data => {
                    if (data) return Promise.reject('Email already exists!');
                });
            }
        ).withMessage('Email already exists'),
        check('mobile_number').optional({ checkFalsy: false }).isMobilePhone().withMessage('Invalid mobile number'),
        check('mobile_number').optional({ checkFalsy: false })
            .custom(mobile_number => {
                return Users.findOne({ where: { mobile_number } }).then(data => {
                    if (data) return Promise.reject('Mobile number already exists!');
                });
            }
        ).withMessage('Mobile number already exists'),
        check('gender').exists({ checkNull: true, checkFalsy: true }).withMessage("Gender is required"),
        check('gender').isString().isLength({ min: 3, max: 20 }).withMessage("Invalid length (3 - 20) characters"),
        check('dob').exists({ checkNull: true, checkFalsy: true }).withMessage("Date of Birth is required"),
        check('dob').isString().isDate().withMessage("Invalid Date of Birth"),
        check('dob').custom((dob) => !!validate_pg_age_signup(dob)).withMessage(`Invalid Date of Birth, PG ${pg_age}`),
        check('password').isString().isStrongPassword(password_options).withMessage('Invalid password (must be 8 characters or more and contain one or more uppercase, lowercase, number and special character)'),
        check('confirmPassword').exists({ checkNull: true, checkFalsy: true }).withMessage("Confirm Password is required"),
        check('confirmPassword').isString()
            .custom((confirmPassword, { req }) => req.body.password === confirmPassword).withMessage('Passwords are different')
    ],
    forEmailLogin: [
        check('email').isEmail().withMessage('Invalid email format'),
        check('password').exists().withMessage("Password is required"),
    ],
    forMobileLogin: [
        check('mobile_number').isMobilePhone().withMessage('Invalid mobile number'),
        check('password').exists().withMessage("Password is required"),
    ],
    forUpdating: [
        check('firstname').exists({ checkNull: true, checkFalsy: true }).withMessage("Firstname is required"),
        check('firstname').isString().isLength({ min: 3, max: 50 }).withMessage("Invalid length (3 - 50) characters"),
        check('middlename').optional({ checkFalsy: false }).isString().isLength({ min: 3, max: 50 }).withMessage("Invalid length (3 - 50) characters"),
        check('lastname').exists({ checkNull: true, checkFalsy: true }).withMessage("Lastname is required"),
        check('lastname').isString().isLength({ min: 3, max: 50 }).withMessage("Invalid length (3 - 50) characters"),
        check('mobile_number').optional({ checkFalsy: false }).isMobilePhone().withMessage('Invalid mobile number'),
        check('gender').exists({ checkNull: true, checkFalsy: true }).withMessage("Gender is required"),
        check('gender').isString().isLength({ min: 3, max: 20 }).withMessage("Invalid length (3 - 20) characters"),
        check('dob').exists({ checkNull: true, checkFalsy: true }).withMessage("Date of Birth is required"),
        check('dob').isString().isDate().withMessage("Invalid Date of Birth"),
        check('dob').custom((dob) => !!validate_pg_age_signup(dob)).withMessage(`Invalid Date of Birth, PG ${pg_age}`),
    ],
    forChangingPassword: [
        check('oldPassword').isString().exists().withMessage("Old Password is required"),
        check('password').isString().isStrongPassword(password_options).withMessage('Invalid password (must be 8 characters or more and contain one or more uppercase, lowercase, number and special character)'),
        check('confirmPassword').exists({ checkNull: true, checkFalsy: true }).withMessage("Confirm Password is required"),
        check('confirmPassword').isString()
            .custom((confirmPassword, { req }) => req.body.password === confirmPassword).withMessage('Passwords are different')
    ],
    forEmailPasswordReset: [
        check('email').exists({ checkNull: true, checkFalsy: true }).withMessage("Email is required"),
        check('email').isEmail().withMessage('Invalid email format'),
    ],
    forMobilePasswordReset: [
        check('mobile_number').exists({ checkNull: true, checkFalsy: true }).withMessage("Mobile number is required"),
        check('mobile_number').isMobilePhone().withMessage('Invalid mobile number'),
    ],
};