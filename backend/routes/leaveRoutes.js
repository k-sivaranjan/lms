const express = require('express');
const router = express.Router();

const {
  fetchUsersOnLeaveToday,
  fetchTeamLeave,
  fetchLeaveBalance,
  fetchLeaveTypes,
  requestLeaveHandler,
  getLeaveHistoryHandler,
  cancelLeaveHandler,
  getIncomingRequestsHandler,
  approveLeaveHandler,
  rejectLeaveHandler,
  createLeaveHandler,
  updateLeaveHandler,
  deleteLeaveHandler
} = require('../controllers/leaveController');

const { authMiddleware, roleMiddleware } = require('../middleware/middleware');

//Leave Request and History
router.post('/request', authMiddleware, requestLeaveHandler);
router.put('/cancel/:leaveRequestId', authMiddleware, cancelLeaveHandler);
router.get('/history/:userId', authMiddleware, getLeaveHistoryHandler);

//Leave Balance
router.get('/balance/:userId', authMiddleware, fetchLeaveBalance);

//Leave Requests Approval
router.get('/requests/:userId', authMiddleware, getIncomingRequestsHandler);
router.put('/approve/:approveId', authMiddleware, approveLeaveHandler);
router.put('/reject/:rejectId', authMiddleware, rejectLeaveHandler);

//Leave Types
router.get('/types', authMiddleware, fetchLeaveTypes);
router.post('/types', authMiddleware, roleMiddleware('admin'), createLeaveHandler);
router.put('/types/:id', authMiddleware, roleMiddleware('admin'), updateLeaveHandler);
router.delete('/types/:id', authMiddleware, roleMiddleware('admin'), deleteLeaveHandler);

// Admin Routes
router.get('/on-leave-today', authMiddleware,fetchUsersOnLeaveToday);

// Team Leave
router.get('/team-leaves', authMiddleware, fetchTeamLeave);

module.exports = router;
