(function (String) {
    'use strict';

    String.prototype.supplant = supplant;
    String.prototype.replaceAll = replaceAll;

    /**
     * A simple templating method for replacing placeholders enclosed in curly braces.
     *
     * @param {object} o
     * @returns {string}
     */
    function supplant(o) {
        return this.replace(/{([^{}]*)}/g,
            function (a, b) {
                var r = o[b];
                return typeof r === 'string' || typeof r === 'number' ? r : a;
            }
        );
    }

    /**
     * Replace all occurrences in string
     *
     * @param {string} searchValue Used in RegExp
     * @param {string|function} replaceValue
     * @returns {string}
     */
    function replaceAll(searchValue, replaceValue) {
        var target = this;
        return target.replace(new RegExp(searchValue, 'g'), replaceValue);
    }

})(String);