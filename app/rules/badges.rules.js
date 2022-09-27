import { check } from 'express-validator';
import db from "../models/index.js";
import { default_status } from '../config/config.js';

const BADGES = db.badges;
const Op = db.Sequelize.Op;

export const badge_rules = {
    forFindingBadge: [
        check('unique_id', "Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(unique_id => {
                return BADGES.findOne({ where: { unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Badge not found!');
                });
            })
    ],
    forAdding: [
        check('badge', "Badge is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters")
            .bail()
            .custom(badge => {
                return BADGES.findOne({ where: { stripped: { [Op.like]: `%${badge}`}, status: default_status } }).then(data => {
                    if (data) return Promise.reject('Badge already exists!');
                });
            }),
        check('badge_icon', "Badge Icon is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 10, max: 500 })
            .withMessage("Invalid length (10 - 500) characters"),
        check('badge_description', "Badge Description is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 10, max: 1000 })
            .withMessage("Invalid length (10 - 1000) characters")
    ],
    forEditing: [
        check('badge', "Badge is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters")
            .bail()
            .custom((badge, { req }) => {
                return BADGES.findOne({ 
                    where: { 
                        stripped: { 
                            [Op.like]: `%${badge}` 
                        }, 
                        unique_id: {
                            [Op.ne]: req.query.unique_id || req.body.unique_id || '',
                        },
                        status: default_status 
                    } 
                }).then(data => {
                    if (data) return Promise.reject('Badge already exists!');
                });
            }),
        check('badge_icon', "Badge Icon is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 10, max: 500 })
            .withMessage("Invalid length (10 - 500) characters"),
        check('badge_description', "Badge Description is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 10, max: 1000 })
            .withMessage("Invalid length (10 - 1000) characters")
    ],
};  