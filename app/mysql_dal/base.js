var conn = require('../dbconnect/mysqlconnect');
var tool_util = require('../../utils/tool_util');
exports.model = (svrtype) => {

	//获取多条数据
	this.query = async(sql,sqlparam) => {
		try {
			var result = {
				succ: false,
				status: 0,
				data: null,
				message: ""
			};
			result = await query(svrtype,sql,sqlparam);
			return result;
		} catch(e) {
			throw e;
		}
	};

	return this;
};

var query=(svrtype,sql,sqlparam)=>{

	return new Promise(function(resolve, reject) {
		console.log("**********mysql************")
		console.log("**********" + tool_util.getNowDate() + "************")
		console.log("sql: "+sql);
		//conn.connect();
		var connection=conn.selectdb(svrtype);
		connection.query(sql,sqlparam, function(err, result) {
			if(err) {
				console.log("~~~~~~~query err~~~~~~~~~~~`")
				console.log(err)
				resolve({
					success: false,
					status: 0,
					data: null,
					message: err.message
				});
			} else {
				console.log("~~~~~~~query success~~~~~~~~~~~`")
				resolve({
					success: true,
					status: 1,
					data: result,
					message: "success"
				});
			}
			//connection.release();
		});
		//conn.end();
	});
}