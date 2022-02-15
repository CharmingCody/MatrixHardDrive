import * as THREE from "../three.js-master/build/three.module.js";
import{GLTFLoader} from "../three.js-master/examples/jsm/loaders/GLTFLoader.js";
import{DRACOLoader} from "../three.js-master/examples/jsm/loaders/DRACOLoader.js";
import{DDSLoader} from "../three.js-master/examples/jsm/loaders/DDSLoader.js";
import{MTLLoader} from "../three.js-master/examples/jsm/loaders/MTLLoader.js";
import{OBJLoader} from "../three.js-master/examples/jsm/loaders/OBJLoader.js";
import{AdvancedCurve} from "./mhd_AdvancedCurve.js";
var TriangleSelectorGeometry=function(){
	THREE.BufferGeometry.call(this);
	this.setAttribute("position",new THREE.BufferAttribute(new Float32Array(4*3),3));
};
TriangleSelectorGeometry.prototype=Object.create(THREE.BufferGeometry.prototype);
TriangleSelectorGeometry.prototype.update=function(){
	//done manually
};
var TriangleSelectorObject=function(){
	this.strType="TriangleSelectorObject";
	this.blnSelectWhole=true;
	this.blnSelectVertices=false;
	var geometry=new TriangleSelectorGeometry();
	var material=new THREE.MeshPhongMaterial({
		color:0x0000ff,side:THREE.DoubleSide
	});
	this.mesh=new THREE.Mesh(geometry,material);
	this.mesh.visible=false;
	//this.mesh.layers.enable(1);
};
TriangleSelectorObject.prototype.update=function(){
	this.mesh.geometry.update();
	this.mesh=new THREE.Mesh(this.mesh.geometry,this.mesh.material);
	this.mesh.visible=false;
	//this.mesh.layers.enable(1);
};
TriangleSelectorObject.prototype.updateTriangleSelector=function(intersectedObject,intersectedFace){
	this.mesh.position.set(0,0,0);
	var linePosition=this.mesh.geometry.attributes.position;
	var meshPosition=intersectedObject.mesh.geometry.attributes.position;

	linePosition.copyAt(0,meshPosition,intersectedFace.a);
	linePosition.copyAt(1,meshPosition,intersectedFace.b);
	linePosition.copyAt(2,meshPosition,intersectedFace.c);
	linePosition.copyAt(3,meshPosition,intersectedFace.a);

	intersectedObject.mesh.updateMatrixWorld();
	intersectedObject.mesh.updateMatrix();

	this.mesh.geometry.applyMatrix4(intersectedObject.mesh.matrix);
	this.mesh.visible=true;
};
TriangleSelectorObject.prototype.updateIndexedFace_undo=function(lstUndoEntry){
	var intersectedObject=lstUndoEntry[0][1];
	var intIntersectedFaceIndex=lstUndoEntry[0][2];
	var lstVec3prevPositions=lstUndoEntry[0][3];
	var intersectedFace=lstUndoEntry[0][5];
	var transformControls=lstUndoEntry[0][6];
	var positionArray=intersectedObject.mesh.geometry.attributes.position.array;
	var lstVec3prevPosition;

	var indexArray=intersectedObject.mesh.geometry.index.array;
	var facea=indexArray[3*intIntersectedFaceIndex+0];
	var faceb=indexArray[3*intIntersectedFaceIndex+1];
	var facec=indexArray[3*intIntersectedFaceIndex+2];

	lstVec3prevPosition=lstVec3prevPositions[0];
	positionArray[3*facea+0]=lstVec3prevPosition.x;
	positionArray[3*facea+1]=lstVec3prevPosition.y;
	positionArray[3*facea+2]=lstVec3prevPosition.z;

	lstVec3prevPosition=lstVec3prevPositions[1];
	positionArray[3*faceb+0]=lstVec3prevPosition.x;
	positionArray[3*faceb+1]=lstVec3prevPosition.y;
	positionArray[3*faceb+2]=lstVec3prevPosition.z;

	lstVec3prevPosition=lstVec3prevPositions[2];
	positionArray[3*facec+0]=lstVec3prevPosition.x;
	positionArray[3*facec+1]=lstVec3prevPosition.y;
	positionArray[3*facec+2]=lstVec3prevPosition.z;

	intersectedObject.mesh.geometry.attributes.position.needsUpdate=true;
	intersectedObject.mesh.updateMatrixWorld();
	intersectedObject.mesh.updateMatrix();
	intersectedObject.mesh.geometry.computeBoundingBox();
	this.updateTriangleSelector(intersectedObject,intersectedFace);
};
TriangleSelectorObject.prototype.updateIndexedFace_redo=function(lstRedoEntry){
	var intersectedObject=lstRedoEntry[0][1];
	var intIntersectedFaceIndex=lstredoEntry[0][2];
	var lstVec3nextPositions=lstRedoEntry[0][4];
	var intersectedFace=lstRedoEntry[0][5];
	var transformControls=lstRedoEntry[0][6];
	var positionArray=intersectedObject.mesh.geometry.attributes.position.array;
	var lstVec3nextPosition;

	var indexArray=intersectedObject.mesh.geometry.index.array;
	var facea=indexArray[3*intIntersectedFaceIndex+0];
	var faceb=indexArray[3*intIntersectedFaceIndex+1];
	var facec=indexArray[3*intIntersectedFaceIndex+2];

	lstVec3nextPosition=lstVec3nextPositions[0];
	positionArray[3*facea+0]=lstVec3nextPosition.x;
	positionArray[3*facea+1]=lstVec3nextPosition.y;
	positionArray[3*facea+2]=lstVec3nextPosition.z;

	lstVec3nextPosition=lstVec3nextPositions[1];
	positionArray[3*faceb+0]=lstVec3nextPosition.x;
	positionArray[3*faceb+1]=lstVec3nextPosition.y;
	positionArray[3*faceb+2]=lstVec3nextPosition.z;

	lstVec3nextPosition=lstVec3nextPositions[2];
	positionArray[3*facec+0]=lstVec3nextPosition.x;
	positionArray[3*facec+1]=lstVec3nextPosition.y;
	positionArray[3*facec+2]=lstVec3nextPosition.z;

	intersectedObject.mesh.geometry.attributes.position.needsUpdate=true;
	intersectedObject.mesh.updateMatrixWorld();
	intersectedObject.mesh.updateMatrix();
	intersectedObject.mesh.geometry.computeBoundingBox();
	this.updateTriangleSelector(intersectedObject,intersectedFace);
};
TriangleSelectorObject.prototype.updateIndexedFace=function(intersectedObject,intIntersectedFaceIndex,transformControls,intersectedFace){
	var lstUndoEntry=[];
	if(undefined==intersectedObject){
		return;
	}
	if(undefined==intersectedObject.mesh){
		return;
	}
	if(undefined==intersectedObject.mesh.geometry){
		return;
	}
	var positionArray=intersectedObject.mesh.geometry.attributes.position.array;
	var lstVec3prevPositions=[],lstVec3nextPositions=[];
	var lstVec3prevPosition,lstVec3nextPosition;
	var indexArray=intersectedObject.mesh.geometry.index.array;
	var facea=indexArray[3*intIntersectedFaceIndex+0];
	var faceb=indexArray[3*intIntersectedFaceIndex+1];
	var facec=indexArray[3*intIntersectedFaceIndex+2];

	lstVec3prevPosition=new THREE.Vector3();
	lstVec3nextPosition=new THREE.Vector3();
	lstVec3prevPosition.x=positionArray[3*facea+0];
	lstVec3prevPosition.y=positionArray[3*facea+1];
	lstVec3prevPosition.z=positionArray[3*facea+2];
	lstVec3nextPosition.x=positionArray[3*facea+0]+this.mesh.position.x;
	lstVec3nextPosition.y=positionArray[3*facea+1]+this.mesh.position.y;
	lstVec3nextPosition.z=positionArray[3*facea+2]+this.mesh.position.z;
	positionArray[3*facea+0]+=this.mesh.position.x;
	positionArray[3*facea+1]+=this.mesh.position.y;
	positionArray[3*facea+2]+=this.mesh.position.z;

	lstVec3prevPosition=new THREE.Vector3();
	lstVec3nextPosition=new THREE.Vector3();
	lstVec3prevPosition.x=positionArray[3*faceb+0];
	lstVec3prevPosition.y=positionArray[3*faceb+1];
	lstVec3prevPosition.z=positionArray[3*faceb+2];
	lstVec3nextPosition.x=positionArray[3*faceb+0]+this.mesh.position.x;
	lstVec3nextPosition.y=positionArray[3*faceb+1]+this.mesh.position.y;
	lstVec3nextPosition.z=positionArray[3*faceb+2]+this.mesh.position.z;
	positionArray[3*faceb+0]+=this.mesh.position.x;
	positionArray[3*faceb+1]+=this.mesh.position.y;
	positionArray[3*faceb+2]+=this.mesh.position.z;

	lstVec3prevPosition=new THREE.Vector3();
	lstVec3nextPosition=new THREE.Vector3();
	lstVec3prevPosition.x=positionArray[3*facec+0];
	lstVec3prevPosition.y=positionArray[3*facec+1];
	lstVec3prevPosition.z=positionArray[3*facec+2];
	lstVec3nextPosition.x=positionArray[3*facec+0]+this.mesh.position.x;
	lstVec3nextPosition.y=positionArray[3*facec+1]+this.mesh.position.y;
	lstVec3nextPosition.z=positionArray[3*facec+2]+this.mesh.position.z;
	positionArray[3*facec+0]+=this.mesh.position.x;
	positionArray[3*facec+1]+=this.mesh.position.y;
	positionArray[3*facec+2]+=this.mesh.position.z;

	lstUndoEntry.push(["indexedFace_position_i",intersectedObject,intIntersectedFaceIndex,lstVec3prevPositions,lstVec3nextPositions,intersectedFace,transformControls]);

	if(transformControls.lstUndoEntries.length<transformControls.intUndoRedoLimit)
			transformControls.lstUndoEntries.push(["indexedFace_position_i",this,lstUndoEntry]);
	else{
		for(var ii=1;ii<transformControls.lstUndoEntries.length;ii++)
			transformControls.lstUndoEntries[ii-1]=transformControls.lstUndoEntries[ii];
			transformControls.lstUndoEntries[transformControls.lstUndoEntry.length-1]=["indexedFace_position_i",this,lstUndoEntry];
	}
	intersectedObject.mesh.geometry.attributes.position.needsUpdate=true;
	intersectedObject.mesh.updateMatrixWorld();
	intersectedObject.mesh.updateMatrix();
	intersectedObject.mesh.geometry.computeBoundingBox();
};
TriangleSelectorObject.prototype.updateNonIndexedFace_undo=function(lstUndoEntry){
	var intersectedObject=lstUndoEntry[0][1];
	var intIntersectedFaceIndex=lstUndoEntry[0][2];
	var lstVec3prevPositions=lstUndoEntry[0][3];
	var lstVec3nextPositions=lstUndoEntry[0][4];
	var intersectedFace=lstUndoEntry[0][5];
	var transformControls=lstUndoEntry[0][6];
	var arrPositions=intersectedObject.mesh.geometry.attributes.position.array;
	var lstVec3prevPosition,lstVec3nextPosition;
	var j=0;
	for(var i=3*3*intIntersectedFaceIndex;i<3*3*(intIntersectedFaceIndex+1);i+=3){

		lstVec3prevPosition=lstVec3prevPositions[j];
		arrPositions[i+0]=lstVec3prevPosition.x;
		arrPositions[i+1]=lstVec3prevPosition.y;
		arrPositions[i+2]=lstVec3prevPosition.z;
		j++;
	}
	intersectedObject.mesh.geometry.attributes.position.needsUpdate=true;
	intersectedObject.mesh.updateMatrixWorld();
	intersectedObject.mesh.updateMatrix();
	intersectedObject.mesh.geometry.computeBoundingBox();
	this.updateTriangleSelector(intersectedObject,intersectedFace);
};
TriangleSelectorObject.prototype.updateNonIndexedFace_redo=function(lstRedoEntry){
	var intersectedObject=lstRedoEntry[0][1];
	var intIntersectedFaceIndex=lstRedoEntry[0][2];
	var lstVec3nextPositions=lstRedoEntry[0][4];
	var intersectedFace=lstRedoEntry[0][5];
	var transformControls=lstRedoEntry[0][6];
	var arrPositions=intersectedObject.mesh.geometry.attributes.position.array;
	var lstVec3nextPosition;
	var j=0;
	for (var i=3*3*intIntersectedFaceIndex;i<3*3*(intIntersectedFaceIndex+1);i+=3){
		lstVec3nextPosition=lstVec3nextPositions[j];
		arrPositions[i+0]=lstVec3nextPosition.x;
		arrPositions[i+1]=lstVec3nextPosition.y;
		arrPositions[i+2]=lstVec3nextPosition.z;
		j++;
	}
	intersectedObject.mesh.geometry.attributes.position.needsUpdate=true;
	intersectedObject.mesh.updateMatrixWorld();
	intersectedObject.mesh.updateMatrix();
	intersectedObject.mesh.geometry.computeBoundingBox();
	this.updateTriangleSelector(intersectedObject,intersectedFace);
};
TriangleSelectorObject.prototype.updateNonIndexedFace=function(intersectedObject,intIntersectedFaceIndex,transformControls,intersectedFace){
	var lstUndoEntry=[];
	if(undefined==intersectedObject){
		return;
	}
	if(undefined==intersectedObject.mesh){
		return;
	}
	if(undefined==intersectedObject.mesh.geometry){
		return;
	}
	var arrPositions=intersectedObject.mesh.geometry.attributes.position.array;
	var lstVec3prevPositions=[],lstVec3nextPositions=[];
	var lstVec3prevPosition,lstVec3nextPosition;
	for (var ii=3*3*intIntersectedFaceIndex;ii<3*3*(intIntersectedFaceIndex+1);ii+=3){
		lstVec3prevPosition=new THREE.Vector3();
		lstVec3nextPosition=new THREE.Vector3();
		lstVec3prevPosition.x=arrPositions[ii+0];
		lstVec3prevPosition.y=arrPositions[ii+1];
		lstVec3prevPosition.z=arrPositions[ii+2];
		lstVec3nextPosition.x=arrPositions[ii+0]+this.mesh.position.x;
		lstVec3nextPosition.y=arrPositions[ii+1]+this.mesh.position.y;
		lstVec3nextPosition.z=arrPositions[ii+2]+this.mesh.position.z;
		arrPositions[ii+0]+=this.mesh.position.x;
		arrPositions[ii+1]+=this.mesh.position.y;
		arrPositions[ii+2]+=this.mesh.position.z;
		lstVec3prevPositions.push(lstVec3prevPosition);
		lstVec3nextPositions.push(lstVec3nextPosition);
	}
	lstUndoEntry.push(["nonIndexedFace_position_i",intersectedObject,intIntersectedFaceIndex,lstVec3prevPositions,lstVec3nextPositions,intersectedFace,transformControls]);

	if(transformControls.lstUndoEntries.length<transformControls.intUndoRedoLimit)
			transformControls.lstUndoEntries.push(["nonIndexedFace_position_i",this,lstUndoEntry]);
	else{
		for(var ii=1;ii<transformControls.lstUndoEntries.length;ii++)
			transformControls.lstUndoEntries[ii-1]=transformControls.lstUndoEntries[ii];
			transformControls.lstUndoEntries[transformControls.lstUndoEntry.length-1]=["nonIndexedFace_position_i",this,lstUndoEntry];
	}
	intersectedObject.mesh.geometry.attributes.position.needsUpdate=true;
	intersectedObject.mesh.updateMatrixWorld();
	intersectedObject.mesh.updateMatrix();
	intersectedObject.mesh.geometry.computeBoundingBox();
};
TriangleSelectorObject.prototype.updateFace=function(intersectedObject,intIntersectedFaceIndex,transformControl,intersectedFace){
	if(null!=intersectedObject.mesh.geometry.index)
		this.updateIndexedFace(intersectedObject,intIntersectedFaceIndex,transformControl,intersectedFace);
	else
		this.updateNonIndexedFace(intersectedObject,intIntersectedFaceIndex,transformControl,intersectedFace);
};
TriangleSelectorObject.prototype.setColorHex=function(colorHex){
	this.mesh.material.color.setHex(colorHex);
};
TriangleSelectorObject.prototype.getColorHex=function(){
	return this.mesh.material.color.getHex();
};
TriangleSelectorObject.prototype.setCurrentColorHex=function(){
	this.currentHex=this.getColorHex();
};
TriangleSelectorObject.prototype.setFltOpacity=function(fltOpacity){
	this.mesh.material.opacity=fltOpacity;
};
TriangleSelectorObject.prototype.getFltOpacity=function(){
	return this.mesh.material.opacity;
};
TriangleSelectorObject.prototype.setCurrentFltOpacity=function(){
	this.currentFltOpacity=this.getFltOpacity();
};
TriangleSelectorObject.prototype.setBlnTransparency=function(blnTransparency){
	this.mesh.material.transparent=blnTransparency;
};
TriangleSelectorObject.prototype.getBlnTransparency=function(){
	return this.mesh.material.transparent;
};
TriangleSelectorObject.prototype.setCurrentBlnTransparency=function(){
	this.currentBlnTransparency=this.getBlnTransparency();
};
TriangleSelectorObject.prototype.traverse=function(callback){
	return this.mesh.traverse(callback);
};
var BoxSelectorObject=function(){
	this.strType="BoxSelectorObject";
	this.blnSelectWhole=true;
	this.blnSelectVertices=false;
	var geometry=new THREE.BoxGeometry(.1,.1,.1);
	var material=new THREE.MeshBasicMaterial({color:0xff3c00});
	material.transparent=true;
	material.opacity=0.3;
	this.vec3prevPosition=new THREE.Vector3();
	this.mesh=new THREE.Mesh(geometry,material);
	this.mesh.visible=false;
	//this.mesh.layers.enable(1);
};
BoxSelectorObject.prototype.update=function(){
	this.mesh=new THREE.Mesh(this.mesh.geometry,this.mesh.material);
	this.mesh.visible=false;
	//this.mesh.layers.enable(1);
};

