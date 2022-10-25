import { checks } from "../middleware/index.js";
import { platform_rules } from "../rules/platforms.rules.js";
import {
    getPlatform, proPlatformDowngrade, proPlatformUpgrade, removePlatform, removePlatformPermanently, 
    restorePlatform, rootGetPlatform, rootGetPlatforms, updatePlatform, updatePlatformAccessGranted,
    updatePlatformAccessRevoked, updatePlatformAccessSuspended
} from "../controllers/platforms.controller.js";

export default function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/root/platforms", [checks.verifyKey, checks.isAdministratorKey], rootGetPlatforms);
    app.get("/root/platform", [checks.verifyKey, checks.isAdministratorKey], rootGetPlatform);

    app.get("/platform", [checks.verifyPlatformUserToken, checks.isPlatformUser], getPlatform);

    app.post("/platform/upgrade/via/token", [platform_rules.forFindingPlatformViaToken], proPlatformUpgrade);
    app.post("/platform/downgrade/via/token", [platform_rules.forFindingPlatformViaToken], proPlatformDowngrade);

    app.put("/platform", [checks.verifyPlatformUserToken, checks.isPlatformUser, platform_rules.forEditing], updatePlatform);

    app.put("/root/platform", [checks.verifyKey, checks.isAdministratorKey, platform_rules.forFindingPlatform, platform_rules.forEditing], updatePlatform);
    app.put("/root/platform/access/granted", [checks.verifyKey, checks.isAdministratorKey, platform_rules.forFindingPlatform], updatePlatformAccessGranted);
    app.put("/root/platform/access/suspended", [checks.verifyKey, checks.isAdministratorKey, platform_rules.forFindingPlatform], updatePlatformAccessSuspended);
    app.put("/root/platform/access/revoked", [checks.verifyKey, checks.isAdministratorKey, platform_rules.forFindingPlatform], updatePlatformAccessRevoked);
    app.put("/root/platform/remove", [checks.verifyKey, checks.isAdministratorKey, platform_rules.forFindingPlatform], removePlatform);
    app.put("/root/platform/restore", [checks.verifyKey, checks.isAdministratorKey, platform_rules.forFindingPlatformFalsy], restorePlatform);

    app.delete("/root/platform/delete", [checks.verifyKey, checks.isAdministratorKey, platform_rules.forFindingPlatform], removePlatformPermanently);
};
