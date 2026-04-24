const router = require('express').Router();
const ctrl = require('../controllers/suppliersController');

router.get('/:businessId', ctrl.getSuppliers);
router.post('/:businessId', ctrl.createSupplier);
router.put('/:businessId/compare', ctrl.compareSuppliers);
router.put('/:id/update', ctrl.updateSupplier);
router.delete('/:id', ctrl.deleteSupplier);

router.get('/:businessId/orders', ctrl.getOrders);
router.put('/orders/:id/status', ctrl.updateOrderStatus);

module.exports = router;
