// JavaScript source code
registerPlugin({
    name: 'Public Playlists',
    version: '1.0',
    backends: ['ts3', 'discord'],
    engine: '>= 0.9.16',
    description: 'Allows clients to create playlists',
    author: 'Shawye H. <shawye@ucla.edu> & Steven H. <stahill@ucsc.edu>',
    vars: []
}, function (sinusbot, config) {
    sinusbot.on('chat', function (ev) {
    
     var check = sinusbot.getVar('publicPlaylists');
     var playlists = [];
     if (typeof check != 'undefined') {
            playlists.push.apply(playlists, check);