var SphereSelectorObject=function(){
	this.strType="SphereSelectorObject";
	this.blnSelectWhole=true;
	this.blnSelectVertices=false;
	var geometry=new THREE.SphereGeometry(1,32,32);
	var material=new THREE.MeshBasicMaterial({color:0xff3c00});
	material.transparent=true;
	material.opacity=0.3;
	this.vec3prevPosition=new THREE.Vector3();
	this.mesh=new THREE.Mesh(geometry,material);
	this.mesh.visible=false;
	//this.mesh.layers.enable(1);
};
SphereSelectorObject.prototype.update=function(){
	this.mesh=new THREE.Mesh(this.mesh.geometry,this.mesh.material);
	this.mesh.visible=false;
	//this.mesh.layers.enable(1);
};
SphereSelectorObject.prototype.updateIndexedVertex_undo=function(lstUndoEntry){
	var intersectedObject=lstUndoEntry[0][1];
	var intSelectedVertexIndex=lstUndoEntry[0][2];
	var vec3selectedVertex=lstUndoEntry[0][3];
	var vec3prevPosition=lstUndoEntry[0][4];
	var vec3meshPrevPosition=lstUndoEntry[0][5];
	var vec3nextPosition=lstUndoEntry[0][6];
	var vec3meshNextPosition=lstUndoEntry[0][7];
	var transformControls=lstUndoEntry[0][8];

	var arrPositions=intersectedObject.mesh.geometry.attributes.position.array;
	arrPositions[3*intSelectedVertexIndex+0]=vec3prevPosition.x;
	arrPositions[3*intSelectedVertexIndex+1]=vec3prevPosition.y;
	arrPositions[3*intSelectedVertexIndex+2]=vec3prevPosition.z;
	this.vec3prevPosition.x=vec3meshPrevPosition.x;
	this.vec3prevPosition.y=vec3meshPrevPosition.y;
	this.vec3prevPosition.z=vec3meshPrevPosition.z;
	this.mesh.position.x=vec3meshPrevPosition.x;
	this.mesh.position.y=vec3meshPrevPosition.y;
	this.mesh.position.z=vec3meshPrevPosition.z;
	transformControls.matrixHardDrive.updateTriangleSelector();

	intersectedObject.mesh.geometry.attributes.position.needsUpdate=true;
	intersectedObject.mesh.updateMatrixWorld();
	intersectedObject.mesh.updateMatrix();
	intersectedObject.mesh.geometry.computeBoundingBox();
};
SphereSelectorObject.prototype.updateIndexedVertex_redo=function(lstRedoEntry){
	var intersectedObject=lstRedoEntry[0][1];
	var intSelectedVertexIndex=lstRedoEntry[0][2];
	var vec3selectedVertex=lstRedoEntry[0][3];
	var vec3prevPosition=lstRedoEntry[0][4];
	var vec3meshPrevPosition=lstRedoEntry[0][5];
	var vec3nextPosition=lstRedoEntry[0][6];
	var vec3meshNextPosition=lstRedoEntry[0][7];
	var transformControls=lstRedoEntry[0][8];

	var arrPositions=intersectedObject.mesh.geometry.attributes.position.array;
	arrPositions[3*intSelectedVertexIndex+0]=vec3nextPosition.x;
	arrPositions[3*intSelectedVertexIndex+1]=vec3nextPosition.y;
	arrPositions[3*intSelectedVertexIndex+2]=vec3nextPosition.z;
	this.vec3prevPosition.x=vec3meshNextPosition.x;
	this.vec3prevPosition.y=vec3meshNextPosition.y;
	this.vec3prevPosition.z=vec3meshNextPosition.z;
	this.mesh.position.x=vec3meshNextPosition.x;
	this.mesh.position.y=vec3meshNextPosition.y;
	this.mesh.position.z=vec3meshNextPosition.z;
	transformControls.matrixHardDrive.updateTriangleSelector();

	intersectedObject.mesh.geometry.attributes.position.needsUpdate=true;
	intersectedObject.mesh.updateMatrixWorld();
	intersectedObject.mesh.updateMatrix();
	intersectedObject.mesh.geometry.computeBoundingBox();
};
SphereSelectorObject.prototype.updateIndexedVertex=function(intersectedObject,intSelectedVertexIndex,vec3selectedVertex,transformControls){
	if(undefined==intersectedObject){
		return;
	}
	if(undefined==intersectedObject.mesh){
		return;
	}
	if(undefined==intersectedObject.mesh.geometry){
		return;
	}
	var arrPositions=intersectedObject.mesh.geometry.attributes.position.array;
	var lstUndoEntry=[];
	var vec3prevPosition,vec3nextPosition,vec3meshPrevPosition,vec3meshNextPosition;
	vec3prevPosition=new THREE.Vector3();
	vec3meshPrevPosition=new THREE.Vector3();
	vec3nextPosition=new THREE.Vector3();
	vec3meshNextPosition=new THREE.Vector3();
	vec3prevPosition.x=arrPositions[3*intSelectedVertexIndex+0];
	vec3prevPosition.y=arrPositions[3*intSelectedVertexIndex+1];
	vec3prevPosition.z=arrPositions[3*intSelectedVertexIndex+2];
	vec3meshPrevPosition.x=this.vec3prevPosition.x;
	vec3meshPrevPosition.y=this.vec3prevPosition.y;
	vec3meshPrevPosition.z=this.vec3prevPosition.z;
	arrPositions[3*intSelectedVertexIndex+0]+=(this.mesh.position.x-this.vec3prevPosition.x);
	arrPositions[3*intSelectedVertexIndex+1]+=(this.mesh.position.y-this.vec3prevPosition.y);
	arrPositions[3*intSelectedVertexIndex+2]+=(this.mesh.position.z-this.vec3prevPosition.z);
	vec3nextPosition.x=arrPositions[3*intSelectedVertexIndex+0];
	vec3nextPosition.y=arrPositions[3*intSelectedVertexIndex+1];
	vec3nextPosition.z=arrPositions[3*intSelectedVertexIndex+2];
	
	this.vec3prevPosition.x=this.mesh.position.x;
	this.vec3prevPosition.y=this.mesh.position.y;
	this.vec3prevPosition.z=this.mesh.position.z;
	vec3meshNextPosition.x=this.mesh.position.x;
	vec3meshNextPosition.y=this.mesh.position.y;
	vec3meshNextPosition.z=this.mesh.position.z;
	lstUndoEntry.push(["indexedVertex_position_i",intersectedObject,intSelectedVertexIndex,vec3selectedVertex,vec3prevPosition,vec3meshPrevPosition,vec3nextPosition,vec3meshNextPosition,transformControls]);
	if(transformControls.lstUndoEntries.length<transformControls.intUndoRedoLimit)
			transformControls.lstUndoEntries.push(["indexedVertex_position_i",this,lstUndoEntry]);
	else{
		for(var ii=1;ii<transformControls.lstUndoEntries.length;ii++)
			transformControls.lstUndoEntries[ii-1]=transformControls.lstUndoEntries[ii];
			transformControls.lstUndoEntries[transformControls.lstUndoEntry.length-1]=["indexedVertex_position_i",this,lstUndoEntry];
	}
	intersectedObject.mesh.geometry.attributes.position.needsUpdate=true;
	intersectedObject.mesh.updateMatrixWorld();
	intersectedObject.mesh.updateMatrix();
	intersectedObject.mesh.geometry.computeBoundingBox();
};
SphereSelectorObject.prototype.updateVertex=function(intersectedObject,intSelectedVertexIndex,vec3selectedVertex,transformControls){
	//if(null!=intersectedObject.mesh.geometry.index)
		this.updateIndexedVertex(intersectedObject,intSelectedVertexIndex,vec3selectedVertex,transformControls);
	//else
		//this.updateNonIndexedVertex(intersectedObject,intSelectedVertexIndex,vec3selectedVertex,transformControls);
};
var LandscapeObject=function(fltWidth,fltHeight,intWidthSegments,intHeightSegments,regionsRoot,fltMountainMax,blnFlatLandscape,colColor){
	this.strType="LandscapeObject";
	this.lstUndoEntries=[];
	this.lstRedoEntries=[];
	//this.blnSelectWhole=true;
	this.blnSelectWhole=false;
	this.blnSelectVertices=true;
	//this.blnSelectVertices=false;
	var geometry=new THREE.PlaneGeometry(fltWidth,fltHeight,intWidthSegments,intHeightSegments);
	this.fltWidth=fltWidth;
	this.fltHeight=fltHeight;
	this.intWidthSegments=intWidthSegments;
	this.intHeightSegments=intHeightSegments;
	this.regionsRoot=regionsRoot;
	this.fltMountainMax=fltMountainMax;
	this.blnFlatLandscape=blnFlatLandscape;
	geometry.rotateX(-Math.PI/2);
	this.arrPositions=geometry.getAttribute("position").array;
	this.flatLandscapeVertices=[];
	for(var ii=0;ii<this.arrPositions.length;ii+=3){
		this.flatLandscapeVertices.push(this.arrPositions[ii+0]);
		this.flatLandscapeVertices.push(this.arrPositions[ii+1]);
		this.flatLandscapeVertices.push(this.arrPositions[ii+2]);
	}
	if(false==blnFlatLandscape){
		var vec3vertex=new THREE.Vector3();

		var fltDistance;
		for(var ii=0;ii<this.arrPositions.length;ii+=3){

			vec3vertex.set(this.flatLandscapeVertices[ii+0],this.flatLandscapeVertices[ii+1],this.flatLandscapeVertices[ii+2]);

			vec3vertex.x+=Math.random()*10-5;
			vec3vertex.z+=Math.random()*10-5;

			fltDistance=(vec3vertex.distanceTo(this.regionsRoot.position)/5)-25;
			vec3vertex.y=Math.min(Math.random()*Math.max(0,fltDistance),this.fltMountainMax);

			vec3vertex.toArray(this.arrPositions,ii);

		}
	}

	geometry.computeVertexNormals();
	geometry.attributes.position.needsUpdate=true;
	geometry.computeBoundingBox();
	this.colColor=colColor;
	var defaultLandscapeColor=0xff3c00;
	var material=new THREE.MeshLambertMaterial({
		color:defaultLandscapeColor,
		side:THREE.DoubleSide
	});
	material.color=colColor;
	this.mesh=new THREE.Mesh(geometry,material);
	this.mesh.layers.enable(1);
};
LandscapeObject.prototype.clone=function(blnNewMesh){
	var dst=new LandscapeObject(this.fltWidth,this.fltHeight,this.intWidthSegments,this.intHeightSegments,this.regionsRoot,this.fltMountainMax,this.blnFlatLandscape,this.colColor);
	dst.blnSelectWhole=this.blnSelectWhole;
	dst.blnSelectVertices=this.blnSelectVertices;
	dst.lstUndoEntries=this.lstUndoEntries;
	dst.lstRedoEntries=this.lstRedoEntries;
	dst.fltWidth=this.fltWidth;
	dst.fltHeight=this.fltHeight;
	dst.intWidthSegments=this.intWidthSegments;
	dst.intHeightSegments=this.intHeightSegments;
	dst.regionsRoot=this.regionsRoot;
	dst.fltMountainMax=this.fltMountainMax;
	dst.blnFlatLandscape=this.blnFlatLandscape;
	dst.arrPositions=this.arrPositions;
	dst.flatLandscapeVertices=this.flatLandscapeVertices;
	dst.colColor=this.colColor;
	if(true==blnNewMesh)
		dst.mesh=new THREE.Mesh(this.mesh.geometry,this.mesh.material);
	else
		dst.mesh=this.mesh;
	dst.mesh.layers.enable(1);
	return dst;
};
LandscapeObject.prototype.saveToString=function(){
	var objSave={};
	this.arrPositions=this.mesh.geometry.getAttribute("position").array;
	objSave.arrPositions=this.arrPositions;
	var strSave="LandscapeObject|"+String.fromCharCode(10);
	strSave+=JSON.stringify(objSave);
	strSave+="|"+String.fromCharCode(10);
	return strSave;
};
LandscapeObject.prototype.loadFromString=function(strLandscape){
	var strType="LandscapeObject";
	var objLoad=null;
	objLoad=JSON.parse(strLandscape);
	this.loadObject(objLoad.arrPositions);
};
LandscapeObject.prototype.update=function ( blnFlatLandscape ) {
	this.lstUndoEntries=[];//TODO
	this.lstRedoEntries=[];//TODO
	this.blnFlatLandscape=blnFlatLandscape;
	if(false==blnFlatLandscape){
		var vec3vertex=new THREE.Vector3();

		var fltDistance;
		for(var ii=0;ii<this.arrPositions.length;ii+=3){
			vec3vertex.set(this.flatLandscapeVertices[ii+0],this.flatLandscapeVertices[ii+1],this.flatLandscapeVertices[ii+2]);

			vec3vertex.x+=Math.random()*10-5;
			vec3vertex.z+=Math.random()*10-5;

			fltDistance=(vec3vertex.distanceTo(this.regionsRoot.position)/5)-25;
			vec3vertex.y=Math.min(Math.random()*Math.max(0,fltDistance),this.fltMountainMax);

			vec3vertex.toArray(this.arrPositions,ii);

		}

		this.mesh.geometry.computeVertexNormals();
		this.mesh.geometry.attributes.position.needsUpdate=true;
		this.mesh.geometry.computeBoundingBox();
	}
	this.mesh=new THREE.Mesh(this.mesh.geometry,this.mesh.material);
	this.mesh.layers.enable(1);
};
LandscapeObject.prototype.loadObject=function(arrVertices){
	this.lstUndoEntries=[];//TODO
	this.lstRedoEntries=[];//TODO
	this.blnFlatLandscape=false;
	var vec3vertex=new THREE.Vector3();
	for(var ii=0;ii<this.arrPositions.length;ii+=3){
		vec3vertex.set(arrVertices[ii+0],arrVertices[ii+1],arrVertices[ii+2]);
		vec3vertex.toArray(this.arrPositions,ii);
	}
	this.mesh.geometry.computeVertexNormals();
	this.mesh.geometry.attributes.position.needsUpdate=true;
	this.mesh.geometry.computeBoundingBox();
	this.mesh.layers.enable(1);
};
LandscapeObject.prototype.setColorHex=function(colorHex){
	this.mesh.material.color.setHex(colorHex);
};
LandscapeObject.prototype.getColorHex=function(){
	return this.mesh.material.color.getHex();
};
LandscapeObject.prototype.setCurrentColorHex=function(){
	this.currentHex=this.getColorHex();
};
LandscapeObject.prototype.setFltOpacity=function(fltOpacity){
	this.mesh.material.opacity=fltOpacity;
};
LandscapeObject.prototype.getFltOpacity=function(){
	return this.mesh.material.opacity;
};
LandscapeObject.prototype.setCurrentFltOpacity=function(){
	this.currentFltOpacity=this.getFltOpacity();
};
LandscapeObject.prototype.setBlnTransparency=function(blnTransparency){
	this.mesh.material.transparent=blnTransparency;
};
LandscapeObject.prototype.getBlnTransparency=function(){
	return this.mesh.material.transparent;
};
LandscapeObject.prototype.setCurrentBlnTransparency=function(){
	this.currentBlnTransparency=this.getBlnTransparency();
};
LandscapeObject.prototype.traverse=function(callback){
	return this.mesh.traverse(callback);
};
var RoadGeometry=function(curve,intDivisions,fltWidth,landscape,vec3fixedNormal){
	THREE.BufferGeometry.call(this);

	this.intMaxDivisions=2000;
	this.intDivisions=intDivisions;
	this.fltWidth=fltWidth;
	this.curve=curve;
	this.landscape=landscape;
};
RoadGeometry.prototype=Object.create(THREE.BufferGeometry.prototype);
RoadGeometry.prototype.extrudeRoad=function(){
	var minX=-1.*this.fltWidth/2.;
	var maxX=this.fltWidth/2.;

	var lstVertices=[];
	var lstNormals=[];
	this.lstVec3roadVertices=[];
	this.lstVec3roadNormals=[];
	var lstVec3roadVertices=this.lstVec3roadVertices;
	var lstVec3roadNormals=this.lstVec3roadNormals;

	var vec3up=new THREE.Vector3(0,1,0);
	var vec3forward=new THREE.Vector3();
	var vec3right=new THREE.Vector3();

	var quaternion=new THREE.Quaternion();
	var prevQuaternion=new THREE.Quaternion();
	prevQuaternion.setFromAxisAngle(vec3up,Math.PI/2);

	var vec3fixedNormal=new THREE.Vector3();
	var planeQuaternion=new THREE.Quaternion();
	vec3fixedNormal=this.curve.getFixedNormalAt(0/this.intDivisions,this.landscape);
	this.getFixedNormalPlaneQuaternion(vec3fixedNormal,planeQuaternion);
	planeQuaternion.multiply(prevQuaternion);
	prevQuaternion=planeQuaternion.clone();
	var vec3point=new THREE.Vector3();
	var vec3prevPoint=new THREE.Vector3();
	vec3prevPoint.copy(this.curve.getPointAt(0,this.landscape));
	var lstVec3planeShape=[];
	var intDivs=1;//plane "x-axis" intDivisions to extrude
	var intI=minX;
	for (var j=0;j<=intDivs;j++){
		lstVec3planeShape.push(new THREE.Vector3(intI,0,0));
		intI+=(maxX-minX)/intDivs;
	}

	var vec3vector1=new THREE.Vector3();
	var vec3vector2=new THREE.Vector3();
	var vec3vector3=new THREE.Vector3();
	var vec3vector4=new THREE.Vector3();

	var vec3normal1=new THREE.Vector3();
	var vec3normal2=new THREE.Vector3();
	var vec3normal3=new THREE.Vector3();
	var vec3normal4=new THREE.Vector3();

	var vec3offset=new THREE.Vector3();
	var vec3shapeNormal=new THREE.Vector3();
	var lstShapeNormals=[];

	for(var ii=0;ii<=this.intDivisions;ii++){

		vec3point.copy(this.curve.getPointAt(ii/this.intDivisions,this.landscape));
		vec3shapeNormal.copy(this.curve.getNormalAt(ii/this.intDivisions,this.landscape));
		lstShapeNormals=[vec3shapeNormal.clone(),vec3shapeNormal.clone()];
		vec3fixedNormal=this.curve.getFixedNormalAt(ii/this.intDivisions,this.landscape);
		this.getFixedNormalPlaneQuaternion(vec3fixedNormal,planeQuaternion);

		vec3up.set(0,1,0);
		vec3forward.subVectors(vec3point,vec3prevPoint).normalize();
		vec3right.crossVectors(vec3up,vec3forward).normalize();

		var fltAngle=Math.atan2(vec3forward.x,vec3forward.z);

		quaternion.setFromAxisAngle(vec3up,fltAngle);
		planeQuaternion.multiply(quaternion);

		this.extrudeShape(lstVec3planeShape,vec3offset.set(0,0,0),lstShapeNormals,vec3point,vec3prevPoint,planeQuaternion,prevQuaternion,vec3vector1,vec3vector2,vec3vector3,vec3vector4,lstVertices,vec3normal1,vec3normal2,vec3normal3,vec3normal4,lstNormals);

		vec3prevPoint.copy(vec3point);
		prevQuaternion.copy(planeQuaternion);
	}

	this.setAttribute("position",new THREE.BufferAttribute(new Float32Array(lstVertices),3));
	this.setAttribute("normal",new THREE.BufferAttribute(new Float32Array(lstNormals),3));
	this.arrPositions=this.getAttribute("position").array;
	this.arrNormals=this.getAttribute("normal").array;
};
RoadGeometry.prototype.extrudeShape=function(lstVec3shape,vec3offset,lstShapeNormals,vec3point,vec3prevPoint,planeQuaternion,prevQuaternion,vec3vector1,vec3vector2,vec3vector3,vec3vector4,lstVertices,vec3normal1,vec3normal2,vec3normal3,vec3normal4,lstNormals){

		var intLstVec3shapeLenght=lstVec3shape.length;
		for(var ii=0;ii<intLstVec3shapeLenght;ii++){
			var vec3point1=lstVec3shape[ii];
			var vec3point2=lstVec3shape[(ii+1)%intLstVec3shapeLenght];

			var vec3normal1=lstShapeNormals[ii];
			var vec3normal2=lstShapeNormals[(ii+1)%intLstVec3shapeLenght];

			vec3vector1.copy(vec3point1).add(vec3offset);
			vec3vector1.applyQuaternion(planeQuaternion);
			vec3vector1.add(vec3point);

			vec3vector2.copy(vec3point2).add(vec3offset);
			vec3vector2.applyQuaternion(planeQuaternion);
			vec3vector2.add(vec3point);

			vec3vector3.copy(vec3point2).add(vec3offset);
			vec3vector3.applyQuaternion(prevQuaternion);
			vec3vector3.add(vec3prevPoint);

			vec3vector4.copy(vec3point1).add(vec3offset);
			vec3vector4.applyQuaternion(prevQuaternion);
			vec3vector4.add(vec3prevPoint);

			lstVertices.push(vec3vector1.x,vec3vector1.y,vec3vector1.z);
			lstVertices.push(vec3vector2.x,vec3vector2.y,vec3vector2.z);
			lstVertices.push(vec3vector4.x,vec3vector4.y,vec3vector4.z);

			lstVertices.push(vec3vector2.x,vec3vector2.y,vec3vector2.z);
			lstVertices.push(vec3vector3.x,vec3vector3.y,vec3vector3.z);
			lstVertices.push(vec3vector4.x,vec3vector4.y,vec3vector4.z);

			vec3normal1.copy(vec3normal1);

			vec3normal2.copy(vec3normal2);

			vec3normal3.copy(vec3normal2);

			vec3normal4.copy(vec3normal1);

			lstNormals.push(vec3normal1.x,vec3normal1.y,vec3normal1.z);
			lstNormals.push(vec3normal2.x,vec3normal2.y,vec3normal2.z);
			lstNormals.push(vec3normal4.x,vec3normal4.y,vec3normal4.z);

			lstNormals.push(vec3normal2.x,vec3normal2.y,vec3normal2.z);
			lstNormals.push(vec3normal3.x,vec3normal3.y,vec3normal3.z);
			lstNormals.push(vec3normal4.x,vec3normal4.y,vec3normal4.z);
		}
};
RoadGeometry.prototype.getFixedNormalPlaneQuaternion=function(vec3fixedNormal,planeQuaternion){
		if(undefined==vec3fixedNormal){
			planeQuaternion.setFromAxisAngle(new THREE.Vector3(1,0,0),0);
		}else{
			planeQuaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),vec3fixedNormal);
		}
};

