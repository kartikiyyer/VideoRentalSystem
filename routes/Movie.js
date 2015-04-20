/**
 * New node file
 */
var dbvideo = require('../util/Moviedb');
var dbuser = require("../util/Userdb");

/**
 * List all video
 */
exports.videoList = function(req,res) {
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user !=null && user.role_name == "Admin") {
			// Fetch categories from database
			dbvideo.selectCategories(function(categories,error) {
				dbvideo.selectFormats(function(formats,error) {
					dbvideo.selectLanguages(function(languages,error) {
						dbvideo.selectCertificates(function(certificates,error) {
							// Fetch release dates from database
							dbvideo.selectReleaseDate(function(releaseDates,error) {
								dbvideo.selectVideoTypes(function(videoTypes,error) {
									// Fetch videos from database
									dbvideo.selectMovies(function(videos,error) {
										res.render('listmovie', {"userDet" : user,"movies": videos, "categories":categories, "releaseDates": releaseDates, "formats":formats, "languages":languages, "certificates":certificates, "videoTypes":videoTypes});
									});
								});
							});
						});
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

/**
 * Display video
 */
exports.showMovie = function(req,res) {
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user !=null && user.role_name == "Admin") {
			var videoId = req.params.id;
			var video = null;
			var users = null;
			dbvideo.selectMovieById(function(videos,error){
				video = videos[0];
				dbvideo.selectUsersCurrentlyIssuedMovie(function(results, error) {
					if(results != null && results.length > 0) {
						users = results;
					}
					res.render('movie', {"userDet" : user,"movie": video,"users":users});
				}, videoId);				
			}, videoId);
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
 * List all videos
 */
exports.searchMovie = function(req,res) {
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user !=null && user.role_name == "Admin") {
			var title = req.body.title;
			var releaseYear = req.body.releaseYear;
			var videoTypeId = req.body.videoTypeId;
			var rentalRateMin = req.body.rentalRateMin;
			var rentalRateMax = req.body.rentalRateMax;
			var certificationId = req.body.certificationId;
			var categoryIdsString = "";
			var categoryIds = [];
			if(req.body.categoryIds != null) {
				if(Array.isArray(req.body.categoryIds)) {
					categoryIds = req.body.categoryIds;
				} else {
					categoryIds[0] = req.body.categoryIds;
				}	

				for(var i = 0; i < categoryIds.length;i++) {
					categoryIdsString += categoryIds[i] + ",";
				}
			}
			categoryIdsString = categoryIdsString.substr(0, categoryIdsString.length-1);
			var isAvailable = req.body.isAvailable;

			// Fetch categories from database
			dbvideo.selectCategories(function(categories,error) {
				dbvideo.selectFormats(function(formats,error) {
					dbvideo.selectLanguages(function(languages,error) {
						dbvideo.selectCertificates(function(certificates,error) {
							// Fetch movies from database
							dbvideo.selectReleaseDate(function(releaseDates,error) {
								dbvideo.selectVideoTypes(function(videoTypes,error) {
									// Fetch movies from database
									dbvideo.selectMovieBySearchCriteria(function(videos,error) {
										res.render('listmovie', {"userDet" : user,"movies": videos, "categories":categories, "releaseDates": releaseDates, "formats":formats, "languages":languages, "certificates":certificates, "videoTypes":videoTypes});
									}, title, releaseYear, categoryIdsString, rentalRateMin, rentalRateMax, isAvailable, certificationId, videoTypeId);
								});
							});
						});
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

/**
 * Create video
 */
exports.createmovie = function(req, res){
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user !=null && user.role_name == "Admin") {
			// Fetch categories from database
			dbvideo.selectCategories(function(categories,error) {
				dbvideo.selectFormats(function(formats,error) {
					dbvideo.selectLanguages(function(languages,error) {
						dbvideo.selectActors(function(actors,error) {
							dbvideo.selectCertificates(function(certificates,error) {
								dbvideo.selectVideoTypes(function(videoTypes,error) {
									res.render("createmovie",{"userDet" : user,"insertedresults":null,"categories":categories, "formats":formats, "languages":languages, "certificates":certificates, "actors":actors, "videoTypes":videoTypes});
								});
							});
						});
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
 * Submit button of create video
 */
exports.createMovieSubmit = function(req,res) {
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user !=null && user.role_name == "Admin") {
			var movieDetails = [];
			movieDetails.title = req.body.title;
			movieDetails.description = req.body.description;
			movieDetails.releaseYear = req.body.releaseYear;
			movieDetails.rentalRate = req.body.rentalRate;
			movieDetails.discount = req.body.discount;
			movieDetails.availableCopies = req.body.availableCopies;
			movieDetails.formatId = req.body.formatId;
			movieDetails.languageId = req.body.languageId;
			movieDetails.originalLanguageId = req.body.originalLanguageId;
			movieDetails.length = req.body.length;
			movieDetails.replacementCost = req.body.replacementCost;
			movieDetails.rating = req.body.rating;
			movieDetails.certificationId = req.body.certificationId;
			movieDetails.poster = req.body.poster;
			movieDetails.videoTypeId = req.body.videoTypeId;
			if(Array.isArray(req.body.actorIds)) {
				movieDetails.actorIds = req.body.actorIds;
			} else {
				movieDetails.actorIds = [];
				movieDetails.actorIds[0] = req.body.actorIds;
			}
			movieDetails.categoryIds = [];
			if(req.body.categoryIds != null) {
				if(Array.isArray(req.body.categoryIds)) {
					movieDetails.categoryIds = req.body.categoryIds;
				} else {
					movieDetails.categoryIds[0] = req.body.categoryIds;
				}	
			}
			// Fetch categories from database
			dbvideo.selectCategories(function(categories,error) {				
				dbvideo.selectFormats(function(formats,error) {
					dbvideo.selectLanguages(function(languages,error) {
						dbvideo.selectActors(function(actors,error) {
							dbvideo.selectCertificates(function(certificates,error) {
								dbvideo.selectVideoTypes(function(videoTypes,error) {
									dbvideo.insertMovie(function(results, error) {
										res.render("createmovie",{"userDet" : user,"insertedresults":"Movie inserted successfully.","categories":categories, "formats":formats, "languages":languages, "certificates":certificates, "actors":actors, "videoTypes":videoTypes});
									},movieDetails);
								});
								
							});
						});
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

/**
 * Edit video
 */
exports.editMovie = function(req,res) {
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user !=null && user.role_name == "Admin") {
			var videoId = req.params.id;
			// Fetch categories from database
			dbvideo.selectCategories(function(categories,error) {
				dbvideo.selectFormats(function(formats,error) {
					dbvideo.selectLanguages(function(languages,error) {
						dbvideo.selectActors(function(actors,error) {
							dbvideo.selectCertificates(function(certificates,error) {
								dbvideo.selectVideoTypes(function(videoTypes,error) {
									// Fetch movies from database
									dbvideo.selectMovieById(function(results,error) {
										res.render("editmovie",{"userDet" : user,"editedresults":null,"categories":categories,  "formats":formats, "languages":languages, "certificates":certificates, "actors":actors, "videoTypes":videoTypes, "movie":results[0]});
									},videoId);
								});
							});
						});
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

/**
 * Submit button of edit video
 */
exports.editMovieSubmit = function(req,res) {
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user !=null && user.role_name == "Admin") {
			var movieDetails = [];
			movieDetails.id = req.body.movieId;
			movieDetails.title = req.body.title;
			movieDetails.description = req.body.description;
			movieDetails.releaseYear = req.body.releaseYear;
			movieDetails.rentalRate = req.body.rentalRate;
			movieDetails.discount = req.body.discount;
			movieDetails.availableCopies = req.body.availableCopies;
			movieDetails.formatId = req.body.formatId;
			movieDetails.languageId = req.body.languageId;
			movieDetails.originalLanguageId = req.body.originalLanguageId;
			movieDetails.length = req.body.length;
			movieDetails.replacementCost = req.body.replacementCost;
			movieDetails.rating = req.body.rating;
			movieDetails.certificationId = req.body.certificationId;
			movieDetails.poster = req.body.poster;
			movieDetails.videoTypeId = req.body.videoTypeId;
			if(Array.isArray(req.body.actorIds)) {
				movieDetails.actorIds = req.body.actorIds;
			} else {
				movieDetails.actorIds = [];
				movieDetails.actorIds[0] = req.body.actorIds;
			}
			movieDetails.categoryIds = [];
			if(req.body.categoryIds != null) {
				if(Array.isArray(req.body.categoryIds)) {
					movieDetails.categoryIds = req.body.categoryIds;
				} else {
					movieDetails.categoryIds[0] = req.body.categoryIds;
				}	
			}

			// Fetch categories from database
			dbvideo.selectCategories(function(categories,error) {
				dbvideo.selectFormats(function(formats,error) {
					dbvideo.selectLanguages(function(languages,error) {
						dbvideo.selectActors(function(actors,error) {
							dbvideo.selectCertificates(function(certificates,error) {
								dbvideo.selectVideoTypes(function(videoTypes,error) {
									dbvideo.editMovie(function(results, error) {
										if(error== null && results != null) {
											// Fetch movies from database
											dbvideo.selectMovieById(function(results,error) {
												res.render("editmovie",{"userDet" : user,"editedresults":"Movie edited successfully","categories":categories,  "formats":formats, "languages":languages, "certificates":certificates, "actors":actors, "videoTypes":videoTypes, "movie":results[0]});
											},movieDetails.id);
										} else {
											dbvideo.selectMovieById(function(results,error) {
												res.render("editmovie",{"userDet" : user,"editedresults":"Movie not edited","categories":categories,  "formats":formats, "languages":languages, "certificates":certificates, "actors":actors, "videoTypes":videoTypes, "movie":results[0]});
											},movieDetails.id);
										}
									},movieDetails);
								});
							});
						});
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

/**
 * Delete video
 */
exports.deleteMovie = function(req,res) {
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user !=null && user.role_name == "Admin") {
			var movieId = req.params.id;
			dbvideo.deleteMovie(function(results, error) {
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

/**
 * Second phase
 */
exports.issueMovieSubmit =function(req,res){
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user !=null && user.role_name == "Admin") {
			var membershipNo = req.body.membershipNo;
			if(membershipNo != null) {
				dbuser.selectUserByMembershipNo(function(results, error){
					if(!error && results != null && results.length > 0 && results[0].role_id != 1) {
						// Fetch categories from database
						dbvideo.selectCategories(function(categories,error) {
							dbvideo.selectFormats(function(formats,error) {
								dbvideo.selectLanguages(function(languages,error) {
									dbvideo.selectActors(function(actors,error) {
										dbvideo.selectCertificates(function(certificates,error) {
											dbvideo.selectReleaseDate(function(releaseDates,error) {
												dbvideo.selectVideoTypes(function(videoTypes,error) {
													res.render('issuemovielist', {"userDet" : user,"movies": null, "membershipNo":membershipNo, "categories":categories, "releaseDates": releaseDates, "formats":formats, "languages":languages, "certificates":certificates, "actors":actors,"videoTypes":videoTypes, "checkoutError":null});
												});
											});
										});
									});
								});
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

/**
 * Search issue video
 */
exports.issueSearchMovie = function(req,res) {
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user !=null && user.role_name == "Admin") {
		var title = req.body.title;
		var releaseYear = req.body.releaseYear;
		var videoTypeId = req.body.videoTypeId;
		var rentalRateMin = req.body.rentalRateMin;
		var rentalRateMax = req.body.rentalRateMax;
		var categoryIdsString = "";
		var categoryIds = [];
		if(req.body.categoryIds != null) {
			if(Array.isArray(req.body.categoryIds)) {
				categoryIds = req.body.categoryIds;
			} else {
				categoryIds[0] = req.body.categoryIds;
			}	

			for(var i = 0; i < categoryIds.length;i++) {
				categoryIdsString += categoryIds[i] + ",";
			}
		}
		categoryIdsString = categoryIdsString.substr(0, categoryIdsString.length-1);
		var isAvailable = req.body.isAvailable;
		var membershipNo = req.body.membershipNo;

		if(membershipNo != null) {
			// Fetch categories from database
			dbvideo.selectCategories(function(categories,error) {
				dbvideo.selectFormats(function(formats,error) {
					dbvideo.selectLanguages(function(languages,error) {
						dbvideo.selectActors(function(actors,error) {
							dbvideo.selectCertificates(function(certificates,error) {
								// Fetch movies from database
								dbvideo.selectReleaseDate(function(releaseDates,error) {
									dbvideo.selectVideoTypes(function(videoTypes,error) {
										// Fetch movies from database
										dbvideo.selectMovieBySearchCriteria(function(videos,error) {
											res.render('issuemovielist', {"userDet" : user,"movies": videos, "categories":categories, "releaseDates": releaseDates, "formats":formats, "languages":languages, "certificates":certificates, "actors":actors, "videoTypes": videoTypes, "membershipNo":membershipNo,"checkoutError":null});
										}, title, releaseYear, categoryIdsString, rentalRateMin, rentalRateMax, isAvailable, videoTypeId);
									});
								});
							});
						});
					});
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
		if(user !=null && user.role_name == "Admin") {
			var membershipNo = req.body.membershipNo;
			var videoId = req.body.movieId;
			if(membershipNo != null) {
				dbuser.selectUserByMembershipNo(function(results,err) {
					var users = null;
					if(results != null && results.length > 0) {
						users = results[0];						
						var exceedFlag = false;
						if(users.member_type_id == 1) {
							/*if(user.outstanding_movies < 2) {
								exceedFlag = false;
							}*/
						} else if(users.member_type_id == 2) {
							/*if(user.outstanding_movies < 10) {
								exceedFlag = false;
							}*/
						}
						if(!exceedFlag) {
							dbvideo.insertRentalMapping(function(results, error) {
							  	if(!error) {
									if(results.length !== 0) {
										var video = null;
										dbvideo.selectMovieById(function(videos, error){
											video = videos[0];
											// Decrement available copies.
											video.available_copies -= 1; 
											dbvideo.editMovieAvailableCopies(function(results, error) { 
												// Update balance amount.
												/*if(user.member_type == "S") {
													user.balance_amount += movie.rent_amount;
												}
												user.outstanding_movies +=1;
												dbuser.editUser(function(results, error) {
													console.log("Movie/s issued to the user");
												*/	res.render('checkout',{"userDet" : user,"movie":video,"member":users });
												//},user);
											},video);
										},videoId);
									}
								} else {
									console.log(error);
								}
							}, users.membership_no, videoId);
						} /*else {
							
							var categories = [];
							var releaseDates = [];
							// TODO: Fetch information of user
							//var membershipNo = req.body.membershipNo;
							//console.log(membershipNo);
							if(membershipNo != null) {
								// Fetch categories from database
								dbvideo.selectCategories(function(results,error) {
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
										
										releaseDates = results;
					
					
											//res.render('listmovie', { "user":user, "movies": movies});
											res.render('issuemovielist', {"userDet" : user,"movies": null, "categories":categories, "releaseDates": releaseDates,"membershipNo":membershipNo,"checkoutError":"User has exceeded the issued movies."});
										
									});
								});		
							}
						}*/
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
		if(user !=null && user.role_name == "Admin") {		
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


/**
 * User side operations
 */

/**
 * First phase
 */

exports.userissueMovie =function(req,res){
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
			var membershipNo = user.membershipNo;
			if(membershipNo != null) {
				dbuser.selectUserByMembershipNo(function(results, error){
					if(!error && results != null && results.length > 0 && results[0].role_id != 1) {
						// Fetch categories from database
						dbvideo.selectCategories(function(categories,error) {
							dbvideo.selectFormats(function(formats,error) {
								dbvideo.selectLanguages(function(languages,error) {
									dbvideo.selectActors(function(actors,error) {
										dbvideo.selectCertificates(function(certificates,error) {
											dbvideo.selectReleaseDate(function(releaseDates,error) {
												dbvideo.selectVideoTypes(function(videoTypes,error) {
													res.render('\\users\\userissuemovielist', {"userDet" : user,"movies": null, "membershipNo":membershipNo, "categories":categories, "releaseDates": releaseDates, "formats":formats, "languages":languages, "certificates":certificates, "actors":actors, "videoTypes":videoTypes, "checkoutError":null});
												});
											});
										});
									});
								});
							});
						});	
					}
				},membershipNo);
			}
	} else {
		res.writeHead(301,
				{Location: "/"}			
		);
		res.end();
	}
};

/**
 * Search issue video
 */
exports.userissueSearchMovie = function(req,res) {
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		var title = req.body.title;
		var releaseYear = req.body.releaseYear;
		var videoTypeId = req.body.videoTypeId;
		var rentalRateMin = req.body.rentalRateMin;
		var rentalRateMax = req.body.rentalRateMax;
		var categoryIdsString = "";
		var categoryIds = [];
		if(req.body.categoryIds != null) {
			if(Array.isArray(req.body.categoryIds)) {
				categoryIds = req.body.categoryIds;
			} else {
				categoryIds[0] = req.body.categoryIds;
			}	

			for(var i = 0; i < categoryIds.length;i++) {
				categoryIdsString += categoryIds[i] + ",";
			}
		}
		categoryIdsString = categoryIdsString.substr(0, categoryIdsString.length-1);
		var isAvailable = req.body.isAvailable;
		var membershipNo = req.body.membershipNo;
		if(membershipNo != null) {
			// Fetch categories from database
			dbvideo.selectCategories(function(categories,error) {
				dbvideo.selectFormats(function(formats,error) {
					dbvideo.selectLanguages(function(languages,error) {
						dbvideo.selectActors(function(actors,error) {
							dbvideo.selectCertificates(function(certificates,error) {
								// Fetch videos from database
								dbvideo.selectReleaseDate(function(releaseDates,error) {
									dbvideo.selectVideoTypes(function(videoTypes,error) {
										// Fetch movies from database
										dbvideo.selectMovieBySearchCriteria(function(videos,error) {
											res.render('\\users\\userissuemovielist', {"userDet" : user,"movies": videos, "categories":categories, "releaseDates": releaseDates, "formats":formats, "languages":languages, "certificates":certificates, "actors":actors, "videoTypes": videoTypes, "membershipNo":membershipNo,"checkoutError":null});
										}, title, releaseYear, categoryIdsString, rentalRateMin, rentalRateMax, isAvailable, videoTypeId);
									});
								});
							});
						});
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

/**
 * Last phase
 */
exports.userissueMovieSelectSubmit =function(req,res){
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		var membershipNo = req.body.membershipNo;
		var videoId = req.body.movieId;
		if(membershipNo != null) {
			dbuser.selectUserByMembershipNo(function(results,err) {
				var users = null;
				if(results != null && results.length > 0) {
					users = results[0];						
					var exceedFlag = false;
					if(users.member_type_id == 1) {
						/*if(user.outstanding_movies < 2) {
						exceedFlag = false;
					}*/
					} else if(users.member_type_id == 2) {
						/*if(user.outstanding_movies < 10) {
						exceedFlag = false;
						}*/
					}
					if(!exceedFlag) {
						dbvideo.insertRentalMapping(function(results, error) {
						  	if(!error) {
								if(results.length !== 0) {
									var video = null;
									dbvideo.selectMovieById(function(videos, error) {
										video = videos[0];
										// Decrement available copies.
										video.available_copies -= 1; 
										dbvideo.editMovieAvailableCopies(function(results, error) { 
											// Update balance amount.
											/*if(user.member_type == "S") {
												user.balance_amount += movie.rent_amount;
											}
											user.outstanding_movies +=1;
											dbuser.editUser(function(results, error) {
												console.log("Movie/s issued to the user");
											*/	res.render('\\users\\usercheckout',{"userDet" : user,"movie":video,"member":users });
											//},user);
										},video);
									},videoId);
								}
							} else {
								console.log(error);
							}
						}, users.membership_no, videoId);
					} /*else {
						var categories = [];
						var releaseDates = [];
						// TODO: Fetch information of user
						//var membershipNo = req.body.membershipNo;
						//console.log(membershipNo);
						if(membershipNo != null) {
							// Fetch categories from database
							dbvideo.selectCategories(function(results,error) {
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
								dbvideo.selectReleaseDate(function(results,error) {
									releaseDates = results;
									//res.render('listmovie', { "user":user, "movies": movies});
									res.render('issuemovielist', {"userDet" : user,"movies": null, "categories":categories, "releaseDates": releaseDates,"membershipNo":membershipNo,"checkoutError":"User has exceeded the issued movies."});
								});
							});		
						}
					}*/
				}	
			},membershipNo);
		}
	} else {
		res.writeHead(301,
			{Location: "/"}			
		);
		res.end();
	}	
} 

/**
 * List all videos
 */
exports.listMovieUser = function(req,res) {
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user !=null) {
			// Fetch categories from database
			dbvideo.selectCategories(function(categories,error) {
				dbvideo.selectFormats(function(formats,error) {
					dbvideo.selectLanguages(function(languages,error) {
						dbvideo.selectCertificates(function(certificates,error) {
							// Fetch movies from database
							dbvideo.selectReleaseDate(function(releaseDates,error) {
								dbvideo.selectVideoTypes(function(videoTypes,error) {
									// Fetch movies from database
									dbvideo.selectMovies(function(videos,error) {
										res.render('\\users\\viewusermovies', {"userDet" : user,"movies": videos, "categories":categories, "releaseDates": releaseDates, "formats":formats, "languages":languages, "certificates":certificates, "videoTypes":videoTypes});
									});
								});
							});
						});
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
 * Show video
 */
exports.showMovieUser = function(req,res) {
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user != null) {
			var videoId = req.params.id;
			var video = null;
			var users = null;
			dbvideo.selectMovieById(function(videos,error){
				video = videos[0];
				/*dbvideo.selectUsersIssuedMovie(function(results, error) {
					if(results != null && results.length > 0) {
						users = results;
					}
					console.log(user);
			*/		res.render('\\users\\usermovie', {"userDet" : user,"movie": video,"users":users});
			//	}, videoId);
			}, videoId);
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
 * Search all videos
 */

exports.searchMovieUser = function(req,res) {
	if(req.session.userdetails != null && req.session.userdetails != "") {	
		var user = JSON.parse(req.session.userdetails);
		if(user !=null) {			
			var title = req.body.title;
			var releaseYear = req.body.releaseYear;
			var rentalRateMin = req.body.rentalRateMin;
			var rentalRateMax = req.body.rentalRateMax;
			var categoryIds = req.body.categoryIds;
			var certificationId = req.body.certificationId;
			var videoTypeId = req.body.videoTypeId;
			var categoryIdsString = "";
			var categoryIds = [];
			if(req.body.categoryIds) {
				if(Array.isArray(req.body.categoryIds)) {
					categoryIds = req.body.categoryIds;
				} else {
					categoryIds[0] = req.body.categoryIds;
				}	

				for(var i = 0; i < categoryIds.length;i++) {
					categoryIdsString += categoryIds[i] + ",";
				}
			}
			categoryIdsString = categoryIdsString.substr(0, categoryIdsString.length-1);
			var isAvailable = req.body.isAvailable;

			// Fetch categories from database
			dbvideo.selectCategories(function(categories,error) {
				dbvideo.selectFormats(function(formats,error) {
					dbvideo.selectLanguages(function(languages,error) {
						dbvideo.selectCertificates(function(certificates,error) {
							// Fetch movies from database
							dbvideo.selectReleaseDate(function(releaseDates,error) {	
								dbvideo.selectVideoTypes(function(videoTypes,error) {
									// Fetch movies from database
									dbvideo.selectMovieBySearchCriteria(function(videos,error) {
										res.render('\\users\\viewusermovies', {"userDet" : user,"movies": videos, "categories":categories, "releaseDates": releaseDates, "formats":formats, "languages":languages, "certificates":certificates, "videoTypes":videoTypes});
									}, title, releaseYear, categoryIdsString, rentalRateMin, rentalRateMax, isAvailable, certificationId, videoTypeId);
								});
							});
						});
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