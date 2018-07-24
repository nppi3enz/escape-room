function n(n){
    return n > 9 ? "" + n: "0" + n;
}

$(document).ready(function() {
    wsUri = 'http://localhost:7777'; // เขียนurlติดต่อไปยัง server ในพอร์ต 9999
    var socket = io.connect(wsUri); // ทำการติดต่อ
    // socket.emit('register', {team: 'admin'});
    socket.on('callAdmin', true);
    socket.on('timer', function (data) {
        var c = data.countdown;
        var mi = n(c.minutes);
        var se = n(c.seconds);
        var milli = n(parseInt(c.milliseconds/10));
        $('#timer').html(mi+':'+se+':'+milli);
    });
    socket.on('user_online', function (data) {
       $('.online').html(data);
    });
    socket.on('member_list', function (data) {
        $('#member ul').html("");
       for(var i=0;i<data.length;i++) {
           $('#member ul').append('<li>ID:'+data[i].id+' Team : '+data[i].team+' / Sub-Room : '+data[i].subroom+' </li>');
       }
    });
    socket.on('sendLog', function (data) {
        $('#log ul').append('<li>'+data+'</li>');
        $("#log").animate({ scrollTop: $(document).height() }, 1000);
    });
    socket.on('showTimeFinish', function (data) {
        // console.log('finish');
       // console.log(data);
        var showstart = data.start;
        $('.timestart').text(showstart);
        var showred = data.endred;
        $('.timered').text(showred);
        var showblue = data.endblue;
        $('.timeblue').text(showblue);
    });
    $(document).on('click', '.open-video', function () {
        var url = $(this).data('url');
        console.log('open-video');
        console.log(url);
        socket.emit('open-video', url);
    });
    $(document).on('click', '.close-video', function () {
        socket.emit('close-video', true);
    });

});

    $(document).on('click', '#start', function () {
        //alert('test');
        $.get( "/start", function( data ) {
            //alert( "Load was performed." );
        });
    });
    $(document).on('click', '#resume', function () {
        $.get( "/resume", function( data ) {
            //alert( "Load was performed." );
        });
    });
    $(document).on('click', '#stop', function () {
        $.get( "/stop", function( data ) {
            //alert( "Load was performed." );
        });
    });
    $(document).on('click', '#reset', function () {
        $.get( "/reset", function( data ) {
            //alert( "Load was performed." );
        });
    });

