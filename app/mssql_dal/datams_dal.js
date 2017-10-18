var base = require("./base");

// 血糖测量 用户情况
exports.get_BGActivation_User = async(svrtype, params, sortfield, sorttype) => {
	var result = {
		success: false,
		status: 0,
		data: null,
		message: ""
	};
	try {
		var sqlparam = new Array();
		sqlparam.push({
			param: 'begindate',
			value: params.begindate
		});
		sqlparam.push({
			param: 'enddate',
			value: params.enddate
		});

		var basemodel = base.model(svrtype);
		var sql = "";
		sql += "SELECT * FROM (SELECT ROW_NUMBER() OVER (";
		if(sortfield != undefined && sortfield != null && sortfield != "" &&
			sorttype != undefined && sorttype != null && sorttype != "") {
			if(sorttype == "asc") {
				switch(sortfield) {
					case "UserId":
						sql += " ORDER BY urd.UserId ASC "; //排序
						break;
					case "UserName":
						sql += " ORDER BY urd.UserName ASC "; //排序
						break;
					case "UserRegion":
						sql += " ORDER BY urd.UserRegion ASC "; //排序
						break;
					case "CreateTime":
						sql += " ORDER BY urd.CreateTime ASC "; //排序
						break;
					case "Gender":
						sql += " ORDER BY urd.Gender ASC "; //排序
						break;
					case "Age":
						sql += " ORDER BY urd.Age ASC "; //排序
						break;
					case "UserNation":
						sql += " ORDER BY urd.UserNation ASC "; //排序
						break;
					case "AppVersion":
						sql += " ORDER BY upi.AppVersion ASC "; //排序
						break;
					case "PhoneName":
						sql += " ORDER BY upi.PhoneName ASC "; //排序
						break;
					case "PhoneOS":
						sql += " ORDER BY upi.PhoneOS ASC "; //排序
						break;
					case "DeviceName":
						sql += " ORDER BY ud.DeviceName ASC "; //排序
						break;
					default:
						sql += " ORDER BY urd.CreateTime ASC "; //排序
						break;
				}
			} else {
				switch(sortfield) {
					case "UserId":
						sql += " ORDER BY urd.UserId DESC "; //排序
						break;
					case "UserName":
						sql += " ORDER BY urd.UserName DESC "; //排序
						break;
					case "UserRegion":
						sql += " ORDER BY urd.UserRegion DESC "; //排序
						break;
					case "CreateTime":
						sql += " ORDER BY urd.CreateTime DESC "; //排序
						break;
					case "Gender":
						sql += " ORDER BY urd.Gender DESC "; //排序
						break;
					case "Age":
						sql += " ORDER BY urd.Age DESC "; //排序
						break;
					case "UserNation":
						sql += " ORDER BY urd.UserNation DESC "; //排序
						break;
					case "AppVersion":
						sql += " ORDER BY upi.AppVersion DESC "; //排序
						break;
					case "PhoneName":
						sql += " ORDER BY upi.PhoneName DESC "; //排序
						break;
					case "PhoneOS":
						sql += " ORDER BY upi.PhoneOS DESC "; //排序
						break;
					case "DeviceName":
						sql += " ORDER BY ud.DeviceName DESC "; //排序
						break;
					default:
						sql += " ORDER BY urd.CreateTime DESC "; //排序
						break;
				}
			}
		} else {
			sql += " ORDER BY urd.UserId ASC "; //排序
		}
		sql += ") as rank, urd.UserID, urd.UserName,urd.UserRegion,CONVERT(varchar(100), urd.CreateTime, 120) CreateTime," +
			" urd.Gender, CASE WHEN urd.Gender = 1 THEN N'男' WHEN urd.Gender = 2 THEN N'女' ELSE '' END AS GenderText," +
			" IsNull(urd.UserNation,'') UserNation,IsNull(urd.City,'') City,urd.Birthday, IsNull(convert(varchar(20),urd.Age),'') Age," +
			" urd.mDeviceId,IsNull(ud.DeviceName,'') DeviceName," +
			" urd.AppID,IsNull(upi.AppVersion,'') AppVersion,IsNull(upi.PhoneOS,'') PhoneOS,IsNull(upi.PhoneName,'') PhoneName" +
			" FROM (" +
			" SELECT" +
			" ua. UserID, ua.UserName, ua.UserRegion, ua.CreateTime," +
			" uc.Gender, uc.UserNation, uc.City,uw.Birthday," +
			" DATEDIFF( year, uw.Birthday, GetDate()) Age," +
			" rd.mDeviceId,rd.AppID" +
			" FROM UserRegion.dbo.UserAccount ua" +
			" LEFT JOIN UserRegion.dbo.UserInfoCore uc" +
			" ON ua.UserID = uc.UserID" +
			" LEFT JOIN UserRegion.dbo.UserWeightInfo uw" +
			" ON ua.UserID = uw.UserID" +
			" INNER JOIN (" +
			" SELECT bg.UserId, bg.mDeviceId,bg.AppID" +
			" FROM BloodGlucoseInfo bg" +
			" WHERE bg.IsActive = 1" +
			" AND bg.PhoneCreateTime >= @begindate" + //+connection.escape(params.begindate) +
			" AND bg.PhoneCreateTime < @enddate" + //+connection.escape(params.enddate) + //活跃度时间
			" AND bg.CreateTime >= @begindate" + //+connection.escape(params.begindate) +
			" AND bg.CreateTime < @enddate" + //+connection.escape(params.enddate) + //活跃度时间
			" GROUP BY bg.UserId,bg.mDeviceId,bg.AppID" +
			" ) rd" +
			" ON ua.UserID = rd.UserId" +
			" WHERE ua.IsActive = 1";
		if(params.gender != undefined && params.gender != null && params.gender != "NaN") {
			sql += " AND (uc.Gender = @gender"; //+connection.escape(params.gender); // 用户性别
			sqlparam.push({
				param: 'gender',
				value: params.gender
			});
			if(params.gender == 0) {
				sql += " OR uc.Gender is Null";
			}
			sql += ")";
		}
		if(params.usernation != undefined && params.usernation != null && params.usernation != "") {
			if(params.usernation != '0') {
				sql += " AND uc.UserNation = @usernation"; //+connection.escape(params.usernation); // 用户国家
				sqlparam.push({
					param: 'usernation',
					value: params.usernation
				});
			} else {
				sql += " AND uc.UserNation is null";
			}
		}
		if(params.age_op != undefined && params.age_op != null && params.age_op != "") {
			if(params.age_op == "0") {
				sql += " AND DATEDIFF( year, uw.Birthday, GetDate()) is null";
			} else if(params.age != undefined && params.age != null && params.age != NaN) {
				switch(params.age_op) {
					case "=":
						sql += " AND DATEDIFF( year, uw.Birthday, GetDate()) = @age"; //+connection.escape(params.age); // 用户年龄
						break;
					case ">":
						sql += " AND DATEDIFF( year, uw.Birthday, GetDate()) > @age"; //+connection.escape(params.age); // 用户年龄
						break;
					case "<":
						sql += " AND DATEDIFF( year, uw.Birthday, GetDate()) < @age"; //+connection.escape(params.age); // 用户年龄
						break;
				}
				sqlparam.push({
					param: 'age',
					value: params.age
				});
			}
		}

		sql += " ) urd" +
			" LEFT JOIN ih_userdevice ud" +
			" ON urd.UserId = ud.UserId AND urd.mDeviceId = ud.mDeviceId AND ud.IsActive = 1 AND ud.Type = 1" +
			" LEFT JOIN UserPhoneInfo upi" +
			" ON urd.userid = upi.UserId AND urd.AppId =upi.AppId) tbl";

		if(params.ispage != undefined && params.ispage != null && params.ispage == true) {
			if(params.skip != undefined && params.skip != null && params.skip != NaN &&
				params.row != undefined && params.row != null && params.row != NaN) {
				sql += " WHERE tbl.rank > @skip AND tbl.rank <= @row"; //+connection.escape(params.row); //分页
				sqlparam.push({
					param: 'skip',
					value: params.skip
				});
				sqlparam.push({
					param: 'row',
					value: params.skip + params.row
				});
			} else {
				sql += " WHERE tbl.rank > 0 AND tbl.rank <= 20";
			}
		}
		sql += ";";
		result = await basemodel.query(sql, sqlparam);
	} catch(e) {
		result.success = false;
		result.status = 0;
		result.data = null;
		result.message = e.message;
	}
	return result;
}
// 血糖测量 用户总数
exports.get_BGActivation_User_Total = async(svrtype, params) => {
	var result = {
		success: false,
		status: 0,
		data: null,
		message: ""
	};
	try {
		var sqlparam = new Array();
		sqlparam.push({
			param: 'begindate',
			value: params.begindate
		});
		sqlparam.push({
			param: 'enddate',
			value: params.enddate
		});
		var basemodel = base.model(svrtype);
		var sql = "";
		sql += " SELECT" +
			" COUNT(ua.UserID) Total" +
			" FROM UserRegion.dbo.UserAccount ua" +
			" LEFT JOIN UserRegion.dbo.UserInfoCore uc" +
			" ON ua.UserID = uc.UserID" +
			" LEFT JOIN UserRegion.dbo.UserWeightInfo uw" +
			" ON ua.UserID = uw.UserID" +
			" INNER JOIN (" +
			" SELECT bg.UserId, bg.mDeviceId,bg.AppID" +
			" FROM BloodGlucoseInfo bg" +
			" WHERE bg.IsActive = 1" +
			" AND bg.PhoneCreateTime >= @begindate" + //+connection.escape(params.begindate) +
			" AND bg.PhoneCreateTime < @enddate" + //+connection.escape(params.enddate) + //活跃度时间
			" AND bg.CreateTime >= @begindate" + //+connection.escape(params.begindate) +
			" AND bg.CreateTime < @enddate" + //+connection.escape(params.enddate) + //活跃度时间
			" GROUP BY bg.UserId,bg.mDeviceId,bg.AppID" +
			" ) rd" +
			" ON ua.UserID = rd.UserId" +
			" WHERE ua.IsActive = 1";
		if(params.gender != undefined && params.gender != null && params.gender != "NaN") {
			sql += " AND (uc.Gender = @gender"; //+connection.escape(params.gender); // 用户性别
			sqlparam.push({
				param: 'gender',
				value: params.gender
			});
			if(params.gender == 0) {
				sql += " OR uc.Gender is Null";
			}
			sql += ")";
		}
		if(params.usernation != undefined && params.usernation != null && params.usernation != "") {
			if(params.usernation != '0') {
				sql += " AND uc.UserNation = @usernation"; //+connection.escape(params.usernation); // 用户国家
				sqlparam.push({
					param: 'usernation',
					value: params.usernation
				});
			} else {
				sql += " AND uc.UserNation is null";
			}
		}
		if(params.age_op != undefined && params.age_op != null && params.age_op != "") {
			if(params.age_op == "0") {
				sql += " AND DATEDIFF( year, uw.Birthday, GetDate()) is null";
			} else if(params.age != undefined && params.age != null && params.age != NaN) {
				switch(params.age_op) {
					case "=":
						sql += " AND DATEDIFF( year, uw.Birthday, GetDate()) = @age"; //+connection.escape(params.age); // 用户年龄
						break;
					case ">":
						sql += " AND DATEDIFF( year, uw.Birthday, GetDate()) > @age"; //+connection.escape(params.age); // 用户年龄
						break;
					case "<":
						sql += " AND DATEDIFF( year, uw.Birthday, GetDate()) < @age"; //+connection.escape(params.age); // 用户年龄
						break;
				}
				sqlparam.push({
					param: 'age',
					value: params.age
				});
			}
		}

		sql += " ;";
		result = await basemodel.query(sql, sqlparam);
		if(result.success && result.data.length == 1) {
			result.data = result.data[0].Total;
		}
	} catch(e) {
		result.success = false;
		result.status = 0;
		result.data = null;
		result.message = e.message;
	}
	return result;
}

