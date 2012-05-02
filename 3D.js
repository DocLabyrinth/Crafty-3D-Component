/*
	slightly modified tQuery loop class from https://raw.github.com/jeromeetienne/tquery,
	removed references to external tQuery object so the loop class is stand-alone
*/
var tQueryLoop	= function(world)
{	
	// internally if world present do that
	this._world	= world;
	this._hooks	= [];
	this._lastTime	= null;

	// if world is available, hook it ON_RENDER
	this._world && this.hookOnRender(function(){
		this._world.render();
	}.bind(this));
};
tQueryLoop.prototype.destroy	= function()
{
	this.stop();
	if( tQuery.loop === this )	tQuery.loop = null;
}
tQueryLoop.prototype.start	= function()
{
	if( this._timerId )	this.stop();
	this._timerId	= requestAnimationFrame( this._onAnimationFrame.bind(this) );
	// for chained API
	return this;
}
tQueryLoop.prototype.stop	= function()
{
	cancelAnimationFrame(this._timerId);
	this._timerId	= null;
	// for chained API
	return this;
}

tQueryLoop.prototype._onAnimationFrame	= function(time)
{
	// loop on request animation loop
	// - it has to be at the begining of the function
	// - see details at http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
	this._timerId	= requestAnimationFrame( this._onAnimationFrame.bind(this) );

	// update time values
	var currentTime	= time/1000;
	if( !this._lastTime )	this._lastTime = currentTime - 1/60;
	var deltaTime	= currentTime - this._lastTime;
	this._lastTime	= currentTime;

	// run all the hooks - from lower priority to higher - in order of registration
	for(var priority = 0; priority <= this._hooks.length; priority++){
		if( this._hooks[priority] === undefined )	continue;
		var callbacks	= this._hooks[priority].slice(0)
		for(var i = 0; i < callbacks.length; i++){
			// TODO ? change that to {delta, current} ?
			// thus function(time){ time.current }
			callbacks[i](deltaTime, currentTime);
		}
	}
}
tQueryLoop.prototype.PRE_RENDER		= 20;
tQueryLoop.prototype.ON_RENDER		= 50;
tQueryLoop.prototype.POST_RENDER	= 80;

tQueryLoop.prototype.hook	= function(priority, callback)
{
	// handle parameters
	if( typeof priority === 'function' ){
		callback	= priority;
		priority	= this.PRE_RENDER;
	}

	this._hooks[priority]	= this._hooks[priority] || [];
	console.assert(this._hooks[priority].indexOf(callback) === -1)
	this._hooks[priority].push(callback);
	// for chained API
	return this;
}

tQueryLoop.prototype.unhook	= function(priority, callback)
{
	// handle parameters
	if( typeof priority === 'function' ){
		callback	= priority;
		priority	= this.PRE_RENDER;
	}

	var index	= this._hooks[priority].indexOf(callback);
	console.assert(index !== -1);
	this._hooks[priority].splice(index, 1);
	this._hooks[priority].length === 0 && delete this._hooks[priority]
	// for chained API
	return this;
}

tQueryLoop.prototype.hookPreRender	= function(callback){ return this.hook(this.PRE_RENDER, callback);	};
tQueryLoop.prototype.hookOnRender	= function(callback){ return this.hook(this.ON_RENDER, callback);	};
tQueryLoop.prototype.hookPostRender	= function(callback){ return this.hook(this.POST_RENDER, callback);	};
tQueryLoop.prototype.unhookPreRender	= function(callback){ return this.unhook(this.PRE_RENDER, callback);	};
tQueryLoop.prototype.unhookOnRender	= function(callback){ return this.unhook(this.ON_RENDER, callback);	};
tQueryLoop.prototype.unhookPostRender	= function(callback){ return this.unhook(this.POST_RENDER, callback);	};

