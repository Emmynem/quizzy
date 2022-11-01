import { validationResult, matchedData } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { ServerError, SuccessResponse, CreationSuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, BadRequestError, logger } from '../common/index.js';
import { access_granted, access_revoked, access_suspended, default_delete_status, default_status, false_status, true_status, tag_admin, super_admin_routes } from '../config/config.js';
import db from "../models/index.js";
import { addPlatformNotification } from './platformNotifications.controller.js';

const PLATFORMS = db.platforms;
const PLATFORM_USERS = db.platform_users;
const Op = db.Sequelize.Op;

export function rootGetPlatformUsers(req, res) {
    PLATFORM_USERS.findAndCountAll({
        attributes: { exclude: ['id'] },
        order: [
            ['createdAt', 'DESC']
        ],
        include : [
            {
                model: PLATFORMS,
                attributes: ['name', 'stripped', 'email', 'profile_image', 'pro']
            }
        ]
    }).then(platform_users => {
        if (!platform_users || platform_users.length == 0) {
            SuccessResponse(res, { unique_id: tag_admin, text: "Platform Users Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: tag_admin, text: "Platform Users loaded" }, platform_users);
        }
    }).catch(err => {
        ServerError(res, { unique_id: tag_admin, text: err.message }, null);
    });
};

export function rootGetPlatformUser(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    }
    else {
        PLATFORM_USERS.findOne({
            attributes: { exclude: ['id'] },
            where: {
                unique_id: payload.platform_user_unique_id
            },
            include: [
                {
                    model: PLATFORMS,
                    attributes: ['name', 'stripped', 'email', 'profile_image', 'pro']
                }
            ]
        }).then(platform_user => {
            if (!platform_user) {
                NotFoundError(res, { unique_id: tag_admin, text: "Platform User not found" }, null);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "Platform User loaded" }, platform_user);
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export function getPlatformUsers(req, res) {
    const platform_unique_id = req.PLATFORM_UNIQUE_ID;
    const platform_user_unique_id = req.PLATFORM_USER_UNIQUE_ID;

    PLATFORM_USERS.findAndCountAll({
        attributes: { exclude: ['id', 'platform_unique_id'] },
        where : {
            platform_unique_id,
            unique_id: {
                [Op.ne]: platform_user_unique_id
            },
            routes: {
                [Op.ne]: super_admin_routes
            }
        },
        order: [
            ['createdAt', 'DESC']
        ]
    }).then(platform_users => {
        if (!platform_users || platform_users.length == 0) {
            SuccessResponse(res, { unique_id: platform_unique_id, text: "Platform Users Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: platform_unique_id, text: "Platform Users loaded" }, platform_users);
        }
    }).catch(err => {
        ServerError(res, { unique_id: platform_unique_id, text: err.message }, null);
    });
};

export function getPlatformUser(req, res) {
    const platform_unique_id = req.PLATFORM_UNIQUE_ID;
    const platform_user_unique_id = req.PLATFORM_USER_UNIQUE_ID;

    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: platform_unique_id, text: "Validation Error Occured" }, errors.array())
    }
    else {
        if (platform_user_unique_id === payload.unique_id) {
            BadRequestError(res, { unique_id: platform_unique_id, text: "Can't perform action!" }, null);
        } else {
            PLATFORM_USERS.findOne({
                attributes: { exclude: ['unique_id', 'id'] },
                where: {
                    platform_unique_id,
                    ...payload,
                    status: default_status
                }
            }).then(platform_user => {
                if (!platform_user) {
                    NotFoundError(res, { unique_id: platform_unique_id, text: "Platform User not found" }, null);
                } else if (platform_user.routes === super_admin_routes) {
                    BadRequestError(res, { unique_id: platform_unique_id, text: "Can't view this result!" }, null);
                } else {
                    SuccessResponse(res, { unique_id: platform_unique_id, text: "Platform User loaded" }, platform_user);
                }
            }).catch(err => {
                ServerError(res, { unique_id: platform_unique_id, text: err.message }, null);
            });
        }
    }
};

export function getPlatformUserDetails(req, res) {
    const platform_unique_id = req.PLATFORM_UNIQUE_ID;
    const platform_user_unique_id = req.PLATFORM_USER_UNIQUE_ID;

    PLATFORM_USERS.findOne({
        attributes: { exclude: ['unique_id', 'id', 'access'] },
        where: {
            platform_unique_id,
            unique_id: platform_user_unique_id,
            status: default_status
        }
    }).then(platform_user => {
        if (!platform_user) {
            NotFoundError(res, { unique_id: platform_unique_id, text: "Platform User not found" }, null);
        } else {
            SuccessResponse(res, { unique_id: platform_unique_id, text: "Platform User loaded" }, platform_user);
        }
    }).catch(err => {
        ServerError(res, { unique_id: platform_unique_id, text: err.message }, null);
    });
};

export async function addPlatformUser(req, res) {
    const platform_unique_id = req.PLATFORM_UNIQUE_ID;
    const platform_user_unique_id = req.PLATFORM_USER_UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: platform_unique_id, text: "Validation Error Occured" }, errors.array())
    }
    else {
        try {
            const platform_users = await db.sequelize.transaction((t) => {
                return PLATFORM_USERS.create({
                    unique_id: uuidv4(),
                    platform_unique_id,
                    ...payload,
                    routes: JSON.stringify(payload.routes),
                    access: access_granted,
                    status: default_status
                }, { transaction: t });
            });

            if (platform_users) {
                const platform_notification_data = {
                    platform_unique_id,
                    type: "User",
                    action: "Created new platform user successfully!"
                };
                addPlatformNotification(req, res, platform_notification_data);
                CreationSuccessResponse(res, { unique_id: platform_unique_id, text: "Platform User created successfully!" });
            }
        } catch (err) {
            ServerError(res, { unique_id: platform_unique_id, text: err.message }, null);
        }
    }
};

