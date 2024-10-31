import { StatusCodes } from "http-status-codes";

import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger, s3 } from "@/server";
import { GetObjectCommand, GetObjectCommandInput } from "@aws-sdk/client-s3";

export class StreamService {
 constructor() {}

 async s3SendCommand(options: GetObjectCommandInput) {
  try {
   const data = await s3.send(new GetObjectCommand(options));

   return data;
  } catch (ex) {
   const errorMessage = `Error GetObjectCommand: $${(ex as Error).message}`;
   logger.error(errorMessage);
   return ServiceResponse.failure(
    "Error setting up video stream",
    null,
    StatusCodes.INTERNAL_SERVER_ERROR,
   );
  }
 }
}

export const streamService = new StreamService();
