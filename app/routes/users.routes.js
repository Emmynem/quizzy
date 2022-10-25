import { checks } from "../middleware/index.js";
import { user_rules } from "../rules/users.rules.js";
import { 
    getUser, proUserDowngrade, proUserUpgrade, removeUser, removeUserPermanently, restoreUser, rootGetUser, 
    rootGetUsers, updateUser, updateUserAccessGranted, updateUserAccessRevoked, updateUserAccessSuspended, updateUserEmailVerified, 
    updateUserMobileNumberVerified 
} from "../controllers/users.controller.js";

export default function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/root/users", [checks.verifyKey, checks.isAdministratorKey], rootGetUsers);
    app.get("/root/user", [checks.verifyKey, checks.isAdministratorKey], rootGetUser);

    app.get("/user", [checks.verifyToken, checks.isUser], getUser);
    
    app.post("/user/verify/email", [user_rules.forFindingUserEmailForVerification], updateUserEmailVerified);
    app.post("/user/verify/mobile", [user_rules.forFindingUserMobileNumberForVerification], updateUserMobileNumberVerified);
    app.post("/user/upgrade/via/email", [user_rules.forFindingUserEmailForVerification], proUserUpgrade);
    app.post("/user/upgrade/via/mobile", [user_rules.forFindingUserMobileNumberForVerification], proUserUpgrade);
    app.post("/user/downgrade/via/email", [user_rules.forFindingUserEmailForVerification], proUserDowngrade);
    app.post("/user/downgrade/via/mobile", [user_rules.forFindingUserMobileNumberForVerification], proUserDowngrade);

    app.put("/user", [checks.verifyToken, checks.isUser, user_rules.forUpdating], updateUser);

    app.put("/root/user", [checks.verifyKey, checks.isAdministratorKey, user_rules.forFindingUser, user_rules.forUpdating], updateUser);
    app.put("/root/user/access/granted", [checks.verifyKey, checks.isAdministratorKey, user_rules.forFindingUser], updateUserAccessGranted);
    app.put("/root/user/access/suspended", [checks.verifyKey, checks.isAdministratorKey, user_rules.forFindingUser], updateUserAccessSuspended);
    app.put("/root/user/access/revoked", [checks.verifyKey, checks.isAdministratorKey, user_rules.forFindingUser], updateUserAccessRevoked);
    app.put("/root/user/remove", [checks.verifyKey, checks.isAdministratorKey, user_rules.forFindingUser], removeUser);
    app.put("/root/user/restore", [checks.verifyKey, checks.isAdministratorKey, user_rules.forFindingUserFalsy], restoreUser);

    app.delete("/root/user/delete", [checks.verifyKey, checks.isAdministratorKey, user_rules.forFindingUser], removeUserPermanently);
};
