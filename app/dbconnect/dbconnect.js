var db = require('mongoose'),
	url = 'mongodb://192.168.168.128:27017/bledatabase';
db.connect(url);
//db.Promise = Promise;
console.log("链接数据库");
module.exports = db;