/**
 * New node file
 */
var expect = require("chai").expect,
 testmovie = require('../util/Moviedb');
 user = require('../util/Userdb');

describe('TestMovieSelectbyId', function(){
   it('should exist', function(done){
      var movieId="4";
      testmovie.selectMovieById(function(results,err) {
    	  if (err) return done(err);
    	  console.log("----Test 1:Select Movie----\n");
    	  console.log(results);
    	  console.log("----End of Test1----");
    	  expect(results[0]).to.have.a.property("movie_id",4);
    	  done();
    	},movieId);
      })
  
})


describe('testMovieInsertMovie',function(){
	it('should insert movie', function(done){
		var movie=[];
		movie.movieName = 'testMovie'
		movie.movieBanner = 'testBanner';
		movie.rentAmount = '2';
		movie.releaseDate = '2048';
		movie.availableCopies = '5';
		movie.category = "Comedy, Drama";
		testmovie.insertMovie(function(results,err){
			if (err) return done(err);
	    	  console.log('logging mocha');
	    	  console.log(results);
	    	  //expect(results[0]).to.have.a.property("user_id",2);
	    	  done();
		},movie);
	})
});

describe('testMovieEditMovie',function(){
	it('should edit movie', function(done){
		var movie=[];
		movie.movie_id = '85559';
		movie.movie_name = 'testMovie1';
		movie.movie_banner = 'testBanner1';
		movie.rent_amount = '2';
		movie.release_date = '2072';
		movie.available_copies = '5';
		movie.category = "Comedy, Drama";
		testmovie.editMovie(function(results,err){
			if (err) return done(err);
	    	  console.log('logging mocha');
	    	  console.log(results);
	    	  //expect(results[0]).to.have.a.property("user_id",2);
	    	  done();
		},movie);
	})
});

   
describe('TestMovieDelete',function(){
	it('should delete movie', function(done){
		var movieId="85561";
		testmovie.deleteMovie(function(results,err){
			if (err) return done(err);
			console.log("----Test 2:Delete Movie----\n");
	    	  console.log('logging mocha');
	    	  console.log(results);
	    	  console.log("---End of Test 2 ----");
	    	  //expect(results[0]).to.have.a.property("user_id",2);
	    	  done();
		},movieId);
	})
});

describe('TestselectUsersIssuedMovie',function(){
	it('should get users', function(done){
		var movieId="4";
		testmovie.selectUsersIssuedMovie(function(results,err){
			if (err) return done(err);
			console.log("----Test :selectUsersIssuedMovie----\n");
	    	  console.log('logging mocha');
	    	  console.log(results);
	    	  console.log("---End of Test  ----");
	    	  expect(results[0]).to.have.a.property("user_id",1);
	    	  done();
		},movieId);
	})
});

describe('TestselectUsersCurrentlyIssuedMovie',function(){
	it('should get current users', function(done){
		var movieId="4";
		testmovie.selectUsersCurrentlyIssuedMovie(function(results,err){
			if (err) return done(err);
			console.log("----Test :selectUsersCurrentlyIssuedMovie----\n");
	    	  console.log('logging mocha');
	    	  console.log(results);
	    	  console.log("---End of Test  ----");
	    	  expect(results[0]).to.have.a.property("user_id",1);
	    	  done();
		},movieId);
	})
});

describe('TestSelectMovieBySearchCriteria',function(){
	it('should select movies by search criteria', function(done){
		var movieName="Centac";
		var banner="";
		var releaseDate="2010";
		var category="";
		var minPrice="";
		var maxPrice="";
		var isAvailable="";
		
		//console.log();
		testmovie.selectMovieBySearchCriteria(function(results,err){
			console.log("logging search results for search movie by search criteria "+ results[0]);
	    		  expect(results[0]).to.have.a.property("movie_id",7973);
	    	  done();
	    	}, movieName, banner, releaseDate, category, minPrice, maxPrice,isAvailable);
	})
});