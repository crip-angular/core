(function (ng, crip) {
    'use strict';

    crip.core = ng.module('crip.core', []);

})(angular, window.crip || (window.crip = {}));
(function (Array) {
    'use strict';

    Array.prototype.diff = diff;
    Array.prototype.removeItem = removeItem;
    Array.prototype.clean = clean;

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
     * Clean array from empty values
     * If parameters presented, delete items witch contains passed value
     *
     * @param {...T} [delete_value]
     * @returns {Array}
     */
    function clean(delete_value) {
        var clean_from = arguments;
        if (typeof delete_value === 'undefined') {
            clean_from = [undefined, '', null, NaN];
        }

        for (var i = 0; i < this.length; i++) {
            for (var j = 0; j < clean_from.length; j++) {
                if (this[i] === clean_from[j]) {
                    this.splice(i, 1);
                    i--;
                }
            }
        }

        return this;
    }

})(Array);
(function (ng, crip, Array, String, Number, Math, RegExp) {
    'use strict';

    crip.core
        .config(CoreConfig);

    CoreConfig.$inject = [];

    function CoreConfig() {

        ng.extend(ng, {
            isEmpty: isEmpty,
            hasValue: hasValue,
            hasProperty: hasProperty,
            nodesToArray: nodesToArray
        });

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
         * Annoying method to copy nodes to an array, thanks to IE
         *
         * @param {Node} [nodes]
         * @returns {Array}
         */
        function nodesToArray(nodes) {
            nodes = nodes || [];

            var results = [];
            for (var i = 0; i < nodes.length; ++i) {
                results.push(nodes.item(i));
            }
            return results;
        }
    }
})(angular, window.crip || (window.crip = {}), Array, String, Number, Math, RegExp);
(function(ng, crip){
    'use strict';

    crip.core
        .run(FileExtensions);

    FileExtensions.$inject = ['$window'];

    function FileExtensions($window) {

        ng.extend(ng, {
            isFile: isFile,
            isImage: isImage,
            isHtml5: !!(File && FormData),
            fileSupport: !!($window.FileReader && $window.CanvasRenderingContext2D)
        });

        /**
         * Determines is item an instance of File
         *
         * @param {*} item
         * @returns {boolean}
         */
        function isFile(item) {
            return ng.isObject(item) && item instanceof $window.File;
        }

        /**
         * Determines is file an type of image
         *
         * @param {File} file
         * @returns {boolean}
         */
        function isImage(file) {
            var type = '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        }
    }
})(angular, window.crip || (window.crip = {}));
(function(Number){
    'use strict';

    Number.prototype.toBytes = toBytes;

    /**
     * Convert Number to user friendly byte string
     *
     * @param {Object} [holder]
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
})(Number);
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
(function (ng, crip) {
    'use strict';

    crip.core
        .directive('cripContextmenu', cripContextmenu);

    cripContextmenu.$inject = ['$parse'];

    function cripContextmenu($parse) {
        return {
            restrict: 'A',
            link: link
        };

        function link(scope, element, attrs, ctrl) {
            var fn = $parse(attrs.cripContextmenu);
            element.bind("contextmenu", function (event) {
                scope.$apply(function() {
                    event.preventDefault();
                    fn(scope, {$event:event, $element: element});
                });
            });

            // Removes bound events in the element itself
            // when the scope is destroyed
            scope.$on('$destroy', function () {
                element.off(attrs.cripContextmenu);
            });
        }
    }
})(angular, window.crip || (window.crip = {}));

(function (ng, crip) {
    'use strict';

    crip.core
        .directive('cripEnter', cripEnter);

    cripEnter.$inject = [];

    function cripEnter() {
        return {
            restrict: 'A',
            link: link
        };

        function link(scope, element, attrs, ctrl) {
            element.bind("keydown keypress", function (event) {
                if (event.which === 13) {
                    scope.$apply(function () {
                        scope.$eval(attrs.cripEnter, {'event': event});
                    });

                    event.preventDefault();
                }
            });

            // Removes bound events in the element itself
            // when the scope is destroyed
            scope.$on('$destroy', function () {
                element.off(attrs.cripEnter);
            });
        }
    }
})(angular, window.crip || (window.crip = {}));

(function (crip) {
    'use strict';

    crip.core
        .directive('cripFocus', cripFocus);

    cripFocus.$inject = ['focus'];

    function cripFocus(focus) {
        return {
            restrict: 'A',
            link: link
        };

        function link(scope, element, attrs, ctrl) {
            element.on(attrs.cripFocus, function () {
                focus(attrs.cripSelector);
            });

            // Removes bound events in the element itself
            // when the scope is destroyed
            scope.$on('$destroy', function () {
                element.off(attrs.cripFocus);
            });
        }
    }
})(window.crip || (window.crip = {}));
(function (ng, crip) {
    'use strict';

    crip.core
        .directive('cripThumb', cripThumb);

    function cripThumb() {
        return {
            restrict: 'A',
            template: '<canvas/>',
            link: link
        };

        function link(scope, element, attrs){
            if(!ng.fileSupport) return;

            var params = scope.$eval(attrs.cripThumb);

            if (!ng.isFile(params.file) || !ng.isImage(params.file)) {
                element.hide();
                return;
            }

            var canvas = element.find('canvas');
            var reader = new FileReader();

            reader.onload = onLoadFile;
            reader.readAsDataURL(params.file);

            function onLoadFile(event) {
                var img = new Image();
                img.onload = onLoadImage;
                img.src = event.target.result;
            }

            function onLoadImage() {
                var width = params.width || this.width / this.height * params.height;
                var height = params.height || this.height / this.width * params.width;
                canvas.attr({width: width, height: height});
                canvas[0].getContext('2d').drawImage(this, 0, 0, width, height);
            }
        }
    }

})(angular, window.crip || (window.crip = {}));
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
            $timeout(function () {
                var $element = $(selector);
                if ($element.length === 1) {
                    if (typeof callback === 'function')
                        $element.focus(callback);
                    else
                        $element.focus();
                }
            });
        }
    }
})(jQuery, window.crip || (window.crip = {}));
(function (crip, Math) {
    'use strict';

    crip.core
        .service('cripStrRandom', cripStrRandom);

    cripStrRandom.$inject = [];

    function cripStrRandom() {
        var possible = '-_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';

        this.changeChars = function (chars) {
            possible = chars;
        };

        this.new = function (length) {
            length |= 16;
            var result = '';
            for (var i = 0; i < length; i++) {
                result += possible.charAt(Math.floor(Math.random() * possible.length));
            }

            return result;
        };
    }
})(window.crip || (window.crip = {}), Math);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvcmUubW9kdWxlLmpzIiwiYXJyYXkuZXh0ZW5zaW9ucy5qcyIsImNvbmZpZy5qcyIsImZpbGUuZXh0ZW5zaW9ucy5qcyIsIm51bWJlci5leHRlbnNpb25zLmpzIiwic3RyaW5nLmV4dGVuc2lvbnMuanMiLCJkaXJlY3RpdmVzL2NyaXBDb250ZXh0bWVudS5qcyIsImRpcmVjdGl2ZXMvY3JpcEVudGVyLmpzIiwiZGlyZWN0aXZlcy9jcmlwRm9jdXMuanMiLCJkaXJlY3RpdmVzL2NyaXBUaHVtYi5qcyIsImZhY3Rvcmllcy9mb2N1cy5qcyIsInNlcnZpY2VzL2NyaXBTdHJSYW5kb20uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImNyaXAtY29yZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiAobmcsIGNyaXApIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmNvcmUgPSBuZy5tb2R1bGUoJ2NyaXAuY29yZScsIFtdKTtcclxuXHJcbn0pKGFuZ3VsYXIsIHdpbmRvdy5jcmlwIHx8ICh3aW5kb3cuY3JpcCA9IHt9KSk7IiwiKGZ1bmN0aW9uIChBcnJheSkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIEFycmF5LnByb3RvdHlwZS5kaWZmID0gZGlmZjtcclxuICAgIEFycmF5LnByb3RvdHlwZS5yZW1vdmVJdGVtID0gcmVtb3ZlSXRlbTtcclxuICAgIEFycmF5LnByb3RvdHlwZS5jbGVhbiA9IGNsZWFuO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IGRpZmZlcmVudCBlbGVtZW50cyBmcm9tIEFycmF5XHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtBcnJheX0gYVxyXG4gICAgICogQHJldHVybnMge0FycmF5fVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBkaWZmKGEpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5maWx0ZXIoZnVuY3Rpb24gKGkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGEuaW5kZXhPZihpKSA8IDA7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1vdmUgaXRlbSBmcm9tIEFycmF5XHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHsqfSB2YWxcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gcmVtb3ZlSXRlbSh2YWwsIGtleSkge1xyXG4gICAgICAgIGlmICh0eXBlb2Yga2V5ID09PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3BsaWNlKCh0aGlzLmluZGV4T2YodmFsKSB8fCB0aGlzLmxlbmd0aCksIDEpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKHZhciBpID0gdGhpcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgICBpZiAodGhpc1tpXVtrZXldID09IHZhbClcclxuICAgICAgICAgICAgICAgIHRoaXMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENsZWFuIGFycmF5IGZyb20gZW1wdHkgdmFsdWVzXHJcbiAgICAgKiBJZiBwYXJhbWV0ZXJzIHByZXNlbnRlZCwgZGVsZXRlIGl0ZW1zIHdpdGNoIGNvbnRhaW5zIHBhc3NlZCB2YWx1ZVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7Li4uVH0gW2RlbGV0ZV92YWx1ZV1cclxuICAgICAqIEByZXR1cm5zIHtBcnJheX1cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gY2xlYW4oZGVsZXRlX3ZhbHVlKSB7XHJcbiAgICAgICAgdmFyIGNsZWFuX2Zyb20gPSBhcmd1bWVudHM7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBkZWxldGVfdmFsdWUgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIGNsZWFuX2Zyb20gPSBbdW5kZWZpbmVkLCAnJywgbnVsbCwgTmFOXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGNsZWFuX2Zyb20ubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzW2ldID09PSBjbGVhbl9mcm9tW2pdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaS0tO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbn0pKEFycmF5KTsiLCIoZnVuY3Rpb24gKG5nLCBjcmlwLCBBcnJheSwgU3RyaW5nLCBOdW1iZXIsIE1hdGgsIFJlZ0V4cCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuY29yZVxyXG4gICAgICAgIC5jb25maWcoQ29yZUNvbmZpZyk7XHJcblxyXG4gICAgQ29yZUNvbmZpZy4kaW5qZWN0ID0gW107XHJcblxyXG4gICAgZnVuY3Rpb24gQ29yZUNvbmZpZygpIHtcclxuXHJcbiAgICAgICAgbmcuZXh0ZW5kKG5nLCB7XHJcbiAgICAgICAgICAgIGlzRW1wdHk6IGlzRW1wdHksXHJcbiAgICAgICAgICAgIGhhc1ZhbHVlOiBoYXNWYWx1ZSxcclxuICAgICAgICAgICAgaGFzUHJvcGVydHk6IGhhc1Byb3BlcnR5LFxyXG4gICAgICAgICAgICBub2Rlc1RvQXJyYXk6IG5vZGVzVG9BcnJheVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZXRlcm1pbmVzIGlzIHZhbHVlIGVtcHR5XHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0gdmFsdWVcclxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBpc0VtcHR5KHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZy5pc1VuZGVmaW5lZCh2YWx1ZSkgfHwgdmFsdWUgPT09ICcnIHx8IHZhbHVlID09PSBudWxsIHx8IHZhbHVlICE9PSB2YWx1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERldGVybWluZXMgaXMgdmFsdWUgaW4gb2JqZWN0XHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0gdmFsdWVcclxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBoYXNWYWx1ZSh2YWx1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gIWlzRW1wdHkodmFsdWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGV0ZXJtaW5lcyBpcyBvYmplY3QgY29udGFpbmluZyBwcm9wZXJ0aWVzIGNoYWluXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gb2JqZWN0XHJcbiAgICAgICAgICogQHBhcmFtIHsuLi5zdHJpbmd9IHByb3BlcnRpZXNcclxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBoYXNQcm9wZXJ0eShvYmplY3QsIHByb3BlcnRpZXMpIHtcclxuICAgICAgICAgICAgdmFyIGEgPSBhcmd1bWVudHM7XHJcblxyXG4gICAgICAgICAgICBpZiAoYS5sZW5ndGggPT09IDAgfHwgaXNFbXB0eShhWzBdKSlcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIHZhciB0YXJnZXQgPSBhWzBdO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBhcmcgaW4gYSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGFyZyA9PT0gJzAnKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghdGFyZ2V0Lmhhc093blByb3BlcnR5KGFbYXJnXSkpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgICAgIHRhcmdldCA9IHRhcmdldFthW2FyZ11dO1xyXG4gICAgICAgICAgICAgICAgaWYgKG5nLmlzVW5kZWZpbmVkKHRhcmdldCkpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEFubm95aW5nIG1ldGhvZCB0byBjb3B5IG5vZGVzIHRvIGFuIGFycmF5LCB0aGFua3MgdG8gSUVcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7Tm9kZX0gW25vZGVzXVxyXG4gICAgICAgICAqIEByZXR1cm5zIHtBcnJheX1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBub2Rlc1RvQXJyYXkobm9kZXMpIHtcclxuICAgICAgICAgICAgbm9kZXMgPSBub2RlcyB8fCBbXTtcclxuXHJcbiAgICAgICAgICAgIHZhciByZXN1bHRzID0gW107XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChub2Rlcy5pdGVtKGkpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKGFuZ3VsYXIsIHdpbmRvdy5jcmlwIHx8ICh3aW5kb3cuY3JpcCA9IHt9KSwgQXJyYXksIFN0cmluZywgTnVtYmVyLCBNYXRoLCBSZWdFeHApOyIsIihmdW5jdGlvbihuZywgY3JpcCl7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgY3JpcC5jb3JlXHJcbiAgICAgICAgLnJ1bihGaWxlRXh0ZW5zaW9ucyk7XHJcblxyXG4gICAgRmlsZUV4dGVuc2lvbnMuJGluamVjdCA9IFsnJHdpbmRvdyddO1xyXG5cclxuICAgIGZ1bmN0aW9uIEZpbGVFeHRlbnNpb25zKCR3aW5kb3cpIHtcclxuXHJcbiAgICAgICAgbmcuZXh0ZW5kKG5nLCB7XHJcbiAgICAgICAgICAgIGlzRmlsZTogaXNGaWxlLFxyXG4gICAgICAgICAgICBpc0ltYWdlOiBpc0ltYWdlLFxyXG4gICAgICAgICAgICBpc0h0bWw1OiAhIShGaWxlICYmIEZvcm1EYXRhKSxcclxuICAgICAgICAgICAgZmlsZVN1cHBvcnQ6ICEhKCR3aW5kb3cuRmlsZVJlYWRlciAmJiAkd2luZG93LkNhbnZhc1JlbmRlcmluZ0NvbnRleHQyRClcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGV0ZXJtaW5lcyBpcyBpdGVtIGFuIGluc3RhbmNlIG9mIEZpbGVcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7Kn0gaXRlbVxyXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGlzRmlsZShpdGVtKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZy5pc09iamVjdChpdGVtKSAmJiBpdGVtIGluc3RhbmNlb2YgJHdpbmRvdy5GaWxlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGV0ZXJtaW5lcyBpcyBmaWxlIGFuIHR5cGUgb2YgaW1hZ2VcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7RmlsZX0gZmlsZVxyXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGlzSW1hZ2UoZmlsZSkge1xyXG4gICAgICAgICAgICB2YXIgdHlwZSA9ICd8JyArIGZpbGUudHlwZS5zbGljZShmaWxlLnR5cGUubGFzdEluZGV4T2YoJy8nKSArIDEpICsgJ3wnO1xyXG4gICAgICAgICAgICByZXR1cm4gJ3xqcGd8cG5nfGpwZWd8Ym1wfGdpZnwnLmluZGV4T2YodHlwZSkgIT09IC0xO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoYW5ndWxhciwgd2luZG93LmNyaXAgfHwgKHdpbmRvdy5jcmlwID0ge30pKTsiLCIoZnVuY3Rpb24oTnVtYmVyKXtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBOdW1iZXIucHJvdG90eXBlLnRvQnl0ZXMgPSB0b0J5dGVzO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29udmVydCBOdW1iZXIgdG8gdXNlciBmcmllbmRseSBieXRlIHN0cmluZ1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbaG9sZGVyXVxyXG4gICAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gdG9CeXRlcyhob2xkZXIpIHtcclxuICAgICAgICBob2xkZXIgPSBob2xkZXIgfHwgKGhvbGRlciA9IHt9KTtcclxuICAgICAgICBob2xkZXIudmFsdWUgPSB0aGlzO1xyXG4gICAgICAgIGhvbGRlci5zaXplID0gTWF0aC5sb2coaG9sZGVyLnZhbHVlKSAvIE1hdGgubG9nKDFlMykgfCAwO1xyXG4gICAgICAgIGhvbGRlci5udW0gPSAoaG9sZGVyLnZhbHVlIC8gTWF0aC5wb3coMWUzLCBob2xkZXIuc2l6ZSkpLnRvRml4ZWQoMik7XHJcbiAgICAgICAgaG9sZGVyLnRleHQgPSAoaG9sZGVyLnNpemUgPyAoJ2tNR1RQRVpZJ1stLWhvbGRlci5zaXplXSArICdCJykgOiAnQnl0ZXMnKTtcclxuXHJcbiAgICAgICAgcmV0dXJuICd7bnVtfSB7dGV4dH0nLnN1cHBsYW50KGhvbGRlcik7XHJcbiAgICB9XHJcbn0pKE51bWJlcik7IiwiKGZ1bmN0aW9uIChTdHJpbmcpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBTdHJpbmcucHJvdG90eXBlLnN1cHBsYW50ID0gc3VwcGxhbnQ7XHJcbiAgICBTdHJpbmcucHJvdG90eXBlLnJlcGxhY2VBbGwgPSByZXBsYWNlQWxsO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQSBzaW1wbGUgdGVtcGxhdGluZyBtZXRob2QgZm9yIHJlcGxhY2luZyBwbGFjZWhvbGRlcnMgZW5jbG9zZWQgaW4gY3VybHkgYnJhY2VzLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvXHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBzdXBwbGFudChvKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucmVwbGFjZSgveyhbXnt9XSopfS9nLFxyXG4gICAgICAgICAgICBmdW5jdGlvbiAoYSwgYikge1xyXG4gICAgICAgICAgICAgICAgdmFyIHIgPSBvW2JdO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiByID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgciA9PT0gJ251bWJlcicgPyByIDogYTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXBsYWNlIGFsbCBvY2N1cnJlbmNlcyBpbiBzdHJpbmdcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc2VhcmNoVmFsdWUgVXNlZCBpbiBSZWdFeHBcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfGZ1bmN0aW9ufSByZXBsYWNlVmFsdWVcclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHJlcGxhY2VBbGwoc2VhcmNoVmFsdWUsIHJlcGxhY2VWYWx1ZSkge1xyXG4gICAgICAgIHZhciB0YXJnZXQgPSB0aGlzO1xyXG4gICAgICAgIHJldHVybiB0YXJnZXQucmVwbGFjZShuZXcgUmVnRXhwKHNlYXJjaFZhbHVlLCAnZycpLCByZXBsYWNlVmFsdWUpO1xyXG4gICAgfVxyXG5cclxufSkoU3RyaW5nKTsiLCIoZnVuY3Rpb24gKG5nLCBjcmlwKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgY3JpcC5jb3JlXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgnY3JpcENvbnRleHRtZW51JywgY3JpcENvbnRleHRtZW51KTtcclxuXHJcbiAgICBjcmlwQ29udGV4dG1lbnUuJGluamVjdCA9IFsnJHBhcnNlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gY3JpcENvbnRleHRtZW51KCRwYXJzZSkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICAgICAgICAgIGxpbms6IGxpbmtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBsaW5rKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybCkge1xyXG4gICAgICAgICAgICB2YXIgZm4gPSAkcGFyc2UoYXR0cnMuY3JpcENvbnRleHRtZW51KTtcclxuICAgICAgICAgICAgZWxlbWVudC5iaW5kKFwiY29udGV4dG1lbnVcIiwgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICBzY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICBmbihzY29wZSwgeyRldmVudDpldmVudCwgJGVsZW1lbnQ6IGVsZW1lbnR9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIFJlbW92ZXMgYm91bmQgZXZlbnRzIGluIHRoZSBlbGVtZW50IGl0c2VsZlxyXG4gICAgICAgICAgICAvLyB3aGVuIHRoZSBzY29wZSBpcyBkZXN0cm95ZWRcclxuICAgICAgICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQub2ZmKGF0dHJzLmNyaXBDb250ZXh0bWVudSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoYW5ndWxhciwgd2luZG93LmNyaXAgfHwgKHdpbmRvdy5jcmlwID0ge30pKTtcclxuIiwiKGZ1bmN0aW9uIChuZywgY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuY29yZVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2NyaXBFbnRlcicsIGNyaXBFbnRlcik7XHJcblxyXG4gICAgY3JpcEVudGVyLiRpbmplY3QgPSBbXTtcclxuXHJcbiAgICBmdW5jdGlvbiBjcmlwRW50ZXIoKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgICAgICAgICAgbGluazogbGlua1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGxpbmsoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJsKSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuYmluZChcImtleWRvd24ga2V5cHJlc3NcIiwgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQud2hpY2ggPT09IDEzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuJGFwcGx5KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuJGV2YWwoYXR0cnMuY3JpcEVudGVyLCB7J2V2ZW50JzogZXZlbnR9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvLyBSZW1vdmVzIGJvdW5kIGV2ZW50cyBpbiB0aGUgZWxlbWVudCBpdHNlbGZcclxuICAgICAgICAgICAgLy8gd2hlbiB0aGUgc2NvcGUgaXMgZGVzdHJveWVkXHJcbiAgICAgICAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Lm9mZihhdHRycy5jcmlwRW50ZXIpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKGFuZ3VsYXIsIHdpbmRvdy5jcmlwIHx8ICh3aW5kb3cuY3JpcCA9IHt9KSk7XHJcbiIsIihmdW5jdGlvbiAoY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuY29yZVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2NyaXBGb2N1cycsIGNyaXBGb2N1cyk7XHJcblxyXG4gICAgY3JpcEZvY3VzLiRpbmplY3QgPSBbJ2ZvY3VzJ107XHJcblxyXG4gICAgZnVuY3Rpb24gY3JpcEZvY3VzKGZvY3VzKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgICAgICAgICAgbGluazogbGlua1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGxpbmsoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJsKSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQub24oYXR0cnMuY3JpcEZvY3VzLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBmb2N1cyhhdHRycy5jcmlwU2VsZWN0b3IpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIFJlbW92ZXMgYm91bmQgZXZlbnRzIGluIHRoZSBlbGVtZW50IGl0c2VsZlxyXG4gICAgICAgICAgICAvLyB3aGVuIHRoZSBzY29wZSBpcyBkZXN0cm95ZWRcclxuICAgICAgICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQub2ZmKGF0dHJzLmNyaXBGb2N1cyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkod2luZG93LmNyaXAgfHwgKHdpbmRvdy5jcmlwID0ge30pKTsiLCIoZnVuY3Rpb24gKG5nLCBjcmlwKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgY3JpcC5jb3JlXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgnY3JpcFRodW1iJywgY3JpcFRodW1iKTtcclxuXHJcbiAgICBmdW5jdGlvbiBjcmlwVGh1bWIoKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgICAgICAgICAgdGVtcGxhdGU6ICc8Y2FudmFzLz4nLFxyXG4gICAgICAgICAgICBsaW5rOiBsaW5rXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gbGluayhzY29wZSwgZWxlbWVudCwgYXR0cnMpe1xyXG4gICAgICAgICAgICBpZighbmcuZmlsZVN1cHBvcnQpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIHZhciBwYXJhbXMgPSBzY29wZS4kZXZhbChhdHRycy5jcmlwVGh1bWIpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFuZy5pc0ZpbGUocGFyYW1zLmZpbGUpIHx8ICFuZy5pc0ltYWdlKHBhcmFtcy5maWxlKSkge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciBjYW52YXMgPSBlbGVtZW50LmZpbmQoJ2NhbnZhcycpO1xyXG4gICAgICAgICAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcclxuXHJcbiAgICAgICAgICAgIHJlYWRlci5vbmxvYWQgPSBvbkxvYWRGaWxlO1xyXG4gICAgICAgICAgICByZWFkZXIucmVhZEFzRGF0YVVSTChwYXJhbXMuZmlsZSk7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBvbkxvYWRGaWxlKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaW1nID0gbmV3IEltYWdlKCk7XHJcbiAgICAgICAgICAgICAgICBpbWcub25sb2FkID0gb25Mb2FkSW1hZ2U7XHJcbiAgICAgICAgICAgICAgICBpbWcuc3JjID0gZXZlbnQudGFyZ2V0LnJlc3VsdDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gb25Mb2FkSW1hZ2UoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgd2lkdGggPSBwYXJhbXMud2lkdGggfHwgdGhpcy53aWR0aCAvIHRoaXMuaGVpZ2h0ICogcGFyYW1zLmhlaWdodDtcclxuICAgICAgICAgICAgICAgIHZhciBoZWlnaHQgPSBwYXJhbXMuaGVpZ2h0IHx8IHRoaXMuaGVpZ2h0IC8gdGhpcy53aWR0aCAqIHBhcmFtcy53aWR0aDtcclxuICAgICAgICAgICAgICAgIGNhbnZhcy5hdHRyKHt3aWR0aDogd2lkdGgsIGhlaWdodDogaGVpZ2h0fSk7XHJcbiAgICAgICAgICAgICAgICBjYW52YXNbMF0uZ2V0Q29udGV4dCgnMmQnKS5kcmF3SW1hZ2UodGhpcywgMCwgMCwgd2lkdGgsIGhlaWdodCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59KShhbmd1bGFyLCB3aW5kb3cuY3JpcCB8fCAod2luZG93LmNyaXAgPSB7fSkpOyIsIihmdW5jdGlvbiAoJCwgY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuY29yZVxyXG4gICAgICAgIC5mYWN0b3J5KCdmb2N1cycsIGZvY3VzKTtcclxuXHJcbiAgICBmb2N1cy4kaW5qZWN0ID0gWyckdGltZW91dCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGZvY3VzKCR0aW1lb3V0KSB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChzZWxlY3RvciwgY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgLy8gdGltZW91dCBtYWtlcyBzdXJlIHRoYXQgaXQgaXMgaW52b2tlZCBhZnRlciBhbnkgb3RoZXIgZXZlbnQgaGFzIGJlZW4gdHJpZ2dlcmVkLlxyXG4gICAgICAgICAgICAvLyBlLmcuIGNsaWNrIGV2ZW50cyB0aGF0IG5lZWQgdG8gcnVuIGJlZm9yZSB0aGUgZm9jdXMgb3JcclxuICAgICAgICAgICAgLy8gaW5wdXRzIGVsZW1lbnRzIHRoYXQgYXJlIGluIGEgZGlzYWJsZWQgc3RhdGUgYnV0IGFyZSBlbmFibGVkIHdoZW4gdGhvc2UgZXZlbnRzXHJcbiAgICAgICAgICAgIC8vIGFyZSB0cmlnZ2VyZWQuXHJcbiAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHZhciAkZWxlbWVudCA9ICQoc2VsZWN0b3IpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCRlbGVtZW50Lmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRlbGVtZW50LmZvY3VzKGNhbGxiYWNrKTtcclxuICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRlbGVtZW50LmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoalF1ZXJ5LCB3aW5kb3cuY3JpcCB8fCAod2luZG93LmNyaXAgPSB7fSkpOyIsIihmdW5jdGlvbiAoY3JpcCwgTWF0aCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuY29yZVxyXG4gICAgICAgIC5zZXJ2aWNlKCdjcmlwU3RyUmFuZG9tJywgY3JpcFN0clJhbmRvbSk7XHJcblxyXG4gICAgY3JpcFN0clJhbmRvbS4kaW5qZWN0ID0gW107XHJcblxyXG4gICAgZnVuY3Rpb24gY3JpcFN0clJhbmRvbSgpIHtcclxuICAgICAgICB2YXIgcG9zc2libGUgPSAnLV9BQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OV8tJztcclxuXHJcbiAgICAgICAgdGhpcy5jaGFuZ2VDaGFycyA9IGZ1bmN0aW9uIChjaGFycykge1xyXG4gICAgICAgICAgICBwb3NzaWJsZSA9IGNoYXJzO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMubmV3ID0gZnVuY3Rpb24gKGxlbmd0aCkge1xyXG4gICAgICAgICAgICBsZW5ndGggfD0gMTY7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSAnJztcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IHBvc3NpYmxlLmNoYXJBdChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBwb3NzaWJsZS5sZW5ndGgpKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KSh3aW5kb3cuY3JpcCB8fCAod2luZG93LmNyaXAgPSB7fSksIE1hdGgpOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
