import { validationResult, matchedData } from 'express-validator';
import moment from 'moment';
import jwt from "jsonwebtoken";
import bycrypt from "bcryptjs";
import fs from "fs";
import { v4 as uuidv4 } from 'uuid';
import { ServerError, SuccessResponse, CreationSuccessResponse, ValidationError, UnauthorizedError, ForbiddenError, NotFoundError, BadRequestError } from '../common/index.js';
import { access_granted, access_revoked, access_suspended, secret, default_status, false_status, default_profile_image, documents_path, unverified_status, strip_text, 
    random_uuid, platform_access_url, api_key_start, save_document_domain, default_platform_image, super_admin_routes, random_numbers, true_status, validate_future_end_date, save_image_dir } from '../config/config.js';
import db from "../models/index.js";
import { addUserNotification } from './notifications.controller.js';
import { addPlatformNotification } from './platformNotifications.controller.js';

const USERS = db.users;
const PRIVATES = db.privates;
const PLATFORMS = db.platforms;
const PLATFORM_USERS = db.platform_users;
const OTPS = db.otps;

const { sign } = jwt;
const { hashSync } = bycrypt;
const { compareSync } = bycrypt;
const { existsSync, mkdirSync } = fs;

export async function userSignUp(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: payload.email, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            const users = await db.sequelize.transaction((t) => {
                return USERS.create({
                    unique_id: uuidv4(),
                    ...payload,
                    email_verification: false_status,
                    mobile_number_verification: false_status,
                    user_private: hashSync(payload.password, 8),
                    profile_image_base_url: save_document_domain,
                    profile_image_dir: save_image_dir,
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
    } else {
        try {
            const user = await USERS.findOne({
                where: {
                    email: payload.email,
                    status: default_status
                },
            });

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
    } else {
        try {
            const user = await USERS.findOne({
                where: {
                    mobile_number: payload.mobile_number,
                    status: default_status
                },
            });

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
        } catch (err) {
            ServerError(res, { unique_id: payload.mobile_number, text: err.message }, null);
        }
    }
};

export async function platformSignUp(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: payload.email, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            const platform_name = payload.name;
            const stripped = strip_text(platform_name);

            const platforms = await db.sequelize.transaction((t) => {
                return PLATFORMS.create({
                    unique_id: uuidv4(),
                    name: platform_name,
                    stripped,
                    email: payload.email,
                    description: payload.description,
                    token: random_uuid(20),
                    access_url: platform_access_url + stripped,
                    live_api_key: api_key_start + random_uuid(20),
                    profile_image_base_url: save_document_domain,
                    profile_image_dir: save_image_dir,
                    profile_image: default_platform_image,
                    pro: false_status,
                    pro_expiring: null,
                    access: access_granted,
                    status: default_status
                }, { transaction: t });
            });

            const platform_users = await db.sequelize.transaction((t) => {
                return PLATFORM_USERS.create({
                    unique_id: uuidv4(),
                    platform_unique_id: platforms.unique_id,
                    firstname: payload.firstname,
                    middlename: payload.middlename,
                    lastname: payload.lastname,
                    email: payload.user_email,
                    mobile_number: payload.mobile_number,
                    gender: payload.gender,
                    routes: super_admin_routes,
                    access: access_granted,
                    status: default_status
                }, { transaction: t });
            });

            if (platforms && platform_users) {
                const folder_name = documents_path + platforms.unique_id;
                if (!existsSync(folder_name)) mkdirSync(folder_name);
                if (existsSync(folder_name)) {
                    const platform_notification_data = {
                        platform_unique_id: platforms.unique_id,
                        type: "Platform",
                        action: "Created platform successfully!"
                    };
                    addPlatformNotification(req, res, platform_notification_data);
                    CreationSuccessResponse(res, { unique_id: platforms.unique_id, text: "Platform created successfully!" }, { login_url: platforms.access_url });
                }
            }
        } catch (err) {
            ServerError(res, { unique_id: payload.email, text: err.message }, null);
        }
    }
};

export async function platformUserSignin(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (payload.email) {
        if (!errors.isEmpty()) {
            ValidationError(res, { unique_id: payload.email, text: "Validation Error Occured" }, errors.array())
        }
        else {
            try {
                const platform = await PLATFORMS.findOne({ 
                    where: { 
                        stripped: req.params.stripped, 
                        status: default_status 
                    } 
                });

                const platform_user = await PLATFORM_USERS.findOne({
                    where: {
                        platform_unique_id: platform.unique_id,
                        email: payload.email,
                        status: default_status
                    },
                });

                if (platform) {
                    if (!platform_user) {
                        NotFoundError(res, { unique_id: payload.email, text: "User not found" }, null);
                    } else if (platform_user.access === access_suspended) {
                        ForbiddenError(res, { unique_id: platform_user.unique_id, text: "Account has been suspended" }, null);
                    } else if (platform_user.access === access_revoked) {
                        ForbiddenError(res, { unique_id: platform_user.unique_id, text: "Account access has been revoked" }, null);
                    } else {
                        const otp_expiring = moment().add(5, 'minute').toDate();
                        const otp_expiring_text = moment().add(5, 'minute');
                        const otp_code = random_numbers(6);

                        const otps = db.sequelize.transaction((t) => {
                            return OTPS.create({
                                unique_id: uuidv4(),
                                platform_unique_id: platform.unique_id,
                                origin: platform_user.unique_id,
                                code: otp_code,
                                valid: true_status,
                                expiration: otp_expiring,
                                status: default_status
                            }, { transaction: t });
                        });

                        const platform_notification_data = {
                            platform_unique_id: platform.unique_id,
                            type: "OTP",
                            action: `Login request via email`,
                            details: `ID: ${platform_user.unique_id}\nName: ${platform_user.firstname + (platform_user.middlename !== null ? " " + platform_user.middlename + " " : " ") + platform_user.lastname}\n\nOTP created, expires at ${otp_expiring_text}`
                        };
                        addPlatformNotification(req, res, platform_notification_data);

                        SuccessResponse(res, { unique_id: platform_user.unique_id, text: "OTP sent successfully!" }, { expiration: `${otp_expiring_text}` });
                    }
                }
                else {
                    NotFoundError(res, { unique_id: payload.email, text: "Platform not found" }, null);
                }
            } catch (err) {
                ServerError(res, { unique_id: payload.email, text: err.message }, null);
            }
        }
    } else if (payload.mobile_number) {
        if (!errors.isEmpty()) {
            ValidationError(res, { unique_id: payload.mobile_number, text: "Validation Error Occured" }, errors.array())
        } else {
            try {
                const platform = await PLATFORMS.findOne({
                    where: {
                        stripped: req.params.stripped,
                        status: default_status
                    }
                });

                const platform_user = await PLATFORM_USERS.findOne({
                    where: {
                        platform_unique_id: platform.unique_id,
                        mobile_number: payload.mobile_number,
                        status: default_status
                    },
                });

                if (platform) {
                    if (!platform_user) {
                        NotFoundError(res, { unique_id: payload.mobile_number, text: "User not found" }, null);
                    } else if (platform_user.access === access_suspended) {
                        ForbiddenError(res, { unique_id: platform_user.unique_id, text: "Account has been suspended" }, null);
                    } else if (platform_user.access === access_revoked) {
                        ForbiddenError(res, { unique_id: platform_user.unique_id, text: "Account access has been revoked" }, null);
                    } else {
                        const otp_expiring = moment().add(5, 'minute').toDate();
                        const otp_expiring_text = moment().add(5, 'minute');
                        const otp_code = random_numbers(6);

                        const otps = db.sequelize.transaction((t) => {
                            return OTPS.create({
                                unique_id: uuidv4(),
                                platform_unique_id: platform.unique_id,
                                origin: platform_user.unique_id,
                                code: otp_code,
                                valid: true_status,
                                expiration: otp_expiring,
                                status: default_status
                            }, { transaction: t });
                        });

                        const platform_notification_data = {
                            platform_unique_id: platform.unique_id,
                            type: "OTP",
                            action: `Login request via mobile`,
                            details: `ID: ${platform_user.unique_id}\nName: ${platform_user.firstname + (platform_user.middlename !== null ? " " + platform_user.middlename + " " : " ") + platform_user.lastname}\n\nOTP created, expires at ${otp_expiring_text}`
                        };
                        addPlatformNotification(req, res, platform_notification_data);

                        SuccessResponse(res, { unique_id: platform_user.unique_id, text: "OTP sent successfully!" }, { expiration: `${otp_expiring_text}` });
                    }
                } else {
                    NotFoundError(res, { unique_id: payload.mobile_number, text: "Platform not found" }, null);
                }
            } catch (err) {
                ServerError(res, { unique_id: payload.mobile_number, text: err.message }, null);
            }
        }
    } else {
        ValidationError(res, "Valid email or mobile number is required", null)
    }
};

export async function platformUserVerifyOtp(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (payload.email) {
        if (!errors.isEmpty()) {
            ValidationError(res, { unique_id: payload.email, text: "Validation Error Occured" }, errors.array())
        }
        else {
            try {
                const platform = await PLATFORMS.findOne({ where: { stripped: req.params.stripped, status: default_status } });

                if (platform) {
                    const platform_user = await PLATFORM_USERS.findOne({
                        where: {
                            platform_unique_id: platform.unique_id,
                            email: payload.email,
                            status: default_status
                        },
                    });

                    if (!platform_user) {
                        NotFoundError(res, { unique_id: payload.email, text: "User not found" }, null);
                    } else if (platform_user.access === access_suspended) {
                        ForbiddenError(res, { unique_id: platform_user.unique_id, text: "Account has been suspended" }, null);
                    } else if (platform_user.access === access_revoked) {
                        ForbiddenError(res, { unique_id: platform_user.unique_id, text: "Account access has been revoked" }, null);
                    } else {
                        const otp = await OTPS.findOne({
                            where: {
                                platform_unique_id: platform.unique_id,
                                origin: platform_user.unique_id,
                                code: payload.otp,
                                status: default_status
                            },
                        });

                        if (!otp) {
                            NotFoundError(res, { unique_id: platform_user.unique_id, text: "Invalid OTP" }, null);
                        } else if (!otp.valid) {
                            ForbiddenError(res, { unique_id: platform_user.unique_id, text: "OTP invalid" }, null);
                        } else if (!validate_future_end_date(moment().toDate(), otp.expiration)) {
                            const invalidate_otp = await db.sequelize.transaction((t) => {
                                return OTPS.update({ valid: false_status }, {
                                    where: {
                                        platform_unique_id: platform.unique_id,
                                        origin: platform_user.unique_id,
                                        code: payload.otp,
                                        status: default_status
                                    }
                                }, { transaction: t });
                            })

                            if (invalidate_otp > 0) {
                                ForbiddenError(res, { unique_id: platform_user.unique_id, text: "Expired OTP" }, null);
                            } else {
                                BadRequestError(res, { unique_id: platform_user.unique_id, text: "Error invalidating OTP!" }, null);
                            }
                        } else {
                            const validate_otp = await db.sequelize.transaction((t) => {
                                return OTPS.update({ valid: false_status }, {
                                    where: {
                                        platform_unique_id: platform.unique_id,
                                        origin: platform_user.unique_id,
                                        code: payload.otp,
                                        status: default_status
                                    }
                                }, { transaction: t });
                            })

                            if (validate_otp > 0) {
                                const token = sign({ platform_user_unique_id: platform_user.unique_id }, secret, {
                                    expiresIn: payload.remember_me ? 2592000 /* 30 days */ : 86400 // 24 hours
                                });

                                const platform_notification_data = {
                                    platform_unique_id: platform.unique_id,
                                    type: "Signin",
                                    action: `Signed in successfully via email!`,
                                    details: `ID: ${platform_user.unique_id}\nName: ${platform_user.firstname + (platform_user.middlename !== null ? " " + platform_user.middlename + " " : " ") + platform_user.lastname}\n\nOTP invalidated`
                                };
                                addPlatformNotification(req, res, platform_notification_data);

                                const return_data = {
                                    token,
                                    fullname: platform_user.firstname + (platform_user.middlename !== null ? " " + platform_user.middlename + " " : " ") + platform_user.lastname,
                                    email: platform_user.email,
                                };
                                SuccessResponse(res, { unique_id: platform_user.unique_id, text: "Logged in successfully!" }, return_data);
                            } else {
                                BadRequestError(res, { unique_id: platform_user.unique_id, text: "Error validating OTP!" }, null);
                            }
                        }
                    }
                }
                else {
                    NotFoundError(res, { unique_id: payload.email, text: "Platform not found" }, null);
                }
            } catch (err) {
                ServerError(res, { unique_id: payload.email, text: err.message }, null);
            }
        }
    } else if (payload.mobile_number) {
        if (!errors.isEmpty()) {
            ValidationError(res, { unique_id: payload.mobile_number, text: "Validation Error Occured" }, errors.array())
        } else {
            try {
                const platform = await PLATFORMS.findOne({ where: { stripped: req.params.stripped, status: default_status } });

                if (platform) {
                    const platform_user = await PLATFORM_USERS.findOne({
                        where: {
                            platform_unique_id: platform.unique_id,
                            mobile_number: payload.mobile_number,
                            status: default_status
                        },
                    });

                    if (!platform_user) {
                        NotFoundError(res, { unique_id: payload.mobile_number, text: "User not found" }, null);
                    } else if (platform_user.access === access_suspended) {
                        ForbiddenError(res, { unique_id: platform_user.unique_id, text: "Account has been suspended" }, null);
                    } else if (platform_user.access === access_revoked) {
                        ForbiddenError(res, { unique_id: platform_user.unique_id, text: "Account access has been revoked" }, null);
                    } else {
                        const otp = await OTPS.findOne({
                            where: {
                                platform_unique_id: platform.unique_id,
                                origin: platform_user.unique_id,
                                code: payload.otp,
                                status: default_status
                            },
                        });

                        if (!otp) {
                            NotFoundError(res, { unique_id: platform_user.unique_id, text: "Invalid OTP" }, null);
                        } else if (!otp.valid) {
                            ForbiddenError(res, { unique_id: platform_user.unique_id, text: "OTP invalid" }, null);
                        } else if (!validate_future_end_date(moment().toDate(), otp.expiration)) {
                            const invalidate_otp = await db.sequelize.transaction((t) => {
                                return OTPS.update({ valid: false_status }, {
                                    where: {
                                        platform_unique_id: platform.unique_id,
                                        origin: platform_user.unique_id,
                                        code: payload.otp,
                                        status: default_status
                                    }
                                }, { transaction: t });
                            })
                            
                            if (invalidate_otp > 0) {
                                ForbiddenError(res, { unique_id: platform_user.unique_id, text: "Expired OTP" }, null);
                            } else {
                                BadRequestError(res, { unique_id: platform_user.unique_id, text: "Error invalidating OTP!" }, null);
                            }
                        } else {
                            const validate_otp = await db.sequelize.transaction((t) => {
                                return OTPS.update({ valid: false_status }, {
                                    where: {
                                        platform_unique_id: platform.unique_id,
                                        origin: platform_user.unique_id,
                                        code: payload.otp,
                                        status: default_status
                                    }
                                }, { transaction: t });
                            })

                            if (validate_otp > 0) {
                                const token = sign({ platform_user_unique_id: platform_user.unique_id }, secret, {
                                    expiresIn: payload.remember_me ? 2592000 /* 30 days */ : 86400 // 24 hours
                                });

                                const platform_notification_data = {
                                    platform_unique_id: platform.unique_id,
                                    type: "Signin",
                                    action: `Signed in successfully via mobile!`,
                                    details: `ID: ${platform_user.unique_id}\nName: ${platform_user.firstname + (platform_user.middlename !== null ? " " + platform_user.middlename + " " : " ") + platform_user.lastname}\n\nOTP invalidated`
                                };
                                addPlatformNotification(req, res, platform_notification_data);

                                const return_data = {
                                    token,
                                    fullname: platform_user.firstname + (platform_user.middlename !== null ? " " + platform_user.middlename + " " : " ") + platform_user.lastname,
                                    mobile_number: platform_user.mobile_number,
                                };
                                SuccessResponse(res, { unique_id: platform_user.unique_id, text: "Logged in successfully!" }, return_data);
                            } else {
                                BadRequestError(res, { unique_id: platform_user.unique_id, text: "Error validating OTP!" }, null);
                            }
                        }
                    }
                } else {
                    NotFoundError(res, { unique_id: payload.mobile_number, text: "Platform not found" }, null);
                }
            } catch (err) {
                ServerError(res, { unique_id: payload.mobile_number, text: err.message }, null);
            }
        }
    } else {
        ValidationError(res, "Valid email or mobile number is required", null)
    }
};
