import { validationResult, matchedData } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, CreationSuccessResponse, logger } from '../common/index.js';
import { default_delete_status, default_status, false_status, tag_admin, true_status } from '../config/config.js';
import db from "../models/index.js";
import { addPlatformNotification } from './platformNotifications.controller.js';

const ANSWERS = db.answers;
const QUESTIONS = db.questions;
const PLATFORMS = db.platforms;
const PLATFORM_USERS = db.platform_users;
const Op = db.Sequelize.Op;

export function rootGetAnswers(req, res) {
    ANSWERS.findAndCountAll({
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
                model: QUESTIONS,
                attributes: ['question', 'order', 'multiple_answer']
            },
        ]
    }).then(answers => {
        if (!answers || answers.length == 0) {
            SuccessResponse(res, { unique_id: tag_admin, text: "Answers Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: tag_admin, text: "Answers loaded" }, answers);
        }
    }).catch(err => {
        ServerError(res, { unique_id: tag_admin, text: err.message }, null);
    });
};

export function rootGetQuestionAnswers(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    }
    else {
        ANSWERS.findAndCountAll({
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
                    model: QUESTIONS,
                    attributes: ['question', 'order', 'multiple_answer']
                },
            ]
        }).then(answers => {
            if (!answers || answers.length == 0) {
                SuccessResponse(res, { unique_id: tag_admin, text: "Answers Not found" }, []);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "Answers loaded" }, answers);
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export function rootGetQuestionAnswer(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    }
    else {
        ANSWERS.findOne({
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
                    model: QUESTIONS,
                    attributes: ['question', 'order', 'multiple_answer']
                },
            ]
        }).then(answer => {
            if (!answer) {
                NotFoundError(res, { unique_id: tag_admin, text: "Answer not found" }, null);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "Answer loaded" }, answer);
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export function getPlatformQuestionAnswers(req, res) {
    const platform_unique_id = req.PLATFORM_UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: platform_unique_id, text: "Validation Error Occured" }, errors.array())
    }
    else {
        ANSWERS.findAndCountAll({
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
                    model: QUESTIONS,
                    attributes: ['question', 'order', 'multiple_answer']
                },
            ]
        }).then(answers => {
            if (!answers || answers.length == 0) {
                SuccessResponse(res, { unique_id: platform_unique_id, text: "Answers Not found" }, []);
            } else {
                SuccessResponse(res, { unique_id: platform_unique_id, text: "Answers loaded" }, answers);
            }
        }).catch(err => {
            ServerError(res, { unique_id: platform_unique_id, text: err.message }, null);
        });
    }
};

export function getPlatformQuestionAnswer(req, res) {
    const platform_unique_id = req.PLATFORM_UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: platform_unique_id, text: "Validation Error Occured" }, errors.array())
    }
    else {
        ANSWERS.findOne({
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
                    model: QUESTIONS,
                    attributes: ['question', 'order', 'multiple_answer']
                },
            ]
        }).then(answer => {
            if (!answer) {
                NotFoundError(res, { unique_id: platform_unique_id, text: "Answer not found" }, null);
            } else {
                SuccessResponse(res, { unique_id: platform_unique_id, text: "Answer loaded" }, answer);
            }
        }).catch(err => {
            ServerError(res, { unique_id: platform_unique_id, text: err.message }, null);
        });
    }
};

export async function addPlatformQuestionAnswer(req, res) {
    const platform_unique_id = req.PLATFORM_UNIQUE_ID;
    const platform_user_unique_id = req.PLATFORM_USER_UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: platform_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            const answer_count = await ANSWERS.count({ where: { platform_unique_id, question_unique_id: payload.question_unique_id } });
            const next_order = answer_count + 1;

            const answers = await db.sequelize.transaction((t) => {
                return ANSWERS.create({
                    unique_id: uuidv4(),
                    platform_unique_id,
                    platform_user_unique_id,
                    ...payload,
                    order: next_order,
                    status: default_status
                }, { transaction: t });
            });

            if (answers) {
                const platform_notification_data = {
                    platform_unique_id,
                    type: "Answer",
                    action: "Created new answer successfully!"
                };
                addPlatformNotification(req, res, platform_notification_data);
                CreationSuccessResponse(res, { unique_id: platform_unique_id, text: "Answer created successfully!" });
            }
        } catch (err) {
            ServerError(res, { unique_id: platform_unique_id, text: err.message }, null);
        }
    }
};

