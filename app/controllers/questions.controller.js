import { validationResult, matchedData } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, CreationSuccessResponse, logger } from '../common/index.js';
import { default_delete_status, default_status, tag_admin } from '../config/config.js';
import db from "../models/index.js";
import { addPlatformNotification } from './platformNotifications.controller.js';

const QUESTIONS = db.questions;
const ASSESSMENTS = db.assessments;
const PLATFORMS = db.platforms;
const PLATFORM_USERS = db.platform_users;

export function rootGetQuestions(req, res) {
    QUESTIONS.findAndCountAll({
        attributes: { exclude: ['id'] },
        order: [
            ['createdAt', 'DESC']
        ],
        include: [
            {
                model: PLATFORMS,
                attributes: ['name', 'stripped', 'email', 'profile_image', 'pro']
            },
            {
                model: PLATFORM_USERS,
                attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number']
            },
            {
                model: ASSESSMENTS,
                attributes: ['name', 'stripped', 'identifier', 'background_image', 'start', 'end', 'duration']
            },
        ]
    }).then(questions => {
        if (!questions || questions.length == 0) {
            SuccessResponse(res, { unique_id: tag_admin, text: "Questions Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: tag_admin, text: "Questions loaded" }, questions);
        }
    }).catch(err => {
        ServerError(res, { unique_id: tag_admin, text: err.message }, null);
    });
};

export function rootGetAssessmentQuestions(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    }
    else {
        QUESTIONS.findAndCountAll({
            attributes: { exclude: ['id'] },
            where: {
                ...payload
            },
            order: [
                ['order', 'ASC']
            ],
            include: [
                {
                    model: PLATFORMS,
                    attributes: ['name', 'stripped', 'email', 'profile_image', 'pro']
                },
                {
                    model: PLATFORM_USERS,
                    attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number']
                },
                {
                    model: ASSESSMENTS,
                    attributes: ['name', 'stripped', 'identifier', 'background_image', 'start', 'end', 'duration']
                },
            ]
        }).then(questions => {
            if (!questions || questions.length == 0) {
                SuccessResponse(res, { unique_id: tag_admin, text: "Questions Not found" }, []);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "Questions loaded" }, questions);
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export function rootGetAssessmentQuestion(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    }
    else {
        QUESTIONS.findOne({
            attributes: { exclude: ['id'] },
            where: {
                unique_id: payload.question_unique_id,
                assessment_unique_id: payload.assessment_unique_id
            },
            include: [
                {
                    model: PLATFORMS,
                    attributes: ['name', 'stripped', 'email', 'profile_image', 'pro']
                },
                {
                    model: PLATFORM_USERS,
                    attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number']
                },
                {
                    model: ASSESSMENTS,
                    attributes: ['name', 'stripped', 'identifier', 'background_image', 'start', 'end', 'duration']
                },
            ]
        }).then(question => {
            if (!question) {
                NotFoundError(res, { unique_id: tag_admin, text: "Question not found" }, null);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "Question loaded" }, question);
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export function getPlatformAssessmentQuestions(req, res) {
    const platform_unique_id = req.PLATFORM_UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: platform_unique_id, text: "Validation Error Occured" }, errors.array())
    }
    else {
        QUESTIONS.findAndCountAll({
            attributes: { exclude: ['platform_unique_id', 'id'] },
            where: {
                ...payload,
                platform_unique_id
            },
            order: [
                ['order', 'ASC']
            ],
            include: [
                {
                    model: PLATFORM_USERS,
                    attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number']
                },
                {
                    model: ASSESSMENTS,
                    attributes: ['name', 'stripped', 'identifier', 'background_image', 'start', 'end', 'duration']
                },
            ]
        }).then(questions => {
            if (!questions || questions.length == 0) {
                SuccessResponse(res, { unique_id: platform_unique_id, text: "Questions Not found" }, []);
            } else {
                SuccessResponse(res, { unique_id: platform_unique_id, text: "Questions loaded" }, questions);
            }
        }).catch(err => {
            ServerError(res, { unique_id: platform_unique_id, text: err.message }, null);
        });
    }
};

export function getPlatformAssessmentQuestion(req, res) {
    const platform_unique_id = req.PLATFORM_UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: platform_unique_id, text: "Validation Error Occured" }, errors.array())
    }
    else {
        QUESTIONS.findOne({
            attributes: { exclude: ['platform_unique_id', 'id'] },
            where: {
                ...payload,
                platform_unique_id
            },
            include: [
                {
                    model: PLATFORM_USERS,
                    attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number']
                },
                {
                    model: ASSESSMENTS,
                    attributes: ['name', 'stripped', 'identifier', 'background_image', 'start', 'end', 'duration']
                },
            ]
        }).then(question => {
            if (!question) {
                NotFoundError(res, { unique_id: platform_unique_id, text: "Question not found" }, null);
            } else {
                SuccessResponse(res, { unique_id: platform_unique_id, text: "Question loaded" }, question);
            }
        }).catch(err => {
            ServerError(res, { unique_id: platform_unique_id, text: err.message }, null);
        });
    }
};

