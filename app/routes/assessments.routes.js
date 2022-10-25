import { checks } from "../middleware/index.js";
import { assessments_rules } from "../rules/assessments.rules.js";
import {
    addPlatformAssessment, getPlatformAssessment, getPlatformAssessments, rootGetAssessment, rootGetAssessments, 
    updatePlatformAssessmentDetails, updatePlatformAssessmentCriteria, updatePlatformAssessmentPrivacy, 
    updatePlatformAssessmentTimeline, deletePlatformAssessment, removePlatformAssessment, restorePlatformAssessment
} from "../controllers/assessments.controller.js";

export default function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/root/assessments", [checks.verifyKey, checks.isAdministratorKey], rootGetAssessments);
    app.get("/root/assessment", [checks.verifyKey, checks.isAdministratorKey, assessments_rules.forFindingAssessmentAlt], rootGetAssessment);

    app.get("/assessments", [checks.verifyPlatformUserToken, checks.isPlatformUser], getPlatformAssessments);
    app.get("/assessment", [checks.verifyPlatformUserToken, checks.isPlatformUser, assessments_rules.forFindingAssessment], getPlatformAssessment);

    app.post("/assessment", [checks.verifyPlatformUserToken, checks.isPlatformUser, assessments_rules.forAdding], addPlatformAssessment);

    app.put("/assessment/update/details", [checks.verifyPlatformUserToken, checks.isPlatformUser, assessments_rules.forFindingAssessment, assessments_rules.forUpdatingDetails], updatePlatformAssessmentDetails);
    app.put("/assessment/update/privacy", [checks.verifyPlatformUserToken, checks.isPlatformUser, assessments_rules.forFindingAssessment, assessments_rules.forUpdatingPrivacy], updatePlatformAssessmentPrivacy);
    app.put("/assessment/update/timeline", [checks.verifyPlatformUserToken, checks.isPlatformUser, assessments_rules.forFindingAssessment, assessments_rules.forUpdatingStartAndEnd], updatePlatformAssessmentTimeline);
    app.put("/assessment/update/criteria", [checks.verifyPlatformUserToken, checks.isPlatformUser, assessments_rules.forFindingAssessment, assessments_rules.forUpdatingOthers], updatePlatformAssessmentCriteria);
    app.put("/assessment/remove", [checks.verifyPlatformUserToken, checks.isPlatformUser, assessments_rules.forFindingAssessment], removePlatformAssessment);
    app.put("/assessment/restore", [checks.verifyPlatformUserToken, checks.isPlatformUser, assessments_rules.forFindingAssessmentFalsy], restorePlatformAssessment);

    app.delete("/assessment", [checks.verifyPlatformUserToken, checks.isPlatformUser, assessments_rules.forFindingAssessment], deletePlatformAssessment);
};
