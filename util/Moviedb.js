var mysql = require('./MySQLConnection');
var cache = require('./cache');
var cacheTimeout = 600000;

/**
 * Insert video
 * @param callback
 * @param movieDetails
 */
function insertMovie(callback, movieDetails) {
	var connection = mysql.createdbConnection();
	// TODO: Insert in category and actor table
	connection.query("INSERT INTO video (title, description, release_year, rental_rate, discount, available_copies, format_id, language_id, original_language_id, length, replacement_cost, rating, certification_id, video_type_id) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [movieDetails.title, movieDetails.description, movieDetails.releaseYear, movieDetails.rentalRate, movieDetails.discount, movieDetails.availableCopies, movieDetails.formatId, movieDetails.languageId, movieDetails.originalLanguageId, movieDetails.length, movieDetails.replacementCost, movieDetails.rating, movieDetails.certificationId, movieDetails.videoTypeId], function(error, results) {
		if(!error) {
			if(results.length !== 0) {
				console.log("Video details inserted");
				for(var x in movieDetails.actorIds) {
					connection.query("INSERT INTO video_actor (video_id, actor_id) VALUES(?,?)", [results.insertId, movieDetails.actorIds[x]]);
				}
				
				for(var x in movieDetails.categoryIds) {
					connection.query("INSERT INTO video_category (video_id, category_id) VALUES(?,?)", [results.insertId, movieDetails.categoryIds[x]]);
				}
			}
		} else {
			console.log(error);
		}
		callback(results, error);
	});
	mysql.closedbConnection(connection);
}

exports.insertMovie = insertMovie;

/**
 * Edit video
 * @param callback
 * @param movieDetails
 */
function editMovie(callback, movieDetails) {
	var connection = mysql.createdbConnection();
	var success = 0;
	connection.query("UPDATE video SET title = ?, description = ?, release_year = ?, rental_rate = ?, discount = ?, available_copies = ?, format_id = ?, language_id = ?, original_language_id = ?, length = ?, replacement_cost = ?, rating = ?, certification_id = ?, video_type_id = ? WHERE id  = ?", [movieDetails.title, movieDetails.description, movieDetails.releaseYear, movieDetails.rentalRate, movieDetails.discount, movieDetails.availableCopies, movieDetails.formatId, movieDetails.languageId, movieDetails.originalLanguageId, movieDetails.length, movieDetails.replacementCost, movieDetails.rating, movieDetails.certificationId, movieDetails.videoTypeId, movieDetails.id],function(error, results) {
		if(!error) {
			if(results.length !== 0) {
				connection.query("DELETE FROM video_actor WHERE video_id  = ?", [movieDetails.id],function(error1, results1) {
					if(!error1) {
						for(var x in movieDetails.actorIds) {
						connection.query("INSERT INTO video_actor (video_id, actor_id) VALUES(?,?)", [movieDetails.id, movieDetails.actorIds[x]], function(error, results) {
							if(!error) {
								success++;
							}
							if(success == (movieDetails.actorIds.length + movieDetails.categoryIds.length)) {
								callback(results, error);
							}
						});
						}
					} else {
						console.log(error1);
					}
				});
				
				connection.query("DELETE FROM video_category WHERE video_id  = ?", [movieDetails.id],function(error1, results1) {
					if(!error1) {
						for(var x in movieDetails.categoryIds) {
						connection.query("INSERT INTO video_category (video_id, category_id) VALUES(?,?)", [movieDetails.id, movieDetails.categoryIds[x]], function(error, results) {
							if(!error) {
								success++;
							}
							if(success == (movieDetails.actorIds.length + movieDetails.categoryIds.length)) {
								callback(results, error);
							}
						});
						}
					} else {
						console.log(error1);
					}
				});
				
				console.log("Video details edited for " + movieDetails.id);				
			}
		} else {
			console.log(error);
		}
		
	});
	mysql.closedbConnection(connection);
}

exports.editMovie = editMovie;

/**
 * Edit video
 * @param callback
 * @param movieDetails
 */