export async function addPlatformAssessmentQuestion(req, res) {
    const platform_unique_id = req.PLATFORM_UNIQUE_ID;
    const platform_user_unique_id = req.PLATFORM_USER_UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: platform_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            const question_count = await QUESTIONS.count({ where: { platform_unique_id, assessment_unique_id: payload.assessment_unique_id } });
            const next_order = question_count + 1;

            const questions = await db.sequelize.transaction((t) => {
                return QUESTIONS.create({
                    unique_id: uuidv4(),
                    platform_unique_id,
                    platform_user_unique_id,
                    ...payload,
                    order: next_order,
                    status: default_status
                }, { transaction: t });
            });

            if (questions) {
                const platform_notification_data = {
                    platform_unique_id,
                    type: "Question",
                    action: "Created new question successfully!"
                };
                addPlatformNotification(req, res, platform_notification_data);
                CreationSuccessResponse(res, { unique_id: platform_unique_id, text: "Question created successfully!" });
            }
        } catch (err) {
            ServerError(res, { unique_id: platform_unique_id, text: err.message }, null);
        }
    }
};

export async function updatePlatformAssessmentQuestionDetails(req, res) {
    const platform_unique_id = req.PLATFORM_UNIQUE_ID;
    const platform_user_unique_id = req.PLATFORM_USER_UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: platform_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            const question = await db.sequelize.transaction((t) => {
                return QUESTIONS.update({
                    platform_user_unique_id,
                    ...payload
                }, {
                    where: {
                        unique_id: payload.unique_id,
                        platform_unique_id,
                        assessment_unique_id: payload.assessment_unique_id,
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (question > 0) {
                const platform_notification_data = {
                    platform_unique_id,
                    type: "Question",
                    action: "Updated question details successfully!"
                };
                addPlatformNotification(req, res, platform_notification_data);
                OtherSuccessResponse(res, { unique_id: platform_unique_id, text: "Question was updated successfully!" });
            } else {
                throw new Error("Error updating question details!");
            }
        } catch (err) {
            ServerError(res, { unique_id: platform_unique_id, text: err.message }, null);
        }
    }
};

export async function updatePlatformAssessmentQuestionCriteria(req, res) {
    const platform_unique_id = req.PLATFORM_UNIQUE_ID;
    const platform_user_unique_id = req.PLATFORM_USER_UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: platform_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            const question = await db.sequelize.transaction((t) => {
                return QUESTIONS.update({
                    platform_user_unique_id,
                    ...payload
                }, {
                    where: {
                        unique_id: payload.unique_id,
                        platform_unique_id,
                        assessment_unique_id: payload.assessment_unique_id,
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (question > 0) {
                const platform_notification_data = {
                    platform_unique_id,
                    type: "Question",
                    action: "Updated question criteria successfully!"
                };
                addPlatformNotification(req, res, platform_notification_data);
                OtherSuccessResponse(res, { unique_id: platform_unique_id, text: "Question was updated successfully!" });
            } else {
                throw new Error("Error updating question criteria!");
            }
        } catch (err) {
            ServerError(res, { unique_id: platform_unique_id, text: err.message }, null);
        }
    }
};

export async function updatePlatformAssessmentQuestionOrder(req, res) {
    const platform_unique_id = req.PLATFORM_UNIQUE_ID;
    const platform_user_unique_id = req.PLATFORM_USER_UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: platform_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            const replace_question = await QUESTIONS.findOne({
                attributes: ['unique_id', 'order'], 
                where: {
                    platform_unique_id,
                    assessment_unique_id: payload.assessment_unique_id, 
                    order: payload.order,
                    status: default_status
                } 
            });
            const recent_question = await QUESTIONS.findOne({ 
                attributes: ['unique_id', 'order'], 
                where: { 
                    unique_id: payload.unique_id,
                    platform_unique_id,
                    assessment_unique_id: payload.assessment_unique_id,
                    status: default_status
                } 
            });

            if (!replace_question) {
                const reorder_recent_question = await db.sequelize.transaction((t) => {
                    return QUESTIONS.update({
                        platform_user_unique_id,
                        order: payload.order,
                    }, {
                        where: {
                            unique_id: payload.unique_id,
                            platform_unique_id,
                            assessment_unique_id: payload.assessment_unique_id,
                            status: default_status
                        }
                    }, { transaction: t });
                });

                if (reorder_recent_question > 0) {
                    const platform_notification_data = {
                        platform_unique_id,
                        type: "Question",
                        action: "Updated question ordering successfully!",
                        details: "Replaced ordering not found in range"
                    };
                    addPlatformNotification(req, res, platform_notification_data);
                    OtherSuccessResponse(res, { unique_id: platform_unique_id, text: "Question was reordered successfully!" });
                } else {
                    throw new Error("Error reordering questions!");
                }
            } else if (replace_question['dataValues'].unique_id === payload.unique_id) {
                const platform_notification_data = {
                    platform_unique_id,
                    type: "Question",
                    action: "Retained question ordering successfully!"
                };
                addPlatformNotification(req, res, platform_notification_data);
                OtherSuccessResponse(res, { unique_id: platform_unique_id, text: "Question ordering was retained successfully!" });
            } else if (replace_question && recent_question) {
                const reorder_replace_question = await db.sequelize.transaction((t) => {
                    return QUESTIONS.update({
                        platform_user_unique_id,
                        order: recent_question['dataValues'].order
                    }, {
                        where: {
                            unique_id: replace_question['dataValues'].unique_id,
                            platform_unique_id,
                            assessment_unique_id: payload.assessment_unique_id,
                            status: default_status
                        }
                    }, { transaction: t });
                });
                const reorder_recent_question = await db.sequelize.transaction((t) => {
                    return QUESTIONS.update({
                        platform_user_unique_id,
                        order: replace_question['dataValues'].order
                    }, {
                        where: {
                            unique_id: recent_question['dataValues'].unique_id,
                            platform_unique_id,
                            assessment_unique_id: payload.assessment_unique_id,
                            status: default_status
                        }
                    }, { transaction: t });
                });

                if (reorder_replace_question > 0 && reorder_recent_question > 0) {
                    const platform_notification_data = {
                        platform_unique_id,
                        type: "Question",
                        action: "Updated question ordering successfully!"
                    };
                    addPlatformNotification(req, res, platform_notification_data);
                    OtherSuccessResponse(res, { unique_id: platform_unique_id, text: "Question was reordered successfully!" });
                } else {
                    throw new Error("Error reordering questions!");
                }
            } else {
                throw new Error("Error getting replacement question!");
            }
        } catch (err) {
            ServerError(res, { unique_id: platform_unique_id, text: err.message }, null);
        }
    }
};

export async function removePlatformAssessmentQuestion(req, res) {
    const platform_unique_id = req.PLATFORM_UNIQUE_ID;
    const platform_user_unique_id = req.PLATFORM_USER_UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: platform_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            const question = await db.sequelize.transaction((t) => {
                return QUESTIONS.update({
                    platform_user_unique_id,
                    status: default_delete_status
                }, {
                    where: {
                        unique_id: payload.unique_id,
                        platform_unique_id,
                        assessment_unique_id: payload.assessment_unique_id,
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (question > 0) {
                const platform_notification_data = {
                    platform_unique_id,
                    type: "Question",
                    action: "Removed question successfully!"
                };
                addPlatformNotification(req, res, platform_notification_data);
                OtherSuccessResponse(res, { unique_id: platform_unique_id, text: "Question was removed successfully!" });
            } else {
                throw new Error("Error removing question!");
            }
        } catch (err) {
            ServerError(res, { unique_id: platform_unique_id, text: err.message }, null);
        }
    }
};

export async function restorePlatformAssessmentQuestion(req, res) {
    const platform_unique_id = req.PLATFORM_UNIQUE_ID;
    const platform_user_unique_id = req.PLATFORM_USER_UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: platform_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            const question = await db.sequelize.transaction((t) => {
                return QUESTIONS.update({
                    platform_user_unique_id,
                    status: default_status
                }, {
                    where: {
                        unique_id: payload.unique_id,
                        platform_unique_id,
                        assessment_unique_id: payload.assessment_unique_id,
                        status: default_delete_status
                    }
                }, { transaction: t });
            });

            if (question > 0) {
                const platform_notification_data = {
                    platform_unique_id,
                    type: "Question",
                    action: "Restored question successfully!"
                };
                addPlatformNotification(req, res, platform_notification_data);
                OtherSuccessResponse(res, { unique_id: platform_unique_id, text: "Question was restored successfully!" });
            } else {
                throw new Error("Error restoring question!");
            }
        } catch (err) {
            ServerError(res, { unique_id: platform_unique_id, text: err.message }, null);
        }
    }
};

export async function deletePlatformAssessmentQuestion(req, res) {
    const platform_unique_id = req.PLATFORM_UNIQUE_ID;
    const platform_user_unique_id = req.PLATFORM_USER_UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: platform_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            const question = await db.sequelize.transaction((t) => {
                return QUESTIONS.destroy({
                    where: {
                        unique_id: payload.unique_id,
                        platform_unique_id,
                        assessment_unique_id: payload.assessment_unique_id,
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (question > 0) {
                const platform_notification_data = {
                    platform_unique_id,
                    type: "Question",
                    action: "Deleted question successfully!"
                };
                addPlatformNotification(req, res, platform_notification_data);
                OtherSuccessResponse(res, { unique_id: platform_unique_id, text: "Question was deleted successfully!" });
            } else {
                throw new Error("Error deleting question!");
            }
        } catch (err) {
            ServerError(res, { unique_id: platform_unique_id, text: err.message }, null);
        }
    }
};