export async function updatePlatformUserProfileDetails(req, res) {
    const platform_unique_id = req.PLATFORM_UNIQUE_ID;
    const platform_user_unique_id = req.PLATFORM_USER_UNIQUE_ID;

    try {
        const platform_user = await db.sequelize.transaction((t) => {
            return PLATFORM_USERS.update({ ...payload }, {
                where: {
                    platform_unique_id,
                    unique_id: platform_user_unique_id,
                    status: default_status
                }
            }, { transaction: t });
        });

        if (platform_user > 0) {
            const notification_data = {
                platform_unique_id,
                type: "User",
                action: "Updated platform user profile details!"
            };
            addPlatformNotification(req, res, notification_data);
            SuccessResponse(res, { unique_id: platform_unique_id, text: "Platform User profile details updated successfully!" });
        } else {
            BadRequestError(res, { unique_id: platform_unique_id, text: "Platform User not found!" }, null);
        }
    } catch (err) {
        ServerError(res, { unique_id: platform_unique_id, text: err.message }, null);
    }
};

export async function updatePlatformUserDetails(req, res) {
    const platform_unique_id = req.PLATFORM_UNIQUE_ID;
    const platform_user_unique_id = req.PLATFORM_USER_UNIQUE_ID;

    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: platform_unique_id, text: "Validation Error Occured" }, errors.array())
    }
    else {
        if (platform_user_unique_id === payload.unique_id) {
            BadRequestError(res, { unique_id: platform_unique_id, text: "Can't perform action!" }, null);
        } else {
            try {
                const platform_user = await db.sequelize.transaction((t) => {
                    return PLATFORM_USERS.update({ ...payload }, {
                        where: {
                            platform_unique_id,
                            unique_id: payload.unique_id,
                            status: default_status
                        }
                    }, { transaction: t });
                });
    
                if (platform_user > 0) {
                    const notification_data = {
                        platform_unique_id,
                        type: "User",
                        action: "Updated platform user details!"
                    };
                    addPlatformNotification(req, res, notification_data);
                    SuccessResponse(res, { unique_id: platform_unique_id, text: "Platform User details updated successfully!" });
                } else {
                    BadRequestError(res, { unique_id: platform_unique_id, text: "Platform User not found!" }, null);
                }
            } catch (err) {
                ServerError(res, { unique_id: platform_unique_id, text: err.message }, null);
            }
        }
    }
};

export async function updatePlatformUserRoutes(req, res) {
    const platform_unique_id = req.PLATFORM_UNIQUE_ID;
    const platform_user_unique_id = req.PLATFORM_USER_UNIQUE_ID;

    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: platform_unique_id, text: "Validation Error Occured" }, errors.array())
    }
    else {
        if (platform_user_unique_id === payload.unique_id) {
            BadRequestError(res, { unique_id: platform_unique_id, text: "Can't perform action!" }, null);
        } else {
            try {
                const platform_user = await db.sequelize.transaction((t) => {
                    return PLATFORM_USERS.update({ routes: JSON.stringify(payload.routes) }, {
                        where: {
                            platform_unique_id,
                            unique_id: payload.unique_id,
                            routes: {
                                [Op.ne]: super_admin_routes
                            },
                            status: default_status
                        }
                    }, { transaction: t });
                });
    
                if (platform_user > 0) {
                    const notification_data = {
                        platform_unique_id,
                        type: "User",
                        action: "Updated platform user routes!"
                    };
                    addPlatformNotification(req, res, notification_data);
                    SuccessResponse(res, { unique_id: platform_unique_id, text: "Platform User routes updated successfully!" });
                } else {
                    BadRequestError(res, { unique_id: platform_unique_id, text: "Platform User not found!" }, null);
                }
            } catch (err) {
                ServerError(res, { unique_id: platform_unique_id, text: err.message }, null);
            }
        }
    }
};

