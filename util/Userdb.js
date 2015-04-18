/**
 * New node file
 */
var mysql = require('./MySQLConnection');
var cache = require('./cache');
var cacheTimeout = 600000;

function insertUser(callback,user) {
	var connection = mysql.createdbConnection();
	var addressID;
	var insertFlag = true;
	connection.query("INSERT INTO address (line1,line2,city,zip,zip_ext,state_id) VALUES(?,?,?,?,?,?)",[user.line1, user.line2, user.city, user.zip, user.zipext, user.stateId], function(error, results) {
		if(!error) {
			if(results.length !== 0) {
				console.log("User address details inserted");
				addressID = results.insertId;
				connection.query("INSERT INTO customer (membership_no,  address_id, first_name, last_name, email, member_type_id, role_id, active_id) VALUES(?,?,?,?,?,?,?,?)",[user.membershipNo ,addressID ,  user.firstname ,  user.lastname ,  user.email, user.memberTypeId, user.roleId , 1], function(error, results) {
					if(!error) {
						if(results.length !== 0) {
							console.log("Customer details inserted");
							connection.query("INSERT INTO phone (city_code,area_code,number,membership_no) VALUES(?,?,?,?)",[user.areacode, user.citycode, user.phonenum, user.membershipNo], function(error, results) {
								if(!error) {
									if(results.length !== 0) {
										console.log("Inserted into phone");
										connection.query("INSERT INTO customer_cred (membership_no, password) VALUES(?,?)",[user.membershipNo , user.password], function(error, results) {
											if(!error) {
												if(results.length !== 0) {
													console.log("User Credentials details inserted");
												}
											} else {
												insertFlag = false;
												console.log("Insert User CredentialsError: " + error);
											}
											callback(insertFlag);
										});
									}
								} else {
									insertFlag = false;
									console.log("Insert CustomerError: " + error);
								}
							});
						}
					} else {
						insertFlag = false;
						console.log("Insert PhoneError:"+error);
					}
					
				});
			}
		} else {
			
			console.log("Insert AddressError : " + error);
		}
	});
	mysql.closedbConnection(connection);
}

exports.insertUser = insertUser;


function editUser(callback, user) {
	var connection = mysql.createdbConnection();
	connection.query("UPDATE customer,address,phone SET customer.first_name = ?, customer.last_name = ?,customer.email = ?, customer.role_id = ?, customer.member_type_id = ?, address.line1 = ?, address.line2 = ?, address.city=?,address.zip = ?, address.zip_ext=?, address.state_id = ?, phone.city_code=? ,phone.area_code=?,phone.number=? WHERE customer.membership_no  = ? and customer.address_id = address.id and customer.membership_no = phone.membership_no" , [user.first_name,user.last_name,user.email,user.role_id, user.member_type_id, user.line1, user.line2, user.city, user.zip, user.zip_ext, user.state_id, user.city_code, user.area_code, user.number, user.membership_no],function(error, results) {
		if(!error) {
			if(results.length !== 0) {
				console.log("Customer Details edited for " + user.membership_no);
			}
		} else {
			console.log(error);
		}
		callback(results,error);
	});
	mysql.closedbConnection(connection);
}

exports.editUser = editUser;


function deleteUser(callback, membershipNo) {
	var connection = mysql.createdbConnection();
	connection.query("DELETE FROM customer WHERE membership_no  =  ?",[membershipNo], function(error, results) {
		if(!error) {
			if(results.length !== 0) {
				console.log("Customer details deleted for: " + membershipNo);
				connection.query("DELETE FROM phone WHERE membership_no  = ?",[membershipNo], function(error, results) {
					if(!error) {
						if(results.length !== 0) {
							console.log("Phone details deleted for " + membershipNo);
							callback(results,error);
						}
					} else {
						console.log(error);
					}
				});
			}
		} else {
			console.log(error);
		}
	});
	mysql.closedbConnection(connection);
}

exports.deleteUser = deleteUser;

