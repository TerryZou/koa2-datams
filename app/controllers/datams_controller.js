const ApiError = require('../error/ApiError');
const ApiErrorNames = require('../error/ApiErrorNames');
const datams = require("../bll/datams_bll");
const tool_util = require("../../utils/tool_util");

function adjustsearch(ctx) {
	var search = new Object();
	var gender = ctx.request.body.gender;
	var usernation = ctx.request.body.usernation;
	var age_op = ctx.request.body.age_op;
	var age = ctx.request.body.age;
	var page = ctx.request.body.page;
	var row = ctx.request.body.row;
	var sortfield = ctx.request.body.sortfield;
	var sorttype = ctx.request.body.sorttype;
	var activation = ctx.request.body.activation;
	var date = new Date();
	var begindate = date.format("yyyy-MM-dd") + " 0:0:0";
	var enddate = date.format("yyyy-MM-dd") + " 0:0:0";

	if(activation != undefined && activation != null && activation != "") {
		switch(activation) {
			case "1day":
				date.setDate(date.getDate() - 1);
				break;
			case "1week":
				date.setDate(date.getDate() - 7);
				break;
			case "1month":
				date.setDate(date.getDate() - 30);
				break;
			case "3month":
				date.setDate(date.getDate() - 90);
				break;
			case "6month":
				date.setDate(date.getDate() - 180);
				break;
		}
		begindate = date.format("yyyy-MM-dd") + " 0:0:0";
	}

	search.begindate = begindate;
	search.enddate = enddate;

	if(gender != undefined && gender != null && gender != "") {
		search.gender = parseInt(gender);
	}
	if(usernation != undefined && usernation != null && usernation != "") {
		search.usernation = usernation;
	}
	if(age != undefined && age != null && age != "") {
		search.age = parseInt(age);
	}
	if(age_op != undefined && age_op != null && age_op != "") {
		search.age_op = age_op;
	}
	if(page != undefined && page != null && page != "" &&
		row != undefined && row != null && row != "") {
		search.skip = (parseInt(page) - 1) * parseInt(row);
		search.row = parseInt(row);
	}
	if(sortfield != undefined && sortfield != null && sortfield != "") {
		search.sortfield = sortfield;
	}
	if(sorttype != undefined && sorttype != null && sorttype != "") {
		search.sorttype = sorttype;
	}
	return search;
}

//设备测量 活跃用户
exports.get_Activation_User = async(ctx, next) => {
	var svrtype = ctx.request.body.svrtype;
	var datatype = ctx.request.body.datatype;
	var data = {
		data: [],
		total: 0,
		success: true,
		message: ''
	};
	var isok = true;
	if(svrtype != 'CN'&&svrtype != 'US') {
		isok = false;
	}
	if( datatype != 'BG' && 
		datatype != 'BP'&&
		datatype != 'WM'&&
		datatype != 'BO'&&
		datatype != 'AMSS') {
		isok = false;
	}
	if(isok) {
		var search = adjustsearch(ctx);

		switch(datatype) {
			case 'BG':
				data = await datams.get_BGActivation_User(svrtype, search);
				break;
			case 'BP':
				data = await datams.get_BPActivation_User(svrtype, search);
				break;
			case 'BO':
				data = await datams.get_BOActivation_User(svrtype, search);
				break;
			case 'WM':
				data = await datams.get_WMActivation_User(svrtype, search);
				break;
			case 'AMSS':
				data = await datams.get_AMSSActivation_User(svrtype, search);
				break;
		}
	}

	var result = {
		code: 0,
		isf: false,
		data: [],
		count: 0,
		msg: ''
	};
	if(data.success) {
		result.data = data.data;
		result.count = data.total;
		result.code = data.success ? 0 : -1;
		result.msg = data.message;
	}
	ctx.body = result;
}
//设备测量 活跃用户
exports.exportExcel_Activation_User = async(ctx, next) => {
	var svrtype = ctx.request.body.svrtype;
	var datatype = ctx.request.body.datatype;
	var data = {
		data: [],
		total: 0,
		success: true,
		message: ''
	};
	var isok = true;
	if(svrtype != 'CN'&&svrtype != 'US') {
		isok = false;
	}
	if( datatype != 'BG' && 
		datatype != 'BP'&&
		datatype != 'WM'&&
		datatype != 'BO'&&
		datatype != 'AMSS') {
		isok = false;
	}
	if(isok) {
		var search = adjustsearch(ctx);

		switch(datatype) {
			case 'BG':
				data = await datams.export_BGActivation_User(svrtype, search);
				break;
			case 'BP':
				data = await datams.export_BPActivation_User(svrtype, search);
				break;
			case 'BO':
				data = await datams.export_BOActivation_User(svrtype, search);
				break;
			case 'WM':
				data = await datams.export_WMActivation_User(svrtype, search);
				break;
			case 'AMSS':
				data = await datams.export_AMSSActivation_User(svrtype, search);
				break;
		}
	}

	var result = {
		success:false,
		isf: false,
		data: '',
		message: ''
	};
	if(data.success) {
		result.data = data.data;
		result.success = data.success;
		result.message = data.message;
	}
	ctx.body = result;
}