/**
 * New node file
 */
var mysql = require('./MySQLConnection');
var cache = require('./cache');
var cacheTimeout = 600000;

function insertUser(callback,user) {
	var connection = mysql.createdbConnection();
	//var connection = mysql.getdbConnection();
	//connection.query("INSERT INTO users (membership_no, password,  firstname, lastname, issued_movies, outstanding_movies, member_type, balance_amount, role_id, email, address, address2, city, state, zip, zipext ) VALUES('" + user.membershipNo + "', MD5('" + user.password + "'),'" +  user.firstname + "','" +  user.lastname + "','" +  user.issuedMovies + "','" + user.outstandingMovies + "','" + user.memberType + "','" + user.balanceAmount + "','" + user.roleId + "','" + user.email + "','" + user.address + "','" + user.address2 + "','" + user.city + "','" + user.state + "','" + user.zip + "','" + user.zipext + "')", function(error, results) {
	connection.query("INSERT INTO users (membership_no, password,  firstname, lastname, issued_movies, outstanding_movies, member_type, balance_amount, role_id, email, address, address2, city, state, zip, zipext ) VALUES(?,MD5(?),?,?,?,?,?,?,?,?,?,?,?,?,?,?)",[user.membershipNo , user.password ,  user.firstname ,  user.lastname ,  user.issuedMovies, user.outstandingMovies , user.memberType , user.balanceAmount , user.roleId , user.email , user.address , user.address2 , user.city , user.state , user.zip , user.zipext ], function(error, results) {
		if(!error) {
			if(results.length !== 0) {
				console.log("User details inserted");
			}
		} else {
			console.log("Insert User : " + error);
		}
		callback(results, error);
	});
	mysql.closedbConnection(connection);
	//mysql.releasedbConnection(connection);
}

exports.insertUser = insertUser;



function editUser(callback, user) {
	var connection = mysql.createdbConnection();
	//var connection = mysql.getdbConnection();
	//connection.query("UPDATE users SET firstname = '" + user.firstname + "', lastname = '" + user.lastname + "', member_type = '" + user.memberType + "', email = '" + user.email+ "', address = '" + user.address+ "' , address2 = '" + user.address2+ "' , city = '" + user.city+ "' , state = '" + user.state+ "', zip = '" + user.zip+ "', zipext = '" + user.zipext+ "', balance_amount = '" + user.balance_amount+ "', outstanding_movies = '" + user.outstanding_movies + "',issued_movies = '" + user.issued_movies +"' WHERE user_id  = " + user.userId, function(error, results) {
	connection.query("UPDATE users SET firstname = ?, lastname = ?, member_type = ?, email = ?, address = ? , address2 = ?, city = ? , state = ? , zip = ? , zipext = ?, balance_amount = ?, outstanding_movies = ?, issued_movies = ? WHERE user_id  = ?" , [user.firstname,user.lastname, user.member_type, user.email, user.address, user.address2, user.city,user.state,user.zip, user.zipext, user.balance_amount, user.outstanding_movies, user.issued_movies, user.user_id],function(error, results) {	
		if(!error) {
			//console.log(results);
			if(results.length !== 0) {
				console.log("User details edited for " + user.user_id);
			}
		} else {
			console.log(error);
		}
		callback(results,error);
	});
	mysql.closedbConnection(connection);
	//mysql.releasedbConnection(connection);
}

exports.editUser = editUser;




function deleteUser(callback, userId) {
	var connection = mysql.createdbConnection();
	//var connection = mysql.getdbConnection();
	//connection.query("DELETE FROM users WHERE user_id  = " + userId, function(error, results) {
	connection.query("DELETE FROM users WHERE user_id  = ?",[userId], function(error, results) {	
		if(!error) {
			//console.log(results);
			if(results.length !== 0) {
				console.log("User details deleted for " + userId);
			}
		} else {
			console.log(error);
		}
		callback(results,error);
	});
	mysql.closedbConnection(connection);
	//mysql.releasedbConnection(connection);
}

exports.deleteUser = deleteUser;



