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

/*!
 * Initalize requireJS by setting paths and specifying load priorities
 */
requirejs.config({
    'baseUrl': '/shared/',
    'paths': {
        'config': 'config',
        // jQuery module is managed by require-jquery variation of require.js
        'jquery': 'empty:',
        'bootstrap': 'vendor/js/bootstrap',
        'highcharts': 'vendor/js/highcharts',
        'history': 'vendor/js/jquery.history',
        'underscore': 'vendor/js/underscore',
        'timeago': 'vendor/js/jquery.timeago',

        'bd.api': 'bd/js/bd.api',
        'bd.api.github': 'bd/js/bd.api.github',

        'bd.core': 'bd/js/bd.core',
    },
    'waitSeconds': 30
});

/*!
 * Load all of the dependencies, core APIs, and the page-specific javascript file (if specified)
 */
require(['bd.core'], function() {
    // Find the script that has specified both the data-main (which loaded this bootstrap script) and a data-loadmodule attribute. The
    // data-loadmodule attribute tells us which script they wish to load *after* the core APIs have been properly bootstrapped.
    var $mainScript = $('script[data-main][data-loadmodule]');
    if ($mainScript.length > 0) {
        var loadModule = $mainScript.attr('data-loadmodule');
        if (loadModule) {
            // Require the module they specified in the data-loadmodule attribute
            require([loadModule]);
        }
    }
});
