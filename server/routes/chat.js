const router = require('express').Router();
const ctrl = require('../controllers/chatController');

router.post('/', ctrl.processChat);
router.get('/:businessId/history', ctrl.getChatHistory);

module.exports = router;
