var router = require('koa-router')();
var login_controller = require('../../app/controllers/login_controller');


router.post('/get_User', login_controller.get_User);
router.post('/logout_User', login_controller.logout_User);

module.exports = router;