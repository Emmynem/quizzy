import { check } from 'express-validator';
import db from "../models/index.js";
import { default_status } from '../config/config.js';

const USER_ASSESSMENTS = db.user_assessments;
const USERS = db.users;
const ASSESSMENTS = db.assessments;
const QUESTIONS = db.questions;
const ANSWERS = db.answers;
const LOGS = db.logs;

export const user_assessment_rules = {
    forFindingUserAssessment: [
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
        check('question_unique_id', "Question Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(question_unique_id => {
                return QUESTIONS.findOne({ where: { unique_id: question_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Question not found!');
                });
            }),
        check('answer_unique_id', "Answer Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(answer_unique_id => {
                return ANSWERS.findOne({ where: { unique_id: answer_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Answer not found!');
                });
            }),
        check('log_unique_id', "Log Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(log_unique_id => {
                return LOGS.findOne({ where: { unique_id: log_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Log not found!');
                });
            }),
        check('unique_id', "Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(unique_id => {
                return USER_ASSESSMENTS.findOne({ where: { unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('User Assessment not found!');
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
        check('question_unique_id', "Question Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(question_unique_id => {
                return QUESTIONS.findOne({ where: { unique_id: question_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Question not found!');
                });
            }),
        check('answer_unique_id', "Answer Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(answer_unique_id => {
                return ANSWERS.findOne({ where: { unique_id: answer_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Answer not found!');
                });
            }),
        check('log_unique_id', "Log Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(log_unique_id => {
                return LOGS.findOne({ where: { unique_id: log_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Log not found!');
                });
            })
    ]
};  