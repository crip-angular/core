(function (ng, crip, Array, String, Number) {
    'use strict';

    crip.core
        .config(CoreConfig);

    CoreConfig.$inject = [];

    function CoreConfig() {
        Array.prototype.diff = diff;
        Array.prototype.removeItem = removeItem;

        String.prototype.supplant = supplant;
        Number.prototype.toBytes = toBytes;

        ng.extend(ng, {
            isEmpty: isEmpty,
            hasValue: hasValue,
            hasProperty: hasProperty
        });

        function diff(a) {
            return this.filter(function (i) {
                return a.indexOf(i) < 0;
            });
        }

        function removeItem(val, key) {
            for (var i = this.length - 1; i >= 0; i--) {
                if (typeof key === "undefined") {
                    if (this[i] == val)
                        this.splice(i, 1);
                }
                else if (this[i][key] == val)
                    this.splice(i, 1);
            }
        }

        function isEmpty(value) {
            return ng.isUndefined(value) || value === '' || value === null || value !== value;
        }

        function hasValue(value) {
            return !isEmpty(value);
        }

        function hasProperty() {
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

        // A simple templating method for replacing placeholders enclosed in curly braces.
        function supplant(o) {
            return this.replace(/{([^{}]*)}/g,
                function (a, b) {
                    var r = o[b];
                    return typeof r === 'string' || typeof r === 'number' ? r : a;
                }
            );
        }

        /**
         * Convert Number to user friendly string
         * @returns {string}
         */
        function toBytes() {
            this.value = this;
            this.size = Math.log(this) / Math.log(1e3) | 0;
            this.num = (this / Math.pow(1e3, this.size)).toFixed(2);
            this.text = (this.size ? ('kMGTPEZY'[--this.size] + 'B') : 'Bytes');

            return '{num} {text}'.supplant(this);
        }
    }
})(angular, window.crip || (window.crip = {}), Array, String, Number);