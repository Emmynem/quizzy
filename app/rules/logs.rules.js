import { check } from 'express-validator';
import db from "../models/index.js";
import { default_status } from '../config/config.js';

const LOGS = db.logs;

export const log_rules = {
    forFindingLog: [
        check('unique_id', "Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(unique_id => {
                return LOGS.findOne({ where: { unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Log not found!');
                });
            })
    ],
    forFindingLogAlt: [
        check('log_unique_id', "Log Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(log_unique_id => {
                return LOGS.findOne({ where: { unique_id: log_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Log not found!');
                });
            })
    ],
};  