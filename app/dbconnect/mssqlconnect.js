var mssql = require('mssql');
// mssql://wangzhuo:wangzhuo01!@ussqlserver02.cjfjfx908ewd.us-west-1.rds.amazonaws.com:1433/AndonCloud
//var us_config = {
//	server: 'ussqlserver02.cjfjfx908ewd.us-west-1.rds.amazonaws.com',
//	user: 'zouxueliang',
//	password: 'uYBEn0ko',
//	database: 'AndonCloud'
//};

var us_config = {
	//server: '34.210.26.69',
	server: 'ussqlserver02.cjfjfx908ewd.us-west-1.rds.amazonaws.com',
	//user: 'wangzhuo',
	//password: 'wangzhuo01!',
	
	user: 'zouxueliang',
	password: 'uYBEn0ko',
	//database: 'AndonCloud0527',
	database: 'AndonCloud',
	pool:{
		max: 10,
        min:0,
        idleTimeoutMillis:15000
    }
};

exports.selectdb = (svrtype) => {
	try {
		console.log('**********mssqlconnect ***********');
		//mssql.close();
		var pool = null;
		switch(svrtype) {
			case "US":
				pool =new mssql.ConnectionPool(us_config);
				break;
		}
		return pool;
	} catch(ex) {
		//mssql.close();
		throw(ex);
	}
};