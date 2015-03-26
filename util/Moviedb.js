/**
 * New node file modified by Mihir
 */
var mysql = require('./MySQLConnection');
var cache = require('./cache');
var cacheTimeout = 600000;

function insertMovie(callback, movieDetails) {
	var connection = mysql.createdbConnection();
	//var connection = mysql.getdbConnection();
	//connection.query("INSERT INTO movie (movie_name, movie_banner, release_date, rent_amount, available_copies, category) VALUES('" + movieDetails.movieName + "','" + movieDetails.movieBanner + "','" + movieDetails.releaseDate + "','" + movieDetails.rentAmount + "','" + movieDetails.availableCopies + "','" + movieDetails.category + "')", function(error, results) {
	connection.query("INSERT INTO movie (movie_name, movie_banner, release_date, rent_amount, available_copies, category) VALUES(?,?,?,?,?,?)", [movieDetails.movieName, movieDetails.movieBanner, movieDetails.releaseDate, movieDetails.rentAmount, movieDetails.availableCopies, movieDetails.category], function(error, results) {
		if(!error) {
			//console.log(results);
			if(results.length !== 0) {
				console.log("Movie details inserted");
			}
		} else {
			console.log(error);
		}
		callback(results, error);
	});
	mysql.closedbConnection(connection);
	//mysql.releasedbConnection(connection);
}

exports.insertMovie = insertMovie;

function editMovie(callback, movieDetails) {
	var connection = mysql.createdbConnection();
	//var connection = mysql.getdbConnection();
	//connection.query("UPDATE movie SET movie_name = '" + movieDetails.movieName + "', movie_banner = '" + movieDetails.movieBanner + "', release_date = '" + movieDetails.releaseDate + "', rent_amount = '" + movieDetails.rentAmount + "', available_copies = '" + movieDetails.availableCopies + "', category = '" + movieDetails.category + "' WHERE movie_id  = '" + movieDetails.movieId + "'", function(error, results) {
	connection.query("UPDATE movie SET movie_name = ?, movie_banner = ?, release_date = ?, rent_amount = ?, available_copies = ?, category = ? WHERE movie_id  = ?", [movieDetails.movie_name, movieDetails.movie_banner, movieDetails.release_date, movieDetails.rent_amount, movieDetails.available_copies, movieDetails.category, movieDetails.movie_id],function(error, results) {
		if(!error) {
			//console.log(results);
			if(results.length !== 0) {
				console.log("Movie details edited for " + movieDetails.movie_id);
			}
		} else {
			console.log(error);
		}
		callback(results, error);
	});
	mysql.closedbConnection(connection);
	//mysql.releasedbConnection(connection);
}

exports.editMovie = editMovie;

function deleteMovie(callback, movieId) {
	var connection = mysql.createdbConnection();
	//var connection = mysql.getdbConnection();
	//connection.query("DELETE FROM movie WHERE movie_id  = '" + movieId + "'", function(error, results) {
	connection.query("DELETE FROM movie WHERE movie_id  = ?",[ movieId], function(error, results) {
		if(!error) {
			//console.log(results);
			if(results.length !== 0) {
				console.log("Movie details deleted for " + movieId);
			}
		} else {
			console.log(error);
		}
		callback(results, error);
	});
	mysql.closedbConnection(connection);
	//mysql.releasedbConnection(connection);
}

exports.deleteMovie = deleteMovie;

function selectMovieById(callback, movieId) {
	var connection = mysql.createdbConnection();
	//var connection = mysql.getdbConnection();
	//connection.query("SELECT movie_id, movie_name, movie_banner, release_date, rent_amount, available_copies, category FROM movie WHERE movie_id  = '" + movieId + "'", function(error, results) {
	connection.query("SELECT movie_id, movie_name, movie_banner, release_date, rent_amount, available_copies, category FROM movie WHERE movie_id  = ?",[movieId], function(error, results) {
		if(!error) {
			//console.log(results);
			if(results.length !== 0) {
				console.log("Movie details selected for " + movieId);
			}
		} else {
			console.log(error);
		}
		callback(results, error);
	});
	mysql.closedbConnection(connection);
	//mysql.releasedbConnection(connection);
}

exports.selectMovieById = selectMovieById;

function selectUsersIssuedMovie(callback, movieId) {
	var connection = mysql.createdbConnection();
	//var connection = mysql.getdbConnection();
	//connection.query("SELECT DISTINCT(user_id), firstname, lastname FROM user_movie_mapping INNER JOIN users ON users.user_id = user_movie_mapping.userid WHERE movie_id  = '" + movieId + "'", function(error, results) {
	connection.query("SELECT DISTINCT(user_id), firstname, lastname FROM user_movie_mapping INNER JOIN users ON users.user_id = user_movie_mapping.userid WHERE movie_id  = ?",[movieId], function(error, results) {
		if(!error) {
			//console.log(results);
			if(results.length !== 0) {
				console.log("User details selected for " + movieId);
			}
		} else {
			console.log(error);
		}
		callback(results, error);
	});
	mysql.closedbConnection(connection);
	//mysql.releasedbConnection(connection);
}

exports.selectUsersIssuedMovie = selectUsersIssuedMovie;

