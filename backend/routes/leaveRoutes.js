const express = require('express');
const router = express.Router();

const {
  fetchLeaveBalance,
  fetchUsersOnLeaveToday,
  fetchLeaveTypes,
  approveLeaveHandler,
  rejectLeaveHandler,
  requestLeaveHandler,
  getLeaveHistoryHandler,
  cancelLeaveHandler,
  getIncomingRequestsHandler,
  createLeaveHandler,
  updateLeaveHandler,
  deleteLeaveHandler
} = require('../controllers/leaveController');
const { authMiddleware, roleMiddleware } = require('../middleware/middleware');

router.get('/balance/:userId', authMiddleware, fetchLeaveBalance);
router.post('/request', authMiddleware, requestLeaveHandler);
router.get('/history/:userId', authMiddleware, getLeaveHistoryHandler);
router.put('/cancel/:leaveRequestId', authMiddleware, cancelLeaveHandler);
router.get('/types', authMiddleware, fetchLeaveTypes);
router.get('/requests/:userId', authMiddleware, getIncomingRequestsHandler);
router.put('/approve/:approveId', authMiddleware, approveLeaveHandler);
router.put('/reject/:rejectId', authMiddleware, rejectLeaveHandler);
router.get('/on-leave-today', authMiddleware, roleMiddleware('admin'), fetchUsersOnLeaveToday);
router.post('/create-leave-type', authMiddleware, roleMiddleware('admin'), createLeaveHandler);
router.put('/types/:id', authMiddleware, roleMiddleware('admin'), updateLeaveHandler);
router.delete('/types/:id', authMiddleware, roleMiddleware('admin'), deleteLeaveHandler);

module.exports = router;