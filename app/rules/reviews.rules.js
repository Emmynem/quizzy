import { check } from 'express-validator';
import db from "../models/index.js";
import { default_status } from '../config/config.js';

const REVIEWS = db.reviews;
const USERS = db.users;
const ASSESSMENTS = db.assessments;

export const review_rules = {
    forFindingReview: [
        check('user_unique_id', "User Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(user_unique_id => {
                return USERS.findOne({ where: { unique_id: user_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('User not found!');
                });
            }),
        check('assessment_unique_id', "Assessment Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(assessment_unique_id => {
                return ASSESSMENTS.findOne({ where: { unique_id: assessment_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Assessment not found!');
                });
            }),
        check('unique_id', "Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(unique_id => {
                return REVIEWS.findOne({ where: { unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Review not found!');
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
        check('assessment_unique_id', "Assessment Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(assessment_unique_id => {
                return ASSESSMENTS.findOne({ where: { unique_id: assessment_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Assessment not found!');
                });
            }),
        check('rating', "Rating is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isInt()
            .withMessage("Invalid rating, only numbers allowed")
            .bail()
            .custom(rating => {
                if (rating === 0) return false;
                else if (rating < 0) return false;
                else if (rating > 5) return false;
                else return true;
            })
            .withMessage("Invalid rating range 1 - 5"),
        check('feedback', "Feedback is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isLength({ min: 2, max: 1000 })
            .withMessage('Invalid length (2 - 1000) characters'),
    ]
};  