
var game = new Phaser.Game(800, 800, Phaser.CANVAS, 'phaser-example', { create: create, update: update, render: render, preload: preload });

var groundVertices = [-250,-200,-200,0,1200,0,1250,-200];

var craneVertices = [ -10,5,-10,0,-15,-5,-10,-20,10,-20,15,-5,10,0,10,5,25,5,30,0,40,10,45,10,35,20,35,15,30,10,25,15,10,15,5,18,-5,18,-9.7227183,15,-25,15,-30,10,-35,15,-35,20,-45,10,-40,10,-30,0,-25,5];

var craneBody,blockSprite;
var craneAttrs = {
    hoverThrust:6200,
    brakeThrust:4000
}
var cranecontrol={
    thrust:craneAttrs.hoverThrust,
    rotation:0,
    thrustStep:20,
    rotationStep:10
}

function preload() {
    game.load.image('block', 'assets/sprites/block.png');
    game.load.spritesheet('chain', 'assets/sprites/chain.png', 16, 26);
}

function create() {

    game.world.setBounds(-30000, -3000, 120000, 20000);

    game.stage.backgroundColor = '#124184';

    // Enable Box2D physics
    game.physics.startSystem(Phaser.Physics.BOX2D);
    game.physics.box2d.gravity.y = 500;
    game.physics.box2d.friction = 1.5;
    game.physics.box2d.debugDraw.joints = true;
//    game.physics.box2d.setBoundsToWorld();

    // Make the ground body
    var groundBody = new Phaser.Physics.Box2D.Body(this.game, null, 0, 0, 0);
    groundBody.setChain(groundVertices);

    var PTM = 20;

    // Make the crane body
    craneBody = new Phaser.Physics.Box2D.Body(this.game, null, 0, -10*PTM);
    craneBody.setPolygon(craneVertices);
    addChain(craneBody,10); // first body,length


    cursors = game.input.keyboard.createCursorKeys();

    game.input.onDown.add(mouseDragStart, this);
    game.input.addMoveCallback(mouseDragMove, this);
    game.input.onUp.add(mouseDragEnd, this);
    bindHotkeys()

    addBox();
    game.camera.follow(craneBody);
    //caption1 = game.add.text(5, 25, 'dR: -', { fill: '#ffffff', font: '14pt Arial' });
    //caption2 = game.add.text(5, 45, 'dT: -', { fill: '#ffffff', font: '14pt Arial' });
    //caption3 = game.add.text(5, 65, 'r: -', { fill: '#ffffff', font: '14pt Arial' });
    //caption1.fixedToCamera = true;
    //caption2.fixedToCamera = true;
    //caption3.fixedToCamera = true;
}
function bindHotkeys() {
    game.input.keyboard.addKey(Phaser.Keyboard.ZERO).onDown.add(function(){cranecontrol.thrust=0});
    game.input.keyboard.addKey(Phaser.Keyboard.ONE).onDown.add(function(){cranecontrol.thrust=craneAttrs.hoverThrust});
    game.input.keyboard.addKey(Phaser.Keyboard.TWO).onDown.add(function(){cranecontrol.thrust=craneAttrs.brakeThrust});
}

function addBox() {
    blockSprite = game.add.sprite(550, -100, 'block');
    game.physics.box2d.enable(blockSprite);
    blockSprite.body.angle = 30;
}

function addChain(firstRect,length) {

    var xAnchor = firstRect.x;
    var yAnchor = firstRect.y;

    var lastRect=firstRect;  //if we created our first rect this will contain it
    var height = 20;  //height for the physics body - your image height is 8px
    var maxForce =20000;  //the force that holds the rectangles together

    for (var i = 0; i <= length; i++)
    {
        var x = xAnchor;
        var y = yAnchor + (i * height);

        // Switch sprite every second time
        if (i % 2 == 0)
        {
            newRect = game.add.sprite(x, y, 'chain',1);
        }
        else
        {
            newRect = game.add.sprite(x, y, 'chain',0);
            lastRect.bringToTop();
        }

        game.physics.box2d.enable(newRect,false);
        newRect.body.angularDamping=20;

        newRect.body.velocity.x = 4;
        newRect.body.mass = 1; // make bodies toward the end of the chain lighter to improve stability

        //  After the first rectangle is created we can add the constraint
        if (i==0)
        {
            game.physics.box2d.revoluteJoint(lastRect, newRect, 0, 20, 0, -10);
        } else {
            game.physics.box2d.revoluteJoint(lastRect, newRect, 0, 10, 0, -10);

        }

        lastRect = newRect;
    }

}


function update() {
    if (cursors.up.isDown) {
        cranecontrol.thrust+=cranecontrol.thrustStep;
    }
    if (cursors.down.isDown) {
        cranecontrol.thrust-=cranecontrol.thrustStep;
    }
    if( !cursors.down.isDown && !cursors.up.isDown &&
         cranecontrol.thrust < cranecontrol.thrustStep*2 && cranecontrol.thrustStep *2 ) {
        cranecontrol.thrust = 0;
    }


    if (cursors.left.isDown) {
        cranecontrol.rotation+=cranecontrol.rotationStep;
    }
    if (cursors.right.isDown) {
        cranecontrol.rotation -= cranecontrol.rotationStep;
    }
    if( craneBody.rotation > 0.5 ||craneBody.rotation < -0.5 ) cranecontrol.rotation=0;

    if( !cursors.left.isDown && !cursors.right.isDown ) {
        cranecontrol.rotation=0;
        autoLevel(craneBody);
    } else {
        craneBody.rotateLeft(cranecontrol.rotation);
    }

    craneBody.thrust(cranecontrol.thrust);
    //caption1.text ='dR: '+cranecontrol.rotation;
    //caption2.text ='T: '+cranecontrol.thrust;
    //caption3.text ='R: '+craneBody.rotation;
}

function autoLevel(body2d) {
    var P=250;
    var I=2;
    var D=-25;
    var K = (body2d.rotation)*P + (body2d.angularVelocity*D);
    body2d.rotateLeft(K);

}

function render() {
    game.debug.box2dWorld();
}
function mouseDragStart() {
    game.camera.unfollow();
    game.physics.box2d.mouseDragStart({x:game.input.mousePointer.worldX,
                                    y:game.input.mousePointer.worldY});
}
function mouseDragMove() {
  game.physics.box2d.mouseDragMove({x:game.input.mousePointer.worldX,
                                    y:game.input.mousePointer.worldY});
}
function mouseDragEnd() {
    game.physics.box2d.mouseDragEnd();
    game.camera.follow(craneBody);
}
