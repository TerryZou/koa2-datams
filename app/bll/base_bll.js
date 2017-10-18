const mysql_usercenter = require("../mysql_dal/usercenter_dal");
const mssql_usercenter = require("../mssql_dal/usercenter_dal");

const mysql_datams = require("../mysql_dal/datams_dal");
const mssql_datams = require("../mssql_dal/datams_dal");

//通过服务器获取数据层
exports.select_usercenter_dal = (svrtype) => {
	var dal = mysql_usercenter; 
	switch(svrtype) {
		case "CN":
			dal = mysql_usercenter;
			break;
		case "US":
			dal = mssql_usercenter;
			break;
	}
	return dal;
};

//通过服务器获取数据层
exports.select_datams_dal = (svrtype) => {
	var dal = mysql_datams; 
	switch(svrtype) {
		case "CN":
			dal = mysql_datams;
			break;
		case "US":
			dal = mssql_datams;
			break;
	}
	return dal;
};