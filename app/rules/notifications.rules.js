import { check } from 'express-validator';
import db from "../models/index.js";
import { check_length_TEXT, default_status } from '../config/config.js';

const USERS = db.users;
const NOTIFICATIONS = db.notifications;

export const notification_rules = {
    forFindingNotification: [
        check('unique_id').exists({ checkNull: true, checkFalsy: true }).withMessage("Unique Id is required"),
        check('user_unique_id').exists({ checkNull: true, checkFalsy: true }).withMessage("User Unique Id is required"),
        check('user_unique_id')
            .custom(user_unique_id => {
                return USERS.findOne({ where: { unique_id: user_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('User not found!');
                });
            })
            .withMessage('User not found'),
        check('unique_id')
            .custom((unique_id, {req}) => {
                return NOTIFICATIONS.findOne({ 
                    where: { 
                        unique_id, 
                        user_unique_id: req.query.user_unique_id || req.body.user_unique_id || '', 
                        status: default_status 
                    } 
                }).then(data => {
                    if (!data) return Promise.reject('Notification not found!');
                });
            })
            .withMessage('Notification not found')
    ],
    forAdding: [
        check('user_unique_id').exists({ checkNull: true, checkFalsy: true }).withMessage("User Unique Id is required"),
        check('user_unique_id')
            .custom(user_unique_id => {
                return USERS.findOne({ where: { unique_id: user_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('User not found!');
                });
            })
            .withMessage('User not found'),
        check('type').exists({ checkNull: true, checkFalsy: true }).withMessage("Type is required"),
        check('type').isString().isLength({ min: 3, max: 20 }).withMessage("Invalid length (3 - 20) characters"),
        check('action').exists({ checkNull: true, checkFalsy: true }).withMessage("Action is required"),
        check('action').isString().isLength({ min: 3, max: 200 }).withMessage("Invalid length (3 - 200) characters"),
        check('details').optional({ checkFalsy: false }).isLength({ min: 3, max: check_length_TEXT }).withMessage(`Invalid length (3 - ${check_length_TEXT}) characters`),
    ],
};  