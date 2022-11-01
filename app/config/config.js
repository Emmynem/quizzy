import crypto from 'crypto';
import fs, { mkdirSync } from 'fs';
import path from 'path';
import { logger } from '../common/index.js';

const __basedir = path.join(__dirname, "../..", "");
const __document_quizzy = path.join(__dirname, "../../../", "quizzy-docs"); // change to - documents.quizzy.cloud, when deploy

export const secret = "quizzy-(#@(*$&(#)@(-secret-@*#)@*@)()#*_(*(%&-key";

// Password options
export const password_options = {
    minLength: 8,
    maxLength: 30,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1
};

// String lengths
export const check_length_TINYTEXT = 255;
export const check_length_TEXT = 65535;
export const check_length_MEDIUMTEXT = 16777215;
export const check_length_LONGTEXT = 4294967295;
// End - String lengths

// File lengths
export const file_length_5Mb = 5000000;
export const file_length_10Mb = 10000000;
export const file_length_15Mb = 15000000;
export const file_length_20Mb = 20000000;
export const file_length_25Mb = 25000000;
export const file_length_30Mb = 30000000;
export const file_length_35Mb = 35000000;
export const file_length_40Mb = 40000000;
export const file_length_45Mb = 45000000;
export const file_length_50Mb = 50000000;
export const file_length_55Mb = 55000000;
export const file_length_60Mb = 60000000;
export const file_length_65Mb = 65000000;
export const file_length_70Mb = 70000000;
export const file_length_75Mb = 75000000;
export const file_length_80Mb = 80000000;
export const file_length_85Mb = 85000000;
export const file_length_90Mb = 90000000;
export const file_length_95Mb = 95000000;
export const file_length_100Mb = 100000000;
// End - File lengths

// Paths and document names
export const default_profile_image = "https://documents.quizzy.cloud/resources/images/user.svg";
export const default_platform_image = "https://documents.quizzy.cloud/resources/images/platform.svg";
export const default_assessment_image = "https://documents.quizzy.cloud/resources/images/assessment.svg";
export const documents_path = __document_quizzy + "/resources/documents/";
export const save_document_domain = "https://documents.quizzy.cloud";
export const save_document_dir = "/resources/documents/";
export const save_image_dir = "/resources/images/";
export const save_document_path = save_document_domain + "/resources/documents/";
export const profile_image_document_name = "Profile Image";
// End - Paths and document names

// Creating paths if not available
const default_resources_path = path.parse(__document_quizzy + "/resources/");
const default_document_path = path.parse(__document_quizzy + "/resources/documents/");
const default_image_path = path.parse(__document_quizzy + "/resources/images/");

if (!fs.existsSync(__document_quizzy)) mkdirSync(__document_quizzy);
if (fs.existsSync(__document_quizzy) && !fs.existsSync(path.format(default_resources_path))) mkdirSync(path.format(default_resources_path));
if (fs.existsSync(__document_quizzy) && !fs.existsSync(path.format(default_document_path))) mkdirSync(path.format(default_document_path));
if (fs.existsSync(__document_quizzy) && !fs.existsSync(path.format(default_image_path))) mkdirSync(path.format(default_image_path));
// End - Creating paths if not available

// Accesses
export const access_granted = 1;
export const access_suspended = 2;
export const access_revoked = 3;
export const all_access = [access_granted, access_suspended, access_revoked];
// End - Accesses

// Routes
export const super_admin_routes = "all";
export const route_methods = ['GET', 'POST', 'PUT', 'DELETE'];
// End - Routes

// API Key
export const api_key_start = "quizzy_";
export const tag_internal_api_key = "Internal";
export const tag_external_api_key = "External";

// Platforms Access Url 
export const platform_access_url = "https://www.quizzy.cloud/platforms/access/";

// PG Age
export const pg_age = 13;

// App Admin Tag
export const tag_admin = "Administration";
export const tag_admin_api_key = "Administrator";

// App Defaults 
export const max_free_candidates = {
    criteria : "Max Free Candidates",
    data_type : "INTEGER",
    value : 100 
};