function editMovieAvailableCopies(callback, movieDetails) {
	var connection = mysql.createdbConnection();
	var success = 0;
	connection.query("UPDATE video SET available_copies = ? WHERE id  = ?", [movieDetails.available_copies, movieDetails.id],function(error, results) {
		if(!error) {
			if(results.length !== 0) {
				console.log("Video details edited for " + movieDetails.id);				
			}
		} else {
			console.log(error);
		}
		callback(results, error);
		
	});
	mysql.closedbConnection(connection);
}

exports.editMovieAvailableCopies = editMovieAvailableCopies;



/**
 * Delete video
 * @param callback
 * @param movieId
 */
function deleteMovie(callback, movieId) {
	var connection = mysql.createdbConnection();
	connection.query("DELETE FROM video WHERE id  = ?",[movieId], function(error, results) {
		if(!error) {
			console.log("Video details deleted for " + movieId);
			callback(results, error);
		} else {
			console.log(error);
		}
	});
	mysql.closedbConnection(connection);
}

exports.deleteMovie = deleteMovie;

/**
 * Get video details
 * @param callback
 * @param movieId
 */
function selectMovieById(callback, movieId) {
	var connection = mysql.createdbConnection();
	connection.query("SELECT video.id, title, description, release_year, rental_rate, discount, available_copies, format_id, format.name AS format, language_id, language.name AS language, original_language_id, language1.name AS original_language, length, replacement_cost, rating, certification_id, certificate.name AS certification, video_type_id, video_type.name AS video_type, poster FROM video INNER JOIN format ON format.id = video.format_id INNER JOIN language ON language.id = video.language_id INNER JOIN language AS language1 ON language1.id = video.original_language_id INNER JOIN certificate ON certificate.id = video.certification_id INNER JOIN video_type ON video_type.id = video.video_type_id WHERE video.id  = ?",[movieId], function(error, results) {
		if(!error) {
			if(results.length !== 0) {
				console.log("Video details selected for " + movieId);
				connection.query("SELECT first_name, last_name, actor_id FROM actor INNER JOIN video_actor ON actor.id = video_actor.actor_id WHERE video_id = ?",[movieId], function(error1, results1) {
					if(!error1) {
						connection.query("SELECT name, category_id FROM category INNER JOIN video_category ON category.id = video_category.category_id WHERE video_id = ?",[movieId], function(error2, results2) {
							if(!error2) {
								results[0].actorIds = [];
								results[0].categoryIds = [];
								results[0].actors = "";
								results[0].categories = "";
								
								for(var x in results2) {
									results[0].categoryIds.push(results2[x].category_id);
									results[0].categories += results2[x].name + ", ";
								}
								results[0].categories = results[0].categories.substr(0, results[0].categories.length-2);
								
								for(var x in results1) {
									results[0].actorIds.push(results1[x].actor_id);
									results[0].actors += results1[x].first_name + " " + results1[x].last_name + ", ";
								}
										
								results[0].actors = results[0].actors.substr(0, results[0].actors.length-2);
								
							} else {
								console.log(error2);
							}
							callback(results, error2);
						});
					} else {
						console.log(error1);
						callback(results1, error1);
					}
				});
			}
		} else {
			console.log(error);
			callback(results, error);
		}
	});
	mysql.closedbConnection(connection);
}

exports.selectMovieById = selectMovieById;

function selectUsersIssuedMovie(callback, videoId) {
	var connection = mysql.createdbConnection();
	connection.query("SELECT DISTINCT(rental.membership_no), first_name, last_name FROM rental INNER JOIN customer ON customer.membership_no = rental.membership_no WHERE video_id  = ?",[videoId], function(error, results) {
		if(!error) {
			if(results.length !== 0) {
				console.log("User details selected for " + videoId);
			}
		} else {
			console.log(error);
		}
		callback(results, error);
	});
	mysql.closedbConnection(connection);
}

exports.selectUsersIssuedMovie = selectUsersIssuedMovie;

