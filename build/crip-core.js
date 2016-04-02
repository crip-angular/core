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
            hasProperty: hasProperty
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvcmUubW9kdWxlLmpzIiwiYXJyYXkuZXh0ZW5zaW9ucy5qcyIsImNvbmZpZy5qcyIsImZpbGUuZXh0ZW5zaW9ucy5qcyIsIm51bWJlci5leHRlbnNpb25zLmpzIiwic3RyaW5nLmV4dGVuc2lvbnMuanMiLCJkaXJlY3RpdmVzL2NyaXBDb250ZXh0bWVudS5qcyIsImRpcmVjdGl2ZXMvY3JpcEVudGVyLmpzIiwiZGlyZWN0aXZlcy9jcmlwRm9jdXMuanMiLCJkaXJlY3RpdmVzL2NyaXBUaHVtYi5qcyIsImZhY3Rvcmllcy9mb2N1cy5qcyIsInNlcnZpY2VzL2NyaXBTdHJSYW5kb20uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiY3JpcC1jb3JlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIChuZywgY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuY29yZSA9IG5nLm1vZHVsZSgnY3JpcC5jb3JlJywgW10pO1xyXG5cclxufSkoYW5ndWxhciwgd2luZG93LmNyaXAgfHwgKHdpbmRvdy5jcmlwID0ge30pKTsiLCIoZnVuY3Rpb24gKEFycmF5KSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgQXJyYXkucHJvdG90eXBlLmRpZmYgPSBkaWZmO1xyXG4gICAgQXJyYXkucHJvdG90eXBlLnJlbW92ZUl0ZW0gPSByZW1vdmVJdGVtO1xyXG4gICAgQXJyYXkucHJvdG90eXBlLmNsZWFuID0gY2xlYW47XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgZGlmZmVyZW50IGVsZW1lbnRzIGZyb20gQXJyYXlcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBhXHJcbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9XHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGRpZmYoYSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZpbHRlcihmdW5jdGlvbiAoaSkge1xyXG4gICAgICAgICAgICByZXR1cm4gYS5pbmRleE9mKGkpIDwgMDtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZSBpdGVtIGZyb20gQXJyYXlcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0geyp9IHZhbFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGtleVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiByZW1vdmVJdGVtKHZhbCwga2V5KSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBrZXkgPT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgICAgICAgdGhpcy5zcGxpY2UoKHRoaXMuaW5kZXhPZih2YWwpIHx8IHRoaXMubGVuZ3RoKSwgMSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAodmFyIGkgPSB0aGlzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzW2ldW2tleV0gPT0gdmFsKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2xlYW4gYXJyYXkgZnJvbSBlbXB0eSB2YWx1ZXNcclxuICAgICAqIElmIHBhcmFtZXRlcnMgcHJlc2VudGVkLCBkZWxldGUgaXRlbXMgd2l0Y2ggY29udGFpbnMgcGFzc2VkIHZhbHVlXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHsuLi5UfSBbZGVsZXRlX3ZhbHVlXVxyXG4gICAgICogQHJldHVybnMge0FycmF5fVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBjbGVhbihkZWxldGVfdmFsdWUpIHtcclxuICAgICAgICB2YXIgY2xlYW5fZnJvbSA9IGFyZ3VtZW50cztcclxuICAgICAgICBpZiAodHlwZW9mIGRlbGV0ZV92YWx1ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgY2xlYW5fZnJvbSA9IFt1bmRlZmluZWQsICcnLCBudWxsLCBOYU5dO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgY2xlYW5fZnJvbS5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXNbaV0gPT09IGNsZWFuX2Zyb21bal0pIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICAgICAgICBpLS07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxufSkoQXJyYXkpOyIsIihmdW5jdGlvbiAobmcsIGNyaXAsIEFycmF5LCBTdHJpbmcsIE51bWJlciwgTWF0aCwgUmVnRXhwKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgY3JpcC5jb3JlXHJcbiAgICAgICAgLmNvbmZpZyhDb3JlQ29uZmlnKTtcclxuXHJcbiAgICBDb3JlQ29uZmlnLiRpbmplY3QgPSBbXTtcclxuXHJcbiAgICBmdW5jdGlvbiBDb3JlQ29uZmlnKCkge1xyXG5cclxuICAgICAgICBuZy5leHRlbmQobmcsIHtcclxuICAgICAgICAgICAgaXNFbXB0eTogaXNFbXB0eSxcclxuICAgICAgICAgICAgaGFzVmFsdWU6IGhhc1ZhbHVlLFxyXG4gICAgICAgICAgICBoYXNQcm9wZXJ0eTogaGFzUHJvcGVydHlcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGV0ZXJtaW5lcyBpcyB2YWx1ZSBlbXB0eVxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHZhbHVlXHJcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gaXNFbXB0eSh2YWx1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmcuaXNVbmRlZmluZWQodmFsdWUpIHx8IHZhbHVlID09PSAnJyB8fCB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSAhPT0gdmFsdWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZXRlcm1pbmVzIGlzIHZhbHVlIGluIG9iamVjdFxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHZhbHVlXHJcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gaGFzVmFsdWUodmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuICFpc0VtcHR5KHZhbHVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERldGVybWluZXMgaXMgb2JqZWN0IGNvbnRhaW5pbmcgcHJvcGVydGllcyBjaGFpblxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IG9iamVjdFxyXG4gICAgICAgICAqIEBwYXJhbSB7Li4uc3RyaW5nfSBwcm9wZXJ0aWVzXHJcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gaGFzUHJvcGVydHkob2JqZWN0LCBwcm9wZXJ0aWVzKSB7XHJcbiAgICAgICAgICAgIHZhciBhID0gYXJndW1lbnRzO1xyXG5cclxuICAgICAgICAgICAgaWYgKGEubGVuZ3RoID09PSAwIHx8IGlzRW1wdHkoYVswXSkpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICB2YXIgdGFyZ2V0ID0gYVswXTtcclxuICAgICAgICAgICAgZm9yICh2YXIgYXJnIGluIGEpIHtcclxuICAgICAgICAgICAgICAgIGlmIChhcmcgPT09ICcwJylcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIXRhcmdldC5oYXNPd25Qcm9wZXJ0eShhW2FyZ10pKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXRbYVthcmddXTtcclxuICAgICAgICAgICAgICAgIGlmIChuZy5pc1VuZGVmaW5lZCh0YXJnZXQpKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KShhbmd1bGFyLCB3aW5kb3cuY3JpcCB8fCAod2luZG93LmNyaXAgPSB7fSksIEFycmF5LCBTdHJpbmcsIE51bWJlciwgTWF0aCwgUmVnRXhwKTsiLCIoZnVuY3Rpb24obmcsIGNyaXApe1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuY29yZVxyXG4gICAgICAgIC5ydW4oRmlsZUV4dGVuc2lvbnMpO1xyXG5cclxuICAgIEZpbGVFeHRlbnNpb25zLiRpbmplY3QgPSBbJyR3aW5kb3cnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBGaWxlRXh0ZW5zaW9ucygkd2luZG93KSB7XHJcblxyXG4gICAgICAgIG5nLmV4dGVuZChuZywge1xyXG4gICAgICAgICAgICBpc0ZpbGU6IGlzRmlsZSxcclxuICAgICAgICAgICAgaXNJbWFnZTogaXNJbWFnZSxcclxuICAgICAgICAgICAgaXNIdG1sNTogISEoRmlsZSAmJiBGb3JtRGF0YSksXHJcbiAgICAgICAgICAgIGZpbGVTdXBwb3J0OiAhISgkd2luZG93LkZpbGVSZWFkZXIgJiYgJHdpbmRvdy5DYW52YXNSZW5kZXJpbmdDb250ZXh0MkQpXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERldGVybWluZXMgaXMgaXRlbSBhbiBpbnN0YW5jZSBvZiBGaWxlXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0geyp9IGl0ZW1cclxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBpc0ZpbGUoaXRlbSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmcuaXNPYmplY3QoaXRlbSkgJiYgaXRlbSBpbnN0YW5jZW9mICR3aW5kb3cuRmlsZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERldGVybWluZXMgaXMgZmlsZSBhbiB0eXBlIG9mIGltYWdlXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0ge0ZpbGV9IGZpbGVcclxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBpc0ltYWdlKGZpbGUpIHtcclxuICAgICAgICAgICAgdmFyIHR5cGUgPSAnfCcgKyBmaWxlLnR5cGUuc2xpY2UoZmlsZS50eXBlLmxhc3RJbmRleE9mKCcvJykgKyAxKSArICd8JztcclxuICAgICAgICAgICAgcmV0dXJuICd8anBnfHBuZ3xqcGVnfGJtcHxnaWZ8Jy5pbmRleE9mKHR5cGUpICE9PSAtMTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKGFuZ3VsYXIsIHdpbmRvdy5jcmlwIHx8ICh3aW5kb3cuY3JpcCA9IHt9KSk7IiwiKGZ1bmN0aW9uKE51bWJlcil7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgTnVtYmVyLnByb3RvdHlwZS50b0J5dGVzID0gdG9CeXRlcztcclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbnZlcnQgTnVtYmVyIHRvIHVzZXIgZnJpZW5kbHkgYnl0ZSBzdHJpbmdcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW2hvbGRlcl1cclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHRvQnl0ZXMoaG9sZGVyKSB7XHJcbiAgICAgICAgaG9sZGVyID0gaG9sZGVyIHx8IChob2xkZXIgPSB7fSk7XHJcbiAgICAgICAgaG9sZGVyLnZhbHVlID0gdGhpcztcclxuICAgICAgICBob2xkZXIuc2l6ZSA9IE1hdGgubG9nKGhvbGRlci52YWx1ZSkgLyBNYXRoLmxvZygxZTMpIHwgMDtcclxuICAgICAgICBob2xkZXIubnVtID0gKGhvbGRlci52YWx1ZSAvIE1hdGgucG93KDFlMywgaG9sZGVyLnNpemUpKS50b0ZpeGVkKDIpO1xyXG4gICAgICAgIGhvbGRlci50ZXh0ID0gKGhvbGRlci5zaXplID8gKCdrTUdUUEVaWSdbLS1ob2xkZXIuc2l6ZV0gKyAnQicpIDogJ0J5dGVzJyk7XHJcblxyXG4gICAgICAgIHJldHVybiAne251bX0ge3RleHR9Jy5zdXBwbGFudChob2xkZXIpO1xyXG4gICAgfVxyXG59KShOdW1iZXIpOyIsIihmdW5jdGlvbiAoU3RyaW5nKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgU3RyaW5nLnByb3RvdHlwZS5zdXBwbGFudCA9IHN1cHBsYW50O1xyXG4gICAgU3RyaW5nLnByb3RvdHlwZS5yZXBsYWNlQWxsID0gcmVwbGFjZUFsbDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEEgc2ltcGxlIHRlbXBsYXRpbmcgbWV0aG9kIGZvciByZXBsYWNpbmcgcGxhY2Vob2xkZXJzIGVuY2xvc2VkIGluIGN1cmx5IGJyYWNlcy5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb1xyXG4gICAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gc3VwcGxhbnQobykge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnJlcGxhY2UoL3soW157fV0qKX0vZyxcclxuICAgICAgICAgICAgZnVuY3Rpb24gKGEsIGIpIHtcclxuICAgICAgICAgICAgICAgIHZhciByID0gb1tiXTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0eXBlb2YgciA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHIgPT09ICdudW1iZXInID8gciA6IGE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVwbGFjZSBhbGwgb2NjdXJyZW5jZXMgaW4gc3RyaW5nXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHNlYXJjaFZhbHVlIFVzZWQgaW4gUmVnRXhwXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xmdW5jdGlvbn0gcmVwbGFjZVZhbHVlXHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiByZXBsYWNlQWxsKHNlYXJjaFZhbHVlLCByZXBsYWNlVmFsdWUpIHtcclxuICAgICAgICB2YXIgdGFyZ2V0ID0gdGhpcztcclxuICAgICAgICByZXR1cm4gdGFyZ2V0LnJlcGxhY2UobmV3IFJlZ0V4cChzZWFyY2hWYWx1ZSwgJ2cnKSwgcmVwbGFjZVZhbHVlKTtcclxuICAgIH1cclxuXHJcbn0pKFN0cmluZyk7IiwiKGZ1bmN0aW9uIChuZywgY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuY29yZVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2NyaXBDb250ZXh0bWVudScsIGNyaXBDb250ZXh0bWVudSk7XHJcblxyXG4gICAgY3JpcENvbnRleHRtZW51LiRpbmplY3QgPSBbJyRwYXJzZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGNyaXBDb250ZXh0bWVudSgkcGFyc2UpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgICAgICAgICBsaW5rOiBsaW5rXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gbGluayhzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmwpIHtcclxuICAgICAgICAgICAgdmFyIGZuID0gJHBhcnNlKGF0dHJzLmNyaXBDb250ZXh0bWVudSk7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuYmluZChcImNvbnRleHRtZW51XCIsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgICAgICAgICAgc2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZm4oc2NvcGUsIHskZXZlbnQ6ZXZlbnQsICRlbGVtZW50OiBlbGVtZW50fSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvLyBSZW1vdmVzIGJvdW5kIGV2ZW50cyBpbiB0aGUgZWxlbWVudCBpdHNlbGZcclxuICAgICAgICAgICAgLy8gd2hlbiB0aGUgc2NvcGUgaXMgZGVzdHJveWVkXHJcbiAgICAgICAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Lm9mZihhdHRycy5jcmlwQ29udGV4dG1lbnUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKGFuZ3VsYXIsIHdpbmRvdy5jcmlwIHx8ICh3aW5kb3cuY3JpcCA9IHt9KSk7XHJcbiIsIihmdW5jdGlvbiAobmcsIGNyaXApIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmNvcmVcclxuICAgICAgICAuZGlyZWN0aXZlKCdjcmlwRW50ZXInLCBjcmlwRW50ZXIpO1xyXG5cclxuICAgIGNyaXBFbnRlci4kaW5qZWN0ID0gW107XHJcblxyXG4gICAgZnVuY3Rpb24gY3JpcEVudGVyKCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICAgICAgICAgIGxpbms6IGxpbmtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBsaW5rKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybCkge1xyXG4gICAgICAgICAgICBlbGVtZW50LmJpbmQoXCJrZXlkb3duIGtleXByZXNzXCIsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LndoaWNoID09PSAxMykge1xyXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLiRldmFsKGF0dHJzLmNyaXBFbnRlciwgeydldmVudCc6IGV2ZW50fSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gUmVtb3ZlcyBib3VuZCBldmVudHMgaW4gdGhlIGVsZW1lbnQgaXRzZWxmXHJcbiAgICAgICAgICAgIC8vIHdoZW4gdGhlIHNjb3BlIGlzIGRlc3Ryb3llZFxyXG4gICAgICAgICAgICBzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5vZmYoYXR0cnMuY3JpcEVudGVyKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KShhbmd1bGFyLCB3aW5kb3cuY3JpcCB8fCAod2luZG93LmNyaXAgPSB7fSkpO1xyXG4iLCIoZnVuY3Rpb24gKGNyaXApIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmNvcmVcclxuICAgICAgICAuZGlyZWN0aXZlKCdjcmlwRm9jdXMnLCBjcmlwRm9jdXMpO1xyXG5cclxuICAgIGNyaXBGb2N1cy4kaW5qZWN0ID0gWydmb2N1cyddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGNyaXBGb2N1cyhmb2N1cykge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICAgICAgICAgIGxpbms6IGxpbmtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBsaW5rKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybCkge1xyXG4gICAgICAgICAgICBlbGVtZW50Lm9uKGF0dHJzLmNyaXBGb2N1cywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgZm9jdXMoYXR0cnMuY3JpcFNlbGVjdG9yKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvLyBSZW1vdmVzIGJvdW5kIGV2ZW50cyBpbiB0aGUgZWxlbWVudCBpdHNlbGZcclxuICAgICAgICAgICAgLy8gd2hlbiB0aGUgc2NvcGUgaXMgZGVzdHJveWVkXHJcbiAgICAgICAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Lm9mZihhdHRycy5jcmlwRm9jdXMpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKHdpbmRvdy5jcmlwIHx8ICh3aW5kb3cuY3JpcCA9IHt9KSk7IiwiKGZ1bmN0aW9uIChuZywgY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuY29yZVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2NyaXBUaHVtYicsIGNyaXBUaHVtYik7XHJcblxyXG4gICAgZnVuY3Rpb24gY3JpcFRodW1iKCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnPGNhbnZhcy8+JyxcclxuICAgICAgICAgICAgbGluazogbGlua1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGxpbmsoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKXtcclxuICAgICAgICAgICAgaWYoIW5nLmZpbGVTdXBwb3J0KSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICB2YXIgcGFyYW1zID0gc2NvcGUuJGV2YWwoYXR0cnMuY3JpcFRodW1iKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghbmcuaXNGaWxlKHBhcmFtcy5maWxlKSB8fCAhbmcuaXNJbWFnZShwYXJhbXMuZmlsZSkpIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgY2FudmFzID0gZWxlbWVudC5maW5kKCdjYW52YXMnKTtcclxuICAgICAgICAgICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XHJcblxyXG4gICAgICAgICAgICByZWFkZXIub25sb2FkID0gb25Mb2FkRmlsZTtcclxuICAgICAgICAgICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwocGFyYW1zLmZpbGUpO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gb25Mb2FkRmlsZShldmVudCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGltZyA9IG5ldyBJbWFnZSgpO1xyXG4gICAgICAgICAgICAgICAgaW1nLm9ubG9hZCA9IG9uTG9hZEltYWdlO1xyXG4gICAgICAgICAgICAgICAgaW1nLnNyYyA9IGV2ZW50LnRhcmdldC5yZXN1bHQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uTG9hZEltYWdlKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHdpZHRoID0gcGFyYW1zLndpZHRoIHx8IHRoaXMud2lkdGggLyB0aGlzLmhlaWdodCAqIHBhcmFtcy5oZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICB2YXIgaGVpZ2h0ID0gcGFyYW1zLmhlaWdodCB8fCB0aGlzLmhlaWdodCAvIHRoaXMud2lkdGggKiBwYXJhbXMud2lkdGg7XHJcbiAgICAgICAgICAgICAgICBjYW52YXMuYXR0cih7d2lkdGg6IHdpZHRoLCBoZWlnaHQ6IGhlaWdodH0pO1xyXG4gICAgICAgICAgICAgICAgY2FudmFzWzBdLmdldENvbnRleHQoJzJkJykuZHJhd0ltYWdlKHRoaXMsIDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufSkoYW5ndWxhciwgd2luZG93LmNyaXAgfHwgKHdpbmRvdy5jcmlwID0ge30pKTsiLCIoZnVuY3Rpb24gKCQsIGNyaXApIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmNvcmVcclxuICAgICAgICAuZmFjdG9yeSgnZm9jdXMnLCBmb2N1cyk7XHJcblxyXG4gICAgZm9jdXMuJGluamVjdCA9IFsnJHRpbWVvdXQnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBmb2N1cygkdGltZW91dCkge1xyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoc2VsZWN0b3IsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIC8vIHRpbWVvdXQgbWFrZXMgc3VyZSB0aGF0IGl0IGlzIGludm9rZWQgYWZ0ZXIgYW55IG90aGVyIGV2ZW50IGhhcyBiZWVuIHRyaWdnZXJlZC5cclxuICAgICAgICAgICAgLy8gZS5nLiBjbGljayBldmVudHMgdGhhdCBuZWVkIHRvIHJ1biBiZWZvcmUgdGhlIGZvY3VzIG9yXHJcbiAgICAgICAgICAgIC8vIGlucHV0cyBlbGVtZW50cyB0aGF0IGFyZSBpbiBhIGRpc2FibGVkIHN0YXRlIGJ1dCBhcmUgZW5hYmxlZCB3aGVuIHRob3NlIGV2ZW50c1xyXG4gICAgICAgICAgICAvLyBhcmUgdHJpZ2dlcmVkLlxyXG4gICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgJGVsZW1lbnQgPSAkKHNlbGVjdG9yKTtcclxuICAgICAgICAgICAgICAgIGlmICgkZWxlbWVudC5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkZWxlbWVudC5mb2N1cyhjYWxsYmFjayk7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkZWxlbWVudC5mb2N1cygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKGpRdWVyeSwgd2luZG93LmNyaXAgfHwgKHdpbmRvdy5jcmlwID0ge30pKTsiLCIoZnVuY3Rpb24gKGNyaXAsIE1hdGgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmNvcmVcclxuICAgICAgICAuc2VydmljZSgnY3JpcFN0clJhbmRvbScsIGNyaXBTdHJSYW5kb20pO1xyXG5cclxuICAgIGNyaXBTdHJSYW5kb20uJGluamVjdCA9IFtdO1xyXG5cclxuICAgIGZ1bmN0aW9uIGNyaXBTdHJSYW5kb20oKSB7XHJcbiAgICAgICAgdmFyIHBvc3NpYmxlID0gJy1fQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODlfLSc7XHJcblxyXG4gICAgICAgIHRoaXMuY2hhbmdlQ2hhcnMgPSBmdW5jdGlvbiAoY2hhcnMpIHtcclxuICAgICAgICAgICAgcG9zc2libGUgPSBjaGFycztcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLm5ldyA9IGZ1bmN0aW9uIChsZW5ndGgpIHtcclxuICAgICAgICAgICAgbGVuZ3RoIHw9IDE2O1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gJyc7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBwb3NzaWJsZS5jaGFyQXQoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogcG9zc2libGUubGVuZ3RoKSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufSkod2luZG93LmNyaXAgfHwgKHdpbmRvdy5jcmlwID0ge30pLCBNYXRoKTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
