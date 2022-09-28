import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import db from "../models/index.js";
import { logger } from '../common/index.js';
import { api_key_start, random_uuid, default_status, max_free_candidates, max_free_assessments, 
    max_free_questions, max_free_answers, max_free_platform_users, free_assessment_duration, free_assessment_retakes, 
    max_paid_candidates, max_paid_assessments, max_paid_questions, max_paid_answers, max_paid_platform_users, 
    paid_assessment_duration, paid_assessment_retakes, free_assessment_duration_limit, paid_assessment_duration_limit, 
    strip_text, platform_access_url, save_document_domain, default_platform_image, access_granted, default_assessment_image } from './config.js';

const API_KEYS = db.api_keys;
const APP_DEFAULTS = db.app_defaults;
const PLATFORMS = db.platforms;
const PLATFORM_USERS = db.platform_users;
const ASSESSMENTS = db.assessments;
const QUESTIONS = db.questions;
const ANSWERS = db.answers;

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
            ...free_assessment_duration_limit,
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
        },
        {
            unique_id: uuidv4(),
            ...paid_assessment_duration_limit,
            status: default_status
        },
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

export async function createDefaultPlatform() {

    // Creating default platform
    const platform_unique_id = uuidv4();
    const platform_name = "Quizzy";
    const stripped = strip_text(platform_name);
    const next_month = moment().day(30).toDate();
    
    const details = {
        unique_id: platform_unique_id,
        name: platform_name,
        stripped,
        email: "default@quizzy.cloud",
        description: "This is Quizzy's default platform",
        token: random_uuid(20),
        access_url: platform_access_url + stripped,
        live_api_key: api_key_start + random_uuid(20),
        profile_image_base_url: save_document_domain,
        profile_image_dir: "/resources/images/",
        profile_image: default_platform_image,
        pro: true,
        pro_expiring: next_month,
        access: access_granted,
        status: default_status
    };

    const count = await PLATFORMS.count();

    if (count <= 0) {
        try {
            await db.sequelize.transaction((t) => {
                const platform = PLATFORMS.create(details, { transaction: t });
                return platform;
            })
            logger.info('Added platform defaults');
        } catch (error) {
            logger.error('Error adding platform defaults');
        }
    }

    // End of creating default platform

    // Creating default platform user
    const platform_user_unique_id = uuidv4();

    const platform_user_details = {
        unique_id: platform_user_unique_id,
        platform_unique_id,
        firstname: "John",
        middlename: null,
        lastname: "Doe",
        email: "johndoe@quizzy.cloud",
        mobile_number: null,
        gender: "Male",
        routes: "all",
        access: access_granted,
        status: default_status
    };

    const platform_user_count = await PLATFORM_USERS.count();

    if (platform_user_count <= 0) {
        try {
            await db.sequelize.transaction((t) => {
                const platform_user = PLATFORM_USERS.create(platform_user_details, { transaction: t });
                return platform_user;
            })
            logger.info('Added platform user defaults');
        } catch (error) {
            logger.error('Error adding platform user defaults');
        }
    }

    // End of creating default platform user

    // Creating default assessments
    const assessment_unique_id = uuidv4();
    const assessment_name = "Random Quiz";
    const assessment_stripped = strip_text(assessment_name);
    
    const assessment_details = {
        unique_id: assessment_unique_id,
        platform_unique_id,
        platform_user_unique_id,
        name: assessment_name,
        stripped: assessment_stripped,
        identifier: random_uuid(5),
        description: "A little quiz about your most favorite movies, music, lifestyle, actors and actresses etc.",
        background_image_base_url: save_document_domain,
        background_image_dir: "/resources/images/",
        background_image: default_assessment_image,
        candidate_limit: null,
        private: false,
        start: moment().minute(5).toDate(),
        end: null,
        duration: 60,
        retakes: 100,
        status: default_status
    };

    const assessment_count = await ASSESSMENTS.count();

    if (assessment_count <= 0) {
        try {
            await db.sequelize.transaction((t) => {
                const assessment = ASSESSMENTS.create(assessment_details, { transaction: t });
                return assessment;
            })
            logger.info('Added assessment defaults');
        } catch (error) {
            logger.error('Error adding assessment defaults');
        }
    }

    // End of creating default assessments

    // Creating default questions
    const question_unique_id_1 = uuidv4();
    const question_unique_id_2 = uuidv4();
    const question_unique_id_3 = uuidv4();
    const question_unique_id_4 = uuidv4();
    const question_unique_id_5 = uuidv4();
    const question_unique_id_6 = uuidv4();

    const question_details = [
        {
            unique_id: question_unique_id_1,
            platform_user_unique_id,
            assessment_unique_id,
            order: 1,
            question: "What's the name of star actors in the film Central Intelligence?",
            multiple_answer: false,
            status: default_status
        },
        {
            unique_id: question_unique_id_2,
            platform_user_unique_id,
            assessment_unique_id,
            order: 2,
            question: "Which song was featured in PUBG's (Player's Unknown BattleGround) season 5 gameplay?",
            multiple_answer: false,
            status: default_status
        },
        {
            unique_id: question_unique_id_3,
            platform_user_unique_id,
            assessment_unique_id,
            order: 3,
            question: "What's the current name of the telecommunications company previously known as Zain?",
            multiple_answer: true,
            status: default_status
        },
        {
            unique_id: question_unique_id_4,
            platform_user_unique_id,
            assessment_unique_id,
            order: 4,
            question: `Which artist did Eminem feature in the song "Beautiful Pain" ?Which song was featured in PUBG's (Player's Unknown BattleGround) season 5 gameplay?`,
            multiple_answer: false,
            status: default_status
        },
        {
            unique_id: question_unique_id_5,
            platform_user_unique_id,
            assessment_unique_id,
            order: 5,
            question: "What's the name of star actor in the series The Blacklist?",
            multiple_answer: false,
            status: default_status
        },
        {
            unique_id: question_unique_id_6,
            platform_user_unique_id,
            assessment_unique_id,
            order: 6,
            question: "Which song did Alan Walker feature Marshmello that made a hit in 2019 ?",
            multiple_answer: false,
            status: default_status
        }
    ];

    const question_count = await QUESTIONS.count();

    if (question_count <= 0) {
        try {
            await db.sequelize.transaction((t) => {
                const question = QUESTIONS.bulkCreate(question_details, { transaction: t });
                return question;
            })
            logger.info('Added question defaults');
        } catch (error) {
            logger.error('Error adding question defaults');
        }
    }

    // End of creating default questions

    // Creating default answers
    const answer_details = [
        {
            unique_id: uuidv4(),
            platform_user_unique_id,
            question_unique_id: question_unique_id_1,
            order: 1,
            option: "Rock and Hart",
            answer: false,
            status: default_status
        },
        {
            unique_id: uuidv4(),
            platform_user_unique_id,
            question_unique_id: question_unique_id_1,
            order: 2,
            option: "The Rock and Kevin",
            answer: false,
            status: default_status
        },
        {
            unique_id: uuidv4(),
            platform_user_unique_id,
            question_unique_id: question_unique_id_1,
            order: 3,
            option: "Dwayne Johnson and Kevin Hart",
            answer: true,
            status: default_status
        },
        {
            unique_id: uuidv4(),
            platform_user_unique_id,
            question_unique_id: question_unique_id_1,
            order: 4,
            option: "Hart and Rock head",
            answer: false,
            status: default_status
        },
        {
            unique_id: uuidv4(),
            platform_user_unique_id,
            question_unique_id: question_unique_id_2,
            order: 1,
            option: "On my way - Alan Walker",
            answer: true,
            status: default_status
        },
        {
            unique_id: uuidv4(),
            platform_user_unique_id,
            question_unique_id: question_unique_id_2,
            order: 2,
            option: "Routine - Alan Walker",
            answer: false,
            status: default_status
        },
        {
            unique_id: uuidv4(),
            platform_user_unique_id,
            question_unique_id: question_unique_id_2,
            order: 3,
            option: "Live Fast - Alan Walker",
            answer: false,
            status: default_status
        },
        {
            unique_id: uuidv4(),
            platform_user_unique_id,
            question_unique_id: question_unique_id_2,
            order: 4,
            option: "Lonely - Alan Walker",
            answer: false,
            status: default_status
        },
        {
            unique_id: uuidv4(),
            platform_user_unique_id,
            question_unique_id: question_unique_id_3,
            order: 1,
            option: "Glo",
            answer: false,
            status: default_status
        },
        {
            unique_id: uuidv4(),
            platform_user_unique_id,
            question_unique_id: question_unique_id_3,
            order: 2,
            option: "Airtel",
            answer: true,
            status: default_status
        },
        {
            unique_id: uuidv4(),
            platform_user_unique_id,
            question_unique_id: question_unique_id_3,
            order: 3,
            option: "Vodafone",
            answer: true,
            status: default_status
        },
        {
            unique_id: uuidv4(),
            platform_user_unique_id,
            question_unique_id: question_unique_id_3,
            order: 4,
            option: "MTN",
            answer: false,
            status: default_status
        },
        {
            unique_id: uuidv4(),
            platform_user_unique_id,
            question_unique_id: question_unique_id_4,
            order: 1,
            option: "Skylar Grey",
            answer: false,
            status: default_status
        },
        {
            unique_id: uuidv4(),
            platform_user_unique_id,
            question_unique_id: question_unique_id_4,
            order: 2,
            option: "Curtis (50 Cent) Jackson",
            answer: false,
            status: default_status
        },
        {
            unique_id: uuidv4(),
            platform_user_unique_id,
            question_unique_id: question_unique_id_4,
            order: 3,
            option: "Sia",
            answer: true,
            status: default_status
        },
        {
            unique_id: uuidv4(),
            platform_user_unique_id,
            question_unique_id: question_unique_id_4,
            order: 4,
            option: "Kendrick Lamar",
            answer: false,
            status: default_status
        },
        {
            unique_id: uuidv4(),
            platform_user_unique_id,
            question_unique_id: question_unique_id_5,
            order: 1,
            option: "Raymond Reddington",
            answer: false,
            status: default_status
        },
        {
            unique_id: uuidv4(),
            platform_user_unique_id,
            question_unique_id: question_unique_id_5,
            order: 2,
            option: "Hisan Hassani",
            answer: false,
            status: default_status
        },
        {
            unique_id: uuidv4(),
            platform_user_unique_id,
            question_unique_id: question_unique_id_5,
            order: 3,
            option: "Elizabeth Jefferson",
            answer: false,
            status: default_status
        },
        {
            unique_id: uuidv4(),
            platform_user_unique_id,
            question_unique_id: question_unique_id_5,
            order: 4,
            option: "James Spader",
            answer: true,
            status: default_status
        },
        {
            unique_id: uuidv4(),
            platform_user_unique_id,
            question_unique_id: question_unique_id_6,
            order: 1,
            option: "Routine",
            answer: false,
            status: default_status
        },
        {
            unique_id: uuidv4(),
            platform_user_unique_id,
            question_unique_id: question_unique_id_6,
            order: 2,
            option: "Alone",
            answer: true,
            status: default_status
        },
        {
            unique_id: uuidv4(),
            platform_user_unique_id,
            question_unique_id: question_unique_id_6,
            order: 3,
            option: "Ignite",
            answer: false,
            status: default_status
        },
        {
            unique_id: uuidv4(),
            platform_user_unique_id,
            question_unique_id: question_unique_id_6,
            order: 4,
            option: "Lonely",
            answer: false,
            status: default_status
        },
    ];

    const answer_count = await ANSWERS.count();

    if (answer_count <= 0) {
        try {
            await db.sequelize.transaction((t) => {
                const answer = ANSWERS.bulkCreate(answer_details, { transaction: t });
                return answer;
            })
            logger.info('Added answer defaults');
        } catch (error) {
            logger.error('Error adding answer defaults');
        }
    }

    // End of creating default answers

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
