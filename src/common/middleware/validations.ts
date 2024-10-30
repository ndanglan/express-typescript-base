import { Request, NextFunction, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { ServiceResponse } from "@/common/models/serviceResponse";
import { handleServiceResponse } from "@/common/utils/httpHandlers";

export const validateFileName = (
 req: Request<{
  filename: string;
 }>,
 res: Response,
 next: NextFunction,
) => {
 const filename = req.params.filename;
 if (!filename) {
  return handleServiceResponse(
   ServiceResponse.failure(
    "No filename provided",
    null,
    StatusCodes.BAD_REQUEST,
   ),
   res,
  );
 }
 next();
};
