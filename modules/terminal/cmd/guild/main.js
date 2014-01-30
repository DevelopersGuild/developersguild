//I am extremely ashamed of this code, but it works so fuck it.
module.exports = function(){
	var fs = require('fs')
	  , db
	  , guildMembers
	  , validator = require('validator');

	function command(dbLink, captureInput, releaseInput, setPersistantData, getPersistantData, deletePersistantData, output, command, socket, callback){

		var db = dbLink
		  , socketId = socket.id;

		var commands = function (callback){
			return {
				s: function (command, callback){

					setPersistantData(socketId, 'signupStep', 'firstName', function (err){
						signup(dbLink, captureInput, releaseInput, setPersistantData, getPersistantData, deletePersistantData, output, null, socket, callback);

						captureInput('guild', 'signup', function(err){
							if(err){
				 				callback(err);
				 				return;
				 			}
						});
		      	  	});

				}

			}
		}(output, callback);

		var aliases = {
				start: 's'
			}
		  , queue = [];

		for(flag in command.flags){
			if(command.flags[flag].type == 'standard' && commands[flag]){
				queue.push(flag);
			}else if(commands[aliases[flag]]){
				queue.push(aliases[flag]);
			}else{
				callback('illegal option: '+flag);
				output({output: 'guild: illegal option: '+flag+'\n'});
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

	function signup(dbLink, captureInput, releaseInput, setPersistantData, getPersistantData, deletePersistantData, output, command, socket, callback){
		var socketId = socket.id;


		getPersistantData(socketId, 'signupStep', function (err, signupStep){
			if(err){
				callback('signup not initiated.');
				return;
			}

			db = dbLink;
			guildMembers = db.collection('guildMembers');

			guildMembers.ensureIndex( { email: 1 }, { unique: true } );

			if(!command){
				command = null;
			}

			if((typeof command === 'string' && command.toLowerCase() === 'exit') || typeof signupStep === "undefined" || signupStep == null){
				deletePersistantData(socketId);
				releaseInput('guild');
				return;
			}

			var steps = function(data, callback){
				return {
					  firstName: function(data, callback){
					      if(data){

					      	  try{
					      	  	validator.check(data).isAlpha().len(1,64);
					      	  }catch(e){
					      	  	output({output: 'That\'s an odd first name. Please try again.\n'});
					      	  	  steps.firstName(null, function(err){
								      typeof callback === 'function' && callback((err) ? err:false);
					      	      });
					      	      return;
					      	  }

					      	  setPersistantData(socketId, 'firstName', data, function (err){

					      	  	  setPersistantData(socketId, 'signupStep', 'lastName', function (err){

					      	  	  	  steps.lastName(null, function (err){
										  typeof callback === 'function' && callback((err) ? err:false);
							      	  });

					      	  	  });

					      	  }); 
					      	  
					      }else{
							  output('command', 'setPrompt &gt;&nbsp;');
	    				      output({output: 'Please enter your first name:\n'})
					      }
					  }
					, lastName: function(data, callback){
						  if(data){

					      	  try{
					      	  	validator.check(data).isAlpha().len(1,64);
					      	  }catch(e){
					      	  	output({output: 'That\'s an odd last name. Please try again.\n'});
					      	  	  steps.lastName(null, function(err){
								      typeof callback === 'function' && callback((err) ? err:false);
					      	      });
					      	      return;
					      	  }

					      	  setPersistantData(socketId, 'lastName', data, function (err){

					      	  	  setPersistantData(socketId, 'signupStep', 'email', function (err){

							      	  steps.email(null, function (err){
										  typeof callback === 'function' && callback((err) ? err:false);
							      	  });

						      	  });

					      	  }); 
					      	  
					      }else{
	    				      output({output: 'Please enter your last name:\n'})
					      }
					  }
					, email: function(data, callback){
						if(data){

					      	  try{
					      	  	validator.check(data).isEmail().len(1,100);
					      	  }catch(e){
					      	  	  output({output: 'Invalid email address.\n'});
					      	  	  steps.email(null, function(err){
								      typeof callback === 'function' && callback((err) ? err:false);
					      	      });
					      	      return;
					      	  }

					      	  guildMembers.find({email: data}, function(err, results){
								    typeof callback === 'function' && callback((err) ? err:false);

								    if(results[0]){
								    	output({output: 'Email address already exists.\n'});
						      	  	    steps.email(null, function(err){
									        typeof callback === 'function' && callback((err) ? err:false);
						      	        });
						      	        return;
								    }
								    
								    setPersistantData(socketId, 'email', data, function (err){

								    	setPersistantData(socketId, 'signupStep', 'finish', function (err){

											steps.finish(null, function(err){
										    	typeof callback === 'function' && callback((err) ? err:false);
							      	    	});

							      	    }); 

								    });
						      	    

						      	    
					      	  });

					      	  
					      }else{
	    				      output({output: 'Please enter your email address:\n'})
					      }
					  }
					, finish: function(data, callback){

						  getPersistantData(socketId, 'firstName', function (err, firstName){
						  	  if(err){
						  	  	  typeof callback === 'function' && callback(err);
						  	  	  return;
						  	  }
							  getPersistantData(socketId, 'lastName', function (err, lastName){
							  	  if(err){
							  	  	  typeof callback === 'function' && callback(err);
							  	  	  return;
							  	  }
							  	  getPersistantData(socketId, 'email', function (err, email){
								  	  if(err){
								  	  	  typeof callback === 'function' && callback(err);
								  	  	  return;
								  	  }
									  guildMembers.save({
									  	  email: email
									  	, firstName: firstName
									  	, lastName: lastName
									  	, ip: socket.handshake.address.address
									  	, timestamp: new Date()
									  }, function(err, result){
									  	  if(err){
									  	      output({output: 'Error saving data. Please try again.\n'})				        
									  	  	  releaseInput('guild', function(){
										          typeof callback === 'function' && callback((err) ? err:false);
										  	  });
									  	  	  return;
									  	  }
									  	  output({output: 'Thank you for your interest in the Developers\' Guild, '+result.firstName+'.\nWe will be in touch with you shortly!\n'})				        
									  	  signupStep = null;
										  releaseInput('guild', function(err){
										  	  deletePersistantData(socketId, function (err){
										      	  typeof callback === 'function' && callback((err) ? err:false);
										  	  });
										  });
									  });
								  });
							  });
						  });
					  }
				}
			}(command, callback);

			if(typeof steps[signupStep] === 'function'){
				steps[signupStep](command, callback);
			}

		});
	}

	return {
		  command: command
		, signup: signup
	}
}();