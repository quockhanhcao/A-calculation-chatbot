import express from "express";
import homepageController from "../controllers/homepageController";

let router = express.Router();

//init all web routes
let initWebRoutes = (app) => {
    router.get("/", homepageController.getHomepage);
    router.get("/webhook", homepageController.getWebhook);
    router.post("/webhook", homepageController.postWebhook);
    router.post('/setup', homepageController.handleSetupInfor); //set up the persistent menu and get started button
    router.get("/get-survey", homepageController.handleGetSurveyPage);
    router.post("/post-survey", homepageController.handlePostSurvey);

    return app.use("/", router);
};

module.exports = initWebRoutes;
