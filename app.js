//Module dependencies.
var express = require('express');
var http = require('http');
var path = require('path');
var app = express();
var flash = require('connect-flash');
var passport = require('passport');
// all environments
app.set('port', process.env.PORT || 3000);
app.set('domain', process.env.VCAP_APP_HOST || 'localhost');
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'ejs');
app.use(express.cookieParser());
app.use(express.session({secret: "souravmondalcnsessionsecretkey1234"}));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
var bcryptnodejs = require('bcrypt-nodejs');
var mail = require("nodemailer");
//socket.io
var io = require('socket.io').listen(app.listen(3001));
io.sockets.on('connection', function(socket) {
    socket.on('send', function(data) {
        io.sockets.emit('message', data);
    });
});
//Calling Routers
var routes = require('./routes/route')(app, bcryptnodejs, mail);
//starting the server and app
http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});
// development only
if ('development' === app.get('env')) {
    app.use(express.errorHandler());
}


