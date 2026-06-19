import { Router } from "express";
import bookingsController from "../controllers/admin/bookingsController.js";
import clinicsController from "../controllers/admin/clinicsController.js";
import leavesController from "../controllers/admin/leavesController.js";
import meController from "../controllers/admin/meController.js";
import profileController from "../controllers/admin/profileController.js";
import slotsController from "../controllers/admin/slotsController.js";
import scheduleController from "../controllers/admin/scheduleController.js";
import dashboardController from "../controllers/admin/dashboardController.js";

const adminRoutes = Router();

adminRoutes.all('/admin/bookings', bookingsController);
adminRoutes.all('/admin/clinics', clinicsController);
adminRoutes.all('/admin/leaves', leavesController);
adminRoutes.all('/admin/me', meController);
adminRoutes.all('/admin/profile', profileController);
adminRoutes.all('/admin/slots', slotsController);
adminRoutes.all('/admin/schedule', scheduleController);
adminRoutes.all('/admin/dashboard', dashboardController);

export default adminRoutes;