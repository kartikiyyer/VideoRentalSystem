/**
 * New node file for database connection
 */
//var enableConnectionPool = false;
var enableConnectionPool = true;

function createdbConnection() {
	if(enableConnectionPool) {
		return getdbConnection();
	} else {
		var mysql = require('mysql');
	
		var connection = mysql.createConnection({
			host     : 'localhost',
			user     : 'root',
			password : '',
			port: '3306',
			database: 'video_rental'
		});
		
		connection.connect(function(error) {
			if(!error) {
				console.log("Connected!!!");
			} else{
				console.log(error);
			}
		});
		return connection;
	}
}

exports.createdbConnection = createdbConnection;

function closedbConnection(connection) {
	if(enableConnectionPool) {
		releasedbConnection(connection);
	} else {
		connection.end();
	}
}

exports.closedbConnection = closedbConnection;

var queue = [];


function getdbConnection() {
	console.log("Acquiring connection");
	return queue.shift();
}

exports.getdbConnection = getdbConnection;

function releasedbConnection(connection) {
	console.log("Releasing connection");
	//console.log("Before" + queue.length);
	queue.push(connection);
	//console.log("After" + queue.length);
}

exports.releasedbConnection = releasedbConnection;

function createdbConnectionThread() {
	
	var mysql = require('mysql');

	var connection = mysql.createConnection({
		host     : 'localhost',
		user     : 'root',
		password : 'mysql',
		port: '3306',
		database: 'videolibrary'
	});
	
	connection.connect(function(error) {
		if(!error) {
			console.log("Connected!!!");
		} else{
			console.log(error);
		}
	});
	return connection;
}

function createdbConnectionPool() {
	if(enableConnectionPool) {
		console.log("Creating connection pool");
		for(var i=0;i<100;i++) {
			queue[i] = createdbConnectionThread();
		}
		return queue;
	}
}

exports.createdbConnectionPool = createdbConnectionPool;

