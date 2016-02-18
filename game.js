
var game = new Phaser.Game(800, 800, Phaser.CANVAS, 'phaser-example', { create: create, update: update, render: render, preload: preload });

var groundVertices = [-250,-200,-200,0,1200,0,1250,-200];

var crane,blockSprite,attachLoad,line, box;

function preload() {
    game.load.image('block', 'assets/sprites/block.png');
    game.load.spritesheet('chain', 'assets/sprites/chain.png', 16, 26);
    game.load.spritesheet('magnet', 'assets/sprites/tinycar.png', 14, 16);
}

function create() {

    game.world.setBounds(-30000, -3000, 120000, 20000);

    game.stage.backgroundColor = '#124184';

    // Enable Box2D physics
    game.physics.startSystem(Phaser.Physics.BOX2D);
    game.physics.box2d.gravity.y = 500;
    game.physics.box2d.friction = 0.5;
    game.physics.box2d.debugDraw.joints = true;
//    game.physics.box2d.setBoundsToWorld();

    // Make the ground body
    var groundBody = new Phaser.Physics.Box2D.Body(this.game, null, 0, 0, 0);
    groundBody.setChain(groundVertices);

    crane = makeCrane('basic',50,-300);
    crane.control.thrust=crane.attrs.hoverThrust;

    cursors = game.input.keyboard.createCursorKeys();

    game.input.onDown.add(mouseDragStart, this);
    game.input.addMoveCallback(mouseDragMove, this);
    game.input.onUp.add(mouseDragEnd, this);
    bindHotkeys()

    box = addBox();
    crane.magnet.body.setBodyContactCallback(box, contactCallback, this);
    crane.magnet.body.setCategoryPostsolveCallback(0x8000, postsolveCallback, this);

    game.camera.follow(crane.body);
    caption1 = game.add.text(5, 25, 'contact: -', { fill: '#ffffff', font: '14pt Arial' });
    caption2 = game.add.text(5, 45, 'T: -', { fill: '#ffffff', font: '14pt Arial' });
//    caption3 = game.add.text(5, 65, 'r: -', { fill: '#ffffff', font: '14pt Arial' });
    caption1.fixedToCamera = true;
    caption2.fixedToCamera = true;
//    caption3.fixedToCamera = true;
}
function bindHotkeys() {
    game.input.keyboard.addKey(Phaser.Keyboard.ZERO).onDown.add(function(){crane.control.thrust=0});
    game.input.keyboard.addKey(Phaser.Keyboard.ONE).onDown.add(function(){crane.control.thrust=crane.attrs.hoverThrust});
    game.input.keyboard.addKey(Phaser.Keyboard.TWO).onDown.add(function(){crane.control.thrust=crane.attrs.brakeThrust});
}

function addBox() {
    blockSprite = game.add.sprite(100, -100, 'block');
    game.physics.box2d.enable(blockSprite);
    blockSprite.body.angle = 33;
    return blockSprite;
}

function update() {
    if(attachLoad) {
        line = new Phaser.Line(attachLoad.p1.x,attachLoad.p1.y,attachLoad.p2.x,attachLoad.p2.y);
        var offset1={x:attachLoad.p1.x,
                     y:attachLoad.p1.y},
            offset2={x:attachLoad.p2.x,
                     y:attachLoad.p2.y};
        crane.currentloadJoint=game.physics.box2d.ropeJoint(
            attachLoad.body1, attachLoad.body2,
            line.length
        );
        attachLoad=false;
        crane.hasAttached=true;
        console.log(offset1,offset2);
    }
    if (cursors.up.isDown) {
        crane.control.thrust+=crane.control.thrustStep;
    }
    if (cursors.down.isDown) {
        crane.control.thrust-=crane.control.thrustStep;
    }
    if( !cursors.down.isDown && !cursors.up.isDown &&
         crane.control.thrust < crane.control.thrustStep*2 && crane.control.thrustStep *2 ) {
        crane.control.thrust = 0;
    }


    if (cursors.left.isDown) {
        crane.control.rotation+=crane.control.rotationStep;
    }
    if (cursors.right.isDown) {
        crane.control.rotation -= crane.control.rotationStep;
    }
    if( crane.control.rotation > crane.attrs.maxrotation  ) {
      crane.control.rotation = crane.attrs.maxrotation;
    }
    if( crane.control.rotation < -crane.attrs.maxrotation  ) {
      crane.control.rotation = -crane.attrs.maxrotation;
    }

    if( !cursors.left.isDown && !cursors.right.isDown ) {
      crane.control.rotation=0;
    }

    crane.autoLevel(crane.control.rotation);
    crane.body.thrust(crane.control.thrust);
    //caption1.text ='dR: '+crane.control.rotation;
    caption2.text ='T: '+crane.control.thrust;
    //caption3.text ='R: '+crane.body.rotation;
}
function contactCallback(body1, body2, fixture1, fixture2, begin) {
    //if(crane.hasAttached) return;
    // This callback is also called for EndContact events, which we are not interested in.
    if (!begin) return;
//    var p1 = fixture1.GetBody().GetContactList().contact.GetManifold().points[1].localPoint;
//    var p2 = fixture2.GetBody().GetContactList().contact.GetManifold().points[1].localPoint;
    var t1 = fixture1.GetBody().GetContactList().contact.GetManifold().points[0].localPoint;
    var t2 = fixture2.GetBody().GetContactList().contact.GetManifold().points[0].localPoint;
    var p1 = body1.toWorldPoint( {x:0,y:0}, t1 );
    var p2 = body2.toWorldPoint( {x:0,y:0}, t2 );

    attachLoad={body1:body1,body2:body2,p1:p1,p2:p2};
}
function postsolveCallback(body1, body2, fixture1, fixture2, contact, impulseInfo) {
    console.log(body1, body2, fixture1, fixture2, contact, impulseInfo);
}
function render() {
    game.debug.box2dWorld();
    game.debug.context.strokeStyle = 'rgba(255,255,255,0.25)';
    game.debug.geom(line);
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
    game.camera.follow(crane.body);
}
