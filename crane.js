
var craneModels = {
    'basic': {
        maxrotation:100,
        maxthrust:10000,
        damping:0.1,
        hoverThrust:4200,
        brakeThrust:5500,
        vertices: [ -10,5,-10,0,-15,-5,-10,-20,10,-20,15,-5,10,0,10,5,25,5,30,0,40,10,45,10,35,20,35,15,30,10,25,15,10,15,5,18,-5,18,-9.7227183,15,-25,15,-30,10,-35,15,-35,20,-45,10,-40,10,-30,0,-25,5]
    }
}

var crane = function(model,x,y) {
    this.controls = {
        thrust:0,
        rotation:0,
        thrustStep:20,
        rotationStep:10
    };
    this.attachData = false;
    this.attrs = craneModels[model];
    this.hasAttached = false;
    this.releaseNext = false;
    this.attachNext  = false;
    this.debugGeom = [];
    this.cursors = game.input.keyboard.createCursorKeys();

    this.body  = new Phaser.Physics.Box2D.Body(game, null, x,y);
    this.body.setPolygon(craneModels[model].vertices);
    // add chain to crane
    var chain_end=this.addChain(this.body,4); // first body,length, returns last chain link
    // add the magnet at the end
    this.addMagnet(chain_end);

    // set initial thrust
    this.controls.thrust = this.attrs.hoverThrust;
    this.bindHotkeys();
    return this;
}
crane.prototype = {
    loop:function() {
        if (this.cursors.up.isDown)   this.controls.thrust+=this.controls.thrustStep;
        if (this.cursors.down.isDown) this.controls.thrust-=this.controls.thrustStep;
        if( !this.cursors.down.isDown && !this.cursors.up.isDown &&
             this.controls.thrust < this.controls.thrustStep*2 )
        {
            this.controls.thrust = 0;
        }
        if( this.controls.thrust > this.attrs.maxthrust )
        {
            this.controls.thrust = this.attrs.maxthrust;
        }


        if (this.cursors.left.isDown) this.controls.rotation+=this.controls.rotationStep;
        if (this.cursors.right.isDown) this.controls.rotation -= this.controls.rotationStep;
        if( this.controls.rotation >  this.attrs.maxrotation  ) this.controls.rotation =  this.attrs.maxrotation;
        if( this.controls.rotation < -this.attrs.maxrotation  ) this.controls.rotation = -this.attrs.maxrotation;

        if( !this.cursors.left.isDown && !this.cursors.right.isDown ) this.controls.rotation=0;

        this.autoLevel(this.controls.rotation);
        this.body.thrust(this.controls.thrust);
        if( this.attachNext  ) { this.attachLoad();  this.attachNext  = false; }
        if( this.releaseNext ) { this.releaseLoad(); this.releaseNext = false; }
    },
    autoLevel:function(zielwinkel) {
        if(this.controls.thrust==0) return;
        var P=100;
        var I=2;
        var D=-25;
        var K = zielwinkel + ((this.body.rotation)*P + (this.body.angularVelocity*D));
        this.body.rotateLeft(K);
    },
    bindHotkeys: function() {
        var crane = this;
        game.input.keyboard.addKey(Phaser.Keyboard.ZERO).onDown.add(function(){ crane.controls.thrust=0; });
        game.input.keyboard.addKey(Phaser.Keyboard.ONE ).onDown.add(function(){ crane.controls.thrust=crane.attrs.hoverThrust; });
        game.input.keyboard.addKey(Phaser.Keyboard.TWO ).onDown.add(function(){ crane.controls.thrust=crane.attrs.brakeThrust; });
        game.input.keyboard.addKey(Phaser.Keyboard.X   ).onDown.add(function(){ crane.releaseNext=true; });
    },
    setContacts: function( objects ){
        for(i=0;i<objects.length;i++) {
            this.magnet.body.setFixtureContactCallback(   objects[i].body, this.contactCallback,   this );
            this.magnet.body.setFixturePostsolveCallback( objects[i].body, this.PostsolveCallback, this );
        }
    },
    setHUD: function(graphics) {
        this.hud=graphics;
    },
    debugRender:function(){
        if(this.debugGeom.length) {
            for(i=0;i<this.debugGeom.length;i++) {
                game.debug.geom(this.debugGeom[i])
            }
        }
    },
    PostsolveCallback: function(contact,impulse) {
        if(this.hasAttached) return;
        //this.debugGeom.push( new Phaser.Circle(contact.x,contact.y,10) );
    },
    contactCallback: function(body1, body2, fixture1, fixture2, begin, contact) {
        if(this.hasAttached) return;
        this.debugGeom=[];

        // This callback is also called for EndContact events, which we are not interested in.
        if (!begin) return;
        this.attachNext=true;
        this.attachData={body1:body1,body2:body2};
        var manifold = contact.GetManifold();
        var worldManifold = new box2d.b2WorldManifold();
        var p,debugScale=95;
        contact.GetWorldManifold(worldManifold);
        this.debugGeom.push(new Phaser.Rectangle(0,-debugScale,debugScale,debugScale) );
        for (var i = 0; i < manifold.pointCount;i++) {
            p=worldManifold.points[i]
            this.debugGeom.push(new Phaser.Circle(-p.x*debugScale,-p.y*debugScale,10) );
        }
    },
    attachLoad: function(){
        if(this.hasAttached) return;
        var data = this.attachData;
        this.currentloadJoint = game.physics.box2d.ropeJoint(
            data.body1, data.body2
        );
        this.hasAttached = true;
        newRect.body.angularDamping=5;
        newRect.body.linearDamping=1;
    },
    releaseLoad: function(){
        this.controls.thrust = this.attrs.hoverThrust;
        game.physics.box2d.world.DestroyJoint(this.currentloadJoint);
        this.hasAttached=false;
    },

    addMagnet:function(chainEnd) {
        //var magnet = game.add.sprite(chainEnd.x, chainEnd.y+10, 'magnet',1);
        var magnet = {body: new Phaser.Physics.Box2D.Body(game, null, chainEnd.x, chainEnd.y+10, 0.5) };
        magnet.body.setRectangle(40, 20, 0, 0, 0);

        game.physics.box2d.enable(magnet,false);
        game.physics.box2d.revoluteJoint(chainEnd, magnet, 0, 10, 0, -10);
        magnet.body.angularDamping=10;
        magnet.body.linearDamping=1;
        magnet.body.mass = 2;
        this.magnet = magnet;
    },
    addChain: function(firstRect,length) {

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
}