export async function updatePlatformUserAccessGranted(req, res) {
    const platform_unique_id = req.PLATFORM_UNIQUE_ID;
    const platform_user_unique_id = req.PLATFORM_USER_UNIQUE_ID;

    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: platform_unique_id, text: "Validation Error Occured" }, errors.array())
    }
    else {
        if (platform_user_unique_id === payload.unique_id) {
            BadRequestError(res, { unique_id: platform_unique_id, text: "Can't perform action!" }, null);
        } else {
            try {
                const platform_user = await db.sequelize.transaction((t) => {
                    return PLATFORM_USERS.update({
                        access: access_granted
                    }, {
                        where: {
                            platform_unique_id,
                            unique_id: payload.unique_id,
                            access: {
                                [Op.ne]: access_granted
                            },
                            routes: {
                                [Op.ne]: super_admin_routes
                            },
                            status: default_status
                        }
                    }, { transaction: t });
                });
    
                if (platform_user > 0) {
    
                    const notification_data = {
                        platform_unique_id,
                        type: "User",
                        action: "User's access was granted!"
                    };
                    addPlatformNotification(req, res, notification_data);
    
                    SuccessResponse(res, { unique_id: platform_unique_id, text: "Platform User's access was granted successfully!" });
                } else {
                    BadRequestError(res, { unique_id: platform_unique_id, text: "Platform User access already granted!" }, null);
                }
            } catch (err) {
                ServerError(res, { unique_id: platform_unique_id, text: err.message }, null);
            }
        }
    }
};

export async function updatePlatformUserAccessSuspended(req, res) {
    const platform_unique_id = req.PLATFORM_UNIQUE_ID;
    const platform_user_unique_id = req.PLATFORM_USER_UNIQUE_ID;

    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: platform_unique_id, text: "Validation Error Occured" }, errors.array())
    }
    else {
        if (platform_user_unique_id === payload.unique_id) {
            BadRequestError(res, { unique_id: platform_unique_id, text: "Can't perform action!" }, null);
        } else {
            try {
                const platform_user = await db.sequelize.transaction((t) => {
                    return PLATFORM_USERS.update({
                        access: access_suspended
                    }, {
                        where: {
                            platform_unique_id,
                            unique_id: payload.unique_id,
                            access: {
                                [Op.ne]: access_suspended
                            },
                            routes: {
                                [Op.ne]: super_admin_routes
                            },
                            status: default_status
                        }
                    }, { transaction: t });
                });
    
                if (platform_user > 0) {
    
                    const notification_data = {
                        platform_unique_id,
                        type: "User",
                        action: "User's access was suspended!"
                    };
                    addPlatformNotification(req, res, notification_data);
    
                    SuccessResponse(res, { unique_id: platform_unique_id, text: "Platform User's access was suspended successfully!" });
                } else {
                    BadRequestError(res, { unique_id: platform_unique_id, text: "Platform User access already suspended!" }, null);
                }
            } catch (err) {
                ServerError(res, { unique_id: platform_unique_id, text: err.message }, null);
            }
        }
    }
};

export async function updatePlatformUserAccessRevoked(req, res) {
    const platform_unique_id = req.PLATFORM_UNIQUE_ID;
    const platform_user_unique_id = req.PLATFORM_USER_UNIQUE_ID;

    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: platform_unique_id, text: "Validation Error Occured" }, errors.array())
    }
    else {
        if (platform_user_unique_id === payload.unique_id) {
            BadRequestError(res, { unique_id: platform_unique_id, text: "Can't perform action!" }, null);
        } else {
            try {
                const platform_user = await db.sequelize.transaction((t) => {
                    return PLATFORM_USERS.update({
                        access: access_revoked
                    }, {
                        where: {
                            platform_unique_id,
                            unique_id: payload.unique_id,
                            access: {
                                [Op.ne]: access_revoked
                            },
                            routes: {
                                [Op.ne]: super_admin_routes
                            },
                            status: default_status
                        }
                    }, { transaction: t });
                });
    
                if (platform_user > 0) {
    
                    const notification_data = {
                        platform_unique_id,
                        type: "User",
                        action: "User's access was revoked!"
                    };
                    addPlatformNotification(req, res, notification_data);
    
                    SuccessResponse(res, { unique_id: platform_unique_id, text: "Platform User's access was revoked successfully!" });
                } else {
                    BadRequestError(res, { unique_id: platform_unique_id, text: "Platform User access already revoked!" }, null);
                }
            } catch (err) {
                ServerError(res, { unique_id: platform_unique_id, text: err.message }, null);
            }
        }
    }
};

