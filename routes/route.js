module.exports = function(app, bcryptnodejs, mail) {
    var smtpTransport = mail.createTransport("SMTP", {
        service: "Gmail",
        auth: {
            user: "souravmondal.cn@gmail.com",
            pass: "sourav10"
        }
    });
    var login = require("../app/controllers/login");
    //index page(login)
    app.get("/", function(req, res) {
        res.render("index");
    });
//register page
    app.get("/register", function(req, res) {
        res.render("register");
    });
//processing registration
    app.post("/registerprocess", function(req, res) {
        require("../app/models/users");
        var username = req.body.username;
        var password = bcryptnodejs.hashSync(req.body.userpass);
        var goodname = req.body.goodname;
        var useremail = req.body.useremail;
        User.findOne({'username': username}, function(err, data) {
            if (data === null) {
                new User({
                    username: username,
                    password: password,
                    goodname: goodname,
                    useremail: useremail
                }).save(function(err, user) {
                    if (err) {
                        res.render("register", {msg: "Error In registration"});
                    } else {
                        //sending mail to user
                        var mailOptions = {
                            from: "Sourav Mondal <souravmondal.cn@gmail.com>", // sender address
                            to: useremail, // list of receivers
                            subject: "New User Registration", // Subject line
                            html: "<b>Registration Successful</b>" + // html body
                                    "<br/><b>Hello " + goodname + "</b>" +
                                    "<br/>Your Password: " + req.body.userpass
                        };
                        // send mail with defined transport object
                        smtpTransport.sendMail(mailOptions, function(error, response) {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log("Message sent: " + response.message);
                            }
                        });
                        res.render("index", {msg: "Successfully Regsitered"})
                    }
                });
            } else {
                res.render("register", {msg: "Username already taken"});
            }
        });
    });
//processing login
    app.post("/loginprocess", function(req, res) {
        require("../app/models/users");
        var username = req.body.username;
        var password = req.body.userpass;
        if (username === "" || password === "") {
            res.render("index", {msg: "Username and password can not be blank"});
        } else {
            User.findOne({username: username}, function(err, data) {
                if (err) {
                    res.render("index", {msg: err});
                } else if (!data) {
                    res.render("index", {msg: "Login Failed"});
                } else {
                    if (bcryptnodejs.compareSync(password, data.password)) {
                        req.session.goodname = data.goodname;
                        req.session.username = data.username;
                        res.render("home", {user_goodname: req.session.goodname, username: req.session.username});
                    } else {
                        res.render("index", {msg: "Login Failed"});
                    }
                }
            });
        }
    });
//preventing direct access to loginprocess
    app.get("/loginprocess", login.login2);
//direct access to home
    app.get("/home", function(req, res) {
        if (typeof req.session.goodname === 'undefined') {
            res.render('index', {msg: 'login required'});
        } else {
            res.render("home", {user_goodname: req.session.goodname, username: req.session.username});
        }
    });
//logout processing
    app.get("/logout", function(req, res) {
        if (typeof req.session.goodname === 'undefined') {
            res.render('index', {msg: 'logout without login?'});
        } else {
            delete req.session.goodname;
            delete req.session.username;
            res.render("index", {msg: "logout Successfully"});
        }
    });
//viewing all users list
    app.get("/allusers", function(req, res) {
        require("../app/models/users");
        User.find(function(err, data) {
            if (err) {
                res.render("viewall", {msg: err});
            } else {
                res.render("viewall", {allusers: data});
            }
        });
    });
//deleting user
    app.get("/deleteuser/:username", function(req, res) {
        require("../app/models/users");
        User.remove({username: req.params.username}, function(err) {
            res.redirect("/allusers");
        });
    });
//editing user profile
    app.get("/editprofile/:username", function(req, res) {
        if (req.session.username === req.params.username) {
            var username = req.params.username;
            if (typeof username === "undefined") {
                res.send("No Valid Name Received");
            } else {
                require("../app/models/users");
                User.find({username: username}, function(err, data) {
                    if (err) {
                        res.send(err);
                    } else if (data.length == 0) {
                        res.send("No User Found");
                    } else {
                        res.render("edituser", {userdata: data[0]});
                    }
                });
            }
        } else {
            delete req.session.username;
            delete req.session.goodname;
            res.render("index", {msg: "login first"});
        }
    });
    app.post("/updateuserdata", function(req, res) {
        var username = req.body.username;
        var goodname = req.body.goodname;
        var password = bcryptnodejs.hashSync(req.body.userpass);
        var useremail = req.body.useremail;
        require("../app/models/users");
        if (req.body.userpass === "") {
            var userdata = {
                goodname: goodname, useremail: useremail
            };
        } else {
            var userdata = {
                goodname: goodname, useremail: useremail, password: password
            };
        }
        User.update({username: username}, userdata, function(err) {
            req.session.goodname = goodname;
            req.session.username = username;
            res.render("home", {user_goodname: req.session.goodname, username: req.session.username});
        });
    });
//reading json data from api
    app.get('/readjon', function(req, res) {
        var request = require("request");
        //var url = "http://localhost/testproject/returnjson.php";
        //var url = "http://localhost/testproject/returnjson.php?filterby=ID&filtervalue=88";
        var url = "http://localhost/testproject/returnjson.php?filterby=post_type&filtervalue=attachment";
        request({
            url: url,
            json: true
        }, function(error, response, body) {
            if (!error && response.statusCode === 200 && body !== null) {
                //res.send(body);
                res.render("jsonimg", {jdata: body, img_width: 200});
            } else {
                res.send("please check api parameters");
            }
        })
    });
    //chat page
    app.get("/chat", function(req, res) {
        if (typeof req.session.goodname === "undefined") {
            res.render("index");
        } else {
            res.render("chat", {goodname: req.session.goodname});
        }

    });
//defining 404 page(this should be always at bottom) 
//for get method
    app.get('*', function(req, res) {
        res.render("404");
    });
//for post method
    app.post('*', function(req, res) {
        res.redirect("/");
    });
};