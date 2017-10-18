var base = require("./base");

exports.getNations = async(svrtype) => {
	var result = {
		succ: false,
		status: 0,
		data: null,
		message: ""
	};
	try {
		var sql = "SELECT uc.UserNation"+
		" FROM UserRegion.UserInfoCore uc"+
		" WHERE uc.UserNation != ''"+
		" GROUP BY uc.UserNation"+
		" ORDER BY uc.UserNation ASC;";
		
		result = await base.model(svrtype).query(sql);
	} catch(e) {
		result.success = false;
		result.status = 0;
		result.data = null;
		result.message = e.message;
	}
	return result;
}