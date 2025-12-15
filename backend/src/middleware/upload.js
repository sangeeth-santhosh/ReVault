import multer from 'multer';

const storage = multer.memoryStorage();

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only jpg, jpeg, png, webp are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { files: 4 },
});

export default upload;
