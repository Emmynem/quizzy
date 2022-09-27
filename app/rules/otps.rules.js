import { check } from 'express-validator';
import db from "../models/index.js";
import { default_status } from '../config/config.js';

const PLATFORMS = db.platforms;

export const otps_rules = {
    forFindingOtp: [
        check('platform_unique_id', "Platform Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(platform_unique_id => {
                return PLATFORMS.findOne({ where: { unique_id: platform_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Platform not found!');
                });
            })
    ]
};  