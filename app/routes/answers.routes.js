import { checks } from "../middleware/index.js";
import { answers_rules } from "../rules/answers.rules.js";
import { questions_rules } from "../rules/questions.rules.js";
import {
    addPlatformQuestionAnswer, deletePlatformQuestionAnswer, getPlatformQuestionAnswer, getPlatformQuestionAnswers, 
    removePlatformQuestionAnswer, restorePlatformQuestionAnswer, rootGetAnswers, rootGetQuestionAnswer, rootGetQuestionAnswers, 
    updatePlatformQuestionAnswerCriteria, updatePlatformQuestionAnswerDetails, updatePlatformQuestionAnswerOrder
} from "../controllers/answers.controller.js";

export default function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/root/answers", [checks.verifyKey, checks.isAdministratorKey], rootGetAnswers);
    app.get("/root/question/answers", [checks.verifyKey, checks.isAdministratorKey, questions_rules.forFindingQuestionAlt], rootGetQuestionAnswers);
    app.get("/root/question/answer", [checks.verifyKey, checks.isAdministratorKey, questions_rules.forFindingQuestionAlt, answers_rules.forFindingAnswerAlt], rootGetQuestionAnswer);
    
    app.get("/question/answers", [checks.verifyPlatformUserToken, checks.isPlatformUser, questions_rules.forFindingQuestionAlt], getPlatformQuestionAnswers);
    app.get("/question/answer", [checks.verifyPlatformUserToken, checks.isPlatformUser, answers_rules.forFindingAnswer], getPlatformQuestionAnswer);
    
    app.post("/question/answer", [checks.verifyPlatformUserToken, checks.isPlatformUser, questions_rules.forFindingQuestionAlt, answers_rules.forAdding], addPlatformQuestionAnswer);
    
    app.put("/question/answer/update/details", [checks.verifyPlatformUserToken, checks.isPlatformUser, answers_rules.forFindingAnswer, answers_rules.forUpdatingDetails], updatePlatformQuestionAnswerDetails);
    app.put("/question/answer/update/criteria", [checks.verifyPlatformUserToken, checks.isPlatformUser, answers_rules.forFindingAnswer, answers_rules.forUpdatingAnswer], updatePlatformQuestionAnswerCriteria);
    app.put("/question/answer/update/order", [checks.verifyPlatformUserToken, checks.isPlatformUser, answers_rules.forFindingAnswer, answers_rules.forUpdatingOrder], updatePlatformQuestionAnswerOrder);
    app.put("/question/answer/remove", [checks.verifyPlatformUserToken, checks.isPlatformUser, answers_rules.forFindingAnswer], removePlatformQuestionAnswer);
    app.put("/question/answer/restore", [checks.verifyPlatformUserToken, checks.isPlatformUser, answers_rules.forFindingAnswerFalsy], restorePlatformQuestionAnswer);
    
    app.delete("/question/answer", [checks.verifyPlatformUserToken, checks.isPlatformUser, answers_rules.forFindingAnswer], deletePlatformQuestionAnswer);
};