function selectRole(callback, userId) {
	
	var query = "SELECT role_id, role_name FROM role_master";
	cache.get(function(rows){
		if(rows == null){
			var connection = mysql.createdbConnection();
			//var connection = mysql.getdbConnection();
			connection.query(query, function(error, results) {
				if(!error) {
					//console.log(results);
					if(results.length !== 0) {
						console.log("Role selected");
						cache.put(query,rows,cacheTimeout);
					}
				} else {
					console.log(error);
				}
				callback(results, error);
			});
			mysql.closedbConnection(connection);
			//mysql.releasedbConnection(connection);
		} else {
			callback(rows, null);
		}
	},query);
}

exports.selectRole = selectRole;


function selectUserById(callback, userId) {
	var connection = mysql.createdbConnection();
	//var connection = mysql.getdbConnection();
	//connection.query("SELECT user_id, membership_no, firstname, lastname,issued_movies, outstanding_movies, member_type, balance_amount, email, address,address2, city, state, zip, zipext FROM users WHERE user_id  = " + userId, function(error, results) {
	connection.query("SELECT user_id, membership_no, firstname, lastname,issued_movies, outstanding_movies, member_type, balance_amount, email, address,address2, city, state, zip, zipext FROM users WHERE user_id  = ?" , [userId], function(error, results) {
		if(!error) {
			//console.log(results);
			if(results.length !== 0) {
				console.log("User details selected for " + userId);
			}
		} else {
			console.log(error);
		}
		callback(results, error);
	});
	mysql.closedbConnection(connection);
	//mysql.releasedbConnection(connection);
}

exports.selectUserById = selectUserById;

function selectUserByIdPassword(callback, userId, password) {
	var connection = mysql.createdbConnection();
	//var connection = mysql.getdbConnection();
	//connection.query("SELECT user_id FROM users WHERE user_id  = " + userId + " AND password = MD5('" + password + "')", function(error, results) {
	connection.query("SELECT user_id FROM users WHERE user_id  = ? AND password = MD5(?)" , [userId,password], function(error, results) {
		if(!error) {
			//console.log(results);
			if(results.length !== 0) {
				console.log("User details selected for " + userId);
			}
		} else {
			console.log(error);
		}
		callback(results, error);
	});
	mysql.closedbConnection(connection);
	//mysql.releasedbConnection(connection);
}

exports.selectUserByIdPassword = selectUserByIdPassword;

function editUserPassword(callback, userId, password) {
	var connection = mysql.createdbConnection();
	//var connection = mysql.getdbConnection();
	//connection.query("UPDATE users SET password = MD5('" + password + "') WHERE user_id  = " + user.userId, function(error, results) {
	connection.query("UPDATE users SET password = MD5(?) WHERE user_id  = ?" , [password, userId],function(error, results) {	
		if(!error) {
			//console.log(results);
			if(results.length !== 0) {
				console.log("User details edited for " + userId);
			}
		} else {
			console.log(error);
		}
		callback(results,error);
	});
	mysql.closedbConnection(connection);
	//mysql.releasedbConnection(connection);
}

exports.editUserPassword = editUserPassword;


function selectIssuedMoviesByUser(callback, memberId) {
	var connection = mysql.createdbConnection();
	//var connection = mysql.getdbConnection();
	//connection.query("SELECT DISTINCT(movie.movie_id) AS movie_id, movie_name, category FROM user_movie_mapping INNER JOIN movie ON movie.movie_id = user_movie_mapping.movie_id WHERE userid  = " + memberId , function(error, results) {
	connection.query("SELECT DISTINCT(movie.movie_id) AS movie_id, movie_name, category FROM user_movie_mapping INNER JOIN movie ON movie.movie_id = user_movie_mapping.movie_id WHERE userid  = ?",[memberId], function(error, results) {
		if(!error) {
			//console.log(results);
			if(results.length !== 0) {
				console.log("Movie details selected for " + memberId);
			}
		} else {
			console.log(error);
		}
		callback(results, error);
	});
	mysql.closedbConnection(connection);
	//mysql.releasedbConnection(connection);
}