Crafty.c('3D', {
	object3D: null,
	inScene: false,
	init: function() {
		//increment the amount of canvas objs
		Crafty.DrawManager.total3D++;
		
		this.bind('Remove', function() {
			Crafty.THREE.total3D--;

			if(this.inScene === true) {
				Crafty.THREE.scene.remove(this.object3D);
			}
		});
	},
	object3DAssign: function(object) {
		this.object3D = object;

		/* 3D objects are provided by mixing in other components e.g. mesh
		  - only add the object to the scene once something is set */
		if(this.inScene === false) {
			Crafty.THREE.scene.add(this.object3D);
			this.inScene = true;
		}

		// expose the essential properties of the 3D object
		if(Crafty.support.setter) {
			//create getters and setters
			this.__defineSetter__('x', function(v) { this.object3D.position.x = v; this.attr('_x', v); });
			this.__defineSetter__('y', function(v) { this.object3D.position.y = v; this.attr('_y', v); });
			this.__defineSetter__('z', function(v) { this.object3D.position.z = v; this.attr('_z', v); });
			this.__defineGetter__('x', function() { return this.object3D.position.x; });
			this.__defineGetter__('y', function() { return this.object3D.position.y; });
			this.__defineGetter__('z', function() { return this.object3D.position.z; });

			this.__defineSetter__('scaleX', function(v) { this.object3D.scale.x = v; this.attr('_scaleX', v); });
			this.__defineSetter__('scaleY', function(v) { this.object3D.scale.y = v; this.attr('_scaleY', v); });
			this.__defineSetter__('scaleZ', function(v) { this.object3D.scale.z = v; this.attr('_scaleZ', v); });
			this.__defineGetter__('scaleX', function() { return this.object3D.scale.x; });
			this.__defineGetter__('scaleY', function() { return this.object3D.scale.y; });
			this.__defineGetter__('scaleZ', function() { return this.object3D.scale.z; });

			this.__defineSetter__('rotX', function(v) { this.object3D.rotation.x = v; this.attr('_rotX', v); });
			this.__defineSetter__('rotY', function(v) { this.object3D.rotation.y = v; this.attr('_rotY', v); });
			this.__defineSetter__('rotZ', function(v) { this.object3D.rotation.z = v; this.attr('_rotZ', v); });
			this.__defineGetter__('rotX', function() { return this.object3D.rotation.x = v; this.attr('_rotX', v); });
			this.__defineGetter__('rotY', function() { return this.object3D.rotation.y = v; this.attr('_rotY', v); });
			this.__defineGetter__('rotZ', function() { return this.object3D.rotation.z = v; this.attr('_rotZ', v); });
		}
		else if(Crafty.support.defineProperty) {
			Object.defineProperty(this, 'x', { set: function(v) { this.object3D.position.x = v; this.attr('_x', v); }, get: function() { return this.object3D.position.x }, configurable:true });
			Object.defineProperty(this, 'y', { set: function(v) { this.object3D.position.y = v; this.attr('_y', v); }, get: function() { return this.object3D.position.y }, configurable:true });
			Object.defineProperty(this, 'z', { set: function(v) { this.object3D.position.z = v; this.attr('_z', v); }, get: function() { return this.object3D.position.z }, configurable:true });

			Object.defineProperty(this, 'scaleX', { set: function(v) { this.object3D.scale.x = v; this.attr('_scaleX', v); }, get: function() { return this.object3D.rotation.x }, configurable:true });
			Object.defineProperty(this, 'scaleY', { set: function(v) { this.object3D.scale.y = v; this.attr('_scaleY', v); }, get: function() { return this.object3D.rotation.y }, configurable:true });
			Object.defineProperty(this, 'scaleZ', { set: function(v) { this.object3D.scale.z = v; this.attr('_scaleZ', v); }, get: function() { return this.object3D.rotation.z }, configurable:true });

			Object.defineProperty(this, 'rotX', { set: function(v) { this.object3D.rotation.x = v; this.attr('_rotX', v); }, get: function() { return this.object3D.scale.x }, configurable:true });
			Object.defineProperty(this, 'rotY', { set: function(v) { this.object3D.rotation.y = v; this.attr('_rotY', v); }, get: function() { return this.object3D.scale.y }, configurable:true });
			Object.defineProperty(this, 'rotZ', { set: function(v) { this.object3D.rotation.z = v; this.attr('_rotZ', v); }, get: function() { return this.object3D.scale.z }, configurable:true });
		}
		else {
			// ################ TODO - implement for browsers not supporting getters/setters or defineProperty
		}

		/* trigger an event on the parent object if 
		   a THREE.Ray query finds its child object
		   (usually the user clicking on it) */
		var ctxRef = this;
		this.object3D.click = function(evInfo) {
			ctxRef.trigger('RaycastClick', evInfo);
		}
		this.object3D.mouseover = function() {
			ctxRef.trigger('RaycastMouseOver');
		}
		this.object3D.mouseout = function() {
			ctxRef.trigger('RaycastMouseOut');
		}
		this.object3D.mousemove = function(point) {
			ctxRef.trigger('RaycastMouseMove', point);
		}
	}

	/*
	move: ,
	attach: ,
	detach: ,
	*/
});


