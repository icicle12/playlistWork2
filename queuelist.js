// JavaScript source code
registerPlugin({
    name: 'Queuelist',
    version: '1.0',
    backends: ['ts3', 'discord'],
    engine: '>= 0.9.16',
    description: 'Enter !queuelist to see the tracks in queue',
    author: 'Shawye H. <shawye@ucla.edu>',
    vars: []
}, function (sinusbot, config) {
    sinusbot.on('chat', function (ev) {
        if (ev.mode != 2)
            return;

        if ((ev.msg == '!queuelist') || (ev.msg == '!qlist')) {
            var queuelist = sinusbot.queueGet();
            var len = queuelist.length;
            var msg = '';
            if (len == 0)
                msg = 'There are no songs currently in queue'
            else {
                for (var i = 0; i < len; i++) {
                    msg = msg + queuelist[i].artist + ' - "' + queuelist[i].title + '"';
                    if (i != (len - 1))
                        msg = msg + ', ';
                }
            }
            sinusbot.chatChannel(msg);
            return;
        }

        var media = require('media');

        if ((ev.msg == '!clearqueue') || (ev.msg == '!clearq')){
            media.clearQueue();
            return;
        }
    });
});
