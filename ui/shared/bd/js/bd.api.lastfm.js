/*
 * Copyright 2014 Digital Services (DS) Licensed under the
 * Educational Community License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *     http://opensource.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

define(['exports', 'jquery'], function(exports, $) {

    /**
     * [parseLastFMTracksIntoEventFeed description]
     *
     * @param  {[type]}   lastfm   [description]
     * @param  {Function} callback [description]
     *
     * @return {[type]}            [description]
     */
    var parseLastFMTracksIntoEventFeed = exports.parseLastFMTracksIntoEventFeed = function(lastfm, callback) {
        var lastFMFeed = [];
        _.each(lastfm, function(lastfmObj, lastfmObjID) {
            _.each(lastfmObj.tracks, function(track, trackID) {
                var displayDate = Date.now();
                if (!track['@attr']) {
                    var playDate = new Date(track.date['#text']);
                    var offsetHours = playDate.getTimezoneOffset() / 60;
                    var l10nTime = playDate.setHours(playDate.getHours() - (offsetHours));
                    displayDate = l10nTime;
                }
                lastFMFeed.push({
                    'user': lastfmObj.user,
                    'track': track,
                    'displayDate': displayDate,
                    'type': 'lastfm-event'
                });
            });
        });
        callback(null, lastFMFeed);
    };

    /**
     * [getLastFMTracks description]
     *
     * @param  {Function} callback [description]
     *
     * @return {[type]}            [description]
     */
    var getLastFMTracks = exports.getLastFMTracks = function(callback) {
        var lastFMUsers = ['bpareyn', 'dis4', 'Coenego', 'timdegroote', 'MrVisser'];
        var userTracksFetched = 0;
        var userProfilesFetched = 0;

        // Render the event feed
        var userTracks = {};

        /**
         * [getLastFMUserProfiles description]
         *
         * @return {[type]} [description]
         */
        var getLastFMUserProfiles = function() {
            $.ajax({
                'url': 'http://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=' + lastFMUsers[userProfilesFetched] + '&api_key=' + require('bd.core').data.tokens.lastfmKey + '&format=json',
                'success': function(data) {
                    userTracks[lastFMUsers[userProfilesFetched]] = userTracks[lastFMUsers[userProfilesFetched]] || {};
                    userTracks[lastFMUsers[userProfilesFetched]].user = data.user;
                    userProfilesFetched++;
                    if (userProfilesFetched !== lastFMUsers.length) {
                        getLastFMUserProfiles();
                    } else {
                        callback(null, userTracks);
                    }
                }
            });
        };

        /**
         * [getLastFMUserTracks description]
         *
         * @return {[type]} [description]
         */
        var getLastFMUserTracks = function() {
            $.ajax({
                'url': 'http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=' + lastFMUsers[userTracksFetched] + '&api_key=' + require('bd.core').data.tokens.lastfmKey + '&format=json',
                'success': function(data) {
                    userTracks[lastFMUsers[userTracksFetched]] = userTracks[lastFMUsers[userTracksFetched]] || {};
                    userTracks[lastFMUsers[userTracksFetched]].tracks = data.recenttracks.track;
                    userTracksFetched++;
                    if (userTracksFetched !== lastFMUsers.length) {
                        getLastFMUserTracks();
                    } else {
                        getLastFMUserProfiles();
                    }
                }
            });
        };

        getLastFMUserTracks();
    };
});
