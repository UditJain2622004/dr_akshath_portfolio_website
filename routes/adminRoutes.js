import { Router } from "express";
import bookingsController from "../controllers/admin/bookingsController.js";
import doctorsController from "../controllers/admin/doctorsController.js";
import healthCheckupsController from "../controllers/admin/healthCheckupsController.js";
import leavesController from "../controllers/admin/leavesController.js";
import meController from "../controllers/admin/meController.js";
import profileController from "../controllers/admin/profileController.js";
import slotsController from "../controllers/admin/slotsController.js";

const adminRoutes = Router();

adminRoutes.all("/admin/bookings", bookingsController);
adminRoutes.all("/admin/doctors", doctorsController);
adminRoutes.all("/admin/healthCheckups", healthCheckupsController);
adminRoutes.all("/admin/leaves", leavesController);
adminRoutes.all("/admin/me", meController);
adminRoutes.all("/admin/profile", profileController);
adminRoutes.all("/admin/slots", slotsController);

export default adminRoutes;