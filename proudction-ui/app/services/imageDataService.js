/**
 * Created by michaelishmael on 02/02/2016.
 */

app.factory('imageDataService', [ '$rootScope' , '$timeout', function($rootScope, $timeout){

    var self = {};
    self.wizardIndex = 0;

    self.cropManager = new ImageDataManager(seedData_1);

    self.selectBacklogItem = function(item){
        //item
        self.wizardIndex++;
        $timeout(function(){
            $rootScope.testProp23 = 'testy';
            $rootScope.$broadcast('wizard:indexChanged', self.wizardIndex);
        }, 100);

    };

    return self;
}]);


var seedData_1 = {
    backlog: [
        {id: 1, path:"donkey1.jpg"},
        {id: 2, path:"cow3.jpg"},
        {id: 3, path:"chicken1.jpg"},
        {id: 4, path:"horse1.jpg"},
        {id: 5, path:"cow2.jpg"}
    ],
    sets: [
        {
            name: 'domestic',
            decks: [
                'sheep', 'goat', 'chicken',
                'owl', 'cow', 'cat',
                'horse', 'pig', 'donkey',
                'rabbit', 'dog', 'duck'
            ]
        }
    ],
    imageDataItems: [
        {
            id: 1,
            original: 'crit1.png',
            name: 'Cow',
            twelve16: {
                master:{
                    orientation: "landscape",
                    crop: [0, 0, 1, 1]
                },
                alt: {
                    orientation: "portrait",
                    crop: [0, 0, 1, 1]
                }
            },
            nine16: {
                master:{
                    orientation: "landscape",
                    crop: [0, 0, 1, 1]
                },
                alt: {
                    orientation: "portrait",
                    crop: [0, 0, 1, 1]
                }
            }

        }
    ]
};