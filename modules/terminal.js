module.exports = function(){

	var socket
	  , config = {};

	function start(connection, json, headers, callback){
		if(connection)
		socket = connection;
		configure(headers, json, function(err){
			if(err){
				callback(err);
				return;
			}
			
			output('command', 'clear');
	        output({ output: config.connect});

	        socket.on('terminalInput', function(data){
	        	input(data.input);
	        });
		});
	}

	function configure(headers, json, callback){
		//Check if headers object is set
		if(!headers){
			callback('No headers recieved.');
			return;
		}
		//Check if default config JSON is set
		if(!json){
			callback('Config JSON not set.');
			return;
		}
		//Set device type
		if(!headers.device || !json[headers.device]){
			config = 'desktop';
		}else{
			config = json[headers.device];
		}

		callback(false);
	}

	function input(cmd){

		cmd = cmd.replace(/&quot;/g, '\"').replace(/&#x27;/g, '\'').match(/(["'])(?:\\?.)*?\1|\S+/g);

		var command = {
			  name: cmd[0]
			, flags: []

		};

		for(var i = 1; i < cmd.length; i++){
			//Get rid of surrounding quotes (keeps inner/unmatched quotes)
			if( (cmd[i][0] == '\"' && cmd[i][cmd[i].length-1] == '\"') || (cmd[i][0] == '\'' && cmd[i][cmd[i].length-1] == '\'')){
				cmd[i] = cmd[i].substring(1, cmd[i].length-1);
			}

		}
		for(var i = 1; i < cmd.length; i++){
			//Detect flags
			if(cmd[i][0] == '-'){ 
				if(cmd[i][1] == '-'){
					command.flags.push({
						  flag: cmd[i]
						, flagname: cmd[i].substring(2, cmd[i].length)
						, type: 'verbose'
						, pos: i
						, next: (cmd[i+1] && cmd[i+1][0] !== '-') ? cmd[i+1] : null
					});
				}else{

				}
			}
		}

		console.dir(cmd);
	}

	function output(/*[event], data, [callback]*/){
		if(arguments.length == 1){
			var event = 'terminalOutput'
			  , data = arguments[0];
		}else if(arguments.length == 2){
			if(typeof arguments[1] == 'function'){
				var event = 'terminalOutput'
				  , data = arguments[0]
				  , callback = arguments[1]	
			}else{
				var event = arguments[0]
				  , data = arguments[1];
			}
		}else if(arguments.length >= 3){
			if(typeof arguments[2] == 'function'){
				var event = arguments[0]
				  , data = arguments[1]
				  , callback = arguments[2]	
			}else{
				var event = arguments[0]
				  , data = arguments[1];
			}
		}else{
			return;
		}
		socket.emit(event, data);
	}

	return {
		start: start
	}

}();