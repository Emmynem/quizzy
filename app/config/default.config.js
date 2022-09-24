import { v4 as uuidv4 } from 'uuid';
import db from "../models/index.js";
import { logger } from '../common/index.js';
import { api_key_start, random_uuid, default_status, max_free_candidates, max_free_assessments, 
    max_free_questions, max_free_answers, max_free_platform_users, free_assessment_duration, free_assessment_retakes, 
    max_paid_candidates, max_paid_assessments, max_paid_questions, max_paid_answers, max_paid_platform_users, 
    paid_assessment_duration, paid_assessment_retakes } from './config.js';

const API_KEYS = db.api_keys;
const APP_DEFAULTS = db.app_defaults;

export async function createAppDefaults() {

    const details = [
        {
            unique_id: uuidv4(),
            ...max_free_answers,
            status: default_status
        },
        {
            unique_id: uuidv4(),
            ...max_free_assessments,
            status: default_status
        },
        {
            unique_id: uuidv4(),
            ...max_free_candidates,
            status: default_status
        },
        {
            unique_id: uuidv4(),
            ...max_free_questions,
            status: default_status
        },
        {
            unique_id: uuidv4(),
            ...max_free_platform_users,
            status: default_status
        },
        {
            unique_id: uuidv4(),
            ...free_assessment_duration,
            status: default_status
        }, 
        {
            unique_id: uuidv4(),
            ...free_assessment_retakes,
            status: default_status
        },
        {
            unique_id: uuidv4(),
            ...max_paid_answers,
            status: default_status
        },
        {
            unique_id: uuidv4(),
            ...max_paid_assessments,
            status: default_status
        },
        {
            unique_id: uuidv4(),
            ...max_paid_candidates,
            status: default_status
        },
        {
            unique_id: uuidv4(),
            ...max_paid_questions,
            status: default_status
        },
        {
            unique_id: uuidv4(),
            ...max_paid_platform_users,
            status: default_status
        },
        {
            unique_id: uuidv4(),
            ...paid_assessment_duration,
            status: default_status
        },
        {
            unique_id: uuidv4(),
            ...paid_assessment_retakes,
            status: default_status
        }
    ];

    const count = await APP_DEFAULTS.count();

    if (count <= 0) {
        try {
            await db.sequelize.transaction((t) => {
                const appDefaults = APP_DEFAULTS.bulkCreate(details, { transaction: t });
                return appDefaults;
            })
            logger.info('Added app defaults');
        } catch (error) {
            logger.error('Error adding app defaults');
        }
    }

};

export async function createApiKeys() {

    const details = {
        unique_id: uuidv4(),
        type: "Internal",
        api_key: api_key_start + random_uuid(20),
        status: default_status
    };

    const count = await API_KEYS.count();

    if (count <= 0) {
        try {
            await db.sequelize.transaction((t) => {
                const apikey = API_KEYS.create(details, {transaction: t});
                return apikey;
            })
            logger.info('Added api keys defaults');
        } catch (error) {
            logger.error('Error adding api keys defaults');
        }
    }
};
