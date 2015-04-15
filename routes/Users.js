var Userdb = require('../util/Userdb');
var Moviedb = require('../util/Moviedb');

/*
 * GET users listing.
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

exports.signOut = function(req, res) {
	if(req.session.userdetails != null || req.session.userdetails != "") {
		req.session.userdetails = "";
	} 
	res.writeHead(301,
			{Location: "/"}			
	);
	res.end();
};

exports.createmember = function(req, res){
	if(req.session.userdetails != null && req.session.userdetails != "") {		
		var user = JSON.parse(req.session.userdetails);
		if(user !=null && user.role_name == "Admin") {
			Userdb.selectRole(function(roles,error) {
				Userdb.selectMemberTypes(function(memberTypes,error) {
					Userdb.selectStates(function(states,error) {
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


exports.createMemberSubmit = function(req,res) {
		var user = JSON.parse(req.session.userdetails);
		if(user !=null && user.role_name == "Admin"){
			//var user = [];
			var userInfo= [];
			Userdb.selectRole(function(roles,error) {
				Userdb.selectMemberTypes(function(memberTypes,error) {
					Userdb.selectStates(function(states,error) {
						Userdb.selectUserByEmail(function(results,err)
								{
							if(err)
							{
								console.log("email err");
								console.log(err);
								res.render("createmember",{"userDet" : user,"insertedresults":"Email query problem","roles":roles,"memberTypes":memberTypes,"states":states});
							}else
							{
								if(results.length>0)
								{
									console.log("email query result :" + results);
									res.render("createmember",{userDet : user,"insertedresults":"MEMBER EMAIL EXISTS!! ","roles":roles,"memberTypes":memberTypes,"states":states});
								}
								else
								{
									var member = [];
									var membershipNum = randomNoGenerator(100000000, 999999999);//getrandomMembershipId();
									member.membershipNo = membershipNum;
									member.password = req.body.password;
									member.firstname= req.body.firstname;
									member.lastname= req.body.lastname;
									member.issuedMovies=0;
									member.outstandingMovies=0;
									member.memberTypeId=req.body.memberTypeId;
									member.balanceAmount=0;
									member.roleId=req.body.role;
									member.email = req.body.email;
									member.areacode = req.body.areacode;
									member.citycode = req.body.citycode;
									member.phonenum = req.body.phonenum;
									member.line1 = req.body.address;
									member.line2 = req.body.address2;
									member.city = req.body.city;
									member.stateId = req.body.stateId;
									member.zip = req.body.zip1;
									member.zipext = req.body.zip2;
									member.roleId = req.body.roleId;
									if(member.zipext == "") {
										member.zipext = 0;
									}
									
									if(member.memberTypeId == 2) {
										member.balanceAmount = 25;
									}
									Userdb.insertUser(function(insertSucessfullFlag)
											{
										if(!insertSucessfullFlag)
										{
											console.log("InsertUser Failed");
										}
										else
										{
											console.log("Insert:"+insertSucessfullFlag);
		
											res.render("createmember",{"userDet" : user,"insertedresults":"User details inserted with membership no."+membershipNum,"roles": roles,"memberTypes":memberTypes,"states":states});
		
										}
											},member);
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

// User register
exports.usercreatemember = function(req, res){
	Userdb.selectMemberTypes(function(memberTypes,error) {
		Userdb.selectStates(function(states,error) {
			res.render("\\users\\usercreatemember",{"insertedresults":null, "states":states, "memberTypes":memberTypes});
		});
	});
};


exports.userCreateMemberSubmit = function(req,res)
{
	Userdb.selectMemberTypes(function(memberTypes,error) {
		Userdb.selectStates(function(states,error) {
			Userdb.selectUserByEmail(function(results,err)
					{
				if(err)
				{
					console.log("email err");
					console.log(err);
					res.render("\\users\\usercreatemember",{"insertedresults":"Email query problem","memberTypes":memberTypes,"states":states});
				}else
				{
					if(results.length>0)
					{
						console.log("email query result :" + results);
						res.render("\\users\\usercreatemember",{"insertedresults":"MEMBER EMAIL EXISTS!! ","memberTypes":memberTypes,"states":states});
					}
					else
					{
						var member = [];
						var membershipNum = randomNoGenerator(100000000, 999999999);//getrandomMembershipId();
						member.membershipNo = membershipNum;
						member.password = req.body.password;
						member.firstname= req.body.firstname;
						member.lastname= req.body.lastname;
						member.issuedMovies=0;
						member.outstandingMovies=0;
						member.memberTypeId=req.body.memberTypeId;
						member.balanceAmount=0;
						member.roleId=req.body.role;
						member.email = req.body.email;
						member.areacode = req.body.areacode;
						member.citycode = req.body.citycode;
						member.phonenum = req.body.phonenum;
						member.line1 = req.body.address;
						member.line2 = req.body.address2;
						member.city = req.body.city;
						member.stateId = req.body.stateId;
						member.zip = req.body.zip1;
						member.zipext = req.body.zip2;
						member.roleId = 2;
						if(member.zipext == "") {
							member.zipext = 0;
						}
						
						if(member.memberTypeId == "2") {
							member.balanceAmount = 25;
						}
						Userdb.insertUser(function(insertSucessfullFlag)
								{
							if(!insertSucessfullFlag)
							{
								console.log("InsertUser Failed");
							}
							else
							{
								console.log("Insert:"+insertSucessfullFlag);
	
								res.render("\\users\\usercreatemember",{"insertedresults":"User details inserted with membership no."+membershipNum,"memberTypes": memberTypes,"states":states});
	
							}
								},member);
					}
				}
					},req.body.email);
		});
	});
	
};

exports.index = function(req, res) {
	if(req.session.userdetails != null && req.session.userdetails != "") {
		var user = JSON.parse(req.session.userdetails);
		if(user !=null && user.role_name == "Admin") {
			res.render('index', {userDet : user});
		} else {
			res.render('\\users\\userindex', {"userDet": user});
		}

	} else {
		res.writeHead(301,
				{Location: "/login"}
		);
		res.end();
	}
};


exports.validateLogin = function(req, res){
	//console.log(req.session);
	if(req.session.userdetails == null || req.session.userdetails == "") {	
		//res.send("respond with a resource");
		console.log("inside Validate Login");
		if(!req.body.hasOwnProperty('membershipNo') ||!req.body.hasOwnProperty('password')) {
			res.statusCode = 400;
			return res.send('Error 400: Post syntax incorrect.');
		}

		Userdb.validateLogin(function(err,results){
			if(err){
				/*console.log(err);
				res.render('login');*/
				req.session.error = "Invalid credentials.";
				res.writeHead(301,
						{Location: "/login"}
				);
				res.end();
			}else if(results.length > 0) {
				//console.log("query result fetched");
				req.session.userdetails = JSON.stringify({membershipNo : results[0].membership_no, firstname :  results[0].first_name, lastname : results[0].last_name, memberTypes : results[0].member_type, email: results[0].email,role: results[0].role_id, role_name: results[0].role_name});
				//console.log(req.session.userdetails);
				if(results[0].role_name == "Admin")
				{
					console.log("admin LOGIN");
					res.render('index',{userDet : results[0]},function(err, result) {
			// render on success
			if (!err) {
				res.end(result);
			}
			// render or error
			else {
				res.end('An error occurred');
				console.log(err);

			}
		});
			/*		res.writeHead(301,
							{Location: "/"}			
					);
					res.end();*/
				}
				else {
					console.log("USER LOGIN");
					res.writeHead(301,
							{Location: "/"}			
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


exports.listMember = function(req, res){
	console.log("Listmember.");
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		console.log(user);
		if(user !=null && user.role_name == "Admin") {
			Userdb.selectRole(function(roles,error) {
				Userdb.selectMemberTypes(function(memberTypes,error) {
					Userdb.selectStates(function(states,error) {
						Userdb.selectUsers(function(members, error) {
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


exports.editMember = function(req, res){
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user !=null && user.role_name == "Admin") {
			var member;
			var memberId = req.params.id;
			Userdb.selectRole(function(roles,error) {
				Userdb.selectMemberTypes(function(memberTypes,error) {
					Userdb.selectStates(function(states,error) {
						Userdb.selectUserById(function(results, error) {
							member = results[0];
							console.log("Edit Results:"+memberId);
							res.render("editmember",{"userDet" : user,"member":member, "editedResults": null,"states":states,"roles":roles,"memberTypes":memberTypes});
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

exports.editMemberSubmit = function(req, res){
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		
		if(user !=null && user.role_name == "Admin") {
			var member = [];
			
			Userdb.selectUserById(function(results, error) {
				console.log("Edit Member Submit");
				console.log("Membership No:"+req.body.memberId);
				console.log(results);
				member = results[0];
				member.first_name= req.body.fname;
				member.last_name= req.body.lname;
				member.member_type_id=req.body.memberTypeId;
				member.email = req.body.email;
				member.line1 = req.body.address;
				member.line2 = req.body.address2;
				member.city = req.body.city;
				member.state_id= req.body.stateId;
				member.zip = req.body.zip1;
				member.zip_ext = req.body.zip2;
				member.city_code = req.body.citycode;
				member.area_code = req.body.areacode;
				member.number = req.body.phonenum;
				member.role_id = req.body.roleId;
				Userdb.selectRole(function(roles,error) {
					Userdb.selectMemberTypes(function(memberTypes,error) {
						Userdb.selectStates(function(states,error) {
							Userdb.editUser(function(results, error) {
								console.log("Edit User Callback");
								res.render("editmember",{"userDet" : user,"member":member,"editedResults": "User edited successfully.","states":states,"roles":roles,"memberTypes":memberTypes});
							},member);
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

exports.deleteMember = function(req, res){
	console.log("Delete Member");
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user !=null && user.role_name == "Admin") {
			var memberId = req.params.id;
			console.log("MemberId:"+memberId);
			Userdb.deleteUser(function(results, error) {
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
			Userdb.selectRole(function(roles,error) {
				Userdb.selectMemberTypes(function(memberTypes,error) {
					Userdb.selectStates(function(states,error) {
						Userdb.selectUserBySearchCriteria(function(results, error) {
							members = results;
							for(var i in members) {
								if(members[i].role_name == "Admin") {
									members[i].member_type_name = "";
								}
							}
							//console.log(members);
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


exports.showMember = function(req,res) {
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user !=null && user.role_name == "Admin") {
			var memberId = req.params.id;
			Userdb.selectUserById(function(results,error) {
				var member = null;
				if(results != null && results.length > 0) {
					member = results[0];
					var videos = null;
					Userdb.selectCurrentlyIssuedMoviesByUser(function(results, error) {
						if(results != null && results.length >0){
							videos = results;							
						} 
						res.render("member",{"userDet":user,"member": member,"movies":videos});
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

exports.generateBillSubmit = function(req,res) {
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user !=null && user.role_name == "Admin") {
			var membershipNo = req.body.membershipNo;
			Userdb.selectUserByMembershipNo(function(results,error) {
				if(results != null && results.length > 0) {
					var member = results[0];
					//if(member.member_type == "S") {
						Userdb.selectCurrentlyIssuedMoviesByUser(function(results, error){
							var videos = null;
							console.log(results);
							if(results != null && results.length > 0 && results[0].movie_count != 0) {
								videos = results;
							}
							console.log(videos);
							res.render("generatebill",{"userDet":user,"fetchResult": null,"member": member,"movies":videos});
						},member.membership_no);
					//} else {
					//	res.render("generatebill",{"userDet":user,"fetchResult": null,"member": member,"movies":null});
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
			console.log(membershipNo);
			if(membershipNo != null) {	
				var member = null;
				Userdb.selectUserByMembershipNo(function(results, error) {
					if(!error && results != null && results.length > 0 && results[0].role_name != "Admin") {
						member = results[0];
						// Fetch movies from database
						var videos = null;
							Userdb.selectCurrentlyIssuedMoviesByUser(function(results,error) {
								if(results != null && results.length > 0) {
									videos = results;
								}
								console.log("Videos issued:");
								console.log(videos);
								//res.render('listmovie', { "user":user, "movies": movies});
								res.render('submitmovielist', {"userDet" : user,"videos": videos,"membershipNo":membershipNo,"checkoutError":null});
							},member.membership_no);
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
			//console.log("taking from reuest object: " + req.body.moviemappingId);
			//var userMovieId = req.body.moviemappingId;
			//console.log("user movie id"+userMovieId);
			var videoId = req.body.videoId;
			if(membershipNo != null && membershipNo != null) {
				  Userdb.selectUserByMembershipNo(function(results,err){
					   console.log(membershipNo);
						
						var member = null;
						if(results != null && results.length > 0) {
							member = results[0];
							var userMovieMapping = null;
							Userdb.selectUserMovieMapping(function(results, error) {
								if(results != null && results.length > 0 ){
									userMovieMapping = results[0];
									Userdb.updateUserMovieMapping(function(results, error) {
									  	if(!error) {
										console.log(results);
											if(results.length !== 0) {
												var video = null;
												Moviedb.selectMovieById(function(results, error){
													video = results[0];
													// Increment available copies.
													video.available_copies += 1; 
													Moviedb.editMovieAvailableCopies(function(results, error) { 
														// Decrease outstanding movies on his name.
														/*member.outstanding_movies -= 1;	
														if(member.member_type == "S") {
															member.balance_amount -= movie.rent_amount;
														}
														Userdb.editUser(function(results, error) {
															console.log("Movie returned by user");
														*/	res.render('submitCheckout',{"userDet" : user,"movie":video,"member":member });
														/*},member);*/
													},video);
												},videoId);
											}
									  	} else {
											console.log(error);
										}
									}, userMovieMapping.id);
								}
							}, member.membership_no, videoId);
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

exports.usergenerateBill = function(req,res) {
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
			var membershipNo = user.membershipNo;
			Userdb.selectUserByMembershipNo(function(results,error) {
				if(results != null && results.length > 0) {
					var member = results[0];
					//if(member.member_type == "S") {
						Userdb.selectCurrentlyIssuedMoviesByUser(function(results, error){
							var videos = null;
							console.log(results);
							if(results != null && results.length > 0 && results[0].movie_count != 0) {
								videos = results;
							}
							console.log(videos);
							res.render("\\users\\usergeneratebill",{"userDet":user,"fetchResult": null,"member": member,"movies":videos});
						},member.membership_no);
					//} else {
					//	res.render("generatebill",{"userDet":user,"fetchResult": null,"member": member,"movies":null});
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

exports.user = function(req,res) {
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user !=null) {
			var memberId = req.params.id;
			Userdb.selectUserById(function(results,error) {
				var member = null;
				if(results != null && results.length > 0) {
					member = results[0];
					var videos = null;
					Userdb.selectCurrentlyIssuedMoviesByUser(function(results, error) {
						if(results != null && results.length >0){
							videos = results;							
						} 
						res.render("\\users\\user",{"userDet":user,"member": member,"movies":videos});
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

exports.changePasswordSubmit = function(req, res) {
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		console.log("ChangePassword");
		console.log(user);
		if(user !=null) {
			var oldPassword = req.body.oldpwd;
			var newPassword1 = req.body.newpwd1;
			var newPassword2 = req.body.newpwd1;
			
			if(newPassword1 != newPassword2) {
				res.render("\\users\\changepassword",{"userDet":user,"editResults":"Passwords donot match."});
			} else {
				Userdb.selectUserByIdPassword(function(results, error) {
					if(!error && results != null && results.length > 0) {
						Userdb.editUserPassword(function(results, error){
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

function randomNoGenerator(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getrandomMembershipId()
{
	var randomNo = randomNoGenerator(100000000, 999999999);
	console.log("Random Mem ID: " + randomNo);
	Userdb.selectUserByMembershipNo(function(results,err){
		if(err){
			console.log("Err getting userbyMEMNO" + err);
		}
		else
		{
			if(results.length>0)//(results[0].MEMBERSHIP_NO==randomNo)
			{
				console.log("Membership no found : " + results);
				getrandomMembershipId();
			}
			else
				return randomNo;
		}

	}, randomNo);

}
