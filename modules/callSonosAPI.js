var http = require('axios'),
    jsonfile = require('jsonfile'),
    SonosAPI;

jsonfile.readFile('settings.json', function(err, obj) {
    settings = obj;
    SonosAPI = settings.api;
});

function setGroupPreset(group) {
    var url = 'http://' + SonosAPI + '/preset/' + group;
    return http.get(url).then(function(response) {
        var data = response.data;
        return new Promise(function(fulfill, reject) {

            if (!data) {
                reject(new Error('API not available!'));
            }
            fulfill(data);
        });
        return data;
    });
};

function sayPlayer(pl, ms, vol, lang) {
    var url = 'http://' + SonosAPI + pl + '/say/' + ms + '/' + lang + '/' + vol;
    return http.get(url).then(function(response) {
        var data = response.data;
        return new Promise(function(fulfill, reject) {

            if (!data) {
                reject(new Error('API not available!'));
            }
            fulfill(data);
        });
        return data;
    });
};

function sayAllPlayer( ms, vol, lang) {
    var url = 'http://' + SonosAPI + '/sayall/' + ms + '/' + lang + '/' + vol;
    return http.get(url).then(function(response) {
        var data = response.data;
        return new Promise(function(fulfill, reject) {

            if (!data) {
                reject(new Error('API not available!'));
            }
            fulfill(data);
        });
        return data;
    });
};

function stopAllPlayer() {
    var url = 'http://' + SonosAPI + '/pauseall';
    return http.get(url).then(function(response) {
        var data = response.data;
        return new Promise(function(fulfill, reject) {

            if (!data) {
                reject(new Error('API not available!'));
            }
            fulfill(data);
        });
        return data;
    });
};

function playEnterpriseHupe(player, clip, volume){
    var url = 'http://' + SonosAPI + '/' + player + "/clip/" + clip + "/" + volume;
    return http.get(url).then(function(response) {
        var data = response.data;
        return new Promise(function(fulfill, reject) {

            if (!data) {
                reject(new Error('API not available!'));
            }
            fulfill(data);
        });
        return data;
    });
};

function getplayers(){
    var allPlayers = [],
        cachefile = './cache/players.json';

    return http.get('http://' + SonosAPI + '/zones').then(function(response) {
        var data = response.data;
        return new Promise(function(fulfill, reject) {
            if (!data.length) {
                jsonfile.readFile(cachefile, function(err, obj) {
                    allPlayers = obj;
                    console.log(err);
                });
                reject(new Error('No data given'));
            }

            data.forEach(function(items) {
                items.members.forEach(function(item){
                    allPlayers.push(item.roomName);
                });
            });

            jsonfile.writeFile(cachefile, allPlayers, function (err) {
                if (err) {
                    console.log(err);
                }
            });

            fulfill(allPlayers);
        });

        return allPlayers;
    });
};

function getfavorites(){
    var allPlayers = [],
        cachefile = './cache/favorites.json';

    return http.get('http://' + SonosAPI + '/favorites').then(function(response) {
        var data = response.data;
        return new Promise(function(fulfill, reject) {

            if (!data.length) {
                jsonfile.readFile(cachefile, function(err, obj) {
                    data = obj;
                    console.log(err);
                });
                reject(new Error('No data given'));
            }
            jsonfile.writeFile(cachefile, data, function (err) {
                if (err) {
                    console.log(err);
                }
            });

            fulfill(data);
        });


        return allPlayers;
    });
};

module.exports = {
    sayAllPlayer,
    sayPlayer,
    setGroupPreset,
    stopAllPlayer,
    playEnterpriseHupe,
    getplayers,
    getfavorites
};