export async function updatePlatformQuestionAnswerDetails(req, res) {
    const platform_unique_id = req.PLATFORM_UNIQUE_ID;
    const platform_user_unique_id = req.PLATFORM_USER_UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: platform_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            const answer = await db.sequelize.transaction((t) => {
                return ANSWERS.update({
                    platform_user_unique_id,
                    ...payload
                }, {
                    where: {
                        unique_id: payload.unique_id,
                        platform_unique_id,
                        question_unique_id: payload.question_unique_id,
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (answer > 0) {
                const platform_notification_data = {
                    platform_unique_id,
                    type: "Answer",
                    action: "Updated answer details successfully!"
                };
                addPlatformNotification(req, res, platform_notification_data);
                OtherSuccessResponse(res, { unique_id: platform_unique_id, text: "Answer was updated successfully!" });
            } else {
                throw new Error("Error updating answer details!");
            }
        } catch (err) {
            ServerError(res, { unique_id: platform_unique_id, text: err.message }, null);
        }
    }
};

export async function updatePlatformQuestionAnswerCriteria(req, res) {
    const platform_unique_id = req.PLATFORM_UNIQUE_ID;
    const platform_user_unique_id = req.PLATFORM_USER_UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: platform_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            const question_details = await QUESTIONS.findOne({
                attributes: ['multiple_answer'],
                where: {
                    unique_id: payload.question_unique_id,
                    platform_unique_id
                }
            });

            const answer_details = await ANSWERS.findOne({
                attributes: ['answer'],
                where: {
                    question_unique_id: payload.question_unique_id,
                    platform_unique_id,
                    answer: true_status
                }
            });

            if (!payload.answer) {
                if (answer_details) {
                    const answer = await db.sequelize.transaction((t) => {
                        return ANSWERS.update({
                            platform_user_unique_id,
                            ...payload
                        }, {
                            where: {
                                unique_id: payload.unique_id,
                                platform_unique_id,
                                question_unique_id: payload.question_unique_id,
                                status: default_status
                            }
                        }, { transaction: t });
                    });

                    if (answer > 0) {
                        const platform_notification_data = {
                            platform_unique_id,
                            type: "Answer",
                            action: "Updated answer criteria successfully!"
                        };
                        addPlatformNotification(req, res, platform_notification_data);
                        OtherSuccessResponse(res, { unique_id: platform_unique_id, text: "Answer was updated successfully!" });
                    } else {
                        throw new Error("Error updating answer criteria!");
                    }
                } else {
                    throw new Error("Error updating answer criteria, no answer selected for question!");
                }
            } else {
                if (!question_details['dataValues'].multiple_answer && answer_details) {
                    throw new Error("Error updating answer criteria, question doesn't accept multiple answers!");
                } else if (question_details['dataValues'].multiple_answer) {
                    const answer = await db.sequelize.transaction((t) => {
                        return ANSWERS.update({
                            platform_user_unique_id,
                            ...payload
                        }, {
                            where: {
                                unique_id: payload.unique_id,
                                platform_unique_id,
                                question_unique_id: payload.question_unique_id,
                                status: default_status
                            }
                        }, { transaction: t });
                    });

                    if (answer > 0) {
                        const platform_notification_data = {
                            platform_unique_id,
                            type: "Answer",
                            action: "Updated answer criteria successfully!"
                        };
                        addPlatformNotification(req, res, platform_notification_data);
                        OtherSuccessResponse(res, { unique_id: platform_unique_id, text: "Answer was updated successfully!" });
                    } else {
                        throw new Error("Error updating answer criteria!");
                    }
                } else {
                    const not_answer = await db.sequelize.transaction((t) => {
                        return ANSWERS.update({
                            platform_user_unique_id,
                            answer: false_status
                        }, {
                            where: {
                                unique_id: {
                                    [Op.ne]: payload.unique_id,
                                },
                                platform_unique_id,
                                question_unique_id: payload.question_unique_id,
                                status: default_status
                            }
                        }, { transaction: t });
                    });

                    const answer = await db.sequelize.transaction((t) => {
                        return ANSWERS.update({
                            platform_user_unique_id,
                            ...payload
                        }, {
                            where: {
                                unique_id: payload.unique_id,
                                platform_unique_id,
                                question_unique_id: payload.question_unique_id,
                                status: default_status
                            }
                        }, { transaction: t });
                    });

                    if (answer > 0) {
                        const platform_notification_data = {
                            platform_unique_id,
                            type: "Answer",
                            action: "Updated answer criteria successfully!"
                        };
                        addPlatformNotification(req, res, platform_notification_data);
                        OtherSuccessResponse(res, { unique_id: platform_unique_id, text: "Answer was updated successfully!" });
                    } else {
                        throw new Error("Error updating answer criteria!");
                    }
                }
            }
        } catch (err) {
            ServerError(res, { unique_id: platform_unique_id, text: err.message }, null);
        }
    }
};

export async function updatePlatformQuestionAnswerOrder(req, res) {
    const platform_unique_id = req.PLATFORM_UNIQUE_ID;
    const platform_user_unique_id = req.PLATFORM_USER_UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: platform_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            const replace_answer = await ANSWERS.findOne({
                attributes: ['unique_id', 'order'],
                where: {
                    platform_unique_id,
                    question_unique_id: payload.question_unique_id,
                    order: payload.order,
                    status: default_status
                }
            });
            const recent_answer = await ANSWERS.findOne({
                attributes: ['unique_id', 'order'],
                where: {
                    unique_id: payload.unique_id,
                    platform_unique_id,
                    question_unique_id: payload.question_unique_id,
                    status: default_status
                }
            });

            if (!replace_answer) {
                const reorder_recent_answer = await db.sequelize.transaction((t) => {
                    return ANSWERS.update({
                        platform_user_unique_id,
                        order: payload.order,
                    }, {
                        where: {
                            unique_id: payload.unique_id,
                            platform_unique_id,
                            question_unique_id: payload.question_unique_id,
                            status: default_status
                        }
                    }, { transaction: t });
                });

                if (reorder_recent_answer > 0) {
                    const platform_notification_data = {
                        platform_unique_id,
                        type: "Answer",
                        action: "Updated answer ordering successfully!",
                        details: "Replaced ordering not found in range"
                    };
                    addPlatformNotification(req, res, platform_notification_data);
                    OtherSuccessResponse(res, { unique_id: platform_unique_id, text: "Answer was reordered successfully!" });
                } else {
                    throw new Error("Error reordering answers!");
                }
            } else if (replace_answer['dataValues'].unique_id === payload.unique_id) {
                const platform_notification_data = {
                    platform_unique_id,
                    type: "Answer",
                    action: "Retained answer ordering successfully!"
                };
                addPlatformNotification(req, res, platform_notification_data);
                OtherSuccessResponse(res, { unique_id: platform_unique_id, text: "Answer ordering was retained successfully!" });
            } else if (replace_answer && recent_answer) {
                const reorder_replace_answer = await db.sequelize.transaction((t) => {
                    return ANSWERS.update({
                        platform_user_unique_id,
                        order: recent_answer['dataValues'].order
                    }, {
                        where: {
                            unique_id: replace_answer['dataValues'].unique_id,
                            platform_unique_id,
                            question_unique_id: payload.question_unique_id,
                            status: default_status
                        }
                    }, { transaction: t });
                });
                const reorder_recent_answer = await db.sequelize.transaction((t) => {
                    return ANSWERS.update({
                        platform_user_unique_id,
                        order: replace_answer['dataValues'].order
                    }, {
                        where: {
                            unique_id: recent_answer['dataValues'].unique_id,
                            platform_unique_id,
                            question_unique_id: payload.question_unique_id,
                            status: default_status
                        }
                    }, { transaction: t });
                });

                if (reorder_replace_answer > 0 && reorder_recent_answer > 0) {
                    const platform_notification_data = {
                        platform_unique_id,
                        type: "Answer",
                        action: "Updated answer ordering successfully!"
                    };
                    addPlatformNotification(req, res, platform_notification_data);
                    OtherSuccessResponse(res, { unique_id: platform_unique_id, text: "Answer was reordered successfully!" });
                } else {
                    throw new Error("Error reordering answers!");
                }
            } else {
                throw new Error("Error getting replacement answer!");
            }
        } catch (err) {
            ServerError(res, { unique_id: platform_unique_id, text: err.message }, null);
        }
    }
};

