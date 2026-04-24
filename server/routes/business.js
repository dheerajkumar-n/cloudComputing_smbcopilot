const router = require('express').Router();
const ctrl = require('../controllers/businessController');

router.get('/config', ctrl.getConfig);
router.get('/config/full', ctrl.getFullConfig);
router.get('/', ctrl.listProfiles);
router.post('/', ctrl.createProfile);
router.get('/:id', ctrl.getProfile);

module.exports = router;