RoadGeometry.prototype.update=function(curve,intDivisions,fltWidth,landscape,vec3fixedNormal){
	this.intDivisions=intDivisions;
	this.fltWidth=fltWidth;
	this.curve=curve;
	this.landscape=landscape;
	
	this.extrudeRoad();
};
var RoadObject=function(curve,intDivisions,fltWidth,landscape,vec3fixedNormal){
	this.strType="RoadObject";
	this.superRoadsObject=null;
	this.strRoadType="Simple";
	this.blnSelectWhole=true;
	this.blnSelectVertices=false;
	this.lstUndoEntries=[];
	this.lstRedoEntries=[];
	var geometry=new RoadGeometry(curve,intDivisions,fltWidth,landscape,vec3fixedNormal);
	geometry.extrudeRoad();
	//TODO: different road types RoadObject(...,colDiffuse);
	this.colDiffuse=new THREE.Color("rgb(100,100,100)");
	var material=new THREE.MeshPhongMaterial({
		color:this.colDiffuse
	});
	this.mesh=new THREE.Mesh(geometry,material);
	this.mesh.layers.enable(1);
}
RoadObject.prototype.update=function(curve,intDivisions,fltWidth,landscape,vec3fixedNormal){
	//this.lstUndoEntries=[];//TODO
	//this.lstRedoEntries=[];//TODO
	this.mesh.geometry.update(curve,intDivisions,fltWidth,landscape,vec3fixedNormal);
	this.mesh=new THREE.Mesh(this.mesh.geometry,this.mesh.material);
	this.mesh.layers.enable(1);
};
RoadObject.prototype.updateGeometry=function(curve,intDivisions,fltWidth,landscape,vec3fixedNormal){
	//this.lstUndoEntries=[];//TODO
	//this.lstRedoEntries=[];//TODO
	this.mesh.geometry.update(curve,intDivisions,fltWidth,landscape,vec3fixedNormal);
	this.mesh.layers.enable(1);
};
RoadObject.prototype.loadObject=function(curve,intDivisions,fltWidth,landscape){
	//this.lstUndoEntries=[];//TODO
	//this.lstRedoEntries=[];//TODO
	this.mesh.geometry.update(curve,intDivisions,fltWidth,landscape);
	this.setColorHex(0xff3c00);
	this.mesh.layers.enable(1);
};
RoadObject.prototype.setColorHex=function(colorHex){
	this.mesh.material.color.setHex(colorHex);
};
RoadObject.prototype.getColorHex=function(){
	return this.mesh.material.color.getHex();
};
RoadObject.prototype.setCurrentColorHex=function(){
	this.currentHex=this.getColorHex();
};
RoadObject.prototype.setFltOpacity=function(fltOpacity){
	this.mesh.material.opacity=fltOpacity;
};
RoadObject.prototype.getFltOpacity=function(){
	return this.mesh.material.opacity;
};
RoadObject.prototype.setCurrentFltOpacity=function(){
	this.currentFltOpacity=this.getFltOpacity();
};
RoadObject.prototype.setBlnTransparency=function(blnTransparency){
	this.mesh.material.transparent=blnTransparency;
};
RoadObject.prototype.getBlnTransparency=function(){
	return this.mesh.material.transparent;
};
RoadObject.prototype.setCurrentBlnTransparency=function(){
	this.currentBlnTransparency=this.getBlnTransparency();
};
RoadObject.prototype.traverse=function(callback){
	return this.mesh.traverse(callback);
};
RoadObject.prototype.addToView=function(grid){
	grid.add(this.mesh);
};
RoadObject.prototype.removeFromView=function(grid){
	grid.remove(this.mesh);
};
var RoadsObject=function(roadObject,advancedCurve){
	this.strType="RoadsObject";
	this.lstRoadTypes=[];
	this.blnSelectWhole=true;//TODO:
	this.blnSelectVertices=false;//TODO:
	this.intRoadOn=-1;
	this.intSelectedRoad=-1;
	this.lstRoadObjects=[];
	this.lstAdvancedCurves=[];
	this.lstJunctionPoints=[];//[lstIntRoadNumbers=[],vec3realPoint,lstFltTjunctions=[fltTjunction]]
	//vec3realPoint with attached controller
	this.lstJunctionControlObjects=[];//with position==vec3realPoint
	if(undefined!=roadObject&&"RoadObject"==roadObject.strType&&
		undefined!=advancedCurve&&"AdvancedCurve"==advancedCurve.strType){
		this.pushRoad(roadObject,advancedCurve);
	}
};
RoadsObject.prototype.pushRoad=function(roadObject,advancedCurve){
	this.lstRoadObjects.push(roadObject);
	if(-1==this.lstRoadTypes.indexOf(this.lstRoadObjects[this.lstRoadObjects.length-1].strRoadType)){
		this.lstRoadTypes.push(this.lstRoadObjects[this.lstRoadObjects.length-1].strRoadType);
	}
	this.lstAdvancedCurves.push(advancedCurve);
	//TODO:
	this.intRoadOn=this.lstRoadObjects.length-1;
	this.intSelectedRoad=this.lstRoadObjects.length-1;
	roadObject.superRoadsObject=this;
	advancedCurve.superRoadsObject=this;
};
RoadsObject.prototype.pushAndCreateRoadWithFixedNormal=function(curve,intDivisions,fltWidth,landscape,vec3fixedNormal){
	var lstRoadObjectsFactory=window.mhd.regions.lstRoadObjectsFactory;
	var roadObject;
	if(0==lstRoadObjectsFactory.length){
		lstRoadObjectsFactory.push(new RoadObject(curve,intDivisions,fltWidth,landscape,vec3fixedNormal));
		roadObject=lstRoadObjectsFactory.pop();
	}else{
		roadObject=lstRoadObjectsFactory.pop();
		roadObject.update(curve,intDivisions,fltWidth,landscape,vec3fixedNormal);
	}
	this.lstRoadObjects.push(roadObject);
	if(-1==this.lstRoadTypes.indexOf(this.lstRoadObjects[this.lstRoadObjects.length-1].strRoadType)){
		this.lstRoadTypes.push(this.lstRoadObjects[this.lstRoadObjects.length-1].strRoadType);
	}
	this.lstAdvancedCurves.push(curve);
	this.intRoadOn=this.lstRoadObjects.length-1;
	this.intSelectedRoad=this.lstRoadObjects.length-1;
	this.lstRoadObjects[this.lstRoadObjects.length-1].superRoadsObject=this;
	this.lstAdvancedCurves[this.lstAdvancedCurves.length-1].superRoadsObject=this;
	this.lstAdvancedCurves[this.lstAdvancedCurves.length-1].lstRoadsToUpdate=[this.lstRoadObjects[this.lstRoadObjects.length-1]];
};
RoadsObject.prototype.pushAndCreateRoad=function(curve,intDivisions,fltWidth,landscape){
	var lstRoadObjectsFactory=window.mhd.regions.lstRoadObjectsFactory;
	var roadObject;
	if(0==lstRoadObjectsFactory.length){
		lstRoadObjectsFactory.push(new RoadObject(curve,intDivisions,fltWidth,landscape));
		roadObject=lstRoadObjectsFactory.pop();
	}else{
		roadObject=lstRoadObjectsFactory.pop();
		roadObject.update(curve,intDivisions,fltWidth,landscape);
	}
	this.lstRoadObjects.push(roadObject);
	if(-1==this.lstRoadTypes.indexOf(this.lstRoadObjects[this.lstRoadObjects.length-1].strRoadType)){
		this.lstRoadTypes.push(this.lstRoadObjects[this.lstRoadObjects.length-1].strRoadType);
	}
	this.lstAdvancedCurves.push(curve);
	this.intRoadOn=this.lstRoadObjects.length-1;
	this.intSelectedRoad=this.lstRoadObjects.length-1;
	this.lstRoadObjects[this.lstRoadObjects.length-1].superRoadsObject=this;
	this.lstAdvancedCurves[this.lstAdvancedCurves.length-1].superRoadsObject=this;
	this.lstAdvancedCurves[this.lstAdvancedCurves.length-1].lstRoadsToUpdate=[this.lstRoadObjects[this.lstRoadObjects.length-1]];
};
RoadsObject.prototype.pushAndCreateRoadFromPoints=function(lstVec3points,fltWidth,landscape,grid){
	var lstRoadAdvancedCurvesFactory=window.mhd.regions.lstRoadAdvancedCurvesFactory;
	var curve=new AdvancedCurve();
	if(0==lstRoadAdvancedCurvesFactory.length){
		lstRoadAdvancedCurvesFactory.push(new AdvancedCurve());
	}
	curve=lstRoadAdvancedCurvesFactory.pop();
	grid.updateMatrixWorld();
	grid.updateMatrix();
	var lstVec3points_local=[];
	for(var ii=0;ii<lstVec3points.length;ii++){
		lstVec3points_local[ii]=grid.worldToLocal(lstVec3points[ii].clone());
	}
	curve.loadFromPoints(lstVec3points_local);
	this.pushAndCreateRoad(curve,lstVec3points_local.length,fltWidth,landscape);
	this.lstRoadObjects[this.lstRoadObjects.length-1].addToView(grid);
	this.lstAdvancedCurves[this.lstAdvancedCurves.length-1].addToView(grid);
	return [this.lstRoadObjects[this.lstRoadObjects.length-1],this.lstAdvancedCurves[this.lstAdvancedCurves.length-1]];
};
RoadsObject.prototype.pushAndCreateRoadFromPointsAndFixedNormal=function(lstVec3points,vec3fixedNormal,fltWidth,landscape,grid){
	var lstRoadAdvancedCurvesFactory=window.mhd.regions.lstRoadAdvancedCurvesFactory;
	var curve=new AdvancedCurve();
	if(0==lstRoadAdvancedCurvesFactory.length){
		lstRoadAdvancedCurvesFactory.push(new AdvancedCurve());
	}
	curve=lstRoadAdvancedCurvesFactory.pop();
	var lstVec3points_local=[];
	for(var ii=0;ii<lstVec3points.length;ii++){
		lstVec3points_local[ii]=grid.worldToLocal(lstVec3points[ii].clone());
	}
	curve.loadFromPointsAndFixedNormal(lstVec3points_local,vec3fixedNormal);
	this.pushAndCreateRoadWithFixedNormal(curve,lstVec3points_local.length,fltWidth,landscape,vec3fixedNormal);
	this.lstRoadObjects[this.lstRoadObjects.length-1].addToView(grid);
	this.lstAdvancedCurves[this.lstRoadObjects.length-1].addToView(grid);
};
RoadsObject.prototype.popRoad=function(){
	var lstReturn=[];
	//TODO:
	//var strRoadType=this.lstRoadObjects[this.lstRoadObjects.length-1].strRoadType;
	lstReturn[0]=this.lstRoadObjects.pop();
	var blnTypeFound=false;
	for(var ii=0;ii<this.lstRoadObjects.length;ii++){
		if(lstReturn[0].strRoadType==this.lstRoadObjects[ii].strRoadType)
			blnTypeFound=true;
	}
	if(false==blnTypeFound){
		var intType=this.lstRoadTypes.indexOf(lstReturn[0].strRoadType);	
		this.lstRoadTypes.splice(intType,1);
	}
	lstReturn[1]=this.lstAdvancedCurves.pop();
	this.intRoadOn=this.lstRoadObjects.length-1;
	this.intSelectedRoad=this.lstRoadObjects.length-1;
	return lstReturn;
};
RoadsObject.prototype.cleanups=function(){
	var lstRoadAdvancedCurvesFactory=window.mhd.regions.lstRoadAdvancedCurvesFactory;
	var lstRoadObjectsFactory=window.mhd.regions.lstRoadObjectsFactory;
	var lstReturn;
	while(this.lstRoadObjects.length>0){
		lstReturn=this.popRoad();
		lstReturn[1].cleanups();	
		lstRoadObjectsFactory.push(lstReturn[0]);
		lstRoadAdvancedCurvesFactory.push(lstReturn[1]);
	}
};
RoadsObject.prototype.enable=function(blnEnable){
	this.lstAdvancedCurves[this.intSelectedRoad].enable(blnEnable);
};
RoadsObject.prototype.isEnabled=function(){
	return this.lstAdvancedCurves[this.intSelectedRoad].enabled;
};
RoadsObject.prototype.enableAll=function(blnEnable){
	for(var ii=0;ii<this.lstAdvancedCurves.length;ii++)
		this.lstAdvancedCurves[ii].enable(blnEnable);
};
RoadsObject.prototype.onPointerDown=function(evtPointer){
	this.lstAdvancedCurves[this.intSelectedRoad].onPointerDown(evtPointer);
};
RoadsObject.prototype.onPointerMove=function(evtPointer){
	this.lstAdvancedCurves[this.intSelectedRoad].onPointerMove(evtPointer);
};
RoadsObject.prototype.onPointerUp=function(evtPointer){
	this.lstAdvancedCurves[this.intSelectedRoad].onPointerUp(evtPointer);
};
RoadsObject.prototype.getTransformControls=function(){
	return this.lstAdvancedCurves[this.intSelectedRoad].transformControls;
};
RoadsObject.prototype.checkJunctionOn=function(){
};
RoadsObject.prototype.junctionOn=function(){
	//changeRoadOn
};
RoadsObject.prototype.changeRoadOn=function(intII,fltT){
	//TODO: change GUI
};
RoadsObject.prototype.addToGUI=function(){
	return this.lstAdvancedCurves[this.intSelectedRoad].addToGUI();
};
RoadsObject.prototype.removeFromGUI=function(){
	return this.lstAdvancedCurves[this.intSelectedRoad].removeFromGUI();
};
RoadsObject.prototype.putToFactory=function(roadObjectFactory,advancedCurveFactory){
};
RoadsObject.prototype.getFromFactoryAndAppend=function(roadObjectFactory,advancedCurveFactory){
};
RoadsObject.prototype.update=function(fltWidth,landscape){
	var advancedCurve,roadObject;
	var intDivisions;
	for(var ii=0;ii<this.lstRoadObjects.length;ii++){
		advancedCurve=this.lstAdvancedCurves[ii];
		roadObject=this.lstRoadObjects[ii];
		intDivisions=advancedCurve.intSplinePointsLength;
		if(intDivisions>roadObject.mesh.geometry.intMaxDivisions)intDivisions=roadObject.mesh.geometry.intMaxDivisions;
		roadObject.update(advancedCurve,intDivisions,fltWidth,landscape);
		advancedCurve.lstRoadsToUpdate=[roadObject];
	}
};
RoadsObject.prototype.updateGeometry=function(fltWidth,landscape){
	var advancedCurve,roadObject;
	var intDivisions;
	for(var ii=0;ii<this.lstRoadObjects.length;ii++){
		advancedCurve=this.lstAdvancedCurves[ii];
		roadObject=this.lstRoadObjects[ii];
		intDivisions=advancedCurve.intSplinePointsLength;
		if(intDivisions>roadObject.mesh.geometry.intMaxDivisions)intDivisions=roadObject.mesh.geometry.intMaxDivisions;
		roadObject.update(advancedCurve,intDivisions,fltWidth,landscape);
		advancedCurve.lstRoadsToUpdate=[roadObject];
	}
};
RoadsObject.prototype.loadObject=function(fltWidth,landscape){
	var advancedCurve,roadObject;
	var intDivisions;
	for(var ii=0;ii<this.lstRoadObjects.length;ii++){
		advancedCurve=this.lstAdvancedCurves[ii];
		roadObject=this.lstRoadObjects[ii];
		intDivisions=advancedCurve.intSplinePointsLength;
		if(intDivisions>roadObject.mesh.geometry.intMaxDivisions)intDivisions=roadObject.mesh.geometry.intMaxDivisions;
		roadObject.loadObject(advancedCurve,intDivisions,fltWidth,landscape);
		advancedCurve.lstRoadsToUpdate=[roadObject];
	}
};
RoadsObject.prototype.addToView=function(grid){
	for(var ii=0;ii<this.lstAdvancedCurves.length;ii++)
		this.lstAdvancedCurves[ii].addToView(grid);
};
RoadsObject.prototype.removeFromView=function(grid){
	for(var ii=0;ii<this.lstAdvancedCurves.length;ii++)
		this.lstAdvancedCurves[ii].removeFromView(grid);
};
RoadsObject.prototype.saveToString=function(){
	var strSave="",objJunctions=null,strJunctions=null;
	for(var ii=0;ii<this.lstAdvancedCurves.length;ii++){
		strSave+=this.lstAdvancedCurves[ii].saveToString();
		strSave+="Junction "+"|"+String.fromCharCode(10);
		objJunctions=this.lstJunctionPoints[ii];
		strJunctions=JSON.stringify(objJunctions);
		strSave+=strJunctions;
		strSave+="|"+String.fromCharCode(10);
	}
	return strSave;
};
RoadsObject.prototype.loadFromString=function(strRoadsObject){
	var advancedCurve=this.lstAdvancedCurves[this.intSelectedRoad];
	advancedCurve.loadFromString(strRoadsObject);

	/*var roadObject=this.lstRoadObjects[this.intSelectedRoad];
	//TODO: read intDivisions from file and create new geometry with advancedCurve.intSplinePoints
	//when roadsFactory eliminated
	//otherwise make further points invisible (render range)
	roadObject.loadObject(advancedCurve,roadObject.mesh.geometry.intDivisions,roadObject.mesh.geometry.fltWidth,landscape);
	advancedCurveObject.lstRoadsToUpdate=[roadObject];
	*/
};
RoadsObject.prototype.setColorHex=function(colorHex){
	return this.lstRoadObjects[this.intSelectedRoad].setColorHex(colorHex);
};
RoadsObject.prototype.getColorHex=function(){
	return this.lstRoadObjects[this.intSelectedRoad].getColorHex();
};
RoadsObject.prototype.setCurrentColorHex=function(){
	return this.lstRoadObjects[this.intSelectedRoad].setCurrentColorHex();
};
RoadsObject.prototype.setFltOpacity=function(fltOpacity){
	return this.lstRoadObjects[this.intSelectedRoad].setFltOpacity(fltOpacity);
};
RoadsObject.prototype.getFltOpacity=function(){
	return this.lstRoadObjects[this.intSelectedRoad].getFltOpacity();
};
RoadsObject.prototype.setCurrentFltOpacity=function(){
	return this.lstRoadObjects[this.intSelectedRoad].setCurrentFltOpacity();
};
RoadsObject.prototype.setBlnTransparency=function(blnTransparency){
	return this.lstRoadObjects[this.intSelectedRoad].setBlnTransparency(blnTransparency);
};
RoadsObject.prototype.getBlnTransparency=function(){
	return this.lstRoadObjects[this.intSelectedRoad].getBlnTransparency();
};
RoadsObject.prototype.setCurrentBlnTransparency=function(){
	return this.lstRoadObjects[this.intSelectedRoad].setCurrentBlnTransparency();
};
/*
RoadsObject.prototype.traverse=function(callback){
	var lstReturn=[];
	for(var ii=0;ii<this.lstRoadObjects.length;ii++)
		lstReturn.push(this.lstRoadObjects[ii].mesh.traverse(callback));
	return lstReturn;
};
*/
RoadsObject.prototype.getIIfromRoad=function(roadObject){
	return this.lstRoadObjects.indexOf(roadObject);
};
RoadsObject.prototype.getIIfromCurve=function(advancedCurveObject){
	return this.lstAdvancedCurves.indexOf(advancedCurveObject);
};
var SkyGeometry=function(){

	THREE.BufferGeometry.call(this);
	var lstVertices=[];

	//TODO

	this.setAttribute("position",new THREE.BufferAttribute(new Float32Array(lstVertices),3));
	this.arrPositions=this.getAttribute("position").array;
};

