const cache = {};

function validNumber(number) {
	return typeof number === "number" && isFinite(number) && number > 0;
}

function getCache(name, getFunc, expiryTime) {
	if (expiryTime == null) {
		expiryTime = module.exports.expiryTime;
	}

	if (expiryTime !== Infinity && !validNumber(expiryTime)) {
		throw new TypeError("expiryTime is not a valid number");
	}

	const currentTime = Date.now();
	const expires = expiryTime === Infinity ? Infinity : currentTime + expiryTime;

	if (typeof getFunc !== "function") {
		throw new TypeError("getFunc is not a function");
	}

	if (cache.hasOwnProperty(name)) {
		if (validNumber(cache[name].expires) && currentTime > cache[name].expires) {
			delete cache[name];
		} else {
			return cache[name].value;
		}
	}
	return (cache[name] = { value: getFunc(name), expires }).value;
}

module.exports = getCache;
module.exports.cache = cache;
module.exports.expiryTime = 864e5;
