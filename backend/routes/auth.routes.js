const express = require('express');
const {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/fileUpload');
const router = express.Router();

router.post('/register', upload.single('photo'), register);
router.post('/login', login);
router.get('/me', protect, getMe);
// router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);

module.exports = router;