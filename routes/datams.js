const router = require('koa-router')()

router.get('/device_act_user', async (ctx, next) => {
  await ctx.render('device_act_user', {
    title: 'Hello Koa 2!'
  })
})

module.exports = router