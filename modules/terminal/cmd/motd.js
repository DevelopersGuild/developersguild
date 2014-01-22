module.exports = function(){

	var fs = require('fs');

	function init(fs, callback){
		fs.readFile(__dirname+'/motd/config.json', 'utf8', function (err, config) {
			if (err) {
			  callback('Error reading config file: ' + err);
			  return;
			}
			config = JSON.parse(config);
			

			callback(false, config);

	    });
	}

	function command(db, captureInput, releaseInput, setPersistantData, getPersistantData, deletePersistantData, output, command, socketId, callback){

		init(fs, function (err, config){
			if(err){
				callback(err);
				return;
			}

			var commands = function (config, output, callback){
				return {
					  //Default
					  info: function(){
						  output({ output: config.info});
					  }  
					, flags: function (){
						  output({ output: config.flags})
					  }
					, h: function (){
						  commands.info();
						  commands.flags();
					  }

					  //Custom
					, d: function (){
					      output({ output: config.d});
					  }
					, m: function (){
						  output({ output: config.m});
					  }
				}
			}(config, output, callback);

			var aliases = {
					  help: 'h'
					, desktop: 'd'
					, mobile: 'm' 
				}
			  , queue = [];

			if(Object.keys(command.flags).length === 0){
				commands.d(command, function (err){
		 			if(err){
		 				callback(err);
		 				return;
		 			}
		 		});
			}else{

				for(flag in command.flags){
					if(command.flags[flag].type == 'standard' && commands[flag]){
						queue.push(flag);
					}else if(commands[aliases[flag]]){
						queue.push(aliases[flag]);
					}else{
						callback('illegal option: '+flag);
						output({output: 'motd: illegal option: '+flag});
						//commands.help();
						return;
					}
				}

				for(var i = 0; i < queue.length; i++){
					commands[queue[i]](command, function (err){
			 			if(err){
			 				callback(err);
			 				return;
			 			}
			 		});
				}

			}

		});

	}

	return {
		command: command
	}
}();