export async function removePlatformUser(req, res) {
    const platform_unique_id = req.PLATFORM_UNIQUE_ID;
    const platform_user_unique_id = req.PLATFORM_USER_UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: platform_unique_id, text: "Validation Error Occured" }, errors.array())
    }
    else {
        if (platform_user_unique_id === payload.unique_id) {
            BadRequestError(res, { unique_id: platform_unique_id, text: "Can't perform action!" }, null);
        } else {
            try {
                const platform_user = await db.sequelize.transaction((t) => {
                    return PLATFORM_USERS.update({
                        status: default_delete_status
                    }, {
                        where: {
                            unique_id: payload.unique_id,
                            platform_unique_id,
                            routes: {
                                [Op.ne]: super_admin_routes
                            },
                            status: default_status
                        }
                    }, { transaction: t });
                });
    
                if (platform_user > 0) {
                    const platform_notification_data = {
                        platform_unique_id,
                        type: "User",
                        action: "Removed platform user successfully!"
                    };
                    addPlatformNotification(req, res, platform_notification_data);
                    OtherSuccessResponse(res, { unique_id: platform_unique_id, text: "Platform User was removed successfully!" });
                } else {
                    BadRequestError(res, { unique_id: platform_unique_id, text: "Error removing platform user!" }, null);
                }
            } catch (err) {
                ServerError(res, { unique_id: platform_unique_id, text: err.message }, null);
            }
        }
    }
};

export async function restorePlatformUser(req, res) {
    const platform_unique_id = req.PLATFORM_UNIQUE_ID;
    const platform_user_unique_id = req.PLATFORM_USER_UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: platform_unique_id, text: "Validation Error Occured" }, errors.array())
    }
    else {
        if (platform_user_unique_id === payload.unique_id) {
            BadRequestError(res, { unique_id: platform_unique_id, text: "Can't perform action!" }, null);
        } else {
            try {
                const platform_user = await db.sequelize.transaction((t) => {
                    return PLATFORM_USERS.update({
                        status: default_status
                    }, {
                        where: {
                            unique_id: payload.unique_id,
                            platform_unique_id,
                            routes: {
                                [Op.ne]: super_admin_routes
                            },
                            status: default_delete_status
                        }
                    }, { transaction: t });
                });
    
                if (platform_user > 0) {
                    const platform_notification_data = {
                        platform_unique_id,
                        type: "User",
                        action: "Restored platform user successfully!"
                    };
                    addPlatformNotification(req, res, platform_notification_data);
                    OtherSuccessResponse(res, { unique_id: platform_unique_id, text: "Platform User was restored successfully!" });
                } else {
                    BadRequestError(res, { unique_id: platform_unique_id, text: "Error restoring platform user!" }, null);
                }
            } catch (err) {
                ServerError(res, { unique_id: platform_unique_id, text: err.message }, null);
            }
        }
    }
};

export async function deletePlatformUser(req, res) {
    const platform_unique_id = req.PLATFORM_UNIQUE_ID;
    const platform_user_unique_id = req.PLATFORM_USER_UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: platform_unique_id, text: "Validation Error Occured" }, errors.array())
    }
    else {
        if (platform_user_unique_id === payload.unique_id) {
            BadRequestError(res, { unique_id: platform_unique_id, text: "Can't perform action!" }, null);
        } else {
            try {
                const platform_user = await db.sequelize.transaction((t) => {
                    return PLATFORM_USERS.destroy({
                        where: {
                            unique_id: payload.unique_id,
                            platform_unique_id,
                            routes: {
                                [Op.ne]: super_admin_routes
                            },
                            status: default_status
                        }
                    }, { transaction: t });
                });
    
                if (platform_user > 0) {
                    const platform_notification_data = {
                        platform_unique_id,
                        type: "User",
                        action: "Deleted platform user successfully!"
                    };
                    addPlatformNotification(req, res, platform_notification_data);
                    OtherSuccessResponse(res, { unique_id: platform_unique_id, text: "Platform User was deleted successfully!" });
                } else {
                    BadRequestError(res, { unique_id: platform_unique_id, text: "Error deleting platform user!" }, null);
                }
            } catch (err) {
                ServerError(res, { unique_id: platform_unique_id, text: err.message }, null);
            }
        }
    }
};
