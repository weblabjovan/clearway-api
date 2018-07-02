
module.exports = (object, fieldsArr) => {
	let obj = {};
	fieldsArr.map( field => {
		obj[field] = object[field];
	});

	return obj;
}