export const max_paid_candidates = {
    criteria: "Max Paid Candidates",
    data_type: "INTEGER",
    value: 5000
};

export const max_free_questions = {
    criteria: "Max Free Questions",
    data_type: "INTEGER",
    value: 20
};

export const max_paid_questions = {
    criteria: "Max Paid Questions",
    data_type: "INTEGER",
    value: 100
};

export const max_free_assessments = {
    criteria: "Max Free Assessments",
    data_type: "INTEGER",
    value: 10
};

export const max_paid_assessments = {
    criteria: "Max Paid Assessments",
    data_type: "INTEGER",
    value: 1000
};

export const max_free_answers = {
    criteria: "Max Free Answers",
    data_type: "INTEGER",
    value: 4
};

export const max_paid_answers = {
    criteria: "Max Paid Answers",
    data_type: "INTEGER",
    value: 6
};

export const max_free_platform_users = {
    criteria: "Max Free Platform Users",
    data_type: "INTEGER",
    value: 5
};

export const max_paid_platform_users = {
    criteria: "Max Paid Platform Users",
    data_type: "INTEGER",
    value: 50
};

export const free_assessment_duration = {
    criteria: "Free Assessment Duration",
    data_type: "BOOLEAN",
    value: "false"
};

export const paid_assessment_duration = {
    criteria: "Paid Assessment Duration",
    data_type: "BOOLEAN",
    value: "true"
};

export const free_assessment_retakes = {
    criteria: "Free Assessment Retakes",
    data_type: "BOOLEAN",
    value: "false"
};

export const paid_assessment_retakes = {
    criteria: "Paid Assessment Retakes",
    data_type: "BOOLEAN",
    value: "true"
};

export const free_assessment_duration_limit = {
    criteria: "Free Assessment Duration Limit",
    data_type: "INTEGER",
    value: 1440
};

export const paid_assessment_duration_limit = {
    criteria: "Paid Assessment Duration Limit",
    data_type: "INTEGER",
    value: 43800
};

// End - App Defaults

export const quizzy_header_token = "quizzy-access-token";
export const quizzy_header_key = "quizzy-access-key";

export const verified_status = 1;
export const unverified_status = 0;

export const false_status = false;
export const true_status = true;

export const default_status = 1;
export const default_delete_status = 0;
export const default_pending_status = 2;

export const app_defaults_data_type = ['STRING', 'INTEGER', 'BIGINT', 'BOOLEAN'];

export const today_str = () => {
    const d = new Date();
    const date_str = d.getFullYear() + "-" + ((d.getUTCMonth() + 1) < 10 ? "0" + (d.getUTCMonth() + 1) : (d.getUTCMonth() + 1)) + "-" + (d.getDate() < 10 ? "0" + d.getDate() : d.getDate());
    return date_str;
};

const time_zero_hundred = () => {
    const d = new Date();
    const time_str = (d.getHours() < 10 ? "0" + d.getHours() : d.getHours()) + "00";
    return time_str;
};

export const regex_index_of = (string, regex, startpos) => {
    let indexOf = string.substring(startpos || 0).search(regex);
    return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
};

export const url_path_without_limits = (path) => {
    const pattern = /[0-9]+/i;
    let _path = path.split(0, regex_index_of(path, pattern));
    return _path[0];
};

