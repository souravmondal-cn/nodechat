window.onload = function() {

    var messages = [];
    var socket = io.connect('http://10.0.1.79:3001');
    var field = document.getElementById("field");
    var sendButton = document.getElementById("send");
    var content = document.getElementById("content");
    var name = document.getElementById("name");

    socket.on('message', function(data) {
        if (data.message) {
            messages.push(data);
            var html = '';
            for (var i = 0; i < messages.length; i++) {
                html += '<b>' + (messages[i].username ? messages[i].username : 'Server') + ': </b>';
                html += messages[i].message + '<br />';
            }
            content.innerHTML = html;
        } else {
            console.log("There is a problem:", data);
        }
    });

    sendButton.onclick = function() {
        if (name.value == "") {
            alert("Please type your name!");
        } else {
            var text = field.value;
            if (text === "") {
                alert("Enter Message");
            } else {
                socket.emit('send', {message: text, username: name.value});
                field.value = "";
                $("#name").hide();
            }
        }
    };
}
jQuery(document).ready(function() {
    jQuery("#field").keyup(function(e) {
        if (e.keyCode == 13) {
            sendMessage();
        }
    });
    jQuery("#content").scrollTop(jQuery("#content").scrollHeight);
});