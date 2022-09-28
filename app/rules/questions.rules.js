import { check } from 'express-validator';
import db from "../models/index.js";
import { default_status, check_length_TEXT, return_default_value, check_pro_expiry } from '../config/config.js';

const PLATFORMS = db.platforms;
const QUESTIONS = db.questions;
const ASSESSMENTS = db.assessments;
const APP_DEFAULTS = db.app_defaults;
const Op = db.Sequelize.Op;

export const questions_rules = {
    forFindingQuestion: [
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
            .custom((unique_id, { req }) => {
                return QUESTIONS.findOne({
                    where: {
                        unique_id,
                        assessment_unique_id: req.query.assessment_unique_id || req.body.assessment_unique_id || '',
                        status: default_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Question not found!');
                });
            })
    ],
    forFindingQuestionAlt: [
        check('question_unique_id', "Question Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(question_unique_id => {
                return QUESTIONS.findOne({ where: { unique_id: question_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Question not found!');
                });
            })
    ],
    forAdding: [
        check('assessment_unique_id', "Assessment Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(assessment_unique_id => {
                return ASSESSMENTS.findOne({ where: { unique_id: assessment_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Assessment not found!');
                });
            })
            .bail()
            .custom(async (assessment_unique_id, {req}) => {
                const question_count = await QUESTIONS.count({ where: { assessment_unique_id } });

                const pro_details = await PLATFORMS.findOne({ attributes: ['pro', 'pro_expiring'], platform_unique_id: req.query.platform_unique_id || req.body.platform_unique_id || '' });
                const pro_expiry_date_status = pro_details['dataValues'].pro_expiring ? check_pro_expiry(pro_details['dataValues'].pro_expiring) : true;

                const _max_questions = await APP_DEFAULTS.findOne({ where: { criteria: { [Op.like]: `%${pro_expiry_date_status === true ? "Max Free Questions" : "Max Paid Questions"}` } } });
                const max_questions = return_default_value(_max_questions['dataValues']);
                if (question_count >= max_questions) return Promise.reject('Max questions reached!');
            }),
        check('question', "Question is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isLength({ min: 3, max: check_length_TEXT })
            .withMessage(`Invalid length (3 - ${check_length_TEXT}) characters`),
        check('multiple_answer', "Indicate if question has multiple answers")
            .exists({ checkNull: true, checkFalsy: false })
            .bail()
            .isBoolean()
            .withMessage("Value should be true or false")
    ],
    forUpdatingDetails: [
        check('question', "Question is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isLength({ min: 3, max: check_length_TEXT })
            .withMessage(`Invalid length (3 - ${check_length_TEXT}) characters`),
        check('multiple_answer', "Indicate if question has multiple answers")
            .exists({ checkNull: true, checkFalsy: false })
            .bail()
            .isBoolean()
            .withMessage("Value should be true or false"),
        check('order', "Order is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isInt()
            .withMessage("Invalid order, only numbers allowed")
            .bail()
            .custom(order => {
                if (order === 0) return false;
                else if (order < 0) return false;
                else return true;
            })
            .withMessage("Invalid order")
            .bail()
            .custom(async (order, { req }) => {
                const question_count = await QUESTIONS.count({ where: { assessment_unique_id: req.query.assessment_unique_id || req.body.assessment_unique_id || '' } });
                if (question_count === 0) return Promise.reject('No questions available to order');
                if (order > question_count) return Promise.reject(`Invalid order range 1 - ${question_count}`);
            })
    ],
    forUpdatingMultipleAnswer: [
        check('multiple_answer', "Indicate if question has multiple answers")
            .exists({ checkNull: true, checkFalsy: false })
            .bail()
            .isBoolean()
            .withMessage("Value should be true or false"),
    ],
    forUpdatingOrder: [
        check('order', "Order is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isInt()
            .withMessage("Invalid order, only numbers allowed")
            .bail()
            .custom(order => {
                if (order === 0) return false;
                else if (order < 0) return false;
                else return true;
            })
            .withMessage("Invalid order")
            .bail()
            .custom(async (order, { req }) => {
                const question_count = await QUESTIONS.count({ where: { assessment_unique_id: req.query.assessment_unique_id || req.body.assessment_unique_id || '' } });
                if (question_count === 0) return Promise.reject('No questions available to order');
                if (order > question_count) return Promise.reject(`Invalid order range 1 - ${question_count}`);
            })
    ]
};  