function selectRole(callback, userId) {
	
	var query = "SELECT id, name FROM role";
	cache.get(function(rows){
		if(rows == null){
			var connection = mysql.createdbConnection();
			connection.query(query, function(error, results) {
				if(!error) {
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
		} else {
			callback(rows, null);
		}
	},query);
}

exports.selectRole = selectRole;

// Fetch States
function selectStates(callback) {
	
	var query = "SELECT id, name FROM state";
	cache.get(function(rows){
		if(rows == null){
			var connection = mysql.createdbConnection();
			connection.query(query, function(error, results) {
				if(!error) {
					if(results.length !== 0) {
						console.log("State selected");
						cache.put(query,rows,cacheTimeout);
					}
				} else {
					console.log(error);
				}
				callback(results, error);
			});
			mysql.closedbConnection(connection);
		} else {
			callback(rows, null);
		}
	},query);
}

exports.selectStates = selectStates;


// Fetch member types
function selectMemberTypes(callback) {
	var query = "SELECT id, name FROM member_type";
	cache.get(function(rows){
		if(rows == null){
			var connection = mysql.createdbConnection();
			connection.query(query, function(error, results) {
				if(!error) {
					if(results.length !== 0) {
						console.log("Member Type selected");
						cache.put(query,rows,cacheTimeout);
					}
				} else {
					console.log(error);
				}
				callback(results, error);
			});
			mysql.closedbConnection(connection);
		} else {
			callback(rows, null);
		}
	},query);
}

exports.selectMemberTypes = selectMemberTypes;


function selectUserById(callback, membershipNo) {
	var connection = mysql.createdbConnection();
	var memberId = membershipNo.toString().replace(/[^\w\s]/gi, '');
	connection.query("SELECT cred.membership_no, cred.password, cust.first_name, cust.last_name,member.name as member_type, cust.member_type_id,cust.email, a.line1,a.line2, a.zip, a.zip_ext, a.city, st.name as state,a.state_id, ph.city_code,ph.area_code, ph.number, r.name as role_name, r.id as role_id, active.id as active_id, active.name as active_name FROM customer_cred cred, customer cust, address a, member_type member, state st, phone ph, role r, active WHERE cred.membership_no  = ? and cust.membership_no = cred.membership_no and cust.address_id = a.id and cust.member_type_id = member.id and cred.membership_no = ph.membership_no and a.state_id = st.id and cust.role_id = r.id and cust.active_id = active.id" , [memberId], function(error, results) {
		if(!error) {
			if(results.length !== 0) {
				console.log("User details selected for " + membershipNo);
			}
		} else {
			console.log(error);
		}
		callback(results, error);
	});
	mysql.closedbConnection(connection);
}

exports.selectUserById = selectUserById;

function selectUserByIdPassword(callback, membershipNo, password) {
	var connection = mysql.createdbConnection();
	console.log("In selectUserByIdPassword.");
	connection.query("SELECT membership_no FROM customer_cred WHERE membership_no  = ? AND password = ?" , [membershipNo,password], function(error, results) {
		if(!error) {
			if(results.length !== 0) {
				console.log("User details selected for " + membershipNo);
			}
		} else {
			console.log(error);
		}
		callback(results, error);
	});
	mysql.closedbConnection(connection);
}

exports.selectUserByIdPassword = selectUserByIdPassword;

function editUserPassword(callback, membershipNo, password) {
	var connection = mysql.createdbConnection();
	connection.query("UPDATE customer_cred SET password = ? WHERE membership_no  = ?" , [password, membershipNo],function(error, results) {
		if(!error) {
			if(results.length !== 0) {
				console.log("User details edited for " + membershipNo);
			}
		} else {
			console.log(error);
		}
		callback(results,error);
	});
	mysql.closedbConnection(connection);
}

exports.editUserPassword = editUserPassword;


function selectIssuedMoviesByUser(callback, memberId) {
	var connection = mysql.createdbConnection();
	connection.query("SELECT DISTINCT(movie.movie_id) AS movie_id, movie_name, category FROM user_movie_mapping INNER JOIN movie ON movie.movie_id = user_movie_mapping.movie_id WHERE userid  = ?",[memberId], function(error, results) {
		if(!error) {
			if(results.length !== 0) {
				console.log("Movie details selected for " + memberId);
			}
		} else {
			console.log(error);
		}
		callback(results, error);
	});
	mysql.closedbConnection(connection);
}

exports.selectIssuedMoviesByUser = selectIssuedMoviesByUser;

function selectCurrentlyIssuedMoviesByUser(callback, membershipNo) {
	var connection = mysql.createdbConnection();
	var success = 0;
	connection.query("SELECT COUNT(video.id)  AS video_count, video.id AS video_id, title,rental_rate, rental_date FROM rental INNER JOIN video ON video.id = rental.video_id WHERE return_date IS NULL AND membership_no  = ? GROUP BY video.id",[membershipNo], function(error, results) {
		if(!error) {
			if(results.length !== 0) {
				console.log("Video details selected for " + membershipNo);
				for(var x1 in results) {
					connection.query("SELECT video_id, name FROM category INNER JOIN video_category ON category.id = video_category.category_id WHERE video_id = ?",[results[x1].video_id], function(error2, results2) {
						if(!error2) {
							for(var x3 in results) {
								if(results[x3].video_id == results2[0].video_id) {
									results[x3].categories = "";
									for(var x in results2) {
										results[x3].categories += results2[x].name + ", ";
									}
									results[x3].categories = results[x3].categories.substr(0, results[x3].categories.length-2);
																		
									success++;
									console.log("Video Category details selected for " + results[x3].video_id);
									break;
								}
							}
						} else {
							console.log(error2);
						}
						if(success == results.length) {
							callback(results, error);
						}
					});
				}
			}
		} else {
			console.log(error);
			callback(results, error);
		}
		
	});
	mysql.closedbConnection(connection);
}

exports.selectCurrentlyIssuedMoviesByUser = selectCurrentlyIssuedMoviesByUser;


function selectUserByEmail(callback, email) {
	var connection = mysql.createdbConnection();
	connection.query("SELECT cred.membership_no, cred.password, cust.first_name, cust.last_name,member.name as member_type,cust.email, a.line1,a.line2, a.city, st.name as state, ph.city_code,ph.area_code, ph.number, r.name as role_name, r.id as role_id, active.id as active_id, active.name as active_name FROM customer_cred cred, customer cust, address a, member_type member, state st, phone ph, role r, active WHERE cust.email  = ? and cust.membership_no = cred.membership_no and cust.address_id = a.id and cust.member_type_id = member.id and cred.membership_no = ph.membership_no and a.state_id = st.id and cust.role_id = r.id and cust.active_id = active.id",[email], function(error, results) {
		if(!error) {
			if(results.length !== 0) {
				console.log("User details selected for " + email);
			}
		} else {
			console.log(error);
		}
		callback(results, error);
	});
	mysql.closedbConnection(connection);
}

exports.selectUserByEmail = selectUserByEmail;


function selectUserByMembershipNo(callback, membershipNo) {
	var connection = mysql.createdbConnection();
	connection.query("SELECT cred.membership_no, cred.password, cust.first_name, cust.last_name,member.name as member_type,cust.email, a.line1,a.line2, a.city, st.name as state, ph.city_code,ph.area_code, ph.number, r.name as role_name, r.id as role_id, active.id as active_id, active.name as active_name FROM customer_cred cred, customer cust, address a, member_type member, state st, phone ph, role r, active WHERE cred.membership_no  = ? and cust.membership_no = cred.membership_no and cust.address_id = a.id and cust.member_type_id = member.id and cred.membership_no = ph.membership_no and a.state_id = st.id and cust.role_id = r.id and cust.active_id = active.id" ,[ membershipNo ] , function(error, results) {
		if(!error) {
			if(results.length !== 0) {
				console.log("User details selected for " + membershipNo);
			}
		} else {
			console.log("Error from SelectUserbyMemId: " + error);
		}
		callback(results, error);
	});
	mysql.closedbConnection(connection);
}

exports.selectUserByMembershipNo = selectUserByMembershipNo;

function validateLogin(callback, membershipNo, password) {
	var connection = mysql.createdbConnection();
	connection.query("SELECT cred.membership_no, cred.password, cust.first_name, cust.last_name,member.name as member_type,cust.email, a.line1,a.line2, a.city, st.name as state, ph.city_code,ph.area_code, ph.number, r.name as role_name, r.id as role_id, active.id as active_id, active.name as active_name FROM customer_cred cred, customer cust, address a, member_type member, state st, phone ph, role r, active WHERE email  = ?  and password = ? and cust.membership_no = cred.membership_no and cust.address_id = a.id and cust.member_type_id = member.id and cred.membership_no = ph.membership_no and a.state_id = st.id and cust.role_id = r.id and cust.active_id = active.id", [membershipNo , password], function(error, results) {
		if(!error) {
			if(results.length !== 0) {
				console.log("User details selected for " + membershipNo);
			}
		} else {
			console.log(error);
		}
		callback(error, results);
	});
	mysql.closedbConnection(connection);
}

exports.validateLogin = validateLogin;

function selectUsers(callback,user) {
	var query = "SELECT cred.membership_no, cred.password, first_name, last_name, m.name as member_type_name, a.line1, a.line2, a.zip, a.zip_ext, ph.city_code, ph.area_code,ph.number,r.name AS role FROM customer, member_type m, customer_cred cred, address a, phone ph, role r WHERE customer.member_type_id = m.id and customer.membership_no = cred.membership_no and customer.address_id = a.id and customer.membership_no = ph.membership_no and customer.role_id = r.id and customer.membership_no <> ?";
	cache.get(function(rows){
		if(rows == null){
			var connection = mysql.createdbConnection();
			connection.query(query, [user.membershipNo], function(error, results) {
				if(!error) {
					if(results.length !== 0) {
						//cache.put(query, results, cacheTimeout);
						console.log("Users details selected");
					}
				} else {
					console.log(error);
				}
				callback(results, error);
			});
			mysql.closedbConnection(connection);
		} else {
			callback(rows, null);
		}
	},query);	
}

exports.selectUsers = selectUsers;

function selectUserBySearchCriteria(callback, membershipNo, firstname, lastname, memberTypeId, email, city, stateId, zip1, zip2,roleId,user) {
	var parameters = [];
	var count = 0;
	var connection = mysql.createdbConnection();
	var query = "SELECT cred.membership_no, cred.password, first_name, last_name, m.name as member_type_name, r.name AS role FROM customer, member_type m, customer_cred cred, address a,role r WHERE a.id = customer.address_id and customer.member_type_id = m.id and customer.membership_no = cred.membership_no and customer.role_id = r.id and customer.membership_no <> ? ";
	parameters[count++] = user.membershipNo;
	if(membershipNo != "") {
		parameters[count++] = "%" + membershipNo + "%";
		query += " AND ";
		query +=" membership_no LIKE ?";
	}
	if(firstname != "") {
		query += " AND ";
		parameters[count++] = "%" + firstname + "%";	
		query +=" first_name LIKE ?";
	}
	if(lastname != "") {
		query += " AND ";
		parameters[count++] = "%" + lastname + "%";
		query +=" last_name LIKE ?";
	}
	if(memberTypeId != "") {
		query += " AND ";
		parameters[count++] = memberTypeId;
		query +=" member_type_id = ?";
	}
	if(roleId != "") {
		query += " AND ";
		parameters[count++] = roleId;
		query +=" role_id = ?";
	}
	if(email != "") {
		query += " AND ";
		parameters[count++] = "%" + email + "%";
		query +=" email LIKE ?";
	}
	if(city != "") {
		query += " AND ";
		parameters[count++] = "%" + city + "%";	
		query +=" city LIKE ?";
	}
	if(stateId != "") {
		query += " AND ";
		parameters[count++] = stateId;	
		query +=" state_id = ?";
	}
	if(zip1 != "") {
			query += " AND ";
		parameters[count++] = "%" + zip1 + "%";	
		query +=" zip LIKE ?";
	}
	if(zip2 != "") {
		query += " AND ";
		parameters[count++] = "%" + zip2 + "%";	
		query +=" zipext LIKE ?";
	}
	
	console.log("Query for selectUserbysearchcriteria" + query);
	connection.query(query, parameters, function(error, results) {
		if(!error) {
			if(results.length !== 0) {
				console.log("User details selected for selectUserbysearchcriteria");
			}
		} else {
			console.log(error);
		}
		callback(results, error);
	});
	mysql.closedbConnection(connection);
}

exports.selectUserBySearchCriteria = selectUserBySearchCriteria;

function insertUserMovieMapping(callback, userId, movieId) {
	var connection = mysql.createdbConnection();
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
}
exports.insertUserMovieMapping = insertUserMovieMapping;


function updateUserMovieMapping(callback, id) {
	var connection = mysql.createdbConnection();
	var query = "UPDATE rental SET return_date = now() WHERE id = ?";
	connection.query(query, [id], function(error, results) {
		if(!error) {
			if(results.length !== 0) {
				console.log("Rental updated.");
			}
		} else {
			console.log("Update rental : " + error);
		}
		callback(results, error);
	});
	mysql.closedbConnection(connection);
}
exports.updateUserMovieMapping = updateUserMovieMapping;

function selectUserMovieMapping(callback, membershipNo, videoId) {
	var connection = mysql.createdbConnection();
	var query = "SELECT membership_no, video_id, id FROM rental WHERE membership_no = ? AND video_id = ? AND return_date IS NULL";
	connection.query(query, [membershipNo,videoId], function(error, results) {
		if(!error) {
			if(results.length !== 0) {
				console.log("Rental mapping selected.");
			}
		} else {
			console.log("Selected Rental mapping: " + error);
		}
		callback(results, error);
	});
	mysql.closedbConnection(connection);
}
exports.selectUserMovieMapping = selectUserMovieMapping;
