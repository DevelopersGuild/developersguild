module.exports = function(){

	function command(db, captureInput, releaseInput, setPersistantData, getPersistantData, deletePersistantData, output, command, socketId, callback){

		output('command', 'clear');
		callback(false);

	}
	return {
		command: command
	}
}();