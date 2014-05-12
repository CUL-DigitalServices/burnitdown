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

define(['jquery', 'bd.core', 'underscore', 'timeago', 'highcharts', 'history', 'parseurl'], function ($, bd, _) {

    // Cache the repositories to display data for
    var repositories = null;

    /**
     * Get all event and build data for the specified repositories and render the event feed
     */
    var getEvents = function() {
        // Get the Github event feed
        bd.api.github.getEventsForRepositories(repositories, function(err, events) {
            if (err) {
                return console.error('Error retrieving event feed');
            }

            // Get the Travis CI builds
            bd.api.travis.getBuildsForRepositories(repositories, function(err, builds) {
                if (err) {
                    return console.error('Error retrieving Travis CI build feed');
                }

                events = events.concat(builds);
                events.sort(bd.api.util.sortByDisplayDate);

                // Render the event feed
                var template = $("#dashboard-events-feed-template").html();
                $("#dashboard-events-feed-container").html(_.template(template, {
                    'events': events
                }));
            });
        });
    };

    /**
     * Render a chart that shows the open issues over time
     *
     * @param  {Object[]}    openIssues      Array of open issues
     * @param  {Object[]}    closedIssues    Array of closed issues
     */
    var generateIssuesChart = function(openIssues, closedIssues) {
        var dateCounts = {};
        $.each(openIssues, function(i, open) {
            var createdAt = new Date(open.created_at);
            createdAt = createdAt.getFullYear() + '/' + (createdAt.getMonth() + 1) + '/' + createdAt.getDate();
            dateCounts[createdAt] = dateCounts[createdAt] !== undefined ? dateCounts[createdAt] + 1 : 1;
        });
        $.each(closedIssues, function(i, closed) {
            var createdAt = new Date(closed.created_at);
            createdAt = createdAt.getFullYear() + '/' + (createdAt.getMonth() + 1) + '/' + createdAt.getDate();
            dateCounts[createdAt] = dateCounts[createdAt] !== undefined ? dateCounts[createdAt] + 1 : 1;

            var closedAt = new Date(closed.closed_at);
            closedAt = closedAt.getFullYear() + '/' + (closedAt.getMonth() + 1) + '/' + closedAt.getDate();
            dateCounts[closedAt] = dateCounts[closedAt] !== undefined ? dateCounts[closedAt] - 1 : -1;
        });

        var xAxisData = [];
        var yAxisData = [];
        var sortedAxisData = [];
        for (var property in dateCounts) {
            sortedAxisData.push({
                'date': property,
                'issues': dateCounts[property]
            });
            sortedAxisData.sort(function(a, b) {
                return new Date(a.date) - new Date(b.date);
            });
        }
        // Only show the open issues for the last 30 days
        var startDate = new Date(Date.now());
        startDate.setDate(startDate.getDate() - 30);
        $.each(sortedAxisData, function(i, dataPoint) {
            if ((new Date(dataPoint.date)) >= startDate) {
                xAxisData.push(dataPoint.date);
            }
            yAxisData.push(dataPoint.issues);
        });

        // Calculate the total amount of open issues per day
        $.each(yAxisData, function(i, issuesAdded) {
            if (i !== 0) {
                yAxisData[i] = yAxisData[i - 1] + yAxisData[i];
            }
        });

        // Cut the yAxisData to only have the issues for the last 30 days
        yAxisData = yAxisData.slice(-xAxisData.length, yAxisData.length);


        $('#dashboard-issue-chart-container').highcharts({
            title: {
                text: 'Open issues over time',
                x: -20
            },
            xAxis: {
                categories: xAxisData,
            },
            yAxis: {
                title: {
                    text: 'Open issues'
                }
            },
            series: [{
                name: 'Open issues',
                data: yAxisData
            }]
        });
    };

    /**
     * Get the list of open and closed issues to render a chart
     */
    var getIssues = function() {
        bd.api.github.getOpenIssuesForRepositories(repositories, function(err, openIssues) {
            bd.api.github.getClosedIssuesForRepositories(repositories, function(err, closedIssues) {

                // Set the number of open issues
                $('#bd-circle-open').text(openIssues.length);

                // Set the number of issues in review
                var inReview = 0;
                $.each(openIssues, function(openIssueIndex, openIssue) {
                    $.each(openIssue.labels, function(labelIndex, label) {
                        if (label.name.toLowerCase() === 'to review') {
                            inReview++;
                        }
                    });
                });
                $('#bd-circle-review').text(inReview);

                // Set the number of issues closed today
                var closedToday = 0;
                $.each(closedIssues, function(closedIssueIndex, closedIssue) {
                    var closedAt = new Date(closedIssue.closed_at).getTime();
                    var today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (closedAt > today.getTime()) {
                        closedToday++;
                    }
                });
                $('#bd-circle-closed').text(closedToday);

                // Generate the chart
                generateIssuesChart(openIssues, closedIssues);
            });
        });
    };

    /**
     * Set the intervals at which the feeds should refresh
     */
    var setIntervals = function() {
        setInterval(getEvents, 60000); // Get new events every minute
        setInterval(getIssues, 60000 * 10); // Get new issue data every 10 minutes
    };

    /**
     * Initialize the dashboard
     */
    var initDashBoard = function() {
        repositories = $.url().param('repo') || ['oaeproject/3akai-ux', 'oaeproject/Hilary'];
        repositories = _.isArray(repositories) ? repositories : [repositories];
        $('#bd-title').text(repositories.join(' | '));

        getIssues();
        getEvents();
        setIntervals();
    };

    initDashBoard();
});