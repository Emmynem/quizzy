import { check } from 'express-validator';
import moment from 'moment';
import db from "../models/index.js";
import { default_status, check_length_TEXT, strip_text, return_default_value, check_pro_expiry, 
    validate_future_date, validate_future_end_date, default_delete_status } from '../config/config.js';

const PLATFORMS = db.platforms;
const ASSESSMENTS = db.assessments;
const APP_DEFAULTS = db.app_defaults;
const Op = db.Sequelize.Op;

export const assessments_rules = {
    forFindingAssessment: [
        check('platform_unique_id', "Platform Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(platform_unique_id => {
                return PLATFORMS.findOne({ where: { unique_id: platform_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Platform not found!');
                });
            }),
        check('unique_id', "Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom((unique_id, { req }) => {
                return ASSESSMENTS.findOne({
                    where: {
                        unique_id,
                        platform_unique_id: req.query.platform_unique_id || req.body.platform_unique_id || '',
                        status: default_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Assessment not found!');
                });
            })
    ],
    forFindingAssessmentFalsy: [
        check('platform_unique_id', "Platform Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(platform_unique_id => {
                return PLATFORMS.findOne({ where: { unique_id: platform_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Platform not found!');
                });
            }),
        check('unique_id', "Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom((unique_id, { req }) => {
                return ASSESSMENTS.findOne({
                    where: {
                        unique_id,
                        platform_unique_id: req.query.platform_unique_id || req.body.platform_unique_id || '',
                        status: default_delete_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Assessment not found!');
                });
            })
    ],
    forFindingAssessmentAlt: [
        check('assessment_unique_id', "Assessment Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(assessment_unique_id => {
                return ASSESSMENTS.findOne({ where: { unique_id: assessment_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Assessment not found!');
                });
            })
    ],
    forAdding: [
        check('platform_unique_id', "Platform Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(platform_unique_id => {
                return PLATFORMS.findOne({ where: { unique_id: platform_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Platform not found!');
                });
            })
            .bail()
            .custom(async platform_unique_id => {
                const assessment_count = await ASSESSMENTS.count({ where: { platform_unique_id } });

                const pro_details = await PLATFORMS.findOne({ attributes: ['pro', 'pro_expiring'], where: { unique_id: platform_unique_id } });
                const pro_expiry_date_status = pro_details['dataValues'].pro_expiring ? check_pro_expiry(pro_details['dataValues'].pro_expiring) : true;

                const _max_assessments = await APP_DEFAULTS.findOne({ where: { criteria: { [Op.like]: `%${pro_expiry_date_status === true ? "Max Free Assessments" : "Max Paid Assessments"}` } } });
                const max_assessments = return_default_value(_max_assessments['dataValues']);
                if (assessment_count >= max_assessments) return Promise.reject('Max assessments reached!');
            }),
        check('name', "Name is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 100 })
            .withMessage("Invalid length (3 - 100) characters")
            .bail()
            .custom((name, {req}) => {
                return ASSESSMENTS.findOne({ 
                    where: { 
                        stripped: strip_text(name), 
                        platform_unique_id: req.query.platform_unique_id || req.body.platform_unique_id || '',
                        status: default_status 
                    } 
                }).then(data => {
                    if (data) return Promise.reject('Assessment already exists!');
                });
            }),
        check('description', "Description is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isLength({ min: 3, max: check_length_TEXT })
            .withMessage(`Invalid length (3 - ${check_length_TEXT}) characters`),
        check('candidate_limit')
            .optional({ checkFalsy: false })
            .bail()
            .isInt()
            .custom(candidate_limit => {
                if (candidate_limit === 0) return false;
                else if (candidate_limit < 0) return false;
                else return true;
            })
            .withMessage("Limit invalid")
            .bail()
            .custom(async (candidate_limit, {req}) => {
                const pro_details = await PLATFORMS.findOne({ attributes: ['pro', 'pro_expiring'], where: { unique_id: req.query.platform_unique_id || req.body.platform_unique_id || '' } });
                const pro_expiry_date_status = pro_details['dataValues'].pro_expiring ? check_pro_expiry(pro_details['dataValues'].pro_expiring) : true;

                const _max_candidates = await APP_DEFAULTS.findOne({ where: { criteria: { [Op.like]: `%${pro_expiry_date_status === true ? "Max Free Candidates" : "Max Paid Candidates"}` } } });
                const max_candidates = return_default_value(_max_candidates['dataValues']);
                if (candidate_limit > max_candidates) return Promise.reject('Max candidate limit reached!');
            }),
        check('private', "Private is required")
            .exists({ checkNull: true, checkFalsy: false })
            .bail()
            .isBoolean()
            .withMessage("Value should be true or false"),
        check('start', "Start date and time is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(start => {
                const later = moment(start, "YYYY-MM-DD HH:mm", true);
                return later.isValid();
            })
            .withMessage("Invalid start datetime format (YYYY-MM-DD HH:mm)")
            .bail()
            .custom(start => !!validate_future_date(start))
            .withMessage("Invalid start datetime"),
        check('end')
            .optional({ checkFalsy: false })
            .bail()
            .custom(end => {
                const later = moment(end, "YYYY-MM-DD HH:mm", true);
                return later.isValid();
            })
            .withMessage("Invalid end datetime format (YYYY-MM-DD HH:mm)")
            .bail()
            .custom((end, { req }) => !!validate_future_end_date(req.query.start || req.body.start || '', end))
            .withMessage("Invalid end datetime"),
        check('duration')
            .optional({ checkFalsy: false })
            .bail()
            .isInt()
            .bail()
            .custom(duration => {
                if (duration === 0) return false;
                else if (duration < 0) return false;
                else return true;
            })
            .withMessage("Duration invalid, e.g. 30, 60 [1 hr], 90 [1 hr 30 mins] etc")
            .bail()
            .custom(async (duration, { req }) => {
                const pro_details = await PLATFORMS.findOne({ attributes: ['pro', 'pro_expiring'], where: { unique_id: req.query.platform_unique_id || req.body.platform_unique_id || '' } });
                const pro_expiry_date_status = pro_details['dataValues'].pro_expiring ? check_pro_expiry(pro_details['dataValues'].pro_expiring) : true;
                
                const _duration_enabled = await APP_DEFAULTS.findOne({ where: { criteria: { [Op.like]: `%${pro_expiry_date_status === true ? "Free Assessment Duration" : "Paid Assessment Duration"}` } } });
                const duration_enabled = return_default_value(_duration_enabled['dataValues']);
                if (!duration_enabled) return Promise.reject('Duration not available!');
            })
            .bail()
            .custom(async (duration, { req }) => {
                const pro_details = await PLATFORMS.findOne({ attributes: ['pro', 'pro_expiring'], where: { unique_id: req.query.platform_unique_id || req.body.platform_unique_id || '' } });
                const pro_expiry_date_status = pro_details['dataValues'].pro_expiring ? check_pro_expiry(pro_details['dataValues'].pro_expiring) : true;

                const _duration_limit = await APP_DEFAULTS.findOne({ where: { criteria: { [Op.like]: `%${pro_expiry_date_status === true ? "Free Assessment Duration Limit" : "Paid Assessment Duration Limit"}` } } });
                const duration_limit = return_default_value(_duration_limit['dataValues']);
                if (duration > duration_limit) return Promise.reject(`Duration invalid, max ${duration_limit} [Date - ${moment().minute(duration_limit)}]`);
            }),
        check('retakes')
            .optional({ checkFalsy: false })
            .bail()
            .isInt()
            .bail()
            .custom(retakes => {
                if (retakes === 0) return false;
                else if (retakes < 0) return false;
                else if (retakes > 100) return false;
                else return true;
            })
            .withMessage("Retake invalid, 1 - 100")
            .bail()
            .custom(async (retakes, { req }) => {
                const pro_details = await PLATFORMS.findOne({ attributes: ['pro', 'pro_expiring'], where: { unique_id: req.query.platform_unique_id || req.body.platform_unique_id || '' } });
                const pro_expiry_date_status = pro_details['dataValues'].pro_expiring ? check_pro_expiry(pro_details['dataValues'].pro_expiring) : true;

                const _retakes_enabled = await APP_DEFAULTS.findOne({ where: { criteria: { [Op.like]: `%${pro_expiry_date_status === true ? "Free Assessment Retakes" : "Paid Assessment Retakes"}` } } });
                const retakes_enabled = return_default_value(_retakes_enabled['dataValues']);
                if (!retakes_enabled) return Promise.reject('Retakes not available!');
            }),
    ],
    forUpdatingDetails: [
        check('name', "Name is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 100 })
            .withMessage("Invalid length (3 - 100) characters")
            .bail()
            .custom((name, { req }) => {
                return ASSESSMENTS.findOne({
                    where: {
                        stripped: strip_text(name),
                        unique_id: {
                            [Op.ne]: req.query.unique_id || req.body.unique_id || '',
                        },
                        platform_unique_id: req.query.platform_unique_id || req.body.platform_unique_id || '',
                        status: default_status
                    }
                }).then(data => {
                    if (data) return Promise.reject('Assessment already exists!');
                });
            }),
        check('description', "Description is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isLength({ min: 3, max: check_length_TEXT })
            .withMessage(`Invalid length (3 - ${check_length_TEXT}) characters`)
    ],
    forUpdatingPrivacy: [
        check('private', "Private is required")
            .exists({ checkNull: true, checkFalsy: false })
            .bail()
            .isBoolean()
            .withMessage("Value should be true or false")
    ],
    forUpdatingStartAndEnd: [
        check('start', "Start date and time is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(start => {
                const later = moment(start, "YYYY-MM-DD HH:mm", true);
                return later.isValid();
            })
            .withMessage("Invalid start datetime format (YYYY-MM-DD HH:mm)")
            .bail()
            .custom(start => !!validate_future_date(start))
            .withMessage("Invalid start datetime"),
        check('end')
            .optional({ checkFalsy: false })
            .bail()
            .custom(end => {
                const later = moment(end, "YYYY-MM-DD HH:mm", true);
                return later.isValid();
            })
            .withMessage("Invalid end datetime format (YYYY-MM-DD HH:mm)")
            .bail()
            .custom((end, { req }) => !!validate_future_end_date(req.query.start || req.body.start || '', end))
            .withMessage("Invalid end datetime")
    ],
    forUpdatingOthers: [
        check('candidate_limit')
            .optional({ checkFalsy: false })
            .bail()
            .isInt()
            .custom(candidate_limit => {
                if (candidate_limit === 0) return false;
                else if (candidate_limit < 0) return false;
                else return true;
            })
            .withMessage("Limit invalid")
            .bail()
            .custom(async (candidate_limit, { req }) => {
                const pro_details = await PLATFORMS.findOne({ attributes: ['pro', 'pro_expiring'], where: { unique_id: req.query.platform_unique_id || req.body.platform_unique_id || '' } });
                const pro_expiry_date_status = pro_details['dataValues'].pro_expiring ? check_pro_expiry(pro_details['dataValues'].pro_expiring) : true;

                const _max_candidates = await APP_DEFAULTS.findOne({ where: { criteria: { [Op.like]: `%${pro_expiry_date_status === true ? "Max Free Candidates" : "Max Paid Candidates"}` } } });
                const max_candidates = return_default_value(_max_candidates['dataValues']);
                if (candidate_limit > max_candidates) return Promise.reject('Max candidate limit reached!');
            }),
        check('duration')
            .optional({ checkFalsy: false })
            .bail()
            .isInt()
            .bail()
            .custom(duration => {
                if (duration === 0) return false;
                else if (duration < 0) return false;
                else return true;
            })
            .withMessage("Duration invalid, e.g. 30, 60 [1 hr], 90 [1 hr 30 mins] etc")
            .bail()
            .custom(async (duration, { req }) => {
                const pro_details = await PLATFORMS.findOne({ attributes: ['pro', 'pro_expiring'], where: { unique_id: req.query.platform_unique_id || req.body.platform_unique_id || '' } });
                const pro_expiry_date_status = pro_details['dataValues'].pro_expiring ? check_pro_expiry(pro_details['dataValues'].pro_expiring) : true;

                const _duration_enabled = await APP_DEFAULTS.findOne({ where: { criteria: { [Op.like]: `%${pro_expiry_date_status === true ? "Free Assessment Duration" : "Paid Assessment Duration"}` } } });
                const duration_enabled = return_default_value(_duration_enabled['dataValues']);
                if (!duration_enabled) return Promise.reject('Duration not available!');
            })
            .bail()
            .custom(async (duration, { req }) => {
                const pro_details = await PLATFORMS.findOne({ attributes: ['pro', 'pro_expiring'], where: { unique_id: req.query.platform_unique_id || req.body.platform_unique_id || '' } });
                const pro_expiry_date_status = pro_details['dataValues'].pro_expiring ? check_pro_expiry(pro_details['dataValues'].pro_expiring) : true;

                const _duration_limit = await APP_DEFAULTS.findOne({ where: { criteria: { [Op.like]: `%${pro_expiry_date_status === true ? "Free Assessment Duration Limit" : "Paid Assessment Duration Limit"}` } } });
                const duration_limit = return_default_value(_duration_limit['dataValues']);
                if (duration > duration_limit) return Promise.reject(`Duration invalid, max ${duration_limit} [Date - ${moment().minute(duration_limit)}]`);
            }),
        check('retakes')
            .optional({ checkFalsy: false })
            .bail()
            .isInt()
            .bail()
            .custom(retakes => {
                if (retakes === 0) return false;
                else if (retakes < 0) return false;
                else if (retakes > 100) return false;
                else return true;
            })
            .withMessage("Retake invalid, 1 - 100")
            .bail()
            .custom(async (retakes, { req }) => {
                const pro_details = await PLATFORMS.findOne({ attributes: ['pro', 'pro_expiring'], where: { unique_id: req.query.platform_unique_id || req.body.platform_unique_id || '' } });
                const pro_expiry_date_status = pro_details['dataValues'].pro_expiring ? check_pro_expiry(pro_details['dataValues'].pro_expiring) : true;

                const _retakes_enabled = await APP_DEFAULTS.findOne({ where: { criteria: { [Op.like]: `%${pro_expiry_date_status === true ? "Free Assessment Retakes" : "Paid Assessment Retakes"}` } } });
                const retakes_enabled = return_default_value(_retakes_enabled['dataValues']);
                if (!retakes_enabled) return Promise.reject('Retakes not available!');
            }),
    ]
};  