import { validationResult, matchedData } from 'express-validator';
import moment from 'moment';
import fs from "fs";
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, logger } from '../common/index.js';
import { access_granted, access_revoked, access_suspended, default_delete_status, default_status, false_status, true_status, tag_admin, documents_path } from '../config/config.js';
import db from "../models/index.js";
import { addPlatformNotification } from './platformNotifications.controller.js';

const PLATFORMS = db.platforms;
const PLATFORM_USERS = db.platform_users;
const ASSESSMENTS = db.assessments;
const QUESTIONS = db.questions;
const ANSWERS = db.answers;
const OTPS = db.otps;
const PLATFORM_NOTIFICATIONS = db.platform_notifications;
const Op = db.Sequelize.Op;

const { existsSync, rmdirSync } = fs;

export function rootGetPlatforms (req, res) {
    PLATFORMS.findAndCountAll({
        attributes: { exclude: ['live_api_key', 'id'] },
        order: [
            ['createdAt', 'DESC']
        ]
    }).then(users => {
        if (!users || users.length == 0) {
            SuccessResponse(res, { unique_id: tag_admin, text: "Platforms Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: tag_admin, text: "Platforms loaded" }, users);
        }
    }).catch(err => {
        ServerError(res, { unique_id: tag_admin, text: err.message }, null);
    });
};

export function rootGetPlatform (req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    }
    else {
        PLATFORMS.findOne({
            attributes: { exclude: ['live_api_key', 'id'] },
            where: {
                ...payload
            }
        }).then(user => {
            if (!user) {
                NotFoundError(res, { unique_id: tag_admin, text: "Platform not found" }, null);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "Platform loaded" }, user);
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export function getPlatform(req, res) {
    const platform_unique_id = req.PLATFORM_UNIQUE_ID;

    PLATFORMS.findOne({
        attributes: { exclude: ['unique_id', 'profile_image_base_url', 'profile_image_dir', 'profile_image_file', 'profile_image_size', 'id', 'access'] },
        where: {
            platform_unique_id,
            status: default_status
        }
    }).then(platform => {
        if (!platform) {
            NotFoundError(res, { unique_id: platform_unique_id, text: "Platform not found" }, null);
        } else {
            SuccessResponse(res, { unique_id: platform_unique_id, text: "Platform loaded" }, platform);
        }
    }).catch(err => {
        ServerError(res, { unique_id: platform_unique_id, text: err.message }, null);
    });
};

export async function updatePlatform(req, res) {
    const platform_unique_id = req.PLATFORM_UNIQUE_ID || payload.unique_id || '';
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: platform_unique_id, text: "Validation Error Occured" }, errors.array())
    }
    else {
        try {
            const platform = await db.sequelize.transaction((t) => {
                return PLATFORMS.update({ ...payload }, {
                    where: {
                        unique_id: platform_unique_id,
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (platform > 0) {
                const notification_data = {
                    platform_unique_id,
                    type: "Personal",
                    action: "Updated profile details!"
                };
                addPlatformNotification(req, res, notification_data);
                SuccessResponse(res, { unique_id: platform_unique_id, text: "Platform details updated successfully!" }, platform);
            } else {
                throw new Error("Platform not found!");
            }
        } catch (err) {
            ServerError(res, { unique_id: platform_unique_id, text: err.message }, null);
        }
    }
};

export async function updatePlatformAccessGranted(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, `${tag_admin} | updatePlatformAccessGranted | Validation Error Occured`, errors.array())
    }
    else {
        try {
            const platform = await db.sequelize.transaction((t) => {
                return PLATFORMS.update({
                    access: access_granted
                }, {
                    where: {
                        ...payload,
                        access: {
                            [Op.ne]: access_granted
                        },
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (platform > 0) {
                const platform_users = await db.sequelize.transaction((t) => {
                    return PLATFORM_USERS.update({
                        access: access_granted
                    }, {
                        where: {
                            platform_unique_id : payload.unique_id,
                            access: {
                                [Op.ne]: access_granted
                            },
                            status: default_status
                        }
                    }, { transaction: t });
                });

                const notification_data = {
                    platform_unique_id: payload.unique_id,
                    type: "Access",
                    action: "Account access was granted!"
                };
                addPlatformNotification(req, res, notification_data);

                SuccessResponse(res, { unique_id: tag_admin + " | " + payload.unique_id, text: "Platform's access was granted successfully!" });
            } else {
                throw new Error("Platform access already granted!");
            }
        } catch (err) {
            ServerError(res, { unique_id: tag_admin + " | " + payload.unique_id, text: err.message }, null);
        }
    }
};

export async function updatePlatformAccessSuspended(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, `${tag_admin} | updatePlatformAccessSuspended | Validation Error Occured`, errors.array())
    }
    else {
        try {
            const platform = await db.sequelize.transaction((t) => {
                return PLATFORMS.update({
                    access: access_suspended
                }, {
                    where: {
                        ...payload,
                        access: {
                            [Op.ne]: access_suspended
                        },
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (platform > 0) {
                const platform_users = await db.sequelize.transaction((t) => {
                    return PLATFORM_USERS.update({
                        access: access_suspended
                    }, {
                        where: {
                            platform_unique_id: payload.unique_id,
                            access: {
                                [Op.ne]: access_suspended
                            },
                            status: default_status
                        }
                    }, { transaction: t });
                });

                const notification_data = {
                    platform_unique_id: payload.unique_id,
                    type: "Access",
                    action: "Account access was suspended!"
                };
                addPlatformNotification(req, res, notification_data);

                SuccessResponse(res, { unique_id: tag_admin + " | " + payload.unique_id, text: "Platform's access was suspended successfully!" });
            } else {
                throw new Error("Platform access already suspended!");
            }
        } catch (err) {
            ServerError(res, { unique_id: tag_admin + " | " + payload.unique_id, text: err.message }, null);
        }
    }
};

export async function updatePlatformAccessRevoked(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, `${tag_admin} | updatePlatformAccessRevoked | Validation Error Occured`, errors.array())
    }
    else {
        try {
            const platform = await db.sequelize.transaction((t) => {
                return PLATFORMS.update({
                    access: access_revoked
                }, {
                    where: {
                        ...payload,
                        access: {
                            [Op.ne]: access_revoked
                        },
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (platform > 0) {
                const platform_users = await db.sequelize.transaction((t) => {
                    return PLATFORM_USERS.update({
                        access: access_revoked
                    }, {
                        where: {
                            platform_unique_id: payload.unique_id,
                            access: {
                                [Op.ne]: access_revoked
                            },
                            status: default_status
                        }
                    }, { transaction: t });
                });
                
                const notification_data = {
                    platform_unique_id: payload.unique_id,
                    type: "Access",
                    action: "Account access was revoked!"
                };
                addPlatformNotification(req, res, notification_data);

                SuccessResponse(res, { unique_id: tag_admin + " | " + payload.unique_id, text: "Platform's access was revoked successfully!" });
            } else {
                throw new Error("Platform access already revoked!");
            }
        } catch (err) {
            ServerError(res, { unique_id: tag_admin + " | " + payload.unique_id, text: err.message }, null);
        }
    }
};

export async function proPlatformUpgrade(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, "proPlatformUpgrade | Validation Error Occured", errors.array())
    }
    else {
        try {
            const platform = await db.sequelize.transaction((t) => {
                return PLATFORMS.update({
                    pro: true_status,
                    pro_expiring: moment().day(30).toDate()
                }, {
                    where: {
                        ...payload,
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (platform > 0) {
                const notification_data = {
                    platform_unique_id: payload.unique_id,
                    type: "Subscription",
                    action: "Account was upgraded successfully!"
                };
                addPlatformNotification(req, res, notification_data);

                SuccessResponse(res, { unique_id: payload.unique_id, text: "Platform upgraded to pro successfully!" });
            } else {
                throw new Error("Platform account is actively upgraded!");
            }
        } catch (err) {
            ServerError(res, { unique_id: payload.unique_id, text: err.message }, null);
        }
    }
};

export async function proPlatformDowngrade(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, "proPlatformDowngrade | Validation Error Occured", errors.array())
    }
    else {
        try {
            const platform = await db.sequelize.transaction((t) => {
                return PLATFORMS.update({
                    pro: false_status,
                    pro_expiring: null
                }, {
                    where: {
                        ...payload,
                        status: default_status
                    }
                }, { transaction: t });
            })

            if (platform > 0) {
                const notification_data = {
                    platform_unique_id: payload.unique_id,
                    type: "Subscription",
                    action: "Account was downgraded successfully!"
                };
                addPlatformNotification(req, res, notification_data);

                SuccessResponse(res, { unique_id: payload.unique_id, text: "Platform downgraded from pro successfully!" });
            } else {
                throw new Error("Platform account is actively downgraded!");
            }
        } catch (err) {
            ServerError(res, { unique_id: payload.unique_id, text: err.message }, null);
        }
    }
};

export async function removePlatform(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, `${tag_admin} | removePlatform | Validation Error Occured`, errors.array())
    }
    else {
        try {
            const platform = await db.sequelize.transaction((t) => {
                return PLATFORMS.update({
                    status: default_delete_status
                }, {
                    where: {
                        ...payload,
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (platform > 0) {
                const platform_users = await db.sequelize.transaction((t) => {
                    return PLATFORM_USERS.update({
                        status: default_delete_status
                    }, {
                        where: {
                            platform_unique_id: payload.unique_id,
                            status: default_status
                        }
                    }, { transaction: t });
                });

                const assessments = await db.sequelize.transaction((t) => {
                    return ASSESSMENTS.update({
                        status: default_delete_status
                    }, {
                        where: {
                            platform_unique_id: payload.unique_id,
                            status: default_status
                        }
                    }, { transaction: t });
                });

                const questions = await db.sequelize.transaction((t) => {
                    return QUESTIONS.update({
                        status: default_delete_status
                    }, {
                        where: {
                            platform_unique_id: payload.unique_id,
                            status: default_status
                        }
                    }, { transaction: t });
                });

                const answers = await db.sequelize.transaction((t) => {
                    return ANSWERS.update({
                        status: default_delete_status
                    }, {
                        where: {
                            platform_unique_id: payload.unique_id,
                            status: default_status
                        }
                    }, { transaction: t });
                });

                SuccessResponse(res, { unique_id: tag_admin + " | " + payload.unique_id, text: "Platform removed successfully!" });
            } else {
                throw new Error("Platform not found!");
            }
        } catch (err) {
            ServerError(res, { unique_id: tag_admin + " | " + payload.unique_id, text: err.message }, null);
        }
    }
};

export async function restorePlatform(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, `${tag_admin} | restorePlatform | Validation Error Occured`, errors.array())
    }
    else {
        try {
            const platform = await db.sequelize.transaction((t) => {
                return PLATFORMS.update({
                    status: default_status
                }, {
                    where: {
                        ...payload,
                        status: default_delete_status
                    }
                }, { transaction: t });
            })

            if (platform > 0) {
                const platform_users = await db.sequelize.transaction((t) => {
                    return PLATFORM_USERS.update({
                        status: default_status
                    }, {
                        where: {
                            platform_unique_id: payload.unique_id,
                            status: default_delete_status
                        }
                    }, { transaction: t });
                });

                const assessments = await db.sequelize.transaction((t) => {
                    return ASSESSMENTS.update({
                        status: default_status
                    }, {
                        where: {
                            platform_unique_id: payload.unique_id,
                            status: default_delete_status
                        }
                    }, { transaction: t });
                });

                const questions = await db.sequelize.transaction((t) => {
                    return QUESTIONS.update({
                        status: default_status
                    }, {
                        where: {
                            platform_unique_id: payload.unique_id,
                            status: default_delete_status
                        }
                    }, { transaction: t });
                });

                const answers = await db.sequelize.transaction((t) => {
                    return ANSWERS.update({
                        status: default_status
                    }, {
                        where: {
                            platform_unique_id: payload.unique_id,
                            status: default_delete_status
                        }
                    }, { transaction: t });
                });
                
                SuccessResponse(res, { unique_id: tag_admin + " | " + payload.unique_id, text: "Platform restored successfully!" });
            } else {
                throw new Error("Platform not found!");
            }
        } catch (err) {
            ServerError(res, { unique_id: tag_admin + " | " + payload.unique_id, text: err.message }, null);
        }
    }
};

export async function removePlatformPermanently(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, `${tag_admin} | removePlatformPermanently | Validation Error Occured`, errors.array())
    }
    else {
        try {
            const answers = await db.sequelize.transaction((t) => { return ANSWERS.destroy({ where: { platform_unique_id: payload.unique_id } }, { transaction: t }) });
            const questions = await db.sequelize.transaction((t) => { return QUESTIONS.destroy({ where: { platform_unique_id: payload.unique_id } }, { transaction: t }) });
            const assessments = await db.sequelize.transaction((t) => { return ASSESSMENTS.destroy({ where: { platform_unique_id: payload.unique_id } }, { transaction: t }) });
            const otps = await db.sequelize.transaction((t) => { return OTPS.destroy({ where: { platform_unique_id: payload.unique_id } }, { transaction: t }) });
            const platform_notifications = await db.sequelize.transaction((t) => { return PLATFORM_NOTIFICATIONS.destroy({ where: { platform_unique_id: payload.unique_id } }, { transaction: t }) });
            const platform_users = await db.sequelize.transaction((t) => { return PLATFORM_USERS.destroy({ where: { platform_unique_id: payload.unique_id } }, { transaction: t }) });

            const affected_rows = answers + questions + assessments + otps + platform_notifications + platform_users;

            if (affected_rows > 0) {
                const action_2 = await db.sequelize.transaction((t) => {
                    const platforms = PLATFORMS.destroy({ where: { ...payload } }, { transaction: t })
                    return platforms;
                });

                if (action_2 > 0) {
                    const folder_name = documents_path + payload.unique_id;
                    if (existsSync(folder_name)) rmdirSync(folder_name);
                    if (!existsSync(folder_name)) {
                        logger.info(`Platform directory deleted successfully [${folder_name}]`)
                        OtherSuccessResponse(res, { unique_id: tag_admin + " | " + payload.unique_id, text: `Platform deleted permanently! ${affected_rows + action_2} rows affected.` })
                    };
                } else {
                    throw new Error("Platform not found!");
                }
            } else {
                const action_2 = await db.sequelize.transaction((t) => {
                    const platforms = PLATFORMS.destroy({ where: { ...payload } }, { transaction: t })
                    return platforms;
                });

                if (action_2 > 0) {
                    const folder_name = documents_path + payload.unique_id;
                    if (existsSync(folder_name)) rmdirSync(folder_name);
                    if (!existsSync(folder_name)) {
                        logger.info(`Platform directory deleted successfully [${folder_name}]`)
                        OtherSuccessResponse(res, { unique_id: tag_admin + " | " + payload.unique_id, text: `Platform deleted permanently! ${action_2} rows affected.` })
                    };
                } else {
                    throw new Error("Platform not found!");
                }
            }
        } catch (err) {
            ServerError(res, { unique_id: tag_admin + " | " + payload.unique_id, text: err.message }, null);
        }
    }
};