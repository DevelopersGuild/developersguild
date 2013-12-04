(function($){

	var socket = io.connect('http://'+window.location.host)
	  , history = []
	  , historyPointer = 0;

	$('#terminalInput').on('keydown', function(e){
		if(e.which === 13){
			var val = _.escape($(this).val());
			$(this).val('');
			$('#terminalOutput').append('\n'+'&gt; '+val+'\n');
			socket.emit('terminalInput', { input: val });
			history.push(val);
			historyPointer = history.length;
		}else if(e.which === 38){
			e.preventDefault();
			if(historyPointer > 0){
				historyPointer--;
			}
			$(this).val(history[historyPointer]);
		}else if(e.which === 40){
			e.preventDefault();
			if(historyPointer < history.length-1){
				historyPointer++;
			}
			$(this).val(history[historyPointer]);
		}
	}).focus();
	$('#terminalContainer').on('click', function(){
		$('#terminalInput').focus();
	});

	socket.on('connect', function () {
		$('#loaderContainer').css({
			display: 'none',
			visibility: 'hidden'
		});
	});

	socket.on('terminalOutput', function (data) {
		$('#terminalOutput').append(data.output);
	});

	socket.on('command', function (data){
		switch(data){
			case "clear": 
				(function(){
					$('#terminalOutput').html('');
				})();
				break;
		}
	});

})(jQuery);