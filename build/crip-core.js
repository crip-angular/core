(function (ng, crip) {
    'use strict';

    crip.core = ng.module('crip.core', []);

})(angular, window.crip || (window.crip = {}));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvcmUubW9kdWxlLmpzIiwiY29uZmlnLmpzIiwiZmlsZS5leHRlbnNpb25zLmpzIiwiZGlyZWN0aXZlcy9jcmlwRW50ZXIuanMiLCJkaXJlY3RpdmVzL2NyaXBGb2N1cy5qcyIsImRpcmVjdGl2ZXMvY3JpcFRodW1iLmpzIiwiZmFjdG9yaWVzL2ZvY3VzLmpzIiwic2VydmljZXMvY3JpcFN0clJhbmRvbS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImNyaXAtY29yZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiAobmcsIGNyaXApIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmNvcmUgPSBuZy5tb2R1bGUoJ2NyaXAuY29yZScsIFtdKTtcclxuXHJcbn0pKGFuZ3VsYXIsIHdpbmRvdy5jcmlwIHx8ICh3aW5kb3cuY3JpcCA9IHt9KSk7IiwiKGZ1bmN0aW9uIChuZywgY3JpcCwgQXJyYXksIFN0cmluZywgTnVtYmVyLCBNYXRoLCBSZWdFeHApIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmNvcmVcclxuICAgICAgICAuY29uZmlnKENvcmVDb25maWcpO1xyXG5cclxuICAgIENvcmVDb25maWcuJGluamVjdCA9IFtdO1xyXG5cclxuICAgIGZ1bmN0aW9uIENvcmVDb25maWcoKSB7XHJcbiAgICAgICAgQXJyYXkucHJvdG90eXBlLmRpZmYgPSBkaWZmO1xyXG4gICAgICAgIEFycmF5LnByb3RvdHlwZS5yZW1vdmVJdGVtID0gcmVtb3ZlSXRlbTtcclxuXHJcbiAgICAgICAgU3RyaW5nLnByb3RvdHlwZS5zdXBwbGFudCA9IHN1cHBsYW50O1xyXG4gICAgICAgIFN0cmluZy5wcm90b3R5cGUucmVwbGFjZUFsbCA9IHN0cmluZ1JlcGxhY2VBbGw7XHJcbiAgICAgICAgTnVtYmVyLnByb3RvdHlwZS50b0J5dGVzID0gdG9CeXRlcztcclxuXHJcbiAgICAgICAgbmcuZXh0ZW5kKG5nLCB7XHJcbiAgICAgICAgICAgIGlzRW1wdHk6IGlzRW1wdHksXHJcbiAgICAgICAgICAgIGhhc1ZhbHVlOiBoYXNWYWx1ZSxcclxuICAgICAgICAgICAgaGFzUHJvcGVydHk6IGhhc1Byb3BlcnR5XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEdldCBkaWZmZXJlbnQgZWxlbWVudHMgZnJvbSBBcnJheVxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHtBcnJheX0gYVxyXG4gICAgICAgICAqIEByZXR1cm5zIHtBcnJheX1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBkaWZmKGEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmlsdGVyKGZ1bmN0aW9uIChpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYS5pbmRleE9mKGkpIDwgMDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZW1vdmUgaXRlbSBmcm9tIEFycmF5XHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0geyp9IHZhbFxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiByZW1vdmVJdGVtKHZhbCwga2V5KSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2Yga2V5ID09PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNwbGljZSgodGhpcy5pbmRleE9mKHZhbCkgfHwgdGhpcy5sZW5ndGgpLCAxKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IHRoaXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzW2ldW2tleV0gPT0gdmFsKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZXRlcm1pbmVzIGlzIHZhbHVlIGVtcHR5XHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0gdmFsdWVcclxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBpc0VtcHR5KHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZy5pc1VuZGVmaW5lZCh2YWx1ZSkgfHwgdmFsdWUgPT09ICcnIHx8IHZhbHVlID09PSBudWxsIHx8IHZhbHVlICE9PSB2YWx1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERldGVybWluZXMgaXMgdmFsdWUgaW4gb2JqZWN0XHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0gdmFsdWVcclxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBoYXNWYWx1ZSh2YWx1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gIWlzRW1wdHkodmFsdWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGV0ZXJtaW5lcyBpcyBvYmplY3QgY29udGFpbmluZyBwcm9wZXJ0aWVzIGNoYWluXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gb2JqZWN0XHJcbiAgICAgICAgICogQHBhcmFtIHsuLi5zdHJpbmd9IHByb3BlcnRpZXNcclxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBoYXNQcm9wZXJ0eShvYmplY3QsIHByb3BlcnRpZXMpIHtcclxuICAgICAgICAgICAgdmFyIGEgPSBhcmd1bWVudHM7XHJcblxyXG4gICAgICAgICAgICBpZiAoYS5sZW5ndGggPT09IDAgfHwgaXNFbXB0eShhWzBdKSlcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIHZhciB0YXJnZXQgPSBhWzBdO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBhcmcgaW4gYSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGFyZyA9PT0gJzAnKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghdGFyZ2V0Lmhhc093blByb3BlcnR5KGFbYXJnXSkpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgICAgIHRhcmdldCA9IHRhcmdldFthW2FyZ11dO1xyXG4gICAgICAgICAgICAgICAgaWYgKG5nLmlzVW5kZWZpbmVkKHRhcmdldCkpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEEgc2ltcGxlIHRlbXBsYXRpbmcgbWV0aG9kIGZvciByZXBsYWNpbmcgcGxhY2Vob2xkZXJzIGVuY2xvc2VkIGluIGN1cmx5IGJyYWNlcy5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvXHJcbiAgICAgICAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBzdXBwbGFudChvKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJlcGxhY2UoL3soW157fV0qKX0vZyxcclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChhLCBiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHIgPSBvW2JdO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0eXBlb2YgciA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHIgPT09ICdudW1iZXInID8gciA6IGE7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDb252ZXJ0IE51bWJlciB0byB1c2VyIGZyaWVuZGx5IGJ5dGUgc3RyaW5nXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0gW2hvbGRlcl1cclxuICAgICAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIHRvQnl0ZXMoaG9sZGVyKSB7XHJcbiAgICAgICAgICAgIGhvbGRlciA9IGhvbGRlciB8fCAoaG9sZGVyID0ge30pO1xyXG4gICAgICAgICAgICBob2xkZXIudmFsdWUgPSB0aGlzO1xyXG4gICAgICAgICAgICBob2xkZXIuc2l6ZSA9IE1hdGgubG9nKGhvbGRlci52YWx1ZSkgLyBNYXRoLmxvZygxZTMpIHwgMDtcclxuICAgICAgICAgICAgaG9sZGVyLm51bSA9IChob2xkZXIudmFsdWUgLyBNYXRoLnBvdygxZTMsIGhvbGRlci5zaXplKSkudG9GaXhlZCgyKTtcclxuICAgICAgICAgICAgaG9sZGVyLnRleHQgPSAoaG9sZGVyLnNpemUgPyAoJ2tNR1RQRVpZJ1stLWhvbGRlci5zaXplXSArICdCJykgOiAnQnl0ZXMnKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAne251bX0ge3RleHR9Jy5zdXBwbGFudChob2xkZXIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVwbGFjZSBhbGwgb2NjdXJyZW5jZXMgaW4gc3RyaW5nXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gc2VhcmNoVmFsdWUgVXNlZCBpbiBSZWdFeHBcclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ3xmdW5jdGlvbn0gcmVwbGFjZVZhbHVlXHJcbiAgICAgICAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBzdHJpbmdSZXBsYWNlQWxsKHNlYXJjaFZhbHVlLCByZXBsYWNlVmFsdWUpIHtcclxuICAgICAgICAgICAgdmFyIHRhcmdldCA9IHRoaXM7XHJcbiAgICAgICAgICAgIHJldHVybiB0YXJnZXQucmVwbGFjZShuZXcgUmVnRXhwKHNlYXJjaFZhbHVlLCAnZycpLCByZXBsYWNlVmFsdWUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoYW5ndWxhciwgd2luZG93LmNyaXAgfHwgKHdpbmRvdy5jcmlwID0ge30pLCBBcnJheSwgU3RyaW5nLCBOdW1iZXIsIE1hdGgsIFJlZ0V4cCk7IiwiKGZ1bmN0aW9uKG5nLCBjcmlwKXtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmNvcmVcclxuICAgICAgICAucnVuKEZpbGVFeHRlbnNpb25zKTtcclxuXHJcbiAgICBGaWxlRXh0ZW5zaW9ucy4kaW5qZWN0ID0gWyckd2luZG93J107XHJcblxyXG4gICAgZnVuY3Rpb24gRmlsZUV4dGVuc2lvbnMoJHdpbmRvdykge1xyXG5cclxuICAgICAgICBuZy5leHRlbmQobmcsIHtcclxuICAgICAgICAgICAgaXNGaWxlOiBpc0ZpbGUsXHJcbiAgICAgICAgICAgIGlzSW1hZ2U6IGlzSW1hZ2UsXHJcbiAgICAgICAgICAgIGZpbGVTdXBwb3J0OiAhISgkd2luZG93LkZpbGVSZWFkZXIgJiYgJHdpbmRvdy5DYW52YXNSZW5kZXJpbmdDb250ZXh0MkQpXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERldGVybWluZXMgaXMgaXRlbSBhbiBpbnN0YW5jZSBvZiBGaWxlXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0geyp9IGl0ZW1cclxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBpc0ZpbGUoaXRlbSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmcuaXNPYmplY3QoaXRlbSkgJiYgaXRlbSBpbnN0YW5jZW9mICR3aW5kb3cuRmlsZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERldGVybWluZXMgaXMgZmlsZSBhbiB0eXBlIG9mIGltYWdlXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0ge0ZpbGV9IGZpbGVcclxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBpc0ltYWdlKGZpbGUpIHtcclxuICAgICAgICAgICAgdmFyIHR5cGUgPSAnfCcgKyBmaWxlLnR5cGUuc2xpY2UoZmlsZS50eXBlLmxhc3RJbmRleE9mKCcvJykgKyAxKSArICd8JztcclxuICAgICAgICAgICAgcmV0dXJuICd8anBnfHBuZ3xqcGVnfGJtcHxnaWZ8Jy5pbmRleE9mKHR5cGUpICE9PSAtMTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKGFuZ3VsYXIsIHdpbmRvdy5jcmlwIHx8ICh3aW5kb3cuY3JpcCA9IHt9KSk7IiwiKGZ1bmN0aW9uIChuZywgY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuY29yZVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2NyaXBFbnRlcicsIGNyaXBFbnRlcik7XHJcblxyXG4gICAgY3JpcEVudGVyLiRpbmplY3QgPSBbXTtcclxuXHJcbiAgICBmdW5jdGlvbiBjcmlwRW50ZXIoKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgICAgICAgICAgbGluazogbGlua1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGxpbmsoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJsKSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuYmluZChcImtleWRvd24ga2V5cHJlc3NcIiwgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQud2hpY2ggPT09IDEzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuJGFwcGx5KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuJGV2YWwoYXR0cnMuY3JpcEVudGVyLCB7J2V2ZW50JzogZXZlbnR9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvLyBSZW1vdmVzIGJvdW5kIGV2ZW50cyBpbiB0aGUgZWxlbWVudCBpdHNlbGZcclxuICAgICAgICAgICAgLy8gd2hlbiB0aGUgc2NvcGUgaXMgZGVzdHJveWVkXHJcbiAgICAgICAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Lm9mZihhdHRycy5jcmlwRW50ZXIpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKGFuZ3VsYXIsIHdpbmRvdy5jcmlwIHx8ICh3aW5kb3cuY3JpcCA9IHt9KSk7XHJcbiIsIihmdW5jdGlvbiAoY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuY29yZVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2NyaXBGb2N1cycsIGNyaXBGb2N1cyk7XHJcblxyXG4gICAgY3JpcEZvY3VzLiRpbmplY3QgPSBbJ2ZvY3VzJ107XHJcblxyXG4gICAgZnVuY3Rpb24gY3JpcEZvY3VzKGZvY3VzKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgICAgICAgICAgbGluazogbGlua1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGxpbmsoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJsKSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQub24oYXR0cnMuY3JpcEZvY3VzLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBmb2N1cyhhdHRycy5jcmlwU2VsZWN0b3IpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIFJlbW92ZXMgYm91bmQgZXZlbnRzIGluIHRoZSBlbGVtZW50IGl0c2VsZlxyXG4gICAgICAgICAgICAvLyB3aGVuIHRoZSBzY29wZSBpcyBkZXN0cm95ZWRcclxuICAgICAgICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQub2ZmKGF0dHJzLmNyaXBGb2N1cyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkod2luZG93LmNyaXAgfHwgKHdpbmRvdy5jcmlwID0ge30pKTsiLCIoZnVuY3Rpb24gKG5nLCBjcmlwKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgY3JpcC5jb3JlXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgnY3JpcFRodW1iJywgY3JpcFRodW1iKTtcclxuXHJcbiAgICBmdW5jdGlvbiBjcmlwVGh1bWIoKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgICAgICAgICAgdGVtcGxhdGU6ICc8Y2FudmFzLz4nLFxyXG4gICAgICAgICAgICBsaW5rOiBsaW5rXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gbGluayhzY29wZSwgZWxlbWVudCwgYXR0cnMpe1xyXG4gICAgICAgICAgICBpZighbmcuZmlsZVN1cHBvcnQpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIHZhciBwYXJhbXMgPSBzY29wZS4kZXZhbChhdHRycy5jcmlwVGh1bWIpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFuZy5pc0ZpbGUocGFyYW1zLmZpbGUpIHx8ICFuZy5pc0ltYWdlKHBhcmFtcy5maWxlKSkge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciBjYW52YXMgPSBlbGVtZW50LmZpbmQoJ2NhbnZhcycpO1xyXG4gICAgICAgICAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcclxuXHJcbiAgICAgICAgICAgIHJlYWRlci5vbmxvYWQgPSBvbkxvYWRGaWxlO1xyXG4gICAgICAgICAgICByZWFkZXIucmVhZEFzRGF0YVVSTChwYXJhbXMuZmlsZSk7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBvbkxvYWRGaWxlKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaW1nID0gbmV3IEltYWdlKCk7XHJcbiAgICAgICAgICAgICAgICBpbWcub25sb2FkID0gb25Mb2FkSW1hZ2U7XHJcbiAgICAgICAgICAgICAgICBpbWcuc3JjID0gZXZlbnQudGFyZ2V0LnJlc3VsdDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gb25Mb2FkSW1hZ2UoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgd2lkdGggPSBwYXJhbXMud2lkdGggfHwgdGhpcy53aWR0aCAvIHRoaXMuaGVpZ2h0ICogcGFyYW1zLmhlaWdodDtcclxuICAgICAgICAgICAgICAgIHZhciBoZWlnaHQgPSBwYXJhbXMuaGVpZ2h0IHx8IHRoaXMuaGVpZ2h0IC8gdGhpcy53aWR0aCAqIHBhcmFtcy53aWR0aDtcclxuICAgICAgICAgICAgICAgIGNhbnZhcy5hdHRyKHt3aWR0aDogd2lkdGgsIGhlaWdodDogaGVpZ2h0fSk7XHJcbiAgICAgICAgICAgICAgICBjYW52YXNbMF0uZ2V0Q29udGV4dCgnMmQnKS5kcmF3SW1hZ2UodGhpcywgMCwgMCwgd2lkdGgsIGhlaWdodCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59KShhbmd1bGFyLCB3aW5kb3cuY3JpcCB8fCAod2luZG93LmNyaXAgPSB7fSkpOyIsIihmdW5jdGlvbiAoJCwgY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuY29yZVxyXG4gICAgICAgIC5mYWN0b3J5KCdmb2N1cycsIGZvY3VzKTtcclxuXHJcbiAgICBmb2N1cy4kaW5qZWN0ID0gWyckdGltZW91dCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGZvY3VzKCR0aW1lb3V0KSB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChzZWxlY3RvciwgY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgLy8gdGltZW91dCBtYWtlcyBzdXJlIHRoYXQgaXQgaXMgaW52b2tlZCBhZnRlciBhbnkgb3RoZXIgZXZlbnQgaGFzIGJlZW4gdHJpZ2dlcmVkLlxyXG4gICAgICAgICAgICAvLyBlLmcuIGNsaWNrIGV2ZW50cyB0aGF0IG5lZWQgdG8gcnVuIGJlZm9yZSB0aGUgZm9jdXMgb3JcclxuICAgICAgICAgICAgLy8gaW5wdXRzIGVsZW1lbnRzIHRoYXQgYXJlIGluIGEgZGlzYWJsZWQgc3RhdGUgYnV0IGFyZSBlbmFibGVkIHdoZW4gdGhvc2UgZXZlbnRzXHJcbiAgICAgICAgICAgIC8vIGFyZSB0cmlnZ2VyZWQuXHJcbiAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHZhciAkZWxlbWVudCA9ICQoc2VsZWN0b3IpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCRlbGVtZW50Lmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRlbGVtZW50LmZvY3VzKGNhbGxiYWNrKTtcclxuICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRlbGVtZW50LmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoalF1ZXJ5LCB3aW5kb3cuY3JpcCB8fCAod2luZG93LmNyaXAgPSB7fSkpOyIsIihmdW5jdGlvbiAoY3JpcCwgTWF0aCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuY29yZVxyXG4gICAgICAgIC5zZXJ2aWNlKCdjcmlwU3RyUmFuZG9tJywgY3JpcFN0clJhbmRvbSk7XHJcblxyXG4gICAgY3JpcFN0clJhbmRvbS4kaW5qZWN0ID0gW107XHJcblxyXG4gICAgZnVuY3Rpb24gY3JpcFN0clJhbmRvbSgpIHtcclxuICAgICAgICB2YXIgcG9zc2libGUgPSAnLV9BQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OV8tJztcclxuXHJcbiAgICAgICAgdGhpcy5jaGFuZ2VDaGFycyA9IGZ1bmN0aW9uIChjaGFycykge1xyXG4gICAgICAgICAgICBwb3NzaWJsZSA9IGNoYXJzO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMubmV3ID0gZnVuY3Rpb24gKGxlbmd0aCkge1xyXG4gICAgICAgICAgICBsZW5ndGggfD0gMTY7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSAnJztcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IHBvc3NpYmxlLmNoYXJBdChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBwb3NzaWJsZS5sZW5ndGgpKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KSh3aW5kb3cuY3JpcCB8fCAod2luZG93LmNyaXAgPSB7fSksIE1hdGgpOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
