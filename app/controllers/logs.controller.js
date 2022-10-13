import { validationResult, matchedData } from 'express-validator';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, CreationSuccessResponse, BadRequestError, logger } from '../common/index.js';
import { default_delete_status, default_status, tag_admin, validate_future_date } from '../config/config.js';
import db from "../models/index.js";
import { addUserNotification } from './notifications.controller.js';

const USERS = db.users;
const LOGS = db.logs;
const ASSESSMENTS = db.assessments;
const PLATFORMS = db.platforms;
const Op = db.Sequelize.Op;

export function rootGetAssessmentLogs(req, res) {
    LOGS.findAndCountAll({
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
            }
        ]
    }).then(logs => {
        if (!logs || logs.length == 0) {
            SuccessResponse(res, { unique_id: tag_admin, text: "Logs Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: tag_admin, text: "Logs loaded" }, logs);
        }
    }).catch(err => {
        ServerError(res, { unique_id: tag_admin, text: err.message }, null);
    });
};

export function rootGetAssessmentLog(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    }
    else {
        LOGS.findOne({
            attributes: { exclude: ['id'] },
            where: {
                unique_id: payload.log_unique_id
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
                }
            ]
        }).then(log => {
            if (!log) {
                NotFoundError(res, { unique_id: tag_admin, text: "Log not found" }, null);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "Log loaded" }, log);
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export function getUserAssessmentLogs(req, res) {
    const user_unique_id = req.UNIQUE_ID;

    LOGS.findAndCountAll({
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
            }
        ]
    }).then(logs => {
        if (!logs || logs.length == 0) {
            SuccessResponse(res, { unique_id: user_unique_id, text: "Logs Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: user_unique_id, text: "Logs loaded" }, logs);
        }
    }).catch(err => {
        ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
    });
};

export function getUserAssessmentLog(req, res) {
    const user_unique_id = req.UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    }
    else {
        LOGS.findOne({
            attributes: { exclude: ['user_unique_id', 'id'] },
            where: {
                ...payload,
                user_unique_id
            },
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
                }
            ]
        }).then(log => {
            if (!log) {
                NotFoundError(res, { unique_id: user_unique_id, text: "Log not found" }, null);
            } else {
                SuccessResponse(res, { unique_id: user_unique_id, text: "Log loaded" }, log);
            }
        }).catch(err => {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        });
    }
};

export async function startUserAssessmentLog(req, res) {
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

            const assessment_candidate_count = await LOGS.count({ where: { ...payload, user_unique_id: { [Op.ne]: user_unique_id } } });
            const user_assessment_count = await LOGS.count({ where: { ...payload, user_unique_id } });
            
            if (!assessment) {
                BadRequestError(res, { unique_id: user_unique_id, text: "Error getting assessment!" }, null);
            } else {
                if (validate_future_date(assessment.start)) {
                    BadRequestError(res, { unique_id: user_unique_id, text: "Assessment hasn't started yet!" }, null);
                } else if (assessment.end && !validate_future_date(assessment.end)) {
                    BadRequestError(res, { unique_id: user_unique_id, text: "Assessment has ended!" }, null);
                } else if (assessment.candidate_limit && (assessment_candidate_count >= assessment.candidate_limit)) {
                    BadRequestError(res, { unique_id: user_unique_id, text: "Assessment has reached max participants!" }, null);
                } else if ((!assessment.retakes || assessment.retakes === 0) && (user_assessment_count >= 1)) {
                    BadRequestError(res, { unique_id: user_unique_id, text: "Retakes unavailable on assessment!" }, null);
                } else if (assessment.retakes && (user_assessment_count > assessment.retakes)) {
                    BadRequestError(res, { unique_id: user_unique_id, text: "Max retakes reached on assessment!" }, null);
                } else {
                    const start_time = moment().toDate();
                    const start_time_text = moment();
        
                    const logs = await db.sequelize.transaction((t) => {
                        return LOGS.create({
                            unique_id: uuidv4(),
                            user_unique_id,
                            ...payload,
                            start_time,
                            status: default_status
                        }, { transaction: t });
                    });
        
                    if (logs) {
                        const user_notification_data = {
                            user_unique_id,
                            type: "Log",
                            action: `Started ${assessment.name} assessment on ${start_time_text}`
                        };
                        addUserNotification(req, res, user_notification_data);
                        CreationSuccessResponse(res, { unique_id: user_unique_id, text: "Assessment started successfully!" }, { log_unique_id: logs.unique_id });
                    }
                }
            }
        } catch (err) {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        }
    }
};

export async function endUserAssessmentLog(req, res) {
    const user_unique_id = req.UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            const assessment = await ASSESSMENTS.findOne({
                attributes: ['name', 'candidate_limit', 'start', 'end', 'retakes'],
                where: {
                    unique_id: payload.assessment_unique_id,
                    status: default_status
                }
            });

            const user_log = await LOGS.findOne({
                attributes: ['end_time'],
                where: {
                    ...payload,
                    status: default_status
                }
            });

            if (!assessment) {
                BadRequestError(res, { unique_id: user_unique_id, text: "Error getting assessment!" }, null);
            } else if (!user_log) {
                BadRequestError(res, { unique_id: user_unique_id, text: "Error getting user assessment log!" }, null);
            } else {
                if (user_log.end_time) {
                    BadRequestError(res, { unique_id: user_unique_id, text: "Assessment has already been completed!" }, null);
                } else {
                    const end_time = moment().toDate();
                    const end_time_text = moment();
        
                    const log = await db.sequelize.transaction((t) => {
                        return LOGS.update({
                            end_time
                        }, {
                            where: {
                                user_unique_id,
                                ...payload,
                                status: default_status
                            }
                        }, { transaction: t });
                    });
        
                    if (log > 0) {
                        const user_notification_data = {
                            user_unique_id,
                            type: "Log",
                            action: `Completed ${assessment.name} assessment on ${end_time_text}`
                        };
                        addUserNotification(req, res, user_notification_data);
                        OtherSuccessResponse(res, { unique_id: user_unique_id, text: "Assessment completed successfully!" });
                    } else {
                        BadRequestError(res, { unique_id: user_unique_id, text: "Error logging assessment completion!" }, null);
                    }
                }
            }

        } catch (err) {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        }
    }
};
