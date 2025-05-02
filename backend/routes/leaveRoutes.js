const express = require('express');
const router = express.Router();
const {
  fetchUsersOnLeaveToday,
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

// Leave status routes
router.get('/users-on-leave', fetchUsersOnLeaveToday);
router.get('/balance/:userId', fetchLeaveBalance);
router.get('/types', fetchLeaveTypes);

// Leave request routes
router.post('/request', requestLeaveHandler);
router.get('/history/:userId', getLeaveHistoryHandler);
router.put('/cancel/:leaveRequestId', cancelLeaveHandler);
router.get('/requests/:userId', getIncomingRequestsHandler);
router.put('/approve/:approveId', approveLeaveHandler);
router.put('/reject/:rejectId', rejectLeaveHandler);

// Leave type management routes
router.post('/create-leave', createLeaveHandler);
router.put('/type/:id', updateLeaveHandler);
router.delete('/type/:id', deleteLeaveHandler);

module.exports = router;