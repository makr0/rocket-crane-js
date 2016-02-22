var main = function(game) {
};
main.prototype = {
    preload: function() {
        game.load.image('block', 'assets/sprites/block.png');
        game.load.spritesheet('chain', 'assets/sprites/chain.png', 16, 26);
        game.load.spritesheet('magnet', 'assets/sprites/tinycar.png', 14, 16);
        game.load.image('cursor', 'assets/sprites/enemy-bullet.png');
    },
    create: function() {
        game.world.setBounds(-30000, -3000, 120000, 20000);

        game.stage.backgroundColor = '#124184';
        this.gui = new guiDisplay(game);

        // Enable p2 physics
        game.physics.startSystem(Phaser.Physics.P2JS);
        game.physics.p2.gravity.y = 0;
        game.physics.p2.friction = 1;

        // Make the ground body
        var groundBody = new Phaser.Physics.P2.Body(this.game, null, 0, 0, 0);
        groundBody.addShape(new p2.Heightfield(levels[level].ground));
        groundBody.debug=true;
        groundBody.data.motionState = p2.Body.STATIC;
        groundBody.addToWorld();

        this.boxes = [this.addBox(0,-100),this.addBox(200,-100)];
//        this.crane = new crane('basic',50,-300);
//        this.crane.setContacts(this.boxes)
//        this.crane.setHUD(this.gui.hud);
//
        this.mouseBody = game.add.sprite(0, 0, 'cursor');
        game.physics.p2.enable(this.mouseBody, true);
        this.mouseBody.body.static = true;
        this.mouseBody.body.setCircle(10);
        this.mouseBody.body.data.shapes[0].sensor = true;
        game.input.onDown.add(this.mouseDragStart, this);
        game.input.addMoveCallback(this.mouseDragMove, this);
        game.input.onUp.add(this.mouseDragEnd, this);
//
//        game.camera.follow(this.crane.body);
        game.camera.follow(this.boxes[0].body);
        this.caption1 = game.add.text(5, 25, 'contact: -', { fill: '#ffffff', font: '14pt Arial' });
        this.caption2 = game.add.text(5, 45, 'T: -', { fill: '#ffffff', font: '14pt Arial' });
        // this.caption3 = game.add.text(5, 65, 'r: -', { fill: '#ffffff', font: '14pt Arial' });
        this.caption1.fixedToCamera = true;
        this.caption2.fixedToCamera = true;
        // this.caption3.fixedToCamera = true;
    },

    addBox: function(x,y) {
        var blockSprite = game.add.sprite(x,y, 'block');
        game.physics.p2.enable(blockSprite);
        blockSprite.body.angle = 33;
        blockSprite.body.damping=0.4;
        blockSprite.body.debug=true;
        return blockSprite;
    },

    update: function() {

//        this.crane.loop();

        //this.caption1.text ='dR: '+crane.controls.rotation;
        //this.caption2.text ='T: '+this.crane.controls.thrust;
        //this.caption3.text ='R: '+crane.body.rotation;
    },
    render: function() {
        //game.debug.p2World();
        //this.crane.debugRender();
        if (this.dragLine)
        {
            game.debug.geom(this.dragLine);
        }
    },
    mouseDragStart: function(pointer) {
        game.camera.unfollow();
        var worldPointer = {x:pointer.worldX,y:pointer.worldY};
        var bodies = game.physics.p2.hitTest(worldPointer);

        for(var i=0;i<bodies.length;i++) {
            //  Attach to the first body the mouse hit if not mousebody
            if(bodies[i].parent.sprite && this.mouseBody==bodies[i].parent.sprite) continue;
            this.draggingBody=bodies[i];
            this.mouseSpring = game.physics.p2.createSpring(this.mouseBody,this.draggingBody , 1, 30, 1,null,[worldPointer.x,worldPointer.y]);
            this.dragLine = new Phaser.Line(this.draggingBody.parent.x, this.draggingBody.parent.y, this.mouseBody.x, this.mouseBody.y);
            return;
        }
    },
    mouseDragMove: function(pointer, x, y, isDown) {
        x=game.input.mousePointer.worldX;y=game.input.mousePointer.worldY;
        this.mouseBody.body.x = x;
        this.mouseBody.body.y = y;
        if(this.dragLine) this.dragLine.setTo(this.draggingBody.parent.x, this.draggingBody.parent.y, this.mouseBody.x, this.mouseBody.y);
    },
    mouseDragEnd: function() {
        //game.camera.follow(this.crane.body);
        game.physics.p2.removeSpring(this.mouseSpring);
        this.dragLine = false;
    },
    preRender: function() {
        if (this.dragLine)
        {
            this.dragLine.setTo(this.draggingBody.parent.x, this.draggingBody.parent.y, this.mouseBody.x, this.mouseBody.y);
        }
    }
}


