import { check } from 'express-validator';
import db from "../models/index.js";
import { default_status } from '../config/config.js';

const RESULTS = db.results;
const USERS = db.users;
const ASSESSMENTS = db.assessments;
const LOGS = db.logs;

export const result_rules = {
    forFindingResult: [
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
                return RESULTS.findOne({ where: { unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Result not found!');
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