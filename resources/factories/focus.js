(function ($, crip) {
    'use strict';

    crip.core
        .factory('focus', focus);

    focus.$inject = ['$timeout'];

    function focus($timeout) {
        return function (selector, callback) {
            // timeout makes sure that it is invoked after any other event has been triggered.
            // e.g. click events that need to run before the focus or
            // inputs elements that are in a disabled state but are enabled when those events
            // are triggered.
            $timeout(function() {
                var $element = $(selector);
                if($element.length === 1)
                    $element.focus(callback);
            });
        }
    }
})(jQuery, window.crip || (window.crip = {}));