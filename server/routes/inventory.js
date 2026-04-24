const router = require('express').Router({ mergeParams: true });
const ctrl = require('../controllers/inventoryController');

router.get('/:businessId/items', ctrl.getItems);
router.get('/:businessId/items/low', ctrl.getLowStock);
router.post('/:businessId/items', ctrl.createItem);
router.put('/items/:id', ctrl.updateItem);
router.delete('/items/:id', ctrl.deleteItem);
router.post('/:businessId/reorder', ctrl.reorderLowStock);
router.get('/:businessId/reorders', ctrl.getReorderRequests);

module.exports = router;
