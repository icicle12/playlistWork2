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
        var message = ev.msg;
        message = message.trim(); //trimmed
        if (message == '!playlists') {
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
            for (j = 0; j < len2; j++) {
                Umsg = Umsg + playlists2[j];
                if (j + 1 != len2)
                    Umsg = Umsg + ', ';
            }
            sinusbot.chatChannel(Omsg);
            sinusbot.chatChannel(Umsg);
        }

        //if (message == '!delaup') {
        //    sinusbot.unsetVar('publicPlaylists');
        //    return;
        //}

        if (ev.mode != 2)
            return;

        var check = sinusbot.getVar('publicPlaylists');
        var playlists = [];
        if (typeof check != 'undefined') {
            playlists.push.apply(playlists, check);
        }

        //Fisher-Yates (aka Knuth) Shuffle, taken from a stackoverflow website
        function shuffle(array) {
            var currentIndex = array.length, temporaryValue, randomIndex;

            // While there remain elements to shuffle...
            while (0 !== currentIndex) {

                // Pick a remaining element...
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;

                // And swap it with the current element.
                temporaryValue = array[currentIndex];
                array[currentIndex] = array[randomIndex];
                array[randomIndex] = temporaryValue;
            }

            return array;
        }

             //my search function. takes an array and a search term, then returns the positon of first element of the 
        //array that is a substring of the term, or (if no such element exits), returns the position of the first element 
        //that contains terms as a substring closest to the beginning of array, or -1 if no element meets either of those criteria
        //CASE SENSITIVE!!! MAKE ALL ARGUMENTS LOWERCASE IF YOU WANT IT TO BE CASE INSENSITIVE!
        //returns position in searchArray with term.
            function look(searchArray, term) {
            var len = searchArray.length;
            var namePos = [];
            for (i = 0; i < len; i++) {
                var spot = searchArray[i].indexOf(term); //indexOf() finds the matchin substring
                if (spot == 0) { //if element begins with that substring
                    return i; //return it
                }
                else {
                    if (spot == -1) //element not found, continue
                        continue;
                    else
                        // {itemA: A, itemB: B} Think of it like a struct with 2 items, A and B, which are names itemA and itemB
                        namePos.push({ pos: i, value: spot }) //found but not beginning, place in temporary array with how close it is to the string
                }
            }
            if (namePos.length < 1) //if there is nothing in the temp array, nothing was found. return -1
                return -1;
            namePos.sort(function (a, b) { return a.value - b.value }); //sort to find element with lowest positon
            return namePos[0].pos; //return that position
        }

        
        //finds the . separateor to find the correct argument
        var posi = message.lastIndexOf('.');
        if (posi != -1) { //if we found the .
            var start3 = message.substring(0, posi); //playlist name
            var end = message.substring(posi); //the last few letters
            
            //add functionality
            if ((end == '.addcurrent') || (end == '.addc')) {
                var playlistName = start3.substring(1);
                playlistName = playlistName.toLowerCase();

                var publicPlaylists = sinusbot.getVar('publicPlaylists');
                var len = publicPlaylists.length;
                for (i = 0; i < len; i++) {
                    if (publicPlaylists[i] == playlistName) {
                        var name = sinusbot.getVar(playlistName);
                        var currentTrack = sinusbot.getCurrentTrack();
                        var lenTrack = name.length;
                        for (j = 0; j < lenTrack; j++) {
                            if ((name[j].title == currentTrack.title) && (name[j].artist == currentTrack.artist)) {
                                sinusbot.chatPrivate(ev.clientId, 'This playlist already contains this song');
                                return;
                            }
                        }
                        name.push(currentTrack);
                        sinusbot.unsetVar(playlistName);
                        sinusbot.setVar(playlistName, name);
                        return;
                    }
                }

                sinusbot.chatPrivate(ev.clientId, 'There is no playlist with this name');
                return;
            }
            
            //song list functionality
            if ((end == '.songs') || (end == '.s')) {
                var playlistName = start3.substring(1);
                playlistName = playlistName.toLowerCase();

                var publicPlaylists = sinusbot.getVar('publicPlaylists');
                var len = publicPlaylists.length;
                for (i = 0; i < len; i++) {
                    if (publicPlaylists[i] == playlistName) {
                        var songs = sinusbot.getVar(playlistName);
                        var msg = '';
                        var len2 = songs.length;
                        if (len2 == 0) {
                            sinusbot.chatChannel('There are no songs in this playlist');
                            return;
                        }
                        for (k = 0; k < len2; k++) {
                            msg = msg + songs[k].artist + ' - "' + songs[k].title + '"';
                            if (k != len2 - 1)
                                msg = msg + ', ';
                        }
                        sinusbot.chatChannel(msg);
                        return;
                    }
                }
                sinusbot.chatPrivate(ev.clientId, 'There is no playlist with this name');
                return;
            }

            //play functionality
            if ((end == '.play') || (end == '.p')) {
                var playlistName = start3.substring(1);
                playlistName = playlistName.toLowerCase();

                var publicPlaylists = sinusbot.getVar('publicPlaylists');
                var len = publicPlaylists.length;
                for (i = 0; i < len; i++) {
                    if (publicPlaylists[i] == playlistName) {
                        var songs = sinusbot.getVar(playlistName);
                        var len2 = songs.length;
                        if (len2 == 0) {
                            sinusbot.chatChannel('There are no songs in this playlist');
                            return;
                        }
                        songs = shuffle(songs); //randomize
                        var m = 0;
                        var q = setInterval(function () { //used to successfully append
                            sinusbot.queueAppend('track://' + songs[m].uuid);
                            m++;
                            if (m == len2)
                                clearInterval(q);
                        }, 250);
                        return;
                    }
                }
                sinusbot.chatPrivate(ev.clientId, 'There is no playlist with this name');
                return;
            }
            
            
            //ARGUMENT COMMANDS GO HERE
            var posiSpace = end.lastIndexOf(' ');
            if (posiSpace == -1)
                return;
            var start4 = end.substring(0, posiSpace); //arg command
            var end2 = end.substring(posiSpace); // target string
            if ((start4 == '.search') || (start4 == '.s)) {
                var playlistName = start3.substring(1);
                playlistName = playlistName.toLowerCase();
                
                var publicPlaylists = sinusbot.getVar('publicPlaylists');
                var len = publicPlaylists.length;
                for (i = 0; i < len; i++) {
                    if (publicPlaylists[i] == playlistName) {
                        var songs = sinusbot.getVar(playlistName);
                        var len2 = songs.length;
                        if (len2 == 0) {
                            sinusbot.chatChannel('There are no songs in this playlist');
                            return;
                        }
                        
            }
            sinusbot.chatPrivate(ev.clientId, 'There is no playlist with this name');
            return;                            
        }
        else {
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
                    if (playlists[i] == target) {
                        sinusbot.chatPrivate(ev.clientId, 'There is already a playlist with this name');
                        return;
                    }
                }
                //if the name check is ok, push the playlist name into playlists and set it as a key
                playlists.push(target);
                sinusbot.unsetVar('publicPlaylists', playlists);
                sinusbot.setVar('publicPlaylists', playlists);
                var empty = [];
                sinusbot.setVar(target, empty);
                return;
            }
        }
    });
});
