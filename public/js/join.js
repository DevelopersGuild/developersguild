(function($){

	var socket = io.connect('http://'+window.location.host, {
          'force new connection': true
	  })
	  , history = []
	  , historyPointer = 0;

	socket.emit('header', {
		  type: 'terminal',
		  init: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 400 ? 'motd -m' : 'motd -d'
	});

	//alert(window.innerWidth);

	var terminal = (function(){
		return {
			prompt: ''
		  , clear: function(){
				$('#terminalOutput').html('');
			}
		  , setPrompt: function(prompt){
		  		terminal.prompt = prompt;
		  		$('#terminalPrompt').html(prompt);
		  		windowResize();
		    }
		}
	})();

	$('#terminalInput').on('keydown', function(e){
		if(e.which === 13){
			e.preventDefault();
			var val = _.escape($(this).val());
			$(this).val('');
			$('#terminalOutput').append(terminal.prompt+val+'\n');
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

	socket.on('terminalOutput', function (data) {

		//var terminator = data.substr()

		//console.log(data.output);

		$('#terminalOutput').append(data.output);
		$('#terminalOutput').scrollTop($('#terminalOutput')[0].scrollHeight);
		//$('html, body').scrollTop($(document).height()-$(window).height());
	});
	socket.on('connect', function(){
	});
	
	socket.on('command', function (data){
		data = data.split(' ');
		//console.log(data);
		if(typeof terminal[data[0]] === 'function'){
			terminal[data[0]](data[1] ? data[1] : null, data[2] ? data[2] : null);
		}
	});

	function windowResize(){
		if(window.innerWidth < 400){
			$("#terminalInput").width(window.innerWidth - $("#terminalPrompt").width() - 30);
			$("#terminal").css('max-width', window.innerWidth);
			$("#terminalOutput").css('max-width', window.innerWidth);
		}else{
			$("#terminalInput").width(370 - $("#terminalPrompt").width());
			$("#terminal").css('max-width', 700);
			$("#terminalOutput").css('max-width', 700);
		}
		
	};
	windowResize();

	$(window).on('resize', function(){
		windowResize();
	});


})(jQuery);