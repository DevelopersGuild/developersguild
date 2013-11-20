define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/home/HomeTemplate.html',
  'views/wine/WineListView'
], function($, _, Backbone,HomeTemplate, WineListView){

  var HomeView = Backbone.View.extend({        
      el: 'body',

      initialize: function(options) {
          this.collection = this.options.collection;
      },

      render: function() {
        var el = this.$el;

        el.empty();
        el.append(HomeTemplate);

        var listView = new WineListView({collection: this.collection});
        $('.span4').append(listView.render().el);

        return this;
      }
  });

  return HomeView;
  
});