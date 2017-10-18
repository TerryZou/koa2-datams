const ApiError = require('../error/ApiError');
const ApiErrorNames = require('../error/ApiErrorNames');
const base_bll = require("./base_bll");
//const mysql_datams = require("../mysql_dal/datams_dal");
const tool_util = require("../../utils/tool_util");
const xlsx = require("../../utils/excel_util");
const pathconfig = require("../../config/path_config");

function adjustparam(search) {
	var params = new Object();
	if(search.begindate != undefined && search.begindate != null && search.begindate != "") {
		params.begindate = search.begindate;
	} else {
		params.begindate = tool_util.getNowDate();
	}
	if(search.enddate != undefined && search.enddate != null && search.enddate != "") {
		params.enddate = search.enddate;
	} else {
		params.enddate = tool_util.getNowDate();
	}

	if(search.gender != undefined && search.gender != null && search.gender != NaN) {
		params.gender = search.gender;
	}

	if(search.usernation != undefined && search.usernation != null && search.usernation != "") {
		params.usernation = search.usernation;
	}
	if(search.age != undefined && search.age != null && search.age != NaN) {
		params.age = search.age;
	}

	if(search.age_op != undefined && search.age_op != null && search.age_op != "") {
		params.age_op = search.age_op;
	}

	if(search.skip != undefined && search.skip != null && search.skip != NaN) {
		params.skip = search.skip;
	}
	if(search.row != undefined && search.row != null && search.row != NaN) {
		params.row = search.row;
	}

	return params;
}
//导出数据excel
function exportData(data, datatype) {
	var result = {
		success: false,
		message: '',
		data: ''
	};
	var header = {
		name: "第1页",
		headers: [{
				'f': 'UserName',
				'h': '用户账号'
			},
			{
				'f': 'GenderText',
				'h': '性别'
			},
			{
				'f': 'Age',
				'h': '年龄'
			},

			{
				'f': 'UserRegion',
				'h': '地区'
			},
			{
				'f': 'UserNation',
				'h': '国家'
			},
			{
				'f': 'CreateTime',
				'h': '注册时间'
			},
			{
				'f': 'AppVersion',
				'h': 'App'
			},
			{
				'f': 'DeviceName',
				'h': '设备'
			},
			{
				'f': 'PhoneName',
				'h': '手机型号'
			},
			{
				'f': 'PhoneOS',
				'h': '手机系统'
			}
		]
	};
	var headers = new Array();
	var datas = new Array();
	if(data.length > 0) {
		var filename = new Date().getTime().toString() + '.xlsx';
		filename = datatype + '_' + filename;
		var excelrow = 1048574;
		var pagecount = (data.length + excelrow - 1) / excelrow;
		for(var i = 1; i <= pagecount; i++) {
			header.name = "第" + i + "页";
			headers.push(header);
			var start = (i - 1) * excelrow;
			var end = i * excelrow;
			if(end > data.length) {
				end = data.length;
			}
			var tempdata = data.slice(start, end);
			datas.push(tempdata);
		}
		path = pathconfig.excel + filename;
		result.success = xlsx.generateExcel(path, headers, datas);
		if(result.success) {
			result.data = filename;
			result.message = '导出成功';
		} else {
			result.message = '导出失败';
		}
	} else {
		result.message = '导出失败,无数据';
	}
	return result;
}

//获取血糖设备使用活跃用户信息
exports.get_BGActivation_User = async(svrtype, search) => {
	var result = {
		success: false,
		message: ""
	}
	try {
		var data = {
			success: false,
			data: []
		}
		var data_total = {
			success: false,
			data: 0
		}

		var params = adjustparam(search);

		params.ispage = true;
		var datams_dal = base_bll.select_datams_dal(svrtype);

		data = await datams_dal.get_BGActivation_User(svrtype, params, search.sortfield, search.sorttype);
		data_total = await datams_dal.get_BGActivation_User_Total(svrtype, params);

		if(data.success) {
			result.success = true;
			result.data = data.data;
			if(data_total.success) {
				result.total = data_total.data;
			} else {
				result.total = data.data.length;
			}
		} else {
			result.message = data.message;
		}
	} catch(e) {
		result.message = e.message;
	}
	return result;
};
//导出血糖设备使用活跃用户信息
exports.export_BGActivation_User = async(svrtype, search) => {
	var result = {
		success: false,
		data: '',
		message: ''
	};
	var params = adjustparam(search);
	params.ispage = false;
	var data = {
		success: false,
		data: []
	};
	var datams_dal = base_bll.select_datams_dal(svrtype);

	data = await datams_dal.get_BGActivation_User(svrtype, params, search.sortfield, search.sorttype);

	if(data.success) {
		result = exportData(data.data, 'BG');
	} else {
		result.message = '导出失败，数据异常';
	}
	return result;
};

