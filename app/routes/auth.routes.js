import { user_rules } from "../rules/users.rules.js";
import { platform_rules } from "../rules/platforms.rules.js";
import { userSignUp, userSigninViaEmail, userSigninViaMobile, platformSignUp, platformUserSignin, platformUserVerifyOtp } from "../controllers/auth.controller.js";

export default function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    // User Auth Routes
    app.post("/auth/user/signin/email", [user_rules.forEmailLogin], userSigninViaEmail);
    app.post("/auth/user/signin/mobile", [user_rules.forMobileLogin, userSigninViaMobile]);
    app.post("/auth/user/signup", [user_rules.forAdding], userSignUp);

    // Platform Auth Routes
    app.post("/auth/platform/access/:stripped", [platform_rules.forPlatformLogin], platformUserSignin);
    app.post("/auth/platform/access/:stripped/verify", [platform_rules.forVerifyingOtp], platformUserVerifyOtp);
    app.post("/auth/platform/signup/", [platform_rules.forAdding], platformSignUp);
};