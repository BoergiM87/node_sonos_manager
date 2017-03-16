'use strict';

var path = require('path'),
    fs = require('fs'),
    jsonfile = require('jsonfile');

function presets() {
    return new Promise(function(fulfill, reject) {
        var dir = "./presets",
            filter = ".json";
        fs.readdir(dir, function(err, items) {
            if (err) {
                reject(err);
                return;
            }
            var presets = {},
                p = 0;

            for (var i in items) {
                var filedata = {};

                if(path.extname(items[i]) !== filter) {
                    delete items[i];
                } else {
                    filedata = JSON.parse(fs.readFileSync("./presets/" + items[i]));
                    console.log(filedata);
                    presets[p] = {
                        "name": items[i].slice(0, -5),
                        "file": items[i],
                        "data": filedata
                    };
                    p++;
                }
            };

            fulfill(presets);
        });
    });
};

module.exports = {
    presets
};