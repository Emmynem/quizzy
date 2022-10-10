import { validationResult, matchedData } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, CreationSuccessResponse, logger } from '../common/index.js';
import { default_delete_status, default_status, tag_admin, random_uuid, strip_text, save_document_domain, default_assessment_image } from '../config/config.js';
import db from "../models/index.js";
import { addPlatformNotification } from './platformNotifications.controller.js';

const ASSESSMENTS = db.assessments;
const PLATFORMS = db.platforms;
const PLATFORM_USERS = db.platform_users;

export function rootGetAssessments(req, res) {
    ASSESSMENTS.findAndCountAll({
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
            }
        ]
    }).then(assessments => {
        if (!assessments || assessments.length == 0) {
            SuccessResponse(res, { unique_id: tag_admin, text: "Assessments Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: tag_admin, text: "Assessments loaded" }, assessments);
        }
    }).catch(err => {
        ServerError(res, { unique_id: tag_admin, text: err.message }, null);
    });
};

export function rootGetAssessment(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    }
    else {
        ASSESSMENTS.findOne({
            attributes: { exclude: ['id'] },
            where: {
                unique_id: payload.assessment_unique_id
            },
            include: [
                {
                    model: PLATFORMS,
                    attributes: ['name', 'stripped', 'email', 'profile_image', 'pro']
                },
                {
                    model: PLATFORM_USERS,
                    attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number']
                }
            ]
        }).then(assessment => {
            if (!assessment) {
                NotFoundError(res, { unique_id: tag_admin, text: "Assessment not found" }, null);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "Assessment loaded" }, assessment);
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export function getPlatformAssessments(req, res) {
    const platform_unique_id = req.PLATFORM_UNIQUE_ID;

    ASSESSMENTS.findAndCountAll({
        attributes: { exclude: ['platform_unique_id', 'background_image_base_url', 'background_image_dir', 'background_image_file', 'background_image_size', 'id'] },
        where: {
            platform_unique_id
        },
        order: [
            ['createdAt', 'DESC']
        ],
        include: [
            {
                model: PLATFORM_USERS,
                attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number']
            }
        ]
    }).then(assessments => {
        if (!assessments || assessments.length == 0) {
            SuccessResponse(res, { unique_id: platform_unique_id, text: "Assessments Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: platform_unique_id, text: "Assessments loaded" }, assessments);
        }
    }).catch(err => {
        ServerError(res, { unique_id: platform_unique_id, text: err.message }, null);
    });
};

export function getPlatformAssessment(req, res) {
    const platform_unique_id = req.PLATFORM_UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: platform_unique_id, text: "Validation Error Occured" }, errors.array())
    }
    else {
        ASSESSMENTS.findOne({
            attributes: { exclude: ['platform_unique_id', 'background_image_base_url', 'background_image_dir', 'background_image_file', 'background_image_size', 'id'] },
            where: {
                ...payload,
                platform_unique_id
            },
            include: [
                {
                    model: PLATFORM_USERS,
                    attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number']
                }
            ]
        }).then(assessment => {
            if (!assessment) {
                NotFoundError(res, { unique_id: platform_unique_id, text: "Assessment not found" }, null);
            } else {
                SuccessResponse(res, { unique_id: platform_unique_id, text: "Assessment loaded" }, assessment);
            }
        }).catch(err => {
            ServerError(res, { unique_id: platform_unique_id, text: err.message }, null);
        });
    }
};

export async function addPlatformAssessment(req, res) {
    const platform_unique_id = req.PLATFORM_UNIQUE_ID;
    const platform_user_unique_id = req.PLATFORM_USER_UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: platform_unique_id, text: "Validation Error Occured" }, errors.array())
    }
    else {
        try {
            const assessments = await db.sequelize.transaction((t) => {
                return ASSESSMENTS.create({
                    unique_id: uuidv4(),
                    platform_unique_id,
                    platform_user_unique_id,
                    name: payload.name,
                    stripped: strip_text(payload.name),
                    identifier: random_uuid(5),
                    description: payload.description,
                    background_image_base_url: save_document_domain,
                    background_image_dir: "/resources/images/",
                    background_image: default_assessment_image,
                    candidate_limit: payload.candidate_limit,
                    private: payload.private,
                    start: payload.start,
                    end: payload.end,
                    duration: payload.duration,
                    retakes: payload.retakes,
                    status: default_status
                }, { transaction: t });
            });

            if (assessments) {
                const platform_notification_data = {
                    platform_unique_id,
                    type: "Assessment",
                    action: "Created new assessment successfully!"
                };
                addPlatformNotification(req, res, platform_notification_data);
                CreationSuccessResponse(res, { unique_id: platform_unique_id, text: "Assessment created successfully!" });
            }
        } catch (err) {
            ServerError(res, { unique_id: platform_unique_id, text: err.message }, null);
        }
    }
};

