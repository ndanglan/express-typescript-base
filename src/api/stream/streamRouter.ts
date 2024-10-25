import express, { Request, Response, Router } from "express";

import { env } from "@/common/utils/envConfig";

export const streamRouter: Router = express.Router();
streamRouter.get("/", (req: Request, res: Response) => {});
