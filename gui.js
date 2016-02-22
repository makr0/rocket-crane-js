var guiDisplay = function(game){
	this.hud = game.add.graphics(0, 0);
	this.hud.beginFill(0xFF0000, 1);
	this.hud.drawCircle(0  , 0, 50);
	this.hud.fixedToCamera=true;
}
