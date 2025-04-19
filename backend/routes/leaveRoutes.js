const express = require('express');
const {
  fetchLeaveBalance,
  fetchUsersOnLeaveToday,
  fetchLeaveTypes,
  approveLeaveHandler,
  rejectLeaveHandler,
  requestLeaveHandler,
  getLeaveHistoryHandler,
  cancelLeaveHandler,
  getIncomingRequestsHandler
} = require('../controllers/leaveController');

const router = express.Router();

router.get('/balance/:userId', fetchLeaveBalance);
router.post('/request', requestLeaveHandler);
router.get('/history/:userId', getLeaveHistoryHandler);
router.put('/cancel/:leaveRequestId', cancelLeaveHandler);
router.get('/types', fetchLeaveTypes);
router.get('/requests/:userId', getIncomingRequestsHandler);
router.put('/approve/:approveId', approveLeaveHandler);
router.put('/reject/:rejectId', rejectLeaveHandler);
router.get('/on-leave-today', fetchUsersOnLeaveToday);

module.exports = router;