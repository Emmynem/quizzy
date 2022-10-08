import { validationResult, matchedData } from 'express-validator';
import moment from 'moment';
import fs from "fs";
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, logger } from '../common/index.js';
import { access_granted, access_revoked, access_suspended, default_delete_status, default_status, false_status, true_status, tag_admin, documents_path } from '../config/config.js';
import db from "../models/index.js";
import { addUserNotification } from './notifications.controller.js';

const USERS = db.users;
const LOGS = db.logs;
const NOTIFICATIONS = db.notifications;
const PRIVATES = db.privates;
const RESULTS = db.results;
const REVIEWS = db.reviews;
const USER_ASSESSMENTS = db.user_assessments;
const USER_BADGES = db.user_badges;
const Op = db.Sequelize.Op;

const { existsSync, rmdirSync } = fs;

export function rootGetUsers (req, res) {
    USERS.findAndCountAll({
        attributes: { exclude: ['user_private', 'id'] },
        order: [
            ['createdAt', 'DESC']
        ]
    }).then(users => {
        if (!users || users.length == 0) {
            SuccessResponse(res, { unique_id: tag_admin, text: "Users Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: tag_admin, text: "Users loaded" }, users);
        }
    }).catch(err => {
        ServerError(res, { unique_id: tag_admin, text: err.message }, null);
    });
};

export function rootGetUser (req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    }
    else {
        USERS.findOne({
            attributes: { exclude: ['user_private', 'id'] },
            where: {
                ...payload
            }
        }).then(user => {
            if (!user) {
                NotFoundError(res, { unique_id: tag_admin, text: "User not found" }, null);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "User loaded" }, user);
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export function getUser (req, res) {
    const user_unique_id = req.UNIQUE_ID;

    USERS.findOne({
        attributes: { exclude: ['user_private', 'profile_image_base_url', 'profile_image_dir', 'profile_image_file', 'profile_image_size', 'id', 'access'] },
        where: {
            user_unique_id,
            status: default_status
        }
    }).then(user => {
        if (!user) {
            NotFoundError(res, { unique_id: user_unique_id, text: "User not found"}, null);
        } else {
            SuccessResponse(res, { unique_id: user_unique_id, text: "User loaded" }, user);
        }
    }).catch(err => {
        ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
    });
};

export async function updateUser (req, res) {
    const user_unique_id = req.UNIQUE_ID || payload.unique_id || '';
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    }
    else {
        try {
            const user = await db.sequelize.transaction((t) => {
                return USERS.update({ ...payload }, {
                    where: {
                        unique_id: user_unique_id,
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (user > 0) {
                const notification_data = {
                    user_unique_id,
                    type: "Personal",
                    action: "Updated profile details!"
                };
                addUserNotification(req, res, notification_data);
                SuccessResponse(res, { unique_id: user_unique_id, text: "User details updated successfully!" }, user);
            } else {
                throw new Error("User not found!");
            }
        } catch (err) {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        }
    }
};

export async function updateUserEmailVerified (req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, "updateUserEmailVerified | Validation Error Occured", errors.array())
    }
    else {
        try {
            const user = await db.sequelize.transaction((t) => {
                return USERS.update({
                    email_verification: true_status
                }, {
                    where: {
                        ...payload,
                        email_verification: {
                            [Op.ne]: true_status
                        },
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (user > 0) {
                const notification_data = {
                    user_unique_id: payload.unique_id,
                    type: "Personal",
                    action: "Email was verified successfully!"
                };
                addUserNotification(req, res, notification_data);
                OtherSuccessResponse(res, { unique_id: payload.unique_id, text: "User email verified successfully!" });
            } else {
                throw new Error("User email verified already!");
            }
        } catch (err) {
            ServerError(res, { unique_id: payload.unique_id, text: err.message }, null);
        }
    }
};

export async function updateUserMobileNumberVerified (req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, "updateUserMobileNumberVerified | Validation Error Occured", errors.array())
    }
    else {
        try {
            const user = await db.sequelize.transaction((t) => {
                return USERS.update({
                    mobile_number_verification: true_status
                }, {
                    where: {
                        ...payload,
                        mobile_number_verification: {
                            [Op.ne]: true_status
                        },
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (user > 0) {
                const notification_data = {
                    user_unique_id: payload.unique_id,
                    type: "Personal",
                    action: "Mobile number was verified successfully!"
                };
                addUserNotification(req, res, notification_data);
                OtherSuccessResponse(res, { unique_id: payload.unique_id, text: "User mobile number verified successfully!" });
            } else {
                throw new Error("User mobile number verified already!");
            }
        } catch (err) {
            ServerError(res, { unique_id: payload.unique_id, text: err.message }, null);
        }
    }
};

export async function updateUserAccessGranted (req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, `${tag_admin} | updateUserAccessGranted | Validation Error Occured`, errors.array())
    }
    else {
        try {
            const user = await db.sequelize.transaction((t) => {
                return USERS.update({
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

            if (user > 0) {
                const notification_data = {
                    user_unique_id: payload.unique_id,
                    type: "Access",
                    action: "Account access was granted!"
                };
                addUserNotification(req, res, notification_data);
                SuccessResponse(res, { unique_id: tag_admin + " | " + payload.unique_id, text: "User's access was granted successfully!" });
            } else {
                throw new Error("User access already granted!");
            }
        } catch (err) {
            ServerError(res, { unique_id: tag_admin + " | " + payload.unique_id, text: err.message }, null);
        }
    }
};

export async function updateUserAccessSuspended (req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, `${tag_admin} | updateUserAccessSuspended | Validation Error Occured`, errors.array())
    }
    else {
        try {
            const user = await db.sequelize.transaction((t) => {
                return USERS.update({
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

            if (user > 0) {
                const notification_data = {
                    user_unique_id: payload.unique_id,
                    type: "Access",
                    action: "Account access was suspended!"
                };
                addUserNotification(req, res, notification_data);
                SuccessResponse(res, { unique_id: tag_admin + " | " + payload.unique_id, text: "User's access was suspended successfully!" });
            } else {
                throw new Error("User access already suspended!");
            }
        } catch (err) {
            ServerError(res, { unique_id: tag_admin + " | " + payload.unique_id, text: err.message }, null);
        }
    }
};

export async function updateUserAccessRevoked (req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, `${tag_admin} | updateUserAccessRevoked | Validation Error Occured`, errors.array())
    }
    else {
        try {
            const user = await db.sequelize.transaction((t) => {
                return USERS.update({
                    access: access_revoked
                }, {
                    where: {
                        ...payload,
                        access: {
                            [Op.ne] : access_revoked
                        },
                        status: default_status
                    }
                }, { transaction: t });
            });
            
            if (user > 0) {
                const notification_data = {
                    user_unique_id: payload.unique_id,
                    type: "Access",
                    action: "Account access was revoked!"
                };
                addUserNotification(req, res, notification_data);
                SuccessResponse(res, { unique_id: tag_admin + " | " + payload.unique_id, text: "User's access was revoked successfully!" });
            } else {
                throw new Error("User access already revoked!");
            }
        } catch (err) {
            ServerError(res, { unique_id: tag_admin + " | " + payload.unique_id, text: err.message }, null);
        }
    }
};

export async function proUserUpgrade (req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, "proUserUpgrade | Validation Error Occured", errors.array())
    }
    else {
        try {
            const user = await db.sequelize.transaction((t) => {
                return USERS.update({
                    pro: true_status,
                    pro_expiring: moment().day(30).toDate()
                }, {
                    where: {
                        ...payload,
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (user > 0) {
                const notification_data = {
                    user_unique_id: payload.unique_id,
                    type: "Subscription",
                    action: "Account was upgraded successfully!"
                };
                addUserNotification(req, res, notification_data);
                SuccessResponse(res, { unique_id: payload.unique_id, text: "User upgraded to pro successfully!" });
            } else {
                throw new Error("User account is actively upgraded!");
            }
        } catch (err) {
            ServerError(res, { unique_id: payload.unique_id, text: err.message }, null);
        }
    }
};

export async function proUserDowngrade (req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, "proUserDowngrade | Validation Error Occured", errors.array())
    }
    else {
        try {
            const user = await db.sequelize.transaction((t) => {
                return USERS.update({
                    pro: false_status,
                    pro_expiring: null
                }, {
                    where: {
                        ...payload,
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (user > 0) {
                const notification_data = {
                    user_unique_id: payload.unique_id,
                    type: "Subscription",
                    action: "Account was downgraded successfully!"
                };
                addUserNotification(req, res, notification_data);
                SuccessResponse(res, { unique_id: payload.unique_id, text: "User downgraded from pro successfully!" });
            } else {
                throw new Error("User account is actively downgraded!");
            }
        } catch (err) {
            ServerError(res, { unique_id: payload.unique_id, text: err.message }, null);
        }
    }
};

export async function removeUser (req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, `${tag_admin} | removeUser | Validation Error Occured`, errors.array())
    }
    else {
        try {
            const user = await db.sequelize.transaction((t) => {
                return USERS.update({
                    status: default_delete_status
                }, {
                    where: {
                        ...payload,
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (user > 0) {
                SuccessResponse(res, { unique_id: tag_admin + " | " + payload.unique_id, text: "User removed successfully!" });
            } else {
                throw new Error("User not found!");
            }
        } catch (err) {
            ServerError(res, { unique_id: tag_admin + " | " + payload.unique_id, text: err.message }, null);
        }
    }
};

export async function restoreUser (req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, `${tag_admin} | restoreUser | Validation Error Occured`, errors.array())
    }
    else {
        try {
            const user = await db.sequelize.transaction((t) => {
                return USERS.update({
                    status: default_status
                }, {
                    where: {
                        ...payload,
                        status: default_delete_status
                    }
                }, { transaction: t });
            });
            
            if (user > 0) {
                SuccessResponse(res, { unique_id: tag_admin + " | " + payload.unique_id, text: "User restored successfully!" });
            } else {
                throw new Error("User not found!");
            }
        } catch (err) {
            ServerError(res, { unique_id: tag_admin + " | " + payload.unique_id, text: err.message }, null);
        }
    }
};

export async function removeUserPermanently (req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, `${tag_admin} | removeUserPermanently | Validation Error Occured`, errors.array())
    }
    else {
        try {
            const logs = await db.sequelize.transaction((t) => { return LOGS.destroy({ where: { user_unique_id: payload.unique_id } }, { transaction: t }) });
            const notifications = await db.sequelize.transaction((t) => { return NOTIFICATIONS.destroy({ where: { user_unique_id: payload.unique_id } }, { transaction: t }) });
            const privates = await db.sequelize.transaction((t) => { return PRIVATES.destroy({ where: { user_unique_id: payload.unique_id } }, { transaction: t }) });
            const results = await db.sequelize.transaction((t) => { return RESULTS.destroy({ where: { user_unique_id: payload.unique_id } }, { transaction: t }) });
            const reviews = await db.sequelize.transaction((t) => { return REVIEWS.destroy({ where: { user_unique_id: payload.unique_id } }, { transaction: t }) });
            const user_assessments = await db.sequelize.transaction((t) => { return USER_ASSESSMENTS.destroy({ where: { user_unique_id: payload.unique_id } }, { transaction: t }) });
            const user_badges = await db.sequelize.transaction((t) => { return USER_BADGES.destroy({ where: { user_unique_id: payload.unique_id } }, { transaction: t }) });

            const affected_rows = logs + notifications + privates + results + reviews + user_assessments + user_badges;

            if (affected_rows > 0) {
                const action_2 = await db.sequelize.transaction((t) => { 
                    const users = USERS.destroy({ where: { ...payload } }, { transaction: t })
                    return users;
                });
    
                if (action_2 > 0) {
                    const folder_name = documents_path + payload.unique_id;
                    if (existsSync(folder_name)) rmdirSync(folder_name);
                    if (!existsSync(folder_name)) { 
                        logger.info(`User directory deleted successfully [${folder_name}]`)
                        OtherSuccessResponse(res, { unique_id: tag_admin + " | " + payload.unique_id, text: `User deleted permanently! ${affected_rows + action_2} rows affected.` })
                    };
                } else {
                    throw new Error("User not found!");
                }
            } else {
                const action_2 = await db.sequelize.transaction((t) => {
                    const users = USERS.destroy({ where: { ...payload } }, { transaction: t })
                    return users;
                });

                if (action_2 > 0) {
                    const folder_name = documents_path + payload.unique_id;
                    if (existsSync(folder_name)) rmdirSync(folder_name);
                    if (!existsSync(folder_name)) {
                        logger.info(`User directory deleted successfully [${folder_name}]`)
                        OtherSuccessResponse(res, { unique_id: tag_admin + " | " + payload.unique_id, text: `User deleted permanently! ${action_2} rows affected.` })
                    };
                } else {
                    throw new Error("User not found!");
                }
            }
        } catch (err) {
            ServerError(res, { unique_id: tag_admin + " | " + payload.unique_id, text: err.message }, null);
        }
    }
};