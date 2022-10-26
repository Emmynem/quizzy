import { checks } from "../middleware/index.js";
import { questions_rules } from "../rules/questions.rules.js";
import { assessments_rules } from "../rules/assessments.rules.js";
import {
    addPlatformAssessmentQuestion, deletePlatformAssessmentQuestion, getPlatformAssessmentQuestion, 
    getPlatformAssessmentQuestions, removePlatformAssessmentQuestion, restorePlatformAssessmentQuestion,
    rootGetAssessmentQuestion, rootGetAssessmentQuestions, rootGetQuestions, updatePlatformAssessmentQuestionCriteria, 
    updatePlatformAssessmentQuestionDetails, updatePlatformAssessmentQuestionOrder
} from "../controllers/questions.controller.js";

export default function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/root/questions", [checks.verifyKey, checks.isAdministratorKey], rootGetQuestions);
    app.get("/root/assessment/questions", [checks.verifyKey, checks.isAdministratorKey, assessments_rules.forFindingAssessmentAlt], rootGetAssessmentQuestions);
    app.get("/root/assessment/question", [checks.verifyKey, checks.isAdministratorKey, assessments_rules.forFindingAssessmentAlt, questions_rules.forFindingQuestionAlt], rootGetAssessmentQuestion);

    app.get("/assessment/questions", [checks.verifyPlatformUserToken, checks.isPlatformUser, assessments_rules.forFindingAssessmentAlt], getPlatformAssessmentQuestions);
    app.get("/assessment/question", [checks.verifyPlatformUserToken, checks.isPlatformUser, questions_rules.forFindingQuestion], getPlatformAssessmentQuestion);
    
    app.post("/assessment/question", [checks.verifyPlatformUserToken, checks.isPlatformUser, assessments_rules.forFindingAssessmentAlt, questions_rules.forAdding], addPlatformAssessmentQuestion);
    
    app.put("/assessment/question/update/details", [checks.verifyPlatformUserToken, checks.isPlatformUser, questions_rules.forFindingQuestion, questions_rules.forUpdatingDetails], updatePlatformAssessmentQuestionDetails);
    app.put("/assessment/question/update/criteria", [checks.verifyPlatformUserToken, checks.isPlatformUser, questions_rules.forFindingQuestion, questions_rules.forUpdatingMultipleAnswer], updatePlatformAssessmentQuestionCriteria);
    app.put("/assessment/question/update/order", [checks.verifyPlatformUserToken, checks.isPlatformUser, questions_rules.forFindingQuestion, questions_rules.forUpdatingOrder], updatePlatformAssessmentQuestionOrder);
    app.put("/assessment/question/remove", [checks.verifyPlatformUserToken, checks.isPlatformUser, questions_rules.forFindingQuestion], removePlatformAssessmentQuestion);
    app.put("/assessment/question/restore", [checks.verifyPlatformUserToken, checks.isPlatformUser, questions_rules.forFindingQuestionFalsy], restorePlatformAssessmentQuestion);
    
    app.delete("/assessment/question", [checks.verifyPlatformUserToken, checks.isPlatformUser, questions_rules.forFindingQuestion], deletePlatformAssessmentQuestion);
};
