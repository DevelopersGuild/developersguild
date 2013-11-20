// Filename: router.js
define([
  'jquery',
  'underscore',
  'backbone',
  'views/home/HomeView',
  'views/wine/WineAddView',
  'collections/wine/WineCollection'
], function($, _,Backbone, HomeView, WineAddView, WineCollection) {
  
  AppRouter = Backbone.Router.extend({

    initialize: function(options) {
      this.collection = options.collection;
    },

    routes:{
        "":"home",
        "add":"add",
        "update/:id":"update",
    },
    home:function(e) {
      var homeView = new HomeView({collection: this.collection}).render();
    },

    add:function(e) {
      var addView = new WineAddView({collection: this.collection}).render();
    },

    update:function(e) {
      console.log('get selected item');
      /*
      model = wines.get(e);
      new UpdateView({model: model});
      */
    }
  });
  
  var initialize = function(){
    var wineCollection = new WineCollection();
    var app_router = new AppRouter({collection: wineCollection});

    Backbone.history.start();
  };
  return { 
    initialize: initialize
  };
});