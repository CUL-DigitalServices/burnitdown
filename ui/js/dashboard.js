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

define(['jquery', 'bd.core', 'timeago', 'highcharts', 'history'], function ($, db) {

    var repository = null;

    var getIssueEvents = function() {
        // Render the issue event feed
        db.api.github.getIssueEventsForRepository(repository.split('/')[0], repository.split('/')[1], function(err, events) {
            if (err) {
                return console.error('Error retrieving event feed');
            }

            // Render the event feed
            var template = $("#dashboard-issue-feed-template").html();
            $("#dashboard-feed-container #dashboard-issue-feed-container").html(_.template(template, {
                'events': events
            }));
        });
    };

    var getPullCommentEvents = function() {
        // Render the pull request event feed
        db.api.github.getPullCommentEventsForRepository(repository.split('/')[0], repository.split('/')[1], function(err, events) {
            if (err) {
                return console.error('Error retrieving event feed');
            }

            // Render the event feed
            var template = $("#dashboard-pull-feed-template").html();
            $("#dashboard-feed-container #dashboard-pull-feed-container").html(_.template(template, {
                'events': events
            }));
        });
    };

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
                text: 'Open issues over time for ' + repository,
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
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle',
                borderWidth: 0
            },
            series: [{
                name: 'Open issues',
                data: yAxisData
            }]
        });
    };

    var getIssuesForChart = function() {
        db.api.github.getOpenIssues(repository.split('/')[0], repository.split('/')[1], function(err, open) {
            var openIssues = open;
            // Get the open and closed issues in the milestone
            db.api.github.getClosedIssues(repository.split('/')[0], repository.split('/')[1], function(err, closed) {
                var closedIssues = closed;
                generateIssuesChart(openIssues, closedIssues);
            });
        });
    };

    var setIntervals = function() {
        setInterval(getIssueEvents, 60000 * 2); // Get new issue events every 2 minutes
        setInterval(getPullCommentEvents, 60000); // Get new pull request comments every minute
        setInterval(getIssuesForChart, 60000 * 5); // Get new chart data every 5 minutes
    };

    var initDashBoard = function() {
        repository = window.location.search.split('=')[1];
        if (!repository) {
            repository = 'oaeproject/3akai-ux';
            History.pushState(null, null, '?repo=' + repository);
        }
        getIssuesForChart();
        getIssueEvents();
        getPullCommentEvents();
        setIntervals();
    };

    initDashBoard();
});