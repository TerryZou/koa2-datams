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
const login = require('./routes/login')
const api = require('./routes/api');
const session = require("koa-session2");


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




app.keys = ['koa2-datams'];
const CONFIG = {
  key: 'SESSIONID', /** (string) cookie key (default is koa:sess) */
  /** (number || 'session') maxAge in ms (default is 1 days) */
  /** 'session' will result in a cookie that expires when session/browser is closed */
  /** Warning: If a session cookie is stolen, this cookie will never expire */
  maxAge: 86400000,
  overwrite: true, /** (boolean) can overwrite or not (default true) */
  httpOnly: true, /** (boolean) httpOnly or not (default true) */
  signed: true, /** (boolean) signed or not (default true) */
  rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. default is false **/
};

app.use(session(CONFIG));




//添加格式化处理响应结果的中间件，在添加路由之前调用
//app.use(response_formatter('^/api'));

// routes
app.use(api.routes(), api.allowedMethods());
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())
app.use(datams.routes(), datams.allowedMethods())
app.use(login.routes(), login.allowedMethods())



module.exports = app
