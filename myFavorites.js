// JavaScript source code
registerPlugin({
    name: 'Favorite',
    version: '1.0',
    backends: ['ts3', 'discord'],
    engine: '>= 0.9.16',
    description: 'Allows clients to create a list of favorites',
    author: 'Shawye H. <shawye@ucla.edu>',
    vars: []
}, function (sinusbot, config) {
    sinusbot.on('chat', function (ev) {

        //NOTES:
        //sinusbot.setVar(key, object) sets the object to be retrieved with key later
        //sinusbot.getVar(key) returns the object associated with key
        //sinusbot.unsetVar(key) releases the object at key; it is no longer saved
        //sinusbot.chatPrivate(ev.clientId, ev.msg);
        //add current song to favorites
        if ((ev.msg == '!favorite') || (ev.msg == '!f')) {
            var currentTrack = sinusbot.getCurrentTrack();

            //The 'check' code. If favs already exists, check != undefined
            //so favs.push.apply places contents of check into favs
            //otherwise, favs is left initialized as the empty array
            var check = sinusbot.getVar(ev.clientUid);
            var favs = [];
            if (typeof check != 'undefined') {
                favs.push.apply(favs, check);
            }

            //check to see if the current track is already in favs
            //by seeing if any of unique ids of favs matches the currentTrack's id
            var lent = favs.length;
            for (n = 0; n < lent; n++) {
                if (favs[n].uuid == currentTrack.uuid)
                    return;
            }

            //add current track to favs, and rebind the client id to the updated favs
            favs.push(currentTrack);
            sinusbot.unsetVar(ev.clientUid);
            sinusbot.setVar(ev.clientUid, favs);
            return;
        }

        //let people see their favorites
        if ((ev.msg == '!myfavorites') || (ev.msg == '!mf')) {
            
            //the 'check' code, once again. This time, if check is undefined
            //or has length 0, that means it has no favs
            var check = sinusbot.getVar(ev.clientUid);
            var favs = [];
            if ((typeof check != 'undefined') && (check.length != 0)) { //has array of favorites
                favs.push.apply(favs, check);
            }
            else {
                //otherwise no favorites exist
                sinusbot.chatPrivate(ev.clientId, 'no favorites');
                return;
            }

            //for each fav element, add to msg: '[artist] - "[title]"',
            //that make msg a list all of the songs with artists and titles
            var len = favs.length;
            var msg = '';
            for (i = 0; i < len; i++) {
                msg = msg + favs[i].artist + ' - "' + favs[i].title + '"';
                if (i != len - 1)
                    msg = msg + ', ';
            }
            //chat this list to the client
            sinusbot.chatPrivate(ev.clientId, 'Your favorites are: ' + msg);
            return;
        }

        //to clear the favorits, simply remove the favs saved to that client
        if ((ev.msg == '!clearfavorites') || (ev.msg == '!cf')) {
            sinusbot.unsetVar(ev.clientUid);
            return;
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

        //let people play their favorites
        if ((ev.msg == '!playfavorites') || (ev.msg == '!pf')) {
            //'check' code to retrieve favs, this one exits if no favs exists
            var currentTrack = sinusbot.getCurrentTrack();
            var check = sinusbot.getVar(ev.clientUid);
            var favs = [];
            if ((typeof check != 'undefined') && (check.length != 0)) {
                favs.push.apply(favs, check);
            }
            else
                return;
            var len = favs.length;
            //shuffle favs, random order
            favs = shuffle(favs);

            //a setInterval function. By placing queueAppend inside this, 
            //I ensure that queueAppend will be excecuted only every 250 ms. 
            //This allows the songs to be appended one by one, and 
            //prevents problems from appending too rapidly
            //Plays playlist by queuing entire shuffled playlist
            var m = 0;
            var q = setInterval(function() {
                sinusbot.queueAppend('track://' + favs[m].uuid);
                m++;
                if (m == len)
                    clearInterval(q);
            }, 250);
            return;
        }
        
        //this section is for delete, add, and search commands.
        var message = ev.msg;
        var start = message.substring(0, 16); //'!deletefavorite '
        var start2 = message.substring(0, 4); //'!df ' or '!af ' or '!sf '
        var start3 = message.substring(0, 13); //'!addfavorite '
        var start4 = message.substring(0, 17); //'!searchfavorites '
        var target = '';
        //target is always the delete, add, or search string
        //lowercase to make the search not case sensitive
        if (start == '!deletefavorite ') {
            target = message.substring(16);
            target = target.toLowerCase();
        }
        else if (start2 == '!df ') {
            target = message.substring(4);
            target = target.toLowerCase();
        }
        else if (start2 == '!af ') {
            target = message.substring(4);
        }
        else if (start3 == '!addfavorite ') {
            target = message.substring(13);
        }
        else if (start2 == '!sf ') {
            target = message.substring(4);
            target = target.toLowerCase()
        }
        else if (start4 == '!searchfavorites ') {
            target = message.substring(17);
            target = target.toLowerCase();
        }
        else
            return;

        //remove staring empty spaces, 
        //if entire string was empty or was empty spaces, return
        while (target.charAt(0) == ' ') {
            target = target.substring(1);
        }
        if (target == '')
            return;
        
        //'check' retrieval
        var check = sinusbot.getVar(ev.clientUid);
        var favs = [];
        if (typeof check != 'undefined') {
            favs.push.apply(favs, check);
        }
        else if ((start == '!deletefavorite ') || (start2 == '!df ')) //quit if trying to delete with empty favs
            return;

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

        if ((start == '!deletefavorite ') || (start2 == '!df ')) {
            //delete process
            var leng = favs.length;
            //favs is an array of tracks. If I want to use my look function, 
            //I'll need to take only the names and search from those
            var favNames = [];
            for (l = 0; l < leng; l++) {
                var temp = favs[l].title;
                temp = temp.toLowerCase(); //lowercase to make the search not case sensitive
                favNames.push(temp);
            }

            var position = look(favNames, target); //find matching position of the element
            if (position == -1) //quit if not found
                return;
            favs.splice(position, 1); //take item at position position, and remove that 1 element (this is what splice does)
            //take new favs and save it with the client id as the key
            sinusbot.unsetVar(ev.clientUid);
            sinusbot.setVar(ev.clientUid, favs);
            return;
        }
        else if ((start2 == '!af ') || (start3 == '!addfavorite '))
            //add process
        {
            var searchResults = sinusbot.search(target); //sinusbot search for string target
            if (searchResults.length - 1 < 0) //no results, quit 
                // above line of code might not work in this case, because search might not return a true object-array, but that would end the script anyways by crashing it
                return;

            //check for duplicates
            var lent = favs.length;
            for (n = 0; n < lent; n++) {
                if (favs[n].uuid == searchResults[0].uuid)
                    return;
            }

            //add to favs
            favs.push(searchResults[0]);
            sinusbot.unsetVar(ev.clientUid);
            sinusbot.setVar(ev.clientUid, favs);
        }
        else // ((start2 == 'sf ') || (start4 == 'searchfavorites ')) 
        {
            //search process
            var leng = favs.length;
            //once again, create a name array
            var favNames = [];
            for (l = 0; l < leng; l++) {
                var temp = favs[l].title;
                temp = temp.toLowerCase();
                favNames.push(temp);
            }
            //look for match
            var pos = look(favNames, target);
            if (pos == -1) { //no match
                sinusbot.chatPrivate(ev.clientId, 'Favorite not found');
                return;
            }
            //match, say that it is a favorite
            sinusbot.chatPrivate(ev.clientId, [pos].title + ' is a favorite');
            return;
        }

    });
});
