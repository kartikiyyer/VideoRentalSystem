var dbuser = require('../util/Userdb');
var dbvideo = require('../util/Moviedb');

/**
 * Log in
 */
exports.login = function(req, res){
	if(req.session.userdetails == null || req.session.userdetails == "") {
		var error = null;
		if(req.session.error != null) {
			error = req.session.error;
			req.session.error = null;
		}
		res.render("login",{"error": error});
	} else {
		res.writeHead(301,
				{Location: "/"}			
		);
		res.end();
	}	
};

/**
 * Submit button of log in
 */
exports.validateLogin = function(req, res){
	if(req.session.userdetails == null || req.session.userdetails == "") {	
		if(!req.body.hasOwnProperty('membershipNo') ||!req.body.hasOwnProperty('password')) {
			res.statusCode = 400;
			return res.send('Error 400: Post syntax incorrect.');
		}
		dbuser.validateLogin(function(err,results){
			if(err) {
				req.session.error = "Invalid credentials.";
				res.writeHead(301,
						{Location: "/login"}
				);
				res.end();
			} else if(results.length > 0) {
				req.session.userdetails = JSON.stringify({membershipNo : results[0].membership_no, firstname :  results[0].first_name, lastname : results[0].last_name, memberTypes : results[0].member_type, email: results[0].email,role: results[0].role_id, role_name: results[0].role_name});
				if(results[0].role_name == "Admin") {
					/*res.render('index',{userDet : results[0]},function(err, result) {
						// render on success
						if (!err) {
							res.end(result);
						}
						// render or error
						else {
							res.end('An error occurred');
							
						}
					});*/
					res.writeHead(301,
							{Location: "/listmovie"}			
					);
					res.end();
				}
				else {
					res.writeHead(301,
							{Location: "/viewusermovies"}			
					);
					res.end();
				}
			} else {
				req.session.error = "Invalid credentials.";
				res.writeHead(301,
						{Location: "/login"}			
				);
				res.end();
			}
		},req.param('membershipNo'),req.param('password'));
	} else {
		res.writeHead(301,
				{Location: "/"}			
		);
		res.end();
	}
};

/**
 * Log out
 */
exports.signOut = function(req, res) {
	if(req.session.userdetails != null || req.session.userdetails != "") {
		req.session.userdetails = "";
	} 
	res.writeHead(301,
			{Location: "/"}			
	);
	res.end();
};

/**
 * Create user
 */
exports.createmember = function(req, res){
	if(req.session.userdetails != null && req.session.userdetails != "") {		
		var user = JSON.parse(req.session.userdetails);
		if(user !=null && user.role_name == "Admin") {
			dbuser.selectRole(function(roles,error) {
				dbuser.selectMemberTypes(function(memberTypes,error) {
					dbuser.selectStates(function(states,error) {
						res.render("createmember",{"userDet" : user,"insertedresults":null, "roles": roles,"memberTypes":memberTypes, "states":states});	
					});
				});
			});
		} else {
			res.render("accessdenied");	
		}
	} else {
		res.writeHead(301,
				{Location: "/login"}			
		);
		res.end();
	}
};

/**
 * Submit button of create user
 */
