
$(document).ready(function() {
	var _ 					= require('underscore');
	var scanner 			= require('../../XEmoji/scanner.js');
	var audio 				= new Audio('../sounds/sound_01.mp3');
	var fs 				 	= require('fs');
	
    var socket 				= io.connect('http://localhost:3000');
    var username 			= localStorage.getItem("nickname");
	
	var selected = {
		serverId: '',
		channelId: ''
	}

// User logged and loaded
    socket.emit('logged', username);

	
// Messages events
	// Send message
		$('form').submit(function() {
			// Kostul`
			var kost = ' ';
			for(var k = 0; k < username.length; k++){
				kost = kost + '&nbsp';
			}
				
			var utc = new Date().toJSON().slice(0,19).replace('T',' ');
			
			socket.emit('chat message', 
			{
				content: $('#m').val(),
				serverId: selected.serverId,
				channelId: selected.channelId,
				username: username,
				created: utc
			});
			
			var toSend = "<div id='textarea' class='msg user_msg' disabled readonly><span class='nick'>"+username+"</span> <h1>" + kost + emojify($('#m').val()) + "</h1></div>";
			
			//$('#messages').append($('<li>').html(toSend));
			$('#m').val('');
			return false;
		});
	
	// Receive message
		socket.on('chat message', function(msg) {
			// Test
			console.log("msg.channelId: " + msg.channelId + " selected.channelId: " + selected.channelId);
			
			if(msg.serverId == selected.serverId && msg.channelId == selected.channelId){
				var kost = ' ';
					for(var k = 0; k < msg.username.length; k++){
						kost = kost + '&nbsp';
					}
				var toShow = kost+emojify(msg.content);
				var time = msg.created.slice(0,19).replace('T',' ');
				$('#messages').append($('<li>').html("<div id='textarea' class='msg other_msg' disabled readonly><span class='nick'>"+msg.username+"</span><span class='time'>"+time+"</span><h1>" + toShow + "</h1></div>"));
				var list = document.getElementsByClassName("msg");
				
				//autosize(list[list.length - 1]);
				var elem = document.getElementById('scroll-3');
				elem.scrollTop = elem.scrollHeight;
			}
			
			// Play message-receive sound
			audio.play();
			
		});
	
	
// Receive info
	// Get user`s servers
	socket.on('servers', function(data){
		console.log(data);
		
		// Add servers
		for(let a = 0; a < data.length; a++){
			$('#left-list').append($('<li>').html("<div id='"+data[a].id+"' class='server'><span class='server-title'><img class='server-icon' src ='data:"+data[a].img.contentType+";base64,"+_arrayBufferToBase64(data[a].img.data)+"'>"+data[a].title+"</span></div>"));
			
			// Default server selects on start
			if(a==0){
				$("#"+data[a].id).addClass("selected-server");
				selected.serverId = data[a].id;
				socket.emit('getChannels', data[a].id);
				socket.emit('currentUsers', data[a].id);
			}
		}
		
		// Click listener
		$(".server").click(function(){
			// Test
			console.log(this.id);
			
			// Clear messages textarea
			$('#messages').html('');
			
			// Clear users list
			$('.online-list').html("--Online--");
			$('.offline-list').html("--Offline--");
			
			// Change css
			$(".server").removeClass("selected-server");
			$("#"+this.id).addClass("selected-server");
			
			// Change selected value
			selected.serverId = this.id;
			
			// Request channels
			socket.emit('getChannels', this.id);
			
			// Request current users
			socket.emit('currentUsers', this.id);
		});
	});
	
	// On select server - get server`s channels
	socket.on('channels', function(data){
		// Test
		console.log(data);
		
		// Clear channel-list
		$('#right-list').html("");
		
		// Add channels
		for(let a = 0; a < data.length; a++){
			$('#right-list').append($('<li>').html("<div id='"+data[a]._id+"' class='channel'><span class='channel-title'>#"+data[a].title+"</span></div>"));
			
			// Default channel loads after server is selected
			if(a==0){
				$("#"+data[a]._id).addClass("selected-channel");
				selected.channelId = data[a]._id;
				socket.emit('getMessages', selected);
			}
		}
		
		// Click listener
		$(".channel").click(function(){
			// Test
			console.log(this.id);
			
			// Change 
			$(".channel").removeClass("selected-channel");
			$("#"+this.id).addClass("selected-channel");
			
			// Change selected value
			selected.channelId = this.id;
			
			// Request messages
			socket.emit('getMessages', selected);
		});
	});
	
	// On select channel - get messages
	socket.on('messages',function(msgs){
		// Test
		console.log(msgs)
		
		// Clear messages textarea
		$('#messages').html('');
		
		for (var i = 0; i < msgs.length; i++) {
			// Kostul`
			var kost = '';
			for(var k = 0; k < msgs[i].username.length; k++){
				kost = kost + '&nbsp';
			}
			var time = msgs[i].created.slice(0,19).replace('T',' ');
			if(msgs[i].username === username)
				$('#messages').append($('<li>').html("<div id='textarea' class='msg user_msg' disabled readonly><span class='nick'>"+msgs[i].username+"</span><span class='time'>"+time+"</span><h1>" + kost+ emojify(msgs[i].content) + "</h1></div>"));
			else
				$('#messages').append($('<li>').html("<div id='textarea' class='msg other_msg' disabled readonly><span class='nick'>"+msgs[i].username+"</span><span class='time'>"+time+"</span><h1>" + kost + emojify(msgs[i].content) + "</h1></div>"));
		}
		
		// Set scroll on top
		var elem = document.getElementById('scroll-3');
		elem.scrollTop = elem.scrollHeight;
	});
	
	socket.on('add server', function(data){
		//	Test
		console.log("add server");
		console.log(data.img);

		$('#left-list').append($('<li>').html("<div id='"+data.id+"' class='server'><span class='server-title'><img class='server-icon' src ='data:"+data.img.contentType+";base64,"+_arrayBufferToBase64(data.img.data)+"'>"+data.title+"</span></div>"));	
		
		// Click listener
		$(".server").click(function(){
			// Test
			console.log(this.id);
			
			// Clear messages textarea
			$('#messages').html('');
			
			// Clear current users list
			$('#users-list').html("");
			
			// Change css
			$(".server").removeClass("selected-server");
			$("#"+this.id).addClass("selected-server");
			
			// Change selected value
			selected.serverId = this.id;
			
			// Request channels
			socket.emit('getChannels', this.id);
			
			// Request current users
			socket.emit('currentUsers', this.id);
		});
	});
	
	// Convert data to image
	function _arrayBufferToBase64( buffer ) {
		// Test
		//console.log("BUFFER: " + buffer);
		var binary = '';
		var bytes = new Uint8Array( buffer );
		var len = bytes.byteLength;
		
		for (var i = 0; i < len; i++) {
			binary += String.fromCharCode( bytes[ i ] );
		}
		
		return window.btoa( binary );
	}
	
	function _base64ToArrayBuffer(base64) {
		// Test
		//console.log("BASE64: " + base64);
		
		var binary_string =  window.atob(base64);
		var len = binary_string.length;
		var bytes = new Uint8Array( len );
		for (var i = 0; i < len; i++)        {
			bytes[i] = binary_string.charCodeAt(i);
		}
		return bytes.buffer;
	}
		
	// On server select - get current users
	socket.on('currentUsers', function(users){
		// Test
		console.log("currentUsers: " + users);
		
		// Add users
		for (var i = 0; i < users.length; i++) {
            $('.online-list').append($('<li class="username online" id="'+users[i]+'">').html(users[i]));
        }
	});
	
	// On server select - get users
	socket.on('users', function(users){
		// Test
		console.log("users: " + users);
		
		// Add users
		for (var i = 0; i < users.length; i++) {
            $('.offline-list').append($('<li class="username offline" id="'+users[i]+'">').html(users[i]));
        }
	});
	
	// If someone went offline
	socket.on('user went offline', function(username){
		
		// Remove from online
		$('#' + username).remove();
		
		// Add to offline
		$('.offline-list').append($('<li class="username offline" id="'+username+'">').html(username));
	});
	
	// If someone went online
	socket.on('new user online', function(data){
		// Test
		//console.log("NewUserOnline: " + data.serverId + " sel: " + selected.serverId);
		
		if(data.serverId == selected.serverId){
			// Remove from offline
			$('#' + data.username).remove();
			
			// Add to online
			$('.online-list').append($('<li class="username online" id="'+data.username+'">').html(data.username));
		}
	});
	
	
// Typing
    //TODO multiple users typing
	
    var typing = false;

    $("#m").keypress(function() {
		
        if (!typing){
            socket.emit('typing');
		}
        typing = true;
    });

    socket.on('typing', function(name) {
        $("#typing").append('<div id="' + name + '">' + name + ' is typing</div>');
    })

    $("#m").keyup(_.debounce(function() {
        socket.emit('stop typing');
        typing = false;
    }, 1000));

    socket.on('stop typing', function(name) {
        $("#" + name).remove();
    })



// Buttons events
	// Exit
    $('#exit').click(function(event) {
        console.log("exit");
        require('electron').remote.getCurrentWindow().close();
        event.stopPropagation();
    });
	
	// Load more
	$('.load').click(function() {
		console.log('tap');
		socket.emit('load more');
	});
	
	// Create server
	$('#server-create').click(function(){
		// Test
		console.log('#server-create');
		
		let imgSrc = $('#img-place').attr('src');
		let dotIndex = imgSrc.indexOf(',') + 1;
		let dot2Index = imgSrc.indexOf(';');

		let title = $('#server-title').val();
		let data = imgSrc.substring(dotIndex);
		$.post("http://localhost:3000/server/new", 
			{	title: title, 
				img:{
					data: data,
					contentType: imgSrc.substring(5,dot2Index)
				}
			}
			).done(function(data) {
					if(!data.success){
						alert(data.msg, "Error");
						return;
					}
					// Test
					console.log("Server created");
					socket.emit('join server', {username: username, serverId: data.serverId});
				});
	});
	
	// User uploaded an image
	$("#img-upload").change(function (evt) {
		// Test
		console.log("image uploaded");
		
		var tgt = evt.target || window.event.srcElement,
			files = tgt.files;

		// FileReader support
		if (FileReader && files && files.length) {
			var fr = new FileReader();
			fr.onload = function () {
				
				 var image = new Image();
                image.src = fr.result;
                       
                image.onload = function () {
					if(this.width == 64 || this.height == 64){
						$("#img-place").attr("src", fr.result);
						$('#img-error').html("");
					}
					else {
						// Test
						console.log("#OnLoad. Bad size of image. Size: " + this.width + " x " + this.height);
						$('#img-error').html("Invalid image size.");
						$("#img-upload").val('');
					}
                }
				
			}
			fr.readAsDataURL(files[0]);
		}

		// Not supported
		else {
			// fallback -- perhaps submit the input to an iframe and temporarily store
			// them on the server until the user's session ends.
		}
	});

	
// MB usefull
    socket.on('last messages', function(msgs) {
        console.log(msgs)
        for (var i = 0; i < msgs.length; i++) {
			var kost = '';
			for(var k = 0; k < msgs[i].username.length; k++){
				kost = kost + '&nbsp';
			}
            if(msgs[i].username === username)
                $('#messages').append($('<li>').html("<div id='textarea' class='msg user_msg' disabled readonly><span class='nick'>"+msgs[i].username+"</span><h1>" + kost+ emojify(msgs[i].content) + "</h1></div>"));
            else
                $('#messages').append($('<li>').html("<div id='textarea' class='msg other_msg' disabled readonly><span class='nick'>"+msgs[i].username+"</span><h1>" + kost + emojify(msgs[i].content) + "</h1></div>"));
        }
		
		var elem = document.getElementById('scroll');
		elem.scrollTop = elem.scrollHeight;
    })
	
	socket.on('load more', function(data) {
		console.log(data);
		if(data === "Already all messages"){
			$('#messages').prepend($('<li>').html("<div id='textarea' class='msg other_msg' disabled readonly><span class='nick'>SYSTEM</span><h1>" + data + "</h1></div>"));
			return;
		}
		for (var i = data.length - 1; i >= 0; i--) {
			
			var kost = ' ';
			for(var k = 0; k < data[i].username.length; k++){
				kost = kost + '&nbsp';
			}
			var toShow = kost+emoji.emojify(data[i].content);
			
			if(data[i].username === username)
				$('#messages').prepend($('<li>').html("<div id='textarea' class='msg other_msg' disabled readonly><span class='nick'>"+data[i].username+"</span><h1>" + toShow + "</h1></div>"));
			else
				$('#messages').prepend($('<li>').html("<div id='textarea' class='msg other_msg' disabled readonly><span class='nick'>"+data[i].username+"</span><h1>" + toShow + "</h1></div>"));
		}
    });
	 
});