// 血压测量 用户情况
exports.get_BPActivation_User = async(svrtype, params, sortfield, sorttype) => {
	var result = {
		success: false,
		status: 0,
		data: null,
		message: ""
	};
	try {
		var sqlparam = new Array();
		sqlparam.push({
			param: 'begindate',
			value: params.begindate
		});
		sqlparam.push({
			param: 'enddate',
			value: params.enddate
		});

		var basemodel = base.model(svrtype);
		var sql = "";
		sql += "SELECT * FROM (SELECT ROW_NUMBER() OVER (";
		if(sortfield != undefined && sortfield != null && sortfield != "" &&
			sorttype != undefined && sorttype != null && sorttype != "") {
			if(sorttype == "asc") {
				switch(sortfield) {
					case "UserId":
						sql += " ORDER BY urd.UserId ASC "; //排序
						break;
					case "UserName":
						sql += " ORDER BY urd.UserName ASC "; //排序
						break;
					case "UserRegion":
						sql += " ORDER BY urd.UserRegion ASC "; //排序
						break;
					case "CreateTime":
						sql += " ORDER BY urd.CreateTime ASC "; //排序
						break;
					case "Gender":
						sql += " ORDER BY urd.Gender ASC "; //排序
						break;
					case "Age":
						sql += " ORDER BY urd.Age ASC "; //排序
						break;
					case "UserNation":
						sql += " ORDER BY urd.UserNation ASC "; //排序
						break;
					case "AppVersion":
						sql += " ORDER BY upi.AppVersion ASC "; //排序
						break;
					case "PhoneName":
						sql += " ORDER BY upi.PhoneName ASC "; //排序
						break;
					case "PhoneOS":
						sql += " ORDER BY upi.PhoneOS ASC "; //排序
						break;
					case "DeviceName":
						sql += " ORDER BY ud.DeviceName ASC "; //排序
						break;
					default:
						sql += " ORDER BY urd.CreateTime ASC "; //排序
						break;
				}
			} else {
				switch(sortfield) {
					case "UserId":
						sql += " ORDER BY urd.UserId DESC "; //排序
						break;
					case "UserName":
						sql += " ORDER BY urd.UserName DESC "; //排序
						break;
					case "UserRegion":
						sql += " ORDER BY urd.UserRegion DESC "; //排序
						break;
					case "CreateTime":
						sql += " ORDER BY urd.CreateTime DESC "; //排序
						break;
					case "Gender":
						sql += " ORDER BY urd.Gender DESC "; //排序
						break;
					case "Age":
						sql += " ORDER BY urd.Age DESC "; //排序
						break;
					case "UserNation":
						sql += " ORDER BY urd.UserNation DESC "; //排序
						break;
					case "AppVersion":
						sql += " ORDER BY upi.AppVersion DESC "; //排序
						break;
					case "PhoneName":
						sql += " ORDER BY upi.PhoneName DESC "; //排序
						break;
					case "PhoneOS":
						sql += " ORDER BY upi.PhoneOS DESC "; //排序
						break;
					case "DeviceName":
						sql += " ORDER BY ud.DeviceName DESC "; //排序
						break;
					default:
						sql += " ORDER BY urd.CreateTime DESC "; //排序
						break;
				}
			}
		} else {
			sql += " ORDER BY urd.UserId ASC "; //排序
		}
		sql += ") as rank, urd.UserID, urd.UserName,urd.UserRegion,CONVERT(varchar(100), urd.CreateTime, 120) CreateTime," +
			" urd.Gender, CASE WHEN urd.Gender = 1 THEN N'男' WHEN urd.Gender = 2 THEN N'女' ELSE '' END AS GenderText," +
			" IsNull(urd.UserNation,'') UserNation,IsNull(urd.City,'') City,urd.Birthday, IsNull(convert(varchar(20),urd.Age),'') Age," +
			" urd.mDeviceId,IsNull(ud.DeviceName,'') DeviceName," +
			" urd.AppID,IsNull(upi.AppVersion,'') AppVersion,IsNull(upi.PhoneOS,'') PhoneOS,IsNull(upi.PhoneName,'') PhoneName" +
			" FROM (" +
			" SELECT" +
			" ua. UserID, ua.UserName, ua.UserRegion, ua.CreateTime," +
			" uc.Gender, uc.UserNation, uc.City,uw.Birthday," +
			" DATEDIFF( year, uw.Birthday, GetDate()) Age," +
			" rd.mDeviceId,rd.AppID" +
			" FROM UserRegion.dbo.UserAccount ua" +
			" LEFT JOIN UserRegion.dbo.UserInfoCore uc" +
			" ON ua.UserID = uc.UserID" +
			" LEFT JOIN UserRegion.dbo.UserWeightInfo uw" +
			" ON ua.UserID = uw.UserID" +
			" INNER JOIN (" +
			" SELECT bp.UserId, bp.mDeviceId,bp.AppID" +
			" FROM BloodPressureInfo bp" +
			" WHERE bp.IsActive = 1" +
			" AND bp.PhoneCreateTime >= @begindate" + //+connection.escape(params.begindate) +
			" AND bp.PhoneCreateTime < @enddate" + //+connection.escape(params.enddate) + //活跃度时间
			" AND bp.CreateTime >= @begindate" + //+connection.escape(params.begindate) +
			" AND bp.CreateTime < @enddate" + //+connection.escape(params.enddate) + //活跃度时间
			" GROUP BY bp.UserId,bp.mDeviceId,bp.AppID" +
			" ) rd" +
			" ON ua.UserID = rd.UserId" +
			" WHERE ua.IsActive = 1";
		if(params.gender != undefined && params.gender != null && params.gender != "NaN") {
			sql += " AND (uc.Gender = @gender"; //+connection.escape(params.gender); // 用户性别
			sqlparam.push({
				param: 'gender',
				value: params.gender
			});
			if(params.gender == 0) {
				sql += " OR uc.Gender is Null";
			}
			sql += ")";
		}
		if(params.usernation != undefined && params.usernation != null && params.usernation != "") {
			if(params.usernation != '0') {
				sql += " AND uc.UserNation = @usernation"; //+connection.escape(params.usernation); // 用户国家
				sqlparam.push({
					param: 'usernation',
					value: params.usernation
				});
			} else {
				sql += " AND uc.UserNation is null";
			}
		}
		if(params.age_op != undefined && params.age_op != null && params.age_op != "") {
			if(params.age_op == "0") {
				sql += " AND DATEDIFF( year, uw.Birthday, GetDate()) is null";
			} else if(params.age != undefined && params.age != null && params.age != NaN) {
				switch(params.age_op) {
					case "=":
						sql += " AND DATEDIFF( year, uw.Birthday, GetDate()) = @age"; //+connection.escape(params.age); // 用户年龄
						break;
					case ">":
						sql += " AND DATEDIFF( year, uw.Birthday, GetDate()) > @age"; //+connection.escape(params.age); // 用户年龄
						break;
					case "<":
						sql += " AND DATEDIFF( year, uw.Birthday, GetDate()) < @age"; //+connection.escape(params.age); // 用户年龄
						break;
				}
				sqlparam.push({
					param: 'age',
					value: params.age
				});
			}
		}

		sql += " ) urd" +
			" LEFT JOIN ih_userdevice ud" +
			" ON urd.UserId = ud.UserId AND urd.mDeviceId = ud.mDeviceId AND ud.IsActive = 1 AND ud.Type = 1" +
			" LEFT JOIN UserPhoneInfo upi" +
			" ON urd.userid = upi.UserId AND urd.AppId =upi.AppId) tbl";

		if(params.ispage != undefined && params.ispage != null && params.ispage == true) {
			if(params.skip != undefined && params.skip != null && params.skip != NaN &&
				params.row != undefined && params.row != null && params.row != NaN) {
				sql += " WHERE tbl.rank > @skip AND tbl.rank <= @row"; //+connection.escape(params.row); //分页
				sqlparam.push({
					param: 'skip',
					value: params.skip
				});
				sqlparam.push({
					param: 'row',
					value: params.skip + params.row
				});
			} else {
				sql += " WHERE tbl.rank > 0 AND tbl.rank <= 20";
			}
		}
		sql += ";";
		console.log(sql);
		result = await basemodel.query(sql, sqlparam);
	} catch(e) {
		result.success = false;
		result.status = 0;
		result.data = null;
		result.message = e.message;
	}
	return result;
}
// 血压测量 用户总数
exports.get_BPActivation_User_Total = async(svrtype, params) => {
	var result = {
		success: false,
		status: 0,
		data: null,
		message: ""
	};
	try {
		var sqlparam = new Array();
		sqlparam.push({
			param: 'begindate',
			value: params.begindate
		});
		sqlparam.push({
			param: 'enddate',
			value: params.enddate
		});
		var basemodel = base.model(svrtype);
		var sql = "";
		sql += " SELECT" +
			" COUNT(ua.UserID) Total" +
			" FROM UserRegion.dbo.UserAccount ua" +
			" LEFT JOIN UserRegion.dbo.UserInfoCore uc" +
			" ON ua.UserID = uc.UserID" +
			" LEFT JOIN UserRegion.dbo.UserWeightInfo uw" +
			" ON ua.UserID = uw.UserID" +
			" INNER JOIN (" +
			" SELECT bp.UserId, bp.mDeviceId,bp.AppID" +
			" FROM BloodPressureInfo bp" +
			" WHERE bp.IsActive = 1" +
			" AND bp.PhoneCreateTime >= @begindate" + //+connection.escape(params.begindate) +
			" AND bp.PhoneCreateTime < @enddate" + //+connection.escape(params.enddate) + //活跃度时间
			" AND bp.CreateTime >= @begindate" + //+connection.escape(params.begindate) +
			" AND bp.CreateTime < @enddate" + //+connection.escape(params.enddate) + //活跃度时间
			" GROUP BY bp.UserId,bp.mDeviceId,bp.AppID" +
			" ) rd" +
			" ON ua.UserID = rd.UserId" +
			" WHERE ua.IsActive = 1";
		if(params.gender != undefined && params.gender != null && params.gender != "NaN") {
			sql += " AND (uc.Gender = @gender"; //+connection.escape(params.gender); // 用户性别
			sqlparam.push({
				param: 'gender',
				value: params.gender
			});
			if(params.gender == 0) {
				sql += " OR uc.Gender is Null";
			}
			sql += ")";
		}
		if(params.usernation != undefined && params.usernation != null && params.usernation != "") {
			if(params.usernation != '0') {
				sql += " AND uc.UserNation = @usernation"; //+connection.escape(params.usernation); // 用户国家
				sqlparam.push({
					param: 'usernation',
					value: params.usernation
				});
			} else {
				sql += " AND uc.UserNation is null";
			}
		}
		if(params.age_op != undefined && params.age_op != null && params.age_op != "") {
			if(params.age_op == "0") {
				sql += " AND DATEDIFF( year, uw.Birthday, GetDate()) is null";
			} else if(params.age != undefined && params.age != null && params.age != NaN) {
				switch(params.age_op) {
					case "=":
						sql += " AND DATEDIFF( year, uw.Birthday, GetDate()) = @age"; //+connection.escape(params.age); // 用户年龄
						break;
					case ">":
						sql += " AND DATEDIFF( year, uw.Birthday, GetDate()) > @age"; //+connection.escape(params.age); // 用户年龄
						break;
					case "<":
						sql += " AND DATEDIFF( year, uw.Birthday, GetDate()) < @age"; //+connection.escape(params.age); // 用户年龄
						break;
				}
				sqlparam.push({
					param: 'age',
					value: params.age
				});
			}
		}

		sql += " ;";
		result = await basemodel.query(sql, sqlparam);
		if(result.success && result.data.length == 1) {
			result.data = result.data[0].Total;
		}
	} catch(e) {
		result.success = false;
		result.status = 0;
		result.data = null;
		result.message = e.message;
	}
	return result;
}

