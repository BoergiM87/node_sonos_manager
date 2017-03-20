process.env.TZ = 'Europe/Berlin';

var fs = require('fs'),
    express = require('express'),
    formidable = require('formidable'),
    exphbs = require('express-handlebars'),
    path = require('path'),
    bodyParser = require('body-parser'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server),
    exec = require('child_process').exec,
    session = require('express-session'),
    http = require('axios'),
    jsonfile = require('jsonfile'),
    getData = require('./modules/getData'),
    callSonosAPI = require('./modules/callSonosAPI'),
    hbs,
    settings,
    acl,
    users,
    paths;

jsonfile.readFile('settings.json', function(err, obj) {
    settings = obj;
    acl = settings.acl;
    users = settings.users;
    paths = settings.paths;
});

hbs = exphbs.create({
    defaultLayout: 'main',
    helpers: {
        isMenuItemActive: function(site, current, child) {
            if (child) {
                if (site == child) {
                    return 'active';
                }
            }
            if (site == current) {
                return 'active';
            }
            return '';
        },
        ifCond: function(v1, operator, v2, options) {
            switch (operator) {
                case '==':
                    return (v1 == v2) ? options.fn(this) : options.inverse(this);
                case '===':
                    return (v1 === v2) ? options.fn(this) : options.inverse(this);
                case '<':
                    return (v1 < v2) ? options.fn(this) : options.inverse(this);
                case '<=':
                    return (v1 <= v2) ? options.fn(this) : options.inverse(this);
                case '>':
                    return (v1 > v2) ? options.fn(this) : options.inverse(this);
                case '>=':
                    return (v1 >= v2) ? options.fn(this) : options.inverse(this);
                case '&&':
                    return (v1 && v2) ? options.fn(this) : options.inverse(this);
                case '||':
                    return (v1 || v2) ? options.fn(this) : options.inverse(this);
                default:
                    return options.inverse(this);
            }
        }
    }
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 }
}));

app.use(function (req, res, next) {
    jsonfile.readFile('settings.json', function(err, obj) {
        settings = obj;
    });

    acl = settings.acl;
    users = settings.users;
    paths = settings.paths;

    if (!req.session.hasOwnProperty('currentUser')) {
        req.session.currentUser = {
            name: null,
            group: null,
            permissions: {}
        };
    }

    if (req.path !== '/login/' && !req.session.currentUser.name) {
        res.redirect('/login/');
    } else {
        var user = req.session.currentUser,
            group = user.group,
            permissions = acl['not-logged-in'];
        if (group === "users") {
            permissions = acl.defaults;
        }

        if (group === "admins") {
            permissions = acl.admins;
        }

        var hasPermission =  false;

        if (req.path !== '/login/') {
            Object.keys(paths).forEach(function(item) {
                if (req.path === paths[item] && permissions[item] === true) {
                    hasPermission = true;
                    return false;
                }
            });
        } else {
            hasPermission = true;
        }

        user.permissions = permissions;
        res.locals.currentUser = user;

        if (!hasPermission) {
            res.redirect('/');
            return;
        }

        next();
    }
});

app.get('/', function(req, res) {
    res.render('home', {
        title: 'Sonos Manager',
        subtitle: '',
        page: "home",
        child: false
    });
});

app.get('/login/', function(req, res) {
    res.render('login', {
        errorMessage: null,
        title: 'Sonos Manager',
        subtitle: 'Login to Control!',
        page: "login",
        child: false
    });
});

app.post('/login/', function(req, res) {
    if (!req.body.user || !req.body.password) {
        res.render('login', {
            errorMessage: 'The username / password combination was not found. Please try again.',
            title: 'Sonos Manager',
            subtitle: 'Login to control!',
            name: 'login'
        });

        return;
    }

    var data = req.body,
        username = data.user,
        password = data.password,
        group = "",
        login = false;

    users.forEach(function(user){
        if (username === user.name && password === user.password) {
            login = true;
            group = user.group;
        }
    });
    if (login) {
        req.session.currentUser = {
            name: username,
            group: group
        };

        res.redirect('/');
    } else {
        res.render('login', {
            errorMessage: 'The username / password combination was not found. Please try again.',
            title: 'Sonos Manager',
            subtitle: 'Login to Control!',
            page: "login",
            child: false
        });
    }
});

