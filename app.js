var newrelic = require('newrelic')
  , express = require('express')
  , http = require('http')
  , _ = require('underscore')
  , path = require('path')
  , util = require('util')
  , fs = require('fs')
  , reload = require('reload')
  , assert = require('assert')
  , sass = require('node-sass')
  , colors = require('colors')
  , terminal = require('./modules/terminal/terminal.js');

fs.readFile(path.join(__dirname, '/config.json'), 'utf8', function (err, data) {
    if (err) {
        console.log('Error reading config: ' + err);
        process.exit(1);
    }
    var config = JSON.parse(data);
    
    process.env.NODE_ENV = config.env.use;

    var app = express()
      , publicDir = path.join(__dirname, config.fs.publicDir)
      , clientDir = path.join(__dirname, config.fs.clientDir)
      , db = require('mongojs').connect(config.mongo.ip+'/'+config.mongo.db);

    app.configure(app.settings.env, function(){
        app.set('port', config.env[app.settings.env].port);

        if(app.settings.env == 'development') app.use(express.logger('dev'));

        app.use(
             sass.middleware(
                { src: path.join(__dirname, config.fs.scss)
                , dest: path.join(__dirname, config.fs.publicDir)
                , debug: true
                , outputStyle: 'compressed'
                }
             )
         );

        app.use(express.bodyParser()); //parses json, multi-part (file), url-encoded
        app.use(app.router); //need to be explicit, (automatically adds it if you forget)
        app.use(express.static(clientDir)); //should cache static assets
    });
    
    app.get('/join', function(req, res){
        fs.exists(path.join(publicDir, 'join.html'), function(exists) {
            if(exists){
                res.sendfile(path.join(publicDir, 'join.html'));
            }else{
                res.send('error finding file.');
            }
        });
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

    var server = app.listen(app.get('port'), function(){
            console.log("\nNode.js server listening on port ".yellow.bold + (app.get('port')+"").cyan.bold + " (".red.bold + app.settings.env.magenta + ").".red.bold);
        })
      , io = require('socket.io').listen(server).set('log level', 1);

    reload(server, app);

    io.sockets.on('connection', function (socket) {

      //Route socket connections
      socket.on('header', function (data){
        if(data.type){
          switch(data.type){
            case 'terminal':
                terminal().start(socket, db, data, (data.init) ? data.init : null, function(err){
                  if(err){
                    console.log('Terminal: Error: '+err);
                  }
                });

              break;
          }
        }
      });

    });
});




















