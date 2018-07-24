var express = require('express');
var countdown = require('countdown');
var app = express();

var port = process.env.PORT || 7777;

var path = require('path');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.static('assets'));

app.use("/js", express.static("./assets/js"));

app.get('/', function(req, res) {
    res.render('index');
});

app.get('/control', function(req, res) {
    res.render('control');
});


var server = app.listen(port, function() {
    console.log('Starting node.js on port ' + port);
});

// var countdown = 1000;

//var start = new Date(2017, 02, 16, 18, 0, 0, 0);
var start;
console.log("timestart "+start);
var gameStart = false;

var countdown_unit =
    countdown.MINUTES |
    countdown.SECONDS |
    countdown.MILLISECONDS;

var time;

var checktime = [false, false, false, false]; //45 30 15 5
function checkTimer(input) {

    if(input.minutes == 45 && input.seconds == 0 && checktime[0] == false) {
        checktime[0] = true;
        io.sockets.emit('voice', '45min.mp3');
        console.log('45 min alert!');
        io.sockets.emit('sendLog', "45 min alert!");
    } else if(input.minutes == 30 && input.seconds == 0 && checktime[1] == false) {
        checktime[1] = true;
        io.sockets.emit('voice', '30min.mp3');
        io.sockets.emit('sendLog', "30 min alert!");
        console.log('30 min alert!');
    } else if(input.minutes == 15 && input.seconds == 0 && checktime[2] == false) {
        checktime[2] = true;
        io.sockets.emit('voice', '15min.mp3');
        console.log('15 min alert!');
        io.sockets.emit('sendLog', "15 min alert!");
    } else if(input.minutes == 5 && input.seconds == 0 && checktime[3] == false) {
        checktime[3] = true;
        io.sockets.emit('voice', '5min.mp3');
        console.log('5 min alert!');
        io.sockets.emit('sendLog', "5 min alert!");
    }

    if(input.minutes == 0 && input.seconds == 0 && input.milliseconds < 30) {
        clearInterval(time);
        io.sockets.emit('timer', { countdown: {minutes:0, seconds:0, milliseconds:0} });
        io.sockets.emit('stop-sound', true);
        io.sockets.emit('voice', 'boom.mp3');
    }
}

app.get('/start', function(req, res) {
    console.log('start timer');
    io.sockets.emit('sendLog', 'start timer');
    start = new Date();
    start.setMinutes(start.getMinutes() + 15);
    time = setInterval(function() {
        ts = countdown(null, start, countdown_unit);
        io.sockets.emit('timer', { countdown: ts });
        checkTimer(ts);
    }, 50);
    gameStart = true;
    res.send('{status:true}');
    //console.log(currentLevel['red']['b']);
    for(var i=0;i<user_online.length;i++){
        var team = user_online[i].team;
        var room = user_online[i].subroom;

        var num = currentLevel[team][room];
        io.sockets.connected[user_online[i].id].emit('clue', {clue_num: 1, text: dataTitle[num]});
    }
    io.sockets.emit('start-game', true);
});
app.get('/resume', function(req, res) {
    console.log('resume timer');
    io.sockets.emit('sendLog', 'resume timer');
    time = setInterval(function() {
        ts = countdown(null, start, countdown_unit);
        io.sockets.emit('timer', { countdown: ts });
    }, 30);
    res.send('{status:true}');
});
app.get('/stop', function(req, res) {
    console.log('stop timer');
    io.sockets.emit('sendLog', 'stop timer');
    clearInterval(time);
    res.send('{status:true}');
    gameStart = false;
    io.sockets.emit('stop-sound', true);
});
app.get('/reset', function(req, res) {
    console.log('reset timer');
    io.sockets.emit('sendLog', 'reset timer');
    clearInterval(time);
    io.sockets.emit('timer', { countdown: {minutes:60, seconds:0, milliseconds:0} });
    res.send('{status:true}');
});

//game ----------------------------------