// 血氧测量 用户情况
exports.get_BOActivation_User = async(svrtype, params, sortfield, sorttype) => {
	var result = {
		success: false,
		status: 0,
		data: null,
		message: ""
	};
	try {
		var sqlparam = new Array();
		sqlparam.push({
			param: 'begindate',
			value: params.begindate
		});
		sqlparam.push({
			param: 'enddate',
			value: params.enddate
		});

		var basemodel = base.model(svrtype);
		var sql = "";
		sql += "SELECT * FROM (SELECT ROW_NUMBER() OVER (";
		if(sortfield != undefined && sortfield != null && sortfield != "" &&
			sorttype != undefined && sorttype != null && sorttype != "") {
			if(sorttype == "asc") {
				switch(sortfield) {
					case "UserId":
						sql += " ORDER BY urd.UserId ASC "; //排序
						break;
					case "UserName":
						sql += " ORDER BY urd.UserName ASC "; //排序
						break;
					case "UserRegion":
						sql += " ORDER BY urd.UserRegion ASC "; //排序
						break;
					case "CreateTime":
						sql += " ORDER BY urd.CreateTime ASC "; //排序
						break;
					case "Gender":
						sql += " ORDER BY urd.Gender ASC "; //排序
						break;
					case "Age":
						sql += " ORDER BY urd.Age ASC "; //排序
						break;
					case "UserNation":
						sql += " ORDER BY urd.UserNation ASC "; //排序
						break;
					case "AppVersion":
						sql += " ORDER BY upi.AppVersion ASC "; //排序
						break;
					case "PhoneName":
						sql += " ORDER BY upi.PhoneName ASC "; //排序
						break;
					case "PhoneOS":
						sql += " ORDER BY upi.PhoneOS ASC "; //排序
						break;
					case "DeviceName":
						sql += " ORDER BY ud.DeviceName ASC "; //排序
						break;
					default:
						sql += " ORDER BY urd.CreateTime ASC "; //排序
						break;
				}
			} else {
				switch(sortfield) {
					case "UserId":
						sql += " ORDER BY urd.UserId DESC "; //排序
						break;
					case "UserName":
						sql += " ORDER BY urd.UserName DESC "; //排序
						break;
					case "UserRegion":
						sql += " ORDER BY urd.UserRegion DESC "; //排序
						break;
					case "CreateTime":
						sql += " ORDER BY urd.CreateTime DESC "; //排序
						break;
					case "Gender":
						sql += " ORDER BY urd.Gender DESC "; //排序
						break;
					case "Age":
						sql += " ORDER BY urd.Age DESC "; //排序
						break;
					case "UserNation":
						sql += " ORDER BY urd.UserNation DESC "; //排序
						break;
					case "AppVersion":
						sql += " ORDER BY upi.AppVersion DESC "; //排序
						break;
					case "PhoneName":
						sql += " ORDER BY upi.PhoneName DESC "; //排序
						break;
					case "PhoneOS":
						sql += " ORDER BY upi.PhoneOS DESC "; //排序
						break;
					case "DeviceName":
						sql += " ORDER BY ud.DeviceName DESC "; //排序
						break;
					default:
						sql += " ORDER BY urd.CreateTime DESC "; //排序
						break;
				}
			}
		} else {
			sql += " ORDER BY urd.UserId ASC "; //排序
		}
		sql += ") as rank, urd.UserID, urd.UserName,urd.UserRegion,CONVERT(varchar(100), urd.CreateTime, 120) CreateTime," +
			" urd.Gender, CASE WHEN urd.Gender = 1 THEN N'男' WHEN urd.Gender = 2 THEN N'女' ELSE '' END AS GenderText," +
			" IsNull(urd.UserNation,'') UserNation,IsNull(urd.City,'') City,urd.Birthday, IsNull(convert(varchar(20),urd.Age),'') Age," +
			" urd.mDeviceId,IsNull(ud.DeviceName,'') DeviceName," +
			" urd.AppID,IsNull(upi.AppVersion,'') AppVersion,IsNull(upi.PhoneOS,'') PhoneOS,IsNull(upi.PhoneName,'') PhoneName" +
			" FROM (" +
			" SELECT" +
			" ua. UserID, ua.UserName, ua.UserRegion, ua.CreateTime," +
			" uc.Gender, uc.UserNation, uc.City,uw.Birthday," +
			" DATEDIFF( year, uw.Birthday, GetDate()) Age," +
			" rd.mDeviceId,rd.AppID" +
			" FROM UserRegion.dbo.UserAccount ua" +
			" LEFT JOIN UserRegion.dbo.UserInfoCore uc" +
			" ON ua.UserID = uc.UserID" +
			" LEFT JOIN UserRegion.dbo.UserWeightInfo uw" +
			" ON ua.UserID = uw.UserID" +
			" INNER JOIN (" +
			" SELECT bo.UserId, bo.mDeviceId,bo.AppID" +
			" FROM ih_BloodOxygen bo" +
			" WHERE bo.IsActive = 1" +
			" AND bo.PhoneCreateTime >= @begindate" + //+connection.escape(params.begindate) +
			" AND bo.PhoneCreateTime < @enddate" + //+connection.escape(params.enddate) + //活跃度时间
			" AND bo.CreateTime >= @begindate" + //+connection.escape(params.begindate) +
			" AND bo.CreateTime < @enddate" + //+connection.escape(params.enddate) + //活跃度时间
			" GROUP BY bo.UserId,bo.mDeviceId,bo.AppID" +
			" ) rd" +
			" ON ua.UserID = rd.UserId" +
			" WHERE ua.IsActive = 1";
		if(params.gender != undefined && params.gender != null && params.gender != "NaN") {
			sql += " AND (uc.Gender = @gender"; //+connection.escape(params.gender); // 用户性别
			sqlparam.push({
				param: 'gender',
				value: params.gender
			});
			if(params.gender == 0) {
				sql += " OR uc.Gender is Null";
			}
			sql += ")";
		}
		if(params.usernation != undefined && params.usernation != null && params.usernation != "") {
			if(params.usernation != '0') {
				sql += " AND uc.UserNation = @usernation"; //+connection.escape(params.usernation); // 用户国家
				sqlparam.push({
					param: 'usernation',
					value: params.usernation
				});
			} else {
				sql += " AND uc.UserNation is null";
			}
		}
		if(params.age_op != undefined && params.age_op != null && params.age_op != "") {
			if(params.age_op == "0") {
				sql += " AND DATEDIFF( year, uw.Birthday, GetDate()) is null";
			} else if(params.age != undefined && params.age != null && params.age != NaN) {
				switch(params.age_op) {
					case "=":
						sql += " AND DATEDIFF( year, uw.Birthday, GetDate()) = @age"; //+connection.escape(params.age); // 用户年龄
						break;
					case ">":
						sql += " AND DATEDIFF( year, uw.Birthday, GetDate()) > @age"; //+connection.escape(params.age); // 用户年龄
						break;
					case "<":
						sql += " AND DATEDIFF( year, uw.Birthday, GetDate()) < @age"; //+connection.escape(params.age); // 用户年龄
						break;
				}
				sqlparam.push({
					param: 'age',
					value: params.age
				});
			}
		}

		sql += " ) urd" +
			" LEFT JOIN ih_userdevice ud" +
			" ON urd.UserId = ud.UserId AND urd.mDeviceId = ud.mDeviceId AND ud.IsActive = 1 AND ud.Type = 1" +
			" LEFT JOIN UserPhoneInfo upi" +
			" ON urd.userid = upi.UserId AND urd.AppId =upi.AppId) tbl";

		if(params.ispage != undefined && params.ispage != null && params.ispage == true) {
			if(params.skip != undefined && params.skip != null && params.skip != NaN &&
				params.row != undefined && params.row != null && params.row != NaN) {
				sql += " WHERE tbl.rank > @skip AND tbl.rank <= @row"; //+connection.escape(params.row); //分页
				sqlparam.push({
					param: 'skip',
					value: params.skip
				});
				sqlparam.push({
					param: 'row',
					value: params.skip + params.row
				});
			} else {
				sql += " WHERE tbl.rank > 0 AND tbl.rank <= 20";
			}
		}
		sql += ";";
		result = await basemodel.query(sql, sqlparam);
	} catch(e) {
		result.success = false;
		result.status = 0;
		result.data = null;
		result.message = e.message;
	}
	return result;
}
// 血氧测量 用户总数
exports.get_BOActivation_User_Total = async(svrtype, params) => {
	var result = {
		success: false,
		status: 0,
		data: null,
		message: ""
	};
	try {
		var sqlparam = new Array();
		sqlparam.push({
			param: 'begindate',
			value: params.begindate
		});
		sqlparam.push({
			param: 'enddate',
			value: params.enddate
		});
		var basemodel = base.model(svrtype);
		var sql = "";
		sql += " SELECT" +
			" COUNT(ua.UserID) Total" +
			" FROM UserRegion.dbo.UserAccount ua" +
			" LEFT JOIN UserRegion.dbo.UserInfoCore uc" +
			" ON ua.UserID = uc.UserID" +
			" LEFT JOIN UserRegion.dbo.UserWeightInfo uw" +
			" ON ua.UserID = uw.UserID" +
			" INNER JOIN (" +
			" SELECT bo.UserId, bo.mDeviceId,bo.AppID" +
			" FROM ih_BloodOxygen bo" +
			" WHERE bo.IsActive = 1" +
			" AND bo.PhoneCreateTime >= @begindate" + //+connection.escape(params.begindate) +
			" AND bo.PhoneCreateTime < @enddate" + //+connection.escape(params.enddate) + //活跃度时间
			" AND bo.CreateTime >= @begindate" + //+connection.escape(params.begindate) +
			" AND bo.CreateTime < @enddate" + //+connection.escape(params.enddate) + //活跃度时间
			" GROUP BY bo.UserId,bo.mDeviceId,bo.AppID" +
			" ) rd" +
			" ON ua.UserID = rd.UserId" +
			" WHERE ua.IsActive = 1";
		if(params.gender != undefined && params.gender != null && params.gender != "NaN") {
			sql += " AND (uc.Gender = @gender"; //+connection.escape(params.gender); // 用户性别
			sqlparam.push({
				param: 'gender',
				value: params.gender
			});
			if(params.gender == 0) {
				sql += " OR uc.Gender is Null";
			}
			sql += ")";
		}
		if(params.usernation != undefined && params.usernation != null && params.usernation != "") {
			if(params.usernation != '0') {
				sql += " AND uc.UserNation = @usernation"; //+connection.escape(params.usernation); // 用户国家
				sqlparam.push({
					param: 'usernation',
					value: params.usernation
				});
			} else {
				sql += " AND uc.UserNation is null";
			}
		}
		if(params.age_op != undefined && params.age_op != null && params.age_op != "") {
			if(params.age_op == "0") {
				sql += " AND DATEDIFF( year, uw.Birthday, GetDate()) is null";
			} else if(params.age != undefined && params.age != null && params.age != NaN) {
				switch(params.age_op) {
					case "=":
						sql += " AND DATEDIFF( year, uw.Birthday, GetDate()) = @age"; //+connection.escape(params.age); // 用户年龄
						break;
					case ">":
						sql += " AND DATEDIFF( year, uw.Birthday, GetDate()) > @age"; //+connection.escape(params.age); // 用户年龄
						break;
					case "<":
						sql += " AND DATEDIFF( year, uw.Birthday, GetDate()) < @age"; //+connection.escape(params.age); // 用户年龄
						break;
				}
				sqlparam.push({
					param: 'age',
					value: params.age
				});
			}
		}

		sql += " ;";
		result = await basemodel.query(sql, sqlparam);
		if(result.success && result.data.length == 1) {
			result.data = result.data[0].Total;
		}
	} catch(e) {
		result.success = false;
		result.status = 0;
		result.data = null;
		result.message = e.message;
	}
	return result;
}

