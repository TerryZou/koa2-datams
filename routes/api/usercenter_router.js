var router = require('koa-router')();
var usercenter_controller = require('../../app/controllers/usercenter_controller');

router.post('/getNations', usercenter_controller.getNations);

module.exports = router;