(function (ng, crip) {
    'use strict';

    crip.core = ng.module('crip.core', []);

})(angular, window.crip || (window.crip = {}));
(function (ng, crip, Array, String) {
    'use strict';

    crip.core
        .config(CoreConfig);

    CoreConfig.$inject = [];

    function CoreConfig() {
        Array.prototype.diff = diff;
        Array.prototype.removeItem = removeItem;

        String.prototype.supplant = supplant;

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
    }
})(angular, window.crip || (window.crip = {}), Array, String);
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

        function isFile(item) {
            return ng.isObject(item) && item instanceof $window.File;
        }

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
                element.off(attrs.cFocus);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvcmUubW9kdWxlLmpzIiwiY29uZmlnLmpzIiwiZmlsZS5leHRlbnNpb25zLmpzIiwiZGlyZWN0aXZlcy9jcmlwRW50ZXIuanMiLCJkaXJlY3RpdmVzL2NyaXBGb2N1cy5qcyIsImRpcmVjdGl2ZXMvY3JpcFRodW1iLmpzIiwiZmFjdG9yaWVzL2ZvY3VzLmpzIiwic2VydmljZXMvY3JpcFN0clJhbmRvbS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJjcmlwLWNvcmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gKG5nLCBjcmlwKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgY3JpcC5jb3JlID0gbmcubW9kdWxlKCdjcmlwLmNvcmUnLCBbXSk7XHJcblxyXG59KShhbmd1bGFyLCB3aW5kb3cuY3JpcCB8fCAod2luZG93LmNyaXAgPSB7fSkpOyIsIihmdW5jdGlvbiAobmcsIGNyaXAsIEFycmF5LCBTdHJpbmcpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmNvcmVcclxuICAgICAgICAuY29uZmlnKENvcmVDb25maWcpO1xyXG5cclxuICAgIENvcmVDb25maWcuJGluamVjdCA9IFtdO1xyXG5cclxuICAgIGZ1bmN0aW9uIENvcmVDb25maWcoKSB7XHJcbiAgICAgICAgQXJyYXkucHJvdG90eXBlLmRpZmYgPSBkaWZmO1xyXG4gICAgICAgIEFycmF5LnByb3RvdHlwZS5yZW1vdmVJdGVtID0gcmVtb3ZlSXRlbTtcclxuXHJcbiAgICAgICAgU3RyaW5nLnByb3RvdHlwZS5zdXBwbGFudCA9IHN1cHBsYW50O1xyXG5cclxuICAgICAgICBuZy5leHRlbmQobmcsIHtcclxuICAgICAgICAgICAgaXNFbXB0eTogaXNFbXB0eSxcclxuICAgICAgICAgICAgaGFzVmFsdWU6IGhhc1ZhbHVlLFxyXG4gICAgICAgICAgICBoYXNQcm9wZXJ0eTogaGFzUHJvcGVydHlcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZGlmZihhKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbHRlcihmdW5jdGlvbiAoaSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGEuaW5kZXhPZihpKSA8IDA7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcmVtb3ZlSXRlbSh2YWwsIGtleSkge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gdGhpcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBrZXkgPT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpc1tpXSA9PSB2YWwpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodGhpc1tpXVtrZXldID09IHZhbClcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaXNFbXB0eSh2YWx1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmcuaXNVbmRlZmluZWQodmFsdWUpIHx8IHZhbHVlID09PSAnJyB8fCB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSAhPT0gdmFsdWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBoYXNWYWx1ZSh2YWx1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gIWlzRW1wdHkodmFsdWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaGFzUHJvcGVydHkoKSB7XHJcbiAgICAgICAgICAgIHZhciBhID0gYXJndW1lbnRzO1xyXG5cclxuICAgICAgICAgICAgaWYgKGEubGVuZ3RoID09PSAwIHx8IGlzRW1wdHkoYVswXSkpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICB2YXIgdGFyZ2V0ID0gYVswXTtcclxuICAgICAgICAgICAgZm9yICh2YXIgYXJnIGluIGEpIHtcclxuICAgICAgICAgICAgICAgIGlmIChhcmcgPT09ICcwJylcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIXRhcmdldC5oYXNPd25Qcm9wZXJ0eShhW2FyZ10pKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXRbYVthcmddXTtcclxuICAgICAgICAgICAgICAgIGlmIChuZy5pc1VuZGVmaW5lZCh0YXJnZXQpKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBBIHNpbXBsZSB0ZW1wbGF0aW5nIG1ldGhvZCBmb3IgcmVwbGFjaW5nIHBsYWNlaG9sZGVycyBlbmNsb3NlZCBpbiBjdXJseSBicmFjZXMuXHJcbiAgICAgICAgZnVuY3Rpb24gc3VwcGxhbnQobykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZXBsYWNlKC97KFtee31dKil9L2csXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoYSwgYikge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByID0gb1tiXTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHlwZW9mIHIgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiByID09PSAnbnVtYmVyJyA/IHIgOiBhO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoYW5ndWxhciwgd2luZG93LmNyaXAgfHwgKHdpbmRvdy5jcmlwID0ge30pLCBBcnJheSwgU3RyaW5nKTsiLCIoZnVuY3Rpb24obmcsIGNyaXApe1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuY29yZVxyXG4gICAgICAgIC5ydW4oRmlsZUV4dGVuc2lvbnMpO1xyXG5cclxuICAgIEZpbGVFeHRlbnNpb25zLiRpbmplY3QgPSBbJyR3aW5kb3cnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBGaWxlRXh0ZW5zaW9ucygkd2luZG93KSB7XHJcblxyXG4gICAgICAgIG5nLmV4dGVuZChuZywge1xyXG4gICAgICAgICAgICBpc0ZpbGU6IGlzRmlsZSxcclxuICAgICAgICAgICAgaXNJbWFnZTogaXNJbWFnZSxcclxuICAgICAgICAgICAgZmlsZVN1cHBvcnQ6ICEhKCR3aW5kb3cuRmlsZVJlYWRlciAmJiAkd2luZG93LkNhbnZhc1JlbmRlcmluZ0NvbnRleHQyRClcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaXNGaWxlKGl0ZW0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5nLmlzT2JqZWN0KGl0ZW0pICYmIGl0ZW0gaW5zdGFuY2VvZiAkd2luZG93LkZpbGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBpc0ltYWdlKGZpbGUpIHtcclxuICAgICAgICAgICAgdmFyIHR5cGUgPSAnfCcgKyBmaWxlLnR5cGUuc2xpY2UoZmlsZS50eXBlLmxhc3RJbmRleE9mKCcvJykgKyAxKSArICd8JztcclxuICAgICAgICAgICAgcmV0dXJuICd8anBnfHBuZ3xqcGVnfGJtcHxnaWZ8Jy5pbmRleE9mKHR5cGUpICE9PSAtMTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKGFuZ3VsYXIsIHdpbmRvdy5jcmlwIHx8ICh3aW5kb3cuY3JpcCA9IHt9KSk7IiwiKGZ1bmN0aW9uIChuZywgY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuY29yZVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2NyaXBFbnRlcicsIGNyaXBFbnRlcik7XHJcblxyXG4gICAgY3JpcEVudGVyLiRpbmplY3QgPSBbXTtcclxuXHJcbiAgICBmdW5jdGlvbiBjcmlwRW50ZXIoKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgICAgICAgICAgbGluazogbGlua1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGxpbmsoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJsKSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuYmluZChcImtleWRvd24ga2V5cHJlc3NcIiwgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQud2hpY2ggPT09IDEzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuJGFwcGx5KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuJGV2YWwoYXR0cnMuY3JpcEVudGVyLCB7J2V2ZW50JzogZXZlbnR9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvLyBSZW1vdmVzIGJvdW5kIGV2ZW50cyBpbiB0aGUgZWxlbWVudCBpdHNlbGZcclxuICAgICAgICAgICAgLy8gd2hlbiB0aGUgc2NvcGUgaXMgZGVzdHJveWVkXHJcbiAgICAgICAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Lm9mZihhdHRycy5jRm9jdXMpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKGFuZ3VsYXIsIHdpbmRvdy5jcmlwIHx8ICh3aW5kb3cuY3JpcCA9IHt9KSk7XHJcbiIsIihmdW5jdGlvbiAoY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuY29yZVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2NyaXBGb2N1cycsIGNyaXBGb2N1cyk7XHJcblxyXG4gICAgY3JpcEZvY3VzLiRpbmplY3QgPSBbJ2ZvY3VzJ107XHJcblxyXG4gICAgZnVuY3Rpb24gY3JpcEZvY3VzKGZvY3VzKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgICAgICAgICAgbGluazogbGlua1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGxpbmsoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJsKSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQub24oYXR0cnMuY3JpcEZvY3VzLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBmb2N1cyhhdHRycy5jcmlwU2VsZWN0b3IpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIFJlbW92ZXMgYm91bmQgZXZlbnRzIGluIHRoZSBlbGVtZW50IGl0c2VsZlxyXG4gICAgICAgICAgICAvLyB3aGVuIHRoZSBzY29wZSBpcyBkZXN0cm95ZWRcclxuICAgICAgICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQub2ZmKGF0dHJzLmNyaXBGb2N1cyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkod2luZG93LmNyaXAgfHwgKHdpbmRvdy5jcmlwID0ge30pKTsiLCIoZnVuY3Rpb24gKG5nLCBjcmlwKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgY3JpcC5jb3JlXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgnY3JpcFRodW1iJywgY3JpcFRodW1iKTtcclxuXHJcbiAgICBmdW5jdGlvbiBjcmlwVGh1bWIoKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgICAgICAgICAgdGVtcGxhdGU6ICc8Y2FudmFzLz4nLFxyXG4gICAgICAgICAgICBsaW5rOiBsaW5rXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gbGluayhzY29wZSwgZWxlbWVudCwgYXR0cnMpe1xyXG4gICAgICAgICAgICBpZighbmcuZmlsZVN1cHBvcnQpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIHZhciBwYXJhbXMgPSBzY29wZS4kZXZhbChhdHRycy5jcmlwVGh1bWIpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFuZy5pc0ZpbGUocGFyYW1zLmZpbGUpIHx8ICFuZy5pc0ltYWdlKHBhcmFtcy5maWxlKSkge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciBjYW52YXMgPSBlbGVtZW50LmZpbmQoJ2NhbnZhcycpO1xyXG4gICAgICAgICAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcclxuXHJcbiAgICAgICAgICAgIHJlYWRlci5vbmxvYWQgPSBvbkxvYWRGaWxlO1xyXG4gICAgICAgICAgICByZWFkZXIucmVhZEFzRGF0YVVSTChwYXJhbXMuZmlsZSk7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBvbkxvYWRGaWxlKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaW1nID0gbmV3IEltYWdlKCk7XHJcbiAgICAgICAgICAgICAgICBpbWcub25sb2FkID0gb25Mb2FkSW1hZ2U7XHJcbiAgICAgICAgICAgICAgICBpbWcuc3JjID0gZXZlbnQudGFyZ2V0LnJlc3VsdDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gb25Mb2FkSW1hZ2UoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgd2lkdGggPSBwYXJhbXMud2lkdGggfHwgdGhpcy53aWR0aCAvIHRoaXMuaGVpZ2h0ICogcGFyYW1zLmhlaWdodDtcclxuICAgICAgICAgICAgICAgIHZhciBoZWlnaHQgPSBwYXJhbXMuaGVpZ2h0IHx8IHRoaXMuaGVpZ2h0IC8gdGhpcy53aWR0aCAqIHBhcmFtcy53aWR0aDtcclxuICAgICAgICAgICAgICAgIGNhbnZhcy5hdHRyKHt3aWR0aDogd2lkdGgsIGhlaWdodDogaGVpZ2h0fSk7XHJcbiAgICAgICAgICAgICAgICBjYW52YXNbMF0uZ2V0Q29udGV4dCgnMmQnKS5kcmF3SW1hZ2UodGhpcywgMCwgMCwgd2lkdGgsIGhlaWdodCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59KShhbmd1bGFyLCB3aW5kb3cuY3JpcCB8fCAod2luZG93LmNyaXAgPSB7fSkpOyIsIihmdW5jdGlvbiAoJCwgY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuY29yZVxyXG4gICAgICAgIC5mYWN0b3J5KCdmb2N1cycsIGZvY3VzKTtcclxuXHJcbiAgICBmb2N1cy4kaW5qZWN0ID0gWyckdGltZW91dCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGZvY3VzKCR0aW1lb3V0KSB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChzZWxlY3RvciwgY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgLy8gdGltZW91dCBtYWtlcyBzdXJlIHRoYXQgaXQgaXMgaW52b2tlZCBhZnRlciBhbnkgb3RoZXIgZXZlbnQgaGFzIGJlZW4gdHJpZ2dlcmVkLlxyXG4gICAgICAgICAgICAvLyBlLmcuIGNsaWNrIGV2ZW50cyB0aGF0IG5lZWQgdG8gcnVuIGJlZm9yZSB0aGUgZm9jdXMgb3JcclxuICAgICAgICAgICAgLy8gaW5wdXRzIGVsZW1lbnRzIHRoYXQgYXJlIGluIGEgZGlzYWJsZWQgc3RhdGUgYnV0IGFyZSBlbmFibGVkIHdoZW4gdGhvc2UgZXZlbnRzXHJcbiAgICAgICAgICAgIC8vIGFyZSB0cmlnZ2VyZWQuXHJcbiAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHZhciAkZWxlbWVudCA9ICQoc2VsZWN0b3IpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCRlbGVtZW50Lmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRlbGVtZW50LmZvY3VzKGNhbGxiYWNrKTtcclxuICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRlbGVtZW50LmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoalF1ZXJ5LCB3aW5kb3cuY3JpcCB8fCAod2luZG93LmNyaXAgPSB7fSkpOyIsIihmdW5jdGlvbiAoY3JpcCwgTWF0aCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuY29yZVxyXG4gICAgICAgIC5zZXJ2aWNlKCdjcmlwU3RyUmFuZG9tJywgY3JpcFN0clJhbmRvbSk7XHJcblxyXG4gICAgY3JpcFN0clJhbmRvbS4kaW5qZWN0ID0gW107XHJcblxyXG4gICAgZnVuY3Rpb24gY3JpcFN0clJhbmRvbSgpIHtcclxuICAgICAgICB2YXIgcG9zc2libGUgPSAnLV9BQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OV8tJztcclxuXHJcbiAgICAgICAgdGhpcy5jaGFuZ2VDaGFycyA9IGZ1bmN0aW9uIChjaGFycykge1xyXG4gICAgICAgICAgICBwb3NzaWJsZSA9IGNoYXJzO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMubmV3ID0gZnVuY3Rpb24gKGxlbmd0aCkge1xyXG4gICAgICAgICAgICBsZW5ndGggfD0gMTY7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSAnJztcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IHBvc3NpYmxlLmNoYXJBdChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBwb3NzaWJsZS5sZW5ndGgpKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KSh3aW5kb3cuY3JpcCB8fCAod2luZG93LmNyaXAgPSB7fSksIE1hdGgpOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
