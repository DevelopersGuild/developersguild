define([
  'backbone',
  'models/wine/Model'
], function(Backbone,Model){

	var  WineCollection = Backbone.Collection.extend({
    	Model: Model,
    	url: '#'
    });

  return WineCollection;

});