export async function updatePlatformAssessmentDetails(req, res) {
    const platform_unique_id = req.PLATFORM_UNIQUE_ID;
    const platform_user_unique_id = req.PLATFORM_USER_UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: platform_unique_id, text: "Validation Error Occured" }, errors.array())
    }
    else {
        try {
            const assessment = await db.sequelize.transaction((t) => {
                return ASSESSMENTS.update({ 
                    platform_user_unique_id,
                    name: payload.name,
                    stripped: strip_text(payload.name),
                    description: payload.description,
                 }, {
                    where: {
                        unique_id: payload.unique_id,
                        platform_unique_id,
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (assessment > 0) {
                const platform_notification_data = {
                    platform_unique_id,
                    type: "Assessment",
                    action: "Updated assessment details successfully!"
                };
                addPlatformNotification(req, res, platform_notification_data);
                OtherSuccessResponse(res, { unique_id: platform_unique_id, text: "Assessment was updated successfully!" });
            } else {
                throw new Error("Error updating assessment!");
            }
        } catch (err) {
            ServerError(res, { unique_id: platform_unique_id, text: err.message }, null);
        }
    }
};

export async function updatePlatformAssessmentPrivacy(req, res) {
    const platform_unique_id = req.PLATFORM_UNIQUE_ID;
    const platform_user_unique_id = req.PLATFORM_USER_UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: platform_unique_id, text: "Validation Error Occured" }, errors.array())
    }
    else {
        try {
            const assessment = await db.sequelize.transaction((t) => {
                return ASSESSMENTS.update({
                    platform_user_unique_id,
                    ...payload
                }, {
                    where: {
                        unique_id: payload.unique_id,
                        platform_unique_id,
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (assessment > 0) {
                const platform_notification_data = {
                    platform_unique_id,
                    type: "Assessment",
                    action: "Updated assessment privacy successfully!"
                };
                addPlatformNotification(req, res, platform_notification_data);
                OtherSuccessResponse(res, { unique_id: platform_unique_id, text: "Assessment was updated successfully!" });
            } else {
                throw new Error("Error updating assessment privacy!");
            }
        } catch (err) {
            ServerError(res, { unique_id: platform_unique_id, text: err.message }, null);
        }
    }
};

export async function updatePlatformAssessmentTimeline(req, res) {
    const platform_unique_id = req.PLATFORM_UNIQUE_ID;
    const platform_user_unique_id = req.PLATFORM_USER_UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: platform_unique_id, text: "Validation Error Occured" }, errors.array())
    }
    else {
        try {
            const assessment = await db.sequelize.transaction((t) => {
                return ASSESSMENTS.update({
                    platform_user_unique_id,
                    ...payload
                }, {
                    where: {
                        unique_id: payload.unique_id,
                        platform_unique_id,
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (assessment > 0) {
                const platform_notification_data = {
                    platform_unique_id,
                    type: "Assessment",
                    action: "Updated assessment timeline successfully!"
                };
                addPlatformNotification(req, res, platform_notification_data);
                OtherSuccessResponse(res, { unique_id: platform_unique_id, text: "Assessment was updated successfully!" });
            } else {
                throw new Error("Error updating assessment timeline!");
            }
        } catch (err) {
            ServerError(res, { unique_id: platform_unique_id, text: err.message }, null);
        }
    }
};

export async function updatePlatformAssessmentCriteria(req, res) {
    const platform_unique_id = req.PLATFORM_UNIQUE_ID;
    const platform_user_unique_id = req.PLATFORM_USER_UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: platform_unique_id, text: "Validation Error Occured" }, errors.array())
    }
    else {
        try {
            const assessment = await db.sequelize.transaction((t) => {
                return ASSESSMENTS.update({
                    platform_user_unique_id,
                    ...payload
                }, {
                    where: {
                        unique_id: payload.unique_id,
                        platform_unique_id,
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (assessment > 0) {
                const platform_notification_data = {
                    platform_unique_id,
                    type: "Assessment",
                    action: "Updated assessment criteria successfully!"
                };
                addPlatformNotification(req, res, platform_notification_data);
                OtherSuccessResponse(res, { unique_id: platform_unique_id, text: "Assessment was updated successfully!" });
            } else {
                throw new Error("Error updating assessment criteria!");
            }
        } catch (err) {
            ServerError(res, { unique_id: platform_unique_id, text: err.message }, null);
        }
    }
};

export async function removePlatformAssessment(req, res) {
    const platform_unique_id = req.PLATFORM_UNIQUE_ID;
    const platform_user_unique_id = req.PLATFORM_USER_UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: platform_unique_id, text: "Validation Error Occured" }, errors.array())
    }
    else {
        try {
            const assessment = await db.sequelize.transaction((t) => {
                return ASSESSMENTS.update({
                    platform_user_unique_id,
                    status: default_delete_status
                }, {
                    where: {
                        unique_id: payload.unique_id,
                        platform_unique_id,
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (assessment > 0) {
                const platform_notification_data = {
                    platform_unique_id,
                    type: "Assessment",
                    action: "Removed assessment successfully!"
                };
                addPlatformNotification(req, res, platform_notification_data);
                OtherSuccessResponse(res, { unique_id: platform_unique_id, text: "Assessment was removed successfully!" });
            } else {
                throw new Error("Error removing assessment!");
            }
        } catch (err) {
            ServerError(res, { unique_id: platform_unique_id, text: err.message }, null);
        }
    }
};

export async function restorePlatformAssessment(req, res) {
    const platform_unique_id = req.PLATFORM_UNIQUE_ID;
    const platform_user_unique_id = req.PLATFORM_USER_UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: platform_unique_id, text: "Validation Error Occured" }, errors.array())
    }
    else {
        try {
            const assessment = await db.sequelize.transaction((t) => {
                return ASSESSMENTS.update({
                    platform_user_unique_id,
                    status: default_status
                }, {
                    where: {
                        unique_id: payload.unique_id,
                        platform_unique_id,
                        status: default_delete_status
                    }
                }, { transaction: t });
            });

            if (assessment > 0) {
                const platform_notification_data = {
                    platform_unique_id,
                    type: "Assessment",
                    action: "Restored assessment successfully!"
                };
                addPlatformNotification(req, res, platform_notification_data);
                OtherSuccessResponse(res, { unique_id: platform_unique_id, text: "Assessment was restored successfully!" });
            } else {
                throw new Error("Error restoring assessment!");
            }
        } catch (err) {
            ServerError(res, { unique_id: platform_unique_id, text: err.message }, null);
        }
    }
};

export async function deletePlatformAssessment(req, res) {
    const platform_unique_id = req.PLATFORM_UNIQUE_ID;
    const platform_user_unique_id = req.PLATFORM_USER_UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: platform_unique_id, text: "Validation Error Occured" }, errors.array())
    }
    else {
        try {
            const assessment = await db.sequelize.transaction((t) => {
                return ASSESSMENTS.destroy({
                    where: {
                        unique_id: payload.unique_id,
                        platform_unique_id,
                        status: default_status
                    } 
                }, { transaction: t });
            });

            if (assessment > 0) {
                const platform_notification_data = {
                    platform_unique_id,
                    type: "Assessment",
                    action: "Deleted assessment successfully!"
                };
                addPlatformNotification(req, res, platform_notification_data);
                OtherSuccessResponse(res, { unique_id: platform_unique_id, text: "Assessment was deleted successfully!" });
            } else {
                throw new Error("Error deleting assessment!");
            }
        } catch (err) {
            ServerError(res, { unique_id: platform_unique_id, text: err.message }, null);
        }
    }
};
