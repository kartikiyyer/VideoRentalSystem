/**
 * New node file
 */
var mysql = require('./MySQLConnection');
var cache = require('./cache');
var cacheTimeout = 600000;

function insertUser(callback,user) {
	console.log("Insert User:"+user.city);
	var connection = mysql.createdbConnection();
	//var connection = mysql.getdbConnection();
	//connection.query("INSERT INTO users (membership_no, password,  firstname, lastname, issued_movies, outstanding_movies, member_type, balance_amount, role_id, email, address, address2, city, state, zip, zipext ) VALUES('" + user.membershipNo + "', MD5('" + user.password + "'),'" +  user.firstname + "','" +  user.lastname + "','" +  user.issuedMovies + "','" + user.outstandingMovies + "','" + user.memberType + "','" + user.balanceAmount + "','" + user.roleId + "','" + user.email + "','" + user.address + "','" + user.address2 + "','" + user.city + "','" + user.state + "','" + user.zip + "','" + user.zipext + "')", function(error, results) {
	var stateID;
	var addressID;
	var memberTypeID;
	var insertFlag = true;
	//Mihir: Get State ID
	connection.query("SELECT id FROM state WHERE name  = ?" , [user.state], function(error, results) {
		if(!error) {
			//console.log(results);
			if(results.length !== 0) {
				console.log("State id selected");
				console.log(results);
				stateID = results[0].id;
				console.log("In State:"+stateID);
				
				//Mihir: Get member_type ID
				connection.query("SELECT id FROM member_type WHERE name  = ?" , [user.memberType],function(error, results) {
					if(!error) {
						//console.log(results);
						if(results.length !== 0) {
							console.log(results);
							console.log("Member Type id selected");
							memberTypeID = results[0].id;
							console.log("In MemberType:"+memberTypeID);
							//Mihir: Insert into address
							connection.query("INSERT INTO address (line1,line2,city,zip,zip_ext,state_id) VALUES(?,?,?,?,?,?)",[user.line1, user.line2, user.city, user.zip, user.zipext, stateID], function(error, results) {
								if(!error) {
									if(results.length !== 0) {
										console.log("User address details inserted");
										console.log(results);
										addressID = results.insertId;
										console.log("AddressID:"+addressID);
										//Mihir: Insert into customer
										connection.query("INSERT INTO customer (membership_no,  address_id, first_name, last_name, email, member_type_id, role_id, active_id) VALUES(?,?,?,?,?,?,?,?)",[user.membershipNo ,addressID ,  user.firstname ,  user.lastname ,  user.email, memberTypeID, 1 , 1], function(error, results) {
											if(!error) {
												//console.log(results);
												if(results.length !== 0) {
													console.log("Customer details inserted");
													//Mihir : Phone 
													connection.query("INSERT INTO phone (city_code,area_code,number,membership_no) VALUES(?,?,?,?)",[user.areacode, user.citycode, user.phonenum, user.membershipNo], function(error, results) {
														if(!error) {
															if(results.length !== 0) {
																console.log(results);
																console.log("Inserted into phone");
																console.log("In Phone:"+results.insertId);
																//Mihir : Customer credential changes
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
							
						}
					} else {
						console.log("Select MemberTypeError :"+error);
					}
					
				});
			}
		} else {
			console.log("Select StateError :"+error);
		}

	});
	
	
	
	
	//console.log(stateID+"<>"+cityID)
	
	mysql.closedbConnection(connection);
	//mysql.releasedbConnection(connection);
}

exports.insertUser = insertUser;



function editUser(callback, user) {
	console.log("Edit User.");
	var connection = mysql.createdbConnection();
	//var connection = mysql.getdbConnection();
	//connection.query("UPDATE users SET firstname = '" + user.firstname + "', lastname = '" + user.lastname + "', member_type = '" + user.memberType + "', email = '" + user.email+ "', address = '" + user.address+ "' , address2 = '" + user.address2+ "' , city = '" + user.city+ "' , state = '" + user.state+ "', zip = '" + user.zip+ "', zipext = '" + user.zipext+ "', balance_amount = '" + user.balance_amount+ "', outstanding_movies = '" + user.outstanding_movies + "',issued_movies = '" + user.issued_movies +"' WHERE user_id  = " + user.userId, function(error, results) {
	connection.query("UPDATE customer,address,phone SET customer.first_name = ?, customer.last_name = ?,customer.email = ?, address.line1 = ?, address.line2 = ?, address.city=?,address.zip = ?, address.zip_ext=?, phone.city_code=? ,phone.area_code=?,phone.number=? WHERE customer.membership_no  = ? and customer.address_id = address.id and customer.membership_no = phone.membership_no" , [user.first_name,user.last_name,user.email,user.line1, user.line2, user.city, user.zip, user.zip_ext, user.city_code, user.area_code, user.number, user.membership_no],function(error, results) {
		if(!error) {
			//console.log(results);
			if(results.length !== 0) {
				console.log("Customer Details edited for " + user.membership_no);
				//update address
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




function deleteUser(callback, membershipNo) {
	console.log("Delete user.");
	var connection = mysql.createdbConnection();
	//var connection = mysql.getdbConnection();
	//connection.query("DELETE FROM users WHERE user_id  = " + userId, function(error, results) {
	connection.query("DELETE FROM customer WHERE membership_no  =  ?",[membershipNo], function(error, results) {
		if(!error) {
			//console.log(results);
			if(results.length !== 0) {
				console.log("Customer details deleted for: " + membershipNo);
				connection.query("DELETE FROM phone WHERE membership_no  = ?",[membershipNo], function(error, results) {
					if(!error) {
						//console.log(results);
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
	//mysql.releasedbConnection(connection);
}

exports.deleteUser = deleteUser;



function selectRole(callback, userId) {
	
	var query = "SELECT id, name FROM role";
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


function selectUserById(callback, membershipNo) {
	var connection = mysql.createdbConnection();
	//var connection = mysql.getdbConnection();
	//connection.query("SELECT user_id, membership_no, firstname, lastname,issued_movies, outstanding_movies, member_type, balance_amount, email, address,address2, city, state, zip, zipext FROM users WHERE user_id  = " + userId, function(error, results) {
	console.log("In SelectUserById:<"+membershipNo+">");
	var memberId = membershipNo.toString().replace(/[^\w\s]/gi, '');
	console.log("After replace:"+memberId);
	connection.query("SELECT cred.membership_no, cred.password, cust.first_name, cust.last_name,member.name as member_type,cust.email, a.line1,a.line2, a.zip, a.zip_ext, a.city, st.name as state, ph.city_code,ph.area_code, ph.number, r.name as role_name, r.id as role_id, active.id as active_id, active.name as active_name FROM customer_cred cred, customer cust, address a, member_type member, state st, phone ph, role r, active WHERE cred.membership_no  = ? and cust.membership_no = cred.membership_no and cust.address_id = a.id and cust.member_type_id = member.id and cred.membership_no = ph.membership_no and a.state_id = st.id and cust.role_id = r.id and cust.active_id = active.id" , [memberId], function(error, results) {
		if(!error) {
		
			if(results.length !== 0) {
				console.log(results);
				console.log("User details selected for " + membershipNo);
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

function selectUserByIdPassword(callback, membershipNo, password) {
	var connection = mysql.createdbConnection();
	//var connection = mysql.getdbConnection();
	//connection.query("SELECT user_id FROM users WHERE user_id  = " + userId + " AND password = MD5('" + password + "')", function(error, results) {
	console.log("In selectUserByIdPassword.");
	connection.query("SELECT membership_no FROM customer_cred WHERE membership_no  = ? AND password = ?" , [membershipNo,password], function(error, results) {
		if(!error) {
			//console.log(results);
			if(results.length !== 0) {
				console.log("User details selected for " + membershipNo);
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

function editUserPassword(callback, membershipNo, password) {
	var connection = mysql.createdbConnection();
	connection.query("UPDATE customer_cred SET password = ? WHERE membership_no  = ?" , [password, membershipNo],function(error, results) {
		if(!error) {
			//console.log(results);
			if(results.length !== 0) {
				console.log("User details edited for " + membershipNo);
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
	connection.query("SELECT cred.membership_no, cred.password, cust.first_name, cust.last_name,member.name as member_type,cust.email, a.line1,a.line2, a.city, st.name as state, ph.city_code,ph.area_code, ph.number, r.name as role_name, r.id as role_id, active.id as active_id, active.name as active_name FROM customer_cred cred, customer cust, address a, member_type member, state st, phone ph, role r, active WHERE cust.email  = ? and cust.membership_no = cred.membership_no and cust.address_id = a.id and cust.member_type_id = member.id and cred.membership_no = ph.membership_no and a.state_id = st.id and cust.role_id = r.id and cust.active_id = active.id",[email], function(error, results) {
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
	connection.query("SELECT cred.membership_no, cred.password, cust.first_name, cust.last_name,member.name as member_type,cust.email, a.line1,a.line2, a.city, st.name as state, ph.city_code,ph.area_code, ph.number, r.name as role_name, r.id as role_id, active.id as active_id, active.name as active_name FROM customer_cred cred, customer cust, address a, member_type member, state st, phone ph, role r, active WHERE cred.membership_no  = ? and cust.membership_no = cred.membership_no and cust.address_id = a.id and cust.member_type_id = member.id and cred.membership_no = ph.membership_no and a.state_id = st.id and cust.role_id = r.id and cust.active_id = active.id" ,[ membershipNo ] , function(error, results)
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
	connection.query("SELECT cred.membership_no, cred.password, cust.first_name, cust.last_name,member.name as member_type,cust.email, a.line1,a.line2, a.city, st.name as state, ph.city_code,ph.area_code, ph.number, r.name as role_name, r.id as role_id, active.id as active_id, active.name as active_name FROM customer_cred cred, customer cust, address a, member_type member, state st, phone ph, role r, active WHERE cred.membership_no  = ?  and password = ? and cust.membership_no = cred.membership_no and cust.address_id = a.id and cust.member_type_id = member.id and cred.membership_no = ph.membership_no and a.state_id = st.id and cust.role_id = r.id and cust.active_id = active.id", [membershipNo , password], function(error, results) {
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
	var query = "SELECT cred.membership_no, cred.password, first_name, last_name, m.name as member_type_name, a.line1, a.line2, a.zip, a.zip_ext, ph.city_code, ph.area_code,ph.number FROM customer, member_type m, customer_cred cred, address a, phone ph WHERE customer.member_type_id = m.id and customer.membership_no = cred.membership_no and customer.address_id = a.id and customer.membership_no = ph.membership_no and customer.role_id = (SELECT id FROM role WHERE name = 'user')";
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
	var query = "SELECT cred.membership_no, cred.password, first_name, last_name, m.name as member_type_name FROM customer, member_type m, customer_cred cred WHERE customer.member_type_id = m.id and customer.membership_no = cred.membership_no and customer.role_id = (SELECT id FROM role WHERE name = 'user')";
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
		query +=" first_name LIKE ?";
		//andFlag = true;
	}
	if(lastname != "") {
		//if(andFlag) {
			query += " AND ";
		//}
		parameters[count++] = "%" + lastname + "%";
		query +=" last_name LIKE ?";
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
