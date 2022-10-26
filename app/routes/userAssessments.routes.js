import { checks } from "../middleware/index.js";
import { assessments_rules } from "../rules/assessments.rules.js";
import { questions_rules } from "../rules/questions.rules.js";
import { answers_rules } from "../rules/answers.rules.js";
import { log_rules } from "../rules/logs.rules.js";
import {
    addUserAssessmentAnswers, getUserAssessments, getUserAssessmentsSpecifically, rootGetUserAssessments, 
    rootGetUserAssessmentsSpecifically
} from "../controllers/userAssessments.controller.js";

export default function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/root/user/assessments", [checks.verifyKey, checks.isAdministratorKey], rootGetUserAssessments);
    app.get("/root/user/assessments/sort/assessment", [checks.verifyKey, checks.isAdministratorKey, assessments_rules.forFindingAssessmentAlt], rootGetUserAssessmentsSpecifically);
    app.get("/root/user/assessments/sort/question", [checks.verifyKey, checks.isAdministratorKey, questions_rules.forFindingQuestionAlt], rootGetUserAssessmentsSpecifically);
    
    app.get("/user/assessments", [checks.verifyToken, checks.isUser], getUserAssessments);
    app.get("/user/assessments/sort/assessment", [checks.verifyToken, checks.isUser, assessments_rules.forFindingAssessmentAlt], getUserAssessmentsSpecifically);
    app.get("/user/assessments/sort/question", [checks.verifyToken, checks.isUser, questions_rules.forFindingQuestionAlt], getUserAssessmentsSpecifically);
    
    app.post("/user/assessment/", [checks.verifyToken, checks.isUser, assessments_rules.forFindingAssessmentAlt, questions_rules.forFindingQuestionAlt, answers_rules.forFindingAnswerAlt, log_rules.forFindingLogAlt], addUserAssessmentAnswers);
};
