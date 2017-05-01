var conn = require('../dbconnect/mssqlconnect');
var mssql = require('mssql');
var tool_util = require('../../utils/tool_util');

exports.model = (svrtype) => {

	//获取多条数据
	this.query = async(sql, sqlparam) => {
		try {
			var result = {
				succ: false,
				status: 0,
				data: null,
				message: ""
			};
			result = await query(svrtype, sql, sqlparam);
			return result;
		} catch(e) {
			throw e;
		}
	};

	return this;
};

function query(svrtype, sql, sqlparam) {
	return new Promise(function(resolve, reject) {
		console.log("**********mssql************")
		console.log("**********" + tool_util.getNowDate() + "************")
		console.log("sql: "+sql);

		try {
			var pool = conn.selectdb(svrtype);
			if(pool != null) {
				pool.connect(function() {
					var request = new mssql.Request(pool);
					console.log("~~~~~~~params~~~~~~~")
					// 循环加参数
					for(var p in sqlparam) {
						console.log(sqlparam[p]);
						request.input(sqlparam[p].param, sqlparam[p].value);
					}
					console.log("~~~~~~~params~~~~~~~~~~`")

					request.query(sql).then(function(result) {
						console.log("~~~~~~~query success~~~~~~~~~~~`")
						pool.close();
						resolve({
							success: true,
							status: 1,
							data: result.recordset,
							message: "success"
						});
						
					}).catch(function(err) {
						console.log("~~~~~~~query error~~~~~~~~~~~`")
						console.log(err);
						pool.close();
						resolve({
							success: false,
							status: 0,
							data: null,
							message: err.message
						});
						
					});
				});
			} else {
				//mssql.close();
				resolve({
					success: false,
					status: 0,
					data: [],
					message: "false"
				});
			}
		} catch(ex) {
			console.log("~~~~~~~connect error~~~~~~~~~~~`")
			console.log(ex);
			mssql.close();
			resolve({
				success: false,
				status: 0,
				data: [],
				message: ex.message
			});
		}
		console.log("************************************************")
	});
}