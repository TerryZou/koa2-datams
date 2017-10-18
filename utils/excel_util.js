const xlsx = require("xlsx");

//const workbook = xlsx.readFile("excel.xlsx", opts);

exports.generateExcel = (path, headers, data) => {
	var result = false;
	try {

		var sheetNames = new Array();
		var sheets = {};
		for(var hi = 0; hi < headers.length; hi++) {
			var h = headers[hi].headers.map((v, i) => Object.assign({}, {
				v: v.h,
				position: String.fromCharCode(65 + i) + 1
			})).reduce((prev, next) => Object.assign({}, prev, {
				[next.position]: {
					v: next.v
				}
			}), {});
			var d = data[hi].map((v, i) => headers[hi].headers.map((k, j) => Object.assign({}, {
				v: v[k.f],
				position: String.fromCharCode(65 + j) + (i + 2)
			}))).reduce((prev, next) => prev.concat(next)).reduce((prev, next) => Object.assign({}, prev, {
				[next.position]: {
					v: next.v
				}
			}), {});

			// 合并 headers 和 data
			var output = Object.assign({}, h, d);
			// 获取所有单元格的位置
			var outputPos = Object.keys(output);
			// 计算出范围
			var ref = outputPos[0] + ':' + outputPos[outputPos.length - 1];
			sheetNames.push(headers[hi].name);
			sheets[headers[hi].name] = Object.assign({}, output, {
				'!ref': ref
			});
		}
		// 构建 workbook 对象
		var wb = {
			SheetNames: sheetNames,
			Sheets: sheets
		};

		// 导出 Excel
		xlsx.writeFile(wb, process.cwd() + path);
		result = true;
	} catch(e) {}
	return result;

};

exports.readExcel =async (path) => {
	var workbook = xlsx.readFile(path);
	var sheetNames = workbook.SheetNames;
	var datas = new Array();
	for(var i = 0; i < sheetNames.length; i++) {
		var headers = {};
		var data = new Array();
		var worksheet = workbook.Sheets[sheetNames[i]];
		var keys = Object.keys(worksheet);
		keys.filter(k => k[0] !== '!')  // 过滤以 ! 开头的 key
			.forEach(k => {  // 遍历所有单元格
				
				// 如 A11 中的 A
				let col = k.substring(0, 1);
				// 如 A11 中的 11
				let row = parseInt(k.substring(1));
				// 当前单元格的值
				let value = worksheet[k].v;
				// 保存字段名
				if(row === 1) {
					headers[col] = value;
					return;
				}
				// 解析成 JSON
				if(!data[row]) {
					data[row] = {};
				}
				data[row][headers[col]] = value;
			});
			datas.push({sheet:sheetNames[i],headers:headers,data:data});
	}
	return datas;
}