import * as THREE from "../three.js-master/build/three.module.js";
import{TransformControls} from "../three.js-master/examples/jsm/controls/TransformControls.js";

var AdvancedCurve=function(){
	var that=window.mhd;
	this.strType="AdvancedCurve";
	this.superRoadsObject=null;
	this.enabled=true;
	this.grid=null;
	this.blnAddedToView=false;
	this.rootGrid=null;
	this.blnControlsAttached=false;
	this.intSplinePointsLength=0;
	this.intControlPointSelected=-1;
	this.lstVec3fixedNormals=[];
	this.landscapeMesh=null;
	this.lstVec3positions=[];
	this.simpleCurve=null;
	this.dctSplines={};
	this.lstSplineControlObjects=[];
	this.intControlObjectsAtOnce=21;
	this.blnLeftJunction=true;
	this.blnPullWithLinearDecay=true;
	this.guiFolder=null;
	this.selectedControlObject=null;
	this.vec3PrevControlObjectPosition=null;
	this.raycaster=new THREE.Raycaster();
	this.vec2pointer=new THREE.Vector2();
	this.vec2onUpPosition=new THREE.Vector2();
	this.vec2onDownPosition=new THREE.Vector2();
	this.guiParams={
		addPoint:this.addPoint,
		removePoint:this.removePoint,
		exportSpline:this.exportSpline
	};
	this.controlObjectGeometry=new THREE.BoxGeometry(.1,.1,.1);
	this.transformControls=new TransformControls(that.camera,that.renderer.domElement);
	this.transformControls.intUndoRedoLimit=100;
	this.transformControls.lstUndoEntries=[];
	this.transformControls.lstRedoEntries=[];
	this.transformControls.undo=function(){
		var lstUndoEntry=this.advancedCurve.transformControls.lstUndoEntries.pop();
		if(undefined==lstUndoEntry)return;

		if(this.advancedCurve.transformControls.lstRedoEntries.length<this.advancedCurve.transformControls.intUndoRedoLimit)
			this.advancedCurve.transformControls.lstRedoEntries.push(lstUndoEntry);
		else{
			for(var ii=1;ii<this.advancedCurve.transformControls.lstRedoEntries.length;ii++)
				this.advancedCurve.transformControls.lstRedoEntries[ii-1]=this.advancedCurve.transformControls.lstRedoEntries[ii];
			this.advancedCurve.transformControls.lstRedoEntries[this.advancedCurve.transformControls.lstRedoEntry.length-1]=lstUndoEntry;
		}
		//undo
		switch(lstUndoEntry[0]){
			case "position_i":
				this.advancedCurve.transformControls.position_i_undo(lstUndoEntry[1]);			
				break;
		}
	};
	this.transformControls.redo=function(){
		var lstRedoEntry=this.advancedCurve.transformControls.lstRedoEntries.pop();
		if(undefined==lstRedoEntry)return;
		if(this.advancedCurve.transformControls.lstUndoEntries.length<this.advancedCurve.transformControls.intUndoRedoLimit)
			this.advancedCurve.transformControls.lstUndoEntries.push(lstRedoEntry);
		else{
			for(var ii=1;ii<this.advancedCurve.transformControls.lstUndoEntries.length;ii++)
				this.advancedCurve.transformControls.lstUndoEntries[ii-1]=this.advancedCurve.transformControls.lstUndoEntries[ii];
			this.advancedCurve.transformControls.lstUndoEntries[this.advancedCurve.transformControls.lstUndoEntry.length-1]=lstRedoEntry;
		}
		//redo
		switch(lstRedoEntry[0]){
			case "position_i":
				this.advancedCurve.transformControls.position_i_redo(lstRedoEntry[1]);			
				break;
		}
	};
	window.mhd.scene.add(this.transformControls);
	this.transformControls.advancedCurve=this;
	this.transformControls.addEventListener("dragging-changed",function(event){
		that.controls.enabled=!event.value;
		//TODO: pointer up when enabling
	});
	this.transformControls.position_i=function(){
		this.advancedCurve.transformControls.lstRedoEntries=[];
		var lstUndoEntry=[];
		var i=this.advancedCurve.lstSplineControlObjects.indexOf(this.advancedCurve.selectedControlObject);
		try{
			lstUndoEntry.push(["position_i",this.advancedCurve.selectedControlObject,this.advancedCurve.vec3PrevControlObjectPosition.clone(),this.advancedCurve.selectedControlObject.position.clone()]);
		}catch(xcp){}
		var vec3diff=new THREE.Vector3();
		if(undefined!=this.advancedCurve.vec3PrevControlObjectPosition){
			vec3diff.x=this.advancedCurve.selectedControlObject.position.x-this.advancedCurve.vec3PrevControlObjectPosition.x;
			vec3diff.y=this.advancedCurve.selectedControlObject.position.y-this.advancedCurve.vec3PrevControlObjectPosition.y;
			vec3diff.z=this.advancedCurve.selectedControlObject.position.z-this.advancedCurve.vec3PrevControlObjectPosition.z;
		}else{
			vec3diff.x=0;
			vec3diff.y=0;
			vec3diff.z=0;
		}
		var fltHalfShiftSize=this.advancedCurve.intControlObjectsAtOnce/2;
		var intHalfShfitSize=Math.floor(fltHalfShiftSize);
		var intLength=this.advancedCurve.lstSplineControlObjects.length;
		var splineControlObject=null;
		var newPosition=new THREE.Vector3();
		var wm,wp;
		if(true==this.advancedCurve.blnPullWithLinearDecay){
			wm=function(x){return 1./intHalfShfitSize*x+1-i/intHalfShfitSize;};
			wp=function(x){return -1./intHalfShfitSize*x+1+i/intHalfShfitSize;};
		}else{
			wm=function(x){return 1.;};
			wp=function(x){return 1.;};
		}
		if(fltHalfShiftSize==intHalfShfitSize){
			for(var j=1;j<intHalfShfitSize-1;j++){
				if(i-j>=0){
					splineControlObject=this.advancedCurve.lstSplineControlObjects[i-j];
					newPosition.x=splineControlObject.position.x+wm(i-j)*vec3diff.x;
					newPosition.y=splineControlObject.position.y+wm(i-j)*vec3diff.y;
					newPosition.z=splineControlObject.position.z+wm(i-j)*vec3diff.z;
					lstUndoEntry.push(["position_i",splineControlObject,splineControlObject.position.clone(),newPosition.clone()]);
					splineControlObject.position.x=newPosition.x;
					splineControlObject.position.y=newPosition.y;
					splineControlObject.position.z=newPosition.z;
				}
			}
			for(var j=1;j<intHalfShfitSize;j++){
				if(i+j<intLength){
					splineControlObject=this.advancedCurve.lstSplineControlObjects[i+j];
					newPosition.x=splineControlObject.position.x+wp(i+j)*vec3diff.x;
					newPosition.y=splineControlObject.position.y+wp(i+j)*vec3diff.y;
					newPosition.z=splineControlObject.position.z+wp(i+j)*vec3diff.z;
					lstUndoEntry.push(["position_i",splineControlObject,splineControlObject.position.clone(),newPosition.clone()]);
					splineControlObject.position.x=newPosition.x;
					splineControlObject.position.y=newPosition.y;
					splineControlObject.position.z=newPosition.z;
				}
			}

		}else{
			for(var j=1;j<intHalfShfitSize;j++){
				if(i-j>=0){
					splineControlObject=this.advancedCurve.lstSplineControlObjects[i-j];
					newPosition.x=splineControlObject.position.x+wm(i-j)*vec3diff.x;
					newPosition.y=splineControlObject.position.y+wm(i-j)*vec3diff.y;
					newPosition.z=splineControlObject.position.z+wm(i-j)*vec3diff.z;
					lstUndoEntry.push(["position_i",splineControlObject,splineControlObject.position.clone(),newPosition.clone()]);
					splineControlObject.position.x=newPosition.x;
					splineControlObject.position.y=newPosition.y;
					splineControlObject.position.z=newPosition.z;
				}
				if(i+j<intLength){
					splineControlObject=this.advancedCurve.lstSplineControlObjects[i+j];
					newPosition.x=splineControlObject.position.x+wp(i+j)*vec3diff.x;
					newPosition.y=splineControlObject.position.y+wp(i+j)*vec3diff.y;
					newPosition.z=splineControlObject.position.z+wp(i+j)*vec3diff.z;
					lstUndoEntry.push(["position_i",splineControlObject,splineControlObject.position.clone(),newPosition.clone()]);
					splineControlObject.position.x=newPosition.x;
					splineControlObject.position.y=newPosition.y;
					splineControlObject.position.z=newPosition.z;
				}
			}
		}
		this.advancedCurve.updateSplineOutline();
		for(var j=0;j<this.advancedCurve.lstRoadsToUpdate.length;j++){
			this.advancedCurve.lstRoadsToUpdate[j].updateGeometry(this.advancedCurve,this.advancedCurve.intSplinePointsLength,1,this.advancedCurve.landscapeMesh);
		}
		this.advancedCurve.vec3PrevControlObjectPosition=this.advancedCurve.selectedControlObject.position.clone();
		if(this.advancedCurve.transformControls.lstUndoEntries.length<this.advancedCurve.transformControls.intUndoRedoLimit)
				this.advancedCurve.transformControls.lstUndoEntries.push(["position_i",lstUndoEntry]);
		else{
			for(var i=1;i<this.advancedCurve.transformControls.lstUndoEntries.length;i++)
				try{
					this.advancedCurve.transformControls.lstUndoEntries[i-1]=this.advancedCurve.transformControls.lstUndoEntries[i];
					this.advancedCurve.transformControls.lstUndoEntries[this.advancedCurve.transformControls.lstUndoEntry.length-1]=["position_i",lstUndoEntry];
				}catch(xcp){}

		}
	};
	this.transformControls.position_i_undo=function(lstUndoEntry){
		var objectToUndo,vec3prevControlObjectPosition,vec3nextControlObjectPosition;
		for(var i=0;i<lstUndoEntry.length;i++){
			objectToUndo=lstUndoEntry[i][1];
			vec3prevControlObjectPosition=lstUndoEntry[i][2];
			vec3nextControlObjectPosition=lstUndoEntry[i][3];
			objectToUndo.position.copy(vec3prevControlObjectPosition);
		}
		this.advancedCurve.updateSplineOutline();
		this.advancedCurve.vec3PrevControlObjectPosition=null;
		for(var j=0;j<this.advancedCurve.lstRoadsToUpdate.length;j++){
			this.advancedCurve.lstRoadsToUpdate[j].updateGeometry(this.advancedCurve,this.advancedCurve.intSplinePointsLength,1,this.advancedCurve.landscapeMesh);
		}
	};
	this.transformControls.position_i_redo=function(lstRedoEntry){
		var objectToRedo,vec3prevControlObjectPosition,vec3nextControlObjectPosition;
		for(var i=0;i<lstRedoEntry.length;i++){
			objectToRedo=lstRedoEntry[i][1];
			vec3prevControlObjectPosition=lstRedoEntry[i][2];
			vec3nextControlObjectPosition=lstRedoEntry[i][3];
			objectToRedo.position.copy(vec3nextControlObjectPosition);
		}
		this.advancedCurve.updateSplineOutline();
		this.advancedCurve.vec3PrevControlObjectPosition=null;
		for(var j=0;j<this.advancedCurve.lstRoadsToUpdate.length;j++){
			this.advancedCurve.lstRoadsToUpdate[j].updateGeometry(this.advancedCurve,this.advancedCurve.intSplinePointsLength,1,this.advancedCurve.landscapeMesh);
		}
	};
	this.transformControls.addEventListener("objectChange",function(){
		this.position_i();
	});
};
AdvancedCurve.prototype.getPointAt_=function(fltT,landscapeMesh){
	//var fltRoadHeight=0.3;
	var fltRoadHeight=window.mhd.fltRoadHeight;
	var raycaster=new THREE.Raycaster();
	raycaster.ray.direction.set(0,-1,0);
	var PI2=Math.PI*2;
	var vec3vector=new THREE.Vector3();
	fltT=fltT*PI2;
	var fltX=Math.sin(fltT*3)*Math.cos(fltT*4)*50;
	var fltZ=(500/PI2)*fltT-250;
	raycaster.ray.origin.set(fltX,50,fltZ);
	var lstIntersections=raycaster.intersectObject(landscapeMesh);
	var fltY=0;
	if(0!=lstIntersections.length)
		fltY=lstIntersections[0].point.fltY+fltRoadHeight;
	return vec3vector.set(fltX,fltY,fltZ);
};
AdvancedCurve.prototype.addSplineControlObject=function(vec3position){
	var material=new THREE.MeshLambertMaterial({color:Math.random()*0xffffff});
	var mesh=new THREE.Mesh(this.controlObjectGeometry,material);
	if(vec3position){
		mesh.position.copy(vec3position);
	}else{
		mesh.position.x=Math.random()*1000-500;
		mesh.position.y=Math.random()*600;
		mesh.position.z=Math.random()*800-400;
	}
	mesh.castShadow=true;
	mesh.receiveShadow=true;
	this.lstSplineControlObjects.push(mesh);
	return mesh;
};
AdvancedCurve.prototype.updateSplineOutline=function(){
	var vec3point=new THREE.Vector3();
	var fltT,spline,splineMesh,position;
	for(var theEntry in this.dctSplines){
		spline=this.dctSplines[theEntry];
		splineMesh=spline.mesh;
		position=splineMesh.geometry.attributes.position;
		for(var ii=0;ii<this.intSplinePointsLength;ii++){
			fltT=ii/(this.intSplinePointsLength-1);
			spline.getPoint(fltT,vec3point);
			position.setXYZ(ii,vec3point.x,vec3point.y,vec3point.z);
		}
		position.needsUpdate=true;
	}
};
AdvancedCurve.prototype.updateSplines=function(){
	if(null!=this.rootGrid)
		this.removeCurves(this.rootGrid);
	this.intSplinePointsLength=this.lstSplineControlObjects.length;
	var geometry=new THREE.BufferGeometry();
	geometry.setAttribute("position",new THREE.BufferAttribute(new Float32Array(this.intSplinePointsLength*3),3));
	var curve=new THREE.CatmullRomCurve3(this.lstVec3positions);
	curve.curveType="catmullrom";
	curve.mesh=new THREE.Line(geometry.clone(),new THREE.LineBasicMaterial({
		color:0xff0000,
		opacity:1.
	}));
	curve.mesh.castShadow=true;
	this.dctSplines.uniform=curve;
	curve=new THREE.CatmullRomCurve3(this.lstVec3positions);
	curve.curveType="centripetal";
	curve.mesh=new THREE.Line(geometry.clone(),new THREE.LineBasicMaterial({
		color:0x00ff00,
		opacity:1.
	}));
	curve.mesh.castShadow=true;
	this.dctSplines.centripetal=curve;
	curve=new THREE.CatmullRomCurve3(this.lstVec3positions);
	curve.curveType="chordal";
	curve.mesh=new THREE.Line(geometry.clone(),new THREE.LineBasicMaterial({
		color:0x0000ff,
		opacity:1.
	}));
	curve.mesh.castShadow=true;
	this.dctSplines.chordal=curve;
	this.updateSplineOutline();
	if(null!=this.rootGrid)
		this.addCurves(this.rootGrid);
};
AdvancedCurve.prototype.resetDefaults=function(){
	this.lstSplineControlObjects=[];
	this.lstRoadsToUpdate=[];
	this.lstUndoEntries=[];

	this.enabled=true;
	this.grid=null;
	this.intSplinePointsLength=0;
	this.lstVec3positions=[];
	this.simpleCurve=null;
	this.dctSplines={};
	this.intControlObjectsAtOnce=21;
	this.blnPullWithLinearDecay=true;
	this.selectedControlObject=null;
	this.vec3PrevControlObjectPosition=null;
};
AdvancedCurve.prototype.loadFromFunction=function(landscapeMesh,curveFunction,intControlPoints,intRegionNumber){
	this.resetDefaults();
	this.intSplinePointsLength=intControlPoints;
	this.simpleCurve=curveFunction;
	this.landscapeMesh=landscapeMesh;
	var lstControlPoints=[];
	var fltT=-1;
	var vec3position;
	var material,controlObject;
	for(var ii=0;ii<intControlPoints;ii++){
		fltT=ii/(intControlPoints-1);
		vec3position=curveFunction.getPointAt(fltT,landscapeMesh);

		material=new THREE.MeshLambertMaterial({color:Math.random()*0xffffff});
		controlObject=new THREE.Mesh(this.controlObjectGeometry,material);
		controlObject.position.copy(vec3position);
		this.lstSplineControlObjects.push(controlObject);
		lstControlPoints.push(controlObject.position)
	}
	this.lstVec3positions=lstControlPoints;
	this.updateSplines();
};
AdvancedCurve.prototype.saveToString=function(){
	var lstVec3positions=[];
	var controlObject;
	var intControlPoints=this.lstSplineControlObjects.length;
	for(var ii=0;ii<intControlPoints;ii++){
		controlObject=this.lstSplineControlObjects[ii];	
		lstVec3positions.push(new THREE.Vector3(controlObject.position.x,controlObject.position.y,controlObject.position.z));	
	}
	var objSave={};
	objSave.lstVec3positions=lstVec3positions;
	var strSave="RoadCurve "+intControlPoints+String.fromCharCode(10);
	strSave+=JSON.stringify(objSave);	
	strSave+="|"+String.fromCharCode(10);
	return strSave;
};
AdvancedCurve.prototype.loadFromPoints=function(lstVec3points){
	this.resetDefaults();
	var intControlPoints=lstVec3points.length;
	this.intSplinePointsLength=intControlPoints;
	var lstControlPoints=[];
	var vec3position;
	var material,controlObject;
	for(var ii=0;ii<intControlPoints;ii++){
		vec3position=lstVec3points[ii];
		material=new THREE.MeshLambertMaterial({color:Math.random()*0xffffff});
		controlObject=new THREE.Mesh(this.controlObjectGeometry,material);
		controlObject.position.copy(vec3position);
		this.lstSplineControlObjects.push(controlObject);
		lstControlPoints.push(controlObject.position)
	}
	this.lstVec3positions=lstControlPoints;
	this.updateSplines();
};
AdvancedCurve.prototype.loadFromPointsAndFixedNormal=function(lstVec3points,vec3fixedNormal){
	this.resetDefaults();
	var intControlPoints=lstVec3points.length;
	this.intSplinePointsLength=intControlPoints;
	var lstControlPoints=[];
	var vec3position;
	var material,controlObject;
	for(var ii=0;ii<intControlPoints;ii++){
		vec3position=lstVec3points[ii];
		material=new THREE.MeshLambertMaterial({color:Math.random()*0xffffff});
		controlObject=new THREE.Mesh(this.controlObjectGeometry,material);
		controlObject.position.copy(vec3position);
		this.lstSplineControlObjects.push(controlObject);
		this.lstVec3fixedNormals.push(vec3fixedNormal.clone());
		lstControlPoints.push(controlObject.position)
	}
	this.lstVec3positions=lstControlPoints;
	this.updateSplines();
};
AdvancedCurve.prototype.loadFromString=function(strFunction){
	var strRoadCurve="RoadCurve ";
	var intII=-1;
	var lstStrRoadCurve=strFunction.split(String.fromCharCode(10));
	var intRoadCurve=-1;
	for(var ii=0;ii<lstStrRoadCurve.length;ii++){
		intRoadCurve=lstStrRoadCurve[ii].indexOf(strRoadCurve);
		if(-1!=intRoadCurve){
			intII=ii;
		}
	}
	if(-1==intII){
		console.log("-1==intII");
		return;
	}
	var intControlPoints=parseInt(lstStrRoadCurve[intII].substring(intRoadCurve+strRoadCurve.length));
	if(true==window.mhd.nonNumber(intControlPoints)){
		console.log("true==nonNumber");
		return;
	}
	var objLoad=JSON.parse(lstStrRoadCurve[intII+1]);
	this.loadFromPoints(objLoad.lstVec3positions);
};
AdvancedCurve.prototype.getPointAt=function(fltT,landscapeMesh){
	var vec3point=new THREE.Vector3();
	var i=Math.floor(fltT*(this.intSplinePointsLength-1));
	this.dctSplines.chordal.getPoint(fltT,vec3point);
	if(this.intSplinePointsLength<10){
		//console.log("getPointAt fltT="+fltT);
		//console.log(vec3point);
	}
	return vec3point;
};
AdvancedCurve.prototype.getTangentAt=function(fltT,landscapeMesh){
	var fltDelta=0.0001;
	var fltT1=Math.max(0,fltT-fltDelta);
	var fltT2=Math.min(1,fltT+fltDelta);

	var vec3vector2=new THREE.Vector3();
	return vec3vector2.copy(this.getPointAt(fltT2,landscapeMesh))
		.sub(this.getPointAt(fltT1,landscapeMesh)).normalize();
};
AdvancedCurve.prototype.getFixedNormalAt=function(fltT,landscapeMesh){
	var ii=Math.floor(fltT*(this.intSplinePointsLength-1));
	var vec3fixedNormal=this.lstVec3fixedNormals[ii];
	if(undefined!=vec3fixedNormal)return vec3fixedNormal.clone();
	else return vec3fixedNormal;
};
AdvancedCurve.prototype.getNormalAt=function(fltT,landscapeMesh){
	if(null==this.vec3fixedNormal){
		var vec3normal=new THREE.Vector3();
		var vec3right=new THREE.Vector3();
		var vec3tangent=new THREE.Vector3();

		vec3tangent.copy(this.getTangentAt(fltT,landscapeMesh)).normalize();

		var quaternion=new THREE.Quaternion();
		vec3right.crossVectors(new THREE.Vector3(0,1,0),vec3tangent).normalize();
		vec3normal.crossVectors(vec3tangent,vec3right).normalize();
		return vec3normal;
	}else{
		return this.vec3fixedNormal.clone();
	}
};
AdvancedCurve.prototype.addCurves=function(object){
	var spline;
	for(var theEntry in this.dctSplines){

		//if("chordal"==theEntry){
		//if("centripetal"==theEntry){
		//if("uniform"==theEntry){
		spline=this.dctSplines[theEntry];
		object.add(spline.mesh);
		//}

	}
};
AdvancedCurve.prototype.removeCurves=function(object){
	var spline;
	for(var theEntry in this.dctSplines){

		//if("chordal"==theEntry){
		//if("centripetal"==theEntry){
		//if("uniform"==theEntry){
		spline=this.dctSplines[theEntry];
		object.remove(spline.mesh);
		//}

	}
};
AdvancedCurve.prototype.addControlObjects=function(object){
	for(var ii=0;ii<this.lstSplineControlObjects.length;ii++){
		object.add(this.lstSplineControlObjects[ii]);
	}
};
AdvancedCurve.prototype.removeControlObjects=function(object){
	for(var ii=0;ii<this.lstSplineControlObjects.length;ii++){
		object.remove(this.lstSplineControlObjects[ii]);
	}
};
AdvancedCurve.prototype.onPointerDown=function(event){
	this.vec2onDownPosition.x=event.clientX;
	this.vec2onDownPosition.y=event.clientY;
};
AdvancedCurve.prototype.onPointerUp=function(){
	this.vec2onUpPosition.x=event.clientX;
	this.vec2onUpPosition.y=event.clientY;

	if(0==this.vec2onDownPosition.distanceTo(this.vec2onUpPosition)){
		this.transformControls.detach();
		this.blnControlsAttached=false;
		this.intControlPointSelected=-1;
	}
};
AdvancedCurve.prototype.onPointerMove=function(event){
	this.vec2pointer.x=(event.clientX/window.innerWidth)*2-1;
	this.vec2pointer.y=-(event.clientY/window.innerHeight)*2+1;
	this.raycaster.setFromCamera(this.vec2pointer,window.mhd.camera);
	var lstIntersections=this.raycaster.intersectObjects(this.lstSplineControlObjects);
	if(lstIntersections.length>0){
		var object=lstIntersections[0].object;
		this.selectedControlObject=object;
		this.vec3PrevControlObjectPosition=object.position.clone();
		if(object!=this.transformControls.object){
			if(true==this.blnAddedToView){
				this.transformControls.attach(object);
				this.blnControlsAttached=true;
				this.intControlPointSelected=this.lstSplineControlObjects.indexOf(object);
			}
		}
	}
};
AdvancedCurve.prototype.addToGUI=function(){
	var that=window.mhd;
	this.guiFolder=that.gui.addFolder("Road Curve");
	this.guiFolder.add(this,"addPoint");
	this.guiFolder.add(this,"removePoint");
	this.guiFolder.add(this,"exportSpline");
	this.guiFolder.add(this,"stickToSurface");
	this.guiFolder.add(this,"intControlObjectsAtOnce");
	this.guiFolder.add(this,"blnPullWithLinearDecay");
	this.guiFolder.add(this,"blnLeftJunction");
};
AdvancedCurve.prototype.removeFromGUI=function(){
	var that=window.mhd;
	that.gui.removeFolder(this.guiFolder);
	this.guiFolder=null;
};
AdvancedCurve.prototype.newControlObjectMesh=function(vec3position){
	var material,controlObjectMesh;
	material=new THREE.MeshLambertMaterial({color:Math.random()*0xffffff});
	controlObjectMesh=new THREE.Mesh(this.controlObjectGeometry,material);
	controlObjectMesh.position.copy(vec3position);
	return controlObjectMesh;
};
AdvancedCurve.prototype.addPoint=function(){
	var vec3prevPoint,vec3thePoint;
	var vec3diff=new THREE.Vector3();
	var vec3newPoint=new THREE.Vector3();
	var controlObjectMesh;
	vec3thePoint=this.lstSplineControlObjects[this.intControlPointSelected].position;	
	if(this.intControlPointSelected==this.lstSplineControlObjects.length-1){
		vec3prevPoint=this.lstSplineControlObjects[this.intControlPointSelected-1].position;
		vec3diff.x=vec3prevPoint.x-vec3thePoint.x;
		vec3diff.y=vec3prevPoint.y-vec3thePoint.y;
		vec3diff.z=vec3prevPoint.z-vec3thePoint.z;
		vec3newPoint.x=vec3thePoint.x-vec3diff.x;
		vec3newPoint.y=vec3thePoint.y-vec3diff.y;
		vec3newPoint.z=vec3thePoint.z-vec3diff.z;
		controlObjectMesh=this.newControlObjectMesh(vec3newPoint);
		this.lstSplineControlObjects.push(controlObjectMesh);
		this.lstVec3positions.push(controlObjectMesh.position);
		this.updateSplines();
		for(var jj=0;jj<this.lstRoadsToUpdate.length;jj++){
			this.lstRoadsToUpdate[jj].updateGeometry(this,this.intSplinePointsLength,this.lstRoadsToUpdate[jj].mesh.geometry.width,this.landscapeMesh);
		}
		this.rootGrid.add(controlObjectMesh);
		return;
	}
	if(0==this.intControlPointSelected){
		var newSplineControlObjects=[];
		var newPositions=[];
		var newFixedNormals=[];
		vec3prevPoint=this.lstSplineControlObjects[this.intControlPointSelected+1].position;
		vec3diff.x=vec3prevPoint.x-vec3thePoint.x;
		vec3diff.y=vec3prevPoint.y-vec3thePoint.y;
		vec3diff.z=vec3prevPoint.z-vec3thePoint.z;
		vec3newPoint.x=vec3thePoint.x-vec3diff.x;
		vec3newPoint.y=vec3thePoint.y-vec3diff.y;
		vec3newPoint.z=vec3thePoint.z-vec3diff.z;
		controlObjectMesh=this.newControlObjectMesh(vec3newPoint);
		newSplineControlObjects[0]=controlObjectMesh;
		newPositions[0]=controlObjectMesh.position;
		for(var ii=0;ii<this.lstSplineControlObjects.length;ii++){
			newSplineControlObjects[ii+1]=this.lstSplineControlObjects[ii];
			newPositions[ii+1]=this.lstVec3positions[ii];
			newFixedNormals[ii+1]=this.lstVec3fixedNormals[ii];
		}
		this.lstSplineControlObjects=newSplineControlObjects;
		this.lstVec3positions=newPositions;
		this.lstVec3fixedNormals=newFixedNormals;
		this.updateSplines();
		for(var jj=0;jj<this.lstRoadsToUpdate.length;jj++){
			this.lstRoadsToUpdate[jj].updateGeometry(this,this.intSplinePointsLength,this.lstRoadsToUpdate[jj].mesh.geometry.width,this.landscapeMesh);
		}
		this.rootGrid.add(controlObjectMesh);
		return;
	}
	if(this.intControlPointSelected>0&&this.intControlPointSelected<this.lstSplineControlObjects.length-1){
		var newSplineControlObjects=[];
		var newPositions=[];
		if(true==this.blnLeftJunction){
			vec3prevPoint=this.lstSplineControlObjects[this.intControlPointSelected-1].position;
		}else{
			vec3prevPoint=this.lstSplineControlObjects[this.intControlPointSelected+1].position;
		}
		vec3diff.x=vec3prevPoint.x-vec3thePoint.x;
		vec3diff.y=vec3prevPoint.y-vec3thePoint.y;
		vec3diff.z=vec3prevPoint.z-vec3thePoint.z;
		vec3diff=vec3diff.normalize();
		var vec3right=new THREE.Vector3(0,0,0);
		var vec3normal=new THREE.Vector3(0,0,0);
		vec3right.crossVectors(new THREE.Vector3(0,1,0),vec3diff).normalize();
		vec3normal.crossVectors(vec3diff,vec3right).normalize();
		var vec3junction=new THREE.Vector3();
		if(true==this.blnLeftJunction){
			vec3junction.crossVectors(vec3diff,vec3normal).normalize();
		}else{
			vec3junction.crossVectors(vec3diff,vec3normal).multiplyScalar(-1.).normalize();
		}
		if(true==this.blnLeftJunction){
			vec3newPoint.x=vec3thePoint.x+vec3junction.x;
			vec3newPoint.y=vec3thePoint.y+vec3junction.y;
			vec3newPoint.z=vec3thePoint.z+vec3junction.z;
		}else{
			vec3newPoint.x=vec3thePoint.x-vec3junction.x;
			vec3newPoint.y=vec3thePoint.y-vec3junction.y;
			vec3newPoint.z=vec3thePoint.z-vec3junction.z;
		}
		//TODO:add new road

		var splineControlObject=this.lstSplineControlObjects[this.intControlPointSelected];
		var lstVec3points=[this.rootGrid.localToWorld(vec3thePoint.clone()),this.rootGrid.localToWorld(vec3newPoint.clone())];
		var roadObject=this.lstRoadsToUpdate[0];	
		this.superRoadsObject.pushAndCreateRoadFromPointsAndFixedNormal(lstVec3points,vec3normal,roadObject.mesh.geometry.width,this.landscape,this.rootGrid);
	}
};
AdvancedCurve.prototype.stickToSurface=function(){
	var intOmmit=2;
	var raycaster=new THREE.Raycaster();
	raycaster.ray.direction.set(0,-1,0);
	var vec3point,y,lstIntersections;
	if(null==this.landscapeMesh)
		this.landscapeMesh=window.mhd.regions.lstLandscapeObjects[window.mhd.regions.intActualRegion].mesh;
	for(var ii=intOmmit;ii<this.lstVec3positions.length;ii++){
		vec3point=this.lstVec3positions[ii];
		raycaster.ray.origin.set(vec3point.x,50,vec3point.z);
		lstIntersections=raycaster.intersectObject(this.landscapeMesh);
		if(0!=lstIntersections.length){
			y=lstIntersections[0].point.y+window.mhd.fltRoadHeight;
			vec3point.y=y;
		}
	}
	this.updateSplines();
	for(var jj=0;jj<this.lstRoadsToUpdate.length;jj++){
		this.lstRoadsToUpdate[jj].updateGeometry(this,this.intSplinePointsLength,this.lstRoadsToUpdate[jj].mesh.geometry.width,this.landscapeMesh);
	}
};
AdvancedCurve.prototype.removePoint=function(){
	console.log("todo: removePoint");
	if(this.lstSplineControlObjects.length>2){

	}
};
AdvancedCurve.prototype.exportSpline=function(){
	console.log("todo: exportSpline");
};
AdvancedCurve.prototype.addToView=function(grid){
	this.addCurves(grid);
	this.addControlObjects(grid);
	this.blnAddedToView=true;
	this.rootGrid=grid;
};
AdvancedCurve.prototype.removeFromView=function(grid){
	this.removeCurves(grid);
	this.removeControlObjects(grid);
	this.blnAddedToView=false;
	this.rootGrid=grid;
	if(true==this.blnControlsAttached){
		this.transformControls.detach();
		this.intControlPointSelected=-1;
		console.log("this.intControlPointSelected");
		console.log(this.intControlPointSelected);
	}
};
AdvancedCurve.prototype.enable=function(blnEnabled){
	this.enabled=blnEnabled;
	for(var strKey in this.dctSplines){
		this.dctSplines[strKey].mesh.visible=blnEnabled;
	}
	for(var ii=0;ii<this.lstSplineControlObjects.length;ii++)
		this.lstSplineControlObjects[ii].visible=blnEnabled;
	if(false==blnEnabled){
		this.transformControls.detach();
		this.blnControlsAttached=false;
		this.intControlPointSelected=-1;
		//console.log("this.intControlPointSelected");
		//console.log(this.intControlPointSelected);
	}
	if(true==blnEnabled){
		this.transformControls.enabled=true;
	}
};
AdvancedCurve.prototype.cleanups=function(){
	this.transformControls.detach();
	this.blnControlsAttached=false;
	this.intControlPointSelected=-1;
	//console.log("this.intControlPointSelected");
	//console.log(this.intControlPointSelected);
};
export{AdvancedCurve};
