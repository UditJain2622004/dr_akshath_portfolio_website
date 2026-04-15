import { Router } from "express";
import appointmentsController from "../controllers/public/appointmentsController.js";
import doctorsController from "../controllers/public/doctorsController.js";
import healthCheckupsController from "../controllers/public/healthCheckupsController.js";
import slotsController from "../controllers/public/slotsController.js";

const publicRoutes = Router();

publicRoutes.all("/appointments", appointmentsController);
publicRoutes.all("/doctors", doctorsController);
publicRoutes.all("/healthCheckups", healthCheckupsController);
publicRoutes.all("/slots", slotsController);

export default publicRoutes;