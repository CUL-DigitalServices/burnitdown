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
     * Sort an Array of objects based on the `displayDate` property
     */
    var sortByDisplayDate = exports.sortByDisplayDate = function(objA, objB) {
        var eventATime = new Date(objA['displayDate']).getTime();
        var eventBTime = new Date(objB['displayDate']).getTime();
        if (eventATime < eventBTime) {
            return 1;
        } else if (eventATime > eventBTime) {
            return -1;
        } else {
            return 0;
        }
    };
});
