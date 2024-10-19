import nextConnect from 'next-connect';
import multer from 'multer';

const path = require('path');

const upload = multer({
  storage: multer.diskStorage({
    destination: './public/uploads',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = path.extname(file.originalname) || '.png'; // Fallback if extension is missing
      cb(null, uniqueSuffix + extension); // Use the unique name with extension
    },
  }),
});

const apiRoute = nextConnect({
  onError(error, req, res) {
    res.status(501).json({ code: 1, data: null, msg: `Sorry something Happened! ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ code: 1, data: null, msg: `Method '${req.method}' Not Allowed` });
  },
});

const uploadMiddleware = upload.array('file');

apiRoute.use(uploadMiddleware);

apiRoute.post((req, res) => {
  if (req.files) {
    const fileUrl = `/uploads/${req.files[0].filename}`; // Adjust based on your directory structure    res.status(200).json({ code: 0, data: req.files, msg: 'success' });
    res.status(200).json({ code: 0, data: [{ url: fileUrl }], msg: 'success' });
  } else {
    res.status(400).json({ code: 1, data: null, msg: 'No files uploaded' });
  }
});

export default apiRoute;

export const config = {
  api: {
    // Disallow body parsing, consume as stream
    bodyParser: false,
  },
};