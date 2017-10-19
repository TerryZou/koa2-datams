var router = require('koa-router')();
var usercenter_router = require('./usercenter_router');
var datams_router = require('./datams_router');
var login_router = require('./login_router');

router.use('/usercenter', usercenter_router.routes(), usercenter_router.allowedMethods());
router.use('/login', login_router.routes(), login_router.allowedMethods());


router.use('/datams', datams_router.routes(), datams_router.allowedMethods());

module.exports = router;