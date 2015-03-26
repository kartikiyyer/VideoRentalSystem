
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var users = require("./routes/Users");
var movie = require("./routes/Movie");
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


app.get('/login', users.login);
app.post('/validateLogin', users.validateLogin);
app.get("/sign-out",users.signOut);
app.get('/createmember', users.createmember);
app.post('/createmember-submit', users.createMemberSubmit);
app.get('/listmember', users.listMember);
app.post("/listmember-submit",users.searchMember);
app.get("/editmember/:id",users.editMember);
app.post("/editmember-submit",users.editMemberSubmit);
app.get("/deletemember/:id",users.deleteMember);

//Movie related operations.
app.get("/createmovie", movie.createmovie);
app.post('/createmovie-submit', movie.createMovieSubmit);
app.get("/listmovie",movie.listMovie);
app.post("/listmovie-submit",movie.searchMovie);
app.get("/movie/:id",movie.showMovie);
app.get("/editmovie/:id",movie.editMovie);
app.post("/editmovie-submit",movie.editMovieSubmit);
app.get("/deletemovie/:id",movie.deleteMovie);
app.get('/', users.index);
app.get("/member/:id",users.showMember);
app.get("/generatebill",users.generateBill);
app.post("/generatebill-submit",users.generateBillSubmit);

app.get("/issuemovie",movie.issueMovie);
app.post("/issuemovie-submit",movie.issueMovieSubmit);
app.post("/issuemovielist-submit",movie.issueSearchMovie);
app.post("/issuemovieselect-submit",movie.issueMovieSelectSubmit);



// User side operations
app.get("/viewusermovies",movie.listMovieUser);
app.post("/viewusermovies-submit",movie.searchMovieUser);
app.get("/usermovie/:id",movie.showMovieUser);
app.get("/user/:id",users.user);
app.get("/changepassword",users.changePassword);
app.post("/changepassword-submit",users.changePasswordSubmit);
app.get("/submitmovie",users.submitMovie);
app.post("/submitmovie-submit",users.submitMovieList);
app.post("/submitmovieselect-submit",users.submitMovieSelectSubmit);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
