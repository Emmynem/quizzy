import express, { json, urlencoded } from "express";
import path from 'path';
import cors from "cors";
import helmet from "helmet";
import { SuccessResponse } from './common/index.js';
import { quizzy_header_key, quizzy_header_token } from './config/config.js';
import logger from "./common/logger.js";
import morganMiddleware from "./middleware/morgan.js";
import db from "./models/index.js";
import { createApiKeys, createAppDefaults, createDefaultPlatform } from './config/default.config.js';
import answersRoutes from './routes/answers.routes.js';
import assessmentsRoutes from './routes/assessments.routes.js';
import authRoutes from './routes/auth.routes.js';
import logsRoutes from './routes/logs.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';
import platformNotificationsRoutes from './routes/platformNotifications.routes.js';
import platformsRoutes from './routes/platforms.routes.js';
import questionsRoutes from './routes/questions.routes.js';
import userAssessmentsRoutes from './routes/userAssessments.routes.js';
import usersRoutes from './routes/users.routes.js';

const app = express();

//options for cors midddleware
const options = cors.CorsOptions = {
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        quizzy_header_key,
        quizzy_header_token
    ],
    methods: 'GET,PUT,POST,DELETE',
};

app.use(json({ limit:    '100mb' }));
app.use(urlencoded({ extended: true, limit: '100mb' }));
app.use(helmet());
app.use(morganMiddleware);

// add cors
app.use(cors(options));

// simple route
app.get("/", (request, response) => {
    SuccessResponse(response, "Quizzy server activated.");
})

// Sequelize initialization
db.sequelize.sync().then(() => {
    logger.info("DB Connected 🚀");
    // creating defaults
    createApiKeys();
    createAppDefaults();
    createDefaultPlatform();
});

app.use(express.static(path.join(__dirname, '../public')));

// Binding routes
answersRoutes(app);
assessmentsRoutes(app);
authRoutes(app);
logsRoutes(app);
notificationsRoutes(app);
platformNotificationsRoutes(app);
platformsRoutes(app);
questionsRoutes(app);
userAssessmentsRoutes(app);
usersRoutes(app);

// change timezone for app
process.env.TZ = "Africa/Lagos";

export default app;