export const check_user_route = (method, path, routes) => {
    const _method = method;
    const _path = path;

    if (typeof routes === "string" && routes === "all") {
        return true;
    }
    else {
        try {
            const _routes = !Array.isArray(routes) ? JSON.parse(routes) : routes;

            for (let index = 0; index < _routes.length; index++) {
                const route_method = _routes[index]['method'];
                const route_path = _routes[index]['url'];
                if (_method == route_method && _path == route_path)
                    return true;
                else if ((_method == route_method && _path == route_path + "/") || (_method == route_method && _path + "/" == route_path))
                    return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    }
};

export const validate_platform_user_route = (routes) => {
    if (routes === super_admin_routes) return false
    else if (!Array.isArray(routes)) return false
    else if (routes.length === 0) return false
    else return true
};

export const validate_platform_user_route_max_length = (routes) => {
    if (routes === super_admin_routes) return true
    else if (!Array.isArray(routes)) return false
    else if (JSON.stringify(routes).length > check_length_TEXT) return false
    else return true
};

export const random_uuid = (length) => {
    if (length === undefined || length === null || length === 0) {
        let values = crypto.randomBytes(20).toString('hex');
        return values;
    }
    else {
        let values = crypto.randomBytes(length).toString('hex');
        return values;
    }
};

export const random_numbers = (length) => {
    if (length === undefined || length === null || length === 0) {
        return 0;
    }
    else {
        let rand_number = "";
        for (let index = 0; index < length; index++) {
            rand_number += Math.floor(Math.random() * 10);
        }
        return rand_number;
    }
};

export const check_pro_expiry = (expiring) => {
    let date1 = new Date();
    let date2 = new Date(expiring);

    if (date1.getTime() < date2.getTime())
        return false;

    return true;
};

export const strip_text = (text) => {
    //Lower case everything
    let string = text.toLowerCase();
    //Make alphanumeric (removes all other characters)
    string = string.replace(/[^a-z0-9_\s-]/g, "");
    //Clean up multiple dashes or whitespaces
    string = string.replace(/[\s-]+/g, " ");
    //Convert whitespaces and underscore to dash
    string = string.replace(/[\s_]/g, "-");
    return string;
};

export const rename_document = (firstname, lastname, document, filename) => {
    let fullname = firstname.toLowerCase() + "-" + lastname.toLowerCase();
    let document_txt = strip_text(document);
    let lastIndex = filename.lastIndexOf(".");
    let extension = filename.slice(lastIndex);
    let return_file = `${random_uuid(3)}-${today_str()}-${fullname}-${document_txt}-${time_zero_hundred()}-${random_uuid(3)}${extension}`;
    return return_file;
};

export const documents_path_alt = () => {
    let file_path = path.join(__document_quizzy, 'resources', 'documents');
    return file_path;
};

export const join_path_and_file = (file_name, req) => {
    let file_path = req.files[file_name] !== undefined ? path.join(__document_quizzy, 'resources', 'documents', req.files[file_name][0].filename) : null;
    return file_path;
};

export const remove_file = (file_name) => {
    fs.unlink(path.join(documents_path_alt(), file_name), (err) => {
        if (err) throw err;
        logger.warn(`${path.join(documents_path_alt(), file_name)} was deleted and replaced`);
    });
};

export const remove_unwanted_file = (file_name, req) => {
    if (req.files[file_name] !== undefined) fs.unlink(join_path_and_file(file_name, req), (err) => {
        if (err) throw err;
        logger.warn(`${join_path_and_file(file_name, req)} was deleted`);
    });
};

export const validate_pg_age_signup = (dob) => {
    const d = new Date(dob);
    const today = new Date();
    const year_diff = today.getFullYear() - d.getFullYear();
    if (d == "Invalid Date") return false;
    if (year_diff < pg_age) return false;
    return true;
};

export const return_default_value = (obj) => {
    const data_type = obj.data_type;
    const value = obj.value;

    switch (data_type) {
        case "STRING":
            return value;
        case "INTEGER":
            return parseInt(value);
        case "BIGINT":
            return parseInt(value);
        case "BOOLEAN":
            if (value == "true") return true;
            if (value == "false") return false;
        default:
            toString(value);
    }
};

export const validate_future_date = (date) => {
    const d = new Date(date);
    const today = new Date();
    if (d == "Invalid Date") return false;
    if (today.getTime() > d.getTime()) return false;
    return true;
};

export const validate_future_end_date = (_start, _end) => {
    const start = new Date(_start);
    const end = new Date(_end);
    if (start == "Invalid Date") return false;
    if (end == "Invalid Date") return false;
    if (start.getTime() >= end.getTime()) return false;
    return true;
};