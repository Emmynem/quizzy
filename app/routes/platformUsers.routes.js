import { checks } from "../middleware/index.js";
import { platform_user_rules } from "../rules/platformUsers.rules.js";
import {
    addPlatformUser, deletePlatformUser, getPlatformUser, getPlatformUserDetails, getPlatformUsers,
    removePlatformUser, restorePlatformUser, rootGetPlatformUser, rootGetPlatformUsers, updatePlatformUserAccessGranted,
    updatePlatformUserAccessRevoked, updatePlatformUserAccessSuspended, updatePlatformUserDetails, updatePlatformUserProfileDetails, updatePlatformUserRoutes
} from "../controllers/platformUsers.controller.js";

export default function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/root/platform/users", [checks.verifyKey, checks.isAdministratorKey], rootGetPlatformUsers);
    app.get("/root/platform/user", [checks.verifyKey, checks.isAdministratorKey, platform_user_rules.forFindingPlatformUserAlt], rootGetPlatformUser);

    app.get("/platform/users", [checks.verifyPlatformUserToken, checks.isPlatformUser], getPlatformUsers);
    app.get("/platform/user", [checks.verifyPlatformUserToken, checks.isPlatformUser, platform_user_rules.forFindingPlatformUser], getPlatformUser);
    app.get("/platform/user/details", [checks.verifyPlatformUserToken, checks.isPlatformUser], getPlatformUserDetails);

    app.post("/platform/user", [checks.verifyPlatformUserToken, checks.isPlatformUser, platform_user_rules.forAdding], addPlatformUser);

    app.put("/platform/user/update/profile/details", [checks.verifyPlatformUserToken, checks.isPlatformUser, platform_user_rules.forUpdatingDetails], updatePlatformUserProfileDetails);
    app.put("/platform/user/update/details", [checks.verifyPlatformUserToken, checks.isPlatformUser, platform_user_rules.forFindingPlatformUser, platform_user_rules.forUpdatingDetails], updatePlatformUserDetails);
    app.put("/platform/user/update/routes", [checks.verifyPlatformUserToken, checks.isPlatformUser, platform_user_rules.forFindingPlatformUser, platform_user_rules.forUpdatingRoutes], updatePlatformUserRoutes);
    app.put("/platform/user/access/granted", [checks.verifyPlatformUserToken, checks.isPlatformUser, platform_user_rules.forFindingPlatformUser], updatePlatformUserAccessGranted);
    app.put("/platform/user/access/suspended", [checks.verifyPlatformUserToken, checks.isPlatformUser, platform_user_rules.forFindingPlatformUser], updatePlatformUserAccessSuspended);
    app.put("/platform/user/access/revoked", [checks.verifyPlatformUserToken, checks.isPlatformUser, platform_user_rules.forFindingPlatformUser], updatePlatformUserAccessRevoked);
    app.put("/platform/user/remove", [checks.verifyPlatformUserToken, checks.isPlatformUser, platform_user_rules.forFindingPlatformUser], removePlatformUser);
    app.put("/platform/user/restore", [checks.verifyPlatformUserToken, checks.isPlatformUser, platform_user_rules.forFindingPlatformUserFalsy], restorePlatformUser);

    app.delete("/platform/user", [checks.verifyPlatformUserToken, checks.isPlatformUser, platform_user_rules.forFindingPlatformUser], deletePlatformUser);
};
