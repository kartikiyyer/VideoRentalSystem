var Userdb = require('../util/Userdb');
var lookUp = require('../util/LookUp');
var Moviedb = require('../util/Moviedb');

/*
 * GET users listing.
 */

exports.login = function(req, res){
	//console.log("hi");
	//res.send("respond with a resource");
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
		req.session.userdetails = null;
	} 
	res.writeHead(301,
			{Location: "/"}			
	);
	res.end();
};

exports.createmember = function(req, res){
	//console.log("hi create");
	if(req.session.userdetails != null && req.session.userdetails != "") {		
		var user = JSON.parse(req.session.userdetails);
		if(user !=null && user.roleName == "ADMIN") {
			Userdb.selectRole(function(results,error) {
				res.render("createmember",{"userDet" : user,"insertedresults":null, "roles": results,"states":lookUp.getStates()});	
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


exports.createMemberSubmit = function(req,res) 
{
	if(req.session.userdetails != null && req.session.userdetails != "") {
		var user = JSON.parse(req.session.userdetails);
		if(user !=null && user.roleName == "ADMIN") {
			//var user = [];
			var userInfo= [];
			var userId;
			var roles;
			Userdb.selectRole(function(results,error) {
				roles = results;
				Userdb.selectUserByEmail(function(results,err)
						{
					if(err)
					{
						console.log("email err");
						console.log(err);
						res.render("createmember",{"userDet" : user,"insertedresults":"Email query problem","roles":roles,"states":lookUp.getStates()});
					}else
					{
						if(results.length>0)
						{
							console.log("email query result :" + results);
							res.render("createmember",{userDet : user,"insertedresults":"MEMBER EMAIL EXISTS!! ","roles":roles,"states":lookUp.getStates()});
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
							member.memberType=req.body.memberType;
							member.balanceAmount=0;
							member.roleId=req.body.role;
							member.email = req.body.email;
							member.address = req.body.address;
							member.address2 = req.body.address2;
							member.city = req.body.city;
							member.state = req.body.state;
							member.zip = req.body.zip1;
							member.zipext = req.body.zip2;
							if(member.zipext == "") {
								member.zipext = 0;
							}
							// In case of premium member we need to set the balance amount to monthly subscription.
							if(member.memberType == "P") {
								member.balanceAmount = 25;
							}
							Userdb.insertUser(function(results,err)
									{
								if(err)
								{
									console.log(err);
								}
								else
								{


									res.render("createmember",{"userDet" : user,"insertedresults":"User details inserted with membership no."+membershipNum,"roles": roles,"states":lookUp.getStates()});


								}
									},member);
						}
					}
						},req.body.email);
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

exports.index = function(req, res) {
	if(req.session.userdetails != null && req.session.userdetails != "") {
		var user = JSON.parse(req.session.userdetails);
		if(user !=null && user.roleName == "ADMIN") {
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
				req.session.userdetails = JSON.stringify({userId : results[0].user_id, membershipNo : results[0].membership_no, firstname :  results[0].firstname, lastname : results[0].lastname, issuedMovies : results[0].issued_movies, outstandingMovies : results[0].outstanding_movies, memberTypes : results[0].member_types, balanceAmount : results[0].balance_amount, roleId : results[0].role_id,  roleName : results[0].role_name});
				//console.log(req.session.userdetails);
				if(results[0].role_name == "ADMIN")
				{
					console.log("ADMIN LOGIN");
					/*res.render('index',
				{userDet : results[0]},
				function(err, result) {
			// render on success
			if (!err) {
				res.end(result);
			}
			// render or error
			else {
				res.end('An error occurred');
				console.log(err);

			}		

		});*/
					res.writeHead(301,
							{Location: "/"}			
					);
					res.end();
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
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user !=null && user.roleName == "ADMIN") {
			var members;
			Userdb.selectUsers(function(results, error) {
				members = results;
				//console.log(members);
				res.render("listmember",{"userDet" : user,"members":members,"states":lookUp.getStates()});
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
		if(user !=null && user.roleName == "ADMIN") {
			var member;
			var memberId = req.params.id;
			Userdb.selectUserById(function(results, error) {
				member = results[0];
				//console.log(member);
				res.render("editmember",{"userDet" : user,"member":member, "editedResults": null,"states":lookUp.getStates()});
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

exports.editMemberSubmit = function(req, res){
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user !=null && user.roleName == "ADMIN") {
			var member = [];
			
			Userdb.selectUserById(function(results, error) {
				member = results[0];
				member.firstname= req.body.fname;
				member.lastname= req.body.lname;
				member.member_type=req.body.memType;
				member.email = req.body.email;
				member.address = req.body.address;
				member.address2 = req.body.address2;
				member.city = req.body.city;
				member.state = req.body.state;
				member.zip = req.body.zip1;
				member.zipext = req.body.zip2;
				
				Userdb.editUser(function(results, error) {
					res.render("editmember",{"userDet" : user,"member":member,"editedResults": "User edited successfully.","states":lookUp.getStates()});
				},member);
			},req.body.userId);
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
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user !=null && user.roleName == "ADMIN") {
			var memberId = req.params.id;
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
		if(user !=null && user.roleName == "ADMIN") {
			var members;
			var membershipNum = req.body.membershipNo;
			var firstname= req.body.fname;
			var lastname= req.body.lname;
			var email=req.body.email;
			var city=req.body.city;
			var state=req.body.state;
			var memberType=req.body.memType;
			if(memberType == null) {
				memberType = ""
			}
			var zip1=req.body.zip1;
			var zip2=req.body.zip2;

			Userdb.selectUserBySearchCriteria(function(results, error) {
				members = results;
				//console.log(members);
				res.render("listmember",{"userDet" : user,"members":members,"states":lookUp.getStates()});
			}, membershipNum, firstname, lastname, memberType, email, city,state, zip1, zip2);
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
		if(user !=null && user.roleName == "ADMIN") {
			var memberId = req.params.id;
			Userdb.selectUserById(function(results,error) {
				var member = null;
				if(results != null && results.length > 0) {
					member = results[0];
					var movies = null;
					Userdb.selectCurrentlyIssuedMoviesByUser(function(results, error) {
						if(results != null && results.length >0){
							movies = results;							
						} 
						res.render("member",{"userDet":user,"member": member,"movies":movies});
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
		if(user !=null && user.roleName == "ADMIN") {
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
		if(user !=null && user.roleName == "ADMIN") {
			var membershipNo = req.body.membershipNo;
			Userdb.selectUserByMembershipNo(function(results,error) {
				if(results != null && results.length > 0) {
					var member = results[0];
					//if(member.member_type == "S") {
						Userdb.selectCurrentlyIssuedMoviesByUser(function(results, error){
							var movies = null;
							console.log(results);
							if(results != null && results.length > 0 && results[0].movie_count != 0) {
								movies = results;
							}
							console.log(movies);
							res.render("generatebill",{"userDet":user,"fetchResult": null,"member": member,"movies":movies});
						},member.user_id);
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
		if(user !=null && user.roleName == "ADMIN") {
			
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
		if(user !=null && user.roleName == "ADMIN") {
			
			var membershipNo = req.body.membershipNo;
			console.log(membershipNo);
			if(membershipNo != null) {	
				var member = null;
				Userdb.selectUserByMembershipNo(function(results, error) {
					if(!error && results != null && results.length > 0 && results[0].user_id != 1) {
						member = results[0];
						// Fetch movies from database
						var movies = null;
						if(member.outstanding_movies > 0) {
							Userdb.selectCurrentlyIssuedMoviesByUser(function(results,error) {
								if(results != null && results.length > 0) {
									movies = results;
								}
								console.log("Movies issued:");
								console.log(movies);
								//res.render('listmovie', { "user":user, "movies": movies});
								res.render('submitmovielist', {"userDet" : user,"movies": movies,"membershipNo":membershipNo,"checkoutError":null});
							},member.user_id);
						} else {
							res.render('submitmovielist', {"userDet" : user,"movies": movies,"membershipNo":membershipNo,"checkoutError":"This user has no outstanding movies."});
						}
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
		if(user !=null && user.roleName == "ADMIN") {
			var membershipNo = req.body.membershipNo;
			//console.log("taking from reuest object: " + req.body.moviemappingId);
			//var userMovieId = req.body.moviemappingId;
			//console.log("user movie id"+userMovieId);
			var movieId = req.body.movieId;
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
												var movie = null;
												Moviedb.selectMovieById(function(results, error){
													movie = results[0];
													// Increment available copies.
													movie.available_copies += 1; 
													Moviedb.editMovie(function(results, error) { 
														// Decrease outstanding movies on his name.
														member.outstanding_movies -= 1;	
														if(member.member_type == "S") {
															member.balance_amount -= movie.rent_amount;
														}
														Userdb.editUser(function(results, error) {
															console.log("Movie returned by user");
															res.render('submitCheckout',{"userDet" : user,"movie":movie,"member":member });
														},member);
													},movie);
												},movieId);
											}
										} else {
											console.log(error);
										}
									  	
									}, userMovieMapping.user_movie_id);
								}
							}, member.user_id, movieId);								
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



exports.user = function(req,res) {
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user !=null) {
			var memberId = req.params.id;
			Userdb.selectUserById(function(results,error) {
				var member = null;
				if(results != null && results.length > 0) {
					member = results[0];
					var movies = null;
					Userdb.selectCurrentlyIssuedMoviesByUser(function(results, error) {
						if(results != null && results.length >0){
							movies = results;							
						} 
						res.render("\\users\\user",{"userDet":user,"member": member,"movies":movies});
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
						}, user.userId, newPassword1);
					} else {
						res.render("\\users\\changepassword",{"userDet":user,"editResults":"Old password not correct."});
					}
				},user.userId, oldPassword);
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