exports.selectIssuedMoviesByUser = selectIssuedMoviesByUser;

function selectCurrentlyIssuedMoviesByUser(callback, memberId) {
	var connection = mysql.createdbConnection();
	//var connection = mysql.getdbConnection();
	//connection.query("SELECT COUNT(movie.movie_id) AS movie_count, user_movie_id, movie.movie_id AS movie_id, movie_name,rent_amount, category, issue_date FROM user_movie_mapping INNER JOIN movie ON movie.movie_id = user_movie_mapping.movie_id WHERE return_date IS NULL AND userid  = " + memberId + " GROUP BY movie.movie_id", function(error, results) {
	connection.query("SELECT COUNT(movie.movie_id) AS movie_count, user_movie_id, movie.movie_id AS movie_id, movie_name,rent_amount, category, issue_date FROM user_movie_mapping INNER JOIN movie ON movie.movie_id = user_movie_mapping.movie_id WHERE return_date IS NULL AND userid  = ? GROUP BY movie.movie_id",[memberId], function(error, results) {
		if(!error) {
			//console.log(results);
			if(results.length !== 0) {
				console.log("Movie details selected for " + memberId);
			}
		} else {
			console.log(error);
		}
		callback(results, error);
	});
	mysql.closedbConnection(connection);
	//mysql.releasedbConnection(connection);
}

exports.selectCurrentlyIssuedMoviesByUser = selectCurrentlyIssuedMoviesByUser;


function selectUserByEmail(callback, email) {
	var connection = mysql.createdbConnection();
	//var connection = mysql.getdbConnection();
	//connection.query("SELECT user_id, membership_no, password, firstname, lastname,issued_movies, outstanding_movies, member_type, balance_amount, email, address, city, state, zip, zipext FROM users WHERE email  = '" + email + "'", function(error, results) {
	connection.query("SELECT user_id, membership_no, password, firstname, lastname,issued_movies, outstanding_movies, member_type, balance_amount, email, address, city, state, zip, zipext FROM users WHERE email  = ?",[email], function(error, results) {
		if(!error) {
			//console.log(results);
			if(results.length !== 0) {
				console.log("User details selected for " + email);
			}
		} else {
			console.log(error);
		}
		callback(results, error);
	});
	mysql.closedbConnection(connection);
	//mysql.releasedbConnection(connection);
}

exports.selectUserByEmail = selectUserByEmail;


function selectUserByMembershipNo(callback, membershipNo) {
	console.log("membership no param: " + membershipNo);
	var connection = mysql.createdbConnection();
	//var connection = mysql.getdbConnection();
	//connection.query("SELECT user_id, membership_no, password, firstname, lastname,issued_movies, outstanding_movies, member_type, balance_amount, email, address,address2, city, state, zip, zipext FROM users WHERE membership_no  = '" + membershipNo + "'" , function(error, results)
	connection.query("SELECT user_id, membership_no, password, firstname, lastname,issued_movies, outstanding_movies, member_type, balance_amount, email, address, address2, city, state, zip, zipext FROM users WHERE membership_no  = ?" ,[ membershipNo ] , function(error, results)
	{
		if(!error) 
		{
			//console.log(results);
			if(results.length !== 0) 
			{
				console.log("User details selected for " + membershipNo);
			}
		} else 
		{
			console.log("Error from SelectUserbyMemId: " + error);
		}
		callback(results, error);
	});
	mysql.closedbConnection(connection);
	//mysql.releasedbConnection(connection);
}

exports.selectUserByMembershipNo = selectUserByMembershipNo;

