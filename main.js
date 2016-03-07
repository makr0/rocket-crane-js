var main = function(game) {
};
main.prototype = {
    preload: function() {
        game.load.image('block', 'assets/sprites/block.png');
        game.load.spritesheet('chain', 'assets/sprites/chain.png', 16, 26);
        game.load.spritesheet('magnet', 'assets/sprites/tinycar.png', 14, 16);
    },
    create: function() {
        game.world.setBounds(-30000, -3000, 120000, 20000);

        game.stage.backgroundColor = '#124184';
        this.gui = new guiDisplay(game);

        // Enable Box2D physics
        game.physics.startSystem(Phaser.Physics.BOX2D);
        game.physics.box2d.gravity.y = 500;
        game.physics.box2d.friction = 0.5;
        game.physics.box2d.debugDraw.joints = false;

        // Make the ground body
        var groundBody = new Phaser.Physics.Box2D.Body(this.game, null, 0, 0, 0);
        groundBody.setChain(levels[level].ground);

        this.boxes = [this.addBox(0,-100),this.addBox(300,-100)];
        this.crane = new crane('basic',50,-300);
        this.crane.setContacts(this.boxes)
        this.crane.setHUD(this.gui.hud);

        game.input.onDown.add(this.mouseDragStart, this);
        game.input.addMoveCallback(this.mouseDragMove, this);
        game.input.onUp.add(this.mouseDragEnd, this);

        game.camera.follow(this.crane.body);
        this.caption1 = game.add.text(5, 25, 'contact: -', { fill: '#ffffff', font: '14pt Arial' });
        this.caption2 = game.add.text(5, 45, 'T: -', { fill: '#ffffff', font: '14pt Arial' });
        // this.caption3 = game.add.text(5, 65, 'r: -', { fill: '#ffffff', font: '14pt Arial' });
        this.caption1.fixedToCamera = true;
        this.caption2.fixedToCamera = true;
        // this.caption3.fixedToCamera = true;
    },

    addBox: function(x,y) {
        var blockSprite = game.add.sprite(x,y, 'block');
        game.physics.box2d.enable(blockSprite);
        blockSprite.body.angle = -180;
        return blockSprite;
    },

    update: function() {

        this.crane.loop();

        //this.caption1.text ='dR: '+crane.controls.rotation;
        this.caption2.text ='T: '+this.crane.controls.thrust;
        //this.caption3.text ='R: '+crane.body.rotation;
    },
    render: function() {
        game.debug.box2dWorld();
        this.crane.debugRender();
    },
    mouseDragStart: function() {
        game.camera.unfollow();
        game.physics.box2d.mouseDragStart({x:game.input.mousePointer.worldX,
                                        y:game.input.mousePointer.worldY});
    },
    mouseDragMove: function() {
      game.physics.box2d.mouseDragMove({x:game.input.mousePointer.worldX,
                                        y:game.input.mousePointer.worldY});
    },
    mouseDragEnd: function() {
        game.physics.box2d.mouseDragEnd();
        game.camera.follow(this.crane.body);
    }
}


