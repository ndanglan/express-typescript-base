import multer from "multer";

const configMulter = (dest: string) => {
 return multer({ dest });
};

const upload = configMulter("../../../../uploads/");

const uploadMiddleware = upload.single("video");

export { uploadMiddleware, configMulter };
