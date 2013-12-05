(function($){

	var socket = io.connect('http://'+window.location.hostname+':33841')
	  , history = []
	  , historyPointer = 0;

	socket.emit('header', {
		  type: 'terminal'
		, device: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
	});

	$('#terminalInput').on('keydown', function(e){
		if(e.which === 13){
			e.preventDefault();
			var val = _.escape($(this).val());
			$(this).val('');
			$('#terminalOutput').append('\n'+'&gt; '+val+'');
			socket.emit('terminalInput', { input: val });
			history.push($(document.createElement('div')).html(val).text());
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