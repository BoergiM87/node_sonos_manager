;(function($) {
    var volumeSlider = document.getElementById('volumeSlider');
    if ( volumeSlider !== null ) {
        noUiSlider.create(volumeSlider, {
            start: [ 10 ],
            step: 1,
            range: {
                'min': [  5 ],
                'max': [ 100 ]
            }
        });
        var volumeSliderValueElement = document.getElementById('volumeValue'),
            inputvolume = document.getElementById('input-volume');
        volumeSlider.noUiSlider.on('update', function( values, handle ) {
            volumeSliderValueElement.innerHTML = Math.floor(values[handle]);
            $('#input-volume').val(Math.floor(values[handle]));
        });
    }

    var volumeSliderEnter = document.getElementById('volumeSliderEnter');
    if ( volumeSliderEnter !== null ) {
        noUiSlider.create(volumeSliderEnter, {
            start: [ 100 ],
            step: 1,
            range: {
                'min': [  0 ],
                'max': [ 100 ]
            }
        });
        var volumeSliderValueElement = document.getElementById('volumeValue');
        volumeSliderEnter.noUiSlider.on('update', function( values, handle ) {
            volumeSliderValueElement.innerHTML = Math.floor(values[handle]);
        });
    }

})(jQuery);