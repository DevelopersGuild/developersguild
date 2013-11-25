(function($){
	$('#terminalInput').on('keydown', function(e){
		if(e.which === 13){
			var val = _.escape($(this).val());
			$(this).val('');
			$('#terminalOutput').append('\n'+'&gt; '+val);
			$('#terminalOutput').append('\n/bin/sh: command not found: '+val);
		}	
	}).focus();
	$('#terminalContainer').on('click', function(){
		$('#terminalInput').focus();
	});
})(jQuery);