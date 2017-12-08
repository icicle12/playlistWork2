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
    if (ev.mode != 2)
        return;
        
     var check = sinusbot.getVar('publicPlaylists');
     var playlists = [];
     if (typeof check != 'undefined') {
            playlists.push.apply(playlists, check);
     }
        
    var message = ev.msg;
    var start = message.substring(0, 15); //'createplaylists '
    var start2 = message.substring(0, 8); //'createp '
        //it appears that i made a slight mistake
        sinusbot.chatServer(start);
        sinusbot.chatServer(start2);
    if ((start == 'createplaylist ') || (start2 == 'createp '))
        sinusbot.chatServer(start);
    });
});
