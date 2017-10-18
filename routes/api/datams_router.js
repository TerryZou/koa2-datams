var router = require('koa-router')();
var datams_controller = require('../../app/controllers/datams_controller');

router.post('/get_Activation_User', datams_controller.get_Activation_User);
router.post('/exportExcel_Activation_User', datams_controller.exportExcel_Activation_User);
module.exports = router;