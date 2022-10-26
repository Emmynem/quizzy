import { checks } from "../middleware/index.js";
import { log_rules } from "../rules/logs.rules.js";
import { assessments_rules } from "../rules/assessments.rules.js";
import {
    endUserAssessmentLog, getUserAssessmentLog, getUserAssessmentLogs, rootGetAssessmentLog, 
    rootGetAssessmentLogs, startUserAssessmentLog
} from "../controllers/logs.controller.js";

export default function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/root/logs", [checks.verifyKey, checks.isAdministratorKey], rootGetAssessmentLogs);
    app.get("/root/log", [checks.verifyKey, checks.isAdministratorKey, log_rules.forFindingLogAlt], rootGetAssessmentLog);
    
    app.get("/assessment/logs", [checks.verifyToken, checks.isUser], getUserAssessmentLogs);
    app.get("/assessment/log", [checks.verifyToken, checks.isUser, log_rules.forFindingLog], getUserAssessmentLog);
    
    app.post("/assessment/log/start", [checks.verifyToken, checks.isUser, assessments_rules.forFindingAssessmentAlt], startUserAssessmentLog);
    
    app.put("/assessment/log/end", [checks.verifyToken, checks.isUser, assessments_rules.forFindingAssessmentAlt, log_rules.forFindingLog], endUserAssessmentLog);
};
