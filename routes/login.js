const router = require('koa-router')()

// router.prefix('/login')
router.get('/login', async (ctx, next) => {
  try{
    if(ctx.session.user != 'null' && ctx.session.user == '111'){
      await ctx.render('index', {
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