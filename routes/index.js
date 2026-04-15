import { Router } from "express";
import publicRoutes from "./publicRoutes.js";
import adminRoutes from "./adminRoutes.js";

const routes = Router();

routes.use(publicRoutes);
routes.use(adminRoutes);

export default routes;