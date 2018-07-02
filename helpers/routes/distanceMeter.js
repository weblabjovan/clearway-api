var rad = function(x) {
  return x * Math.PI / 180;
}

module.exports = (mapObj, lookObj) => {
	var R = 6378137; // Earth’s mean radius in meter
	var dLat = rad(lookObj.lat - mapObj.lat);
  	var dLong = rad(lookObj.lng - mapObj.lng);

  	var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(rad(mapObj.lat)) * Math.cos(rad(lookObj.lat)) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = R * c;
	return d; // returns the distance in meter
}
