const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const cors = require('koa-cors')
const response_formatter = require('./middlewares/response_formatter');
const index = require('./routes/index')
const users = require('./routes/users')
const datams = require('./routes/datams')
const api = require('./routes/api');


// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
//app.use(logger())
//log工具
const logUtil = require('./utils/log_util');


// logger
app.use(async (ctx, next) => {
  //响应开始时间
  const start = new Date();
  //响应间隔时间
  var ms;
  try {
    //开始进入到下一个中间件
    await next();

    ms = new Date() - start;
    //记录响应日志
    logUtil.logResponse(ctx, ms);

  } catch (error) {

    ms = new Date() - start;
    //记录异常日志
    logUtil.logError(ctx, error, ms);
  }
});

app.use(require('koa-static')(__dirname + '/public'))
app.use(require('koa-static')(__dirname + '/public/res'))
app.use(require('koa-static')(__dirname + '/files'))
app.use(require('koa-static')(__dirname + '/files/uploads'))
app.use(require('koa-static')(__dirname + '/files/excel'))

app.use(views(__dirname + '/views', {
  extension: 'html'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

//cors
app.use(cors());


//添加格式化处理响应结果的中间件，在添加路由之前调用
//app.use(response_formatter('^/api'));

// routes
app.use(api.routes(), api.allowedMethods());
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())
app.use(datams.routes(), datams.allowedMethods())

module.exports = app
