'use strict';

var http = require('axios'),
    jsonfile = require('jsonfile'),
    SonosAPI;

jsonfile.readFile('settings.json', function(err, obj) {
    var settings = obj;
    SonosAPI = settings.api;
});

function setPreset(preset) {
    var url = 'http://' + SonosAPI + '/preset/' + JSON.stringify(preset);
    return http.get(url).then(function(response) {
        var data = response.data;
        return new Promise(function(fulfill, reject) {

            if (!data) {
                reject(new Error('API not available!'));
            }
            console.log(data);
            fulfill(data);
        });
        return data;
    });
};

function setTextToSpeak(language, player, text, volume) {
    var url = "";
    if (player === "all"){
        url = 'http://' + SonosAPI + '/sayall/' + text + '/' + language + '/' + volume;
    } else {
        url = 'http://' + SonosAPI + '/' + player + '/say/' + text + '/' + language + '/' + volume;
    }
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

function getplayers(){
    var cachefile = './cache/players.json',
        players,
        allPlayers = [],
        dataPlayers = [];

    jsonfile.readFile(cachefile, function(err, obj) {
        players = obj,
        allPlayers = players;
    });

    return http.get('http://' + SonosAPI + '/zones').then(function(response) {
        var data = response.data;
        return new Promise(function(fulfill, reject) {
            if (!data.length) {
                reject(new Error('API not available!'));
            }
            data.forEach(function(items) {
                items.members.forEach(function(item){
                    var p = 0;
                    for (var i = 0;i < players.length; i++){
                        if (players[i] === item.roomName){
                            p++;
                        }
                    }
                    if (p === 0) {
                        allPlayers.push(item.roomName);
                    }
                });
            });
            allPlayers.forEach(function (player) {
                var online = false;
                data.forEach(function(items) {
                    items.members.forEach(function(item){
                        if (player === item.roomName){
                            online = true;
                        }
                    });
                });
                if (online){
                    dataPlayers.push({ name: player, online: true });
                } else {
                    dataPlayers.push({ name: player, online: false });
                }
            });

            jsonfile.writeFile(cachefile, allPlayers, function (err) {
                if (err) {
                    console.log(err);
                }
            });
            fulfill(dataPlayers);
        });
        return dataPlayers;

    });
};

function getfavorites(){
    var allPlayers = [],
        cachefile = './cache/favorites.json',
        favorits;

    jsonfile.readFile(cachefile, function(err, obj) {
        favorits = obj;
    });

    return http.get('http://' + SonosAPI + '/favorites').then(function(response) {
        var data = response.data;
        return new Promise(function(fulfill, reject) {

            if (!data.length) {
                reject(new Error('API not available!'));
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
    setPreset,
    setTextToSpeak,
    stopAllPlayer,
    getplayers,
    getfavorites
};