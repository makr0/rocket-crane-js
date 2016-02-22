window.onload = function() {
     game = new Phaser.Game(800, 800, Phaser.AUTO, "");
     game.state.add("Main", main);
     level=0;
     game.state.start("Main");
}

