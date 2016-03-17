(function (ng, crip, Array, String, Number, Math, RegExp) {
    'use strict';

    crip.core
        .config(CoreConfig);

    CoreConfig.$inject = [];

    function CoreConfig() {
        Array.prototype.diff = diff;
        Array.prototype.removeItem = removeItem;

        String.prototype.supplant = supplant;
        String.prototype.replaceAll = stringReplaceAll;
        Number.prototype.toBytes = toBytes;

        ng.extend(ng, {
            isEmpty: isEmpty,
            hasValue: hasValue,
            hasProperty: hasProperty
        });

        /**
         * Get different elements from Array
         *
         * @param {Array} a
         * @returns {Array}
         */
        function diff(a) {
            return this.filter(function (i) {
                return a.indexOf(i) < 0;
            });
        }

        /**
         * Remove item from Array
         *
         * @param {*} val
         * @param {string} key
         */
        function removeItem(val, key) {
            if (typeof key === "undefined") {
                this.splice((this.indexOf(val) || this.length), 1);
                return;
            }

            for (var i = this.length - 1; i >= 0; i--) {
                if (this[i][key] == val)
                    this.splice(i, 1);
            }
        }

        /**
         * Determines is value empty
         *
         * @param value
         * @returns {boolean}
         */
        function isEmpty(value) {
            return ng.isUndefined(value) || value === '' || value === null || value !== value;
        }

        /**
         * Determines is value in object
         *
         * @param value
         * @returns {boolean}
         */
        function hasValue(value) {
            return !isEmpty(value);
        }

        /**
         * Determines is object containing properties chain
         *
         * @param {object} object
         * @param {...string} properties
         * @returns {boolean}
         */
        function hasProperty(object, properties) {
            var a = arguments;

            if (a.length === 0 || isEmpty(a[0]))
                return false;

            var target = a[0];
            for (var arg in a) {
                if (arg === '0')
                    continue;

                if (!target.hasOwnProperty(a[arg]))
                    return false;

                target = target[a[arg]];
                if (ng.isUndefined(target))
                    return false;
            }

            return true;
        }

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
         * Convert Number to user friendly byte string
         *
         * @param [holder]
         * @returns {string}
         */
        function toBytes(holder) {
            holder = holder || (holder = {});
            holder.value = this;
            holder.size = Math.log(holder.value) / Math.log(1e3) | 0;
            holder.num = (holder.value / Math.pow(1e3, holder.size)).toFixed(2);
            holder.text = (holder.size ? ('kMGTPEZY'[--holder.size] + 'B') : 'Bytes');

            return '{num} {text}'.supplant(holder);
        }

        /**
         * Replace all occurrences in string
         *
         * @param {string} searchValue Used in RegExp
         * @param {string|function} replaceValue
         * @returns {string}
         */
        function stringReplaceAll(searchValue, replaceValue) {
            var target = this;
            return target.replace(new RegExp(searchValue, 'g'), replaceValue);
        }
    }
})(angular, window.crip || (window.crip = {}), Array, String, Number, Math, RegExp);