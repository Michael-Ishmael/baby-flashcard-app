/**
 * Created by michaeli on 28/01/2016.
 */

app.controller('imgProcController', ['$scope', function ($scope) {

    $scope.backlog = data.backlog;




    }]
);



var data = {
    backlog: [
        {id: 1, path:"donkey1.jpg"},
        {id: 2, path:"crit1.png"},
        {id: 3, path:"crit2.png"}

    ],
    imageItems: [
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
}