function selectUsersCurrentlyIssuedMovie(callback, videoId) {
	var connection = mysql.createdbConnection();
	connection.query("SELECT DISTINCT(rental.membership_no), first_name, last_name FROM rental INNER JOIN customer ON customer.membership_no = rental.membership_no WHERE return_date IS NULL AND video_id  = ?",[videoId], function(error, results) {
		if(!error) {
			if(results.length !== 0) {
				console.log("User details selected for " + videoId);
			}
		} else {
			console.log(error);
		}
		callback(results, error);
	});
	mysql.closedbConnection(connection);
}

exports.selectUsersCurrentlyIssuedMovie = selectUsersCurrentlyIssuedMovie;



/**
 * Get all videos
 * @param callback
 */
function selectMovies(callback) {
	var query = "SELECT video.id, poster, title, description, release_year, rental_rate, discount, available_copies, format_id, language_id, original_language_id, length, replacement_cost, rating, certification_id, certificate.name AS certification, video_type_id, video_type.name AS video_type FROM video INNER JOIN certificate ON certificate.id = video.certification_id INNER JOIN video_type ON video_type.id = video.video_type_id ORDER BY video.id LIMIT 1000";
	var success = 0;
	cache.get(function(rows){
		if(rows == null){
			var connection = mysql.createdbConnection();
			connection.query(query, function(error, results) {
				if(!error) {
					if(results.length !== 0) {
						for(var x1 in results) {
							connection.query("SELECT video_id, first_name, last_name FROM actor INNER JOIN video_actor ON actor.id = video_actor.actor_id WHERE video_id = ?",[results[x1].id], function(error1, results1) {
								if(!error1) {										
									connection.query("SELECT video_id, name FROM category INNER JOIN video_category ON category.id = video_category.category_id WHERE video_id = ?",[results1[0].video_id], function(error2, results2) {
										if(!error2) {
											for(var x3 in results) {
												if(results[x3].id == results2[0].video_id) {
													results[x3].actors = "";
													results[x3].categories = "";
													for(var x in results2) {
														results[x3].categories += results2[x].name + ", ";
													}
													results[x3].categories = results[x3].categories.substr(0, results[x3].categories.length-2);
													for(var x in results1) {
														results[x3].actors += results1[x].first_name + " " + results1[x].last_name + ", ";
													}
													results[x3].actors = results[x3].actors.substr(0, results[x3].actors.length-2);
													
													success++;
													break;
												}
											}
										} else {
											console.log(error2);
										}
										if(success == results.length) {
											cache.put(query, results, cacheTimeout);
											callback(results, error);
										}
									});
								} else {
									console.log(error1);
									callback(results1, error1);
								}
								
							});	
						}
					} else {
						cache.put(query, results, cacheTimeout);
						callback(results, error2);
					}
				} else {
					console.log(error);
				}
			});
			mysql.closedbConnection(connection);
		} else {
			callback(rows, null);
		}
	},query);
}

exports.selectMovies = selectMovies;

