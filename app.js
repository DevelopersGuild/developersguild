var config = require('./config.js'),
    newrelic = require('newrelic'),
    express = require('express'),
    http = require('http'),
    _ = require('underscore'),
    path = require('path'),
    util = require('util'),
    fs = require('fs'),
    reload = require('reload'),
    assert = require('assert'),
    sass = require('node-sass'),
    colors = require('colors'),
    terminal = require('./modules/terminal/terminal.js'),
    nodeStatic = require('node-static'),
    file = new nodeStatic.Server('./public')


    process.env.NODE_ENV = config.env.use;

var app = express(),
    publicDir = path.join(__dirname, config.fs.publicDir),
    clientDir = path.join(__dirname, config.fs.clientDir),
    db = require('mongojs').connect(config.mongo.ip + '/' + config.mongo.db);

app.configure(app.settings.env, function() {
    app.set('port', config.env[app.settings.env].port);

    if (app.settings.env == 'development') app.use(express.logger('dev'));

    app.use(
        sass.middleware({
            src: path.join(__dirname, config.fs.scss),
            dest: path.join(__dirname, config.fs.publicDir),
            debug: true,
            outputStyle: 'compressed'
        })
    );

    app.use(express.bodyParser()); //parses json, multi-part (file), url-encoded
    app.use(app.router); //need to be explicit, (automatically adds it if you forget)
    app.use(express.static(clientDir)); //should cache static assets
});

app.get('/join', function(req, res) {
    console.dir(req.headers);
    fs.exists(path.join(publicDir, 'join.html'), function(exists) {
        if (exists) {
            res.sendfile(path.join(publicDir, 'join.html'));
        } else {
            res.send('error finding file.');   
        }
    });
});

app.get('/interestform', function(req, res) {
    res.redirect('http://eepurl.com/Nw0Mj');
});

app.get('/googledrive', function(req, res) {
    res.redirect('https://drive.google.com/folderview?id=0B51LFmQf5HbvN3Z2MjY0dExCNzg&usp=sharing');
});

app.get('/mailchimp-hook', function(req, res) {
    console.dir(req);
    var mailChimpTest = db.collection('mailChimpTest');
    mailChimpTest.save({
        'req': req.headers
    }, function(err, data) {
        res.send('');
    });
});

app.get('/', function(req, res) {
    fs.exists(path.join(publicDir, 'index.html'), function(exists) {
        if (exists) {
            res.sendfile(path.join(publicDir, 'index.html'));
        } else {
            res.send('error finding file.');   
        }
    });
});

app.get('/index.html', function(req, res) {
    fs.exists(path.join(publicDir, 'index.html'), function(exists) {
        if (exists) {
            res.sendfile(path.join(publicDir, 'index.html'));
        } else {
            res.send('error finding file.');   
        }
    });
});

app.get('*', function(req, res) {

    file.serve(req, res);

    // res.send('404');

    // if (req.url.indexOf('\0') !== -1) {
    //     return respond('That was evil.');
    // }

    // fs.exists(path.join(publicDir, req.url), function(exists) {
    //     if (exists) {
    //         res.sendfile(path.join(publicDir, req.url));
    //     } else {
    //         res.send('404');
    //     }
    // });
});

var server = app.listen(app.get('port'), function() {
    console.log("\nNode.js server listening on port ".yellow.bold + (app.get('port') + "").cyan.bold + " (".red.bold + app.settings.env.magenta + ").".red.bold);
}),
    io = require('socket.io').listen(server).set('log level', 1);

reload(server, app);

io.sockets.on('connection', function(socket) {

    //Route socket connections
    socket.on('header', function(data) {

        console.dir(socket.handshake);

        if (data.type) {
            switch (data.type) {
                case 'terminal':
                    terminal().start(socket, db, data, (data.init) ? data.init : null, function(err) {
                        if (err) {
                            console.log('Terminal: Error: ' + err);
                        }
                    });

                    break;
            }
        }
    });

});