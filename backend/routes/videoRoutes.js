const express = require('express');
const router = express.Router();
const {
  toggleVideoStatus,
  updateVideoNotes,
  deleteVideoNotes,
  bulkUpdateStatus
} = require('../controllers/videoController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/bulk-status', bulkUpdateStatus);
router.patch('/:id/status', toggleVideoStatus);
router.route('/:id/notes')
  .put(updateVideoNotes)
  .delete(deleteVideoNotes);

module.exports = router;