exports.createMemberSubmit = function(req,res) {
	var user = JSON.parse(req.session.userdetails);
	if(user !=null && user.role_name == "Admin"){
		dbuser.selectRole(function(roles,error) {
			dbuser.selectMemberTypes(function(memberTypes,error) {
				dbuser.selectStates(function(states,error) {
					dbuser.selectUserByEmail(function(results,err) {
						if(err) {
							res.render("createmember",{"userDet" : user,"insertedresults":"Email query problem","roles":roles,"memberTypes":memberTypes,"states":states});
						} else {
							if(results.length>0) {
								res.render("createmember",{userDet : user,"insertedresults":"MEMBER EMAIL EXISTS!! ","roles":roles,"memberTypes":memberTypes,"states":states});
							}
							else {
								var users = [];
								var membershipNum = randomNoGenerator(100000000, 999999999);
								users.membershipNo = membershipNum;
								users.password = req.body.password;
								users.firstname= req.body.firstname;
								users.lastname= req.body.lastname;
								users.issuedMovies=0;
								users.outstandingMovies=0;
								users.memberTypeId=req.body.memberTypeId;
								users.balanceAmount=0;
								users.roleId=req.body.roleId;
								// Admin user
								if(users.roleId == 1) {
									users.memberTypeId = 1;
								}
								users.email = req.body.email;
								users.areacode = req.body.areacode;
								users.citycode = req.body.citycode;
								users.phonenum = req.body.phonenum;
								users.line1 = req.body.address;
								users.line2 = req.body.address2;
								users.city = req.body.city;
								users.stateId = req.body.stateId;
								users.zip = req.body.zip1;
								users.zipext = req.body.zip2;
								users.roleId = req.body.roleId;
								if(users.zipext == "") {
									users.zipext = 0;
								}
								
								/*if(users.memberTypeId == 2) {
									users.balanceAmount = 25;
								}*/
								dbuser.insertUser(function(insertSucessfullFlag) {
									if(!insertSucessfullFlag) {
										console.log("InsertUser Failed");
									}
									else {	
										res.render("createmember",{"userDet" : user,"insertedresults":"User details inserted with membership no."+membershipNum,"roles": roles,"memberTypes":memberTypes,"states":states});
									}
								},users);
							}
						}
					},req.body.email);
				});
			});
		});
	} else {
		res.writeHead(301,
				{Location: "/login"}		
		);
		res.end();
	}
};

/**
 * User registration
 */
exports.usercreatemember = function(req, res){
	dbuser.selectMemberTypes(function(memberTypes,error) {
		dbuser.selectStates(function(states,error) {
			res.render("\\users\\usercreatemember",{"insertedresults":null, "states":states, "memberTypes":memberTypes});
		});
	});
};

/**
 * Submit button of user registration
 */
exports.userCreateMemberSubmit = function(req,res) {
	dbuser.selectMemberTypes(function(memberTypes,error) {
		dbuser.selectStates(function(states,error) {
			dbuser.selectUserByEmail(function(results,err) {
				if(err) {
					res.render("\\users\\usercreatemember",{"insertedresults":"Email query problem","memberTypes":memberTypes,"states":states});
				} else {
					if(results.length>0) {
						res.render("\\users\\usercreatemember",{"insertedresults":"MEMBER EMAIL EXISTS!! ","memberTypes":memberTypes,"states":states});
					}
					else {
						var user = [];
						var membershipNum = randomNoGenerator(100000000, 999999999);
						user.membershipNo = membershipNum;
						user.password = req.body.password;
						user.firstname= req.body.firstname;
						user.lastname= req.body.lastname;
						user.issuedMovies=0;
						user.outstandingMovies=0;
						user.memberTypeId=req.body.memberTypeId;
						user.balanceAmount=0;
						user.email = req.body.email;
						user.areacode = req.body.areacode;
						user.citycode = req.body.citycode;
						user.phonenum = req.body.phonenum;
						user.line1 = req.body.address;
						user.line2 = req.body.address2;
						user.city = req.body.city;
						user.stateId = req.body.stateId;
						user.zip = req.body.zip1;
						user.zipext = req.body.zip2;
						user.roleId = 2;
						if(user.zipext == "") {
							user.zipext = 0;
						}
						
						if(user.memberTypeId == "2") {
							user.balanceAmount = 25;
						}
						dbuser.insertUser(function(insertSucessfullFlag) {
							if(!insertSucessfullFlag) {
								console.log("InsertUser Failed");
							}
							else {
								res.render("\\users\\usercreatemember",{"insertedresults":"User details inserted with membership no."+membershipNum,"memberTypes": memberTypes,"states":states});
							}
						},user);
					}
				}
			},req.body.email);
		});
	});
};

/**
 * Home page after log in
 */
