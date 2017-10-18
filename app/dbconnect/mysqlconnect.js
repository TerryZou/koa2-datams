var mysql = require('mysql');

//var cn_pool = mysql.createPool({
//	protocol: 'mysql',
//	connectionLimit: 100, //最大连接数  
//	host: '120.92.3.237',
//	port: '3307',
//	user: 'zouxueliang',
//	password: 'uYBEn0ko',
//	database: 'AndonCloud'
//	//useConnectionPooling: true
//})
//
//function getconn(svrtype) {
//	return new Promise(function(resolve, reject) {
//		var pool = cn_pool;
//		switch(svrtype) {
//			case 'CN':
//				pool = cn_pool;
//				break;
//		}
//		pool.getConnection(function(err, conn) {
//			if(!err) {
//
//			} else {
//				resolve(conn);
//			}
//		});
//	});
//
//}

var cn_db = {
	host: '120.92.3.237',
	port: '3307',
	user: 'zouxueliang',
	password: 'uYBEn0ko',
	database: 'AndonCloud',
	useConnectionPooling: true
};

function handleDisconnect(connection) {
	connection.on('error', function(err) {
		if(!err.fatal) {
			return;
		}

		if(err.code !== 'PROTOCOL_CONNECTION_LOST') {
			throw err;
		}

		console.log('Re-connecting lost connection: ' + err.stack);
		connection = mysql.createConnection(connection.config);
		handleDisconnect(connection);
		connection.connect();
	});
}
//handleDisconnect(cn_db);

exports.selectdb = (svrtype) => {
	var conn = null;
	switch(svrtype) {
		case 'CN':
			conn = mysql.createConnection(cn_db);
			break;
		default:
			conn = mysql.createConnection(cn_db);
			break;
	}
	handleDisconnect(conn);
	return conn;
};