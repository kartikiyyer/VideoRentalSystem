/**
 * New node file
 */
var expect = require("chai").expect,
 user = require('../util/Userdb');

describe('UserdbSelectRole', function(){
   it('should exist', function(done){
      //var req = {body:{}{}};
      var userId="2";
   // var movieId = "4"
      console.log("----Test 1:Select role----\n");
      user.selectRole(function(results,err) {
    	  if (err) return done(err);
    	  
    	  console.log(results+"\n");
    	  expect(results[0]).to.have.a.property("role_name",'USER');
       	  done();
    	  console.log("----End of Test1----");
    	},userId);
     
      })
  
})

describe('UserdbSelectUserDetails', function(){
   it('should exist', function(done){
      //var req = {body:{}{}};
      var userId="4";
   // var movieId = "4"
      var results = user.selectRole(userId);
      expect(results).to.have.a.property("ROLE_ID","USER");
      console.log(results);
      console.log("----Test 2:Select user details----\n");
      user.selectUserById(function(results,err) {
    	  if (err) return done(err);
    	  console.log(results+"\n");
    	  expect(results[0]).to.have.a.property("user_id",2);
    	  done();
    	  console.log("----End of Test2----");
      },userId);
     
     })
 
})


describe('InsertUser',function(){
	it('should create User', function(done){
		var member=[];
			member.membershipNo= '352130000';
			member.firstname='Tarun';
			member.lastname= 'joshi';
			member.password='abcd';
			member.issuedMovies= 0;
			member.outstandingMovies= 1;
			member.memberType= 'P';
			member.balanceAmount= 25;
			member.roleId='2';
			member.email= 'tarunjoshi2603@gmail.com';
			member.address= '#405, 101 San Fernando';
			member.address2= '101 san fernando st';
			member.city= 'San Jose';
			member.state= 'California';
			member.zip= 95112;
			member.zipext= 0;
			console.log("----Test 3:Create User----\n"); 
		user.insertUser(function(results,err){
			if (err) return done(err);
			console.log(results+"\n");
	       	  //expect(results[0]).to.have.a.property("user_id",2);
	    	  done();
	    	  console.log("----End of Test3----");
		},member);
		 
	})
});

describe('EditUser', function(){
	it('should edit User', function(done){
		var member=[];
		    member.user_id='4';
			//member.membershipNo= '352138989';
			member.firstname='Tarun';
			member.lastname= 'joshi';
			member.password='welcome123';
			member.issuedMovies= 0;
			member.outstandingMovies= 1;
			member.member_type= 'P';
			member.balanceAmount= 25;
			member.roleId='2';
			member.email= 'tarunjoshi0385@gmail.com';
			member.address= '#405, 101 San Fernando';
			member.address2= '101 san fernando st';
			member.city= 'San Jose';
			member.state= 'California';
			member.zip= 95112;
			member.zipext= 0;
			console.log("----Test 4:Edit User----\n");
		user.editUser(function(results,err){
			if (err) return done(err);
			  console.log(results +"\n");
	    	  //expect(results[0]).to.have.a.property("user_id",2);
	    	  done();
	    	  console.log("---End of Test 4 ----");
		},member);
	})
});

describe('deleteUser',function(){
	it('should delete', function(done){
		var userId="3";
		console.log("----Test 5:Delete User----\n");
		user.deleteUser(function(results,err){
			if (err) return done(err);
		  	   console.log(results+ "\n");
	    	  done();
	    	  //expect(results[0]).to.have.a.property("user_id",2);
	    	
		},userId);
	})
});
describe('selectIssuedMovieByUser',function(){
	it('should select issued movie by user', function(done){
		var userId="2";
		//console.log();
		user.selectIssuedMoviesByUser(function(results,err){
			console.log('logging mocha');
	    	  setTimeout(done,400);
	    	  done();
	    	},userId);
	})
});

describe('selectUserByMail',function(){
	it('should select users by mail', function(done){
		var mailId="tarunjoshi2603@gmail.com";
		//console.log();
		user.selectUserByEmail(function(results,err){
			console.log('logging mocha');
	    		  expect(results[0]).to.have.a.property("email","tarunjoshi2603@gmail.com");
	    	  done();
	    	},mailId);
	})
});

describe('selectUserByMembershipNo',function(){
	it('should select users by mail', function(done){
		var membershipNo="352138989";
		//console.log();
		user.selectUserByMembershipNo(function(results,err){
			console.log('logging mocha');
	    		  expect(results[0]).to.have.a.property("email","tarunjoshi0385@gmail.com");
	    	  done();
	    	},membershipNo);
	})
});

describe('selectUserByRole',function(){
	it('should select users by role', function(done){
		var mailId="352138989";
		//console.log();
		user.selectUsers(function(results,err){
			console.log('logging mocha');
	    		 // expect(results[0]).to.have.a.property("email","tarunjoshi2603@gmail.com");
	    	  done();
	    	});
	})
});

describe('selectUserBySearchCriteria',function(){
	it('should select users by search criteria', function(done){
		var membershipNo="352130000";
		var firstname="Tarun";
		var lastname="";
		var memberTypes="";
		var email="";
		var city="";
		var state="";
		var zip1="";		
		var zip2="";
		
		//console.log();
		user.selectUserBySearchCriteria(function(results,err){
			console.log("logging search results for search user by search criteria "+ results);
	    		  expect(results[0]).to.have.a.property("user_id","31");
	    	  done();
	    	}, membershipNo, firstname, lastname, memberTypes, email, city, state, zip1, zip2);
	})
});

describe ('insertUserMovieMapping',function(){
	it('should insert movie into user movie mapping table',function(done){
		user.insertUserMovieMapping(function(results,err){
			console.log('logging mocha');
	    		  //expect(results[0]).to.have.a.property("user_id","4");
	    	  done();
	    	},"2","4");
	})
	});


describe ('updateUserMovieMapping',function(){
	it('should update movie into user movie mapping table',function(done){
		user.insertUserMovieMapping(function(results,err){
			console.log('logging mocha');
	    		  //expect(results[0]).to.have.a.property("user_id","4");
	    	  done();
	    	},"26");
	})
	});