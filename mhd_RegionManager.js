//r126
//import * as THREE from "../three.js-master/build/three.module.js";
import * as THREE from "./three.js-modiffs/mhd_three.module.js";
import{
	TriangleSelectorGeometry,
	TriangleSelectorObject,
	SphereSelectorObject,
	BoxSelectorObject,
	LandscapeObject,
	RoadGeometry,
	RoadObject,
	RoadsObject,
	TreesGeometry,
	TreesObject,
	SkyGeometry,
	SkyObject,
	ModelObject,
	SimpleObject,
	BuildingObject,
	SimpleCurve
} from "./mhd_MatrixHardDriveObjects.js";
import{AdvancedCurve} from "./mhd_AdvancedCurve.js";
var RegionManager=function(mhd,fltWidth,fltHeight,intWidthSegments,intHeightSegments,scene){
	this.lstColors=["rgb(255,255,255)",
	"rgb(0,0,0)",
	"rgb(255,100,0)",
	"rgb(255,255,0)",
	"rgb(0,255,0)",
	"rgb(255,0,0)",
	"rgb(255,50,150)",
	"rgb(128,0,128)",
	"rgb(100,50,0)",
	"rgb(0,0,255)"
	];
	this.lstLandscapeColors=[
		"rgb(255,255,255)",
		"rgb(44,65,21)",
		"rgb(186,140,31)",
		"rgb(38,131,68)"
	];
	this.fltWidth=fltWidth;
	this.fltHeight=fltHeight;
	this.intWidthSegments=intWidthSegments;
	this.intHeightSegments=intHeightSegments;
	this.fltTransitionWidth=(this.fltWidth/this.intWidthSegments)/5;
	this.fltTransitionHeight=(this.fltHeight/this.intHeightSegments)/5;
	this.blnTransitionDone=false;
	this.lstGrids=[];
	this.lstLoadedRegionsCoords=[];
	this.lstLandscapeObjectsFactory=[];
	this.lstLandscapeGridObjects=[];
	this.lstLandscapeObjects=[];
	this.skyObject=null;
	this.lstRoadObjectsFactory=[];
	this.lstRoadsObjects=[];
	this.lstRoadAdvancedCurvesFactory=[];
	this.lstRoadAreasFactory=[];
	this.lstTreesObjectsFactory=[];
	this.lstTreesObjects=[];
	this.lstAdditionalObjects=[];
	this.lstBuildingObjectsFactory=[];
	this.lstBuildingObjects=[];
	this.lstTriangleSelectorsFactory=[];
	this.lstSphereSelectorsFactory=[];
	this.lstBoxSelectorsFactory=[];
	this.lstTriangleSelectors=[];
	this.lstSphereSelectors=[];
	this.lstBoxSelectors=[];
	this.intActualRegion=null;
	this.fltMountainMax=30;
	var fltRoadHeight=mhd.fltRoadHeight;	
	this.fltRoadHeight=fltRoadHeight;
	this.dctModelObjects={};
	this.lstScheduledTimeouts=[];
	this.blnTraversingObjectMatches=false;
	var finalizeFunction=function(objectModel){
		for(var ii=0;ii<objectModel.children.length;ii++){
			objectModel.children[ii].geometry.computeBoundingBox();
		}
	};
	this.dctModelObjects["rock"]=["rock",["./models/","Rock.mtl","Rock.obj"],"obj+mtl",new THREE.Vector3(0,0,3),new THREE.Vector3(0,0,0),new THREE.Vector3(1,1,1),null,finalizeFunction];
	this.dctLoadedModelObjects={};
	this.lstRegionModelObjects=[];
	this.lstRegionRepeatedModelObjects=[];
	this.lstRegionRepeatedModelObjectsConfigurations=[];
	this.regionsRoot=new THREE.Object3D();
	this.regionsRoot.position.set(0,0,0);
	this.scene=scene;
	this.scene.add(this.regionsRoot);
	this.internationalCurve=new SimpleCurve();
};
RegionManager.prototype.getMatrixHardDriveObjectTraverseFunction=function(sceneMesh,object){
	if(sceneMesh.uuid==object.uuid){
		window.mhd.regions.blnTraversingObjectMatches=true;
	}
};
RegionManager.prototype.getMatrixHardDriveObject=function(sceneMesh){
	var object,selectableObject;
	var lstSelectableObjects=[this.lstLandscapeGridObjects,[this.skyObject],this.lstTreesObjects,this.lstAdditionalObjects,this.lstRegionModelObjects[this.intActualRegion]];
	for(var ii=0;ii<this.lstRoadsObjects.length;ii++)
		lstSelectableObjects.push(this.lstRoadsObjects[ii].lstRoadObjects);
	for(var ii=0;ii<lstSelectableObjects.length;ii++){
		for(var jj in lstSelectableObjects[ii]){
			selectableObject=lstSelectableObjects[ii][jj];
			this.blnTraversingObjectMatches=false;
			if(undefined!=selectableObject.traverse){
				selectableObject.traverse(function(object){window.mhd.regions.getMatrixHardDriveObjectTraverseFunction(sceneMesh,object)});
				if(true==this.blnTraversingObjectMatches){
					if("RoadObject"==selectableObject.strType){
						selectableObject.superRoadsObject.intSelectedRoad=selectableObject.superRoadsObject.lstRoadObjects.indexOf(selectableObject);
					}
					return selectableObject;
				}
			}
		}
	}

	return null;
};
RegionManager.prototype.computeGridPosition=function(vec3localPosition,intRegionNumber){
	var fltShiftX,fltShiftZ,regionCoord;
	var globalPosition;
	if(0==this.lstLoadedRegionsCoords.length)return new THREE.Vector3(-1.*vec3localPosition.x,-1.*vec3localPosition.y,-1.*vec3localPosition.z);
	var actualRegionCoord=this.lstLoadedRegionsCoords[this.intActualRegion];
	regionCoord=this.lstLoadedRegionsCoords[intRegionNumber];
	fltShiftX=(regionCoord[0]-actualRegionCoord[0])*this.fltWidth;
	fltShiftZ=(regionCoord[1]-actualRegionCoord[1])*this.fltHeight;
	globalPosition=new THREE.Vector3(vec3localPosition.x-fltShiftX,vec3localPosition.y+0,vec3localPosition.z+fltShiftZ);
	return new THREE.Vector3(-1.*globalPosition.x,-1.*globalPosition.y,-1.*globalPosition.z);
};
RegionManager.prototype.computeGridPosition_coords=function(vec3localPosition,lstRegionCoords){
	var intRegionNumber=this.coordsLoaded(lstRegionCoords);
	if(-1==intRegionNumber){
		return new THREE.Vector3(-1.*vec3localPosition.x,-1.*vec3localPosition.y,-1.*vec3localPosition.z);
	}
	return this.computeGridPosition(vec3localPosition,intRegionNumber);
};
RegionManager.prototype.computeGridTangent=function(vec3localTangent,intRegionNumber){
	return new THREE.Vector3(-1.*vec3localTangent.x,-1.*vec3localTangent.y,-1.*vec3localTangent.z);
};
RegionManager.prototype.coordsLoaded=function(lstRegionCoords){
	for(var ii=0;ii<this.lstLoadedRegionsCoords.length;ii++){
		if(lstRegionCoords[0]==this.lstLoadedRegionsCoords[ii][0]&&lstRegionCoords[1]==this.lstLoadedRegionsCoords[ii][1])return ii;
	}
	return -1;
};
RegionManager.prototype.addRegion=function(lstRegionCoords,intRegionType,vec3localPosition){
	var intRegion=this.coordsLoaded(lstRegionCoords);
	if(-1!=intRegion)return;
	var mesh,material,geometry,object,roadGeometry;
	var landscapeGridObject;
	var roadMesh,roadArea,additionalObjects,treesMesh;
	var triangleSelectorObject,sphereSelectorObject,boxSelectorObject,landscapeObject,landscapeObjectCopy,roadAdvancedCurve,roadObject,roadAreaObject,roadsObject,roadsAreaObjects,additionalObjects,treesObject;
	var grid;
	additionalObjects=[];
	grid=new THREE.Object3D();
	grid.position.copy(this.computeGridPosition_coords(vec3localPosition,lstRegionCoords));
	this.regionsRoot.add(grid);

	var landscapeColor;
	if(0==this.lstTriangleSelectorsFactory.length){
		object=new TriangleSelectorObject();
		this.lstTriangleSelectorsFactory.push(object);
		triangleSelectorObject=this.lstTriangleSelectorsFactory.pop();
		
	}else{
		triangleSelectorObject=this.lstTriangleSelectorsFactory.pop();
	}
	grid.add(triangleSelectorObject.mesh);

	if(0==this.lstSphereSelectorsFactory.length){
		object=new SphereSelectorObject();
		this.lstSphereSelectorsFactory.push(object);
		sphereSelectorObject=this.lstSphereSelectorsFactory.pop();
		
	}else{
		sphereSelectorObject=this.lstSphereSelectorsFactory.pop();
	}
	grid.add(sphereSelectorObject.mesh);

	if(0==this.lstBoxSelectorsFactory.length){
		object=new BoxSelectorObject();
		this.lstBoxSelectorsFactory.push(object);
		boxSelectorObject=this.lstBoxSelectorsFactory.pop();
		
	}else{
		boxSelectorObject=this.lstBoxSelectorsFactory.pop();
	}
	grid.add(boxSelectorObject.mesh);

	landscapeColor=this.lstLandscapeColors[intRegionType%4];
	if(0==this.lstLandscapeObjectsFactory.length){
		var color=new THREE.Color(landscapeColor);
		object=new LandscapeObject(this.fltWidth,this.fltHeight,this.intWidthSegments,this.intHeightSegments,this.regionsRoot,this.fltMountainMax,false,color);
		this.lstLandscapeObjectsFactory.push(object);
		landscapeObject=this.lstLandscapeObjectsFactory.pop();
		
	}else{
		landscapeObject=this.lstLandscapeObjectsFactory.pop();
		landscapeObject.mesh.material.color=new THREE.Color(landscapeColor);
	}
	landscapeObject.update(false);
	landscapeGridObject=landscapeObject.clone(true);
	grid.add(landscapeGridObject.mesh);
	var raycaster=new THREE.Raycaster();
	raycaster.ray.direction.set(0,-1,0);
	var fltX,fltY,fltZ,lstIntersections,fltScale;
	if(null==this.skyObject){
		this.skyObject=new SkyObject();
		grid.add(this.skyObject.mesh);
	}
	if(0==this.lstRoadAdvancedCurvesFactory.length){
		this.lstRoadAdvancedCurvesFactory.push(new AdvancedCurve());
	}
	roadAdvancedCurve=this.lstRoadAdvancedCurvesFactory.pop();
	intRegion=this.lstGrids.length;
	roadAdvancedCurve.loadFromFunction(landscapeObject.mesh,this.internationalCurve,1500,intRegion);
	if(0==this.lstRoadObjectsFactory.length){
		object=new RoadObject(roadAdvancedCurve,roadAdvancedCurve.intSplinePointsLength,window.mhd.fltRoadWidth,landscapeObject.mesh);
		this.lstRoadObjectsFactory.push(object);
		roadObject=this.lstRoadObjectsFactory.pop();
	}else{
		roadObject=this.lstRoadObjectsFactory.pop();
		roadObject.update(roadAdvancedCurve,roadAdvancedCurve.intSplinePointsLength,window.mhd.fltRoadWidth,landscapeObject.mesh);
	}
	roadAdvancedCurve.lstRoadsToUpdate.push(roadObject);
	grid.add(roadObject.mesh);
	if(0==this.lstRoadAreasFactory.length){
		object=new RoadObject(roadAdvancedCurve,roadAdvancedCurve.intSplinePointsLength,window.mhd.fltRoadWidth+1.5,landscapeObject.mesh);
		this.lstRoadAreasFactory.push(object);
		roadArea=this.lstRoadAreasFactory.pop();
	}else{
		roadArea=this.lstRoadAreasFactory.pop();
		roadArea.update(roadAdvancedCurve,roadAdvancedCurve.intSplinePointsLength,window.mhd.fltRoadWidth+1.5,landscapeObject.mesh);
	}
	if(0==this.lstTreesObjectsFactory.length){
		object=new TreesObject(landscapeObject.mesh,roadArea.mesh,window.mhd.intTrees);
		this.lstTreesObjectsFactory.push(object);
		treesObject=this.lstTreesObjectsFactory.pop();
	}else{
		treesObject=this.lstTreesObjectsFactory.pop();
		treesObject.mesh.material.needsUpdate=true;
		treesObject.update(landscapeObject.mesh,roadArea.mesh,window.mhd.intTrees);
	}
	grid.add(treesObject.mesh);


	var vec3position=new THREE.Vector3(0);
	var vec3rotation=new THREE.Vector3(0);
	var vec3scale=new THREE.Vector3(1.);
	var vec3color=new THREE.Vector3(0.,0.,0.);
	var intColor=0;


	var lstBuildingObjects=null;
	var buildingsScaleFactor=0.5;
	if(0==this.lstBuildingObjectsFactory.length){
		object=[];
		this.lstBuildingObjectsFactory.push(object);
		lstBuildingObjects=this.lstBuildingObjectsFactory.pop();
		for(var ii=0;ii<window.mhd.intBuildings;ii++){
			vec3position=new THREE.Vector3(0);
			vec3rotation=new THREE.Vector3(0);
			vec3scale=new THREE.Vector3(1.);
			vec3color=new THREE.Vector3(0.,0.,0.);
			intColor=Math.floor(Math.random()*10.9);
			if(intColor<10){
				vec3color.x=window.mhd.lstIntColors[intColor][0];
				vec3color.y=window.mhd.lstIntColors[intColor][1];
				vec3color.z=window.mhd.lstIntColors[intColor][2];
			}else{
				vec3color.x=255;
				vec3color.y=60;
				vec3color.z=0;
			}
			fltX=Math.random()*1600-800;
			fltY=0;
			fltZ=Math.random()*1600-800;
			raycaster.ray.origin.set(fltX,window.mhd.fltStandardRaycastHeight,fltZ);
			lstIntersections=raycaster.intersectObject(landscapeObject.mesh);
			if(0!=lstIntersections.length){
				vec3scale.x=buildingsScaleFactor*20;
				vec3scale.y=buildingsScaleFactor*(Math.random()*80+10);
				vec3scale.z=buildingsScaleFactor*20;
				fltY=lstIntersections[0].point.y;
				vec3position.x=fltX;
				vec3position.y=fltY;
				vec3position.z=fltZ;
			}else{
				vec3scale.x=buildingsScaleFactor*20;
				vec3scale.y=buildingsScaleFactor*(Math.random()*80+10);
				vec3scale.z=buildingsScaleFactor*20;
				fltY=0;
				vec3position.x=fltX;
				vec3position.y=fltY;
				vec3position.z=fltZ;
			}
			lstBuildingObjects[ii]=new BuildingObject(vec3position,vec3rotation,vec3scale,vec3color);
			grid.add(lstBuildingObjects[ii].mesh);
		}
	}else{
		lstBuildingObjects=this.lstBuildingObjectsFactory.pop();
		for(var ii=0;ii<window.mhd.intBuildings;ii++){
			vec3position=new THREE.Vector3(0);
			vec3rotation=new THREE.Vector3(0);
			vec3scale=new THREE.Vector3(1.);
			vec3color=new THREE.Vector3(0.,0.,0.);
			intColor=Math.floor(Math.random()*10.9);
			if(intColor<10){
				vec3color.x=window.mhd.lstIntColors[intColor][0];
				vec3color.y=window.mhd.lstIntColors[intColor][1];
				vec3color.z=window.mhd.lstIntColors[intColor][2];
			}else{
				vec3color.x=255;
				vec3color.y=60;
				vec3color.z=0;
			}
			fltX=Math.random()*1600-800;
			fltY=0;
			fltZ=Math.random()*1600-800;
			raycaster.ray.origin.set(fltX,window.mhd.fltStandardRaycastHeight,fltZ);
			lstIntersections=raycaster.intersectObject(landscapeObject.mesh);
			if(0!=lstIntersections.length){
				vec3scale.x=buildingsScaleFactor*20;
				vec3scale.y=buildingsScaleFactor*(Math.random()*80+10);
				vec3scale.z=buildingsScaleFactor*20;
				fltY=lstIntersections[0].point.y;
				vec3position.x=fltX;
				vec3position.y=fltY;
				vec3position.z=fltZ;
				lstBuildingObjects[ii].update(vec3position,vec3rotation,vec3scale,vec3color);
			}else{
				vec3scale.x=buildingsScaleFactor*20;
				vec3scale.y=buildingsScaleFactor*(Math.random()*80+10);
				vec3scale.z=buildingsScaleFactor*20;
				fltY=0;
				vec3position.x=fltX;
				vec3position.y=fltY;
				vec3position.z=fltZ;
				lstBuildingObjects[ii].update(vec3position,vec3rotation,vec3scale,vec3color);

			}
			lstBuildingObjects[ii].mesh.material.needsUpdate=true;
			grid.add(lstBuildingObjects[ii].mesh);
		}
	}
	this.lstTriangleSelectors.push(triangleSelectorObject);
	this.lstSphereSelectors.push(sphereSelectorObject);
	this.lstBoxSelectors.push(boxSelectorObject);
	this.lstLandscapeObjects.push(landscapeObject);
	this.lstLandscapeGridObjects.push(landscapeGridObject);
	this.lstRoadsObjects.push(new RoadsObject(roadObject,roadAdvancedCurve));
	this.lstAdditionalObjects.push(additionalObjects);
	this.lstTreesObjects.push(treesObject);
	this.lstBuildingObjects.push(lstBuildingObjects);
	this.lstGrids.push(grid);
	if(null==this.intActualRegion)
		this.intActualRegion=0;
	this.lstLoadedRegionsCoords.push(lstRegionCoords);
	this.lstRoadAreasFactory.push(roadArea);
	intRegion=this.lstGrids.length-1;
	this.lstRegionModelObjects.push({});
	this.lstRegionRepeatedModelObjects.push({});
	this.lstRegionRepeatedModelObjectsConfigurations[intRegion]={};
	this.lstRegionRepeatedModelObjectsConfigurations[intRegion]["rock"]=[];

	for(var ii=0;ii<window.mhd.intInstanciatedRocks;ii++){
		fltX=Math.random()*this.fltWidth;
		fltZ=Math.random()*this.fltHeight;
		fltY=0;
		raycaster.ray.origin.set(fltX,window.mhd.fltStandardRaycastHeight,fltZ);
		lstIntersections=raycaster.intersectObject(landscapeObject.mesh);
		if(0!=lstIntersections.length){
			fltScale=1+5*Math.random();
			fltY=lstIntersections[0].point.y-fltScale/2;;
			this.lstRegionRepeatedModelObjectsConfigurations[intRegion]["rock"].push([new THREE.Vector3(fltX,fltY,fltZ),new THREE.Vector3(2*Math.PI*Math.random(),2*Math.PI*Math.random(),2*Math.PI*Math.random()),new THREE.Vector3(fltScale,fltScale,fltScale)]);
		}else{
			fltScale=1+5*Math.random();
			fltY=0;
			this.lstRegionRepeatedModelObjectsConfigurations[intRegion]["rock"].push([new THREE.Vector3(fltX,fltY,fltZ),new THREE.Vector3(2*Math.PI*Math.random(),2*Math.PI*Math.random(),2*Math.PI*Math.random()),new THREE.Vector3(fltScale,fltScale,fltScale)]);
		}
	}
	this.addModelObjects(intRegion);
};
RegionManager.prototype.addModelObjects=function(intRegionNumber){
	var def;
	for(var key in window.mhd.regions.dctModelObjects){
		if(undefined==window.mhd.regions.dctLoadedModelObjects[key]){
			def=window.mhd.regions.dctModelObjects[key];
			window.mhd.regions.dctLoadedModelObjects[key]=new ModelObject(key,def[0],def[1],def[2],def[3],def[4],def[5],def[6],def[7]);
			window.mhd.regions.lstScheduledTimeouts.push([""+key,0+intRegionNumber]);
			setTimeout(function(){var args=window.mhd.regions.lstScheduledTimeouts.pop();if(undefined!=args){window.mhd.regions.addModelObjectsStage2(args[0],args[1])};},1000);
		}else{
			window.mhd.regions.addModelObjectsStage2(""+key,intRegionNumber);
		}
	}
};
RegionManager.prototype.addModelObjectsStage2=function(key,intRegionNumber){
	if(undefined!=window.mhd.regions.dctLoadedModelObjects[key]&&null!=window.mhd.regions.dctLoadedModelObjects[key].mesh){
		if(undefined==window.mhd.regions.lstRegionModelObjects[intRegionNumber][key]){
			window.mhd.regions.lstRegionModelObjects[intRegionNumber][key]=window.mhd.regions.dctLoadedModelObjects[key].clone();
			window.mhd.regions.lstRegionModelObjects[intRegionNumber][key].addToRegionSubscene(window.mhd.regions.lstGrids[intRegionNumber]);
			window.mhd.regions.repeatModelObjects_instancing(key,intRegionNumber);
		}
	}else{
		window.mhd.regions.lstScheduledTimeouts.push([""+key,0+intRegionNumber]);
		setTimeout(function(){var args=window.mhd.regions.lstScheduledTimeouts.pop();if(undefined!=args){window.mhd.regions.addModelObjectsStage2(args[0],args[1])};},1000);
	}
};
RegionManager.prototype.removeModelObjects=function(intRegionNumber){
	for(var strKey in window.mhd.regions.lstRegionModelObjects[intRegionNumber]){
		window.mhd.regions.lstRegionModelObjects[intRegionNumber][strKey].removeFromRegionSubscene(window.mhd.regions.lstGrids[intRegionNumber]);
	}
};
RegionManager.prototype.instanciate=function(objectMesh,intCount){
	var instanciatedMesh=new THREE.InstancedMesh(objectMesh.geometry,objectMesh.material,intCount);
	instanciatedMesh.position.set(0,0,0);
	instanciatedMesh.geometry.morphTargetsRelative=false;
	instanciatedMesh.geometry.morphAttributes={};
	instanciatedMesh.material.morphTargets=false;

	delete instanciatedMesh.morphTargetDictionary;
	delete instanciatedMesh.morphTargetInfluences;
	return instanciatedMesh;
};
RegionManager.prototype.instanciateNext=function(object,intCount){
	if(undefined==object)return null;
	if(undefined==object.children)return null;
	if(0==object.children.length){
		if(true==object.isMesh)
			return new THREE.InstancedMesh(object.geometry,object.material,intCount);
		else{
			if(undefined!=object.mesh){
				if(object.mesh.isMesh){
					var superObject=new THREE.Object3D();	
					superObject.position=object.position.clone();
					superObject.rotation=object.rotation.clone();
					superObject.scale=object.scale.clone();
					superObject=new THREE.InstancedMesh(object.mesh.geometry,object.mesh.material,intCount);
					if(undefined!=object.mesh.children&&object.mesh.children.length>0){
						for(var ii=0;ii<object.mesh.children.length;ii++){
							superObject.add(instanciate(object.mesh.children[ii]),intCount);
						}
						return superObject;
					}
				}else{
					if(undefined!=object.mesh.children&&object.mesh.children.length>0){
						for(var ii=0;ii<object.mesh.children.length;ii++){
							superObject.add(instanciate(object.mesh.children[ii]),intCount);
						}
					}else return null;

				}
				return superObject;
			}
			else return null;
		}
	}else{
		var superObject=new THREE.Object3D();	
		superObject.position=object.position.clone();
		superObject.rotation=object.rotation.clone();
		superObject.scale=object.scale.clone();
		if(undefined!=object.mesh)
			superObject.mesh=new THREE.InstancedMesh(object.mesh.geometry,object.mesh.material,intCount);
		for(var ii=0;ii<object.children.length;ii++){
			superObject.add(instanciate(object.children[ii]),intCount);
		}
		return superObject;
	}
}
RegionManager.prototype.repeatModelObjects_instancing=function(strKey,intRegionNumber){
	var object= new THREE.Object3D();
	var lstConfigurations=window.mhd.regions.lstRegionRepeatedModelObjectsConfigurations[intRegionNumber];
	if(undefined==lstConfigurations){
		return;
	}
	var lstKeyConfigurations=lstConfigurations[strKey];
	if(undefined==lstKeyConfigurations){
		return;
	}
	var instanciatedModelObject,lstConfiguration;
	var instanciatedModelMesh;
	instanciatedModelMesh=this.instanciate(window.mhd.regions.lstRegionModelObjects[intRegionNumber][strKey].mesh.children[0],window.mhd.regions.lstRegionRepeatedModelObjectsConfigurations[intRegionNumber][strKey].length);
	window.mhd.regions.lstRegionModelObjects[intRegionNumber][strKey].instanciatedModelMesh=instanciatedModelMesh;
	instanciatedModelMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);//will be updated every frame
	window.mhd.regions.lstGrids[intRegionNumber].add(instanciatedModelMesh);
	for(var ii=0;ii<lstKeyConfigurations.length;ii++){
		lstConfiguration=lstKeyConfigurations[ii];
		object.position.set(lstConfiguration[0].x,lstConfiguration[0].y,lstConfiguration[0].z);
		object.rotation.set(lstConfiguration[1].x,lstConfiguration[1].y,lstConfiguration[1].z);
		object.scale.set(lstConfiguration[2].x,lstConfiguration[2].y,lstConfiguration[2].z);
		object.updateMatrix();
		instanciatedModelMesh.setMatrixAt(ii,object.matrix);
		instanciatedModelMesh.instanceMatrix.needsUpdate=true;
		window.mhd.regions.lstRegionRepeatedModelObjects[intRegionNumber][strKey]=instanciatedModelMesh;
	}
};

