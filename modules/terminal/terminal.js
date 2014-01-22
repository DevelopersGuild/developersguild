//I am extremely ashamed of this code, but it works so fuck it.
module.exports = function(){

	//console.log("#####");

	var socket
	  , db
	  , fs = require('fs')
	  , config = {}
	  , cmdFiles = {}
	  , inputCapture = {
	  		  captured: false
	  		, moduleName: null
	  		, methodName: null
	  	}
	  , persistantData = {}; //session id -> {data}


	function start(socketLink, dbLink, headers, init, callback){

		if(!socketLink){
			callback('Invalid socket link');
			return;
		}

		if(!dbLink){
			callback('Invalid MongoDB link');
			return;
		}
		socket = socketLink;
		db = dbLink;

		configure(headers, function (err){
			if(err){
				callback(err);
				return;
			}
			
			output('command', 'clear');
			output('command', 'setPrompt /bin/dgsh&gt;&nbsp;');
			if(init){


				validate(init, function (err, validData){
		    		if(err){
		    			callback(err);
		    			return;
		    		}
		    		input(validData, socketLink.id, function (err){
		    			if(err){
		    				callback(err);
		    				return;
		    			}
		    		});	
		    	});
			}

	        socket.on('terminalInput', function (data){

		    	validate(data.input, function (err, validData){
		    		if(err){
		    			callback(err);
		    			return;
		    		}

		    		if(inputCapture.captured === true){
		    			if(inputCapture.moduleName && inputCapture.methodName && cmdFiles[inputCapture.moduleName]){
		    				var cmdFile = require(cmdFiles[inputCapture.moduleName]);

							if(!cmdFile){
								callback('Unable to open command file.');
								return;
							}

							if(typeof cmdFile[inputCapture.methodName] !== 'function'){
								callback('Invalid method name.');
								return;
							}

							cmdFile[inputCapture.methodName](db, captureInput, releaseInput, setPersistantData, getPersistantData, deletePersistantData, output, validData, socketLink.id, function (err){
								if(err){
									callback(err);
									return;
								}
								typeof callback === 'function' && callback(false);
							});
		    			}else{
		    				callback('Invalid module or method.');
		    				inputCapture.captured = false;
							inputCapture.moduleName = null;
							inputCapture.methodName = null;
							return;
		    			}
		    		}else{
			    		input(validData, socketLink.id, function (err){
			    			if(err){
			    				callback(err);
			    				return;
			    			}
			    			typeof callback === 'function' && callback(false);
			    		});	
		    		}
		    	});
		    });
	        
			socket.on('disconnect', function (data){
				deletePersistantData(socketLink.id);
			});

		});
	}

	function setPersistantData(socketId, dataKey, dataValue, callback){
		if(typeof persistantData[socketId] === "undefined") persistantData[socketId] = {};
		
		//console.log(socketId, dataKey, dataValue);

		persistantData[socketId][dataKey] = dataValue;

		typeof callback === 'function' && callback(false);
		return;
	}

	function getPersistantData(socketId, dataKey, callback){
		if(typeof persistantData[socketId] === "undefined"){
			typeof callback === 'function' && callback("session " + socketId + " does not exist.");
		}
		typeof persistantData[socketId][dataKey] !== "undefined"  && typeof callback === 'function' ? callback(false, persistantData[socketId][dataKey]) :  callback(dataKey + " is undefined");
		return;
	}

	function deletePersistantData(socketId, callback){
		if(typeof persistantData[socketId] === "undefined"){
			typeof callback === 'function' && callback("no data for session " + socketId);
			return;
		}
		delete persistantData[socketId];
		typeof callback === 'function' && callback(false);
		return;
	}

	function captureInput(moduleName, methodName, callback){
		if(inputCapture.captured === true){
			callback('Unable to capture input.');
			return;
		}
		inputCapture.captured = true;
		inputCapture.moduleName = moduleName;
		inputCapture.methodName = methodName;
		
		typeof callback === 'function' && callback(false);

	}

	function releaseInput(moduleName, callback){
		if(inputCapture.captured === false){
			callback('Input is not captured.');
			return;
		}else if(inputCapture.moduleName !== moduleName){
			callback('Input is captured by another module.');
			return;
		}

		output('command', 'setPrompt /bin/sh&gt;&nbsp;');
		
		inputCapture.captured = false;
		inputCapture.moduleName = null;
		inputCapture.methodName = null;
		
		typeof callback === 'function' && callback(false);
	}

	function configure(headers, callback){
		//Check if headers object is set
		if(!headers){
			callback('No headers recieved.');
			return;
		}

		//Setup cmdFiles object
		fs.readdir(__dirname+'/cmd', function (err, data){
			if(err){
				callback('Error reading cmd dir: '+err);
				return;
			}
			for(var i = 0; i < data.length; i++){
				if(typeof data[i] == 'string' && data[i].match(/\.js\b/)){
					cmdFiles[data[i].substr(0, data[i].search(/\.js\b/))] = __dirname+'/cmd/'+data[i];
				}
			}
			
			typeof callback === 'function' && callback(false);
		});

	}

	function input(cmd, socketId, callback){

		var parsedCmd = cmd.replace(/&quot;/g, '\"').replace(/&#x27;/g, '\'').match(/(["'])(?:\\?.)*?\1|\S+/g);

		var command = {
			  cmd: cmd
			, args: parsedCmd
			, name: parsedCmd[0]
			, flags: []

		};


		for(var i = 1; i < command.args.length; i++){
			//Get rid of surrounding quotes (keeps inner/unmatched quotes)
			if( (command.args[i][0] == '\"' && command.args[i][command.args[i].length-1] == '\"') || (command.args[i][0] == '\'' && command.args[i][command.args[i].length-1] == '\'')){
				command.args[i] = command.args[i].substring(1, command.args[i].length-1);
			}

		}
		for(var i = 1; i < command.args.length; i++){
			//Detect flags
			if(command.args[i].length > 1 && command.args[i][0] == '-'){ 
				if(command.args[i].length > 2 && command.args[i][1] == '-'){
					command.flags[command.args[i].substring(2, command.args[i].length)] = {
						  flag: command.args[i]
						, flagname: command.args[i].substring(2, command.args[i].length)
						, type: 'verbose'
						, pos: i
						, next: (command.args[i+1] && command.args[i+1][0] !== '-') ? command.args[i+1] : null
					}
				}else if(command.args[i][1] != '-'){
					for(var f = 1; f <= command.args[i].substring(1, command.args[i].length).length; f++){
						command.flags[command.args[i].substring(f,f+1)] = {
							  flag: command.args[i]
							, flagname: command.args[i].substring(f,f+1)
							, type: 'standard'
							, pos: i
							, next: (command.args[i+1] && command.args[i+1][0] !== '-' && f == command.args[i].substring(1, command.args[i].length).length) ? command.args[i+1] : null
						}
					}
					
				}
			}
		}

		propogate(command, socketId, function (err){
			if(err){
				callback(err);
			}
			
			typeof callback === 'function' && callback(false);
		});


	}

	function propogate(command, socketId, callback){
		if(cmdFiles[command.name]){
			var cmdFile = require(cmdFiles[command.name]);
			if(!cmdFile){
				callback('Unable to open command file.');
				return;
			}
			//console.dir(socket);
			cmdFile.command(db, captureInput, releaseInput, setPersistantData, getPersistantData, deletePersistantData, output, command, socketId, function (err){
				if(err){
					callback(err);
					return;
				}
			});
		}else{
			output({ output: '/bin/dgsh: '+command.name+': Command not found.\n'});
		}
		
		typeof callback === 'function' && callback(false);
	}

	function validate(data, callback){
		data = data.replace(/\s+/g, " ");
		if(!data || data === ' '){
			callback('Error: no data received.');
			return;
		}
		callback(false, data);
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
		typeof callback === 'function' && callback(false);
	}


	return {
		start: start
	}

};