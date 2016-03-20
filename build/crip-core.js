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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvcmUubW9kdWxlLmpzIiwiYXJyYXkuZXh0ZW5zaW9ucy5qcyIsImNvbmZpZy5qcyIsImZpbGUuZXh0ZW5zaW9ucy5qcyIsIm51bWJlci5leHRlbnNpb25zLmpzIiwic3RyaW5nLmV4dGVuc2lvbnMuanMiLCJkaXJlY3RpdmVzL2NyaXBFbnRlci5qcyIsImRpcmVjdGl2ZXMvY3JpcEZvY3VzLmpzIiwiZGlyZWN0aXZlcy9jcmlwVGh1bWIuanMiLCJmYWN0b3JpZXMvZm9jdXMuanMiLCJzZXJ2aWNlcy9jcmlwU3RyUmFuZG9tLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiY3JpcC1jb3JlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIChuZywgY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuY29yZSA9IG5nLm1vZHVsZSgnY3JpcC5jb3JlJywgW10pO1xyXG5cclxufSkoYW5ndWxhciwgd2luZG93LmNyaXAgfHwgKHdpbmRvdy5jcmlwID0ge30pKTsiLCIoZnVuY3Rpb24gKEFycmF5KSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgQXJyYXkucHJvdG90eXBlLmRpZmYgPSBkaWZmO1xyXG4gICAgQXJyYXkucHJvdG90eXBlLnJlbW92ZUl0ZW0gPSByZW1vdmVJdGVtO1xyXG4gICAgQXJyYXkucHJvdG90eXBlLmNsZWFuID0gY2xlYW47XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgZGlmZmVyZW50IGVsZW1lbnRzIGZyb20gQXJyYXlcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBhXHJcbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9XHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGRpZmYoYSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZpbHRlcihmdW5jdGlvbiAoaSkge1xyXG4gICAgICAgICAgICByZXR1cm4gYS5pbmRleE9mKGkpIDwgMDtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZSBpdGVtIGZyb20gQXJyYXlcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0geyp9IHZhbFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGtleVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiByZW1vdmVJdGVtKHZhbCwga2V5KSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBrZXkgPT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgICAgICAgdGhpcy5zcGxpY2UoKHRoaXMuaW5kZXhPZih2YWwpIHx8IHRoaXMubGVuZ3RoKSwgMSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAodmFyIGkgPSB0aGlzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzW2ldW2tleV0gPT0gdmFsKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2xlYW4gYXJyYXkgZnJvbSBlbXB0eSB2YWx1ZXNcclxuICAgICAqIElmIHBhcmFtZXRlcnMgcHJlc2VudGVkLCBkZWxldGUgaXRlbXMgd2l0Y2ggY29udGFpbnMgcGFzc2VkIHZhbHVlXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHsuLi5UfSBbZGVsZXRlX3ZhbHVlXVxyXG4gICAgICogQHJldHVybnMge0FycmF5fVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBjbGVhbihkZWxldGVfdmFsdWUpIHtcclxuICAgICAgICB2YXIgY2xlYW5fZnJvbSA9IGFyZ3VtZW50cztcclxuICAgICAgICBpZiAodHlwZW9mIGRlbGV0ZV92YWx1ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgY2xlYW5fZnJvbSA9IFt1bmRlZmluZWQsICcnLCBudWxsLCBOYU5dO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgY2xlYW5fZnJvbS5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXNbaV0gPT09IGNsZWFuX2Zyb21bal0pIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICAgICAgICBpLS07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxufSkoQXJyYXkpOyIsIihmdW5jdGlvbiAobmcsIGNyaXAsIEFycmF5LCBTdHJpbmcsIE51bWJlciwgTWF0aCwgUmVnRXhwKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgY3JpcC5jb3JlXHJcbiAgICAgICAgLmNvbmZpZyhDb3JlQ29uZmlnKTtcclxuXHJcbiAgICBDb3JlQ29uZmlnLiRpbmplY3QgPSBbXTtcclxuXHJcbiAgICBmdW5jdGlvbiBDb3JlQ29uZmlnKCkge1xyXG5cclxuICAgICAgICBuZy5leHRlbmQobmcsIHtcclxuICAgICAgICAgICAgaXNFbXB0eTogaXNFbXB0eSxcclxuICAgICAgICAgICAgaGFzVmFsdWU6IGhhc1ZhbHVlLFxyXG4gICAgICAgICAgICBoYXNQcm9wZXJ0eTogaGFzUHJvcGVydHlcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGV0ZXJtaW5lcyBpcyB2YWx1ZSBlbXB0eVxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHZhbHVlXHJcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gaXNFbXB0eSh2YWx1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmcuaXNVbmRlZmluZWQodmFsdWUpIHx8IHZhbHVlID09PSAnJyB8fCB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSAhPT0gdmFsdWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZXRlcm1pbmVzIGlzIHZhbHVlIGluIG9iamVjdFxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHZhbHVlXHJcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gaGFzVmFsdWUodmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuICFpc0VtcHR5KHZhbHVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERldGVybWluZXMgaXMgb2JqZWN0IGNvbnRhaW5pbmcgcHJvcGVydGllcyBjaGFpblxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IG9iamVjdFxyXG4gICAgICAgICAqIEBwYXJhbSB7Li4uc3RyaW5nfSBwcm9wZXJ0aWVzXHJcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gaGFzUHJvcGVydHkob2JqZWN0LCBwcm9wZXJ0aWVzKSB7XHJcbiAgICAgICAgICAgIHZhciBhID0gYXJndW1lbnRzO1xyXG5cclxuICAgICAgICAgICAgaWYgKGEubGVuZ3RoID09PSAwIHx8IGlzRW1wdHkoYVswXSkpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICB2YXIgdGFyZ2V0ID0gYVswXTtcclxuICAgICAgICAgICAgZm9yICh2YXIgYXJnIGluIGEpIHtcclxuICAgICAgICAgICAgICAgIGlmIChhcmcgPT09ICcwJylcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIXRhcmdldC5oYXNPd25Qcm9wZXJ0eShhW2FyZ10pKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXRbYVthcmddXTtcclxuICAgICAgICAgICAgICAgIGlmIChuZy5pc1VuZGVmaW5lZCh0YXJnZXQpKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KShhbmd1bGFyLCB3aW5kb3cuY3JpcCB8fCAod2luZG93LmNyaXAgPSB7fSksIEFycmF5LCBTdHJpbmcsIE51bWJlciwgTWF0aCwgUmVnRXhwKTsiLCIoZnVuY3Rpb24obmcsIGNyaXApe1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuY29yZVxyXG4gICAgICAgIC5ydW4oRmlsZUV4dGVuc2lvbnMpO1xyXG5cclxuICAgIEZpbGVFeHRlbnNpb25zLiRpbmplY3QgPSBbJyR3aW5kb3cnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBGaWxlRXh0ZW5zaW9ucygkd2luZG93KSB7XHJcblxyXG4gICAgICAgIG5nLmV4dGVuZChuZywge1xyXG4gICAgICAgICAgICBpc0ZpbGU6IGlzRmlsZSxcclxuICAgICAgICAgICAgaXNJbWFnZTogaXNJbWFnZSxcclxuICAgICAgICAgICAgZmlsZVN1cHBvcnQ6ICEhKCR3aW5kb3cuRmlsZVJlYWRlciAmJiAkd2luZG93LkNhbnZhc1JlbmRlcmluZ0NvbnRleHQyRClcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGV0ZXJtaW5lcyBpcyBpdGVtIGFuIGluc3RhbmNlIG9mIEZpbGVcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7Kn0gaXRlbVxyXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGlzRmlsZShpdGVtKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZy5pc09iamVjdChpdGVtKSAmJiBpdGVtIGluc3RhbmNlb2YgJHdpbmRvdy5GaWxlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGV0ZXJtaW5lcyBpcyBmaWxlIGFuIHR5cGUgb2YgaW1hZ2VcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7RmlsZX0gZmlsZVxyXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGlzSW1hZ2UoZmlsZSkge1xyXG4gICAgICAgICAgICB2YXIgdHlwZSA9ICd8JyArIGZpbGUudHlwZS5zbGljZShmaWxlLnR5cGUubGFzdEluZGV4T2YoJy8nKSArIDEpICsgJ3wnO1xyXG4gICAgICAgICAgICByZXR1cm4gJ3xqcGd8cG5nfGpwZWd8Ym1wfGdpZnwnLmluZGV4T2YodHlwZSkgIT09IC0xO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoYW5ndWxhciwgd2luZG93LmNyaXAgfHwgKHdpbmRvdy5jcmlwID0ge30pKTsiLCIoZnVuY3Rpb24oTnVtYmVyKXtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBOdW1iZXIucHJvdG90eXBlLnRvQnl0ZXMgPSB0b0J5dGVzO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29udmVydCBOdW1iZXIgdG8gdXNlciBmcmllbmRseSBieXRlIHN0cmluZ1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbaG9sZGVyXVxyXG4gICAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gdG9CeXRlcyhob2xkZXIpIHtcclxuICAgICAgICBob2xkZXIgPSBob2xkZXIgfHwgKGhvbGRlciA9IHt9KTtcclxuICAgICAgICBob2xkZXIudmFsdWUgPSB0aGlzO1xyXG4gICAgICAgIGhvbGRlci5zaXplID0gTWF0aC5sb2coaG9sZGVyLnZhbHVlKSAvIE1hdGgubG9nKDFlMykgfCAwO1xyXG4gICAgICAgIGhvbGRlci5udW0gPSAoaG9sZGVyLnZhbHVlIC8gTWF0aC5wb3coMWUzLCBob2xkZXIuc2l6ZSkpLnRvRml4ZWQoMik7XHJcbiAgICAgICAgaG9sZGVyLnRleHQgPSAoaG9sZGVyLnNpemUgPyAoJ2tNR1RQRVpZJ1stLWhvbGRlci5zaXplXSArICdCJykgOiAnQnl0ZXMnKTtcclxuXHJcbiAgICAgICAgcmV0dXJuICd7bnVtfSB7dGV4dH0nLnN1cHBsYW50KGhvbGRlcik7XHJcbiAgICB9XHJcbn0pKE51bWJlcik7IiwiKGZ1bmN0aW9uIChTdHJpbmcpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBTdHJpbmcucHJvdG90eXBlLnN1cHBsYW50ID0gc3VwcGxhbnQ7XHJcbiAgICBTdHJpbmcucHJvdG90eXBlLnJlcGxhY2VBbGwgPSByZXBsYWNlQWxsO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQSBzaW1wbGUgdGVtcGxhdGluZyBtZXRob2QgZm9yIHJlcGxhY2luZyBwbGFjZWhvbGRlcnMgZW5jbG9zZWQgaW4gY3VybHkgYnJhY2VzLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvXHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBzdXBwbGFudChvKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucmVwbGFjZSgveyhbXnt9XSopfS9nLFxyXG4gICAgICAgICAgICBmdW5jdGlvbiAoYSwgYikge1xyXG4gICAgICAgICAgICAgICAgdmFyIHIgPSBvW2JdO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiByID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgciA9PT0gJ251bWJlcicgPyByIDogYTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXBsYWNlIGFsbCBvY2N1cnJlbmNlcyBpbiBzdHJpbmdcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc2VhcmNoVmFsdWUgVXNlZCBpbiBSZWdFeHBcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfGZ1bmN0aW9ufSByZXBsYWNlVmFsdWVcclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHJlcGxhY2VBbGwoc2VhcmNoVmFsdWUsIHJlcGxhY2VWYWx1ZSkge1xyXG4gICAgICAgIHZhciB0YXJnZXQgPSB0aGlzO1xyXG4gICAgICAgIHJldHVybiB0YXJnZXQucmVwbGFjZShuZXcgUmVnRXhwKHNlYXJjaFZhbHVlLCAnZycpLCByZXBsYWNlVmFsdWUpO1xyXG4gICAgfVxyXG5cclxufSkoU3RyaW5nKTsiLCIoZnVuY3Rpb24gKG5nLCBjcmlwKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgY3JpcC5jb3JlXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgnY3JpcEVudGVyJywgY3JpcEVudGVyKTtcclxuXHJcbiAgICBjcmlwRW50ZXIuJGluamVjdCA9IFtdO1xyXG5cclxuICAgIGZ1bmN0aW9uIGNyaXBFbnRlcigpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgICAgICAgICBsaW5rOiBsaW5rXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gbGluayhzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmwpIHtcclxuICAgICAgICAgICAgZWxlbWVudC5iaW5kKFwia2V5ZG93biBrZXlwcmVzc1wiLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIGlmIChldmVudC53aGljaCA9PT0gMTMpIHtcclxuICAgICAgICAgICAgICAgICAgICBzY29wZS4kYXBwbHkoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZS4kZXZhbChhdHRycy5jcmlwRW50ZXIsIHsnZXZlbnQnOiBldmVudH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIFJlbW92ZXMgYm91bmQgZXZlbnRzIGluIHRoZSBlbGVtZW50IGl0c2VsZlxyXG4gICAgICAgICAgICAvLyB3aGVuIHRoZSBzY29wZSBpcyBkZXN0cm95ZWRcclxuICAgICAgICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQub2ZmKGF0dHJzLmNyaXBFbnRlcik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoYW5ndWxhciwgd2luZG93LmNyaXAgfHwgKHdpbmRvdy5jcmlwID0ge30pKTtcclxuIiwiKGZ1bmN0aW9uIChjcmlwKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgY3JpcC5jb3JlXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgnY3JpcEZvY3VzJywgY3JpcEZvY3VzKTtcclxuXHJcbiAgICBjcmlwRm9jdXMuJGluamVjdCA9IFsnZm9jdXMnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBjcmlwRm9jdXMoZm9jdXMpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgICAgICAgICBsaW5rOiBsaW5rXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gbGluayhzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmwpIHtcclxuICAgICAgICAgICAgZWxlbWVudC5vbihhdHRycy5jcmlwRm9jdXMsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGZvY3VzKGF0dHJzLmNyaXBTZWxlY3Rvcik7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gUmVtb3ZlcyBib3VuZCBldmVudHMgaW4gdGhlIGVsZW1lbnQgaXRzZWxmXHJcbiAgICAgICAgICAgIC8vIHdoZW4gdGhlIHNjb3BlIGlzIGRlc3Ryb3llZFxyXG4gICAgICAgICAgICBzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5vZmYoYXR0cnMuY3JpcEZvY3VzKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSh3aW5kb3cuY3JpcCB8fCAod2luZG93LmNyaXAgPSB7fSkpOyIsIihmdW5jdGlvbiAobmcsIGNyaXApIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmNvcmVcclxuICAgICAgICAuZGlyZWN0aXZlKCdjcmlwVGh1bWInLCBjcmlwVGh1bWIpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGNyaXBUaHVtYigpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJzxjYW52YXMvPicsXHJcbiAgICAgICAgICAgIGxpbms6IGxpbmtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBsaW5rKHNjb3BlLCBlbGVtZW50LCBhdHRycyl7XHJcbiAgICAgICAgICAgIGlmKCFuZy5maWxlU3VwcG9ydCkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgdmFyIHBhcmFtcyA9IHNjb3BlLiRldmFsKGF0dHJzLmNyaXBUaHVtYik7XHJcblxyXG4gICAgICAgICAgICBpZiAoIW5nLmlzRmlsZShwYXJhbXMuZmlsZSkgfHwgIW5nLmlzSW1hZ2UocGFyYW1zLmZpbGUpKSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LmhpZGUoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIGNhbnZhcyA9IGVsZW1lbnQuZmluZCgnY2FudmFzJyk7XHJcbiAgICAgICAgICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xyXG5cclxuICAgICAgICAgICAgcmVhZGVyLm9ubG9hZCA9IG9uTG9hZEZpbGU7XHJcbiAgICAgICAgICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKHBhcmFtcy5maWxlKTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uTG9hZEZpbGUoZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIHZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcclxuICAgICAgICAgICAgICAgIGltZy5vbmxvYWQgPSBvbkxvYWRJbWFnZTtcclxuICAgICAgICAgICAgICAgIGltZy5zcmMgPSBldmVudC50YXJnZXQucmVzdWx0O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBvbkxvYWRJbWFnZSgpIHtcclxuICAgICAgICAgICAgICAgIHZhciB3aWR0aCA9IHBhcmFtcy53aWR0aCB8fCB0aGlzLndpZHRoIC8gdGhpcy5oZWlnaHQgKiBwYXJhbXMuaGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgdmFyIGhlaWdodCA9IHBhcmFtcy5oZWlnaHQgfHwgdGhpcy5oZWlnaHQgLyB0aGlzLndpZHRoICogcGFyYW1zLndpZHRoO1xyXG4gICAgICAgICAgICAgICAgY2FudmFzLmF0dHIoe3dpZHRoOiB3aWR0aCwgaGVpZ2h0OiBoZWlnaHR9KTtcclxuICAgICAgICAgICAgICAgIGNhbnZhc1swXS5nZXRDb250ZXh0KCcyZCcpLmRyYXdJbWFnZSh0aGlzLCAwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn0pKGFuZ3VsYXIsIHdpbmRvdy5jcmlwIHx8ICh3aW5kb3cuY3JpcCA9IHt9KSk7IiwiKGZ1bmN0aW9uICgkLCBjcmlwKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgY3JpcC5jb3JlXHJcbiAgICAgICAgLmZhY3RvcnkoJ2ZvY3VzJywgZm9jdXMpO1xyXG5cclxuICAgIGZvY3VzLiRpbmplY3QgPSBbJyR0aW1lb3V0J107XHJcblxyXG4gICAgZnVuY3Rpb24gZm9jdXMoJHRpbWVvdXQpIHtcclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHNlbGVjdG9yLCBjYWxsYmFjaykge1xyXG4gICAgICAgICAgICAvLyB0aW1lb3V0IG1ha2VzIHN1cmUgdGhhdCBpdCBpcyBpbnZva2VkIGFmdGVyIGFueSBvdGhlciBldmVudCBoYXMgYmVlbiB0cmlnZ2VyZWQuXHJcbiAgICAgICAgICAgIC8vIGUuZy4gY2xpY2sgZXZlbnRzIHRoYXQgbmVlZCB0byBydW4gYmVmb3JlIHRoZSBmb2N1cyBvclxyXG4gICAgICAgICAgICAvLyBpbnB1dHMgZWxlbWVudHMgdGhhdCBhcmUgaW4gYSBkaXNhYmxlZCBzdGF0ZSBidXQgYXJlIGVuYWJsZWQgd2hlbiB0aG9zZSBldmVudHNcclxuICAgICAgICAgICAgLy8gYXJlIHRyaWdnZXJlZC5cclxuICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyICRlbGVtZW50ID0gJChzZWxlY3Rvcik7XHJcbiAgICAgICAgICAgICAgICBpZiAoJGVsZW1lbnQubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGVsZW1lbnQuZm9jdXMoY2FsbGJhY2spO1xyXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGVsZW1lbnQuZm9jdXMoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KShqUXVlcnksIHdpbmRvdy5jcmlwIHx8ICh3aW5kb3cuY3JpcCA9IHt9KSk7IiwiKGZ1bmN0aW9uIChjcmlwLCBNYXRoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgY3JpcC5jb3JlXHJcbiAgICAgICAgLnNlcnZpY2UoJ2NyaXBTdHJSYW5kb20nLCBjcmlwU3RyUmFuZG9tKTtcclxuXHJcbiAgICBjcmlwU3RyUmFuZG9tLiRpbmplY3QgPSBbXTtcclxuXHJcbiAgICBmdW5jdGlvbiBjcmlwU3RyUmFuZG9tKCkge1xyXG4gICAgICAgIHZhciBwb3NzaWJsZSA9ICctX0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Xy0nO1xyXG5cclxuICAgICAgICB0aGlzLmNoYW5nZUNoYXJzID0gZnVuY3Rpb24gKGNoYXJzKSB7XHJcbiAgICAgICAgICAgIHBvc3NpYmxlID0gY2hhcnM7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5uZXcgPSBmdW5jdGlvbiAobGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGxlbmd0aCB8PSAxNjtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9ICcnO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gcG9zc2libGUuY2hhckF0KE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHBvc3NpYmxlLmxlbmd0aCkpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn0pKHdpbmRvdy5jcmlwIHx8ICh3aW5kb3cuY3JpcCA9IHt9KSwgTWF0aCk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