function selectMovieBySearchCriteria(callback, title, releaseYear, category, minPrice, maxPrice, isAvailable, certificationId, videoTypeId) {
	var connection = mysql.createdbConnection();
	var query = "SELECT DISTINCT(video.id) AS id, poster, title, description, release_year, rental_rate, discount, available_copies, format_id, language_id, original_language_id, length, replacement_cost, rating, certification_id, certificate.name AS certification, video_type_id, video_type.name AS video_type FROM video INNER JOIN video_category ON video_category.video_id = video.id INNER JOIN certificate ON certificate.id = video.certification_id INNER JOIN video_type ON video_type.id = video.video_type_id WHERE ";
	var andFlag = false;
	var parameters = [];
	var count = 0;
	var success = 0;
	if(title != null && title != "") {
		parameters[count++] = "%" + title + "%";
		query +=" title LIKE ?";
		andFlag = true;
	}
	if(releaseYear != null && releaseYear != "") {
		if(andFlag) {
			query += " AND ";
		}
		parameters[count++] = releaseYear;
		query +=" release_year = ?";
		andFlag = true;
	}
	if(category != null && category != "") {
		if(andFlag) {
			query += " AND ";
		}
		console.log(category);
		parameters[count++] = category;
		query +=" video_category.category_id IN ( ? )";
		andFlag = true;
	}
	if(minPrice != null && minPrice != "" && maxPrice != null && maxPrice != "") {
		if(andFlag) {
			query += " AND ";
		}
		parameters[count++] = minPrice;
		parameters[count++] = maxPrice;
		query +=" rental_rate BETWEEN ? AND ?";
		andFlag = true;
	}
	if(isAvailable) {
		if(andFlag) {
			query += " AND ";
		}
		query +=" available_copies <> 0";
		andFlag = true;
	} else {
		if(andFlag) {
			query += " AND ";
		}
		query +=" available_copies = 0";
		andFlag = true;
	}
	if(certificationId) {
		if(andFlag) {
			query += " AND ";
		}
		query +=" certification_id = ?";
		parameters[count++] = certificationId;
		andFlag = true;
	}
	if(videoTypeId) {
		if(andFlag) {
			query += " AND ";
		}
		query +=" video_type_id = ?";
		parameters[count++] = videoTypeId;
		andFlag = true;
	}
	if(!andFlag) {
		query = "SELECT DISTINCT(video.id) AS id, poster, title, description, release_year, rental_rate, discount, available_copies, format_id, language_id, original_language_id, length, replacement_cost, rating, certification_id, name AS certification FROM video INNER JOIN certificate ON certificate.id = video.certification_id ";
		parameters = [];
	}
	query += " ORDER BY video.id LIMIT 1000";
	console.log("Query for selectMoviebysearchcriteria: " + query + " " + parameters);
	connection.query(query,parameters, function(error, results) {
		if(!error) {
			if(results.length !== 0) {
				console.log("Video details selected for selectMovieBySearchCriteria");
				for(var x1 in results) {
					connection.query("SELECT video_id, first_name, last_name FROM actor INNER JOIN video_actor ON actor.id = video_actor.actor_id WHERE video_id = ?",[results[x1].id], function(error1, results1) {
						if(!error1) {								
							connection.query("SELECT video_id, name FROM category INNER JOIN video_category ON category.id = video_category.category_id WHERE video_id = ?",[results1[0].video_id], function(error2, results2) {
								if(!error2) {
									for(var x3 in results) {
										if(results[x3].id == results2[0].video_id) {
											results[x3].actors = "";
											results[x3].categories = "";
											for(var x in results2) {
												results[x3].categories += results2[x].name + ", ";
											}
											results[x3].categories = results[x3].categories.substr(0, results[x3].categories.length-2);
											for(var x in results1) {
												results[x3].actors += results1[x].first_name + " " + results1[x].last_name + ", ";
											}
											results[x3].actors = results[x3].actors.substr(0, results[x3].actors.length-2);
											
											success++;
											break;
										}
									}
								} else {
									console.log(error2);
								}
								if(success == results.length) {
									cache.put(query, results, cacheTimeout);
									callback(results, error);
								}
							});
						} else {
							console.log(error1);
							callback(results1, error1);
						}
						
					});	
				}
			} else {
				callback(results, error);
			}
		} else {
			console.log(error);
			callback(results, error);
		}
	});
	mysql.closedbConnection(connection);
}

exports.selectMovieBySearchCriteria = selectMovieBySearchCriteria;

/**
 * Get all categories
 * @param callback
 */
