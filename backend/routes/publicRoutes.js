import { Router } from "express";
import appointmentsController from "../controllers/public/appointmentsController.js";
import slotsController from "../controllers/public/slotsController.js";
import doctorController from "../controllers/public/doctorController.js";
import clinicsController from "../controllers/public/clinicsController.js";

const publicRoutes = Router();

publicRoutes.all('/appointments', appointmentsController);
publicRoutes.all('/slots', slotsController);
publicRoutes.all('/doctor', doctorController);
publicRoutes.all('/clinics', clinicsController);

export default publicRoutes;