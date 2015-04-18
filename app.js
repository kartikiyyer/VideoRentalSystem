
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var user = require("./routes/Users");
var video = require("./routes/Movie");
var app = express();
var mysql = require("./util/MySQLConnection");
mysql.createdbConnectionPool();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.cookieParser());
app.use(express.session({secret: '1234567890QWERTY'}));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.bodyParser());
app.use(express.methodOverride());

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


app.get('/login', user.login);
app.post('/validateLogin', user.validateLogin);
app.get("/sign-out",user.signOut);
app.get('/createmember', user.createmember);
app.post('/createmember-submit', user.createMemberSubmit);
app.get('/listmember', user.listMember);
app.post("/listmember-submit",user.searchMember);
app.get("/editmember/:id",user.editMember);
app.post("/editmember-submit",user.editMemberSubmit);
app.get("/deletemember/:id",user.deleteMember);

//Video related operations.
app.get("/createmovie", video.createmovie);
app.post('/createmovie-submit', video.createMovieSubmit);
app.get("/listmovie",video.videoList);
app.post("/listmovie-submit",video.searchMovie);
app.get("/movie/:id",video.showMovie);
app.get("/editmovie/:id",video.editMovie);
app.post("/editmovie-submit",video.editMovieSubmit);
app.get("/deletemovie/:id",video.deleteMovie);
app.get('/', user.index);
app.get("/member/:id",user.showMember);
app.get("/generatebill",user.generateBill);
app.post("/generatebill-submit",user.generateBillSubmit);

app.get("/issuemovie",video.issueMovie);
app.post("/issuemovie-submit",video.issueMovieSubmit);
app.post("/issuemovielist-submit",video.issueSearchMovie);
app.post("/issuemovieselect-submit",video.issueMovieSelectSubmit);


// User side operations
app.get('/usercreatemember', user.usercreatemember);
app.post('/usercreatemember-submit', user.userCreateMemberSubmit);
app.get("/usereditmember/:id",user.usereditMember);
app.post("/usereditmember-submit",user.usereditMemberSubmit);
app.get("/viewusermovies",video.listMovieUser);
app.post("/viewusermovies-submit",video.searchMovieUser);
app.get("/usermovie/:id",video.showMovieUser);
app.get("/user/:id",user.user);
app.get("/changepassword",user.changePassword);
app.post("/changepassword-submit",user.changePasswordSubmit);
app.get("/submitmovie",user.submitMovie);
app.post("/submitmovie-submit",user.submitMovieList);
app.post("/submitmovieselect-submit",user.submitMovieSelectSubmit);


app.get("/usergeneratebill",user.usergenerateBill);

app.get("/userissuemovie",video.userissueMovie);
app.post("/userissuemovie",video.userissueMovie);
app.post("/userissuemovielist-submit",video.userissueSearchMovie);
app.post("/userissuemovieselect-submit",video.userissueMovieSelectSubmit);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
