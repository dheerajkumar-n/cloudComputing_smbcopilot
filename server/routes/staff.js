const router = require('express').Router();
const ctrl = require('../controllers/staffController');

router.get('/:businessId/employees', ctrl.getEmployees);
router.post('/:businessId/employees', ctrl.createEmployee);
router.put('/employees/:id', ctrl.updateEmployee);

router.get('/:businessId/shifts', ctrl.getShifts);
router.post('/:businessId/shifts', ctrl.createShift);
router.put('/shifts/:id', ctrl.updateShift);

router.get('/:businessId/appointments', ctrl.getAppointments);

module.exports = router;
