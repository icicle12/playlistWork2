// JavaScript source code
registerPlugin({
    name: 'Public Playlists',
    version: '1.0',
    backends: ['ts3', 'discord'],
    engine: '>= 0.9.16',
    description: 'Allows clients to create playlists',
    author: 'Shawye H. <shawye@ucla.edu>',
    vars: []
}, function (sinusbot, config) {
    sinusbot.on('chat', function (ev) {