app.get('/logout/', function(req, res) {
    req.session.currentUser = {
        name: null,
        groups: [],
        permissions: {}
    };
    res.redirect('/login/');
});

app.get('/presets/', function (req, res) {
    var presets = getData.presets();
    presets.then(function(presets) {
        res.render('presets', {
            errorMessage: null,
            title: 'Sonos Manager',
            subtitle: 'Load your Presets',
            page: "presets",
            child: false,
            presets: presets
        });
    });
});

app.post('/presets/', function (req, res) {
    if (req.body.loadPreset){
        var loadPreset = req.body.loadPreset,
            name = loadPreset.name,
            file = loadPreset.file,
            successMessage = null,
            errorMessage = null,
            presetData = JSON.parse(fs.readFileSync("./presets/" + file));

        var setPreset = callSonosAPI.setPreset(presetData);

        setPreset.then(function (msg) {
            if(msg.status === "success") {
                successMessage = "Preset: " + name + " has been loaded.";
            } else {
                errorMessage = "Error: " + msg;
            }

            var presets = getData.presets();
            presets.then(function(presets) {
                res.render('presets', {
                    successMessage: successMessage,
                    errorMessage: errorMessage,
                    title: 'Sonos Manager',
                    subtitle: 'Load your Presets',
                    page: "presets",
                    child: false,
                    presets: presets
                });
            });
        });
    }
});

app.get('/settings/setpresets/', function (req, res) {
    var presets = getData.presets();
    presets.then(function(presets) {
        var favs = callSonosAPI.getfavorites();

        favs.then(function (favs) {
            var favdata = [];


            for(i = 0;i<favs.length; i++){
                var optId = favs[i].replace(/\s/g,"-");
                optId = optId.replace("'", "");
                optId = optId.replace("/", "");

                favdata[i] = { optId: optId, name: favs[i] }
            }

            res.render('setpresets', {
                errorMessage: null,
                title: 'Sonos Manager',
                subtitle: 'Setup your Presets',
                page: "setpresets",
                child: "settings",
                presets: presets,
                favorites: favdata
            });
        });


    }).catch(function(err) {
        console.error(err);
    });


});

app.post('/settings/setpresets/', function (req, res) {
    var successMessage = null,
        errorMessage= null;
    if (req.body.preset)  {
         var form = req.body.preset,
             presetName= form.name,
             data = form.data;

         if (data.favorite === '' && data.uri){
             delete data.uri;
             errorMessage = "You have enter a Favorite and a Spotify URI. Only the Favorite are saved."
         } else if (data.favorite === '') {
             delete data.favorite;
         }

         if(data.uri === '') {
             delete data.uri;
         }

         jsonfile.writeFile('./presets/'+ presetName + '.json', data, function (err) {
             if (err) {
                 console.log(err);
             }
         });
     }

     if (req.body.del){
        var delFile = './presets/' + req.body.del,
            name =  req.body.name;
        if (fs.existsSync(delFile)){
            console.log("del:", delFile);
            fs.unlink(delFile);
            successMessage = 'Preset: ' + name + ' has been deleted.'
        }
     }

    var presets = getData.presets();
    presets.then(function(presets) {
        var favs = callSonosAPI.getfavorites();

        favs.then(function (favs) {
            var favdata = [];


            for(i = 0;i<favs.length; i++){
                var optId = favs[i].replace(/\s/g,"-");
                optId = optId.replace("'", "");
                optId = optId.replace("/", "");

                favdata[i] = { optId: optId, name: favs[i] }
            }

            res.render('setpresets', {
                successMessage: successMessage,
                errorMessage: errorMessage,
                title: 'Sonos Manager',
                subtitle: 'Setup your Presets',
                page: "setpresets",
                child: "settings",
                presets: presets,
                favorites: favdata
            });
        });


    }).catch(function(err) {
        console.error(err);
    });

});

app.post('/getdata/', function (req, res) {
    if (req.body.presetFile){
        var getpreset = req.body.presetFile,
            data = [];

        jsonfile.readFile('./presets/' + getpreset, function (err, obj) {
            data = obj;
            res.json({ success: true, data: data });
        });
    }
    if (req.body.getPlayers){
        var players = callSonosAPI.getplayers();

        players.then(function(Players) {
            res.json({ success: true, players: Players });
        });
    }
});

app.post('/controlSonos/', function (req, res) {

});


server.listen(8080);
console.log('Server running on 8080!');