function selectUsersCurrentlyIssuedMovie(callback, movieId) {
	console.log(movieId);
	var connection = mysql.createdbConnection();
	//var connection = mysql.getdbConnection();
	//connection.query("SELECT DISTINCT(user_id), firstname, lastname FROM user_movie_mapping INNER JOIN users ON users.user_id = user_movie_mapping.userid WHERE return_date IS NULL AND movie_id  = '" + movieId + "'", function(error, results) {
	connection.query("SELECT DISTINCT(user_id), firstname, lastname FROM user_movie_mapping INNER JOIN users ON users.user_id = user_movie_mapping.userid WHERE return_date IS NULL AND movie_id  = ?",[movieId], function(error, results) {
		if(!error) {
			//console.log(results);
			if(results.length !== 0) {
				console.log("User details selected for " + movieId);
			}
		} else {
			console.log(error);
		}
		callback(results, error);
	});
	mysql.closedbConnection(connection);
	//mysql.releasedbConnection(connection);
}

exports.selectUsersCurrentlyIssuedMovie = selectUsersCurrentlyIssuedMovie;




function selectMovies(callback) {
	var query = "SELECT movie_id, movie_name, movie_banner, release_date, rent_amount, available_copies, category FROM movie LIMIT 1000";
	cache.get(function(rows){
		if(rows == null){
			var connection = mysql.createdbConnection();
			//var connection = mysql.getdbConnection();
			// Limited to 1000 for development purpose.
			connection.query(query, function(error, results) {
				if(!error) {
					//console.log(results);
					if(results.length !== 0) {
						cache.put(query, results, cacheTimeout);
						console.log("Movie details selected");
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

exports.selectMovies = selectMovies;

function selectMovieBySearchCriteria(callback, movieName, banner, releaseDate, category, minPrice, maxPrice, isAvailable) {
	var connection = mysql.createdbConnection();
	//var connection = mysql.getdbConnection();
	var query = "SELECT movie_id, movie_name, movie_banner, release_date, rent_amount, available_copies, category FROM movie WHERE ";
	var andFlag = false;
	var parameters = [];
	var count = 0;
	if(movieName != null && movieName != "") {
		parameters[count++] = "%" + movieName + "%";
		query +=" movie_name LIKE ?";
		andFlag = true;
	}
	if(banner != null && banner != "") {
		if(andFlag) {
			query += " AND ";
		}
		parameters[count++] = "%" +banner + "%";
		query +=" movie_banner LIKE ?";
		andFlag = true;
	}
	if(releaseDate != null && releaseDate != "") {
		if(andFlag) {
			query += " AND ";
		}
		parameters[count++] = releaseDate;
		query +=" release_date = ?";
		andFlag = true;
	}
	if(category != null && category != "") {
		if(andFlag) {
			query += " AND ";
		}
		parameters[count++] = "%" + category + "%";
		query +=" category LIKE ?";
		andFlag = true;
	}
	if(minPrice != null && minPrice != "" && maxPrice != null && maxPrice != "") {
		if(andFlag) {
			query += " AND ";
		}
		parameters[count++] = minPrice;
		parameters[count++] = maxPrice;
		query +=" rent_amount BETWEEN ? AND ?";
		andFlag = true;
	}
	if(isAvailable) {
		if(andFlag) {
			query += " AND ";
		}
		query +=" available_copies <> 0";
		andFlag = true;
	}
	if(!andFlag) {
		query = "SELECT movie_id, movie_name, movie_banner, release_date, rent_amount, available_copies, category FROM movie ";
		parameters = [];
	}
	query += " LIMIT 1000";
	console.log("Query for selectMoviebysearchcriteria: " + query);
	//connection.query(query, function(error, results) {
	connection.query(query, parameters ,function(error, results) {
		if(!error) {
			//console.log(results);
			if(results.length !== 0) {
				console.log("Movie details selected for selectMoviebysearchcriteria");
			}
		} else {
			console.log(error);
		}
		callback(results, error);
	});
	mysql.closedbConnection(connection);
	//mysql.releasedbConnection(connection);
}

exports.selectMovieBySearchCriteria = selectMovieBySearchCriteria;

function selectCategories(callback) {
	var query = "SELECT DISTINCT(category) AS category FROM movie ORDER BY category ASC";
	cache.get(function(rows){
		if(rows == null){
			var connection = mysql.createdbConnection();
			//var connection = mysql.getdbConnection();
			// Limited to 5000 for development purpose.
			connection.query(query, function(error, results) {
				if(!error) {
					//console.log(results);
					if(results.length !== 0) {
						cache.put(query, results, cacheTimeout);
						console.log("Movie category selected");
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

exports.selectCategories = selectCategories;


function selectReleaseDate(callback) {
	var query = "SELECT DISTINCT(release_date) AS release_date FROM movie ORDER BY release_date DESC";
	cache.get(function(rows){
		if(rows == null){
			var connection = mysql.createdbConnection();
			//var connection = mysql.getdbConnection();
			connection.query(query, function(error, results) {
				if(!error) {
					//console.log(results);
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
			//mysql.releasedbConnection(connection);
		} else {
			callback(rows, null);
		}
	},query);
}

exports.selectReleaseDate = selectReleaseDate;
