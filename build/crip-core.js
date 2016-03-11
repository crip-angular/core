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
            $timeout(function() {
                var $element = $(selector);
                if($element.length === 1)
                    $element.focus(callback);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvcmUubW9kdWxlLmpzIiwiY29uZmlnLmpzIiwiZmlsZS5leHRlbnNpb25zLmpzIiwiZGlyZWN0aXZlcy9jcmlwRW50ZXIuanMiLCJkaXJlY3RpdmVzL2NyaXBGb2N1cy5qcyIsImRpcmVjdGl2ZXMvY3JpcFRodW1iLmpzIiwiZmFjdG9yaWVzL2ZvY3VzLmpzIiwic2VydmljZXMvY3JpcFN0clJhbmRvbS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiY3JpcC1jb3JlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIChuZywgY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuY29yZSA9IG5nLm1vZHVsZSgnY3JpcC5jb3JlJywgW10pO1xyXG5cclxufSkoYW5ndWxhciwgd2luZG93LmNyaXAgfHwgKHdpbmRvdy5jcmlwID0ge30pKTsiLCIoZnVuY3Rpb24gKG5nLCBjcmlwLCBBcnJheSwgU3RyaW5nKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgY3JpcC5jb3JlXHJcbiAgICAgICAgLmNvbmZpZyhDb3JlQ29uZmlnKTtcclxuXHJcbiAgICBDb3JlQ29uZmlnLiRpbmplY3QgPSBbXTtcclxuXHJcbiAgICBmdW5jdGlvbiBDb3JlQ29uZmlnKCkge1xyXG4gICAgICAgIEFycmF5LnByb3RvdHlwZS5kaWZmID0gZGlmZjtcclxuICAgICAgICBBcnJheS5wcm90b3R5cGUucmVtb3ZlSXRlbSA9IHJlbW92ZUl0ZW07XHJcblxyXG4gICAgICAgIFN0cmluZy5wcm90b3R5cGUuc3VwcGxhbnQgPSBzdXBwbGFudDtcclxuXHJcbiAgICAgICAgbmcuZXh0ZW5kKG5nLCB7XHJcbiAgICAgICAgICAgIGlzRW1wdHk6IGlzRW1wdHksXHJcbiAgICAgICAgICAgIGhhc1ZhbHVlOiBoYXNWYWx1ZSxcclxuICAgICAgICAgICAgaGFzUHJvcGVydHk6IGhhc1Byb3BlcnR5XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGRpZmYoYSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5maWx0ZXIoZnVuY3Rpb24gKGkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBhLmluZGV4T2YoaSkgPCAwO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlbW92ZUl0ZW0odmFsLCBrZXkpIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IHRoaXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2Yga2V5ID09PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXNbaV0gPT0gdmFsKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRoaXNbaV1ba2V5XSA9PSB2YWwpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGlzRW1wdHkodmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5nLmlzVW5kZWZpbmVkKHZhbHVlKSB8fCB2YWx1ZSA9PT0gJycgfHwgdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgIT09IHZhbHVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaGFzVmFsdWUodmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuICFpc0VtcHR5KHZhbHVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGhhc1Byb3BlcnR5KCkge1xyXG4gICAgICAgICAgICB2YXIgYSA9IGFyZ3VtZW50cztcclxuXHJcbiAgICAgICAgICAgIGlmIChhLmxlbmd0aCA9PT0gMCB8fCBpc0VtcHR5KGFbMF0pKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgdmFyIHRhcmdldCA9IGFbMF07XHJcbiAgICAgICAgICAgIGZvciAodmFyIGFyZyBpbiBhKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYXJnID09PSAnMCcpXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCF0YXJnZXQuaGFzT3duUHJvcGVydHkoYVthcmddKSlcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0W2FbYXJnXV07XHJcbiAgICAgICAgICAgICAgICBpZiAobmcuaXNVbmRlZmluZWQodGFyZ2V0KSlcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQSBzaW1wbGUgdGVtcGxhdGluZyBtZXRob2QgZm9yIHJlcGxhY2luZyBwbGFjZWhvbGRlcnMgZW5jbG9zZWQgaW4gY3VybHkgYnJhY2VzLlxyXG4gICAgICAgIGZ1bmN0aW9uIHN1cHBsYW50KG8pIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVwbGFjZSgveyhbXnt9XSopfS9nLFxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKGEsIGIpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgciA9IG9bYl07XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiByID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgciA9PT0gJ251bWJlcicgPyByIDogYTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKGFuZ3VsYXIsIHdpbmRvdy5jcmlwIHx8ICh3aW5kb3cuY3JpcCA9IHt9KSwgQXJyYXksIFN0cmluZyk7IiwiKGZ1bmN0aW9uKG5nLCBjcmlwKXtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmNvcmVcclxuICAgICAgICAucnVuKEZpbGVFeHRlbnNpb25zKTtcclxuXHJcbiAgICBGaWxlRXh0ZW5zaW9ucy4kaW5qZWN0ID0gWyckd2luZG93J107XHJcblxyXG4gICAgZnVuY3Rpb24gRmlsZUV4dGVuc2lvbnMoJHdpbmRvdykge1xyXG5cclxuICAgICAgICBuZy5leHRlbmQobmcsIHtcclxuICAgICAgICAgICAgaXNGaWxlOiBpc0ZpbGUsXHJcbiAgICAgICAgICAgIGlzSW1hZ2U6IGlzSW1hZ2UsXHJcbiAgICAgICAgICAgIGZpbGVTdXBwb3J0OiAhISgkd2luZG93LkZpbGVSZWFkZXIgJiYgJHdpbmRvdy5DYW52YXNSZW5kZXJpbmdDb250ZXh0MkQpXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGlzRmlsZShpdGVtKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZy5pc09iamVjdChpdGVtKSAmJiBpdGVtIGluc3RhbmNlb2YgJHdpbmRvdy5GaWxlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaXNJbWFnZShmaWxlKSB7XHJcbiAgICAgICAgICAgIHZhciB0eXBlID0gJ3wnICsgZmlsZS50eXBlLnNsaWNlKGZpbGUudHlwZS5sYXN0SW5kZXhPZignLycpICsgMSkgKyAnfCc7XHJcbiAgICAgICAgICAgIHJldHVybiAnfGpwZ3xwbmd8anBlZ3xibXB8Z2lmfCcuaW5kZXhPZih0eXBlKSAhPT0gLTE7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KShhbmd1bGFyLCB3aW5kb3cuY3JpcCB8fCAod2luZG93LmNyaXAgPSB7fSkpOyIsIihmdW5jdGlvbiAobmcsIGNyaXApIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmNvcmVcclxuICAgICAgICAuZGlyZWN0aXZlKCdjcmlwRW50ZXInLCBjcmlwRW50ZXIpO1xyXG5cclxuICAgIGNyaXBFbnRlci4kaW5qZWN0ID0gW107XHJcblxyXG4gICAgZnVuY3Rpb24gY3JpcEVudGVyKCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICAgICAgICAgIGxpbms6IGxpbmtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBsaW5rKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybCkge1xyXG4gICAgICAgICAgICBlbGVtZW50LmJpbmQoXCJrZXlkb3duIGtleXByZXNzXCIsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LndoaWNoID09PSAxMykge1xyXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLiRldmFsKGF0dHJzLmNyaXBFbnRlciwgeydldmVudCc6IGV2ZW50fSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gUmVtb3ZlcyBib3VuZCBldmVudHMgaW4gdGhlIGVsZW1lbnQgaXRzZWxmXHJcbiAgICAgICAgICAgIC8vIHdoZW4gdGhlIHNjb3BlIGlzIGRlc3Ryb3llZFxyXG4gICAgICAgICAgICBzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5vZmYoYXR0cnMuY0ZvY3VzKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KShhbmd1bGFyLCB3aW5kb3cuY3JpcCB8fCAod2luZG93LmNyaXAgPSB7fSkpO1xyXG4iLCIoZnVuY3Rpb24gKGNyaXApIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmNvcmVcclxuICAgICAgICAuZGlyZWN0aXZlKCdjcmlwRm9jdXMnLCBjcmlwRm9jdXMpO1xyXG5cclxuICAgIGNyaXBGb2N1cy4kaW5qZWN0ID0gWydmb2N1cyddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGNyaXBGb2N1cyhmb2N1cykge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICAgICAgICAgIGxpbms6IGxpbmtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBsaW5rKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybCkge1xyXG4gICAgICAgICAgICBlbGVtZW50Lm9uKGF0dHJzLmNyaXBGb2N1cywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgZm9jdXMoYXR0cnMuY3JpcFNlbGVjdG9yKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvLyBSZW1vdmVzIGJvdW5kIGV2ZW50cyBpbiB0aGUgZWxlbWVudCBpdHNlbGZcclxuICAgICAgICAgICAgLy8gd2hlbiB0aGUgc2NvcGUgaXMgZGVzdHJveWVkXHJcbiAgICAgICAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Lm9mZihhdHRycy5jcmlwRm9jdXMpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKHdpbmRvdy5jcmlwIHx8ICh3aW5kb3cuY3JpcCA9IHt9KSk7IiwiKGZ1bmN0aW9uIChuZywgY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuY29yZVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2NyaXBUaHVtYicsIGNyaXBUaHVtYik7XHJcblxyXG4gICAgZnVuY3Rpb24gY3JpcFRodW1iKCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnPGNhbnZhcy8+JyxcclxuICAgICAgICAgICAgbGluazogbGlua1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGxpbmsoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKXtcclxuICAgICAgICAgICAgaWYoIW5nLmZpbGVTdXBwb3J0KSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICB2YXIgcGFyYW1zID0gc2NvcGUuJGV2YWwoYXR0cnMuY3JpcFRodW1iKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghbmcuaXNGaWxlKHBhcmFtcy5maWxlKSB8fCAhbmcuaXNJbWFnZShwYXJhbXMuZmlsZSkpIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgY2FudmFzID0gZWxlbWVudC5maW5kKCdjYW52YXMnKTtcclxuICAgICAgICAgICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XHJcblxyXG4gICAgICAgICAgICByZWFkZXIub25sb2FkID0gb25Mb2FkRmlsZTtcclxuICAgICAgICAgICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwocGFyYW1zLmZpbGUpO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gb25Mb2FkRmlsZShldmVudCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGltZyA9IG5ldyBJbWFnZSgpO1xyXG4gICAgICAgICAgICAgICAgaW1nLm9ubG9hZCA9IG9uTG9hZEltYWdlO1xyXG4gICAgICAgICAgICAgICAgaW1nLnNyYyA9IGV2ZW50LnRhcmdldC5yZXN1bHQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uTG9hZEltYWdlKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHdpZHRoID0gcGFyYW1zLndpZHRoIHx8IHRoaXMud2lkdGggLyB0aGlzLmhlaWdodCAqIHBhcmFtcy5oZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICB2YXIgaGVpZ2h0ID0gcGFyYW1zLmhlaWdodCB8fCB0aGlzLmhlaWdodCAvIHRoaXMud2lkdGggKiBwYXJhbXMud2lkdGg7XHJcbiAgICAgICAgICAgICAgICBjYW52YXMuYXR0cih7d2lkdGg6IHdpZHRoLCBoZWlnaHQ6IGhlaWdodH0pO1xyXG4gICAgICAgICAgICAgICAgY2FudmFzWzBdLmdldENvbnRleHQoJzJkJykuZHJhd0ltYWdlKHRoaXMsIDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufSkoYW5ndWxhciwgd2luZG93LmNyaXAgfHwgKHdpbmRvdy5jcmlwID0ge30pKTsiLCIoZnVuY3Rpb24gKCQsIGNyaXApIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmNvcmVcclxuICAgICAgICAuZmFjdG9yeSgnZm9jdXMnLCBmb2N1cyk7XHJcblxyXG4gICAgZm9jdXMuJGluamVjdCA9IFsnJHRpbWVvdXQnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBmb2N1cygkdGltZW91dCkge1xyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoc2VsZWN0b3IsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIC8vIHRpbWVvdXQgbWFrZXMgc3VyZSB0aGF0IGl0IGlzIGludm9rZWQgYWZ0ZXIgYW55IG90aGVyIGV2ZW50IGhhcyBiZWVuIHRyaWdnZXJlZC5cclxuICAgICAgICAgICAgLy8gZS5nLiBjbGljayBldmVudHMgdGhhdCBuZWVkIHRvIHJ1biBiZWZvcmUgdGhlIGZvY3VzIG9yXHJcbiAgICAgICAgICAgIC8vIGlucHV0cyBlbGVtZW50cyB0aGF0IGFyZSBpbiBhIGRpc2FibGVkIHN0YXRlIGJ1dCBhcmUgZW5hYmxlZCB3aGVuIHRob3NlIGV2ZW50c1xyXG4gICAgICAgICAgICAvLyBhcmUgdHJpZ2dlcmVkLlxyXG4gICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHZhciAkZWxlbWVudCA9ICQoc2VsZWN0b3IpO1xyXG4gICAgICAgICAgICAgICAgaWYoJGVsZW1lbnQubGVuZ3RoID09PSAxKVxyXG4gICAgICAgICAgICAgICAgICAgICRlbGVtZW50LmZvY3VzKGNhbGxiYWNrKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KShqUXVlcnksIHdpbmRvdy5jcmlwIHx8ICh3aW5kb3cuY3JpcCA9IHt9KSk7IiwiKGZ1bmN0aW9uIChjcmlwLCBNYXRoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgY3JpcC5jb3JlXHJcbiAgICAgICAgLnNlcnZpY2UoJ2NyaXBTdHJSYW5kb20nLCBjcmlwU3RyUmFuZG9tKTtcclxuXHJcbiAgICBjcmlwU3RyUmFuZG9tLiRpbmplY3QgPSBbXTtcclxuXHJcbiAgICBmdW5jdGlvbiBjcmlwU3RyUmFuZG9tKCkge1xyXG4gICAgICAgIHZhciBwb3NzaWJsZSA9ICctX0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Xy0nO1xyXG5cclxuICAgICAgICB0aGlzLmNoYW5nZUNoYXJzID0gZnVuY3Rpb24gKGNoYXJzKSB7XHJcbiAgICAgICAgICAgIHBvc3NpYmxlID0gY2hhcnM7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5uZXcgPSBmdW5jdGlvbiAobGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGxlbmd0aCB8PSAxNjtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9ICcnO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gcG9zc2libGUuY2hhckF0KE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHBvc3NpYmxlLmxlbmd0aCkpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn0pKHdpbmRvdy5jcmlwIHx8ICh3aW5kb3cuY3JpcCA9IHt9KSwgTWF0aCk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
