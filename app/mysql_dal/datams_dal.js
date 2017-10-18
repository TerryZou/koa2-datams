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
		sqlparam.push(params.begindate);
		sqlparam.push(params.enddate);
		sqlparam.push(params.begindate);
		sqlparam.push(params.enddate);
		var basemodel = base.model(svrtype);
		var sql = "";
		sql += "SELECT urd.UserID, urd.UserName,urd.UserRegion,DATE_FORMAT(urd.CreateTime,'%Y-%m-%d %T') CreateTime," +
			" urd.Gender, CASE WHEN urd.Gender = 1 THEN '男' WHEN urd.Gender = 2 THEN '女' ELSE '' END AS GenderText," +
			" IfNull(urd.UserNation,'') UserNation,IfNull(urd.City,'') City,urd.Birthday, IfNull(urd.Age,'') Age," +
			" urd.mDeviceId,IfNull(ud.DeviceName,'') DeviceName," +
			" urd.AppID,IfNull(upi.AppVersion,'') AppVersion,IfNull(upi.PhoneOS,'') PhoneOS,IfNull(upi.PhoneName,'') PhoneName" +
			" FROM (" +
			" SELECT" +
			" ua. UserID, ua.UserName, ua.UserRegion, ua.CreateTime," +
			" uc.Gender, uc.UserNation, uc.City,uw.Birthday," +
			" TIMESTAMPDIFF(YEAR, uw.Birthday, CURDATE()) Age," +
			" rd.mDeviceId,rd.AppID" +
			" FROM UserRegion.UserAccount ua" +
			" LEFT JOIN UserRegion.UserInfoCore uc" +
			" ON ua.UserID = uc.UserID" +
			" LEFT JOIN UserRegion.UserWeightInfo uw" +
			" ON ua.UserID = uw.UserID" +
			" INNER JOIN (" +
			" SELECT bg.UserId, bg.mDeviceId,bg.AppID" +
			" FROM BloodGlucoseInfo bg" +
			" WHERE bg.IsActive = 1" +
			" AND bg.PhoneCreateTime >= ?" + //+connection.escape(params.begindate) +
			" AND bg.PhoneCreateTime < ?" + //+connection.escape(params.enddate) + //活跃度时间
			" AND bg.CreateTime >= ?" + //+connection.escape(params.begindate) +
			" AND bg.CreateTime < ?" + //+connection.escape(params.enddate) + //活跃度时间
			" GROUP BY bg.UserId,bg.mDeviceId,bg.AppID" +
			" ) rd" +
			" ON ua.UserID = rd.UserId" +
			" WHERE ua.IsActive = 1";
		if(params.gender != undefined && params.gender != null && params.gender != "NaN") {
			sql += " AND (uc.Gender = ?"; //+connection.escape(params.gender); // 用户性别
			sqlparam.push(params.gender);
			if(params.gender == 0) {
				sql += " OR uc.Gender is Null";
			}
			sql += ")";
		}
		if(params.usernation != undefined && params.usernation != null && params.usernation != "") {
			if(params.usernation != '0') {
				sql += " AND uc.UserNation = ?"; //+connection.escape(params.usernation); // 用户国家
				sqlparam.push(params.usernation);
			} else {
				sql += " AND uc.UserNation is null";
			}
		}
		if(params.age_op != undefined && params.age_op != null && params.age_op != "") {
			if(params.age_op == "0") {
				sql += " AND TIMESTAMPDIFF(YEAR, uw.Birthday, CURDATE()) is null";
			} else if(params.age != undefined && params.age != null && params.age != NaN) {
				switch(params.age_op) {
					case "=":
						sql += " AND TIMESTAMPDIFF(YEAR, uw.Birthday, CURDATE()) = ?"; //+connection.escape(params.age); // 用户年龄
						break;
					case ">":
						sql += " AND TIMESTAMPDIFF(YEAR, uw.Birthday, CURDATE()) > ?"; //+connection.escape(params.age); // 用户年龄
						break;
					case "<":
						sql += " AND TIMESTAMPDIFF(YEAR, uw.Birthday, CURDATE()) < ?"; //+connection.escape(params.age); // 用户年龄
						break;
				}
				sqlparam.push(params.age);
			}
		}

		sql += " ) urd" +
			" LEFT JOIN ih_userdevice ud" +
			" ON urd.UserId = ud.UserId AND urd.mDeviceId = ud.mDeviceId AND ud.IsActive = 1 AND ud.Type = 1" +
			" LEFT JOIN UserPhoneInfo upi" +
			" ON urd.userid = upi.UserId AND urd.AppId =upi.AppId";
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
		if(params.ispage != undefined && params.ispage != null && params.ispage == true) {
			if(params.skip != undefined && params.skip != null && params.skip != NaN &&
				params.row != undefined && params.row != null && params.row != NaN) {
				sql += " LIMIT ?,?"; //+connection.escape(params.row); //分页
				sqlparam.push(params.skip);
				sqlparam.push(params.row);
			} else {
				sql += " LIMIT 0,20"; //分页
			}
		}
		sql += ";";
		console.log("********sql**********");
		console.log(sql);
		console.log("********sql**********");
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
		sqlparam.push(params.begindate);
		sqlparam.push(params.enddate);
		sqlparam.push(params.begindate);
		sqlparam.push(params.enddate);
		var basemodel = base.model(svrtype);
		var sql = "";
		sql += " SELECT" +
			" COUNT(ua.UserID) Total" +
			" FROM UserRegion.UserAccount ua" +
			" LEFT JOIN UserRegion.UserInfoCore uc" +
			" ON ua.UserID = uc.UserID" +
			" LEFT JOIN UserRegion.UserWeightInfo uw" +
			" ON ua.UserID = uw.UserID" +
			" INNER JOIN (" +
			" SELECT bg.UserId, bg.mDeviceId,bg.AppID" +
			" FROM BloodGlucoseInfo bg" +
			" WHERE bg.IsActive = 1" +
			" AND bg.PhoneCreateTime >= ?" + //+connection.escape(params.begindate) +
			" AND bg.PhoneCreateTime < ?" + //+connection.escape(params.enddate) + //活跃度时间
			" AND bg.CreateTime >= ?" + //+connection.escape(params.begindate) +
			" AND bg.CreateTime < ?" + //+connection.escape(params.enddate) + //活跃度时间
			" GROUP BY bg.UserId,bg.mDeviceId,bg.AppID" +
			" ) rd" +
			" ON ua.UserID = rd.UserId" +
			" WHERE ua.IsActive = 1";
		if(params.gender != undefined && params.gender != null && params.gender != "NaN") {
			sql += " AND (uc.Gender = ?"; //+connection.escape(params.gender); // 用户性别
			sqlparam.push(params.gender);
			if(params.gender == 0) {
				sql += " OR uc.Gender is Null";
			}
			sql += ")";
		}
		if(params.usernation != undefined && params.usernation != null && params.usernation != "") {
			if(params.usernation != '0') {
				sql += " AND uc.UserNation = ?"; //+connection.escape(params.usernation); // 用户国家
				sqlparam.push(params.usernation);
			} else {
				sql += " AND uc.UserNation is null";
			}
		}
		if(params.age_op != undefined && params.age_op != null && params.age_op != "") {
			if(params.age_op == "0") {
				sql += " AND TIMESTAMPDIFF(YEAR, uw.Birthday, CURDATE()) is null";
			} else if(params.age != undefined && params.age != null && params.age != NaN) {
				switch(params.age_op) {
					case "=":
						sql += " AND TIMESTAMPDIFF(YEAR, uw.Birthday, CURDATE()) = ?"; //+connection.escape(params.age); // 用户年龄
						break;
					case ">":
						sql += " AND TIMESTAMPDIFF(YEAR, uw.Birthday, CURDATE()) > ?"; //+connection.escape(params.age); // 用户年龄
						break;
					case "<":
						sql += " AND TIMESTAMPDIFF(YEAR, uw.Birthday, CURDATE()) < ?"; //+connection.escape(params.age); // 用户年龄
						break;
				}
				sqlparam.push(params.age);
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
		sqlparam.push(params.begindate);
		sqlparam.push(params.enddate);
		sqlparam.push(params.begindate);
		sqlparam.push(params.enddate);
		var basemodel = base.model(svrtype);
		var sql = "";
		sql += "SELECT urd.UserID, urd.UserName,urd.UserRegion,DATE_FORMAT(urd.CreateTime,'%Y-%m-%d %T') CreateTime," +
			" urd.Gender, CASE WHEN urd.Gender = 1 THEN '男' WHEN urd.Gender = 2 THEN '女' ELSE '' END AS GenderText," +
			" IfNull(urd.UserNation,'') UserNation,IfNull(urd.City,'') City,urd.Birthday, IfNull(urd.Age,'') Age," +
			" urd.mDeviceId,IfNull(ud.DeviceName,'') DeviceName," +
			" urd.AppID,IfNull(upi.AppVersion,'') AppVersion,IfNull(upi.PhoneOS,'') PhoneOS,IfNull(upi.PhoneName,'') PhoneName" +
			" FROM (" +
			" SELECT" +
			" ua. UserID, ua.UserName, ua.UserRegion, ua.CreateTime," +
			" uc.Gender, uc.UserNation, uc.City,uw.Birthday," +
			" TIMESTAMPDIFF(YEAR, uw.Birthday, CURDATE()) Age," +
			" rd.mDeviceId,rd.AppID" +
			" FROM UserRegion.UserAccount ua" +
			" LEFT JOIN UserRegion.UserInfoCore uc" +
			" ON ua.UserID = uc.UserID" +
			" LEFT JOIN UserRegion.UserWeightInfo uw" +
			" ON ua.UserID = uw.UserID" +
			" INNER JOIN (" +
			" SELECT bp.UserId, bp.mDeviceId,bp.AppID" +
			" FROM BloodPressureInfo bp" +
			" WHERE bp.IsActive = 1" +
			" AND bp.PhoneCreateTime >= ?" + //+connection.escape(params.begindate) +
			" AND bp.PhoneCreateTime < ?" + //+connection.escape(params.enddate) + //活跃度时间
			" AND bp.CreateTime >= ?" + //+connection.escape(params.begindate) +
			" AND bp.CreateTime < ?" + //+connection.escape(params.enddate) + //活跃度时间
			" GROUP BY bp.UserId,bp.mDeviceId,bp.AppID" +
			" ) rd" +
			" ON ua.UserID = rd.UserId" +
			" WHERE ua.IsActive = 1";
		if(params.gender != undefined && params.gender != null && params.gender != "NaN") {
			sql += " AND (uc.Gender = ?"; //+connection.escape(params.gender); // 用户性别
			sqlparam.push(params.gender);
			if(params.gender == 0) {
				sql += " OR uc.Gender is Null";
			}
			sql += ")";
		}
		if(params.usernation != undefined && params.usernation != null && params.usernation != "") {
			if(params.usernation != '0') {
				sql += " AND uc.UserNation = ?"; //+connection.escape(params.usernation); // 用户国家
				sqlparam.push(params.usernation);
			} else {
				sql += " AND uc.UserNation is null";
			}
		}
		if(params.age_op != undefined && params.age_op != null && params.age_op != "") {
			if(params.age_op == "0") {
				sql += " AND TIMESTAMPDIFF(YEAR, uw.Birthday, CURDATE()) is null";
			} else if(params.age != undefined && params.age != null && params.age != NaN) {
				switch(params.age_op) {
					case "=":
						sql += " AND TIMESTAMPDIFF(YEAR, uw.Birthday, CURDATE()) = ?"; //+connection.escape(params.age); // 用户年龄
						break;
					case ">":
						sql += " AND TIMESTAMPDIFF(YEAR, uw.Birthday, CURDATE()) > ?"; //+connection.escape(params.age); // 用户年龄
						break;
					case "<":
						sql += " AND TIMESTAMPDIFF(YEAR, uw.Birthday, CURDATE()) < ?"; //+connection.escape(params.age); // 用户年龄
						break;
				}
				sqlparam.push(params.age);
			}
		}
		sql += " ) urd" +
			" LEFT JOIN ih_userdevice ud" +
			" ON urd.UserId = ud.UserId AND urd.mDeviceId = ud.mDeviceId AND ud.IsActive = 1 AND ud.Type = 1" +
			" LEFT JOIN UserPhoneInfo upi" +
			" ON urd.userid = upi.UserId AND urd.AppId =upi.AppId";
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
		if(params.ispage != undefined && params.ispage != null && params.ispage == true) {
			if(params.skip != undefined && params.skip != null && params.skip != NaN &&
				params.row != undefined && params.row != null && params.row != NaN) {
				sql += " LIMIT ?,?"; //+connection.escape(params.row); //分页
				sqlparam.push(params.skip);
				sqlparam.push(params.row);
			} else {
				sql += " LIMIT 0,20"; //分页
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
		sqlparam.push(params.begindate);
		sqlparam.push(params.enddate);
		sqlparam.push(params.begindate);
		sqlparam.push(params.enddate);
		var basemodel = base.model(svrtype);
		var sql = "";
		sql += " SELECT" +
			" COUNT(ua.UserID) Total" +
			" FROM UserRegion.UserAccount ua" +
			" LEFT JOIN UserRegion.UserInfoCore uc" +
			" ON ua.UserID = uc.UserID" +
			" LEFT JOIN UserRegion.UserWeightInfo uw" +
			" ON ua.UserID = uw.UserID" +
			" INNER JOIN (" +
			" SELECT bp.UserId, bp.mDeviceId,bp.AppID" +
			" FROM BloodPressureInfo bp" +
			" WHERE bp.IsActive = 1" +
			" AND bp.PhoneCreateTime >= ?" + //+connection.escape(params.begindate) +
			" AND bp.PhoneCreateTime < ?" + //+connection.escape(params.enddate) + //活跃度时间
			" AND bp.CreateTime >= ?" + //+connection.escape(params.begindate) +
			" AND bp.CreateTime < ?" + //+connection.escape(params.enddate) + //活跃度时间
			" GROUP BY bp.UserId,bp.mDeviceId,bp.AppID" +
			" ) rd" +
			" ON ua.UserID = rd.UserId" +
			" WHERE ua.IsActive = 1";
		if(params.gender != undefined && params.gender != null && params.gender != "NaN") {
			sql += " AND (uc.Gender = ?"; //+connection.escape(params.gender); // 用户性别
			sqlparam.push(params.gender);
			if(params.gender == 0) {
				sql += " OR uc.Gender is Null";
			}
			sql += ")";
		}
		if(params.usernation != undefined && params.usernation != null && params.usernation != "") {
			if(params.usernation != '0') {
				sql += " AND uc.UserNation = ?"; //+connection.escape(params.usernation); // 用户国家
				sqlparam.push(params.usernation);
			} else {
				sql += " AND uc.UserNation is null";
			}
		}
		if(params.age_op != undefined && params.age_op != null && params.age_op != "") {
			if(params.age_op == "0") {
				sql += " AND TIMESTAMPDIFF(YEAR, uw.Birthday, CURDATE()) is null";
			} else if(params.age != undefined && params.age != null && params.age != NaN) {
				switch(params.age_op) {
					case "=":
						sql += " AND TIMESTAMPDIFF(YEAR, uw.Birthday, CURDATE()) = ?"; //+connection.escape(params.age); // 用户年龄
						break;
					case ">":
						sql += " AND TIMESTAMPDIFF(YEAR, uw.Birthday, CURDATE()) > ?"; //+connection.escape(params.age); // 用户年龄
						break;
					case "<":
						sql += " AND TIMESTAMPDIFF(YEAR, uw.Birthday, CURDATE()) < ?"; //+connection.escape(params.age); // 用户年龄
						break;
				}
				sqlparam.push(params.age);
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
		sqlparam.push(params.begindate);
		sqlparam.push(params.enddate);
		sqlparam.push(params.begindate);
		sqlparam.push(params.enddate);
		var basemodel = base.model(svrtype);
		var sql = "";
		sql += "SELECT urd.UserID, urd.UserName,urd.UserRegion,DATE_FORMAT(urd.CreateTime,'%Y-%m-%d %T') CreateTime," +
			" urd.Gender, CASE WHEN urd.Gender = 1 THEN '男' WHEN urd.Gender = 2 THEN '女' ELSE '' END AS GenderText," +
			" IfNull(urd.UserNation,'') UserNation,IfNull(urd.City,'') City,urd.Birthday, IfNull(urd.Age,'') Age," +
			" urd.mDeviceId,IfNull(ud.DeviceName,'') DeviceName," +
			" urd.AppID,IfNull(upi.AppVersion,'') AppVersion,IfNull(upi.PhoneOS,'') PhoneOS,IfNull(upi.PhoneName,'') PhoneName" +
			" FROM (" +
			" SELECT" +
			" ua. UserID, ua.UserName, ua.UserRegion, ua.CreateTime," +
			" uc.Gender, uc.UserNation, uc.City,uw.Birthday," +
			" TIMESTAMPDIFF(YEAR, uw.Birthday, CURDATE()) Age," +
			" rd.mDeviceId,rd.AppID" +
			" FROM UserRegion.UserAccount ua" +
			" LEFT JOIN UserRegion.UserInfoCore uc" +
			" ON ua.UserID = uc.UserID" +
			" LEFT JOIN UserRegion.UserWeightInfo uw" +
			" ON ua.UserID = uw.UserID" +
			" INNER JOIN (" +
			" SELECT bo.UserId, bo.mDeviceId,bo.AppID" +
			" FROM ih_BloodOxygen bo" +
			" WHERE bo.IsActive = 1" +
			" AND bo.PhoneCreateTime >= ?" + //+connection.escape(params.begindate) +
			" AND bo.PhoneCreateTime < ?" + //+connection.escape(params.enddate) + //活跃度时间
			" AND bo.CreateTime >= ?" + //+connection.escape(params.begindate) +
			" AND bo.CreateTime < ?" + //+connection.escape(params.enddate) + //活跃度时间
			" GROUP BY bo.UserId,bo.mDeviceId,bo.AppID" +
			" ) rd" +
			" ON ua.UserID = rd.UserId" +
			" WHERE ua.IsActive = 1";
		if(params.gender != undefined && params.gender != null && params.gender != "NaN") {
			sql += " AND (uc.Gender = ?"; //+connection.escape(params.gender); // 用户性别
			sqlparam.push(params.gender);
			if(params.gender == 0) {
				sql += " OR uc.Gender is Null";
			}
			sql += ")";
		}
		if(params.usernation != undefined && params.usernation != null && params.usernation != "") {
			if(params.usernation != '0') {
				sql += " AND uc.UserNation = ?"; //+connection.escape(params.usernation); // 用户国家
				sqlparam.push(params.usernation);
			} else {
				sql += " AND uc.UserNation is null";
			}
		}
		if(params.age_op != undefined && params.age_op != null && params.age_op != "") {
			if(params.age_op == "0") {
				sql += " AND TIMESTAMPDIFF(YEAR, uw.Birthday, CURDATE()) is null";
			} else if(params.age != undefined && params.age != null && params.age != NaN) {
				switch(params.age_op) {
					case "=":
						sql += " AND TIMESTAMPDIFF(YEAR, uw.Birthday, CURDATE()) = ?"; //+connection.escape(params.age); // 用户年龄
						break;
					case ">":
						sql += " AND TIMESTAMPDIFF(YEAR, uw.Birthday, CURDATE()) > ?"; //+connection.escape(params.age); // 用户年龄
						break;
					case "<":
						sql += " AND TIMESTAMPDIFF(YEAR, uw.Birthday, CURDATE()) < ?"; //+connection.escape(params.age); // 用户年龄
						break;
				}
				sqlparam.push(params.age);
			}
		}
		sql += " ) urd" +
			" LEFT JOIN ih_userdevice ud" +
			" ON urd.UserId = ud.UserId AND urd.mDeviceId = ud.mDeviceId AND ud.IsActive = 1 AND ud.Type = 1" +
			" LEFT JOIN UserPhoneInfo upi" +
			" ON urd.userid = upi.UserId AND urd.AppId =upi.AppId";
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
		if(params.ispage != undefined && params.ispage != null && params.ispage == true) {
			if(params.skip != undefined && params.skip != null && params.skip != NaN &&
				params.row != undefined && params.row != null && params.row != NaN) {
				sql += " LIMIT ?,?"; //+connection.escape(params.row); //分页
				sqlparam.push(params.skip);
				sqlparam.push(params.row);
			} else {
				sql += " LIMIT 0,20"; //分页
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
		sqlparam.push(params.begindate);
		sqlparam.push(params.enddate);
		sqlparam.push(params.begindate);
		sqlparam.push(params.enddate);
		var basemodel = base.model(svrtype);
		var sql = "";
		sql += " SELECT" +
			" COUNT(ua.UserID) Total" +
			" FROM UserRegion.UserAccount ua" +
			" LEFT JOIN UserRegion.UserInfoCore uc" +
			" ON ua.UserID = uc.UserID" +
			" LEFT JOIN UserRegion.UserWeightInfo uw" +
			" ON ua.UserID = uw.UserID" +
			" INNER JOIN (" +
			" SELECT bo.UserId, bo.mDeviceId,bo.AppID" +
			" FROM ih_BloodOxygen bo" +
			" WHERE bo.IsActive = 1" +
			" AND bo.PhoneCreateTime >= ?" + //+connection.escape(params.begindate) +
			" AND bo.PhoneCreateTime < ?" + //+connection.escape(params.enddate) + //活跃度时间
			" AND bo.CreateTime >= ?" + //+connection.escape(params.begindate) +
			" AND bo.CreateTime < ?" + //+connection.escape(params.enddate) + //活跃度时间
			" GROUP BY bo.UserId,bo.mDeviceId,bo.AppID" +
			" ) rd" +
			" ON ua.UserID = rd.UserId" +
			" WHERE ua.IsActive = 1";
		if(params.gender != undefined && params.gender != null && params.gender != "NaN") {
			sql += " AND (uc.Gender = ?"; //+connection.escape(params.gender); // 用户性别
			sqlparam.push(params.gender);
			if(params.gender == 0) {
				sql += " OR uc.Gender is Null";
			}
			sql += ")";
		}
		if(params.usernation != undefined && params.usernation != null && params.usernation != "") {
			if(params.usernation != '0') {
				sql += " AND uc.UserNation = ?"; //+connection.escape(params.usernation); // 用户国家
				sqlparam.push(params.usernation);
			} else {
				sql += " AND uc.UserNation is null";
			}
		}
		if(params.age_op != undefined && params.age_op != null && params.age_op != "") {
			if(params.age_op == "0") {
				sql += " AND TIMESTAMPDIFF(YEAR, uw.Birthday, CURDATE()) is null";
			} else if(params.age != undefined && params.age != null && params.age != NaN) {
				switch(params.age_op) {
					case "=":
						sql += " AND TIMESTAMPDIFF(YEAR, uw.Birthday, CURDATE()) = ?"; //+connection.escape(params.age); // 用户年龄
						break;
					case ">":
						sql += " AND TIMESTAMPDIFF(YEAR, uw.Birthday, CURDATE()) > ?"; //+connection.escape(params.age); // 用户年龄
						break;
					case "<":
						sql += " AND TIMESTAMPDIFF(YEAR, uw.Birthday, CURDATE()) < ?"; //+connection.escape(params.age); // 用户年龄
						break;
				}
				sqlparam.push(params.age);
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
		sqlparam.push(params.begindate);
		sqlparam.push(params.enddate);
		sqlparam.push(params.begindate);
		sqlparam.push(params.enddate);
		var basemodel = base.model(svrtype);
		var sql = "";
		sql += "SELECT urd.UserID, urd.UserName,urd.UserRegion,DATE_FORMAT(urd.CreateTime,'%Y-%m-%d %T') CreateTime," +
			" urd.Gender, CASE WHEN urd.Gender = 1 THEN '男' WHEN urd.Gender = 2 THEN '女' ELSE '' END AS GenderText," +
			" IfNull(urd.UserNation,'') UserNation,IfNull(urd.City,'') City,urd.Birthday, IfNull(urd.Age,'') Age," +
			" urd.mDeviceId,IfNull(ud.DeviceName,'') DeviceName," +
			" urd.AppID,IfNull(upi.AppVersion,'') AppVersion,IfNull(upi.PhoneOS,'') PhoneOS,IfNull(upi.PhoneName,'') PhoneName" +
			" FROM (" +
			" SELECT" +
			" ua. UserID, ua.UserName, ua.UserRegion, ua.CreateTime," +
			" uc.Gender, uc.UserNation, uc.City,uw.Birthday," +
			" TIMESTAMPDIFF(YEAR, uw.Birthday, CURDATE()) Age," +
			" rd.mDeviceId,rd.AppID" +
			" FROM UserRegion.UserAccount ua" +
			" LEFT JOIN UserRegion.UserInfoCore uc" +
			" ON ua.UserID = uc.UserID" +
			" LEFT JOIN UserRegion.UserWeightInfo uw" +
			" ON ua.UserID = uw.UserID" +
			" INNER JOIN (" +
			" SELECT wm.UserId, wm.mDeviceId,wm.AppID" +
			" FROM WeightMeasurementInfo wm" +
			" WHERE wm.IsActive = 1" +
			" AND wm.PhoneCreateTime >= ?" + //+connection.escape(params.begindate) +
			" AND wm.PhoneCreateTime < ?" + //+connection.escape(params.enddate) + //活跃度时间
			" AND wm.CreateTime >= ?" + //+connection.escape(params.begindate) +
			" AND wm.CreateTime < ?" + //+connection.escape(params.enddate) + //活跃度时间
			" GROUP BY wm.UserId,wm.mDeviceId,wm.AppID" +
			" ) rd" +
			" ON ua.UserID = rd.UserId" +
			" WHERE ua.IsActive = 1";
		if(params.gender != undefined && params.gender != null && params.gender != "NaN") {
			sql += " AND (uc.Gender = ?"; //+connection.escape(params.gender); // 用户性别
			sqlparam.push(params.gender);
			if(params.gender == 0) {
				sql += " OR uc.Gender is Null";
			}
			sql += ")";
		}
		if(params.usernation != undefined && params.usernation != null && params.usernation != "") {
			if(params.usernation != '0') {
				sql += " AND uc.UserNation = ?"; //+connection.escape(params.usernation); // 用户国家
				sqlparam.push(params.usernation);
			} else {
				sql += " AND uc.UserNation is null";
			}
		}
		if(params.age_op != undefined && params.age_op != null && params.age_op != "") {
			if(params.age_op == "0") {
				sql += " AND TIMESTAMPDIFF(YEAR, uw.Birthday, CURDATE()) is null";
			} else if(params.age != undefined && params.age != null && params.age != NaN) {
				switch(params.age_op) {
					case "=":
						sql += " AND TIMESTAMPDIFF(YEAR, uw.Birthday, CURDATE()) = ?"; //+connection.escape(params.age); // 用户年龄
						break;
					case ">":
						sql += " AND TIMESTAMPDIFF(YEAR, uw.Birthday, CURDATE()) > ?"; //+connection.escape(params.age); // 用户年龄
						break;
					case "<":
						sql += " AND TIMESTAMPDIFF(YEAR, uw.Birthday, CURDATE()) < ?"; //+connection.escape(params.age); // 用户年龄
						break;
				}
				sqlparam.push(params.age);
			}
		}
		sql += " ) urd" +
			" LEFT JOIN ih_userdevice ud" +
			" ON urd.UserId = ud.UserId AND urd.mDeviceId = ud.mDeviceId AND ud.IsActive = 1 AND ud.Type = 1" +
			" LEFT JOIN UserPhoneInfo upi" +
			" ON urd.userid = upi.UserId AND urd.AppId =upi.AppId";
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
		if(params.ispage != undefined && params.ispage != null && params.ispage == true) {
			if(params.skip != undefined && params.skip != null && params.skip != NaN &&
				params.row != undefined && params.row != null && params.row != NaN) {
				sql += " LIMIT ?,?"; //+connection.escape(params.row); //分页
				sqlparam.push(params.skip);
				sqlparam.push(params.row);
			} else {
				sql += " LIMIT 0,20"; //分页
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
		sqlparam.push(params.begindate);
		sqlparam.push(params.enddate);
		sqlparam.push(params.begindate);
		sqlparam.push(params.enddate);
		var basemodel = base.model(svrtype);
		var sql = "";
		sql += " SELECT" +
			" COUNT(ua.UserID) Total" +
			" FROM UserRegion.UserAccount ua" +
			" LEFT JOIN UserRegion.UserInfoCore uc" +
			" ON ua.UserID = uc.UserID" +
			" LEFT JOIN UserRegion.UserWeightInfo uw" +
			" ON ua.UserID = uw.UserID" +
			" INNER JOIN (" +
			" SELECT wm.UserId, wm.mDeviceId,wm.AppID" +
			" FROM WeightMeasurementInfo wm" +
			" WHERE wm.IsActive = 1" +
			" AND wm.PhoneCreateTime >= ?" + //+connection.escape(params.begindate) +
			" AND wm.PhoneCreateTime < ?" + //+connection.escape(params.enddate) + //活跃度时间
			" AND wm.CreateTime >= ?" + //+connection.escape(params.begindate) +
			" AND wm.CreateTime < ?" + //+connection.escape(params.enddate) + //活跃度时间
			" GROUP BY wm.UserId,wm.mDeviceId,wm.AppID" +
			" ) rd" +
			" ON ua.UserID = rd.UserId" +
			" WHERE ua.IsActive = 1";
		if(params.gender != undefined && params.gender != null && params.gender != "NaN") {
			sql += " AND (uc.Gender = ?"; //+connection.escape(params.gender); // 用户性别
			sqlparam.push(params.gender);
			if(params.gender == 0) {
				sql += " OR uc.Gender is Null";
			}
			sql += ")";
		}
		if(params.usernation != undefined && params.usernation != null && params.usernation != "") {
			if(params.usernation != '0') {
				sql += " AND uc.UserNation = ?"; //+connection.escape(params.usernation); // 用户国家
				sqlparam.push(params.usernation);
			} else {
				sql += " AND uc.UserNation is null";
			}
		}
		if(params.age_op != undefined && params.age_op != null && params.age_op != "") {
			if(params.age_op == "0") {
				sql += " AND TIMESTAMPDIFF(YEAR, uw.Birthday, CURDATE()) is null";
			} else if(params.age != undefined && params.age != null && params.age != NaN) {
				switch(params.age_op) {
					case "=":
						sql += " AND TIMESTAMPDIFF(YEAR, uw.Birthday, CURDATE()) = ?"; //+connection.escape(params.age); // 用户年龄
						break;
					case ">":
						sql += " AND TIMESTAMPDIFF(YEAR, uw.Birthday, CURDATE()) > ?"; //+connection.escape(params.age); // 用户年龄
						break;
					case "<":
						sql += " AND TIMESTAMPDIFF(YEAR, uw.Birthday, CURDATE()) < ?"; //+connection.escape(params.age); // 用户年龄
						break;
				}
				sqlparam.push(params.age);
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
		sqlparam.push(params.begindate);
		sqlparam.push(params.enddate);
		sqlparam.push(params.begindate);
		sqlparam.push(params.enddate);
		var basemodel = base.model(svrtype);
		var sql = "";
		sql += "SELECT urd.UserID, urd.UserName,urd.UserRegion,DATE_FORMAT(urd.CreateTime,'%Y-%m-%d %T') CreateTime," +
			" urd.Gender, CASE WHEN urd.Gender = 1 THEN '男' WHEN urd.Gender = 2 THEN '女' ELSE '' END AS GenderText," +
			" IfNull(urd.UserNation,'') UserNation,IfNull(urd.City,'') City,urd.Birthday, IfNull(urd.Age,'') Age," +
			" urd.mDeviceId,IfNull(ud.DeviceName,'') DeviceName," +
			" urd.AppID,IfNull(upi.AppVersion,'') AppVersion,IfNull(upi.PhoneOS,'') PhoneOS,IfNull(upi.PhoneName,'') PhoneName" +
			" FROM (" +
			" SELECT" +
			" ua. UserID, ua.UserName, ua.UserRegion, ua.CreateTime," +
			" uc.Gender, uc.UserNation, uc.City,uw.Birthday," +
			" TIMESTAMPDIFF(YEAR, uw.Birthday, CURDATE()) Age," +
			" rd.mDeviceId,rd.AppID" +
			" FROM UserRegion.UserAccount ua" +
			" LEFT JOIN UserRegion.UserInfoCore uc" +
			" ON ua.UserID = uc.UserID" +
			" LEFT JOIN UserRegion.UserWeightInfo uw" +
			" ON ua.UserID = uw.UserID" +
			" INNER JOIN (" +
			" SELECT am.UserId, am.mDeviceId,am.AppID" +
			" FROM ih_AMActiveReport am" +
			" WHERE am.IsActive = 1" +
			" AND am.PhoneCreateTime >= ?" +
			" AND am.PhoneCreateTime < ? " +
			" AND am.CreateTime >= ?" +
			" AND am.CreateTime < ? " +
			" GROUP BY am.UserId,am.mDeviceId,am.AppID" +
			//			" UNION"+
			//			" SELECT ams.UserId, ams.mDeviceId,ams.AppID"+
			//			" FROM ih_AMSleepSection ams"+
			//			" WHERE ams.IsActive = 1"+
			//			" AND ams.PhoneCreateTime >= ? "+
			//			" AND ams.PhoneCreateTime < ? "+
			//			" UNION"+
			//			" SELECT s.UserId, s.mDeviceId,s.AppID"+
			//			" FROM ih_SwimReport s"+
			//			" WHERE s.IsActive = 1"+
			//			" AND s.PhoneCreateTime >= ? "+
			//			" AND s.PhoneCreateTime < ? "+
			" ) rd" +
			" ON ua.UserID = rd.UserId" +
			" WHERE ua.IsActive = 1";
		if(params.gender != undefined && params.gender != null && params.gender != "NaN") {
			sql += " AND (uc.Gender = ?"; //+connection.escape(params.gender); // 用户性别
			sqlparam.push(params.gender);
			if(params.gender == 0) {
				sql += " OR uc.Gender is Null";
			}
			sql += ")";
		}
		if(params.usernation != undefined && params.usernation != null && params.usernation != "") {
			if(params.usernation != '0') {
				sql += " AND uc.UserNation = ?"; //+connection.escape(params.usernation); // 用户国家
				sqlparam.push(params.usernation);
			} else {
				sql += " AND uc.UserNation is null";
			}
		}
		if(params.age_op != undefined && params.age_op != null && params.age_op != "") {
			if(params.age_op == "0") {
				sql += " AND TIMESTAMPDIFF(YEAR, uw.Birthday, CURDATE()) is null";
			} else if(params.age != undefined && params.age != null && params.age != NaN) {
				switch(params.age_op) {
					case "=":
						sql += " AND TIMESTAMPDIFF(YEAR, uw.Birthday, CURDATE()) = ?"; //+connection.escape(params.age); // 用户年龄
						break;
					case ">":
						sql += " AND TIMESTAMPDIFF(YEAR, uw.Birthday, CURDATE()) > ?"; //+connection.escape(params.age); // 用户年龄
						break;
					case "<":
						sql += " AND TIMESTAMPDIFF(YEAR, uw.Birthday, CURDATE()) < ?"; //+connection.escape(params.age); // 用户年龄
						break;
				}
				sqlparam.push(params.age);
			}
		}
		sql += " ) urd" +
			" LEFT JOIN ih_userdevice ud" +
			" ON urd.UserId = ud.UserId AND urd.mDeviceId = ud.mDeviceId AND ud.IsActive = 1 AND ud.Type = 1" +
			" LEFT JOIN UserPhoneInfo upi" +
			" ON urd.userid = upi.UserId AND urd.AppId =upi.AppId";
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
		if(params.ispage != undefined && params.ispage != null && params.ispage == true) {
			if(params.skip != undefined && params.skip != null && params.skip != NaN &&
				params.row != undefined && params.row != null && params.row != NaN) {
				sql += " LIMIT ?,?"; //+connection.escape(params.row); //分页
				sqlparam.push(params.skip);
				sqlparam.push(params.row);
			} else {
				sql += " LIMIT 0,20"; //分页
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
		sqlparam.push(params.begindate);
		sqlparam.push(params.enddate);
		sqlparam.push(params.begindate);
		sqlparam.push(params.enddate);
		var basemodel = base.model(svrtype);
		var sql = "";
		sql += " SELECT" +
			" COUNT(ua.UserID) Total" +
			" FROM UserRegion.UserAccount ua" +
			" LEFT JOIN UserRegion.UserInfoCore uc" +
			" ON ua.UserID = uc.UserID" +
			" LEFT JOIN UserRegion.UserWeightInfo uw" +
			" ON ua.UserID = uw.UserID" +
			" INNER JOIN (" +
			" SELECT am.UserId, am.mDeviceId,am.AppID" +
			" FROM ih_AMActiveReport am" +
			" WHERE am.IsActive = 1" +
			" AND am.PhoneCreateTime >= ?" +
			" AND am.PhoneCreateTime < ? " +
			" AND am.CreateTime >= ?" +
			" AND am.CreateTime < ? " +
			" GROUP BY am.UserId,am.mDeviceId,am.AppID" +
			//			" UNION"+
			//			" SELECT ams.UserId, ams.mDeviceId,ams.AppID"+
			//			" FROM ih_AMSleepSection ams"+
			//			" WHERE ams.IsActive = 1"+
			//			" AND ams.PhoneCreateTime >= ? "+
			//			" AND ams.PhoneCreateTime < ? "+
			//			" UNION"+
			//			" SELECT s.UserId, s.mDeviceId,s.AppID"+
			//			" FROM ih_SwimReport s"+
			//			" WHERE s.IsActive = 1"+
			//			" AND s.PhoneCreateTime >= ? "+
			//			" AND s.PhoneCreateTime < ? "+
			" ) rd" +
			" ON ua.UserID = rd.UserId" +
			" WHERE ua.IsActive = 1";
		if(params.gender != undefined && params.gender != null && params.gender != "NaN") {
			sql += " AND (uc.Gender = ?"; //+connection.escape(params.gender); // 用户性别
			sqlparam.push(params.gender);
			if(params.gender == 0) {
				sql += " OR uc.Gender is Null";
			}
			sql += ")";
		}
		if(params.usernation != undefined && params.usernation != null && params.usernation != "") {
			if(params.usernation != '0') {
				sql += " AND uc.UserNation = ?"; //+connection.escape(params.usernation); // 用户国家
				sqlparam.push(params.usernation);
			} else {
				sql += " AND uc.UserNation is null";
			}
		}
		if(params.age_op != undefined && params.age_op != null && params.age_op != "") {
			if(params.age_op == "0") {
				sql += " AND TIMESTAMPDIFF(YEAR, uw.Birthday, CURDATE()) is null";
			} else if(params.age != undefined && params.age != null && params.age != NaN) {
				switch(params.age_op) {
					case "=":
						sql += " AND TIMESTAMPDIFF(YEAR, uw.Birthday, CURDATE()) = ?"; //+connection.escape(params.age); // 用户年龄
						break;
					case ">":
						sql += " AND TIMESTAMPDIFF(YEAR, uw.Birthday, CURDATE()) > ?"; //+connection.escape(params.age); // 用户年龄
						break;
					case "<":
						sql += " AND TIMESTAMPDIFF(YEAR, uw.Birthday, CURDATE()) < ?"; //+connection.escape(params.age); // 用户年龄
						break;
				}
				sqlparam.push(params.age);
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