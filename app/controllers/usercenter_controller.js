const ApiError = require('../error/ApiError');
const ApiErrorNames = require('../error/ApiErrorNames');
const usercenter = require("../bll/usercenter_bll");

//通过服务器获取服务器包含的国家
exports.getNations = async(ctx, next) => {
	var svrtype = ctx.request.body.svrtype;
	var data = await usercenter.getNations(svrtype);
	var result = {
		isf: false,
		data: {},
		total: 0,
		message:''
	};

	result.data = data.data;
	result.total = data.total;
	result.success = data.success;
	result.message = data.message;

	ctx.body = result;
}