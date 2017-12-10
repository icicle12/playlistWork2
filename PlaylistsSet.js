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
        if (ev.msg == '!playlists')
        {
            var Omsg = 'Official Playlists: ';
            var Umsg = 'Unofficial Playlists: ';
            var playlists = sinusbot.playlists();
            var playlistNames = [];
            for (var key in playlists) { //playlists is fradulent so I need to place them into a real array
                playlistNames.push(sinusbot.playlistGet(key).name);
            }
            var len = playlistNames.length;
            for (i = 0; i < len; i++) {
                Omsg = Omsg + playlistNames[i];
                if (i + 1 != len)
                    Omsg = Omsg + ', ';
            }
            //check
            var check = sinusbot.getVar('publicPlaylists');
            var playlists2 = [];
            if ((typeof check != 'undefined') && (check.length != 0)) {
                playlists2.push.apply(playlists2, check);
            }
            else
                Umsg = 'No unofficial playlists';
            var len2 = playlists2.length;
            for (j = 0; j < len2; j++)
            {
                Umsg = Umsg + playlists2[j];
                if (j + 1 != len2)
                    Umsg = Umsg + ', ';
            }
            sinusbot.chatChannel(Omsg);
            sinusbot.chatChannel(Umsg);
        }
        
        if  (ev.msg == '!delaup') {
            sinusbot.unsetVar('publicPlaylists');
            return;
        }
        
        if (ev.mode != 2)
            return;
        
        var check = sinusbot.getVar('publicPlaylists');
        var playlists = [];
        if (typeof check != 'undefined') {
            playlists.push.apply(playlists, check);
        }
 
        var message = ev.msg;
        var start = message.substring(0, 16); //'createplaylists '
        var start2 = message.substring(0, 9); //'createp '
        //target is the name of the playlist entered by the client 
        var target = '';
        if (start == '!createplaylist ') {
            target = message.substring(16);
            target = target.toLowerCase();
        }
        else if (start2 == '!createp ') {
            target = message.substring(9);
            target = target.toLowerCase();
        }

        //remove string empty spaces, 
        //if entire string was empty or was empty spaces, return
        while (target.charAt(0) == ' ') {
            target = target.substring(1);
        }
        if (target == '')
            return;

        var len = playlists.length;
        if ((start == '!createplaylist ') || (start2 == '!createp ')) {
            //iterate through playlists to make sure that the name of the playlist being created isn't already in use
            for (i = 0; i < len; i++) {
                if (playlists [i] == target) {
                    sinusbot.chatPrivate(ev.clientId, 'There is already a playlist with this name');
                    return;
                }
            }
            //if the name check is ok, push the playlist name into playlists and set it as a key
            playlists.push(target);
            sinusbot.unsetVar('publicPlaylists', playlists);
            sinusbot.setVar('publicPlaylists', playlists);
            return;
        }
        
    });
});
