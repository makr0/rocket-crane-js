
var craneModels = {
	'basic': {
		maxrotation:100,
		damping:0.1,
		hoverThrust:4700,
        brakeThrust:5500,
        vertices: [ -10,5,-10,0,-15,-5,-10,-20,10,-20,15,-5,10,0,10,5,25,5,30,0,40,10,45,10,35,20,35,15,30,10,25,15,10,15,5,18,-5,18,-9.7227183,15,-25,15,-30,10,-35,15,-35,20,-45,10,-40,10,-30,0,-25,5]
	}
}
var craneControls  = {
    thrust:0,
    rotation:0,
    thrustStep:20,
    rotationStep:10
}

function makeCrane( model ) {
    var PTM = 20;
    var crane = {
    	body: new Phaser.Physics.Box2D.Body(this.game, null, 0, -10*PTM),
    	attrs: craneModels[model],
    	control: craneControls,
    	autoLevel: function(soll){ autoLevel(crane.body,soll) },
    	hasAttaced:false
    }

    // Make the crane body
    crane.body.setPolygon(craneModels[model].vertices);
    // add chain to magnet
    var chain_end=addChain(crane.body,4); // first body,length, returns last chain link

    // add the magnet at the end
    crane.magnet=addMagnet(chain_end);
    return crane;
}

function autoLevel(body2d,zielwinkel) {
    var P=250;
    var I=2;
    var D=-25;
    var K = zielwinkel + ((body2d.rotation)*P + (body2d.angularVelocity*D));
    body2d.rotateLeft(K);
}

function addMagnet(chainEnd) {
	magnet = game.add.sprite(chainEnd.x, chainEnd.y+10, 'magnet',1);
    game.physics.box2d.enable(magnet,false);
    game.physics.box2d.revoluteJoint(chainEnd, magnet, 0, 10, 0, -10);
    magnet.body.angularDamping=10;
    magnet.body.linearDamping=1;
    magnet.body.mass = 2;
	return magnet;
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
        newRect.body.angularDamping=5;
        newRect.body.linearDamping=1;

        newRect.body.velocity.y = 400;
        newRect.body.mass = 0.5; // make bodies toward the end of the chain lighter to improve stability

        //  After the first rectangle is created we can add the constraint
        if (i==0)
        {
            game.physics.box2d.revoluteJoint(lastRect, newRect, 0, 20, 0, -10);
        } else {
            game.physics.box2d.revoluteJoint(lastRect, newRect, 0, 10, 0, -10);

        }

        lastRect = newRect;
    }
    return lastRect;

}