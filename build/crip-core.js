(function (ng, crip) {
    'use strict';

    crip.core = ng.module('crip.core', []);

})(angular, window.crip || (window.crip = {}));
(function (ng, crip, Array, String, Number, Math) {
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
            holder.value = this;
            holder.size = Math.log(holder.value) / Math.log(1e3) | 0;
            holder.num = (holder.value / Math.pow(1e3, holder.size)).toFixed(2);
            holder.text = (holder.size ? ('kMGTPEZY'[--holder.size] + 'B') : 'Bytes');

            return '{num} {text}'.supplant(holder);
        }
    }
})(angular, window.crip || (window.crip = {}), Array, String, Number, Math);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvcmUubW9kdWxlLmpzIiwiY29uZmlnLmpzIiwiZmlsZS5leHRlbnNpb25zLmpzIiwiZGlyZWN0aXZlcy9jcmlwRW50ZXIuanMiLCJkaXJlY3RpdmVzL2NyaXBGb2N1cy5qcyIsImRpcmVjdGl2ZXMvY3JpcFRodW1iLmpzIiwiZmFjdG9yaWVzL2ZvY3VzLmpzIiwic2VydmljZXMvY3JpcFN0clJhbmRvbS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiY3JpcC1jb3JlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIChuZywgY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuY29yZSA9IG5nLm1vZHVsZSgnY3JpcC5jb3JlJywgW10pO1xyXG5cclxufSkoYW5ndWxhciwgd2luZG93LmNyaXAgfHwgKHdpbmRvdy5jcmlwID0ge30pKTsiLCIoZnVuY3Rpb24gKG5nLCBjcmlwLCBBcnJheSwgU3RyaW5nLCBOdW1iZXIsIE1hdGgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmNvcmVcclxuICAgICAgICAuY29uZmlnKENvcmVDb25maWcpO1xyXG5cclxuICAgIENvcmVDb25maWcuJGluamVjdCA9IFtdO1xyXG5cclxuICAgIGZ1bmN0aW9uIENvcmVDb25maWcoKSB7XHJcbiAgICAgICAgQXJyYXkucHJvdG90eXBlLmRpZmYgPSBkaWZmO1xyXG4gICAgICAgIEFycmF5LnByb3RvdHlwZS5yZW1vdmVJdGVtID0gcmVtb3ZlSXRlbTtcclxuXHJcbiAgICAgICAgU3RyaW5nLnByb3RvdHlwZS5zdXBwbGFudCA9IHN1cHBsYW50O1xyXG4gICAgICAgIE51bWJlci5wcm90b3R5cGUudG9CeXRlcyA9IHRvQnl0ZXM7XHJcblxyXG4gICAgICAgIG5nLmV4dGVuZChuZywge1xyXG4gICAgICAgICAgICBpc0VtcHR5OiBpc0VtcHR5LFxyXG4gICAgICAgICAgICBoYXNWYWx1ZTogaGFzVmFsdWUsXHJcbiAgICAgICAgICAgIGhhc1Byb3BlcnR5OiBoYXNQcm9wZXJ0eVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBHZXQgZGlmZmVyZW50IGVsZW1lbnRzIGZyb20gQXJyYXlcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7QXJyYXl9IGFcclxuICAgICAgICAgKiBAcmV0dXJucyB7QXJyYXl9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gZGlmZihhKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbHRlcihmdW5jdGlvbiAoaSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGEuaW5kZXhPZihpKSA8IDA7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVtb3ZlIGl0ZW0gZnJvbSBBcnJheVxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHsqfSB2YWxcclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gcmVtb3ZlSXRlbSh2YWwsIGtleSkge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGtleSA9PT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zcGxpY2UoKHRoaXMuaW5kZXhPZih2YWwpIHx8IHRoaXMubGVuZ3RoKSwgMSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSB0aGlzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpc1tpXVtrZXldID09IHZhbClcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGV0ZXJtaW5lcyBpcyB2YWx1ZSBlbXB0eVxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHZhbHVlXHJcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gaXNFbXB0eSh2YWx1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmcuaXNVbmRlZmluZWQodmFsdWUpIHx8IHZhbHVlID09PSAnJyB8fCB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSAhPT0gdmFsdWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZXRlcm1pbmVzIGlzIHZhbHVlIGluIG9iamVjdFxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHZhbHVlXHJcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gaGFzVmFsdWUodmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuICFpc0VtcHR5KHZhbHVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERldGVybWluZXMgaXMgb2JqZWN0IGNvbnRhaW5pbmcgcHJvcGVydGllcyBjaGFpblxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IG9iamVjdFxyXG4gICAgICAgICAqIEBwYXJhbSB7Li4uc3RyaW5nfSBwcm9wZXJ0aWVzXHJcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gaGFzUHJvcGVydHkob2JqZWN0LCBwcm9wZXJ0aWVzKSB7XHJcbiAgICAgICAgICAgIHZhciBhID0gYXJndW1lbnRzO1xyXG5cclxuICAgICAgICAgICAgaWYgKGEubGVuZ3RoID09PSAwIHx8IGlzRW1wdHkoYVswXSkpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICB2YXIgdGFyZ2V0ID0gYVswXTtcclxuICAgICAgICAgICAgZm9yICh2YXIgYXJnIGluIGEpIHtcclxuICAgICAgICAgICAgICAgIGlmIChhcmcgPT09ICcwJylcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIXRhcmdldC5oYXNPd25Qcm9wZXJ0eShhW2FyZ10pKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXRbYVthcmddXTtcclxuICAgICAgICAgICAgICAgIGlmIChuZy5pc1VuZGVmaW5lZCh0YXJnZXQpKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBBIHNpbXBsZSB0ZW1wbGF0aW5nIG1ldGhvZCBmb3IgcmVwbGFjaW5nIHBsYWNlaG9sZGVycyBlbmNsb3NlZCBpbiBjdXJseSBicmFjZXMuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gb1xyXG4gICAgICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gc3VwcGxhbnQobykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZXBsYWNlKC97KFtee31dKil9L2csXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoYSwgYikge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByID0gb1tiXTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHlwZW9mIHIgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiByID09PSAnbnVtYmVyJyA/IHIgOiBhO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ29udmVydCBOdW1iZXIgdG8gdXNlciBmcmllbmRseSBieXRlIHN0cmluZ1xyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIFtob2xkZXJdXHJcbiAgICAgICAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiB0b0J5dGVzKGhvbGRlcikge1xyXG4gICAgICAgICAgICBob2xkZXIudmFsdWUgPSB0aGlzO1xyXG4gICAgICAgICAgICBob2xkZXIuc2l6ZSA9IE1hdGgubG9nKGhvbGRlci52YWx1ZSkgLyBNYXRoLmxvZygxZTMpIHwgMDtcclxuICAgICAgICAgICAgaG9sZGVyLm51bSA9IChob2xkZXIudmFsdWUgLyBNYXRoLnBvdygxZTMsIGhvbGRlci5zaXplKSkudG9GaXhlZCgyKTtcclxuICAgICAgICAgICAgaG9sZGVyLnRleHQgPSAoaG9sZGVyLnNpemUgPyAoJ2tNR1RQRVpZJ1stLWhvbGRlci5zaXplXSArICdCJykgOiAnQnl0ZXMnKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAne251bX0ge3RleHR9Jy5zdXBwbGFudChob2xkZXIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoYW5ndWxhciwgd2luZG93LmNyaXAgfHwgKHdpbmRvdy5jcmlwID0ge30pLCBBcnJheSwgU3RyaW5nLCBOdW1iZXIsIE1hdGgpOyIsIihmdW5jdGlvbihuZywgY3JpcCl7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgY3JpcC5jb3JlXHJcbiAgICAgICAgLnJ1bihGaWxlRXh0ZW5zaW9ucyk7XHJcblxyXG4gICAgRmlsZUV4dGVuc2lvbnMuJGluamVjdCA9IFsnJHdpbmRvdyddO1xyXG5cclxuICAgIGZ1bmN0aW9uIEZpbGVFeHRlbnNpb25zKCR3aW5kb3cpIHtcclxuXHJcbiAgICAgICAgbmcuZXh0ZW5kKG5nLCB7XHJcbiAgICAgICAgICAgIGlzRmlsZTogaXNGaWxlLFxyXG4gICAgICAgICAgICBpc0ltYWdlOiBpc0ltYWdlLFxyXG4gICAgICAgICAgICBmaWxlU3VwcG9ydDogISEoJHdpbmRvdy5GaWxlUmVhZGVyICYmICR3aW5kb3cuQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEKVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZXRlcm1pbmVzIGlzIGl0ZW0gYW4gaW5zdGFuY2Ugb2YgRmlsZVxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHsqfSBpdGVtXHJcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gaXNGaWxlKGl0ZW0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5nLmlzT2JqZWN0KGl0ZW0pICYmIGl0ZW0gaW5zdGFuY2VvZiAkd2luZG93LkZpbGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZXRlcm1pbmVzIGlzIGZpbGUgYW4gdHlwZSBvZiBpbWFnZVxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHtGaWxlfSBmaWxlXHJcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gaXNJbWFnZShmaWxlKSB7XHJcbiAgICAgICAgICAgIHZhciB0eXBlID0gJ3wnICsgZmlsZS50eXBlLnNsaWNlKGZpbGUudHlwZS5sYXN0SW5kZXhPZignLycpICsgMSkgKyAnfCc7XHJcbiAgICAgICAgICAgIHJldHVybiAnfGpwZ3xwbmd8anBlZ3xibXB8Z2lmfCcuaW5kZXhPZih0eXBlKSAhPT0gLTE7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KShhbmd1bGFyLCB3aW5kb3cuY3JpcCB8fCAod2luZG93LmNyaXAgPSB7fSkpOyIsIihmdW5jdGlvbiAobmcsIGNyaXApIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmNvcmVcclxuICAgICAgICAuZGlyZWN0aXZlKCdjcmlwRW50ZXInLCBjcmlwRW50ZXIpO1xyXG5cclxuICAgIGNyaXBFbnRlci4kaW5qZWN0ID0gW107XHJcblxyXG4gICAgZnVuY3Rpb24gY3JpcEVudGVyKCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICAgICAgICAgIGxpbms6IGxpbmtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBsaW5rKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybCkge1xyXG4gICAgICAgICAgICBlbGVtZW50LmJpbmQoXCJrZXlkb3duIGtleXByZXNzXCIsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LndoaWNoID09PSAxMykge1xyXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLiRldmFsKGF0dHJzLmNyaXBFbnRlciwgeydldmVudCc6IGV2ZW50fSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gUmVtb3ZlcyBib3VuZCBldmVudHMgaW4gdGhlIGVsZW1lbnQgaXRzZWxmXHJcbiAgICAgICAgICAgIC8vIHdoZW4gdGhlIHNjb3BlIGlzIGRlc3Ryb3llZFxyXG4gICAgICAgICAgICBzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5vZmYoYXR0cnMuY3JpcEVudGVyKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KShhbmd1bGFyLCB3aW5kb3cuY3JpcCB8fCAod2luZG93LmNyaXAgPSB7fSkpO1xyXG4iLCIoZnVuY3Rpb24gKGNyaXApIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmNvcmVcclxuICAgICAgICAuZGlyZWN0aXZlKCdjcmlwRm9jdXMnLCBjcmlwRm9jdXMpO1xyXG5cclxuICAgIGNyaXBGb2N1cy4kaW5qZWN0ID0gWydmb2N1cyddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGNyaXBGb2N1cyhmb2N1cykge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICAgICAgICAgIGxpbms6IGxpbmtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBsaW5rKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybCkge1xyXG4gICAgICAgICAgICBlbGVtZW50Lm9uKGF0dHJzLmNyaXBGb2N1cywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgZm9jdXMoYXR0cnMuY3JpcFNlbGVjdG9yKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvLyBSZW1vdmVzIGJvdW5kIGV2ZW50cyBpbiB0aGUgZWxlbWVudCBpdHNlbGZcclxuICAgICAgICAgICAgLy8gd2hlbiB0aGUgc2NvcGUgaXMgZGVzdHJveWVkXHJcbiAgICAgICAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Lm9mZihhdHRycy5jcmlwRm9jdXMpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKHdpbmRvdy5jcmlwIHx8ICh3aW5kb3cuY3JpcCA9IHt9KSk7IiwiKGZ1bmN0aW9uIChuZywgY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuY29yZVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2NyaXBUaHVtYicsIGNyaXBUaHVtYik7XHJcblxyXG4gICAgZnVuY3Rpb24gY3JpcFRodW1iKCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnPGNhbnZhcy8+JyxcclxuICAgICAgICAgICAgbGluazogbGlua1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGxpbmsoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKXtcclxuICAgICAgICAgICAgaWYoIW5nLmZpbGVTdXBwb3J0KSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICB2YXIgcGFyYW1zID0gc2NvcGUuJGV2YWwoYXR0cnMuY3JpcFRodW1iKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghbmcuaXNGaWxlKHBhcmFtcy5maWxlKSB8fCAhbmcuaXNJbWFnZShwYXJhbXMuZmlsZSkpIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgY2FudmFzID0gZWxlbWVudC5maW5kKCdjYW52YXMnKTtcclxuICAgICAgICAgICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XHJcblxyXG4gICAgICAgICAgICByZWFkZXIub25sb2FkID0gb25Mb2FkRmlsZTtcclxuICAgICAgICAgICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwocGFyYW1zLmZpbGUpO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gb25Mb2FkRmlsZShldmVudCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGltZyA9IG5ldyBJbWFnZSgpO1xyXG4gICAgICAgICAgICAgICAgaW1nLm9ubG9hZCA9IG9uTG9hZEltYWdlO1xyXG4gICAgICAgICAgICAgICAgaW1nLnNyYyA9IGV2ZW50LnRhcmdldC5yZXN1bHQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uTG9hZEltYWdlKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHdpZHRoID0gcGFyYW1zLndpZHRoIHx8IHRoaXMud2lkdGggLyB0aGlzLmhlaWdodCAqIHBhcmFtcy5oZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICB2YXIgaGVpZ2h0ID0gcGFyYW1zLmhlaWdodCB8fCB0aGlzLmhlaWdodCAvIHRoaXMud2lkdGggKiBwYXJhbXMud2lkdGg7XHJcbiAgICAgICAgICAgICAgICBjYW52YXMuYXR0cih7d2lkdGg6IHdpZHRoLCBoZWlnaHQ6IGhlaWdodH0pO1xyXG4gICAgICAgICAgICAgICAgY2FudmFzWzBdLmdldENvbnRleHQoJzJkJykuZHJhd0ltYWdlKHRoaXMsIDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufSkoYW5ndWxhciwgd2luZG93LmNyaXAgfHwgKHdpbmRvdy5jcmlwID0ge30pKTsiLCIoZnVuY3Rpb24gKCQsIGNyaXApIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmNvcmVcclxuICAgICAgICAuZmFjdG9yeSgnZm9jdXMnLCBmb2N1cyk7XHJcblxyXG4gICAgZm9jdXMuJGluamVjdCA9IFsnJHRpbWVvdXQnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBmb2N1cygkdGltZW91dCkge1xyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoc2VsZWN0b3IsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIC8vIHRpbWVvdXQgbWFrZXMgc3VyZSB0aGF0IGl0IGlzIGludm9rZWQgYWZ0ZXIgYW55IG90aGVyIGV2ZW50IGhhcyBiZWVuIHRyaWdnZXJlZC5cclxuICAgICAgICAgICAgLy8gZS5nLiBjbGljayBldmVudHMgdGhhdCBuZWVkIHRvIHJ1biBiZWZvcmUgdGhlIGZvY3VzIG9yXHJcbiAgICAgICAgICAgIC8vIGlucHV0cyBlbGVtZW50cyB0aGF0IGFyZSBpbiBhIGRpc2FibGVkIHN0YXRlIGJ1dCBhcmUgZW5hYmxlZCB3aGVuIHRob3NlIGV2ZW50c1xyXG4gICAgICAgICAgICAvLyBhcmUgdHJpZ2dlcmVkLlxyXG4gICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgJGVsZW1lbnQgPSAkKHNlbGVjdG9yKTtcclxuICAgICAgICAgICAgICAgIGlmICgkZWxlbWVudC5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkZWxlbWVudC5mb2N1cyhjYWxsYmFjayk7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkZWxlbWVudC5mb2N1cygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKGpRdWVyeSwgd2luZG93LmNyaXAgfHwgKHdpbmRvdy5jcmlwID0ge30pKTsiLCIoZnVuY3Rpb24gKGNyaXAsIE1hdGgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmNvcmVcclxuICAgICAgICAuc2VydmljZSgnY3JpcFN0clJhbmRvbScsIGNyaXBTdHJSYW5kb20pO1xyXG5cclxuICAgIGNyaXBTdHJSYW5kb20uJGluamVjdCA9IFtdO1xyXG5cclxuICAgIGZ1bmN0aW9uIGNyaXBTdHJSYW5kb20oKSB7XHJcbiAgICAgICAgdmFyIHBvc3NpYmxlID0gJy1fQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODlfLSc7XHJcblxyXG4gICAgICAgIHRoaXMuY2hhbmdlQ2hhcnMgPSBmdW5jdGlvbiAoY2hhcnMpIHtcclxuICAgICAgICAgICAgcG9zc2libGUgPSBjaGFycztcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLm5ldyA9IGZ1bmN0aW9uIChsZW5ndGgpIHtcclxuICAgICAgICAgICAgbGVuZ3RoIHw9IDE2O1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gJyc7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBwb3NzaWJsZS5jaGFyQXQoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogcG9zc2libGUubGVuZ3RoKSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufSkod2luZG93LmNyaXAgfHwgKHdpbmRvdy5jcmlwID0ge30pLCBNYXRoKTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