function selectCategories(callback) {
	var query = "SELECT * FROM category ORDER BY name";
	cache.get(function(rows){
		if(rows == null){
			var connection = mysql.createdbConnection();
			connection.query(query, function(error, results) {
				if(!error) {
					if(results.length !== 0) {
						cache.put(query, results, cacheTimeout);
						console.log("Video category selected");
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

exports.selectCategories = selectCategories;


/**
 * Get all categories
 * @param callback
 */
function selectCategoriesByVideoId(callback, videoId) {
	var query = "SELECT video_id, category_id, name FROM video_category INNER JOIN category ON category.id = video_category.category_id WHERE video_id = ?";
	cache.get(function(rows){
		if(rows == null){
			var connection = mysql.createdbConnection();
			connection.query(query, [videoId], function(error, results) {
				if(!error) {
					if(results.length !== 0) {
						cache.put(query, results, cacheTimeout);
						console.log("Video category selected");
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

exports.selectCategoriesByVideoId = selectCategoriesByVideoId;


/**
 * Get all categories
 * @param callback
 */
function selectCertificates(callback) {
	var query = "SELECT * FROM certificate ORDER BY name";
	cache.get(function(rows){
		if(rows == null){
			var connection = mysql.createdbConnection();
			connection.query(query, function(error, results) {
				if(!error) {
					if(results.length !== 0) {
						cache.put(query, results, cacheTimeout);
						console.log("Video certification selected");
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

exports.selectCertificates = selectCertificates;




/**
 * Get all formats
 * @param callback
 */
function selectFormats(callback) {
	var query = "SELECT * FROM format ORDER BY name";
	cache.get(function(rows){
		if(rows == null){
			var connection = mysql.createdbConnection();
			connection.query(query, function(error, results) {
				if(!error) {
					if(results.length !== 0) {
						cache.put(query, results, cacheTimeout);
						console.log("Video format selected");
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

exports.selectFormats = selectFormats;


/**
 * Get all formats
 * @param callback
 */
function selectLanguages(callback) {
	var query = "SELECT * FROM language ORDER BY name";
	cache.get(function(rows){
		if(rows == null){
			var connection = mysql.createdbConnection();
			connection.query(query, function(error, results) {
				if(!error) {
					if(results.length !== 0) {
						cache.put(query, results, cacheTimeout);
						console.log("Video language selected");
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

exports.selectLanguages = selectLanguages;

/**
 * Get all video types
 * @param callback
 */
function selectVideoTypes(callback) {
	var query = "SELECT * FROM video_type ORDER BY name";
	cache.get(function(rows){
		if(rows == null){
			var connection = mysql.createdbConnection();
			connection.query(query, function(error, results) {
				if(!error) {
					if(results.length !== 0) {
						cache.put(query, results, cacheTimeout);
						console.log("Video type selected");
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

exports.selectVideoTypes = selectVideoTypes;

/**
 * Get all actors
 * @param callback
 */
function selectActors(callback) {
	var query = "SELECT * FROM actor ORDER BY first_name";
	cache.get(function(rows){
		if(rows == null){
			var connection = mysql.createdbConnection();
			connection.query(query, function(error, results) {
				if(!error) {
					if(results.length !== 0) {
						cache.put(query, results, cacheTimeout);
						console.log("Video actor selected");
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

exports.selectActors = selectActors;

function selectReleaseDate(callback) {
	var query = "SELECT DISTINCT(release_year) AS release_year FROM video ORDER BY release_year DESC";
	cache.get(function(rows){
		if(rows == null){
			var connection = mysql.createdbConnection();
			connection.query(query, function(error, results) {
				if(!error) {
					if(results.length !== 0) {
						cache.put(query, results, cacheTimeout);
						console.log("Movie release date selected");
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

exports.selectReleaseDate = selectReleaseDate;

// TODO: Need to update test cases
function insertRentalMapping(callback, membershipNo, movieId) {
	var connection = mysql.createdbConnection();
	var query = "INSERT INTO rental (membership_no, video_id, rental_date) values(?,?,now())";
	connection.query(query, [membershipNo,movieId], function(error, results) {
		if(!error) {
			if(results.length !== 0) {
				console.log("Rental mapping inserted.");
			}
		} else {
			console.log("Insert User : " + error);
		}
		callback(results, error);
	});
	mysql.closedbConnection(connection);
}
exports.insertRentalMapping = insertRentalMapping;
