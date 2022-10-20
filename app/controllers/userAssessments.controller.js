import { validationResult, matchedData } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, CreationSuccessResponse, BadRequestError, logger } from '../common/index.js';
import { default_delete_status, default_status, tag_admin, validate_future_date } from '../config/config.js';
import db from "../models/index.js";
import { addUserNotification } from './notifications.controller.js';

const USERS = db.users;
const USER_ASSESSMENTS = db.user_assessments;
const ASSESSMENTS = db.assessments;
const QUESTIONS = db.questions;
const ANSWERS = db.answers;
const LOGS = db.logs;
const PLATFORMS = db.platforms;
const Op = db.Sequelize.Op;

export function rootGetUserAssessments(req, res) {
    USER_ASSESSMENTS.findAndCountAll({
        attributes: { exclude: ['id'] },
        order: [
            ['createdAt', 'DESC']
        ],
        include: [
            {
                model: USERS,
                attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number']
            },
            {
                model: ASSESSMENTS,
                attributes: ['name', 'stripped', 'identifier', 'background_image', 'start', 'end', 'duration'],
                include: [
                    {
                        model: PLATFORMS,
                        attributes: ['name', 'stripped', 'email', 'profile_image', 'pro']
                    }
                ]
            },
            {
                model: QUESTIONS,
                attributes: ['question', 'order', 'multiple_answer']
            },
            {
                model: ANSWERS,
                attributes: ['option', 'order', 'answer']
            },
            {
                model: LOGS,
                attributes: ['start_time', 'end_time']
            }
        ]
    }).then(user_assessments => {
        if (!user_assessments || user_assessments.length == 0) {
            SuccessResponse(res, { unique_id: tag_admin, text: "User Assessments Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: tag_admin, text: "User Assessments loaded" }, user_assessments);
        }
    }).catch(err => {
        ServerError(res, { unique_id: tag_admin, text: err.message }, null);
    });
};

export function rootGetUserAssessmentsSpecifically(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    }
    else {
        USER_ASSESSMENTS.findAndCountAll({
            attributes: { exclude: ['id'] },
            where: {
                ...payload
            },
            include: [
                {
                    model: USERS,
                    attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number']
                },
                {
                    model: ASSESSMENTS,
                    attributes: ['name', 'stripped', 'identifier', 'background_image', 'start', 'end', 'duration'],
                    include: [
                        {
                            model: PLATFORMS,
                            attributes: ['name', 'stripped', 'email', 'profile_image', 'pro']
                        }
                    ]
                },
                {
                    model: QUESTIONS,
                    attributes: ['question', 'order', 'multiple_answer']
                },
                {
                    model: ANSWERS,
                    attributes: ['option', 'order', 'answer']
                },
                {
                    model: LOGS,
                    attributes: ['start_time', 'end_time']
                }
            ]
        }).then(user_assessment => {
            if (!user_assessment) {
                NotFoundError(res, { unique_id: tag_admin, text: "User Assessment not found" }, null);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "User Assessment loaded" }, user_assessment);
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export function getUserAssessments(req, res) {
    const user_unique_id = req.UNIQUE_ID;

    USER_ASSESSMENTS.findAndCountAll({
        attributes: { exclude: ['user_unique_id', 'id'] },
        where: {
            user_unique_id
        },
        order: [
            ['createdAt', 'DESC']
        ],
        include: [
            {
                model: ASSESSMENTS,
                attributes: ['name', 'stripped', 'identifier', 'background_image', 'start', 'end', 'duration'],
                include: [
                    {
                        model: PLATFORMS,
                        attributes: ['name', 'stripped', 'profile_image']
                    }
                ]
            },
            {
                model: QUESTIONS,
                attributes: ['question', 'order', 'multiple_answer']
            },
            {
                model: ANSWERS,
                attributes: ['option', 'order']
            },
            {
                model: LOGS,
                attributes: ['start_time', 'end_time']
            }
        ]
    }).then(user_assessments => {
        if (!user_assessments || user_assessments.length == 0) {
            SuccessResponse(res, { unique_id: user_unique_id, text: "User Assessments Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: user_unique_id, text: "User Assessments loaded" }, user_assessments);
        }
    }).catch(err => {
        ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
    });
};

export function getUserAssessmentsSpecifically(req, res) {
    const user_unique_id = req.UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    }
    else {
        USER_ASSESSMENTS.findAndCountAll({
            attributes: { exclude: ['user_unique_id', 'id'] },
            where: {
                user_unique_id,
                ...payload
            },
            order: [
                ['createdAt', 'DESC']
            ],
            include: [
                {
                    model: ASSESSMENTS,
                    attributes: ['name', 'stripped', 'identifier', 'background_image', 'start', 'end', 'duration'],
                    include: [
                        {
                            model: PLATFORMS,
                            attributes: ['name', 'stripped', 'profile_image']
                        }
                    ]
                },
                {
                    model: QUESTIONS,
                    attributes: ['question', 'order', 'multiple_answer']
                },
                {
                    model: ANSWERS,
                    attributes: ['option', 'order']
                },
                {
                    model: LOGS,
                    attributes: ['start_time', 'end_time']
                }
            ]
        }).then(user_assessments => {
            if (!user_assessments || user_assessments.length == 0) {
                SuccessResponse(res, { unique_id: user_unique_id, text: "User Assessments Not found" }, []);
            } else {
                SuccessResponse(res, { unique_id: user_unique_id, text: "User Assessments loaded" }, user_assessments);
            }
        }).catch(err => {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        });
    }
};

export async function addUserAssessmentAnswers(req, res) {
    const user_unique_id = req.UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    }
    else {
        try {
            const assessment = await ASSESSMENTS.findOne({
                attributes: ['name', 'candidate_limit', 'start', 'end', 'retakes'],
                where: {
                    unique_id: payload.assessment_unique_id,
                    status: default_status
                }
            });

            const question = await QUESTIONS.findOne({
                attributes: ['question', 'order', 'multiple_answer'],
                where: {
                    unique_id: payload.question_unique_id,
                    status: default_status
                }
            });

            const log = await LOGS.findOne({
                attributes: ['start_time', 'end_time'],
                where: {
                    unique_id: payload.log_unique_id,
                    status: default_status
                }
            });

            const user_assessment = await USER_ASSESSMENTS.findOne({
                attributes: ['unique_id'],
                where: {
                    user_unique_id,
                    assessment_unique_id: payload.assessment_unique_id,
                    log_unique_id: payload.log_unique_id,
                    status: default_status
                }
            });

            const user_question_answers = await USER_ASSESSMENTS.count({ where: { question_unique_id: payload.question_unique_id, user_unique_id, assessment_unique_id: payload.assessment_unique_id, log_unique_id: payload.log_unique_id } });

            if (log.end_time && !validate_future_date(log.end_time)) {
                BadRequestError(res, { unique_id: user_unique_id, text: "You've completed the assessment already!" }, null);
            } else {
                if (user_assessment && !question.multiple_answer) {
                    const user_assessments = await db.sequelize.transaction((t) => {
                        return USER_ASSESSMENTS.update({
                            answer_unique_id: payload.answer_unique_id
                        }, {
                            where: {
                                unique_id: user_assessment.unique_id,
                                user_unique_id,
                                assessment_unique_id: payload.assessment_unique_id,
                                question_unique_id: payload.question_unique_id,
                                log_unique_id: payload.log_unique_id,
                                status: default_status
                            }
                        }, { transaction: t });
                    });

                    if (user_assessments > 0) {
                        OtherSuccessResponse(res, { unique_id: user_unique_id, text: "Answer updated successfully!" });
                    } else {
                        BadRequestError(res, { unique_id: user_unique_id, text: "Error updating answer!" }, null);
                    }
                } else if (user_assessment && !question.multiple_answer && user_question_answers > 0) {
                    const user_assessments = await db.sequelize.transaction((t) => {
                        return USER_ASSESSMENTS.create({
                            unique_id: uuidv4(),
                            user_unique_id,
                            ...payload,
                            status: default_status
                        }, { transaction: t });
                    });

                    if (user_assessments) {
                        CreationSuccessResponse(res, { unique_id: user_unique_id, text: "Answer saved successfully!" });
                    } else {
                        BadRequestError(res, { unique_id: user_unique_id, text: "Error adding answer!" }, null);
                    }
                } else {
                    const user_assessments = await db.sequelize.transaction((t) => {
                        return USER_ASSESSMENTS.create({
                            unique_id: uuidv4(),
                            user_unique_id,
                            ...payload,
                            status: default_status
                        }, { transaction: t });
                    });
    
                    if (user_assessments) {
                        CreationSuccessResponse(res, { unique_id: user_unique_id, text: "Answer saved successfully!" });
                    } else {
                        BadRequestError(res, { unique_id: user_unique_id, text: "Error adding answer!" }, null);
                    }
                }
            }
        } catch (err) {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        }
    }
};