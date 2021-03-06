const router = require('koa-router')()
const session = require("koa-session2")

router.get('/', async (ctx, next) => {
  try{
    if(ctx.session.user != 'null' && ctx.session.user == 'line-height'){
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