function validateLogin(callback, membershipNo, password) {
	var connection = mysql.createdbConnection();
	//var connection = mysql.getdbConnection();
	//connection.query("SELECT user_id, membership_no, password, firstname, lastname,issued_movies, outstanding_movies, member_type, balance_amount, email, address, city, state, zip, zipext,role_name, users.role_id AS role_id FROM users INNER JOIN role_master ON role_master.role_id = users.role_id WHERE membership_no  = '" + membershipNo + "' and password = MD5('" + password + "')", function(error, results) {
	connection.query("SELECT user_id, membership_no, password, firstname, lastname,issued_movies, outstanding_movies, member_type, balance_amount, email, address, city, state, zip, zipext, role_name, users.role_id AS role_id FROM users INNER JOIN role_master ON role_master.role_id = users.role_id WHERE membership_no  = ? and password = MD5(?)", [membershipNo , password], function(error, results) {
		if(!error) {
			//console.log(results);
			if(results.length !== 0) {
				console.log("User details selected for " + membershipNo);
			}
		} else {
			console.log(error);
		}
		callback(error, results);
		console.log("returning results");
	});
	mysql.closedbConnection(connection);
	//mysql.releasedbConnection(connection);
}

exports.validateLogin = validateLogin;

function selectUsers(callback) {
	var query = "SELECT user_id, membership_no, password, firstname, lastname,issued_movies, outstanding_movies, member_type, balance_amount FROM users WHERE role_id = (SELECT role_id FROM role_master WHERE role_name = 'USER')";
	cache.get(function(rows){
		//console.log(rows);
		if(rows == null){
			var connection = mysql.createdbConnection();
			//var connection = mysql.getdbConnection();
			connection.query(query, function(error, results) {
				if(!error) {
					//console.log(results);
					if(results.length !== 0) {
						cache.put(query, results, cacheTimeout);
						console.log("Users details selected");
					}
				} else {
					console.log(error);
				}
				callback(results, error);
			});
			mysql.closedbConnection(connection);
			//mysql.releasedbConnection(connection);
		} else {
			callback(rows, null);
		}
	},query);	
}

exports.selectUsers = selectUsers;

function selectUserBySearchCriteria(callback, membershipNo, firstname, lastname, memberTypes, email, city, state, zip1, zip2) {
	var parameters = [];
	var count = 0;
	var connection = mysql.createdbConnection();
	//var connection = mysql.getdbConnection();
	var query = "SELECT user_id, membership_no, password, firstname, lastname,issued_movies, outstanding_movies, member_type, balance_amount FROM users WHERE role_id = (SELECT role_id FROM role_master WHERE role_name = 'USER') ";
	//var andFlag = false;
	
	if(membershipNo != "") {
		parameters[count++] = "%" + membershipNo + "%";
		query += " AND ";
		query +=" membership_no LIKE ?";
		//andFlag = true;
	}
	if(firstname != "") {
		//if(andFlag) {
			query += " AND ";
		//}
		parameters[count++] = "%" + firstname + "%";	
		query +=" firstname LIKE ?";
		//andFlag = true;
	}
	if(lastname != "") {
		//if(andFlag) {
			query += " AND ";
		//}
		parameters[count++] = "%" + lastname + "%";
		query +=" lastname LIKE ?";
		//andFlag = true;
	}
	if(memberTypes != "") {
		//if(andFlag) {
			query += " AND ";
		//}
		parameters[count++] = memberTypes;
		query +=" member_type = '" + memberTypes + "'";
		//andFlag = true;
	}
	if(email != "") {
		//if(andFlag) {
			query += " AND ";
		//}
		parameters[count++] = "%" + email + "%";
		query +=" email LIKE ?";
		//andFlag = true;
	}
	if(city != "") {
		//if(andFlag) {
			query += " AND ";
		//}
		parameters[count++] = "%" + city + "%";	
		query +=" city LIKE ?";
		//andFlag = true;
	}
	if(state != "") {
		//if(andFlag) {
			query += " AND ";
		//}
		parameters[count++] = "%" + state + "%";	
		query +=" state LIKE ?";
		//andFlag = true;
	}
	if(zip1 != "") {
		//if(andFlag) {
			query += " AND ";
		//}
		parameters[count++] = "%" + zip1 + "%";	
		query +=" zip LIKE ?";
		//andFlag = true;
	}
	if(zip2 != "") {
		//if(andFlag) {
			query += " AND ";
		//}
		parameters[count++] = "%" + zip2 + "%";	
		query +=" zipext LIKE ?";
		//andFlag = true;
	}
	//if(!andFlag) {
	//	query = "SELECT userid, membership_no, password, firstname, lastname,issued_movies, outstanding_movies, member_type, balance_amount FROM users WHERE role_id = (SELECT role_id FROM role_master WHERE role_name = 'USER') ";
	//}
	/*if(minIssuedMovies != "" && maxIssuedMovies != "") {
		if(andFlag) {
			query += " AND ";
		}
		query +=" issued_movies BETWEEN '" + minIssuedMovies + "' AND '" + maxIssuedMovies +"'";
		andFlag = true;
	}
	if(minOutstandingMovies != "" && maxOutstandingMovies != "") {
		if(andFlag) {
			query += " AND ";
		}
		query +=" outstanding_movies BETWEEN '" + minOutstandingMovies + "' AND '" + maxOutstandingMovies +"'";
		andFlag = true;
	}
	if(memberTypes != "") {
		if(andFlag) {
			query += " AND ";
		}
		query +=" member_types = '" + memberTypes + "'";
		andFlag = true;
	}
	if(minBalanceAmount != "" && maxBalanceAmount != "") {
		if(andFlag) {
			query += " AND ";
		}
		query +=" balance_amount BETWEEN '" + minBalanceAmount + "' AND '" + maxBalanceAmount +"'";
		andFlag = true;
	}
	if(roleId != "") {
		if(andFlag) {
			query += " AND ";
		}
		query +=" role_id = '" + roleId + "'";
		andFlag = true;
	}*/
	
	console.log("Query for selectUserbysearchcriteria" + query);
	//connection.query(query, function(error, results) {
	connection.query(query, parameters, function(error, results) {
		if(!error) {
			//console.log(results);
			if(results.length !== 0) {
				console.log("User details selected for selectUserbysearchcriteria");
			}
		} else {
			console.log(error);
		}
		callback(results, error);
	});
	mysql.closedbConnection(connection);
	//mysql.releasedbConnection(connection);
}