SkyGeometry.prototype=Object.create(THREE.BufferGeometry.prototype);
SkyGeometry.prototype.update=function(){

	var lstVertices=[];

	//TODO

	this.setAttribute("position",new THREE.BufferAttribute(new Float32Array(lstVertices),3));
	this.computeBoundingBox();
	//this.computeBoundingSphere();
};
var SkyObject=function(){
	this.strType="SkyObject";
	this.blnSelectWhole=true;
	this.blnSelectVertices=false;
	this.lstUndoEntries=[];
	this.lstRedoEntries=[];
	var geometry=new SkyGeometry();
	var material=new THREE.MeshBasicMaterial({color:0xffffff});
	this.mesh=new THREE.Mesh(geometry,material);
};
SkyObject.prototype.update=function(){
	this.lstUndoEntries=[];//TODO
	this.lstRedoEntries=[];//TODO
	this.mesh.geometry.update();
	this.mesh=new THREE.Mesh(this.mesh.geometry,this.mesh.material);
};
SkyObject.prototype.setColorHex=function(colorHex){
	this.mesh.material.color.setHex(colorHex);
};
SkyObject.prototype.getColorHex=function(){
	return this.mesh.material.color.getHex();
};
SkyObject.prototype.setCurrentColorHex=function(){
	this.currentHex=this.getColorHex();
};
SkyObject.prototype.setFltOpacity=function(fltOpacity){
	this.mesh.material.opacity=fltOpacity;
};
SkyObject.prototype.getFltOpacity=function(){
	return this.mesh.material.opacity;
};
SkyObject.prototype.setCurrentFltOpacity=function(){
	this.currentFltOpacity=this.getFltOpacity();
};
SkyObject.prototype.setBlnTransparency=function(blnTransparency){
	this.mesh.material.transparent=blnTransparency;
};
SkyObject.prototype.getBlnTransparency=function(){
	return this.mesh.material.transparent;
};
SkyObject.prototype.setCurrentBlnTransparency=function(){
	this.currentBlnTransparency=this.getBlnTransparency();
};
SkyObject.prototype.traverse=function(callback){
	return this.mesh.traverse(callback);
};
var TreesGeometry=function(landscape,road,intTrees){

	THREE.BufferGeometry.call(this);
	var lstVertices=[];
	var lstColors=[];
	this.lstColors=[];
	this.lstPositions=[];
	this.lstHeights=[];
	this.lstAngles=[];

	var raycaster=new THREE.Raycaster();
	raycaster.ray.direction.set(0,-1,0);

	var fltX,fltY,fltZ,fltHeight,fltAngle,fltR,fltG,fltB,fltRandom;
	var lstIntersections;

	for(var i=0;i<intTrees;i++){

		fltX=Math.random()*500-250;
		fltZ=Math.random()*500-250;


		raycaster.ray.origin.set(fltX,50,fltZ);
		lstIntersections=raycaster.intersectObject(road);

		if(0!=lstIntersections.length)continue;

		raycaster.ray.origin.set(fltX,50,fltZ);

		lstIntersections=raycaster.intersectObject(landscape);

		if(0==lstIntersections.length)continue;

		fltY=lstIntersections[0].point.y;

		fltHeight=Math.random()*5+0.5;

		fltAngle=Math.random()*Math.PI*2;
		this.lstPositions.push(new THREE.Vector3(fltX,fltY,fltZ));
		this.lstHeights.push(fltHeight);
		this.lstAngles.push(fltAngle);

		lstVertices.push(fltX+Math.sin(fltAngle),fltY,fltZ+Math.cos(fltAngle));
		lstVertices.push(fltX,fltY+fltHeight,fltZ);
		lstVertices.push(fltX+Math.sin(fltAngle+Math.PI),fltY,fltZ+Math.cos(fltAngle+Math.PI));

		fltAngle+=Math.PI/2;

		lstVertices.push(fltX+Math.sin(fltAngle),fltY,fltZ+Math.cos(fltAngle));
		lstVertices.push(fltX,fltY+fltHeight,fltZ);
		lstVertices.push(fltX+Math.sin(fltAngle+Math.PI),fltY,fltZ+Math.cos(fltAngle+Math.PI));

		fltRandom=Math.random()*0.1;

		for(var j=0;j<6;j++){

			fltR=0.2+fltRandom;fltG=0.4+fltRandom;fltB=0.;
			lstColors.push(fltR,fltG,fltB);
			this.lstColors.push(new THREE.Vector3(fltR,fltG,fltB));
		}

	}

	this.setAttribute("position",new THREE.BufferAttribute(new Float32Array(lstVertices),3));
	this.setAttribute("color",new THREE.BufferAttribute(new Float32Array(lstColors),3));
	this.arrPositions=this.getAttribute("position").array;
	this.arrColors=this.getAttribute("color").array;
};

