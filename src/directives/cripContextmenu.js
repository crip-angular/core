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
