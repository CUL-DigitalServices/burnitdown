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

define(['exports', 'jquery', 'markdown'], function(exports, $) {

    var getBuildsForRepository = exports.getBuildsForRepository = function(user, project, callback) {
        $.ajax({
            'url': 'https://api.travis-ci.org/repos/' + user + '/' + project + '/builds',
            'method': 'GET',
            'headers': {
                'Accept': 'application/vnd.travis-ci.2+json'
            },
            'success': function(builds) {
                $.each(builds.builds, function(buildIndex, build) {
                    build.type = 'build-event';
                    build.user = user;
                    build.project = project;
                });
                callback(null, builds.builds);
            }
        });
    };

    var getBuildsForRepositories = exports.getBuildsForRepositories = function(repositories, callback) {
        var currentRepository = 0;
        var builds = [];

        var getNextRepository = function() {
            var repository = repositories[currentRepository];
            getBuildsForRepository(repository.split('/')[0], repository.split('/')[1], function(err, buildsForRepository) {
                if (err) {
                    return callback(err);
                }

                // Add the repository events to the overall list of events
                builds = builds.concat(buildsForRepository);

                currentRepository++;
                if (currentRepository === repositories.length) {
                    return callback(null, builds);
                } else {
                    getNextRepository();
                }
            });
        };

        getNextRepository();
    };
});
