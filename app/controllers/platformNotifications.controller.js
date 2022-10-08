import { validationResult, matchedData } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, logger } from '../common/index.js';
import { check_length_TEXT, default_delete_status, default_status, false_status, tag_admin, true_status } from '../config/config.js';
import db from "../models/index.js";

const PLATFORM_NOTIFICATIONS = db.platform_notifications;
const PLATFORMS = db.platforms;

export function rootGetNotifications(req, res) {
    PLATFORM_NOTIFICATIONS.findAndCountAll({
        attributes: { exclude: ['id'] },
        order: [
            ['createdAt', 'DESC']
        ],
        include: [
            {
                model: PLATFORMS,
                attributes: ['name', 'stripped', 'email', 'profile_image', 'pro']
            }
        ],
    }).then(platform_notifications => {
        if (!platform_notifications || platform_notifications.length == 0) {
            SuccessResponse(res, { unique_id: tag_admin, text: "Platform notifications Not found" }, []);
        } else {
            PLATFORM_NOTIFICATIONS.count({ where: { seen: false_status } }).then(data => {
                SuccessResponse(res, { unique_id: tag_admin, text: "Platform notifications loaded" }, { ...platform_notifications, unread: data });
            });
        }
    }).catch(err => {
        ServerError(res, { unique_id: tag_admin, text: err.message }, null);
    });
};

export function getPlatformNotifications(req, res) {
    const platform_unique_id = req.PLATFORM_UNIQUE_ID;

    PLATFORM_NOTIFICATIONS.findAndCountAll({
        attributes: { exclude: ['id', 'platform_unique_id', 'updatedAt', 'status'] },
        where: {
            platform_unique_id,
            status: default_status
        },
        order: [
            ['createdAt', 'DESC']
        ]
    }).then(platform_notifications => {
        if (!platform_notifications || platform_notifications.length == 0) {
            SuccessResponse(res, { unique_id: platform_unique_id, text: "Platform notifications Not found" }, []);
        } else {
            PLATFORM_NOTIFICATIONS.count({ where: { platform_unique_id, seen: false_status, status: default_status } }).then(data => {
                SuccessResponse(res, { unique_id: platform_unique_id, text: "Platform notifications loaded" }, { ...platform_notifications, unread: data });
            });
        }
    }).catch(err => {
        ServerError(res, { unique_id: platform_unique_id, text: err.message }, null);
    });
};

export async function getPlatformNotification(req, res) {
    const platform_unique_id = req.PLATFORM_UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: platform_unique_id, text: "Validation Error Occured" }, errors.array())
    }
    else {
        try {
            const platform_notification = await db.sequelize.transaction((t) => {
                return PLATFORM_NOTIFICATIONS.update({ seen: true_status }, {
                    where: {
                        ...payload,
                        platform_unique_id,
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (platform_notification > 0) {
                PLATFORM_NOTIFICATIONS.findOne({
                    attributes: { exclude: ['id', 'platform_unique_id', 'updatedAt', 'status'] },
                    where: {
                        ...payload,
                        platform_unique_id,
                        status: default_status
                    },
                }).then(platform_notification => {
                    if (!platform_notification) {
                        NotFoundError(res, { unique_id: platform_unique_id, text: "Platform notification not found" }, null);
                    } else {
                        SuccessResponse(res, { unique_id: platform_unique_id, text: "Platform notification loaded" }, platform_notification);
                    }
                })
            } else {
                throw new Error("Platform notification not found!");
            }
        } catch (err) {
            ServerError(res, { unique_id: platform_unique_id, text: err.message }, null);
        }
    }
};

export async function addPlatformNotification(req, res, data) {

    let msg;
    let param;

    if (data.platform_unique_id === "" || data.platform_unique_id === undefined) {
        msg = "Platform Unique ID is required";
        param = "platform_unique_id";
        logger.warn({ unique_id: data.platform_unique_id, text: `Platform notifications | Validation Error Occured - ${param} : ${msg}` });
    } else if (data.type === "" || data.type === undefined) {
        msg = "Type is required";
        param = "type";
        logger.warn({ unique_id: data.platform_unique_id, text: `Platform notifications | Validation Error Occured - ${param} : ${msg}` });
    } else if (data.type.length > 20) {
        msg = "Type max length reached";
        param = "type";
        logger.warn({ unique_id: data.platform_unique_id, text: `Platform notifications | Validation Error Occured - ${param} : ${msg}` });
    } else if (data.action === "" || data.action === undefined) {
        msg = "Action is required";
        param = "action";
        logger.warn({ unique_id: data.platform_unique_id, text: `Platform notifications | Validation Error Occured - ${param} : ${msg}` });
    } else if (data.action.length > 200) {
        msg = "Action max length reached";
        param = "action";
        logger.warn({ unique_id: data.platform_unique_id, text: `Platform notifications | Validation Error Occured - ${param} : ${msg}` });
    } else if ((data.details !== "" && data.details !== undefined) && data.details.length > check_length_TEXT) {
        msg = "Detials max length reached";
        param = "details";
        logger.warn({ unique_id: data.platform_unique_id, text: `Platform notifications | Validation Error Occured - ${param} : ${msg}` });
    } else {
        try {
            await db.sequelize.transaction((t) => {
                const platform_notification = PLATFORM_NOTIFICATIONS.create({
                    ...data,
                    unique_id: uuidv4(),
                    seen: false_status,
                    status: default_status
                }, { transaction: t });
                return platform_notification;
            });
            logger.info({ unique_id: data.platform_unique_id, text: `Platform notification - ${data.action}` });
        } catch (err) {
            logger.error({ unique_id: data.platform_unique_id, text: err.message });
        }
    }
};

export async function updatePlatformNotificationSeen(req, res) {
    const platform_unique_id = req.PLATFORM_UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: platform_unique_id, text: "Validation Error Occured" }, errors.array())
    }
    else {
        try {
            const platform_notification = await db.sequelize.transaction((t) => {
                return PLATFORM_NOTIFICATIONS.update({ seen: true_status }, {
                    where: {
                        ...payload,
                        platform_unique_id,
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (platform_notification > 0) {
                OtherSuccessResponse(res, { unique_id: platform_unique_id, text: "Platform notification read!" });
            } else {
                throw new Error("Platform notification not found!");
            }
        } catch (err) {
            ServerError(res, { unique_id: platform_unique_id, text: err.message }, null);
        }
    }
};

export async function removePlatformNotification(req, res) {
    const platform_unique_id = req.PLATFORM_UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: platform_unique_id, text: "Validation Error Occured" }, errors.array())
    }
    else {
        try {
            const platform_notification = await db.sequelize.transaction((t) => {
                return PLATFORM_NOTIFICATIONS.update({ status: default_delete_status }, {
                    where: {
                        ...payload,
                        platform_unique_id,
                        status: default_status
                    }
                }, { transaction: t });
            }); 

            if (platform_notification > 0) {
                OtherSuccessResponse(res, { unique_id: platform_unique_id, text: "Platform notification deleted!" });
            } else {
                throw new Error("Platform notification not found!");
            }
        } catch (err) {
            ServerError(res, { unique_id: platform_unique_id, text: err.message }, null);
        }
    }
};