exports.index = function(req, res) {
	if(req.session.userdetails != null && req.session.userdetails != "") {
		var user = JSON.parse(req.session.userdetails);
		if(user !=null && user.role_name == "Admin") {
			//res.render('index', {userDet : user});
			res.writeHead(301,
					{Location: "/listmovie"}			
			);
			res.end();
		} else {
			//res.render('\\users\\userindex', {"userDet": user});
			res.writeHead(301,
					{Location: "/viewusermovies"}			
			);
			res.end();
		}
	} else {
		/*res.writeHead(301,
				{Location: "/login"}
		);
		res.end();*/
		dbvideo.selectVideosForHome(function(videos,error){
			if(error == null) {
				//console.log(videos);
				res.render('homepage', {"videos":videos});
			}			
		});
		
	}
};



/**
 * List users
 */
exports.listMember = function(req, res){
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user !=null && user.role_name == "Admin") {
			dbuser.selectRole(function(roles,error) {
				dbuser.selectMemberTypes(function(memberTypes,error) {
					dbuser.selectStates(function(states,error) {
						dbuser.selectUsers(function(members, error) {
							for(var i in members) {
								if(members[i].role == "Admin") {
									members[i].member_type_name = "";
								}
							}
							res.render("listmember",{"userDet" : user,"members":members,"states":states,"memberTypes":memberTypes,"roles":roles});
						},user);
					});
				});
			});
		} else {
			res.render("accessdenied");	
		}
	} else {
		res.writeHead(301,
				{Location: "/"}			
		);
		res.end();
	}
};

/**
 * Edit user
 */
exports.editMember = function(req, res){
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user !=null && user.role_name == "Admin") {
			var users;
			var memberId = req.params.id;
			dbuser.selectRole(function(roles,error) {
				dbuser.selectMemberTypes(function(memberTypes,error) {
					dbuser.selectStates(function(states,error) {
						dbuser.selectUserById(function(results, error) {
							users = results[0];
							res.render("editmember",{"userDet" : user,"member":users, "editedResults": null,"states":states,"roles":roles,"memberTypes":memberTypes});
						},memberId);
					});
				});
			});
		} else {
			res.render("accessdenied");	
		}
	} else {
		res.writeHead(301,
				{Location: "/"}			
		);
		res.end();
	}
};

/**
 * Submit button of edit user
 */
exports.editMemberSubmit = function(req, res){
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user !=null && user.role_name == "Admin") {
			var users = [];
			dbuser.selectUserById(function(results, error) {
				users = results[0];
				users.first_name= req.body.fname;
				users.last_name= req.body.lname;
				users.member_type_id=req.body.memberTypeId;
				users.email = req.body.email;
				users.line1 = req.body.address;
				users.line2 = req.body.address2;
				users.city = req.body.city;
				users.state_id= req.body.stateId;
				users.zip = req.body.zip1;
				users.zip_ext = req.body.zip2;
				users.city_code = req.body.citycode;
				users.area_code = req.body.areacode;
				users.number = req.body.phonenum;
				users.role_id = req.body.roleId;
				if(users.role_id == 1) {
					users.member_type_id = 1;
				}
				dbuser.selectRole(function(roles,error) {
					dbuser.selectMemberTypes(function(memberTypes,error) {
						dbuser.selectStates(function(states,error) {
							dbuser.selectUserByEmail(function(results,err) {
								if(err) {
									res.render("editmember",{"userDet" : user,"member":users,"editedResults": "Error.","states":states,"roles":roles,"memberTypes":memberTypes});
								} else {
									if(results.length > 0 && results[0].membership_no != req.body.memberId) {
										res.render("editmember",{"userDet" : user,"member":users,"editedResults": "Email already exists.","states":states,"roles":roles,"memberTypes":memberTypes});
									} else {
										dbuser.editUser(function(results, error) {
											res.render("editmember",{"userDet" : user,"member":users,"editedResults": "User edited successfully.","states":states,"roles":roles,"memberTypes":memberTypes});
										},users);
									}
								}
							}, req.body.email);
						});
					});
				});
			},req.body.memberId);
		} else {
			res.render("accessdenied");	
		}
	} else {
		res.writeHead(301,
				{Location: "/"}			
		);
		res.end();
	}
};

/**
 * Delete user
 */
exports.deleteMember = function(req, res){
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user !=null && user.role_name == "Admin") {
			var memberId = req.params.id;
			dbuser.deleteUser(function(results, error) {
				res.writeHead(301,
						{Location: "/listmember"}			
				);
				res.end();
			},memberId);
		} else {
			res.render("accessdenied");	
		}
	} else {
		res.writeHead(301,
				{Location: "/"}			
		);
		res.end();
	}
};

