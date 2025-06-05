const express = require('express');
const router = express.Router();

const {
  fetchUsersOnLeaveToday,
  fetchTeamLeave,
  fetchLeaveBalance,
  fetchLeaveTypes,
  fetchLeaveTypesByRole,
  requestLeaveHandler,
  getRequestsHistoryHandler,
  getLeaveHistoryHandler,
  cancelLeaveHandler,
  getIncomingRequestsHandler,
  approveLeaveHandler,
  rejectLeaveHandler,
  createLeaveTypeHandler,
  updateLeaveTypeHandler,
  deleteLeaveTypeHandler
} = require('../controllers/leaveController');

const { authMiddleware, roleMiddleware } = require('../middleware/middleware');

//Leave Request and History
router.post('/request', authMiddleware, requestLeaveHandler);
router.put('/cancel/:leaveRequestId', authMiddleware, cancelLeaveHandler);
router.get('/history/:userId', authMiddleware, getLeaveHistoryHandler);
router.get('/requests/history/:userId', authMiddleware, getRequestsHistoryHandler);

//Leave Balance
router.get('/balance/:userId', authMiddleware, fetchLeaveBalance);

//Leave Requests Approval
router.get('/requests/:userId', authMiddleware, getIncomingRequestsHandler);
router.put('/approve/:approveId', authMiddleware, approveLeaveHandler);
router.put('/reject/:rejectId', authMiddleware, rejectLeaveHandler);

//Leave Types
router.get('/types/:userId', authMiddleware, fetchLeaveTypesByRole);
router.get('/types', authMiddleware, fetchLeaveTypes);
router.post('/types', authMiddleware, roleMiddleware('admin'), createLeaveTypeHandler);
router.put('/types/:id', authMiddleware, roleMiddleware('admin'), updateLeaveTypeHandler);
router.delete('/types/:id', authMiddleware, roleMiddleware('admin'), deleteLeaveTypeHandler);

// Admin Routes
router.get('/on-leave-today', authMiddleware,roleMiddleware('admin'),fetchUsersOnLeaveToday);

// Team Leave
router.get('/team-leaves', authMiddleware, fetchTeamLeave);

module.exports = router;
