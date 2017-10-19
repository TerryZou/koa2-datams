const ApiError = require('../error/ApiError')
const ApiErrorNames = require('../error/ApiErrorNames')

const session = require("koa-session2")




exports.get_User = async(ctx, next) => {
	var user = ctx.request.body;
	var data = {};
	var result = {
		isf: false,
		data: {},
		total: 0,
		message:''
	};
	if(user.userName == 'line-height' && user.userPwd == '24px'){
		result.success = true;
			ctx.session.user = user.userName;
	}else{
		result.success = false;
	}
	result.data = data.data;
	result.message = data.message;
	ctx.body = result;
};
exports.logout_User = async(ctx, next) => {
	var user = ctx.request.body;
	var data = {};
	var result = {
		isf: false,
		data: {},
		total: 0,
		message:''
	};
	if(user.logout == 'true'){
		result.success = true;
		ctx.session.user = '';
	}else{
		result.success = false;
	}
	result.data = data.data;
	result.message = data.message;

	ctx.body = result;
};