/**
 * Search user
 */
exports.searchMember = function(req, res){
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user !=null && user.role_name == "Admin") {
			var members;
			var membershipNum = req.body.membershipNo;
			var firstname= req.body.fname;
			var lastname= req.body.lname;
			var email=req.body.email;
			var city=req.body.city;
			var stateId=req.body.stateId;
			var memberTypeId=req.body.memberTypeId;
			if(memberTypeId == null) {
				memberTypeId = ""
			}
			var roleId= req.body.roleId;
			if(roleId == null) {
				roleId = ""
			}
			var zip1=req.body.zip1;
			var zip2=req.body.zip2;
			dbuser.selectRole(function(roles,error) {
				dbuser.selectMemberTypes(function(memberTypes,error) {
					dbuser.selectStates(function(states,error) {
						dbuser.selectUserBySearchCriteria(function(results, error) {
							members = results;
							for(var i in members) {
								if(members[i].role_name == "Admin") {
									members[i].member_type_name = "";
								}
							}
							res.render("listmember",{"userDet" : user,"members":members,"states":states,"memberTypes":memberTypes,"roles":roles});
						}, membershipNum, firstname, lastname, memberTypeId, email, city,stateId, zip1, zip2,roleId,user);
					});
				});
			});
		} else {
			res.render("accessdenied");	
		}
	} else {
		res.writeHead(301,
				{Location: "/"}			
		);
		res.end();
	}
};

/**
 * Display user
 */
exports.showMember = function(req,res) {
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user !=null && user.role_name == "Admin") {
			var memberId = req.params.id;
			dbuser.selectUserById(function(results,error) {
				var users = null;
				if(results != null && results.length > 0) {
					users = results[0];
					var videos = null;
					dbuser.selectCurrentlyIssuedMoviesByUser(function(results, error) {
						if(results != null && results.length >0){
							videos = results;							
						} 
						res.render("member",{"userDet":user,"member": users,"movies":videos});
					},memberId);
				}
			},memberId);
		} else {
			res.render("accessdenied");	
		}
	} else {
		res.writeHead(301,
				{Location: "/"}			
		);
		res.end();
	}
};

/**
 * Generate bill
 */
exports.generateBill = function(req,res) {
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user !=null && user.role_name == "Admin") {
			res.render("generatebill",{"userDet":user,"fetchResult": null,"member":null,"movies":null});
		} else {
			res.render("accessdenied");	
		}
	} else {
		res.writeHead(301,
				{Location: "/"}			
		);
		res.end();
	}		
};

/**
 * Submit button of generate bill
 */
exports.generateBillSubmit = function(req,res) {
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user !=null && user.role_name == "Admin") {
			var membershipNo = req.body.membershipNo;
			dbuser.selectUserByMembershipNo(function(results,error) {
				if(results != null && results.length > 0) {
					var users = results[0];
					//if(user.member_type == "S") {
						dbuser.selectCurrentlyIssuedMoviesByUser(function(results, error){
							var videos = null;
							if(results != null && results.length > 0 && results[0].movie_count != 0) {
								videos = results;
							}
							res.render("generatebill",{"userDet":user,"fetchResult": null,"member": users,"movies":videos});
						},users.membership_no);
					//} else {
					//	res.render("generatebill",{"userDet":user,"fetchResult": null,"member": user,"movies":null});
					//}
				} else {
					res.render("generatebill",{"userDet":user,"fetchResult": "Membership id not found.","member": null,"movies":null});
				}
			},membershipNo);
		} else {
			res.render("accessdenied");	
		}
	} else {
		res.writeHead(301,
				{Location: "/"}
		);
		res.end();
	}	
};

/**
 * First phase
 */
exports.submitMovie = function(req,res) {
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user !=null && user.role_name == "Admin") {
			
			res.render("submitmovie",{"userDet":user,"fetchResult": null});
		} else {
			res.render("accessdenied");	
		}
	} else {
		res.writeHead(301,
				{Location: "/"}			
		);
		res.end();
	}	
};

