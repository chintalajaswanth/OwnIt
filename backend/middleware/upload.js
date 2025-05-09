const multer = require('multer');
const path = require('path');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Store images in the 'uploads/products' directory
    cb(null, 'uploads/products/');
  },
  filename: function (req, file, cb) {
    // Create a unique filename using the current timestamp
    cb(null, `product-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Create file filter to accept only images
const fileFilter = (req, file, cb) => {
  // Only allow image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB max file size per image
  }
});
module.exports = upload;