export async function removePlatformQuestionAnswer(req, res) {
    const platform_unique_id = req.PLATFORM_UNIQUE_ID;
    const platform_user_unique_id = req.PLATFORM_USER_UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: platform_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            const answer = await db.sequelize.transaction((t) => {
                return ANSWERS.update({
                    platform_user_unique_id,
                    status: default_delete_status
                }, {
                    where: {
                        unique_id: payload.unique_id,
                        platform_unique_id,
                        question_unique_id: payload.question_unique_id,
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (answer > 0) {
                const platform_notification_data = {
                    platform_unique_id,
                    type: "Answer",
                    action: "Removed answer successfully!"
                };
                addPlatformNotification(req, res, platform_notification_data);
                OtherSuccessResponse(res, { unique_id: platform_unique_id, text: "Answer was removed successfully!" });
            } else {
                throw new Error("Error removing answer!");
            }
        } catch (err) {
            ServerError(res, { unique_id: platform_unique_id, text: err.message }, null);
        }
    }
};

export async function restorePlatformQuestionAnswer(req, res) {
    const platform_unique_id = req.PLATFORM_UNIQUE_ID;
    const platform_user_unique_id = req.PLATFORM_USER_UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: platform_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            const answer = await db.sequelize.transaction((t) => {
                return ANSWERS.update({
                    platform_user_unique_id,
                    status: default_status
                }, {
                    where: {
                        unique_id: payload.unique_id,
                        platform_unique_id,
                        question_unique_id: payload.question_unique_id,
                        status: default_delete_status
                    }
                }, { transaction: t });
            });

            if (answer > 0) {
                const platform_notification_data = {
                    platform_unique_id,
                    type: "Answer",
                    action: "Restored answer successfully!"
                };
                addPlatformNotification(req, res, platform_notification_data);
                OtherSuccessResponse(res, { unique_id: platform_unique_id, text: "Answer was restored successfully!" });
            } else {
                throw new Error("Error restoring answer!");
            }
        } catch (err) {
            ServerError(res, { unique_id: platform_unique_id, text: err.message }, null);
        }
    }
};

export async function deletePlatformQuestionAnswer(req, res) {
    const platform_unique_id = req.PLATFORM_UNIQUE_ID;
    const platform_user_unique_id = req.PLATFORM_USER_UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: platform_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            const answer = await db.sequelize.transaction((t) => {
                return ANSWERS.destroy({
                    where: {
                        unique_id: payload.unique_id,
                        platform_unique_id,
                        question_unique_id: payload.question_unique_id,
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (answer > 0) {
                const platform_notification_data = {
                    platform_unique_id,
                    type: "Answer",
                    action: "Deleted answer successfully!"
                };
                addPlatformNotification(req, res, platform_notification_data);
                OtherSuccessResponse(res, { unique_id: platform_unique_id, text: "Answer was deleted successfully!" });
            } else {
                throw new Error("Error deleting answer!");
            }
        } catch (err) {
            ServerError(res, { unique_id: platform_unique_id, text: err.message }, null);
        }
    }
};