RegionManager.prototype.repeatModelObjects=function(strKey,intRegionNumber){
	//repeating instances of objects with one geometry and materials, but with different configurations
	var lstConfigurations=window.mhd.regions.lstRegionRepeatedModelObjectsConfigurations[intRegionNumber];
	var repeatedModelObject,lstConfiguration;
	for(var ii=0;ii<lstConfigurations.length;ii++){
		lstConfiguration=lstConfigurations[ii];
		if(strKey==lstConfiguration[0]){
			repeatedModelObject=window.mhd.regions.lstRegionModelObjects[intRegionNumber][strKey].clone();
			repeatedModelObject.mesh.position.x=lstConfiguration[1].x;
			repeatedModelObject.mesh.position.y=lstConfiguration[1].y;
			repeatedModelObject.mesh.position.z=lstConfiguration[1].z;
			repeatedModelObject.mesh.rotation.x=lstConfiguration[2].x;
			repeatedModelObject.mesh.rotation.y=lstConfiguration[2].y;
			repeatedModelObject.mesh.rotation.z=lstConfiguration[2].z;
			repeatedModelObject.mesh.scale.x=lstConfiguration[3].x;
			repeatedModelObject.mesh.scale.y=lstConfiguration[3].y;
			repeatedModelObject.mesh.scale.z=lstConfiguration[3].z;
			window.mhd.regions.lstRegionRepeatedModelObjects[intRegionNumber][strKey]=repeatedModelObject;
			window.mhd.regions.lstRegionRepeatedModelObjects[intRegionNumber][strKey].addToRegionSubscene(window.mhd.regions.lstGrids[intRegionNumber]);
		}
	}
};
RegionManager.prototype.addRegion0=function(vec3localPosition){
	this.addRegion([0,0],0,vec3localPosition);
	document.title=""+[0,0];
};
RegionManager.prototype.disposeObjectRecursive=function(object){
	if(undefined==object.mesh)return;
	if(undefined!=object.mesh.geometry)
		object.mesh.geometry.dispose();
	if(undefined!=object.mesh.material){
		if(null!=object.mesh.material.map)
			object.mesh.material.map.dispose();
		object.mesh.material.dispose();
	}
	for(var ii=0;ii<object.mesh.children.length;ii++)
		this.disposeObjectRecursive(object.mesh.children[ii]);
};
RegionManager.prototype.clean=function(){
	var meshes=[],mesh;
	this.scene.traverse(function(object){
		if(object.isMesh)meshes.push(object);
	});
	for(var ii=0;ii<meshes.length;ii++){
		mesh=meshes[ii];
		mesh.material.dispose();
		mesh.geometry.dispose();
		this.scene.remove(mesh);
	}
};
RegionManager.prototype.disposeRegion=function(lstRegionCoords){
	var lstActualRegionCoords=this.lstLoadedRegionsCoords[this.intActualRegion];
	var intRegion=this.coordsLoaded(lstRegionCoords);
	if(-1==intRegion)return;
	var grid,mesh,geometry,material,texture=null;
	this.lstLoadedRegionsCoords.splice(intRegion,1);
	this.lstTriangleSelectorsFactory.push(this.lstTriangleSelectors[intRegion]);
	this.lstTriangleSelectors.splice(intRegion,1);
	this.lstSphereSelectorsFactory.push(this.lstSphereSelectors[intRegion]);
	this.lstSphereSelectors.splice(intRegion,1);
	this.lstBoxSelectorsFactory.push(this.lstBoxSelectors[intRegion]);
	this.lstBoxSelectors.splice(intRegion,1);
	this.lstLandscapeObjectsFactory.push(this.lstLandscapeObjects[intRegion]);
	this.lstLandscapeObjects.splice(intRegion,1);
	this.lstLandscapeGridObjects.splice(intRegion,1);
	this.lstRoadsObjects[intRegion].cleanups(this.lstRoadObjectsFactory,this.lstRoadAdvancedCurvesFactory);
	this.lstRoadsObjects.splice(intRegion,1);
	this.lstAdditionalObjects.splice(intRegion,1);
	this.lstTreesObjectsFactory.push(this.lstTreesObjects[intRegion]);
	this.lstTreesObjects.splice(intRegion,1);
	this.lstBuildingObjectsFactory.push(this.lstBuildingObjects[intRegion]);
	this.lstBuildingObjects.splice(intRegion,1);
	this.lstRegionModelObjects.splice(intRegion,1);	
	this.lstRegionRepeatedModelObjects.splice(intRegion,1);	
	grid=this.lstGrids[intRegion];
	this.lstGrids.splice(intRegion,1);
	var meshes=[];
	grid.traverse(function(object){
		if(object.isMesh)meshes.push(object);
	});
	meshes.push(grid);
	var mesh;
	for(var ii=0;ii<meshes.length;ii++){
		mesh=meshes[ii];
		if(undefined!=mesh.material){
			if(undefined!=mesh.material.map){
				mesh.material.map.dispose();
			}
			mesh.material.dispose();
		}
		if(undefined!=mesh.geometry)
			mesh.geometry.dispose();
		grid.remove(mesh);
	}
	this.regionsRoot.remove(grid);
	this.intActualRegion=this.coordsLoaded(lstActualRegionCoords);
	if(-1==this.intActualRegion){
		console.log("dispose region: -1==this.intActualRegion");
	}
};
RegionManager.prototype.transitionPosition=function(vec3position){
	var fltSegmentWidth=this.fltWidth/this.intWidthSegments;
	var fltSegmentHeight=this.fltHeight/this.intHeightSegments;
	var fltShiftX=this.fltWidth/2;
	var fltShiftZ=this.fltHeight/2;
	var vec3testPosition=new THREE.Vector3(fltShiftX+vec3position.x,vec3position.y,fltShiftZ+vec3position.z);
	if(vec3testPosition.x<this.fltTransitionWidth){
		return true;
	}
	if(vec3testPosition.z<this.fltTransitionHeight){
		return true;
	}
	if(vec3testPosition.x>this.fltWidth-this.fltTransitionWidth){
		return true;
	}
	if(vec3testPosition.z>this.fltHeight-this.fltTransitionHeight){
		return true;
	}
	return false;
};
RegionManager.prototype.needsUpdate=function(vec3position){
	if(true==this.transitionPosition(vec3position)){
		return;
	}
	var lstActual=this.lstLoadedRegionsCoords[this.intActualRegion];
	var lstToAdd   =[false,false,false,
			 false,false,false,
			 false,false,false];
	var lstToRemove=[false,false,false,
			 false,false,false,
			 false,false,false];
	var fltSegmentWidth=this.fltWidth/this.intWidthSegments;
	var fltSegmentHeight=this.fltHeight/this.intHeightSegments;
	var fltShiftX=this.fltWidth/2;
	var fltShiftZ=this.fltHeight/2;
	var vec3testPosition=new THREE.Vector3(fltShiftX+vec3position.x,vec3position.y,fltShiftZ+vec3position.z);
	if(vec3testPosition.x<fltSegmentWidth){
		if(vec3testPosition.z<fltSegmentHeight||vec3testPosition.z>this.fltHeight-fltSegmentHeight){
			if(vec3testPosition.z<fltSegmentHeight){
	/*
	var lstToAdd=	[true,true,false,
			 true,false,false,
			 false,false,false];
	*/
				
				lstToAdd[0]=true;
				lstToAdd[1]=true;
				lstToAdd[3]=true;
	/*
	var lstToRemove=[false,false,true,
			 false,false,true,
			 true,true,true];
	*/

				lstToRemove[2]=true;
				lstToRemove[5]=true;
				lstToRemove[6]=true;
				lstToRemove[7]=true;
				lstToRemove[8]=true;
			}
			if(vec3testPosition.z>this.fltHeight-fltSegmentHeight){
	/*
	var lstToAdd=	[false,false,false,
			 true,false,false,
			 true,true,false];
	*/
				lstToAdd[6]=true;
				lstToAdd[3]=true;
				lstToAdd[7]=true;
	/*
	var lstToRemove=[true,true,true,
			 false,false,true,
			 false,false,true];
	*/
				lstToRemove[0]=true;
				lstToRemove[1]=true;
				lstToRemove[2]=true;
				lstToRemove[5]=true;
				lstToRemove[8]=true;
			}
		}else{
	/*
	var lstToAdd=	[false,false,false,
			 true,false,false,
			 false,false,false];
	*/
			lstToAdd[3]=true;
	/*
	var lstToRemove=[false,false,true,
			 false,false,true,
			 false,false,true];
	*/
			lstToRemove[2]=true;
			lstToRemove[5]=true;
			lstToRemove[8]=true;
		}
	}
	if(vec3testPosition.x>this.fltWidth-fltSegmentWidth){
		if(vec3testPosition.z<fltSegmentHeight||vec3testPosition.z>this.fltHeight-fltSegmentHeight){
			if(vec3position.z<fltSegmentHeight){
	/*
	var lstToAdd=	[false,true,true,
			 false,false,true,
			 false,false,false];
	*/
				lstToAdd[2]=true;
				lstToAdd[1]=true;
				lstToAdd[5]=true;
	/*
	var lstToRemove=[true,false,false,
			 true,false,false,
			 true,true,true];
	*/
				lstToRemove[0]=true;
				lstToRemove[3]=true;
				lstToRemove[6]=true;
				lstToRemove[7]=true;
				lstToRemove[8]=true;
			}
			if(vec3testPosition.z>this.fltHeight-fltSegmentHeight){
	/*
	var lstToAdd=	[false,false,false,
			 false,false,true,
			 false,true,true];
	*/
				lstToAdd[8]=true;
				lstToAdd[5]=true;
				lstToAdd[7]=true;
	/*
	var lstToRemove=[true,true,true,
			 true,false,false,
			 true,false,false];
	*/
				lstToRemove[0]=true;
				lstToRemove[1]=true;
				lstToRemove[2]=true;
				lstToRemove[3]=true;
				lstToRemove[6]=true;
			}
		}else{
	/*
	var lstToAdd=	[false,false,false,
			 false,false,true,
			 false,false,false];
	*/
			lstToAdd[5]=true;
	/*
	var lstToRemove=[true,false,false,
			 true,false,false,
			 true,false,false];
	*/
			lstToRemove[0]=true;
			lstToRemove[3]=true;
			lstToRemove[6]=true;
		}
	}
	if(vec3testPosition.z<fltSegmentHeight){
		if(vec3testPosition.x<fltSegmentWidth||vec3testPosition.x>this.fltWidth-fltSegmentWidth){
			if(vec3testPosition.x<fltSegmentWidth){
	/*
	var lstToAdd=	[true,true,false,
			 true,false,false,
			 false,false,false];
	*/
				lstToAdd[0]=true;
				lstToAdd[1]=true;
				lstToAdd[3]=true;
	/*
	var lstToRemove=[false,false,true,
			 false,false,true,
			 true,true,true];
	*/
				lstToRemove[2]=true;
				lstToRemove[5]=true;
				lstToRemove[6]=true;
				lstToRemove[7]=true;
				lstToRemove[8]=true;
			}
			if(vec3testPosition.x>this.fltWidth-fltSegmentWidth){
	/*
	var lstToAdd=	[false,true,true,
			 false,false,true,
			 false,false,false];
	*/
				lstToAdd[2]=true;
				lstToAdd[1]=true;
				lstToAdd[5]=true;
	/*
	var lstToRemove=[true,false,false,
			 true,false,false,
			 true,true,true];
	*/
				lstToRemove[0]=true;
				lstToRemove[3]=true;
				lstToRemove[6]=true;
				lstToRemove[7]=true;
				lstToRemove[8]=true;
			}
		}else{
	/*
	var lstToAdd=	[false,true,false,
			 false,false,false,
			 false,false,false];
	*/
			lstToAdd[1]=true;
	/*
	var lstToRemove=[false,false,false,
			 false,false,false,
			 true,true,true];
	*/
			lstToRemove[6]=true;
			lstToRemove[7]=true;
			lstToRemove[8]=true;
		}
	}
	if(vec3testPosition.z>this.fltHeight-fltSegmentHeight){
		if(vec3testPosition.x<fltSegmentWidth||vec3testPosition.x>this.fltWidth-fltSegmentWidth){
			if(vec3testPosition.x<fltSegmentWidth){
	/*
	var lstToAdd=	[false,false,false,
			 true,false,false,
			 true,true,true];
	*/
				lstToAdd[6]=true;
				lstToAdd[3]=true;
				lstToAdd[7]=true;
	/*
	var lstToRemove=[true,true,true,
			 false,false,true,
			 false,false,true];
	*/
				lstToRemove[0]=true;
				lstToRemove[1]=true;
				lstToRemove[2]=true;
				lstToRemove[5]=true;
				lstToRemove[8]=true;
			}
			if(vec3testPosition.x>this.fltWidth-fltSegmentWidth){
	/*
	var lstToAdd=	[false,false,false,
			 false,false,true,
			 false,true,true];
	*/
				lstToAdd[8]=true;
				lstToAdd[5]=true;
				lstToAdd[7]=true;
	/*
	var lstToRemove=[true,true,true,
			 true,false,false,
			 true,false,false];
	*/
				lstToRemove[0]=true;
				lstToRemove[1]=true;
				lstToRemove[2]=true;
				lstToRemove[3]=true;
				lstToRemove[6]=true;
			}
		}else{
	/*
	var lstToAdd=	[false,false,false,
			 false,false,false,
			 false,true,false];
	*/
			lstToAdd[7]=true;
	/*
	var lstToRemove=[true,true,true,
			 false,false,false,
			 false,false,false];
	*/
			lstToRemove[0]=true;
			lstToRemove[1]=true;
			lstToRemove[2]=true;
		}
	}
	var lstRegionsToAdd=[];
	//x,z not screen coordinates
	if(true==lstToAdd[0])lstRegionsToAdd.push([lstActual[0]-1,lstActual[1]+1]);
	if(true==lstToAdd[1])lstRegionsToAdd.push([lstActual[0],lstActual[1]+1]);
	if(true==lstToAdd[2])lstRegionsToAdd.push([lstActual[0]+1,lstActual[1]+1]);
	if(true==lstToAdd[3])lstRegionsToAdd.push([lstActual[0]-1,lstActual[1]]);

	if(true==lstToAdd[5])lstRegionsToAdd.push([lstActual[0]+1,lstActual[1]]);
	if(true==lstToAdd[6])lstRegionsToAdd.push([lstActual[0]-1,lstActual[1]-1]);
	if(true==lstToAdd[7])lstRegionsToAdd.push([lstActual[0],lstActual[1]-1]);
	if(true==lstToAdd[8])lstRegionsToAdd.push([lstActual[0]+1,lstActual[1]-1]);
	if(0==lstRegionsToAdd.length)return null;
	var lstRegionsToRemove=[];
	if(true==lstToRemove[0])lstRegionsToRemove.push([lstActual[0]-1,lstActual[1]+1]);
	if(true==lstToRemove[1])lstRegionsToRemove.push([lstActual[0],lstActual[1]+1]);
	if(true==lstToRemove[2])lstRegionsToRemove.push([lstActual[0]+1,lstActual[1]+1]);
	if(true==lstToRemove[3])lstRegionsToRemove.push([lstActual[0]-1,lstActual[1]]);

	if(true==lstToRemove[5])lstRegionsToRemove.push([lstActual[0]+1,lstActual[1]]);
	if(true==lstToRemove[6])lstRegionsToRemove.push([lstActual[0]-1,lstActual[1]-1]);
	if(true==lstToRemove[7])lstRegionsToRemove.push([lstActual[0],lstActual[1]-1]);
	if(true==lstToRemove[8])lstRegionsToRemove.push([lstActual[0]+1,lstActual[1]-1]);
	return [lstRegionsToRemove,lstRegionsToAdd];

};
RegionManager.prototype.needToChangeRegion=function(vec3localPosition){
	var fltSegmentWidth=this.fltWidth/this.intWidthSegments;
	var fltSegmentHeight=this.fltHeight/this.intHeightSegments;
	var fltShiftX=this.fltWidth/2;
	var fltShiftZ=this.fltHeight/2;
	var vec3testPosition=new THREE.Vector3(fltShiftX+vec3localPosition.x,vec3localPosition.y,fltShiftZ+vec3localPosition.z);
	var intNewRegion=null;
	if(vec3testPosition.x<fltSegmentWidth){
		if(vec3testPosition.z<fltSegmentHeight||vec3testPosition.z>this.fltHeight-fltSegmentHeight){
			if(vec3testPosition.z<fltSegmentHeight){
				intNewRegion=0;
			}
			if(vec3testPosition.z>this.fltHeight-fltSegmentHeight){
				intNewRegion=6;
			}
		}else{
			intNewRegion=3;
		}
	}
	if(vec3testPosition.x>this.fltWidth-fltSegmentWidth){
		if(vec3testPosition.z<fltSegmentHeight||vec3testPosition.z>this.fltHeight-fltSegmentHeight){
			if(vec3testPosition.z<fltSegmentHeight){
				intNewRegion=2;
			}
			if(vec3testPosition.z>this.fltHeight-fltSegmentHeight){
				intNewRegion=8;
			}
		}else{
			intNewRegion=5;
		}
	}
	if(vec3testPosition.z<fltSegmentHeight){
		if(vec3testPosition.x<fltSegmentWidth||vec3testPosition.x>this.fltWidth-fltSegmentWidth){
			if(vec3testPosition.x<fltSegmentWidth){
				intNewRegion=0;
			}
			if(vec3testPosition.x>this.fltWidth-fltSegmentWidth){
				intNewRegion=2;
			}
		}else{
			intNewRegion=1;
		}
	}
	if(vec3testPosition.z>this.fltHeight-fltSegmentHeight){
		if(vec3testPosition.x<fltSegmentWidth||vec3testPosition.x>this.fltWidth-fltSegmentWidth){
			if(vec3testPosition.x<fltSegmentWidth){
				intNewRegion=6;
			}
			if(vec3testPosition.x>this.fltWidth-fltSegmentWidth){
				intNewRegion=8;
			}
		}else{
			intNewRegion=7;
		}
	}
	return intNewRegion;
};
RegionManager.prototype.positionToUpdate=function(vec3localPosition){
	var lstPositionToUpdate=[0,0];
	var intNewRegion=this.needToChangeRegion(vec3localPosition);
	if(null!=intNewRegion){
		if(0==intNewRegion)lstPositionToUpdate=[-1,+1];
		if(1==intNewRegion)lstPositionToUpdate=[0,+1];
		if(2==intNewRegion)lstPositionToUpdate=[+1,+1];
		if(3==intNewRegion)lstPositionToUpdate=[-1,0];
		if(5==intNewRegion)lstPositionToUpdate=[+1,0];
		if(6==intNewRegion)lstPositionToUpdate=[-1,-1];
		if(7==intNewRegion)lstPositionToUpdate=[0,-1];
		if(8==intNewRegion)lstPositionToUpdate=[+1,-1];
	};
	return lstPositionToUpdate;
};
RegionManager.prototype.changeRegion=function(vec3localPosition){
	if(true==this.blnTransitionDone)return;
	var lstActual=this.lstLoadedRegionsCoords[this.intActualRegion];
	var intNewRegion=this.needToChangeRegion(vec3localPosition);
	if(null!=intNewRegion){
		var lstNewRegion;
		if(0==intNewRegion)lstNewRegion=[lstActual[0]-1,lstActual[1]+1];
		if(1==intNewRegion)lstNewRegion=[lstActual[0],lstActual[1]+1];
		if(2==intNewRegion)lstNewRegion=[lstActual[0]+1,lstActual[1]+1];
		if(3==intNewRegion)lstNewRegion=[lstActual[0]-1,lstActual[1]];

		if(5==intNewRegion)lstNewRegion=[lstActual[0]+1,lstActual[1]];
		if(6==intNewRegion)lstNewRegion=[lstActual[0]-1,lstActual[1]-1];
		if(7==intNewRegion)lstNewRegion=[lstActual[0],lstActual[1]-1];
		if(8==intNewRegion)lstNewRegion=[lstActual[0]+1,lstActual[1]-1];

		var intActualRegion=this.coordsLoaded(lstNewRegion);
		var roadsObject;
		if(-1!=intActualRegion){
			roadsObject=this.lstRoadsObjects[this.intActualRegion];
			this.intActualRegion=intActualRegion;
			roadsObject=this.lstRoadsObjects[this.intActualRegion];
			document.title=""+lstNewRegion;		
			this.blnTransitionDone=true;

		}else{
			console.log("changeRegion: -1==intActualRegion");
			console.log("lstNewRegion");
			console.log(lstNewRegion);
			console.log("this.lstLoadedRegionsCoords");
			console.log(this.lstLoadedRegionsCoords);
		}
	}
};
RegionManager.prototype.update=function(lstRegionsToUpdate,vec3localPosition){
	if(0==this.lstLoadedRegionsCoords.length)
		return this.addRegion0(vec3localPosition);
	if(null==lstRegionsToUpdate)return;
	var lstRegionsToRemove,lstRegionsToAdd;
	[lstRegionsToRemove,lstRegionsToAdd]=lstRegionsToUpdate;
	for(var ii=0;ii<lstRegionsToRemove.length;ii++){
		this.disposeRegion(lstRegionsToRemove[ii]);
	}
	for(var ii=0;ii<lstRegionsToAdd.length;ii++){
		this.addRegion(lstRegionsToAdd[ii],(Math.abs(lstRegionsToAdd[ii][0])+Math.abs(lstRegionsToAdd[ii][1]))%10,vec3localPosition);
	}
};
RegionManager.prototype.saveModelObjectsToString=function(intRegionNumber){
	var objModelObjects={};
	var def=null;
	var objSave={};
	for(var strKey in this.lstRegionModelObjects[intRegionNumber]){
		def=null;
		def=this.dctModelObjects[strKey];
		if(undefined==def){
			continue;
		}else{
			objModelObjects[strKey]=def;
		}
	};
	var lstRegionModelObjects=[];
	for(var strKey in this.lstRegionModelObjects[intRegionNumber]){
		lstRegionModelObjects.push(strKey);
	}
	objSave.objModelObjects=objModelObjects;
	objSave.lstRegionModelObjects=lstRegionModelObjects;
	objSave.dctRegionRepeatedModelObjectsConfigurations=this.lstRegionRepeatedModelObjectsConfigurations[intRegionNumber];
	var strSave="ModelObjects|"+String.fromCharCode(10);
	strSave+=JSON.stringify(objSave);
	strSave+="|"+String.fromCharCode(10);
	return strSave;
};
RegionManager.prototype.saveRegionsToString=function(){
	var strRegion="";
	for(var ii=0;ii<this.lstLandscapeObjects.length;ii++){
		strRegion+="Region "+ii+"|"+String.fromCharCode(10);
		strRegion+=this.lstLandscapeObjects[ii].saveToString()+String.fromCharCode(10);
		strRegion+=this.lstRoadsObjects[ii].saveToString()+String.fromCharCode(10);
		strRegion+=this.lstTreesObjects[ii].saveToString()+String.fromCharCode(10);
		strRegion+=this.saveModelObjectsToString(ii)+String.fromCharCode(10);
	}
	return strRegion;
};
RegionManager.prototype.loadModelObjectsFromString=function(intRegionNumber,strModelObjects){
	this.removeModelObjects(intRegionNumber);
	var strType="ModelObjects";
	var objLoad=null;
	objLoad=JSON.parse(strModelObjects);
	var objModelObjects=objLoad.objModelObjects;
	var dctRegionRepeatedModelObjectsConfigurations=objLoad.dctRegionRepeatedModelObjectsConfigurations;
	for(var strKey in objModelObjects){
		this.dctModelObjects[strKey]=objModelObjects[strKey];
		if(undefined!=this.dctLoadedModelObjects[strKey])
			delete this.dctLoadedModelObjects[strKey];
		if(undefined!=this.lstRegionModelObjects[intRegionNumber][strKey])
			delete this.lstRegionModelObjects[intRegionNumber][strKey];
	}
	this.lstRegionRepeatedModelObjectsConfigurations[intRegionNumber]=dctRegionRepeatedModelObjectsConfigurations;
	this.addModelObjects(intRegionNumber);
};
RegionManager.prototype.loadRegionsFromString_modelObjects=function(strContent){
	var lstStrRegions=strContent.split("|");
	var strRegion=null,strModelObjects=null,intRegionNumber=null;
	strRegion="Region";
	strModelObjects="ModelObjects";
	var intRegion=-1,intModelObjects=-1;
	for(var ii=0;ii<lstStrRegions.length;ii++){
		intRegion=lstStrRegions[ii].indexOf(strRegion);
		if(-1!=intRegion){
			intRegionNumber=parseInt(lstStrRegions[ii].substring(intRegion+strRegion.length));
		}
		intModelObjects=lstStrRegions[ii].indexOf(strModelObjects);
		if(-1!=intModelObjects&&null!=intRegionNumber&&false==window.mhd.nonNumber(intRegionNumber)){
			this.loadModelObjectsFromString(intRegionNumber,lstStrRegions[ii+1]);
			intRegionNumber=null;
		}
	}
	
};
RegionManager.prototype.loadRegionsFromString_roads=function(strContent){
	var lstStrRegions=strContent.split("|");
	var strRegion=null,strRoadCurve=null,intRegionNumber=null;
	strRegion="Region";
	strRoadCurve="RoadCurve ";
	var intRegion=-1,intRoadCurve=-1;
	for(var ii=0;ii<lstStrRegions.length;ii++){
		intRegion=lstStrRegions[ii].indexOf(strRegion);
		if(-1!=intRegion){
			intRegionNumber=parseInt(lstStrRegions[ii].substring(intRegion+strRegion.length));
		}
		intRoadCurve=lstStrRegions[ii].indexOf(strRoadCurve);
		if(-1!=intRoadCurve&&null!=intRegionNumber&&false==window.mhd.nonNumber(intRegionNumber)){
			this.lstRoadsObjects[intRegionNumber].loadFromString(lstStrRegions[ii]);
			this.lstRoadsObjects[intRegionNumber].updateGeometry(1,this.lstLandscapeObjects[intRegionNumber].mesh);
			intRegionNumber=null;
		}
	}
};
RegionManager.prototype.loadRegionsFromString_trees=function(strContent){
	var lstStrRegions=strContent.split("|");
	var strRegion=null,strTrees=null,intRegionNumber=null;
	strRegion="Region";
	strTrees="TreesObject";
	var intRegion=-1,intTrees=-1;
	for(var ii=0;ii<lstStrRegions.length;ii++){
		intRegion=lstStrRegions[ii].indexOf(strRegion);
		if(-1!=intRegion){
			intRegionNumber=parseInt(lstStrRegions[ii].substring(intRegion+strRegion.length));
		}
		intTrees=lstStrRegions[ii].indexOf(strTrees);
		if(-1!=intTrees&&null!=intRegionNumber&&false==window.mhd.nonNumber(intRegionNumber)){
			this.lstTreesObjects[intRegionNumber].loadFromString(lstStrRegions[ii+1]);
			intRegionNumber=null;
		}
	}
};
RegionManager.prototype.loadRegionsFromString_landscapes=function(strContent){
	var lstStrRegions=strContent.split("|");
	var strRegion=null,strLandscape=null,intRegionNumber=null;
	strRegion="Region";
	strLandscape="LandscapeObject";
	var intRegion=-1,intLandscape=-1;
	for(var ii=0;ii<lstStrRegions.length;ii++){
		intRegion=lstStrRegions[ii].indexOf(strRegion);
		if(-1!=intRegion){
			intRegionNumber=parseInt(lstStrRegions[ii].substring(intRegion+strRegion.length));
		}
		intLandscape=lstStrRegions[ii].indexOf(strLandscape);
		if(-1!=intLandscape&&null!=intRegionNumber&&false==window.mhd.nonNumber(intRegionNumber)){
			this.lstLandscapeObjects[intRegionNumber].loadFromString(lstStrRegions[ii+1]);
			intRegionNumber=null;
		}
	}
};
RegionManager.prototype.loadRegionsFromString=function(strContent){
	this.loadRegionsFromString_landscapes(strContent);
	this.loadRegionsFromString_roads(strContent);
	this.loadRegionsFromString_trees(strContent);
	//this.loadRegionsFromString_modelObjects(strContent);
};
export{RegionManager};
