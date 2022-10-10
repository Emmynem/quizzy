import jwt from "jsonwebtoken";
import { secret } from "../config/config.js";
import { UnauthorizedError, ForbiddenError } from '../common/index.js';
import db from "../models/index.js";
import { access_granted, access_suspended, default_delete_status, tag_admin_api_key, tag_external_api_key, tag_internal_api_key } from "../config/config.js";

const { verify } = jwt;
const USERS = db.users;
const PLATFORM_USERS = db.platform_users;
const PLATFORMS = db.platforms;
const API_KEYS = db.api_keys;

const verifyToken = (req, res, next) => {
    let token = req.headers["quizzy-access-token"] || req.query.token || req.body.token || '';
    if (!token) {
        ForbiddenError(res, "No token provided!", null);
    } else {
        verify(token, secret, (err, decoded) => {
            if (err) {
                UnauthorizedError(res, "Unauthorized!", null);
            } else {
                req.UNIQUE_ID = decoded.unique_id;
                next();
            }
        });
    }
};

const verifyKey = (req, res, next) => {
    const key = req.headers["quizzy-access-key"] || req.query.key || req.body.key || '';
    if (!key) {
        ForbiddenError(res, "No key provided!", null);
    } else {
        req.API_KEY = key;
        next();
    }
};

const verifyPlatformToken = (req, res, next) => {
    let token = req.headers["quizzy-access-token"] || req.query.token || req.body.token || '';
    if (!token) {
        ForbiddenError(res, "No token provided!", null);
    } else {
        verify(token, secret, (err, decoded) => {
            if (err) {
                UnauthorizedError(res, "Unauthorized!", null);
            } else {
                req.PLATFORM_UNIQUE_ID = decoded.platform_unique_id;
                req.body.platform_unique_id = decoded.platform_unique_id;
                next();
            }
        });
    }
};

const verifyPlatformUserToken = (req, res, next) => {
    let token = req.headers["quizzy-access-token"] || req.query.token || req.body.token || '';
    if (!token) {
        ForbiddenError(res, "No token provided!", null);
    } else {
        verify(token, secret, (err, decoded) => {
            if (err) {
                UnauthorizedError(res, "Unauthorized!", null);
            } else {
                req.PLATFORM_USER_UNIQUE_ID = decoded.platform_user_unique_id;
                req.body.platform_user_unique_id = decoded.platform_user_unique_id;
                next();
            }
        });
    }
};

const isUser = (req, res, next) => {
    USERS.findOne({
        where: {
            unique_id: req.UNIQUE_ID
        }
    }).then(user => {
        if (!user) {
            ForbiddenError(res, "Require User!", null);
        } else if (user.status === default_delete_status) {
            ForbiddenError(res, "User not available!", null);
        } else if (user.access != access_granted) {
            const err = user.access === access_suspended ? "Access is suspended" : "Access is revoked";
            ForbiddenError(res, err, null);
        } else {
            next();
        }
    });
};

const isPlatform = (req, res, next) => {
    PLATFORMS.findOne({
        where: {
            unique_id: req.PLATFORM_UNIQUE_ID
        }
    }).then(platform => {
        if (!platform) {
            ForbiddenError(res, "Require Platform!", null);
        } else if (platform.status === default_delete_status) {
            ForbiddenError(res, "Platform not available!", null);
        } else if (platform.access != access_granted) {
            const err = platform.access === access_suspended ? "Platform access is suspended" : "Platform access is revoked";
            ForbiddenError(res, err, null);
        } else {
            next();
        }
    });
};

const isPlatformUser = (req, res, next) => {
    PLATFORM_USERS.findOne({
        where: {
            unique_id: req.PLATFORM_USER_UNIQUE_ID
        }
    }).then(platform_user => {
        if (!platform_user) {
            ForbiddenError(res, "Require Platform User!", null);
        } else if (platform_user.status === default_delete_status) {
            ForbiddenError(res, "Platform User not available!", null);
        } else if (platform_user.access != access_granted) {
            const err = platform_user.access === access_suspended ? "Access is suspended" : "Access is revoked";
            ForbiddenError(res, err, null);
        } else {
            req.PLATFORM_UNIQUE_ID = platform_user.platform_unique_id;
            req.body.platform_unique_id = platform_user.platform_unique_id;
            next();
        }
    });
};

const isAdministratorKey = (req, res, next) => {
    API_KEYS.findOne({
        where: {
            type: tag_admin_api_key,
            api_key: req.API_KEY
        }
    }).then(api_key => {
        if (!api_key) {
            ForbiddenError(res, `Require ${tag_admin_api_key} key!`, null);
        } else if (api_key.status === default_delete_status) {
            ForbiddenError(res, "Api key not available!", null);
        } else {
            next();
        }
    });
};

const isInternalKey = (req, res, next) => {
    API_KEYS.findOne({
        where: {
            type: tag_internal_api_key,
            api_key: req.API_KEY
        }
    }).then(api_key => {
        if (!api_key) {
            ForbiddenError(res, `Require ${tag_internal_api_key} key!`, null);
        } else if (api_key.status === default_delete_status) {
            ForbiddenError(res, "Api key not available!", null);
        } else {
            next();
        }
    });
};

const isExternalKey = (req, res, next) => {
    API_KEYS.findOne({
        where: {
            type: tag_external_api_key,
            api_key: req.API_KEY
        }
    }).then(api_key => {
        if (!api_key) {
            ForbiddenError(res, `Require ${tag_external_api_key} key!`, null);
        } else if (api_key.status === default_delete_status) {
            ForbiddenError(res, "Api key not available!", null);
        } else {
            next();
        }
    });
};

export default {
    verifyKey,
    verifyPlatformToken,
    verifyPlatformUserToken,
    verifyToken,
    isPlatform,
    isPlatformUser,
    isUser,
    isAdministratorKey,
    isInternalKey,
    isExternalKey
};