import { check } from 'express-validator';
import db from "../models/index.js";
import { default_status } from '../config/config.js';

const USER_BADGES = db.user_badges;
const USERS = db.users;
const BADGES = db.badges;

export const user_badge_rules = {
    forFindingUserBadge: [
        check('user_unique_id', "User Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(user_unique_id => {
                return USERS.findOne({ where: { unique_id: user_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('User not found!');
                });
            }),
        check('badge_unique_id', "Badge Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(badge_unique_id => {
                return BADGES.findOne({ where: { unique_id: badge_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Badge not found!');
                });
            }),
        check('unique_id', "Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(unique_id => {
                return USER_BADGES.findOne({ where: { unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('User Badge not found!');
                });
            })
    ],
    forAdding: [
        check('user_unique_id', "User Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(user_unique_id => {
                return USERS.findOne({ where: { unique_id: user_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('User not found!');
                });
            }),
        check('badge_unique_id', "Badge Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(badge_unique_id => {
                return BADGES.findOne({ where: { unique_id: badge_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Badge not found!');
                });
            })
    ]
};  