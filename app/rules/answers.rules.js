import { check } from 'express-validator';
import db from "../models/index.js";
import { default_status, check_length_TEXT, return_default_value, check_pro_expiry, true_status, default_delete_status } from '../config/config.js';

const PLATFORMS = db.platforms;
const ANSWERS = db.answers;
const QUESTIONS = db.questions;
const APP_DEFAULTS = db.app_defaults;
const Op = db.Sequelize.Op;

export const answers_rules = {
    forFindingAnswer: [
        check('question_unique_id', "Question Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom((question_unique_id, { req }) => {
                return QUESTIONS.findOne({ where: { unique_id: question_unique_id, platform_unique_id: req.query.platform_unique_id || req.body.platform_unique_id || '', status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Question not found!');
                });
            }),
        check('unique_id', "Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom((unique_id, { req }) => {
                return ANSWERS.findOne({
                    where: {
                        unique_id,
                        question_unique_id: req.query.question_unique_id || req.body.question_unique_id || '',
                        platform_unique_id: req.query.platform_unique_id || req.body.platform_unique_id || '',  
                        status: default_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Answer not found!');
                });
            })
    ],
    forFindingAnswerFalsy: [
        check('question_unique_id', "Question Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom((question_unique_id, { req }) => {
                return QUESTIONS.findOne({ where: { unique_id: question_unique_id, platform_unique_id: req.query.platform_unique_id || req.body.platform_unique_id || '', status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Question not found!');
                });
            }),
        check('unique_id', "Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom((unique_id, { req }) => {
                return ANSWERS.findOne({
                    where: {
                        unique_id,
                        question_unique_id: req.query.question_unique_id || req.body.question_unique_id || '',
                        platform_unique_id: req.query.platform_unique_id || req.body.platform_unique_id || '',
                        status: default_delete_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Answer not found!');
                });
            })
    ],
    forFindingAnswerAlt: [
        check('answer_unique_id', "Answer Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(answer_unique_id => {
                return ANSWERS.findOne({ where: { unique_id: answer_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Answer not found!');
                });
            })
    ],
    forAdding: [
        check('question_unique_id', "Question Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(question_unique_id => {
                return QUESTIONS.findOne({ where: { unique_id: question_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Question not found!');
                });
            })
            .bail()
            .custom(async (question_unique_id, { req }) => {
                const answer_count = await ANSWERS.count({ where: { question_unique_id, platform_unique_id: req.query.platform_unique_id || req.body.platform_unique_id || '' } });

                const pro_details = await PLATFORMS.findOne({ attributes: ['pro', 'pro_expiring'], where: { unique_id: req.query.platform_unique_id || req.body.platform_unique_id || '' } });
                const pro_expiry_date_status = pro_details['dataValues'].pro_expiring ? check_pro_expiry(pro_details['dataValues'].pro_expiring) : true;

                const _max_answers = await APP_DEFAULTS.findOne({ where: { criteria: { [Op.like]: `%${pro_expiry_date_status === true ? "Max Free Answers" : "Max Paid Answers"}` } } });
                const max_answers = return_default_value(_max_answers['dataValues']);
                if (answer_count >= max_answers) return Promise.reject('Max answers reached!');
            }),
        check('option', "Option is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isLength({ min: 1, max: check_length_TEXT })
            .withMessage(`Invalid length (1 - ${check_length_TEXT}) characters`),
        check('answer', "Indicate if option is the correct answer")
            .exists({ checkNull: true, checkFalsy: false })
            .bail()
            .isBoolean()
            .withMessage("Value should be true or false")
            .bail()
            .custom(async (answer, { req }) => {
                const question_details = await QUESTIONS.findOne({ 
                    attributes: ['multiple_answer'], 
                    where : { 
                        unique_id: req.query.question_unique_id || req.body.question_unique_id || '',
                        platform_unique_id: req.query.platform_unique_id || req.body.platform_unique_id || ''
                    } 
                });
                const multiple_answer_status = question_details['dataValues'].multiple_answer;
                const answer_details = await ANSWERS.findOne({ 
                    attributes: ['answer'], 
                    where : { 
                        question_unique_id: req.query.question_unique_id || req.body.question_unique_id || '', 
                        platform_unique_id: req.query.platform_unique_id || req.body.platform_unique_id || '',
                        answer: true_status 
                    } 
                });
                const answer_status = answer_details ? answer_details['dataValues'].answer : false;

                if(answer) {
                    if (answer_status) {
                        if (!multiple_answer_status) return Promise.reject(`Question doesn't accept multiple answers`);
                    }
                }
            })
    ],
    forUpdatingDetails: [
        check('option', "Option is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isLength({ min: 1, max: check_length_TEXT })
            .withMessage(`Invalid length (1 - ${check_length_TEXT}) characters`)
    ],
    forUpdatingAnswer: [
        check('answer', "Indicate if option is the correct answer")
            .exists({ checkNull: true, checkFalsy: false })
            .bail()
            .isBoolean()
            .withMessage("Value should be true or false")
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
                const answer_count = await ANSWERS.count({ where: { 
                    question_unique_id: req.query.question_unique_id || req.body.question_unique_id || '', 
                    platform_unique_id: req.query.platform_unique_id || req.body.platform_unique_id || '', 
                } });
                if (answer_count === 0) return Promise.reject('No answers available to order');
                if (order > answer_count) return Promise.reject(`Invalid order range 1 - ${answer_count}`);
            })
    ]
};  