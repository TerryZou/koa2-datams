var router = require('koa-router')();
var api = require('./api/index');

router.use('/api', api.routes(), api.allowedMethods());

module.exports = router;