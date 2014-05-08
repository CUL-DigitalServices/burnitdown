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
 * Load all of the 3rd party libraries that need to be present from the very beginning, as well as the actual
 * core client-side OAE APIs
 */
define([

        /*!
         * The ! after `oae.api` indicates that this module is actually treated as a *plugin*, which is a special kind of
         * requirejs module. The difference we need is that the module can return a `load` function that can chain together
         * an initialization process client-size. We use this to initialize the client-side data.
         */
        'bd.api!',

        'jquery',
        'bootstrap',
        'underscore'
    ],

    function(bd, $) {
        return bd;
    }
);
