;(function($) {
    var id = 0,
        rows = -1;
    function addPlayer() {

        $.ajax({
            url: '/getdata/',
            dataType: 'json',
            data: {
                "getPlayers": true
            },
            method: 'post',
            success: function (response) {
                var playerOptions = '';

                response.players.forEach(function(player) {
                    playerOptions = playerOptions + '<option id="P-' + player.name.replace(/\s/g,"-") + '-' + id + '" value="' + player.name + '">' + player.name + '</option>';
                });


                var html = '<tr id="row-' + id + '" class="row-player">' +
                    '<td id="select-player-'+ id +'">' +
                    '<select class="form-control" name="preset[data][players][' + id + '][roomName]">' +
                    playerOptions +
                    '</select>' +
                    '</td>' +
                    '<td>' +
                    '<div class="input-group input-group-volume">' +
                    '<span class="input-group-btn">' +
                    '<button type="button" class="btn btn-default btn-volume" disabled="disabled" data-type="minus" data-field="preset[data][players][' + id + '][volume]">' +
                    '<span class="glyphicon glyphicon-minus"></span>' +
                    '</button>' +
                    '</span>' +
                    '<input id="vol-p-' + id + '" type="text" name="preset[data][players][' + id + '][volume]" class="form-control input-volume" value="0" min="0" max="100">' +
                    '<span class="input-group-btn">' +
                    '<button type="button" class="btn btn-default btn-volume" data-type="plus" data-field="preset[data][players][' + id + '][volume]">' +
                    '<span class="glyphicon glyphicon-plus"></span>' +
                    '</button>' +
                    '</span>' +
                    '</div>' +
                    '</td>'+
                    '<td>' +
                    '<button type="button" class="btn btn-default btn-remove" data-remove="row-' + id + '">' +
                    '<span class="glyphicon glyphicon-remove"></span>' +
                    '</button>' +
                    '</td>' +
                    '</tr>';
                $('#table-player tr:last').after(html);
                id++;
                rows++;
            }
        });


    };
    addPlayer();

    $("#btn-add-room").on('click', function (e) {
        e.preventDefault();

        addPlayer();
    });

    $('body').delegate('.btn-remove', 'click', function (e) {
        e.preventDefault();
        var toRemove = $(this).attr('data-remove'),
            el = document.getElementById(toRemove);

        el.remove();
        rows--;
    });

    $('body').delegate('.btn-volume', 'click', function (e) {
        e.preventDefault();

        fieldName = $(this).attr('data-field');
        type = $(this).attr('data-type');
        var input = $("input[name='" + fieldName + "']");
        var currentVal = parseInt(input.val());
        if (!isNaN(currentVal)) {
            if (type == 'minus') {

                if (currentVal > input.attr('min')) {
                    input.val(currentVal - 5).change();
                }
                if (parseInt(input.val()) == input.attr('min')) {
                    $(this).attr('disabled', true);
                }

            } else if (type == 'plus') {

                if (currentVal < input.attr('max')) {
                    input.val(currentVal + 5).change();
                }
                if (parseInt(input.val()) == input.attr('max')) {
                    $(this).attr('disabled', true);
                }

            }
        } else {
            input.val(0);
        }
    });
    $('body').delegate('.input-volume', 'focusin', function () {
        $(this).data('oldValue', $(this).val());
    });
    $('body').delegate('.input-volume', 'change', function () {

        minValue = parseInt($(this).attr('min'));
        maxValue = parseInt($(this).attr('max'));
        valueCurrent = parseInt($(this).val());

        name = $(this).attr('name');
        if (valueCurrent >= minValue) {
            $(".btn-volume[data-type='minus'][data-field='" + name + "']").removeAttr('disabled')
        } else {
            alert('Sorry, the minimum value was reached');
            $(this).val($(this).data('oldValue'));
        }
        if (valueCurrent <= maxValue) {
            $(".btn-volume[data-type='plus'][data-field='" + name + "']").removeAttr('disabled')
        } else {
            alert('Sorry, the maximum value was reached');
            $(this).val($(this).data('oldValue'));
        }


    });
    $('body').delegate('.input-volume', 'keydown', function (e) {
        // Allow: backspace, delete, tab, escape, enter and .
        if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 190]) !== -1 ||
            // Allow: Ctrl+A
            (e.keyCode == 65 && e.ctrlKey === true) ||
            // Allow: home, end, left, right
            (e.keyCode >= 35 && e.keyCode <= 39)) {
            // let it happen, don't do anything
            return;
        }
        // Ensure that it is a number and stop the keypress
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    });
    $('#select-Preset').on('change', function(e) {
        e.preventDefault();

        var preset = $(this).val(),
            name = preset.slice(0, -5);
        if(preset !== "false"){
            $.ajax({
                url: '/getdata/',
                dataType: 'json',
                data: {
                    "presetFile": preset
                },
                method: 'post',
                success: function(response) {
                    var data = response.data,
                        players = data.players;
                    for(i = 0;i<=rows;i++){
                        $('.row-player').remove();
                    };
                    id = 0;
                    rows = -1;
                    $('#input-preset-name').val(name);
                    for(i = 0;i<players.length;i++){
                        var player = players[i];
                        addPlayer();
                        addSelected(i, player)
                    };
                    if (data.playMode.shuffle === "true") {
                        $('#opt-shu-on').attr('selected','selected');
                    } else {
                        $('#opt-shu-off').attr('selected','selected');
                    }
                    if (data.playMode.repeat === "all") {
                        $('#opt-rep-all').attr('selected','selected');
                    } else {
                        $('#opt-rep-off').attr('selected','selected');
                    }
                    if (data.playMode.crossfade === "true") {
                        $('#opt-cro-on').attr('selected','selected');
                    } else {
                        $('#opt-cro-off').attr('selected','selected');
                    }
                    if(data.favorite){
                        var optId = data.favorite.replace(/\s/g,"-");
                        optId = optId.replace("'", "");
                        optId = optId.replace("/", "");

                        $('#input-uri').val('');
                        $('#opt-fav-'+ optId).attr('selected','selected');
                    } else {
                        $('#opt-fav-none').attr('selected','selected');
                    }
                    if(data.uri){
                        $('#input-uri').val(data.uri);
                    } else {
                        $('#input-uri').val('');
                    }
                    $('#input-del').val(preset);
                    $('#input-del-name').val(name);
                    $('#form-del').show();
                }
            });
        }

    });
    function addSelected(i, player){
        setTimeout(function () {
            $('#P-' + player.roomName.replace(/\s/g,"-") + '-' + i).attr('selected','selected');
            $('#vol-p-' + i).val(player.volume);
        }, 100);
    };
})(jQuery);