TreesGeometry.prototype=Object.create(THREE.BufferGeometry.prototype);
TreesGeometry.prototype.update=function(landscape,road,intTrees){
	var lstVertices=[];
	var lstColors=[];
	this.lstColors=[];
	this.lstPositions=[];
	this.lstHeights=[];
	this.lstAngles=[];

	var raycaster=new THREE.Raycaster();
	raycaster.ray.direction.set(0,-1,0);

	var fltX,fltY,fltZ,fltHeight,fltAngle,fltR,fltG,fltB,fltRandom;
	var lstIntersections;

	for(var i=0;i<intTrees;i++){

		fltX=Math.random()*500-250;
		fltZ=Math.random()*500-250;


		raycaster.ray.origin.set(fltX,50,fltZ);
		lstIntersections=raycaster.intersectObject(road);

		if(0!=lstIntersections.length)continue;

		raycaster.ray.origin.set(fltX,50,fltZ);

		lstIntersections=raycaster.intersectObject(landscape);

		if(0==lstIntersections.length)continue;

		fltY=lstIntersections[0].point.y;

		fltHeight=Math.random()*5+0.5;

		fltAngle=Math.random()*Math.PI*2;

		this.lstPositions.push(new THREE.Vector3(fltX,fltY,fltZ));
		this.lstHeights.push(fltHeight);
		this.lstAngles.push(fltAngle);

		lstVertices.push(fltX+Math.sin(fltAngle),fltY,fltZ+Math.cos(fltAngle));
		lstVertices.push(fltX,fltY+fltHeight,fltZ);
		lstVertices.push(fltX+Math.sin(fltAngle+Math.PI),fltY,fltZ+Math.cos(fltAngle+Math.PI));

		fltAngle+=Math.PI/2;

		lstVertices.push(fltX+Math.sin(fltAngle),fltY,fltZ+Math.cos(fltAngle));
		lstVertices.push(fltX,fltY+fltHeight,fltZ);
		lstVertices.push(fltX+Math.sin(fltAngle+Math.PI),fltY,fltZ+Math.cos(fltAngle+Math.PI));

		fltRandom=Math.random()*0.1;

		for(var j=0;j<6;j++){

			fltR=0.2+fltRandom;fltG=0.4+fltRandom;fltB=0.;
			lstColors.push(fltR,fltG,fltB);
			this.lstColors.push(new THREE.Vector3(fltR,fltG,fltB));

		}

	}
	this.setAttribute("position",new THREE.BufferAttribute(new Float32Array(lstVertices),3));
	this.setAttribute("color",new THREE.BufferAttribute(new Float32Array(lstColors),3));
	this.computeBoundingBox();
	//this.computeBoundingSphere();
};
TreesGeometry.prototype.updateObject=function(lstPositions,lstHeights,lstAngles,lstColors){

	var lstVertices=[];
	var lstColors=[];

	this.lstColors=lstColors;
	this.lstPositions=lstPositions;
	this.lstHeights=lstHeights;
	this.lstAngles=lstAngles;

	var fltX,fltY,fltZ,fltHeight,fltAngle,fltR,fltG,fltB;
	var intAmount=lstHeights.length;
	var vec3position,vec3color;
	for(var i=0;i<intAmount;i++){
		vec3position=lstPositions[i];
		fltX=vec3position.x;
		fltY=vec3position.y;
		fltZ=vec3position.z;

		fltHeight=lstHeights[i];
		fltAngle=lstAngles[i];

		lstVertices.push(fltX+Math.sin(fltAngle),fltY,fltZ+Math.cos(fltAngle));
		lstVertices.push(fltX,fltY+fltHeight,fltZ);
		lstVertices.push(fltX+Math.sin(fltAngle+Math.PI),fltY,fltZ+Math.cos(fltAngle+Math.PI));

		fltAngle+=Math.PI/2;

		lstVertices.push(fltX+Math.sin(fltAngle),fltY,fltZ+Math.cos(fltAngle));
		lstVertices.push(fltX,fltY+fltHeight,fltZ);
		lstVertices.push(fltX+Math.sin(fltAngle+Math.PI),fltY,fltZ+Math.cos(fltAngle+Math.PI));

		for(var j=0;j<6;j++){

			vec3color=lstColors[i+j];
			fltR=vec3color.x;
			fltG=vec3color.y;
			fltB=vec3color.z;
			lstColors.push(fltR,fltG,fltB);

		}

	}

	this.arrPositions=this.getAttribute("position").array;
	this.arrColors=this.getAttribute("color").array;
	for(var i=0;i<this.arrPositions.length;i++)
		this.arrPositions[i]=lstVertices[i];
	for(var i=0;i<this.arrColors.length;i++)
		this.arrColors[i]=lstColors[i];
	//var newRange=this.arrPositions.length;
	//this.setDrawRange(0,newRange);
	this.attributes.position.needsUpdate=true;
	this.attributes.color.needsUpdate=true;
	this.computeBoundingBox();
	//this.computeBoundingSphere();
};
var TreesObject=function(landscape,road,intTrees){
	this.strType="TreesObject";
	this.intTrees=intTrees;
	this.blnSelectWhole=false;
	this.blnSelectVertices=false;
	this.lstUndoEntries=[];
	this.lstRedoEntries=[];
	var geometry=new TreesGeometry(landscape,road,intTrees);
	var material=new THREE.MeshBasicMaterial({
		side:THREE.DoubleSide,vertexColors:true
	});
	this.mesh=new THREE.Mesh(geometry,material);
	this.mesh.layers.enable(1);
};
TreesObject.prototype.update=function(landscape,road,intTrees){
	this.intTrees=intTrees;
	this.lstUndoEntries=[];//TODO
	this.lstRedoEntries=[];//TODO
	this.mesh.geometry.update(landscape,road,intTrees);
	this.mesh=new THREE.Mesh(this.mesh.geometry,this.mesh.material);
	this.mesh.layers.enable(1);
};
TreesObject.prototype.updateGeometry=function(landscape,road){
	this.lstUndoEntries=[];//TODO
	this.lstRedoEntries=[];//TODO
	this.mesh.geometry.update(landscape,road);
	this.mesh.layers.enable(1);
};
TreesObject.prototype.loadObject=function(lstPositions,lstHeights,lstAngles,lstColors){
	this.lstUndoEntries=[];//TODO
	this.lstRedoEntries=[];//TODO
	this.mesh.geometry.updateObject(lstPositions,lstHeights,lstAngles,lstColors);
	this.mesh.layers.enable(1);
};
TreesObject.prototype.saveToString=function(){
	var objSave={};
	var lstPositions=this.mesh.geometry.lstPositions;
	var lstHeights=this.mesh.geometry.lstHeights;
	var lstAngles=this.mesh.geometry.lstAngles;
	var lstColors=this.mesh.geometry.lstColors;
	objSave.lstPositions=lstPositions;
	objSave.lstHeights=lstHeights;
	objSave.lstAngles=lstAngles;
	objSave.lstColors=lstColors;
	var strSave="TreesObject|"+String.fromCharCode(10);
	strSave+=JSON.stringify(objSave);
	strSave+="|"+String.fromCharCode(10);
	return strSave;
};
TreesObject.prototype.loadFromString=function(strTrees){
	var strType="TreesObject";
	var objLoad=null;
	objLoad=JSON.parse(strTrees);
	this.loadObject(objLoad.lstPositions,objLoad.lstHeights,objLoad.lstAngles,objLoad.lstColors);
};
TreesObject.prototype.setColorHex=function(colorHex){
	this.mesh.material.color.setHex(colorHex);
};
TreesObject.prototype.getColorHex=function(){
	return this.mesh.material.color.getHex();
};
TreesObject.prototype.setCurrentColorHex=function(){
	this.currentHex=this.getColorHex();
};
TreesObject.prototype.setFltOpacity=function(fltOpacity){
	this.mesh.material.opacity=fltOpacity;
};
TreesObject.prototype.getFltOpacity=function(){
	return this.mesh.material.opacity;
};
TreesObject.prototype.setCurrentFltOpacity=function(){
	this.currentFltOpacity=this.getFltOpacity();
};
TreesObject.prototype.setBlnTransparency=function(blnTransparency){
	this.mesh.material.transparent=blnTransparency;
};
TreesObject.prototype.getBlnTransparency=function(){
	return this.mesh.material.transparent;
};
TreesObject.prototype.setCurrentBlnTransparency=function(){
	this.currentBlnTransparency=this.getBlnTransparency();
};
TreesObject.prototype.traverse=function(callback){
	return this.mesh.traverse(callback);
};
var ModelObject=function(strId,strName,str_lstStrFilename,strFiletype,vec3position,vec3rotation,vec3scale,loaderFunction,finalizeFunction){
	this.strType="ModelObject";
	this.blnSelectWhole=true;
	this.blnSelectVertices=false;
	this.lstUndoEntries=[];
	this.lstRedoEntries=[];
	this.strId=strId;
	this.strName=strName;
	this.str_lstStrFilename=str_lstStrFilename;
	this.strFiletype=strFiletype;
	this.vec3position=vec3position;
	this.vec3rotation=vec3rotation;
	this.vec3scale=vec3scale;
	var objectModel;
	var thisModelObject=this;
	this.mesh=null;
	this.finalizeFunction=finalizeFunction;
	this.manager=new THREE.LoadingManager();
	var manager=this.manager;
	this.loaderFunction=null;

	var onProgress=function(xhr){
		if(xhr.lengthComputable){
			var percentComplete=xhr.loaded/xhr.total*100;
			console.log(Math.round(percentComplete,2)+"%downloaded");

		}

	};
	var onError=function(xcp){console.log("file load error");console.log(xcp);};
	if(null!=loaderFunction)this.loaderFunction=loaderFunction;
	else{
		switch(this.strFiletype){
			case "gltf":
				this.loaderFunction=function(){
					var dracoLoader=new DRACOLoader();
					dracoLoader.setDecoderPath("js/libs/draco/gltf/");

					var loader=new GLTFLoader();
					loader.setDRACOLoader(dracoLoader);

					loader.load(str_lstStrFilename,function(gltf){

						thisModelObject.mesh=new THREE.Object3D();
						thisModelObject.mesh.add(gltf.scene.children[0]);

						thisModelObject.mesh.position.x=vec3position.x;
						thisModelObject.mesh.position.y=vec3position.y;
						thisModelObject.mesh.position.z=vec3position.z;
						thisModelObject.mesh.rotation.x=vec3rotation.x;
						thisModelObject.mesh.rotation.y=vec3rotation.y;
						thisModelObject.mesh.rotation.z=vec3rotation.z;
						thisModelObject.mesh.scale.x=vec3scale.x;
						thisModelObject.mesh.scale.y=vec3scale.y;
						thisModelObject.mesh.scale.z=vec3scale.z;
						//thisModelObject.mesh.layers.enable(1);
						thisModelObject.mesh.traverse(function(object){object.layers.enable(1);});
						console.log("gltf loaded");
					});

				};
			break;
		case "obj+mtl":
			manager.addHandler(/\.dds$/i,new DDSLoader());
			manager.addHandler(/\.JPG$/i,new THREE.TextureLoader());
			this.loaderFunction=function(){
				new MTLLoader(manager)
					.setPath(str_lstStrFilename[0])
					.load(str_lstStrFilename[1],function(materials){
						materials.preload();
						new OBJLoader(manager)
							.setMaterials(materials)
							.setPath(str_lstStrFilename[0])
							.load(str_lstStrFilename[2],function(obj){
								thisModelObject.mesh=new THREE.Object3D();
								//thisModelObject.mesh.add(obj);
								thisModelObject.mesh.add(obj.children[0]);
								thisModelObject.mesh.position.x=vec3position.x;
								thisModelObject.mesh.position.y=vec3position.y;
								thisModelObject.mesh.position.z=vec3position.z;
								thisModelObject.mesh.rotation.x=vec3rotation.x;
								thisModelObject.mesh.rotation.y=vec3rotation.y;
								thisModelObject.mesh.rotation.z=vec3rotation.z;
								thisModelObject.mesh.scale.x=vec3scale.x;
								thisModelObject.mesh.scale.y=vec3scale.y;
								thisModelObject.mesh.scale.z=vec3scale.z;
								//thisModelObject.mesh.layers.enable(1);
								thisModelObject.mesh.traverse(function(object){object.layers.enable(1);});
								console.log("obj+mtl loaded");

							},onProgress,onError);

					});

			};
		break;

		case "obj":
			this.loaderFunction=function(){
				new OBJLoader(manager)
					.load(str_lstStrFilename[0]+str_lstStrFilename[1],function(obj){
						thisModelObject.mesh=new THREE.Object3D();
						thisModelObject.mesh.add(obj);
						thisModelObject.mesh.position.x=vec3position.x;
						thisModelObject.mesh.position.y=vec3position.y;
						thisModelObject.mesh.position.z=vec3position.z;
						thisModelObject.mesh.rotation.x=vec3rotation.x;
						thisModelObject.mesh.rotation.y=vec3rotation.y;
						thisModelObject.mesh.rotation.z=vec3rotation.z;
						thisModelObject.mesh.scale.x=vec3scale.x;
						thisModelObject.mesh.scale.y=vec3scale.y;
						thisModelObject.mesh.scale.z=vec3scale.z;
						//thisModelObject.mesh.layers.enable(1);
						thisModelObject.mesh.traverse(function(object){object.layers.enable(1);});
						console.log("obj loaded");

					},onProgress,onError);

			};
		break;
		case "texture":

		break;

		}
	}
	if(this.loaderFunction!=null)
		this.loaderFunction();
	
};
ModelObject.prototype=Object.create(THREE.BufferGeometry.prototype);
ModelObject.prototype.addToRegionSubscene=function(regionSubscene){
	regionSubscene.add(this.mesh);
};
ModelObject.prototype.removeFromRegionSubscene=function(regionSubscene){
	regionSubscene.remove(this.mesh);
	if(undefined!=this.instanciatedModelMesh)
		regionSubscene.remove(this.instanciatedModelMesh);
};
ModelObject.prototype.setColorHex=function(colorHex){
	this.mesh.traverse(function(object){
		if(undefined!=object.material)object.material.color.setHex(colorHex);	
	});
};
ModelObject.prototype.getColorHex=function(){
	var currentHex=null;
	this.mesh.traverse(function(object){
		if(undefined!=object.material)currentHex=object.material.color.getHex();	
		
	});
	if(null!=currentHex)return currentHex;
	else return 0xffffff;
};
ModelObject.prototype.setCurrentColorHex=function(){
	this.currentHex=this.getColorHex();
	//TODO:currentHex[]
};
ModelObject.prototype.setFltOpacity=function(fltOpacity){
	this.mesh.traverse(function(object){
		if(undefined!=object.material)object.material.opacity=fltOpacity;	
	});
};
ModelObject.prototype.getFltOpacity=function(){
	var currentFltOpacity=null;
	this.mesh.traverse(function(object){
		if(undefined!=object.material)currentFltOpacity=object.material.opacity;	
		
	});
	if(null!=currentFltOpacity)return currentFltOpacity;
	else return 1.0;
};
ModelObject.prototype.setCurrentFltOpacity=function(){
	this.currentFltOpacity=this.getFltOpacity();
	//TODO:currentHex[]
};
ModelObject.prototype.setBlnTransparency=function(blnTransparency){
	this.mesh.traverse(function(object){
		if(undefined!=object.material)object.material.transparent=blnTransparency;	
	});
};
ModelObject.prototype.getBlnTransparency=function(){
	var currentBlnTransparency=null;
	this.mesh.traverse(function(object){
		if(undefined!=object.material)currentBlnTransparency=object.material.transparent;	
		
	});
	if(null!=currentBlnTransparency)return currentBlnTransparency;
	else return true;
};
ModelObject.prototype.setCurrentBlnTransparency=function(){
	this.currentBlnTransparency=this.getBlnTransparency();
	//TODO:currentHex[]
};
ModelObject.prototype.move=function(vec2diff,strAxis,fltScale){
	switch(strAxis){
		case "x":
			this.mesh.position.x+=(vec2diff.x+vec2diff.y)*fltScale;
		break;
		case "y":
			this.mesh.position.y+=(vec2diff.x+vec2diff.y)*fltScale;
		break;
		case "z":
			this.mesh.position.z+=(vec2diff.x+vec2diff.y)*fltScale;
		break;
		case "l"://TODO:camera lookat

		break;
	}
};
ModelObject.prototype.clone=function(){
	var dst=new ModelObject(this.strId+"_",this.strName,this.str_lstStrFilename,this.strFiletype,this.vec3position,this.vec3rotation,this.vec3scale,function(){},function(){});
	dst.blnSelectWhole=this.blnSelectWhole;
	dst.blnSelectVertices=this.blnSelectVertices;
	dst.lstUndoEntries=this.lstUndoEntries;//TODO
	dst.lstRedoEntries=this.lstRedoEntries;//TODO
	dst.mesh=this.mesh.clone();
	dst.mesh.layers.enable(1);
	return dst;
};
ModelObject.prototype.traverse=function(callback){
	return this.mesh.traverse(callback);
};
ModelObject.prototype.dispose=function(){
	if(this.objectModel!=null){
		var geometry,material,texture;
		geometry=this.objectModel.geometry;
		material=this.objectModel.material;
		if(null!=material.map)texture=material.map;
		geometry.dispose();
		material.dispose();
		texture.dispose();
	}
};
var SimpleObject=function(vec3position,vec3rotation,vec3scale,vec3color,texture){
	this.strType="SimpleObject";
	this.lstUndoEntries=[];
	this.lstRedoEntries=[];
	this.blnSelectWhole=true;
	this.blnSelectVertices=false;
	this.vec3position=vec3position;
	this.vec3rotation=vec3rotation;
	this.vec3scale=vec3scale;
	this.vec3color=vec3color;
	var geometry=new THREE.BoxGeometry(1,1,1);
	geometry.translate(0,0.5,0);
	var defaultColor=0xff3c00;
	var theColor;
	if(undefined==vec3color)theColor=defaultColor;
	else theColor="rgb("+vec3color.x+","+vec3color.y+","+vec3color.z+")";
	var material;
	if(undefined==texture){
		material=new THREE.MeshPhongMaterial({color:theColor,flatShading:true});
		//material.color.x=vec3color.x;
		//material.color.y=vec3color.y;
		//material.color.z=vec3color.z;
	}else{
		material=new THREE.MeshPhongMaterial({map:texture,flatShading:true});
	}
	this.mesh=new THREE.Mesh(geometry,material);
	this.mesh.position.x=this.vec3position.x;
	this.mesh.position.y=this.vec3position.y;
	this.mesh.position.z=this.vec3position.z;
	this.mesh.rotation.x=this.vec3rotation.x;
	this.mesh.rotation.y=this.vec3rotation.y;
	this.mesh.rotation.z=this.vec3rotation.z;
	this.mesh.scale.x=this.vec3scale.x;
	this.mesh.scale.y=this.vec3scale.y;
	this.mesh.scale.z=this.vec3scale.z;
	this.mesh.updateMatrix();
	this.mesh.matrixAutoUpdate=false;
	this.mesh.layers.enable(1);
};
SimpleObject.prototype.clone=function(blnNewMesh){
	if(undefined==blnNewMesh)blnNewMesh=true;
	var dst=new SimpleObject(vec3position,vec3rotation,vec3scale,vec3color);
	dst.blnSelectWhole=this.blnSelectWhole;
	dst.blnSelectVertices=this.blnSelectVertices;
	if(true==blnNewMesh)
		dst.mesh=new THREE.Mesh(this.mesh.geometry,this.mesh.material);
	else
		dst.mesh=this.mesh;
	dst.mesh.layers.enable(1);
	return dst;
};
SimpleObject.prototype.saveToString=function(){
	var objSave={};
	objSave.vec3position=this.vec3position;
	objSave.vec3rotation=this.vec3rotation;
	objSave.vec3scale=this.vec3scale;
	objSave.vec3color=this.vec3color;
	var strSave="SimpleObject|"+String.fromCharCode(10);
	strSave+=JSON.stringify(objSave);
	strSave+="|"+String.fromCharCode(10);
	return strSave;
};
SimpleObject.prototype.loadFromString=function(strSimpleObject){
	var strType="SimpleObject";
	var objLoad=null;
	objLoad=JSON.parse(strSimpleObject);
	this.loadObject(objLoad);
};
SimpleObject.prototype.update=function(vec3position,vec3rotation,vec3scale,vec3color){
	this.lstUndoEntries=[];//TODO
	this.lstRedoEntries=[];//TODO
	this.vec3position=vec3position;
	this.vec3rotation=vec3rotation;
	this.vec3scale=vec3scale;
	this.vec3color=vec3color;
	//this.mesh.geometry.translate(0,0.5,0);
	var defaultColor=0xff3c00;
	this.mesh.material.color.x=this.vec3color.x;
	this.mesh.material.color.y=this.vec3color.y;
	this.mesh.material.color.z=this.vec3color.z;
	this.mesh=new THREE.Mesh(this.mesh.geometry,this.mesh.material);
	this.mesh.position.x=this.vec3position.x;
	this.mesh.position.y=this.vec3position.y;
	this.mesh.position.z=this.vec3position.z;
	this.mesh.rotation.x=this.vec3rotation.x;
	this.mesh.rotation.y=this.vec3rotation.y;
	this.mesh.rotation.z=this.vec3rotation.z;
	this.mesh.scale.x=this.vec3scale.x;
	this.mesh.scale.y=this.vec3scale.y;
	this.mesh.scale.z=this.vec3scale.z;
	this.mesh.updateMatrix();
	this.mesh.matrixAutoUpdate=false;
};
SimpleObject.prototype.loadObject=function(vec3position,vec3rotation,vec3scale,vec3color){
	this.lstUndoEntries=[];//TODO
	this.lstRedoEntries=[];//TODO
	this.vec3position=vec3position;
	this.vec3rotation=vec3rotation;
	this.vec3scale=vec3scale;
	this.vec3color=vec3color;
	this.mesh.geometry.translate(0,0.5,0);
	var defaultColor=0xff3c00;
	this.mesh.material.color.x=this.vec3color.x;
	this.mesh.material.color.y=this.vec3color.y;
	this.mesh.material.color.z=this.vec3color.z;
	this.mesh.position.x=this.vec3position.x;
	this.mesh.position.y=this.vec3position.y;
	this.mesh.position.z=this.vec3position.z;
	this.mesh.rotation.x=this.vec3rotation.x;
	this.mesh.rotation.y=this.vec3rotation.y;
	this.mesh.rotation.z=this.vec3rotation.z;
	this.mesh.scale.x=this.vec3scale.x;
	this.mesh.scale.y=this.vec3scale.y;
	this.mesh.scale.z=this.vec3scale.z;
	this.mesh.updateMatrix();
	this.mesh.matrixAutoUpdate=false;
};
SimpleObject.prototype.setColorHex=function(colorHex){
	this.mesh.material.color.setHex(colorHex);
};
SimpleObject.prototype.getColorHex=function(){
	return this.mesh.material.color.getHex();
};
SimpleObject.prototype.setCurrentColorHex=function(){
	this.currentHex=this.getColorHex();
};
SimpleObject.prototype.setFltOpacity=function(fltOpacity){
	this.mesh.material.opacity=fltOpacity;
};
SimpleObject.prototype.getFltOpacity=function(){
	return this.mesh.material.opacity;
};
SimpleObject.prototype.setCurrentFltOpacity=function(){
	this.currentFltOpacity=this.getFltOpacity();
};
SimpleObject.prototype.setBlnTransparency=function(blnTransparency){
	this.mesh.material.transparent=blnTransparency;
};
SimpleObject.prototype.getBlnTransparency=function(){
	return this.mesh.material.transparent;
};
SimpleObject.prototype.setCurrentBlnTransparency=function(){
	this.currentBlnTransparency=this.getBlnTransparency();
};
SimpleObject.prototype.traverse=function(callback){
	return this.mesh.traverse(callback);
};
var createBuildingTexture=function(intWidth,intHeight){
	var textureCanvas=document.createElement("canvas");
	var intWindowsMargin=10;
	var intWindowSize=5;
	//var intShadowMargin=0;
	var intTextureWidth=10*intWidth;
	var intTextureHeight=10*intHeight;
	//console.log("[intTextureWidth,intTextureHeight]");
	//console.log([intTextureWidth,intTextureHeight]);
	textureCanvas.id="textureCanvas";
	//var intTextureWidth=100*fltWidthMultiplier;
	//var intTextureHeight=100*fltHeightMultiplier;
	textureCanvas.width=intTextureWidth;
	textureCanvas.height=intTextureHeight;
	var textureContext=textureCanvas.getContext("2d");
	var textureImage=textureContext.createImageData(intTextureWidth,intTextureHeight);
	textureContext.beginPath();
	textureContext.fillStyle="grey"; 
	textureContext.fillRect(0,0,intTextureWidth,intTextureHeight);
	textureContext.fill();
	var intWindowsX=Math.floor(intTextureWidth/intWindowSize);
	var intWindowsY=Math.floor(intTextureHeight/intWindowSize);
	var intX,intY;
	for(var i=0;i<intWindowsX;i++){
		for(var j=0;j<intWindowsY;j++){
			intX=(i+1)*intWindowsMargin+intWindowSize*i;
			intY=(j+1)*intWindowsMargin+intWindowSize*j;
			textureContext.beginPath();
			textureContext.fillStyle="white"; //TODO:
			textureContext.fillRect(intX,intY,intWindowSize,intWindowSize);
			textureContext.fill();
		}
	}

	//document.getElementById("info").appendChild(textureCanvas);	
	var newTexture=new THREE.CanvasTexture(textureCanvas);
	return newTexture;
};
var BuildingObject=function(vec3position,vec3rotation,vec3scale,vec3color){
	var texture=createBuildingTexture(vec3scale.x,vec3scale.y);
	SimpleObject.call(this,vec3position,vec3rotation,vec3scale,vec3color,texture);
	this.strType="BuildingObject";
};
BuildingObject.prototype=Object.create(SimpleObject.prototype);
BuildingObject.prototype.clone=function(blnNewMesh){
	if(undefined==blnNewMesh)blnNewMesh=true;
	var dst=new BuildingObject(this.vec3position,this.vec3rotation,this.vec3scale,this.vec3color,this.mesh.material.map);
	dst.blnSelectWhole=this.blnSelectWhole;
	dst.blnSelectVertices=this.blnSelectVertices;
	if(true==blnNewMesh)
		dst.mesh=new THREE.Mesh(this.mesh.geometry,this.mesh.material);
	else
		dst.mesh=this.mesh;
	dst.mesh.layers.enable(1);
	return dst;
};
BuildingObject.prototype.saveToString=function(){
	var objSave={};
	objSave.vec3position=this.vec3position;
	objSave.vec3rotation=this.vec3rotation;
	objSave.vec3scale=this.vec3scale;
	objSave.vec3color=this.vec3color;
	var strSave="BuildingObject|"+String.fromCharCode(10);
	strSave+=JSON.stringify(objSave);
	strSave+="|"+String.fromCharCode(10);
	return strSave;
};
BuildingObject.prototype.loadFromString=function(strSimpleObject){
	var strType="BuildingObject";
	var objLoad=null;
	objLoad=JSON.parse(strSimpleObject);
	this.loadObject(objLoad);
};
BuildingObject.prototype.createBuildingTexture=createBuildingTexture;
var SimpleCurve=function(){
	this.strType="SimpleCurve";

};
SimpleCurve.prototype.getPointAt=function(fltT,landscapeMesh){
	//function placeholder to redefine somehow that way
	var fltRoadHeight=window.mhd.fltRoadHeight;
	var raycaster=new THREE.Raycaster();
	raycaster.ray.direction.set(0,-1,0);

	var PI2=Math.PI*2;
	var vector=new THREE.Vector3();
	fltT=fltT*PI2;

	var fltX=Math.sin(fltT*3)*Math.cos(fltT*4)*50;
	var fltZ=(500/PI2)*fltT-250;
	raycaster.ray.origin.set(fltX,50,fltZ);
	var lstIntersections=raycaster.intersectObject(landscapeMesh);
	var fltY=0;
	if(0!=lstIntersections.length)
		fltY=lstIntersections[0].point.y+fltRoadHeight;

	return vector.set(fltX,fltY,fltZ);

};
SimpleCurve.prototype.getTangentAt=function(fltT,landscapeMesh){
	//function placeholder to redefine somehow that way
	var vector2=new THREE.Vector3();

	var fltDelta=0.0001;
	var fltT1=Math.max(0,fltT-fltDelta);
	var fltT2=Math.min(1,fltT+fltDelta);

	return vector2.copy(this.getPointAt(fltT2,landscapeMesh))
		.sub(this.getPointAt(fltT1,landscapeMesh)).normalize();

};
SimpleCurve.prototype.getNormalAt=function(fltT,landscapeMesh){
	//function placeholder to redefine somehow that way
	var vec3normal=new THREE.Vector3();
	var vec3right=new THREE.Vector3();
	var vec3tangent=new THREE.Vector3();

	vec3tangent.copy(this.getTangentAt(fltT,landscapeMesh)).normalize();

	var quaternion=new THREE.Quaternion();
	vec3right.crossVectors(new THREE.Vector3(0,1,0),vec3tangent).normalize();
	vec3normal.crossVectors(vec3tangent,vec3right).normalize();
	return vec3normal;
};
export{TriangleSelectorGeometry,TriangleSelectorObject,SphereSelectorObject,BoxSelectorObject,LandscapeObject,SkyGeometry,SkyObject,TreesGeometry,TreesObject,RoadGeometry,RoadObject,RoadsObject,ModelObject,SimpleObject,BuildingObject,SimpleCurve};