//获取血压设备使用活跃用户信息
exports.get_BPActivation_User = async(svrtype, search) => {
	var result = {
		success: false,
		message: ""
	}
	try {
		var data = {
			success: false,
			data: []
		}
		var data_total = {
			success: false,
			data: 0
		}

		var params = adjustparam(search);
		params.ispage = true;
		var datams_dal = base_bll.select_datams_dal(svrtype);

		data = await datams_dal.get_BPActivation_User(svrtype, params, search.sortfield, search.sorttype);
		data_total = await datams_dal.get_BPActivation_User_Total(svrtype, params);

		if(data.success) {
			result.success = true;
			result.data = data.data;
			if(data_total.success) {
				result.total = data_total.data;
			} else {
				result.total = data.data.length;
			}
		} else {
			result.message = data.message;
		}
	} catch(e) {
		result.message = e.message;
	}
	return result;
};
//导出血压设备使用活跃用户信息
exports.export_BPActivation_User = async(svrtype, search) => {
	var result = {
		success: false,
		data: '',
		message: ''
	};
	var params = adjustparam(search);
	params.ispage = false;
	var data = {
		success: false,
		data: []
	};
	var datams_dal = base_bll.select_datams_dal(svrtype);

	data = await datams_dal.get_BPActivation_User(svrtype, params, search.sortfield, search.sorttype);

	if(data.success) {
		result = exportData(data.data, 'BP');
	} else {
		result.message = '导出失败，数据异常';
	}
	return result;
};

//获取血氧设备使用活跃用户信息
exports.get_BOActivation_User = async(svrtype, search) => {
	var result = {
		success: false,
		message: ""
	}
	try {
		var data = {
			success: false,
			data: []
		}
		var data_total = {
			success: false,
			data: 0
		}

		var params = adjustparam(search);
		params.ispage = true;
		var datams_dal = base_bll.select_datams_dal(svrtype);
		data = await datams_dal.get_BOActivation_User(svrtype, params, search.sortfield, search.sorttype);
		data_total = await datams_dal.get_BOActivation_User_Total(svrtype, params);

		if(data.success) {
			result.success = true;
			result.data = data.data;
			if(data_total.success) {
				result.total = data_total.data;
			} else {
				result.total = data.data.length;
			}
		} else {
			result.message = data.message;
		}
	} catch(e) {
		result.message = e.message;
	}
	return result;
};
//导出血氧设备使用活跃用户信息
exports.export_BOActivation_User = async(svrtype, search) => {
	var result = {
		success: false,
		data: '',
		message: ''
	};
	var params = adjustparam(search);
	params.ispage = false;
	var data = {
		success: false,
		data: []
	};
	var datams_dal = base_bll.select_datams_dal(svrtype);

	data = await datams_dal.get_BOActivation_User(svrtype, params, search.sortfield, search.sorttype);

	if(data.success) {
		result = exportData(data.data, 'BO');
	} else {
		result.message = '导出失败，数据异常';
	}
	return result;
};

//获取体重设备使用活跃用户信息
exports.get_WMActivation_User = async(svrtype, search) => {
	var result = {
		success: false,
		message: ""
	}
	try {
		var data = {
			success: false,
			data: []
		}
		var data_total = {
			success: false,
			data: 0
		}

		var params = adjustparam(search);
		params.ispage = true;
		var datams_dal = base_bll.select_datams_dal(svrtype);
		data = await datams_dal.get_WMActivation_User(svrtype, params, search.sortfield, search.sorttype);
		data_total = await datams_dal.get_WMActivation_User_Total(svrtype, params);

		if(data.success) {
			result.success = true;
			result.data = data.data;
			if(data_total.success) {
				result.total = data_total.data;
			} else {
				result.total = data.data.length;
			}
		} else {
			result.message = data.message;
		}
	} catch(e) {
		result.message = e.message;
	}
	return result;
};
//导出体重设备使用活跃用户信息
exports.export_WMActivation_User = async(svrtype, search) => {
	var result = {
		success: false,
		data: '',
		message: ''
	};
	var params = adjustparam(search);
	params.ispage = false;
	var data = {
		success: false,
		data: []
	};
	var datams_dal = base_bll.select_datams_dal(svrtype);
	data = await datams_dal.get_WMActivation_User(svrtype, params, search.sortfield, search.sorttype);

	if(data.success) {
		result = exportData(data.data, 'WM');
	} else {
		result.message = '导出失败，数据异常';
	}
	return result;
};

//获取运动设备使用活跃用户信息
exports.get_AMSSActivation_User = async(svrtype, search) => {
	var result = {
		success: false,
		message: ""
	}
	try {
		var data = {
			success: false,
			data: []
		}
		var data_total = {
			success: false,
			data: 0
		}

		var params = adjustparam(search);
		params.ispage = true;
		var datams_dal = base_bll.select_datams_dal(svrtype);

		data = await datams_dal.get_AMSSActivation_User(svrtype, params, search.sortfield, search.sorttype);
		data_total = await datams_dal.get_AMSSActivation_User_Total(svrtype, params);

		if(data.success) {
			result.success = true;
			result.data = data.data;
			if(data_total.success) {
				result.total = data_total.data;
			} else {
				result.total = data.data.length;
			}
		} else {
			result.message = data.message;
		}
	} catch(e) {
		result.message = e.message;
	}
	return result;
};
//导出运动设备使用活跃用户信息
exports.export_AMSSActivation_User = async(svrtype, search) => {
	var result = {
		success: false,
		data: '',
		message: ''
	};
	var params = adjustparam(search);
	params.ispage = false;
	var data = {
		success: false,
		data: []
	};
	var datams_dal = base_bll.select_datams_dal(svrtype);

	data = await datams_dal.get_AMSSActivation_User(svrtype, params, search.sortfield, search.sorttype);

	if(data.success) {
		result = exportData(data.data, 'AMSS');
	} else {
		result.message = '导出失败，数据异常';
	}
	return result;
};