/**
 * Intermediate phase
 */
exports.submitMovieList = function(req,res) {
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user !=null && user.role_name == "Admin") {
			var membershipNo = req.body.membershipNo;
			if(membershipNo != null) {	
				var users = null;
				dbuser.selectUserByMembershipNo(function(results, error) {
					if(!error && results != null && results.length > 0 && results[0].role_name != "Admin") {
						users = results[0];
						// Fetch movies from database
						var videos = null;
							dbuser.selectCurrentlyIssuedMoviesByUser(function(results,error) {
								if(results != null && results.length > 0) {
									videos = results;
								}
								res.render('submitmovielist', {"userDet" : user,"videos": videos,"membershipNo":membershipNo,"checkoutError":null});
							},users.membership_no);
					} else {
						res.render('submitmovie',{"userDet" : user ,"fetchResult":"Member not recognized."});
					}
				},membershipNo);
			}
		} else {
			res.render("accessdenied");	
		}
	} else {
		res.writeHead(301,
				{Location: "/"}			
		);
		res.end();
	}	
};

/**
 * Last phase
 */
exports.submitMovieSelectSubmit = function(req,res) {
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user !=null && user.role_name == "Admin") {
			var membershipNo = req.body.membershipNo;
			var videoId = req.body.videoId;
			if(membershipNo != null && membershipNo != null) {
				dbuser.selectUserByMembershipNo(function(results,err){
				  var users = null;
					if(results != null && results.length > 0) {
						users = results[0];
						var userMovieMapping = null;
						dbuser.selectUserMovieMapping(function(results, error) {
							if(results != null && results.length > 0 ){
								userMovieMapping = results[0];
								dbuser.updateUserMovieMapping(function(results, error) {
								  	if(!error) {
										if(results.length !== 0) {
											var video = null;
											dbvideo.selectMovieById(function(results, error){
												video = results[0];
												// Increment available copies.
												video.available_copies += 1; 
												dbvideo.editMovieAvailableCopies(function(results, error) { 
													// Decrease outstanding movies on his name.
													/*user.outstanding_movies -= 1;	
													if(user.member_type == "S") {
														user.balance_amount -= movie.rent_amount;
													}
													dbuser.editUser(function(results, error) {
														console.log("Movie returned by user");
													*/	res.render('submitCheckout',{"userDet" : user,"movie":video,"member":users });
													/*},user);*/
												},video);
											},videoId);
										}
								  	} else {
							  		console.log(error);
								  	}
								}, userMovieMapping.id);
							}
						}, users.membership_no, videoId);
					}	
				},membershipNo);
			}			
		} else {
			res.render("accessdenied");	
		}
	} else {
		res.writeHead(301,
				{Location: "/"}			
		);
		res.end();
	}	
};


/**
 * User related operations.
 */

/**
 * Generate bill
 */
exports.usergenerateBill = function(req,res) {
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		var membershipNo = user.membershipNo;
		dbuser.selectUserByMembershipNo(function(results,error) {
			if(results != null && results.length > 0) {
				var users = results[0];
				//if(users.member_type == "S") {
					dbuser.selectCurrentlyIssuedMoviesByUser(function(results, error){
						var videos = null;
						if(results != null && results.length > 0 && results[0].movie_count != 0) {
							videos = results;
						}
						res.render("\\users\\usergeneratebill",{"userDet":user,"fetchResult": null,"member": users,"movies":videos});
					},users.membership_no);
				//} else {
				//	res.render("generatebill",{"userDet":user,"fetchResult": null,"member": user,"movies":null});
				//}
			} else {
				res.render("\\users\\usergeneratebill",{"userDet":user,"fetchResult": "Membership id not found.","member": null,"movies":null});
			}
		},membershipNo);
	} else {
		res.writeHead(301,
				{Location: "/"}
		);
		res.end();
	}	
};

/**
 * Display user
 */
