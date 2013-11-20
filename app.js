var express = require('express')
    , http = require('http')
    , path = require('path')
    , util = require('util')
    , fs = require('fs')
    , reload = require('reload')
    , assert = require('assert')
    , sass = require('node-sass');

fs.readFile(__dirname + '/config.json', 'utf8', function (err, data) {
    if (err) {
        console.log('Error reading config: ' + err);
        process.exit(1);
    }
    var config = JSON.parse(data)
    
    process.env.NODE_ENV = config.env;

    var app = express()
        , publicDir = path.join(__dirname, 'public')
        , clientDir = path.join(__dirname, 'client')
        , db = require('mongojs').connect('localhost/developersguild', [app.settings.env]);

    app.configure(app.settings.env, function(){
        app.set('port', config[app.settings.env].port);
        app.use(express.logger('dev'));
        app.use(express.bodyParser()); //parses json, multi-part (file), url-encoded
        app.use(app.router); //need to be explicit, (automatically adds it if you forget)
        app.use(express.static(clientDir)); //should cache static assets
    });
    
    app.get('*', function(req, res) {
        fs.exists(path.join(publicDir, req.url), function(exists) {
            if(exists){
                res.sendfile(path.join(publicDir, req.url));
            }else{
                res.send('404');
            }
        });
    });

    var server = http.createServer(app);
    reload(server, app);
    server.listen(app.get('port'), function(){
        console.log("\n\nNode.js server listening on port " + app.get('port') + " (" + app.settings.env + ").");
    });

});