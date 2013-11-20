define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/wine/WineListTemplate.html'
], function($, _, Backbone,WineListTemplate){

  var WineListView = Backbone.View.extend({
      tagName: 'ul',
      className : 'nav nav-list',

      initialize: function(options) {
        this.collection = this.options.collection;
        this.collection.bind('all', this.render,this);
        this.template = _.template(WineListTemplate);
      },

      render:function (e) {
        var     el = this.$el,
          template = this.template;
        
        $(".span4 ul").empty();

        this.collection.each(function(wine){
            el.append(template(wine.toJSON()));
        });

        el.append('<li><a href="#add">add new wine</a></li>');
        
        return this;
      }
  });

  return WineListView;
  
});