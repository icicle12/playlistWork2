// JavaScript source code
registerPlugin({
    name: 'ShowAllPlaylists',
    version: '1.0',
    description: 'Shows all playlists with !playlists',
    author: 'Shawye H. <shawye@ucla.edu> & Steven H. <stahill@ucsc.edu>',
    vars: []

}, function (sinusbot, config) {
    sinusbot.on('chat', function (ev) {
        if (ev.msg == '!playlists')
        {
            var Omsg = 'Official Playlists: ';
            var Umsg = 'Unofficial Playlists: ';
            var playlists = sinusbot.playlists();
            var len = playlists.length;
            for (i = 0; i < len; i++) {
                Omsg = Omsg + sinusbot.playlistGet(playlist[i]).name;
                if (i + 1 != len)
                    Omsg = Omsg + ', ';
            }
            var check = sinusbot.getVar('publicPlaylists');
            var playlists2 = [];
            if ((typeof check != 'undefined') && (check.length != 0) {
                playlists2.push.apply(playlists2, check);
            }
            else
                Umsg = 'No unofficial playlists';
            var len2 = playlists2.length;
            for (j = 0; j < len2; j++)
            {
                Umsg = Umsg + playlists[j];
                if (j + 1 != len2)
                    Umsg = Umsg + ', ';
            }
            sinusbot.chatChannel(Omsg);
            sinusbot.chatChannel(Umsg);
        }
    });
});
