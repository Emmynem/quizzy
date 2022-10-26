import { checks } from "../middleware/index.js";
import { platform_notification_rules } from "../rules/platformNotifications.rules.js";
import {
    getPlatformNotification, getPlatformNotifications, removePlatformNotification, rootGetNotifications, updatePlatformNotificationSeen
} from "../controllers/platformNotifications.controller.js";

export default function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/root/platform/notifications", [checks.verifyKey, checks.isAdministratorKey], rootGetNotifications);

    app.get("/platform/notifications", [checks.verifyPlatformUserToken, checks.isPlatformUser], getPlatformNotifications);
    app.get("/platform/notification", [checks.verifyPlatformUserToken, checks.isPlatformUser], getPlatformNotification);

    app.put("/platform/notification/seen", [checks.verifyPlatformUserToken, checks.isPlatformUser, platform_notification_rules.forFindingPlatformNotificationAlt], updatePlatformNotificationSeen);

    app.delete("/platform/notification", [checks.verifyPlatfToken, checks.isPlatformUser, platform_notification_rules.forFindingPlatformNotificationAlt], removePlatformNotification);
};