Crafty.extend({
	THREE: {
		renderer: null,
		camera: null,
		scene: null,
		projector: null,
		loop: null,

		// settings for raycasting	
		rayEnabled: false,
		rayVect: null,
		mouseOverObj: null,

		/* should raycasting happen as the mouse moves around? if false
		   a ray is only thrown when triggered by clicks or other events */
		rayConstant: true, 

		// *** not implemented yet
		//rayInterval: 10, // in frames
		//rayFramesSince: 0,

		// *** SCREEN / RENDERER
		screenClearColor: '#FFF',
		screenNoContextMenu: true,

		// *** CAMERA
		camIsOrtho: false,
		camFOV: 40,
		// camAspect is calculated from screenW and screenH later

		// default draw distances
		camNearDist: 1,
		camFarDist: 10000,

		_xhr: {},
		_loaderInstances: {},
		_getLoaderInstance: function(fileExt) {
			if(typeof this._loaderInstances[fileExt] !== 'undefined') {
				return this._loaderInstances[fileExt];
			}

			switch(fileExt) {
				case 'js':
				case 'json':
					this._loaderInstances[fileExt] = new THREE.JSONLoader();
					break;

				default:
					throw new Error('unknown model format requested: '+fileExt);
					break;
			}

			return this._loaderInstances[fileExt];
		},

		_makeMeshComponent: function(name, url, mesh) {
			Crafty.c(name, {
				meshUrl: url,
				init: function() {
					var useAsset = Crafty.assets[this.meshUrl];

					this.requires('3D');
					this.object3DAssign( new THREE.Mesh(useAsset.geometry, useAsset.material) );
				}
			});
		},

		init: function(opts) {
			// merge in any init options
			for(key in opts) {
				this[key] = opts[key];
			}	

			if(typeof Crafty.viewport === 'undefined') {
				throw new Error('crafty.init must be called to set up the viewport before Crafty.THREE.init is called');
			}

			// create the base renderer object and add its canvas element to the DOM
			this.renderer = new THREE.WebGLRenderer({antialias: true});
			this.renderer.setSize(Crafty.viewport.width, Crafty.viewport.height);
			this.renderer.setClearColor(this.screenClearColor);
			Crafty.stage.inner.appendChild(this.renderer.domElement);

			this.canvas = this.renderer.domElement;

			// create the empty scene object
			this.scene = new THREE.Scene();

			// create the camera according to the config options
			var camClass = (this.camIsOrtho === true) ? THREE.OrthographicCamera : THREE.PerspectiveCamera;
			this.camAspect = Crafty.viewport.width / Crafty.viewport.height;
			this.camera = new camClass(this.camFov, this.camAspect, this.camNearDist, this.camFarDist);
			this.scene.add(this.camera);

			this.projector = new THREE.Projector();

			// create a tQuery loop to handle rendering
			this.loop = new tQueryLoop(this);

			/* setup the vector and ray used for raycasting */
			this.rayVect = new THREE.Vector3(
				(1 / Crafty.viewport.width) * 2 - 1,
				- (1  / Crafty.viewport.height) * 2 + 1,
				0.5
			);

			// update the mouse vector whenever the mouse moves over the viewport
			Crafty.addEvent(this, this.renderer.domElement, 'mousemove', this.rayVectUpdate);
			Crafty.addEvent(this, this.renderer.domElement, 'mouseup', function(ev) {
				this.mouseRaycast('click', ev);
			});

			if(this.screenNoContextMenu === true) {
				this.ctxListen = function(ev) {
					// prevent the context menu from showing so dragging with the right mouse button works
					ev.preventDefault();
					return false;
				};
				Crafty.addEvent(this, this.renderer.domElement, 'contextmenu', this.ctxListen);
			}

			Crafty.DrawManager.total3D = 0;

			// call the renderer each frame to draw the scene
			Crafty.DrawManager.draw = function() {
				// Crafty.THREE.sceneRender();
			};

			this.loop.start();

			return this;
		},

		// ev will be undefined for mouseover raycasts since only the point matters
		mouseRaycast: function(castType, ev) {
			if(typeof castType === 'undefined') {
				castType = 'click';
			}

			if(this.rayEnabled !== true) {
				return;
			}

			// cast a picking ray from the camera's current position 
			var mouseRay = this.projector.pickingRay(this.rayVect.clone(), this.camera),
				intersects = mouseRay.intersectObjects(this.scene.children),
				firstObj;

			if(intersects.length < 1) {
				if(castType === 'mouseover') {
					// the mouse is over nothing, clear the mouseover object
					this._mouseOverSetObj(null);
				}
				return;
			}

			// find the first object where raycastHide !== true
			var thisObj;
			for(var intIdx = 0; intIdx < intersects.length; intIdx++) {
				thisObj = intersects[intIdx];
				if(thisObj.object.raycastHide === true) {
					continue;
				}

				if( typeof thisObj !== 'undefined' ) {
					firstObj = thisObj;	
				}
			}

			if( typeof firstObj === 'undefined' ) {
				// found nothing which isn't excluded from a raycast
				return;
			}

			if(castType === 'click') {
				// notify the object it has been clicked if it has a function set
				if( typeof firstObj.object.click !== 'undefined' ) {
					firstObj.object.click({point: firstObj.point, event: ev});
				}
				return;
			}
			else if(castType === 'mouseover') {
				if(firstObj.object == this.mouseOverObj) {
					// the mouse is still over the same object, pass the updated collision point
					if( typeof firstObj.object.mousemove !== 'undefined' ) {
						firstObj.object.mousemove(firstObj.point);
					}
					return;
				}

				// update the mouseover object
				this._mouseOverSetObj(firstObj.object);
			}
		},

		_mouseOverSetObj: function(newObj) {
			if(this.mouseOverObj === null && newObj === null) {
				// mouse is over nothing and no mouseover object set
				return;
			}

			if( this.mouseOverObj !== null && typeof this.mouseOverObj.mouseout !== 'undefined' ) {
				// mouseover object already set, notify it of the mouseout event
				this.mouseOverObj.mouseout();
			}

			this.mouseOverObj = newObj;
			if(this.mouseOverObj === null) {
				// going from over an object to over nothing
				return;
			}

			if( typeof this.mouseOverObj.mouseover !== 'undefined' ) {
				// moved over a new mouseover object
				this.mouseOverObj.mouseover();
			}
		},

		rayVectUpdate: function(ev) {
			this.rayVect.x = ( (ev.pageX - this.renderer.domElement.offsetLeft) / Crafty.viewport.width ) * 2 - 1;
			this.rayVect.y = - ( (ev.pageY - this.renderer.domElement.offsetTop) / Crafty.viewport.height ) * 2 + 1;
		},

		render: function() {
			var tjs = Crafty.THREE;

			if(this.rayConstant === true) {
				this.mouseRaycast('mouseover');
			}

			if(tjs.renderer !== null) {
				tjs.renderer.render(tjs.scene, tjs.camera);
			}
		},

		load: function(data, oncomplete, onprogress, onerror) {
			var total = data.length,
				loaded = 0,
				ctxRef = this,
				currUrl, currUrlExt, currUrlBase, currXHR;

			for(dataIdx = 0; dataIdx < total; dataIdx++) {
				currUrl = data[dataIdx];
				currUrlExt = currUrl.slice( currUrl.lastIndexOf('.') + 1 ).toLowerCase();
				currUrlBase = currUrl.slice( 0, currUrl.lastIndexOf('/') );

				// create a new XHR instance to request this asset with
				this._xhr[currUrl] = new XMLHttpRequest();
				currXHR = this._xhr[currUrl];

				currXHR.onreadystatechange = function() {
					var xhrRef = this, jsonObj;

					if(this.readyState === 4) {
						loaded++;

						// inform the caller of an error if the asset is missing or not accessible
						if(this.status !== 200 && this.status !== 0) {
							if(onerror) {
								onerror.call(this, { loaded: loaded, total: total, percent: (loaded / total * 100), error: 'HTTP Error: '+this.status });
							}
							return;
						}
	
						try {
							jsonObj = JSON.parse(this.responseText);
							ctxRef._getLoaderInstance(this.refExt).createModel(
								jsonObj,
								function(geometry) {
									// create a mesh with the loaded geometry
									Crafty.assets[xhrRef.refUrl] = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial() );

									// make a component so the model can be assigned easily
									ctxRef._makeMeshComponent(xhrRef.refUrl.slice(xhrRef.refBase.length+1), xhrRef.refUrl, Crafty.assets[xhrRef.refUrl]);
								},
								this.refBase
							);
						}
						catch(err) {
							// inform the caller that parsing the model failed or another error was hit
							if(onerror) {
								onerror.call(this, { loaded: loaded, total: total, percent: (loaded / total * 100), error: err });
							}
							return;
						}

						if(loaded >= total) {
							// last asset loaded, cleanup and notify of completion
							for(var xhrIdx in ctxRef._xhr) {
								delete(ctxRef._xhr[xhrIdx]);
							}
							oncomplete();
						}
						else {
							if(onprogress) {
								onprogress.call(this, { loaded: loaded, total: total, percent: (loaded / total * 100) });
							}
						}
					}
				};

				/* store the url, extension and base path in the xhr
				   object for reference in the callback later */
				currXHR.refUrl = currUrl;
				currXHR.refExt = currUrlExt;
				currXHR.refBase = currUrlBase;

				currXHR.open('GET', currUrl, true);
				currXHR.send(null);
			}
		}
	}
});