exports.selectUserBySearchCriteria = selectUserBySearchCriteria;

function insertUserMovieMapping(callback, userId, movieId) {
	var connection = mysql.createdbConnection();
	//var connection = mysql.getdbConnection();
	var query = "insert into user_movie_mapping (USERID,MOVIE_ID,ISSUE_DATE) values(?,?,now())";
	connection.query(query, [userId,movieId], function(error, results) {
		if(!error) {
			if(results.length !== 0) {
				console.log("Userm movie mapping inserted.");
			}
		} else {
			console.log("Insert User : " + error);
		}
		callback(results, error);
	});
	mysql.closedbConnection(connection);
	//mysql.releasedbConnection(connection);		
}
exports.insertUserMovieMapping = insertUserMovieMapping;


function updateUserMovieMapping(callback, userMovieId) {
	var connection = mysql.createdbConnection();
	//var connection = mysql.getdbConnection();
	var query = "UPDATE user_movie_mapping SET return_date = now() WHERE user_movie_id = ?";
	connection.query(query, [userMovieId], function(error, results) {
		if(!error) {
			if(results.length !== 0) {
				console.log("User movie mapping updated.");
			}
		} else {
			console.log("Update user movie mapping : " + error);
		}
		callback(results, error);
	});
	mysql.closedbConnection(connection);
	//mysql.releasedbConnection(connection);		
}
exports.updateUserMovieMapping = updateUserMovieMapping;

function selectUserMovieMapping(callback, userId, movieId) {
	var connection = mysql.createdbConnection();
	//var connection = mysql.getdbConnection();
	var query = "SELECT userId, movie_id, user_movie_id FROM user_movie_mapping WHERE userId = ? AND movie_id = ? AND return_date IS NULL";
	connection.query(query, [userId,movieId], function(error, results) {
		if(!error) {
			if(results.length !== 0) {
				console.log("Userm movie mapping selected.");
			}
		} else {
			console.log("Selected User movie mapping: " + error);
		}
		callback(results, error);
	});
	mysql.closedbConnection(connection);
	//mysql.releasedbConnection(connection);		
}
exports.selectUserMovieMapping = selectUserMovieMapping;
