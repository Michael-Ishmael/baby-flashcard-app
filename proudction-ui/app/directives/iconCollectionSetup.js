/**
 * Created by scorpio on 14/02/2016.
 */
app.directive('iconCollectionSetup', ['$parse', function ($parse) {
    return {
        restrict: 'E',
        scope: true,
        templateUrl: 'views/iconCollectionSetup.html',
        controller: 'iconCollectionSetupController',
        link: function (scope, element, attrs, ctrlr) {
            scope.collectionParams = scope.paramholder[attrs.prop]; // $parse(attrs.collectionParams)(scope);
            ctrlr.init();
        }
    };
}]);