// 体重测量 用户情况
exports.get_WMActivation_User = async(svrtype, params, sortfield, sorttype) => {
	var result = {
		success: false,
		status: 0,
		data: null,
		message: ""
	};

	try {
		var sqlparam = new Array();
		sqlparam.push({
			param: 'begindate',
			value: params.begindate
		});
		sqlparam.push({
			param: 'enddate',
			value: params.enddate
		});

		var basemodel = base.model(svrtype);
		var sql = "";
		sql += "SELECT * FROM (SELECT ROW_NUMBER() OVER (";
		if(sortfield != undefined && sortfield != null && sortfield != "" &&
			sorttype != undefined && sorttype != null && sorttype != "") {
			if(sorttype == "asc") {
				switch(sortfield) {
					case "UserId":
						sql += " ORDER BY urd.UserId ASC "; //排序
						break;
					case "UserName":
						sql += " ORDER BY urd.UserName ASC "; //排序
						break;
					case "UserRegion":
						sql += " ORDER BY urd.UserRegion ASC "; //排序
						break;
					case "CreateTime":
						sql += " ORDER BY urd.CreateTime ASC "; //排序
						break;
					case "Gender":
						sql += " ORDER BY urd.Gender ASC "; //排序
						break;
					case "Age":
						sql += " ORDER BY urd.Age ASC "; //排序
						break;
					case "UserNation":
						sql += " ORDER BY urd.UserNation ASC "; //排序
						break;
					case "AppVersion":
						sql += " ORDER BY upi.AppVersion ASC "; //排序
						break;
					case "PhoneName":
						sql += " ORDER BY upi.PhoneName ASC "; //排序
						break;
					case "PhoneOS":
						sql += " ORDER BY upi.PhoneOS ASC "; //排序
						break;
					case "DeviceName":
						sql += " ORDER BY ud.DeviceName ASC "; //排序
						break;
					default:
						sql += " ORDER BY urd.CreateTime ASC "; //排序
						break;
				}
			} else {
				switch(sortfield) {
					case "UserId":
						sql += " ORDER BY urd.UserId DESC "; //排序
						break;
					case "UserName":
						sql += " ORDER BY urd.UserName DESC "; //排序
						break;
					case "UserRegion":
						sql += " ORDER BY urd.UserRegion DESC "; //排序
						break;
					case "CreateTime":
						sql += " ORDER BY urd.CreateTime DESC "; //排序
						break;
					case "Gender":
						sql += " ORDER BY urd.Gender DESC "; //排序
						break;
					case "Age":
						sql += " ORDER BY urd.Age DESC "; //排序
						break;
					case "UserNation":
						sql += " ORDER BY urd.UserNation DESC "; //排序
						break;
					case "AppVersion":
						sql += " ORDER BY upi.AppVersion DESC "; //排序
						break;
					case "PhoneName":
						sql += " ORDER BY upi.PhoneName DESC "; //排序
						break;
					case "PhoneOS":
						sql += " ORDER BY upi.PhoneOS DESC "; //排序
						break;
					case "DeviceName":
						sql += " ORDER BY ud.DeviceName DESC "; //排序
						break;
					default:
						sql += " ORDER BY urd.CreateTime DESC "; //排序
						break;
				}
			}
		} else {
			sql += " ORDER BY urd.UserId ASC "; //排序
		}
		sql += ") as rank, urd.UserID, urd.UserName,urd.UserRegion,CONVERT(varchar(100), urd.CreateTime, 120) CreateTime," +
			" urd.Gender, CASE WHEN urd.Gender = 1 THEN N'男' WHEN urd.Gender = 2 THEN N'女' ELSE '' END AS GenderText," +
			" IsNull(urd.UserNation,'') UserNation,IsNull(urd.City,'') City,urd.Birthday, IsNull(convert(varchar(20),urd.Age),'') Age," +
			" urd.mDeviceId,IsNull(ud.DeviceName,'') DeviceName," +
			" urd.AppID,IsNull(upi.AppVersion,'') AppVersion,IsNull(upi.PhoneOS,'') PhoneOS,IsNull(upi.PhoneName,'') PhoneName" +
			" FROM (" +
			" SELECT" +
			" ua. UserID, ua.UserName, ua.UserRegion, ua.CreateTime," +
			" uc.Gender, uc.UserNation, uc.City,uw.Birthday," +
			" DATEDIFF( year, uw.Birthday, GetDate()) Age," +
			" rd.mDeviceId,rd.AppID" +
			" FROM UserRegion.dbo.UserAccount ua" +
			" LEFT JOIN UserRegion.dbo.UserInfoCore uc" +
			" ON ua.UserID = uc.UserID" +
			" LEFT JOIN UserRegion.dbo.UserWeightInfo uw" +
			" ON ua.UserID = uw.UserID" +
			" INNER JOIN (" +
			" SELECT wm.UserId, wm.mDeviceId,wm.AppID" +
			" FROM WeightMeasurementInfo wm" +
			" WHERE wm.IsActive = 1" +
			" AND wm.PhoneCreateTime >= @begindate" + //+connection.escape(params.begindate) +
			" AND wm.PhoneCreateTime < @enddate" + //+connection.escape(params.enddate) + //活跃度时间
			" AND wm.CreateTime >= @begindate" + //+connection.escape(params.begindate) +
			" AND wm.CreateTime < @enddate" + //+connection.escape(params.enddate) + //活跃度时间
			" GROUP BY wm.UserId,wm.mDeviceId,wm.AppID" +
			" ) rd" +
			" ON ua.UserID = rd.UserId" +
			" WHERE ua.IsActive = 1";
		if(params.gender != undefined && params.gender != null && params.gender != "NaN") {
			sql += " AND (uc.Gender = @gender"; //+connection.escape(params.gender); // 用户性别
			sqlparam.push({
				param: 'gender',
				value: params.gender
			});
			if(params.gender == 0) {
				sql += " OR uc.Gender is Null";
			}
			sql += ")";
		}
		if(params.usernation != undefined && params.usernation != null && params.usernation != "") {
			if(params.usernation != '0') {
				sql += " AND uc.UserNation = @usernation"; //+connection.escape(params.usernation); // 用户国家
				sqlparam.push({
					param: 'usernation',
					value: params.usernation
				});
			} else {
				sql += " AND uc.UserNation is null";
			}
		}
		if(params.age_op != undefined && params.age_op != null && params.age_op != "") {
			if(params.age_op == "0") {
				sql += " AND DATEDIFF( year, uw.Birthday, GetDate()) is null";
			} else if(params.age != undefined && params.age != null && params.age != NaN) {
				switch(params.age_op) {
					case "=":
						sql += " AND DATEDIFF( year, uw.Birthday, GetDate()) = @age"; //+connection.escape(params.age); // 用户年龄
						break;
					case ">":
						sql += " AND DATEDIFF( year, uw.Birthday, GetDate()) > @age"; //+connection.escape(params.age); // 用户年龄
						break;
					case "<":
						sql += " AND DATEDIFF( year, uw.Birthday, GetDate()) < @age"; //+connection.escape(params.age); // 用户年龄
						break;
				}
				sqlparam.push({
					param: 'age',
					value: params.age
				});
			}
		}

		sql += " ) urd" +
			" LEFT JOIN ih_userdevice ud" +
			" ON urd.UserId = ud.UserId AND urd.mDeviceId = ud.mDeviceId AND ud.IsActive = 1 AND ud.Type = 1" +
			" LEFT JOIN UserPhoneInfo upi" +
			" ON urd.userid = upi.UserId AND urd.AppId =upi.AppId) tbl";

		if(params.ispage != undefined && params.ispage != null && params.ispage == true) {
			if(params.skip != undefined && params.skip != null && params.skip != NaN &&
				params.row != undefined && params.row != null && params.row != NaN) {
				sql += " WHERE tbl.rank > @skip AND tbl.rank <= @row"; //+connection.escape(params.row); //分页
				sqlparam.push({
					param: 'skip',
					value: params.skip
				});
				sqlparam.push({
					param: 'row',
					value: params.skip + params.row
				});
			} else {
				sql += " WHERE tbl.rank > 0 AND tbl.rank <= 20";
			}
		}
		sql += ";";
		result = await basemodel.query(sql, sqlparam);
	} catch(e) {
		result.success = false;
		result.status = 0;
		result.data = null;
		result.message = e.message;
	}
	return result;
}
// 体重测量 用户总数
exports.get_WMActivation_User_Total = async(svrtype, params) => {
	var result = {
		success: false,
		status: 0,
		data: null,
		message: ""
	};
	try {
		var sqlparam = new Array();
		sqlparam.push({
			param: 'begindate',
			value: params.begindate
		});
		sqlparam.push({
			param: 'enddate',
			value: params.enddate
		});
		var basemodel = base.model(svrtype);
		var sql = "";
		sql += " SELECT" +
			" COUNT(ua.UserID) Total" +
			" FROM UserRegion.dbo.UserAccount ua" +
			" LEFT JOIN UserRegion.dbo.UserInfoCore uc" +
			" ON ua.UserID = uc.UserID" +
			" LEFT JOIN UserRegion.dbo.UserWeightInfo uw" +
			" ON ua.UserID = uw.UserID" +
			" INNER JOIN (" +
			" SELECT wm.UserId, wm.mDeviceId,wm.AppID" +
			" FROM WeightMeasurementInfo wm" +
			" WHERE wm.IsActive = 1" +
			" AND wm.PhoneCreateTime >= @begindate" + //+connection.escape(params.begindate) +
			" AND wm.PhoneCreateTime < @enddate" + //+connection.escape(params.enddate) + //活跃度时间
			" AND wm.CreateTime >= @begindate" + //+connection.escape(params.begindate) +
			" AND wm.CreateTime < @enddate" + //+connection.escape(params.enddate) + //活跃度时间
			" GROUP BY wm.UserId,wm.mDeviceId,wm.AppID" +
			" ) rd" +
			" ON ua.UserID = rd.UserId" +
			" WHERE ua.IsActive = 1";
		if(params.gender != undefined && params.gender != null && params.gender != "NaN") {
			sql += " AND (uc.Gender = @gender"; //+connection.escape(params.gender); // 用户性别
			sqlparam.push({
				param: 'gender',
				value: params.gender
			});
			if(params.gender == 0) {
				sql += " OR uc.Gender is Null";
			}
			sql += ")";
		}
		if(params.usernation != undefined && params.usernation != null && params.usernation != "") {
			if(params.usernation != '0') {
				sql += " AND uc.UserNation = @usernation"; //+connection.escape(params.usernation); // 用户国家
				sqlparam.push({
					param: 'usernation',
					value: params.usernation
				});
			} else {
				sql += " AND uc.UserNation is null";
			}
		}
		if(params.age_op != undefined && params.age_op != null && params.age_op != "") {
			if(params.age_op == "0") {
				sql += " AND DATEDIFF( year, uw.Birthday, GetDate()) is null";
			} else if(params.age != undefined && params.age != null && params.age != NaN) {
				switch(params.age_op) {
					case "=":
						sql += " AND DATEDIFF( year, uw.Birthday, GetDate()) = @age"; //+connection.escape(params.age); // 用户年龄
						break;
					case ">":
						sql += " AND DATEDIFF( year, uw.Birthday, GetDate()) > @age"; //+connection.escape(params.age); // 用户年龄
						break;
					case "<":
						sql += " AND DATEDIFF( year, uw.Birthday, GetDate()) < @age"; //+connection.escape(params.age); // 用户年龄
						break;
				}
				sqlparam.push({
					param: 'age',
					value: params.age
				});
			}
		}

		sql += " ;";
		result = await basemodel.query(sql, sqlparam);
		if(result.success && result.data.length == 1) {
			result.data = result.data[0].Total;
		}
	} catch(e) {
		result.success = false;
		result.status = 0;
		result.data = null;
		result.message = e.message;
	}
	return result;
}

