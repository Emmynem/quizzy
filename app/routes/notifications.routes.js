import { checks } from "../middleware/index.js";
import { notification_rules } from "../rules/notifications.rules.js";
import {
    getUserNotification, getUserNotifications, removeUserNotification, rootGetNotifications, updateUserNotificationSeen
} from "../controllers/notifications.controller.js";

export default function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/root/notifications", [checks.verifyKey, checks.isAdministratorKey], rootGetNotifications);

    app.get("/notifications", [checks.verifyToken, checks.isUser], getUserNotifications);
    app.get("/notification", [checks.verifyToken, checks.isUser, notification_rules.forFindingNotificationAlt], getUserNotification);

    app.put("/notification/seen", [checks.verifyToken, checks.isUser, notification_rules.forFindingNotificationAlt], updateUserNotificationSeen);

    app.delete("/notification", [checks.verifyToken, checks.isUser, notification_rules.forFindingNotificationAlt], removeUserNotification);
};