exports.user = function(req,res) {
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user !=null) {
			var memberId = req.params.id;
			dbuser.selectUserById(function(results,error) {
				var users = null;
				if(results != null && results.length > 0) {
					users = results[0];
					var videos = null;
					dbuser.selectCurrentlyIssuedMoviesByUser(function(results, error) {
						if(results != null && results.length >0){
							videos = results;							
						} 
						res.render("\\users\\user",{"userDet":user,"member": users,"movies":videos});
					},memberId);
				}
			},memberId);
		} else {
			res.render("accessdenied");	
		}
	} else {
		res.writeHead(301,
				{Location: "/"}			
		);
		res.end();
	}
};

/**
 * Change password
 */
exports.changePassword = function(req, res) {
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user !=null) {
			res.render("\\users\\changepassword",{"userDet":user,"editResults":null});
		} else {
			res.render("accessdenied");	
		}
	} else {
		res.writeHead(301,
				{Location: "/"}			
		);
		res.end();
	}
}

/**
 * Submit button of change password
 */
exports.changePasswordSubmit = function(req, res) {
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user !=null) {
			var oldPassword = req.body.oldpwd;
			var newPassword1 = req.body.newpwd1;
			var newPassword2 = req.body.newpwd1;
			if(newPassword1 != newPassword2) {
				res.render("\\users\\changepassword",{"userDet":user,"editResults":"Passwords donot match."});
			} else {
				dbuser.selectUserByIdPassword(function(results, error) {
					if(!error && results != null && results.length > 0) {
						dbuser.editUserPassword(function(results, error){
							res.render("\\users\\changepassword",{"userDet":user,"editResults":"User's password changed successfully."});
						}, user.membershipNo, newPassword1);
					} else {
						res.render("\\users\\changepassword",{"userDet":user,"editResults":"Old password not correct."});
					}
				},user.membershipNo, oldPassword);
			}
		} else {
			res.render("accessdenied");	
		}
	} else {
		res.writeHead(301,
				{Location: "/"}			
		);
		res.end();
	}
}

/**
 * Edit user
 */
exports.usereditMember = function(req, res){
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		var users;
		var memberId = req.params.id;
		dbuser.selectMemberTypes(function(memberTypes,error) {
			dbuser.selectStates(function(states,error) {
				dbuser.selectUserById(function(results, error) {
					users = results[0];
					res.render("\\users\\usereditmember",{"userDet" : user,"member":users, "editedResults": null,"states":states,"memberTypes":memberTypes});
				},memberId);
			});
		});
	} else {
		res.writeHead(301,
				{Location: "/"}			
		);
		res.end();
	}
};

/**
 * Submit button of edit user
 */
exports.usereditMemberSubmit = function(req, res){
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		var users = [];
		dbuser.selectUserById(function(results, error) {
			users = results[0];
			users.first_name= req.body.fname;
			users.last_name= req.body.lname;
			users.member_type_id=req.body.memberTypeId;
			//users.email = req.body.email;
			users.line1 = req.body.address;
			users.line2 = req.body.address2;
			users.city = req.body.city;
			users.state_id= req.body.stateId;
			users.zip = req.body.zip1;
			users.zip_ext = req.body.zip2;
			users.city_code = req.body.citycode;
			users.area_code = req.body.areacode;
			users.number = req.body.phonenum;
			dbuser.selectMemberTypes(function(memberTypes,error) {
				dbuser.selectStates(function(states,error) {
					dbuser.selectUserByEmail(function(results,err) {
						if(err) {
							res.render("\\users\\usereditmember",{"userDet" : user,"member":users,"editedResults": "Error.","states":states,"memberTypes":memberTypes});
						} else {
							if(results.length > 0 & results[0].membership_no != req.body.memberId) {
								res.render("\\users\\usereditmember",{"userDet" : user,"member":users,"editedResults": "Email already exists.","states":states,"memberTypes":memberTypes});
							} else {
								dbuser.editUser(function(results, error) {
									res.render("\\users\\usereditmember",{"userDet" : user,"member":users,"editedResults": "User edited successfully.","states":states,"memberTypes":memberTypes});
								},users);
							}
						}
					}, req.body.email);
				});
			});
		},req.body.memberId);
	} else {
		res.writeHead(301,
				{Location: "/"}			
		);
		res.end();
	}
};

/**
 * Random user number generation
 * @param min
 * @param max
 * @returns random number
 */
function randomNoGenerator(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
