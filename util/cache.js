var redis = require('redis');
client = redis.createClient();

var crypto = require('crypto');


/**
 * Put the value in cache.
 * Uncomment the first line cache not to be used.
 */
exports.put = function(key,value,timeToKeep){
	return null;
	var oKey = key;
	//var key = crypto.createHash('md5').update(key).digest('hex');
	console.log('caching: '+key+' at '+currTime());
	value = JSON.stringify(value);
	//var old = cache[key];
	var old = client.hgetall(key);
	if(old){
		clearTimeout(old.timeout);
	}
	var expireTime = timeToKeep + currTime();
	var record = {value:value,expireTime : expireTime};

	var timeout = setTimeout(function() {
		exports.del(oKey);
	},timeToKeep);

	record.timeout = timeout;
	client.hmset(key,record);
}

exports.clear = function() {
	client.flushdb();
}

/**
 * Fetch the value from cache.
 */
/*exports.get = function(callback, key) {
	
	//return null;
	var oKey = key;
	//var key = crypto.createHash('md5').update(key).digest('hex');
	var recFlag = client.hgetall(key);
	if(recFlag) {	
		client.hgetall(key, function (err, rec) {
			if(rec != null) {
				if(typeof rec != "undefined"){
					if(rec.expireTime>=currTime()){
						console.log("Returned "+key+" from cache at "+ currTime());
						console.log(rec.value);
						callback(JSON.parse(rec.value));
					}
					else {
						exports.del(oKey);
						callback(null);
					}
				}
			} else {
				callback(null);
			}
		});
	} else {
		callback(null);
	}
}*/

/**
 * Comment above code and uncomment below code to run application without caching.
 */
exports.get = function(callback, key) {
	callback(null);
}

exports.del = function(key) {
	var key = crypto.createHash('md5').update(key).digest('hex');
	if (client.hgetall(key)){
		client.del(key);
		console.log("Deleted from cache "+key+" at "+currTime());
	}}


function currTime(){
	return (new Date).getTime();
}