var dataPassword = ["2890","1624","7347","6419","1150","1579","2027","2708"];
var dataTitle = [
    "ตามหาชิ้นส่วนเพื่อเปิดกระเป๋าให้ได้ แล้วตามหารหัสผ่านต่อไป..",
    "เคาะประตู 10 ครั้ง เพื่อรับรางวัล<br>แปลงข้อมูลที่ได้เป็นรหัสผ่าน 4 ตัว",
    "เคาะประตู 5 ครั้ง เพื่อรับรางวัล<br>ใช้ข้อมูลที่ได้ร่วมกับคำใบ้ที่อยู่รอบๆห้อง จะแปลงออกมาเป็นตัวเลข",
    "รหัสผ่านหาได้จากสิ่งที่อยู่ตรงหน้าคุณ ณ ตอนนี้ เพื่อเปิดกล่องหารหัสต่อไป",
    "เคาะประตู 3 ครั้ง เพื่อรับรางวัล<br>ต่อชิ้นส่วนที่ได้รับจนสำเร็จ และหาข้อความที่ซ่อนอยู่ แปลงเป็นรหัส",
    "เคาะประตู 7 ครั้ง เพื่อรับรางวัล<br>นำสิ่งได้รับมารอบพันสิ่งที่แปลกจากพวกในห้องนี้",
    "คุณได้รับสิทธิ์ออกจากห้อง พร้อมรับรางวัลที่หน้าห้องและไปทำภารกิจต่อที่ห้องน้ำหลังหอประชุม",
    "เดินทางไปยังห้องประชุมเพื่อภารกิจต่อไป<br>โดยถ้าเพื่อนในทีมคุณยังไม่สามารถออกจากห้องได้<br>คุณสามารถกลับไปช่วยเพื่อนของคุณได้ในเวลานี้",
    "ขอแสดงความยินดีด้วย!<br>ทีมคุณทำภารกิจสำเร็จ"];
// var dataClue = [
//     "เก็บจิ๊กซอว์ให้ครบ<br>นับจำนวนเหลี่ยมของรูปเพื่อนำมาไขกระเป๋า<br>และตามหาโปเกมมอนบอลให้เจอ",
//     "ตามหาเชือกผูกของแล้วนำไปมัดกับขวดน้ำเพื่อให้ได้รหัส",
//     "ตามหาต่อแถบเส้นน้ำเงิน-เขียวให้ครบแล้วนำมาต่อเป็นรหัส<br>ตัวเลขได้จากรูปภาพ",
//     "75094 + 7022 = 82116<br>นำมีดไปลอกรูปภาพตามหลังออก",
//     "นำ CD มาเปิดรหัสที่คอมเพื่อฟังรหัส แล้วนำรหัสที่ถอดได้ใส่ตารางอ่านแบบใหม่"];

var dataStatus = [];
dataStatus['red'] = [true,true,true,true,true,true,false,false];
dataStatus['blue'] = [true,true,true,true,true,true,false,false];

var currentLevel = new Array(2);
currentLevel['red'] = new Array(2);
currentLevel['red']['a'] = 3;
currentLevel['red']['b'] = 3;
currentLevel['blue'] = new Array(2);
currentLevel['blue']['a'] = 4;
currentLevel['blue']['b'] = 4;


var countWrong = [];
countWrong['red'] = {a: 0};
countWrong['red'] = {b: 0};
countWrong['blue'] = {a: 0};
countWrong['blue'] = {b: 0};

var timeFinish = [];
timeFinish['red'] = null;
timeFinish['blue'] = null;

