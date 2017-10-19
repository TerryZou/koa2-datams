const router = require('koa-router')()

router.get('/device_act_user', async (ctx, next) => {
  try{
    if(ctx.session.user != 'null' && ctx.session.user == 'line-height'){
      await ctx.render('device_act_user', {
        title: 'Hello Koa 2!'
      })
    }else {
      await ctx.render('login', {
        title: 'login!'
      })
    }
  }
  catch(ex){
    console.log(ex.message);
  }
})

module.exports = router