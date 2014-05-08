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
     * [getIssueEventsForRepository description]
     *
     * @param  {[type]}   user     [description]
     * @param  {[type]}   project  [description]
     * @param  {Function} callback [description]
     *
     * @return {[type]}            [description]
     */
    var getIssueEventsForRepository = exports.getIssueEventsForRepository = function(user, project, callback) {
        $.ajax({
            'url': 'https://api.github.com/repos/' + user + '/' + project + '/issues/events',
            'method': 'GET',
            'headers': {
                'Authorization': 'token ' + require('bd.core').data.token
            },
            'success': function(data) {
                callback(null, data);
            }
        });
    };

    /**
     * [getPullCommentEventsForRepository description]
     *
     * @param  {[type]}   user     [description]
     * @param  {[type]}   project  [description]
     * @param  {Function} callback [description]
     *
     * @return {[type]}            [description]
     */
    var getPullCommentEventsForRepository = exports.getPullCommentEventsForRepository = function(user, project, callback) {
        $.ajax({
            'url': 'https://api.github.com/repos/' + user + '/' + project + '/pulls/comments',
            'method': 'GET',
            'data': {
                'direction': 'desc',
                'sort': 'created'
            },
            'headers': {
                'Authorization': 'token ' + require('bd.core').data.token
            },
            'success': function(data) {
                callback(null, data);
            }
        });
    };

    /**
     * [getClosedIssues description]
     *
     * @param  {[type]}   user     [description]
     * @param  {[type]}   project  [description]
     * @param  {Function} callback [description]
     *
     * @return {[type]}            [description]
     */
    var getClosedIssues = exports.getClosedIssues = function(user, project, callback) {
        var closedIssues = [];

        var getIssues = function(_page, _callback) {
            $.ajax({
                'url': 'https://api.github.com/repos/' + user + '/' + project + '/issues',
                'method': 'GET',
                'data': {
                    'page': _page,
                    'state': 'closed'
                },
                'headers': {
                    'Authorization': 'token ' + require('bd.core').data.token
                },
                'success': function(data) {
                    if (data.length) {
                        closedIssues = closedIssues.concat(data);
                        _page = _page + 1;
                        getIssues(_page, _callback);
                    } else {
                        _callback();
                    }
                },
                'error': function() {
                    _callback();
                }
            });
        };

        // Get the closed issues
        getIssues(1, function() {
            callback(null, closedIssues);
        });
    };

    /**
     * [getOpenIssues description]
     *
     * @param  {[type]}   user     [description]
     * @param  {[type]}   project  [description]
     * @param  {Function} callback [description]
     *
     * @return {[type]}            [description]
     */
    var getOpenIssues = exports.getOpenIssues = function(user, project, callback) {
        var openIssues = [];

        var getIssues = function(_page, _callback) {
            $.ajax({
                'url': 'https://api.github.com/repos/' + user + '/' + project + '/issues',
                'method': 'GET',
                'data': {
                    'page': _page,
                    'state': 'open'
                },
                'headers': {
                    'Authorization': 'token ' + require('bd.core').data.token
                },
                'success': function(data) {
                    if (data.length) {
                        openIssues = openIssues.concat(data);
                        _page = _page + 1;
                        getIssues(_page, _callback);
                    } else {
                        _callback(openIssues);
                    }
                },
                'error': function() {
                    _callback();
                }
            });
        };

        // Get the closed issues
        getIssues(1, function() {
            callback(null, openIssues);
        });
    };
});