function checkPass(password, socketid) {
    //console.log('check pass'+socketid);

    var data = loadData(socketid);
    var check = currentLevel[data.team][data.subroom];
    console.log(check);
    if(dataPassword[check] == password){
        console.log('team '+data.team+data.subroom+' Lv'+(check+1)+' input pass : '+password+' correct!!');
        io.sockets.emit('sendLog', 'team '+data.team+data.subroom+' Lv'+(check+1)+' input pass : '+password+' correct!!');
        io.sockets.connected[socketid].emit('result', true);
        dataStatus[data.team][check] = true;
        currentLevel[data.team][data.subroom]++;
        if(data.subroom == 'b') {
            var num = (currentLevel[data.team][data.subroom])-2;
        } else {
            var num = (currentLevel[data.team][data.subroom])+1;
            if(currentLevel[data.team][data.subroom] == 3) { //case a level 4
                currentLevel[data.team][data.subroom] = 6;
            } else if(currentLevel[data.team][data.subroom] == 4) {
                currentLevel[data.team][data.subroom] = 7;
            }
        }

        //check gameFinish
        var checkg = true;
        for(var j=0;j<dataStatus[data.team].length;j++) {
            if(dataStatus[data.team][j] == false) {
                checkg = false;
            }
        }
        if(checkg == true) {
            io.sockets.connected[socketid].emit('gameFinish', true);
            timeFinish[data.team] = new Date();
            console.log('show time finish!!!!');
            io.sockets.emit('showTimeFinish', {start: start, endred: timeFinish['red'], endblue: timeFinish['blue']})
            io.sockets.emit('sendLog', "FINISH!!!");
        }

         var clue = {clue_num: num, text: dataTitle[currentLevel[data.team][data.subroom]]};
        io.sockets.connected[socketid].emit('clue', clue);
        //update status
        console.log(dataStatus);
        io.sockets.emit('updateStatus', {red: dataStatus['red'], blue: dataStatus['blue']});
    } else {
        console.log('team '+data.team+data.subroom+' Lv'+(check+1)+' input pass : '+password+' wrong');
        io.sockets.emit('sendLog', 'team '+data.team+data.subroom+' Lv'+(check+1)+' input pass : '+password+' wrong');

        io.sockets.connected[socketid].emit('result', false);
    //     countWrong[team]++;
    //     checkWrong(team);
    }

}

function checkWrong(team) {
    if(countWrong[team] == 4) {
        //setInterval 2 minute
        io.sockets.emit('ban', true);
        countWrong[team] = 0;
    }

}


//network ----------------------------------


var clients = [];
var user_online = [];

var io = require('socket.io').listen(server);

function funIndexOf(arraytosearch, key, valuetosearch) {

    for (var i = 0; i < arraytosearch.length; i++) {

        if (arraytosearch[i][key] == valuetosearch) {
            return i;
        }
    }
    return null;
}

function loadData(id){
    var index = funIndexOf(user_online, 'id', id);
    return user_online[index];
}

io.sockets.on('connect', function(client, options) {
    clients.push(client);
    console.log("add client: ");
    console.log(clients.length);

    io.sockets.emit('sendLog', "add client"+clients.length);

    io.sockets.emit('user_online', clients.length);
    io.sockets.emit('callback', { hello: 'world' });
    io.sockets.emit('member_list', user_online);
    io.sockets.emit('updateStatus', {red: dataStatus['red'], blue: dataStatus['blue']});

    client.on('disconnect', function() {
        console.log('disconnect');
        clients.splice(clients.indexOf(client), 1);

        // console.log(client.id);
        user_online.splice(funIndexOf(user_online, 'id', client.id), 1);
        io.sockets.emit('member_list', user_online);
        io.sockets.emit('user_online', clients.length);
    });
});

io.sockets.on('connection', function (socket) {
    socket.on('reset', function (data) {
        countdown = 1000;
        io.sockets.emit('timer', { countdown: countdown });
    });
});
io.on('connection', function(socket) {
    var ipv4 = socket.request.socket.remoteAddress;

    // socket.on('calladmin', function (data) {
    //     io.sockets.emit('member_list', user_online);
    //     io.sockets.emit('user_online', clients.length);
    // });

    socket.on('register', function (data) {
        console.log('Hello Team: '+data['team']);
        io.sockets.emit('sendLog', "Login team "+data['team']+" Subroom: "+data['subroom']);
        user_online.push(
            {   id: socket.id,
                team: data['team'],
                subroom: data['subroom']
            });

        io.sockets.emit('member_list', user_online);
        if(gameStart) {
            io.sockets.connected[socket.id].emit('clue', {clue_num: (currentLevel[data['team']])+1, text: dataTitle[currentLevel[data['team']]]});
        }
    });

    socket.on('sendPass', function (data) {
        //console.log(socket.id);
        //console.log("check Pass: "+data['password']);
        checkPass(data['password'], socket.id);

    });

    socket.on('open-video', function (data) {
        console.log("Open Video : "+data);
        io.sockets.emit('open-video', data);
    });

    socket.on('close-video', function (data) {
        io.sockets.emit('close-video', data);
    });

});