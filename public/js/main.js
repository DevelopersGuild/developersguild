require.config({
  baseUrl: "/js/",
  paths: {
    jquery: 'libs/jquery/jquery-1.8.2',
    underscore: 'libs/underscore/underscore-1.4.4',
    backbone: 'libs/backbone/backbone-1.0.0-min',
    templates: '../templates',
    app: 'app'
  },

  shim: {
    underscore: {
      exports: '_'
    },
    backbone: {
      deps: ["underscore", "jquery"],
      exports: "Backbone"
    }
  }
});

require([
  'jquery',
  'app'
], function( $, App ){

    $(function(){
      App.initialize();
    });
});
