const fs = require('fs');

exports.readfile = (path) => {
	return new Promise(function(resolve, reject) {

		fs.readFile(path, 'utf8', function(err, data) {
			if(!err) {
				resolve({
					succ: true,
					data: data,
					status: 1
				});
			} else {
				resolve({
					succ: false,
					data: "",
					status: 0
				});
			}
		});
	});

};