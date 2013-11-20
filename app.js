var express = require('express'),
    http = require('http'),
    path = require('path'),
    util = require('util'),
    fs = require('fs'),
    reload = require('reload'),
    assert = require('assert'),
    sass = require('node-sass');

process.development.PORT = 33840;
process.production.PORT = 33841;


var app = express();


var publicDir = path.join(__dirname, 'public'),
    clientDir = path.join(__dirname, 'client');

app.configure('development', function(){
    app.set('port', process.env.PORT || 3000);
    app.use(express.logger('dev'));
    app.use(express.bodyParser()); //parses json, multi-part (file), url-encoded
    app.use(app.router); //need to be explicit, (automatically adds it if you forget)
    app.use(express.static(clientDir)); //should cache static assets
});

//var db = require('mongojs').connect("localhost/developersguild", [app.settings.env]);
/*
db.main.save({'test': 1234}, function(err, obj){
    if(!err && obj) console.log("Saved " + obj._id + " to db.\n")
});

db.main.find({'test' : 1234}, function(err, obj){ 
    if(err || !obj){
        console.log("Error finding object.\n");
        return false;
    }
    console.log("Found object " + obj[0]._id);

});
*/
app.get('*', function(req, res) {
    //res.sendfile(path.join(publicDir, 'index.html'))
    console.log(req.url);

    fs.exists(path.join(publicDir, req.url), function(exists) {
        console.log(exists);
        if(exists){
            res.sendfile(path.join(publicDir, req.url));
        }else{
            res.send('404');
        }
    });


});

var server = http.createServer(app);

//reload code here
reload(server, app);

server.listen(app.get('port'), function(){
    console.log("Web server listening on port " + app.get('port'));
});