// 运动测量 用户情况
exports.get_AMSSActivation_User = async(svrtype, params, sortfield, sorttype) => {
	var result = {
		success: false,
		status: 0,
		data: null,
		message: ""
	};
	try {
		var sqlparam = new Array();
		sqlparam.push({
			param: 'begindate',
			value: params.begindate
		});
		sqlparam.push({
			param: 'enddate',
			value: params.enddate
		});

		var basemodel = base.model(svrtype);
		var sql = "";
		sql += "SELECT * FROM (SELECT ROW_NUMBER() OVER (";
		if(sortfield != undefined && sortfield != null && sortfield != "" &&
			sorttype != undefined && sorttype != null && sorttype != "") {
			if(sorttype == "asc") {
				switch(sortfield) {
					case "UserId":
						sql += " ORDER BY urd.UserId ASC "; //排序
						break;
					case "UserName":
						sql += " ORDER BY urd.UserName ASC "; //排序
						break;
					case "UserRegion":
						sql += " ORDER BY urd.UserRegion ASC "; //排序
						break;
					case "CreateTime":
						sql += " ORDER BY urd.CreateTime ASC "; //排序
						break;
					case "Gender":
						sql += " ORDER BY urd.Gender ASC "; //排序
						break;
					case "Age":
						sql += " ORDER BY urd.Age ASC "; //排序
						break;
					case "UserNation":
						sql += " ORDER BY urd.UserNation ASC "; //排序
						break;
					case "AppVersion":
						sql += " ORDER BY upi.AppVersion ASC "; //排序
						break;
					case "PhoneName":
						sql += " ORDER BY upi.PhoneName ASC "; //排序
						break;
					case "PhoneOS":
						sql += " ORDER BY upi.PhoneOS ASC "; //排序
						break;
					case "DeviceName":
						sql += " ORDER BY ud.DeviceName ASC "; //排序
						break;
					default:
						sql += " ORDER BY urd.CreateTime ASC "; //排序
						break;
				}
			} else {
				switch(sortfield) {
					case "UserId":
						sql += " ORDER BY urd.UserId DESC "; //排序
						break;
					case "UserName":
						sql += " ORDER BY urd.UserName DESC "; //排序
						break;
					case "UserRegion":
						sql += " ORDER BY urd.UserRegion DESC "; //排序
						break;
					case "CreateTime":
						sql += " ORDER BY urd.CreateTime DESC "; //排序
						break;
					case "Gender":
						sql += " ORDER BY urd.Gender DESC "; //排序
						break;
					case "Age":
						sql += " ORDER BY urd.Age DESC "; //排序
						break;
					case "UserNation":
						sql += " ORDER BY urd.UserNation DESC "; //排序
						break;
					case "AppVersion":
						sql += " ORDER BY upi.AppVersion DESC "; //排序
						break;
					case "PhoneName":
						sql += " ORDER BY upi.PhoneName DESC "; //排序
						break;
					case "PhoneOS":
						sql += " ORDER BY upi.PhoneOS DESC "; //排序
						break;
					case "DeviceName":
						sql += " ORDER BY ud.DeviceName DESC "; //排序
						break;
					default:
						sql += " ORDER BY urd.CreateTime DESC "; //排序
						break;
				}
			}
		} else {
			sql += " ORDER BY urd.UserId ASC "; //排序
		}
		sql += ") as rank, urd.UserID, urd.UserName,urd.UserRegion,CONVERT(varchar(100), urd.CreateTime, 120) CreateTime," +
			" urd.Gender, CASE WHEN urd.Gender = 1 THEN N'男' WHEN urd.Gender = 2 THEN N'女' ELSE '' END AS GenderText," +
			" IsNull(urd.UserNation,'') UserNation,IsNull(urd.City,'') City,urd.Birthday, IsNull(convert(varchar(20),urd.Age),'') Age," +
			" urd.mDeviceId,IsNull(ud.DeviceName,'') DeviceName," +
			" urd.AppID,IsNull(upi.AppVersion,'') AppVersion,IsNull(upi.PhoneOS,'') PhoneOS,IsNull(upi.PhoneName,'') PhoneName" +
			" FROM (" +
			" SELECT" +
			" ua. UserID, ua.UserName, ua.UserRegion, ua.CreateTime," +
			" uc.Gender, uc.UserNation, uc.City,uw.Birthday," +
			" DATEDIFF( year, uw.Birthday, GetDate()) Age," +
			" rd.mDeviceId,rd.AppID" +
			" FROM UserRegion.dbo.UserAccount ua" +
			" LEFT JOIN UserRegion.dbo.UserInfoCore uc" +
			" ON ua.UserID = uc.UserID" +
			" LEFT JOIN UserRegion.dbo.UserWeightInfo uw" +
			" ON ua.UserID = uw.UserID" +
			" INNER JOIN (" +
			" SELECT am.UserId, am.mDeviceId,am.AppID" +
			" FROM ih_AMActiveReport am" +
			" WHERE am.IsActive = 1" +
			" AND am.PhoneCreateTime >= @begindate" + //+connection.escape(params.begindate) +
			" AND am.PhoneCreateTime < @enddate" + //+connection.escape(params.enddate) + //活跃度时间
			" AND am.CreateTime >= @begindate" + //+connection.escape(params.begindate) +
			" AND am.CreateTime < @enddate" + //+connection.escape(params.enddate) + //活跃度时间
			" GROUP BY am.UserId,am.mDeviceId,am.AppID" +
			" ) rd" +
			" ON ua.UserID = rd.UserId" +
			" WHERE ua.IsActive = 1";
		if(params.gender != undefined && params.gender != null && params.gender != "NaN") {
			sql += " AND (uc.Gender = @gender"; //+connection.escape(params.gender); // 用户性别
			sqlparam.push({
				param: 'gender',
				value: params.gender
			});
			if(params.gender == 0) {
				sql += " OR uc.Gender is Null";
			}
			sql += ")";
		}
		if(params.usernation != undefined && params.usernation != null && params.usernation != "") {
			if(params.usernation != '0') {
				sql += " AND uc.UserNation = @usernation"; //+connection.escape(params.usernation); // 用户国家
				sqlparam.push({
					param: 'usernation',
					value: params.usernation
				});
			} else {
				sql += " AND uc.UserNation is null";
			}
		}
		if(params.age_op != undefined && params.age_op != null && params.age_op != "") {
			if(params.age_op == "0") {
				sql += " AND DATEDIFF( year, uw.Birthday, GetDate()) is null";
			} else if(params.age != undefined && params.age != null && params.age != NaN) {
				switch(params.age_op) {
					case "=":
						sql += " AND DATEDIFF( year, uw.Birthday, GetDate()) = @age"; //+connection.escape(params.age); // 用户年龄
						break;
					case ">":
						sql += " AND DATEDIFF( year, uw.Birthday, GetDate()) > @age"; //+connection.escape(params.age); // 用户年龄
						break;
					case "<":
						sql += " AND DATEDIFF( year, uw.Birthday, GetDate()) < @age"; //+connection.escape(params.age); // 用户年龄
						break;
				}
				sqlparam.push({
					param: 'age',
					value: params.age
				});
			}
		}

		sql += " ) urd" +
			" LEFT JOIN ih_userdevice ud" +
			" ON urd.UserId = ud.UserId AND urd.mDeviceId = ud.mDeviceId AND ud.IsActive = 1 AND ud.Type = 1" +
			" LEFT JOIN UserPhoneInfo upi" +
			" ON urd.userid = upi.UserId AND urd.AppId =upi.AppId) tbl";

		if(params.ispage != undefined && params.ispage != null && params.ispage == true) {
			if(params.skip != undefined && params.skip != null && params.skip != NaN &&
				params.row != undefined && params.row != null && params.row != NaN) {
				sql += " WHERE tbl.rank > @skip AND tbl.rank <= @row"; //+connection.escape(params.row); //分页
				sqlparam.push({
					param: 'skip',
					value: params.skip
				});
				sqlparam.push({
					param: 'row',
					value: params.skip + params.row
				});
			} else {
				sql += " WHERE tbl.rank > 0 AND tbl.rank <= 20";
			}
		}
		sql += ";";
		result = await basemodel.query(sql, sqlparam);
	} catch(e) {
		result.success = false;
		result.status = 0;
		result.data = null;
		result.message = e.message;
	}
	return result;
}
// 运动测量 用户总数
exports.get_AMSSActivation_User_Total = async(svrtype, params) => {
	var result = {
		success: false,
		status: 0,
		data: null,
		message: ""
	};
	try {
		var sqlparam = new Array();
		sqlparam.push({
			param: 'begindate',
			value: params.begindate
		});
		sqlparam.push({
			param: 'enddate',
			value: params.enddate
		});
		var basemodel = base.model(svrtype);
		var sql = "";
		sql += " SELECT" +
			" COUNT(ua.UserID) Total" +
			" FROM UserRegion.dbo.UserAccount ua" +
			" LEFT JOIN UserRegion.dbo.UserInfoCore uc" +
			" ON ua.UserID = uc.UserID" +
			" LEFT JOIN UserRegion.dbo.UserWeightInfo uw" +
			" ON ua.UserID = uw.UserID" +
			" INNER JOIN (" +
			" SELECT am.UserId, am.mDeviceId,am.AppID" +
			" FROM ih_AMActiveReport am" +
			" WHERE am.IsActive = 1" +
			" AND am.PhoneCreateTime >= @begindate" + //+connection.escape(params.begindate) +
			" AND am.PhoneCreateTime < @enddate" + //+connection.escape(params.enddate) + //活跃度时间
			" AND am.CreateTime >= @begindate" + //+connection.escape(params.begindate) +
			" AND am.CreateTime < @enddate" + //+connection.escape(params.enddate) + //活跃度时间
			" GROUP BY am.UserId,am.mDeviceId,am.AppID" +
			" ) rd" +
			" ON ua.UserID = rd.UserId" +
			" WHERE ua.IsActive = 1";
		if(params.gender != undefined && params.gender != null && params.gender != "NaN") {
			sql += " AND (uc.Gender = @gender"; //+connection.escape(params.gender); // 用户性别
			sqlparam.push({
				param: 'gender',
				value: params.gender
			});
			if(params.gender == 0) {
				sql += " OR uc.Gender is Null";
			}
			sql += ")";
		}
		if(params.usernation != undefined && params.usernation != null && params.usernation != "") {
			if(params.usernation != '0') {
				sql += " AND uc.UserNation = @usernation"; //+connection.escape(params.usernation); // 用户国家
				sqlparam.push({
					param: 'usernation',
					value: params.usernation
				});
			} else {
				sql += " AND uc.UserNation is null";
			}
		}
		if(params.age_op != undefined && params.age_op != null && params.age_op != "") {
			if(params.age_op == "0") {
				sql += " AND DATEDIFF( year, uw.Birthday, GetDate()) is null";
			} else if(params.age != undefined && params.age != null && params.age != NaN) {
				switch(params.age_op) {
					case "=":
						sql += " AND DATEDIFF( year, uw.Birthday, GetDate()) = @age"; //+connection.escape(params.age); // 用户年龄
						break;
					case ">":
						sql += " AND DATEDIFF( year, uw.Birthday, GetDate()) > @age"; //+connection.escape(params.age); // 用户年龄
						break;
					case "<":
						sql += " AND DATEDIFF( year, uw.Birthday, GetDate()) < @age"; //+connection.escape(params.age); // 用户年龄
						break;
				}
				sqlparam.push({
					param: 'age',
					value: params.age
				});
			}
		}

		sql += " ;";
		result = await basemodel.query(sql, sqlparam);
		if(result.success && result.data.length == 1) {
			result.data = result.data[0].Total;
		}
	} catch(e) {
		result.success = false;
		result.status = 0;
		result.data = null;
		result.message = e.message;
	}
	return result;
}