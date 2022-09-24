import { check } from 'express-validator';
import db from "../models/index.js";
import { check_length_TEXT, strip_text, default_status } from '../config/config.js';

const PLATFORMS = db.platforms;
const Op = db.Sequelize.Op;

export const platform_rules = {
    forFindingPlatform: [
        check('unique_id').exists({ checkNull: true, checkFalsy: true }).withMessage("Unique Id is required"),
        check('unique_id')
            .custom(unique_id => {
                return PLATFORMS.findOne({ where: { unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Platform not found!');
                });
            })
            .withMessage('Platform not found')
    ],
    forFindingPlatformViaToken: [
        check('token').exists({ checkNull: true, checkFalsy: true }).withMessage("Token is required"),
        check('token')
            .custom(token => {
                return PLATFORMS.findOne({ where: { token, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Platform not found!');
                });
            })
            .withMessage('Platform not found')
    ],
    forAdding: [
        check('name').exists({ checkNull: true, checkFalsy: true }).withMessage("Name is required"),
        check('name').isString().isLength({ min: 3, max: 50 }).withMessage("Invalid length (3 - 50) characters"),
        check('name')
            .custom(name => {
                return PLATFORMS.findOne({ where: { stripped: strip_text(name), status: default_status } }).then(data => {
                    if (data) return Promise.reject('Platform already exists!');
                });
            })
            .withMessage('Platform already exists'),
        check('email').exists({ checkNull: true, checkFalsy: true }).withMessage("Email is required"),
        check('email').isEmail().withMessage('Invalid email format'),
        check('description').exists({ checkNull: true, checkFalsy: true }).withMessage("Description is required"),
        check('description').isLength({ min: 3, max: check_length_TEXT }).withMessage(`Invalid length (3 - ${check_length_TEXT}) characters`),
    ],
    forEditing: [
        check('name').exists({ checkNull: true, checkFalsy: true }).withMessage("Name is required"),
        check('name').isString().isLength({ min: 3, max: 50 }).withMessage("Invalid length (3 - 50) characters"),
        check('name')
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
            })
            .withMessage('Platform already exists'),
        check('email').exists({ checkNull: true, checkFalsy: true }).withMessage("Email is required"),
        check('email').isEmail().withMessage('Invalid email format'),
        check('description').exists({ checkNull: true, checkFalsy: true }).withMessage("Description is required"),
        check('description').isLength({ min: 3, max: check_length_TEXT }).withMessage(`Invalid length (3 - ${check_length_TEXT}) characters`),
    ],
};  