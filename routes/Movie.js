/**
 * New node file
 */
var moviedb = require('../util/Moviedb');
var userdb = require("../util/Userdb");
function testMoviedb() {

	var movieDetails = [];

	movieDetails.movieName = "Update";
	movieDetails.movieBanner = "Update";
	movieDetails.rentAmount = "10.01";
	movieDetails.releaseDate = "2011";
	movieDetails.availableCopies = "4";
	movieDetails.category = "Test";
	movieDetails.movieId = "85546";


	//moviedb.insertMovie(movieDetails);

	//moviedb.editMovie(movieDetails);

	moviedb.selectMovieById(function(results, error) {
		//console.log(results);
	},85546);

	//moviedb.selectMovieBySearchCriteria(function(results, error) {
	//		console.log(results);
	//},"","","","0","5",false);
	//moviedb.deleteMovie(85545);

}

//testMoviedb();

/**
 * List all movies
 */
exports.listMovie = function(req,res) {
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user !=null && user.roleName == "ADMIN") {
			var movies = null;
			var categories = [];
			var releaseDates = [];
			// TODO: Fetch information of user

			// Fetch categories from database
			moviedb.selectCategories(function(results,error) {
				var category = [];
				var count = 0;
				for(var i=0 ;i<results.length;i++) {
					category = results[i].category.split(",");
					for(var j=0;j<category.length;j++) {
						var cat = category[j].trim();
						if(categories.indexOf(cat) == -1) {
							categories[count++] = cat; 
						}
					}
				}
				categories = categories.sort();
				// Fetch movies from database
				moviedb.selectReleaseDate(function(results,error) {
					/*for(var i=0 ;i<results.length;i++) {
						movies[i] = results[i];
					}*/
					releaseDates = results;

					// Fetch movies from database
					moviedb.selectMovies(function(results,error) {
						/*for(var i=0 ;i<results.length;i++) {
							movies[i] = results[i];
						}*/
						movies = results;

						//res.render('listmovie', { "user":user, "movies": movies});
						res.render('listmovie', {"userDet" : user,"movies": movies, "categories":categories, "releaseDates": releaseDates});
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
}


exports.showMovie = function(req,res) {
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user !=null && user.roleName == "ADMIN") {
			var movieId = req.params.id;
			var movie = null;
			var users = null;
			moviedb.selectMovieById(function(results,error){
				movie = results[0];
				moviedb.selectUsersCurrentlyIssuedMovie(function(results, error) {
					if(results != null && results.length > 0) {
						users = results;
					}
					res.render('movie', {"userDet" : user,"movie": movie,"users":users});
				}, movieId);				
			}, movieId);
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
 * List all movies
 */
exports.searchMovie = function(req,res) {
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user !=null && user.roleName == "ADMIN") {
			var mname = req.body.mname;
			var banner = req.body.banner;
			var releasedate = req.body.releasedate;
			var rentamountmin = req.body.rentamountmin;
			var rentamountmax = req.body.rentamountmax;
			var category = req.body.category;
			var isAvaliable = req.body.isAvailable;

			var movies = null;
			var categories = [];
			var releaseDates = [];
			// TODO: Fetch information of user

			// Fetch categories from database
			moviedb.selectCategories(function(results,error) {
				var categoryList = [];
				var count = 0;
				for(var i=0 ;i<results.length;i++) {
					categoryList = results[i].category.split(",");
					for(var j=0;j<categoryList.length;j++) {
						var cat = categoryList[j].trim();
						if(categories.indexOf(cat) == -1) {
							categories[count++] = cat; 
						}
					}
				}
				categories = categories.sort();
				// Fetch movies from database
				moviedb.selectReleaseDate(function(results,error) {
					/*for(var i=0 ;i<results.length;i++) {
						movies[i] = results[i];
					}*/
					releaseDates = results;

					// Fetch movies from database
					moviedb.selectMovieBySearchCriteria(function(results,error) {
						/*for(var i=0 ;i<results.length;i++) {
							movies[i] = results[i];
						}*/
						movies = results;
						//res.render('listmovie', { "user":user, "movies": movies});
						res.render('listmovie', {"userDet" : user,"movies": movies, "categories":categories, "releaseDates": releaseDates});
					}, mname, banner, releasedate, category, rentamountmin, rentamountmax, isAvaliable);
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
}

exports.createmovie = function(req, res){
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user !=null && user.roleName == "ADMIN") {
			var categories = [];

			// Fetch categories from database
			moviedb.selectCategories(function(results,error) {
				var categoryList = [];
				var count = 0;
				for(var i=0 ;i<results.length;i++) {
					categoryList = results[i].category.split(",");
					for(var j=0;j<categoryList.length;j++) {
						var cat = categoryList[j].trim();
						if(categories.indexOf(cat) == -1) {
							categories[count++] = cat; 
						}
					}
				}
				categories = categories.sort();
				res.render("createmovie",{"userDet" : user,"insertedresults":null,"categories":categories});
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


exports.createMovieSubmit = function(req,res) {
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user !=null && user.roleName == "ADMIN") {
			var movieDetails = [];
			movieDetails.movieName = req.body.mname;
			movieDetails.movieBanner = req.body.banner;
			movieDetails.rentAmount = req.body.rentamount;
			movieDetails.releaseDate = req.body.releasedate;
			movieDetails.availableCopies = req.body.copies;
			movieDetails.category = req.body.category;
			//moviedb.insertMovie(movieDetails);

			var categories = [];						
			// Fetch categories from database
			moviedb.selectCategories(function(results,error) {
				var categoryList = [];
				var count = 0;
				for(var i=0 ;i<results.length;i++) {
					categoryList = results[i].category.split(",");
					for(var j=0;j<categoryList.length;j++) {
						var cat = categoryList[j].trim();
						if(categories.indexOf(cat) == -1) {
							categories[count++] = cat; 
						}
					}
				}
				categories = categories.sort();
				moviedb.selectMovieBySearchCriteria(function(results, error){	
					//console.log(results);
					if(results == null || results.length == 0) {				
						moviedb.insertMovie(function(results, error) {
							res.render("createmovie",{"userDet" : user,"insertedresults":"Movie inserted successfully.","categories":categories});
						},movieDetails);
					} else {
						res.render("createmovie",{"userDet" : user,"insertedresults":"Duplicate movie name.","categories":categories});
					}
				},movieDetails.movieName);
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
}


exports.editMovie = function(req,res) {
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user !=null && user.roleName == "ADMIN") {
			var categories = [];
			var movieId = req.params.id;
			//console.log(movieId);
			// Fetch categories from database
			moviedb.selectCategories(function(results,error) {
				var categoryList = [];
				var count = 0;
				for(var i=0 ;i<results.length;i++) {
					categoryList = results[i].category.split(",");
					for(var j=0;j<categoryList.length;j++) {
						var cat = categoryList[j].trim();
						if(categories.indexOf(cat) == -1) {
							categories[count++] = cat; 
						}
					}
				}
				categories = categories.sort();

				// Fetch movies from database
				moviedb.selectMovieById(function(results,error) {
					res.render("editmovie",{"userDet" : user,"editedresults":null,"categories":categories, "movie":results[0]});
				},movieId);
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
}

exports.editMovieSubmit = function(req,res) {
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user !=null && user.roleName == "ADMIN") {
			var movieDetails = [];
			movieDetails.movie_id = req.body.movieId;
			movieDetails.movie_name = req.body.mname;
			movieDetails.movie_banner = req.body.banner;
			movieDetails.rent_amount = req.body.rentamount;
			movieDetails.release_date = req.body.releasedate;
			movieDetails.available_copies = req.body.copies;
			movieDetails.category = req.body.category;
			//moviedb.insertMovie(movieDetails);
			var categories = [];
			//console.log(movieId);
			// Fetch categories from database
			moviedb.selectCategories(function(results,error) {
				var categoryList = [];
				var count = 0;
				for(var i=0 ;i<results.length;i++) {
					categoryList = results[i].category.split(",");
					for(var j=0;j<categoryList.length;j++) {
						var cat = categoryList[j].trim();
						if(categories.indexOf(cat) == -1) {
							categories[count++] = cat; 
						}
					}
				}
				categories = categories.sort();	
				moviedb.editMovie(function(results, error) {
					if(error== null && results != null) {
						// Fetch movies from database
						moviedb.selectMovieById(function(results,error) {
							res.render("editmovie",{"userDet" : user,"editedresults":"Movie edited successfully","categories":categories, "movie":results[0]});
						},movieDetails.movie_id);
					} else {
						moviedb.selectMovieById(function(results,error) {
							res.render("editmovie",{"userDet" : user,"editedresults":"Movie not edited","categories":categories, "movie":results[0]});
						},movieDetails.movie_id);
					}
				},movieDetails);
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
}

exports.deleteMovie = function(req,res) {
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user !=null && user.roleName == "ADMIN") {
			var movieId = req.params.id;
			moviedb.deleteMovie(function(results, error) {
				res.writeHead(301,
						{Location: "/listmovie"}			
				);
				res.end();
			},movieId);
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

exports.issueMovieSubmit =function(req,res){
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user !=null && user.roleName == "ADMIN") {
			
			//var movies = null;
			var categories = [];
			var releaseDates = [];
			// TODO: Fetch information of user
			var membershipNo = req.body.membershipNo;
			console.log(membershipNo);
			if(membershipNo != null) {
				
				userdb.selectUserByMembershipNo(function(results, error){
					if(!error && results != null && results.length > 0 && results[0].user_id != 1) {
						// Fetch categories from database
						moviedb.selectCategories(function(results,error) {
							var category = [];
							var count = 0;
							for(var i=0 ;i<results.length;i++) {
								category = results[i].category.split(",");
								for(var j=0;j<category.length;j++) {
									var cat = category[j].trim();
									if(categories.indexOf(cat) == -1) {
										categories[count++] = cat; 
									}
								}
							}
							categories = categories.sort();
							// Fetch movies from database
							moviedb.selectReleaseDate(function(results,error) {
								/*for(var i=0 ;i<results.length;i++) {
									movies[i] = results[i];
								}*/
								releaseDates = results;
			
								// Fetch movies from database
							/*	moviedb.selectMovies(function(results,error) {
									for(var i=0 ;i<results.length;i++) {
										movies[i] = results[i];
									}
									movies = results;*/
			
									//res.render('listmovie', { "user":user, "movies": movies});
									res.render('issuemovielist', {"userDet" : user,"movies": null, "categories":categories, "releaseDates": releaseDates,"membershipNo":membershipNo,"checkoutError":null});
						//		});
							});
						});	
					} else {
						res.render('issuemovie',{"userDet" : user ,"fetchResult":"Member not recognized."});
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

exports.issueSearchMovie = function(req,res) {
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user !=null && user.roleName == "ADMIN") {
			var mname = req.body.mname;
			var banner = req.body.banner;
			var releasedate = req.body.releasedate;
			var rentamountmin = req.body.rentamountmin;
			var rentamountmax = req.body.rentamountmax;
			var category = req.body.category;
			var isAvaliable = req.body.isAvailable;
			var movies = null;
			var categories = [];
			var releaseDates = [];
			// TODO: Fetch information of user
			
			var membershipNo = req.body.membershipNo;
			console.log(membershipNo);
			if(membershipNo != null) {
				// Fetch categories from database
				moviedb.selectCategories(function(results,error) {
					var categoryList = [];
					var count = 0;
					for(var i=0 ;i<results.length;i++) {
						categoryList = results[i].category.split(",");
						for(var j=0;j<categoryList.length;j++) {
							var cat = categoryList[j].trim();
							if(categories.indexOf(cat) == -1) {
								categories[count++] = cat; 
							}
						}
					}
					categories = categories.sort();
					// Fetch movies from database
					moviedb.selectReleaseDate(function(results,error) {
						/*for(var i=0 ;i<results.length;i++) {
							movies[i] = results[i];
						}*/
						releaseDates = results;
	
						// Fetch movies from database
						moviedb.selectMovieBySearchCriteria(function(results,error) {
							/*for(var i=0 ;i<results.length;i++) {
								movies[i] = results[i];
							}*/
							movies = results;
							//res.render('listmovie', { "user":user, "movies": movies});
							res.render('issuemovielist', {"userDet" : user,"movies": movies, "categories":categories, "releaseDates": releaseDates,"membershipNo":membershipNo,"checkoutError":null});
						}, mname, banner, releasedate, category, rentamountmin, rentamountmax, isAvaliable);
					});
				});	
			} else {
				res.render("accessdenied");	
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
 * Last phase
 */
exports.issueMovieSelectSubmit =function(req,res){
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user !=null && user.roleName == "ADMIN") {
			var membershipNo = req.body.membershipNo;
			console.log(membershipNo);
			var movieId = req.body.movieId;
			if(membershipNo != null && membershipNo != null) {
				  userdb.selectUserByMembershipNo(function(results,err){
					   console.log(membershipNo);
						var names = [];
						/*for (var key in movieDetails) {
							//console.log(movieDetails[key][1]);
							console.log(movieDetails[key][1].MOVIE_ID +movieDetails[key][1].USERID);
						
						  if (movieDetails.hasOwnProperty(key)) {
						for(name in key){
						names.push(name);
						console.log ("name" + name);
						}}
							  }*/
						var newvalues = [];	
						/*var movieDetails = {"movieDetails":[{"USERID":'1',"MOVIE_ID":'4'},{"USERID":'2',"MOVIE_ID":'5'}]};
							for (var key in movieDetails) {
									for (var j = 0; j < movieDetails[key].length;j++){
										var newRecords ="(";
									newRecords = newRecords.concat(movieDetails[key][j].USERID);
									newRecords =newRecords.concat(","+movieDetails[key][j].MOVIE_ID);
									newRecords = newRecords.concat(",now()");
									newRecords = newRecords.concat(",null)");
									
								newvalues.push(newRecords);
									}
								}
							*/
						var member = null;
						if(results != null && results.length > 0) {
							member = results[0];						
												
								
									var exceedFlag = true;
									if(member.member_type == "S") {
										if(member.outstanding_movies < 2) {
											exceedFlag = false;
										}
									} else if(member.member_type == "P") {
										if(member.outstanding_movies < 10) {
											exceedFlag = false;
										}
									}
									if(!exceedFlag) {
										userdb.insertUserMovieMapping(function(results, error) {
										  	if(!error) {
											console.log(results);
												if(results.length !== 0) {
													var movie = null;
													moviedb.selectMovieById(function(results, error){
														movie = results[0];
														// Decrement available copies.
														movie.available_copies -= 1; 
														moviedb.editMovie(function(results, error) { 
															// Update balance amount.
															if(member.member_type == "S") {
																member.balance_amount += movie.rent_amount;
															}
															member.outstanding_movies +=1;
															userdb.editUser(function(results, error) {
																console.log("Movie/s issued to the user");
																res.render('checkout',{"userDet" : user,"movie":movie,"member":member });
															},member);
														},movie);
													},movieId);
												}
											} else {
												console.log(error);
											}
										}, member.user_id, movieId);
									} else {
										
										var categories = [];
										var releaseDates = [];
										// TODO: Fetch information of user
										//var membershipNo = req.body.membershipNo;
										//console.log(membershipNo);
										if(membershipNo != null) {
											// Fetch categories from database
											moviedb.selectCategories(function(results,error) {
												var category = [];
												var count = 0;
												for(var i=0 ;i<results.length;i++) {
													category = results[i].category.split(",");
													for(var j=0;j<category.length;j++) {
														var cat = category[j].trim();
														if(categories.indexOf(cat) == -1) {
															categories[count++] = cat; 
														}
													}
												}
												categories = categories.sort();
												// Fetch movies from database
												moviedb.selectReleaseDate(function(results,error) {
													/*for(var i=0 ;i<results.length;i++) {
														movies[i] = results[i];
													}*/
													releaseDates = results;
								
								
														//res.render('listmovie', { "user":user, "movies": movies});
														res.render('issuemovielist', {"userDet" : user,"movies": null, "categories":categories, "releaseDates": releaseDates,"membershipNo":membershipNo,"checkoutError":"User has exceeded the issued movies."});
													
												});
											});		
										}
									}
								
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
} 

/**
 * First phase.
 */
exports.issueMovie =function(req,res){
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user !=null && user.roleName == "ADMIN") {		
			res.render('issuemovie',{"userDet" : user,"fetchResult":null });
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


/*exports.returnmovie = function(movieDetails){
	var newvalues = {"movieDetails":[{"USERMOVIEID":'4'},{"USERMOVIEID":'5'}]};
	var newRecords ="(";
	for (var key in newvalues){
		
			for (var j = 0; j < newvalues[key].length;j++){
				newRecords=newRecords.concat(","+newvalues[key][j].USERMOVIEID);
	
			}
	}
	newRecords= newRecords.replace(",","");
	newRecords = newRecords.concat(")");
	var connection = mysql.createdbConnection();
	connection.query("update user_movie_mapping set RETURN_DATE = now() where usermovieid in "+newRecords , function(error, results) {
		if(!error) {
			console.log(results);
			if(results.length !== 0) {
				console.log("Movies returned");
			}
		} else {
			console.log(error);
		}
		});
	
}*/


/**
 * User side operations
 */

/**
 * List all movies
 */
exports.listMovieUser = function(req,res) {
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user !=null) {
			var movies = null;
			var categories = [];
			var releaseDates = [];
			// TODO: Fetch information of user

			// Fetch categories from database
			moviedb.selectCategories(function(results,error) {
				var category = [];
				var count = 0;
				for(var i=0 ;i<results.length;i++) {
					category = results[i].category.split(",");
					for(var j=0;j<category.length;j++) {
						var cat = category[j].trim();
						if(categories.indexOf(cat) == -1) {
							categories[count++] = cat; 
						}
					}
				}
				categories = categories.sort();
				// Fetch movies from database
				moviedb.selectReleaseDate(function(results,error) {
					/*for(var i=0 ;i<results.length;i++) {
						movies[i] = results[i];
					}*/
					releaseDates = results;

					// Fetch movies from database
					moviedb.selectMovies(function(results,error) {
						/*for(var i=0 ;i<results.length;i++) {
							movies[i] = results[i];
						}*/
						movies = results;

						//res.render('listmovie', { "user":user, "movies": movies});
						res.render('\\users\\viewusermovies', {"userDet" : user,"movies": movies, "categories":categories, "releaseDates": releaseDates});
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


exports.showMovieUser = function(req,res) {
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user != null) {
			var movieId = req.params.id;
			var movie = null;
			var users = null;
			moviedb.selectMovieById(function(results,error){
				movie = results[0];
				moviedb.selectUsersIssuedMovie(function(results, error) {
					if(results != null && results.length > 0) {
						users = results[0];
					}
					res.render('\\users\\usermovie', {"userDet" : user,"movie": movie,"users":users});
				}, movieId);
			}, movieId);
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
 * List all movies
 */

exports.searchMovieUser = function(req,res) {
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user !=null) {
			var mname = req.body.mname;
			var banner = req.body.banner;
			var releasedate = req.body.releasedate;
			var rentamountmin = req.body.rentamountmin;
			var rentamountmax = req.body.rentamountmax;
			var category = req.body.category;
			var isAvaliable = req.body.isAvailable;

			var movies = null;
			var categories = [];
			var releaseDates = [];
			// TODO: Fetch information of user

			// Fetch categories from database
			moviedb.selectCategories(function(results,error) {
				var categoryList = [];
				var count = 0;
				for(var i=0 ;i<results.length;i++) {
					categoryList = results[i].category.split(",");
					for(var j=0;j<categoryList.length;j++) {
						var cat = categoryList[j].trim();
						if(categories.indexOf(cat) == -1) {
							categories[count++] = cat; 
						}
					}
				}
				categories = categories.sort();
				// Fetch movies from database
				moviedb.selectReleaseDate(function(results,error) {
					/*for(var i=0 ;i<results.length;i++) {
						movies[i] = results[i];
					}*/
					releaseDates = results;

					// Fetch movies from database
					moviedb.selectMovieBySearchCriteria(function(results,error) {
						/*for(var i=0 ;i<results.length;i++) {
							movies[i] = results[i];
						}*/
						movies = results;
						//res.render('listmovie', { "user":user, "movies": movies});
						res.render('\\users\\viewusermovies', {"userDet" : user,"movies": movies, "categories":categories, "releaseDates": releaseDates});
					}, mname, banner, releasedate, category, rentamountmin, rentamountmax, isAvaliable);
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