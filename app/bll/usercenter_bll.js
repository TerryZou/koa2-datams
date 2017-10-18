const ApiError = require('../error/ApiError');
const ApiErrorNames = require('../error/ApiErrorNames');
const base_bll = require("./base_bll");
//const mysql_usercenter = require("../mysql_dal/usercenter_dal");
//const mssql_usercenter = require("../mssql_dal/usercenter_dal");

//通过服务器获取国家
exports.getNations = async(svrtype) => {
	var result = {
		succ: false,
		message: ""
	}
	try {
		var data = {
			success: false,
			data: []
		}
		
		var usercenter_dal=base_bll.select_usercenter_dal(svrtype);
		
		data = await usercenter_dal.getNations(svrtype);
		
		if(data.success) {
			result.success = true;
			result.data = data.data;
			result.total=data.data.length;
		} else {
			result.message = data.message;
		}
	} catch(e) {
		result.message = e.message;
	}
	return result;
};