


//All arguments are optional:

//duration of the tone in milliseconds. Default is 500
//frequency of the tone in hertz. default is 440
//volume of the tone. Default is 1, off is 0.
//type of tone. Possible values are sine, square, sawtooth, triangle, and custom. Default is sine.
//callback to use on end of tone
function beep(duration, frequency, volume, type, callback) {
    // if (beat_counter % 4 == 0) {
    //     frequency = 600
    // }
    // console.log("beep")
    // // duration = 50;
    // type = "sine";
    var oscillator = audioCtx.createOscillator();
    var gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (volume) { gainNode.gain.value = volume; };
    if (frequency) { oscillator.frequency.value = frequency; }
    if (type) { oscillator.type = type; }
    if (callback) { oscillator.onended = callback; }

    oscillator.start();
    setTimeout(function () { oscillator.stop() }, (duration ? duration : 500));

};


function flash(beat_n) {
    $("#box" + beat_n).toggleClass('first_beat');
    // if (beat_n == 0) {
    //     console.log(beat_n)
    // } else {
    //     $("#current_chord_symbol").toggleClass('other_beat');
    //     console.log(beat_n)
    // }
}

function metronome(chords_list) {

    chords_list = chords_list || 0;

    var beatof4 = (beat_counter % 4) + 1;
    var frequency = 400;
    if (beatof4 == 1) {
        frequency = 600;
        if (!($('#toggle-random').prop('checked'))) {
            console.log("before", chords_list)
            chords_list = changeChord_predef(chords_list);
            console.log("after", chords_list)
        } else {
            changeChord();
        }
    }
    flash(beatof4)
    beep(200, frequency);
    beat_counter += 1;
}

function getBPM() {
    bpm = parseInt($("#bpm_input").val(), 10);
    console.log(typeof (bpm))
    if (isNaN(bpm)) {
        console.log("not a number");
        bpm = 50
        $("#bpm_input").val(50)
    }
    return (bpm)
}

function pick_from_list(li) {
    var n_el = li.length;
    var randi = Math.floor((Math.random() * n_el));
    var chosen = li[randi];
    return (chosen);
}

function make_chord(listoflists) {
    var chord_str = "";
    for (el in listoflists) {
        var li = listoflists[el]
        chord_str = chord_str.concat(pick_from_list(li));
    }
    console.log("make_chord")
    console.log(chord_str)

    return (chord_str);
}

function changeChord_predef(chords_list) {
    var interval = [" T", " Q"]
    $('#current_interval').html($('#next_interval').html());
    $('#next_interval').html(pick_from_list(interval));

    var next_chord = chords_list.shift() //removes first element
    chords_list.push(next_chord) // adds it back to the end

    $('#current_chord_symbol').html($('#next_chord_symbol').html());
    $('#next_chord_symbol').html(next_chord);

    random_arrow();
    return (chords_list)
}

function random_arrow() {
    $('#current_arrow').removeClass();
    var className = $('#next_arrow').attr('class');
    $('#current_arrow').addClass(className)

    $('#next_arrow').removeClass();
    if (Math.random() < 0.5) {
        $('#next_arrow').addClass("fa fa-arrow-up");
    } else {
        $('#next_arrow').addClass("fa fa-arrow-down");
    }
}

function changeChord() {
    // var noteDecorators = [" ", "b", "#"]
    // var noteNames = ["e", "f#", "g", "g#", "a", "a#", "b", "c", "c#", "d", "d#", "e"]
    var noteNames = ["e", "f", "g", "a", "b", "c", "d"]
    var accidentals = ["<sup>#</sup>", "<sup>b</sup>", " "]
    var chord_type = [" ", "<sub>m</sub>", "<sup>7</sup>"]
    var interval = [" T", " Q"]

    next_chord = make_chord([noteNames, accidentals, chord_type])
    console.log(next_chord)

    $('#current_interval').html($('#next_interval').html());
    $('#next_interval').html(pick_from_list(interval));

    $('#current_chord_symbol').html($('#next_chord_symbol').html());
    $('#next_chord_symbol').html(next_chord);

    random_arrow();

}

function resetBoxes() {
    $("#box1").removeClass('first_beat');
    $("#box2").removeClass('first_beat');
    $("#box3").removeClass('first_beat');
    $("#box4").removeClass('first_beat');
}

$(document).ready(function ($) {
    var screen = $(window)
    if (screen.width() > 380) {
        $('#toggle-random').bootstrapToggle();
        $('#toggle-interval').bootstrapToggle();
    }

    changeChord();
    var metronome_on = false;
    $('#toggle-random').change(function (event) {
        console.log("switched")
        if ($('#toggle-random').prop('checked')) {
            console.log("field off")
            $('#chord_seq').css("display", "none")
        } else {
            $('#chord_seq').css("display", "block")
            console.log("field on")
        }
    });

    $('#toggle-interval').change(function (event) {
        console.log("switched interval")
        if (!($('#toggle-interval').prop('checked'))) {
            console.log("interval off")
            $('.interval').css("display", "none")
        } else {
            $('.interval').css("display", "inline")
            console.log("interval on")
        }
    });

    $('#onoff').click(function (event) {
        if (metronome_on) {
            console.log("was on. turning off.");
            clearInterval(intervalID);
            resetBoxes()
            metronome_on = false;
            $(this).text("start");
        } else {
            console.log("was off. turning on.");
            var bpm = getBPM();
            console.log("bpm: ", bpm);
            var delay = 1000 / (bpm / 60);
            audioCtx = new (window.AudioContext || window.webkitAudioContext || window.audioContext);
            beat_counter = 0;

            if (!($('#toggle-random').prop('checked'))) {
                console.log("random is not checked")
                var chords_str = $('#chord_seq_box').val();
                chords_list = chords_str.split(", ");
                console.log(chords_list);
                intervalID = window.setInterval(metronome, delay, chords_list);
            } else {
                intervalID = window.setInterval(metronome, delay);
            }

            metronome_on = true;
            $(this).text("stop");
        }
    });

});
