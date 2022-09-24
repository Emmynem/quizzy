import { check } from 'express-validator';
import db from "../models/index.js";
import { check_length_TEXT, default_status } from '../config/config.js';

const PLATFORMS = db.platforms;
const PLATFORM_NOTIFICATIONS = db.platform_notifications;

export const platform_notification_rules = {
    forFindingPlatformNotification: [
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
                return PLATFORM_NOTIFICATIONS.findOne({ 
                    where: { 
                        unique_id, 
                        platform_unique_id: req.query.platform_unique_id || req.body.platform_unique_id || '', 
                        status: default_status 
                    } 
                }).then(data => {
                    if (!data) return Promise.reject('Notification not found!');
                });
            })
            .withMessage('Notification not found')
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
        check('type').exists({ checkNull: true, checkFalsy: true }).withMessage("Type is required"),
        check('type').isString().isLength({ min: 3, max: 20 }).withMessage("Invalid length (3 - 20) characters"),
        check('action').exists({ checkNull: true, checkFalsy: true }).withMessage("Action is required"),
        check('action').isString().isLength({ min: 3, max: 200 }).withMessage("Invalid length (3 - 200) characters"),
        check('details').optional({ checkFalsy: false }).isLength({ min: 3, max: check_length_TEXT }).withMessage(`Invalid length (3 - ${check_length_TEXT}) characters`),
    ],
};  