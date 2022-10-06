import { validationResult, matchedData } from 'express-validator';
import jwt from "jsonwebtoken";
import bycrypt from "bcryptjs";
import fs from "fs";
import { v4 as uuidv4 } from 'uuid';
import { ServerError, SuccessResponse, CreationSuccessResponse, ValidationError, UnauthorizedError, ForbiddenError, NotFoundError } from '../common/index.js';
import { access_granted, access_revoked, access_suspended, secret, default_status, false_status, default_profile_image, documents_path, unverified_status } from '../config/config.js';
import db from "../models/index.js";
import { addUserNotification } from './notifications.controller.js';

const USERS = db.users;
const PRIVATES = db.privates;

const { sign } = jwt;
const { hashSync } = bycrypt;
const { compareSync } = bycrypt;
const { existsSync, mkdirSync } = fs;

export async function userSignUp(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: payload.email, text: "Validation Error Occured" }, errors.array())
    }
    else {
        try {
            const users = await db.sequelize.transaction((t) => {
                return USERS.create({
                    unique_id: uuidv4(),
                    ...payload,
                    email_verification: false_status,
                    mobile_number_verification: false_status,
                    user_private: hashSync(payload.password, 8),
                    profile_image: default_profile_image,
                    pro: false_status,
                    access: access_granted,
                    status: default_status
                }, { transaction: t });
            });

            const privates = await db.sequelize.transaction((t) => {
                return PRIVATES.create({
                    unique_id: uuidv4(),
                    user_unique_id: users.unique_id,
                    private: payload.password,
                    status: default_status
                }, { transaction: t });
            });

            if (users) {
                const folder_name = documents_path + users.unique_id;
                if (!existsSync(folder_name)) mkdirSync(folder_name);
                if (existsSync(folder_name)) {
                    const notification_data = {
                        user_unique_id: users.unique_id,
                        type: "Signup",
                        action: "Signed up successfully!"
                    };
                    addUserNotification(req, res, notification_data);
                    CreationSuccessResponse(res, { unique_id: users.unique_id, text: "User signed up successfully!" });
                }
            }
        } catch (err) {
            ServerError(res, { unique_id: payload.email, text: err.message }, null);
        }
    }
};

export async function userSigninViaEmail(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: payload.email, text: "Validation Error Occured" }, errors.array())
    }
    else {
        try {
            await USERS.findOne({
                where: {
                    email: payload.email,
                    status: default_status
                },
            }).then(user => {
                if (!user) {
                    NotFoundError(res, { unique_id: payload.email, text: "User not found" }, null);
                } else if (user.access === access_suspended) {
                    ForbiddenError(res, { unique_id: payload.email, text: "Account has been suspended" }, null);
                } else if (user.access === access_revoked) {
                    ForbiddenError(res, { unique_id: payload.email, text: "Account access has been revoked" }, null);
                } else if (user.email_verification === unverified_status) {
                    ForbiddenError(res, { unique_id: payload.email, text: "Unverified email" }, null);
                } else {
                    const passwordIsValid = compareSync(payload.password, user.user_private);

                    if (!passwordIsValid) {
                        UnauthorizedError(res, { unique_id: payload.email, text: "Invalid Password!" }, null);
                    } else {
                        const token = sign({ unique_id: user.unique_id }, secret, {
                            expiresIn: payload.remember_me ? 2592000 /* 30 days */ : 86400 // 24 hours
                        });

                        const notification_data = {
                            user_unique_id: user.unique_id,
                            type: "Signin",
                            action: "Signed in successfully via email!"
                        };
                        addUserNotification(req, res, notification_data);

                        const return_data = {
                            token,
                            fullname: user.firstname + (user.middlename !== null ? " " + user.middlename + " " : " ") + user.lastname,
                            email: user.email,
                        };
                        SuccessResponse(res, { unique_id: user.unique_id, text: "Logged in successfully!" }, return_data);
                    }
                }
            })
        } catch (err) {
            ServerError(res, { unique_id: payload.email, text: err.message }, null);
        }
    }
};

export async function userSigninViaMobile(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: payload.mobile_number, text: "Validation Error Occured" }, errors.array())
    }
    else {
        try {
            await USERS.findOne({
                where: {
                    mobile_number: payload.mobile_number,
                    status: default_status
                },
            }).then(user => {
                if (!user) {
                    NotFoundError(res, { unique_id: payload.mobile_number, text: "User not found" }, null);
                } else if (user.access === access_suspended) {
                    ForbiddenError(res, { unique_id: payload.mobile_number, text: "Account has been suspended" }, null);
                } else if (user.access === access_revoked) {
                    ForbiddenError(res, { unique_id: payload.mobile_number, text: "Account access has been revoked" }, null);
                } else if (user.mobile_number_verification === unverified_status) {
                    ForbiddenError(res, { unique_id: payload.mobile_number, text: "Unverified mobile number" }, null);
                } else {
                    const passwordIsValid = compareSync(payload.password, user.user_private);

                    if (!passwordIsValid) {
                        UnauthorizedError(res, { unique_id: payload.mobile_number, text: "Invalid Password!" }, null);
                    } else {
                        const token = sign({ unique_id: user.unique_id }, secret, {
                            expiresIn: payload.remember_me ? 2592000 /* 30 days */ : 86400 // 24 hours
                        });

                        const notification_data = {
                            user_unique_id: user.unique_id,
                            type: "Signin",
                            action: "Signed in successfully via mobile number!"
                        };
                        addUserNotification(req, res, notification_data);

                        const return_data = {
                            token,
                            fullname: user.firstname + (user.middlename !== null ? " " + user.middlename + " " : " ") + user.lastname,
                            mobile_number: user.mobile_number,
                        };
                        SuccessResponse(res, { unique_id: user.unique_id, text: "Logged in successfully!" }, return_data);
                    }
                }
            })
        } catch (err) {
            ServerError(res, { unique_id: payload.mobile_number, text: err.message }, null);
        }
    }
};