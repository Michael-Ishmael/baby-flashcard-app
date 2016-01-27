/**
 * Created by scorpio on 26/01/2016.
 */


$('document').ready(

    function(){

        $('#testDiv').css('background-color', 'red');

        $('#action').click(function(){
            var img = $('#cropbox');
            var orig = new Image();
            orig.src = img.attr('src');

            console.log(orig.width);
            console.log(img.width())
            console.log(orig.width / img.width())
        });

    }

);