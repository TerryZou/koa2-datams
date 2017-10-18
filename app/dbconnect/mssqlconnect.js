var mssql = require('mssql');
// mssql://wangzhuo:wangzhuo01!@ussqlserver02.cjfjfx908ewd.us-west-1.rds.amazonaws.com:1433/AndonCloud
//var us_config = {
//	server: 'ussqlserver02.cjfjfx908ewd.us-west-1.rds.amazonaws.com',
//	user: 'zouxueliang',
//	password: 'uYBEn0ko',
//	database: 'AndonCloud'
//};

var us_config = {
	server: 'ussqlserver02.cjfjfx908ewd.us-west-1.rds.amazonaws.com',
	user: 'wangzhuo',
	password: 'wangzhuo01!',
	database: 'AndonCloud'
};

exports.selectdb = (svrtype) => {
	try {
		var conn = null;
		switch(svrtype) {
			case "US":
				conn = mssql.connect(us_config);
				break;
		}
		return conn;
	} catch(ex) {
		mssql.close();
		throw(ex);
	}
};