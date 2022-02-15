import * as THREE from "../three.js-master/build/three.module.js";
var ExtensionManagerConstructor_strF=function(that){
};
var ExtensionManagerConstructor=function(that){
	that.lstExtensions=[];
	var strButtonExtensionHTML="<button id="+String.fromCharCode(34)+"btnExtensionManager"+String.fromCharCode(34)+" onclick="+String.fromCharCode(34)+"window.mhd.netspace.extensionManager.btnExtensionManagerClicked()"+String.fromCharCode(34)+">Extension manager...</button>";
	var strExtensionInnerHTML="<button id="+String.fromCharCode(34)+"btnLoadComputer"+String.fromCharCode(34)+" onclick="+String.fromCharCode(34)+"window.mhd.loadComputer()"+String.fromCharCode(34)+">Load computer</button>";
	//strExtensionInnerHTML+="<button id="+String.fromCharCode(34)+"btnLoadMusicTools"+String.fromCharCode(34)+" onclick="+String.fromCharCode(34)+"loadMusicTools()"+String.fromCharCode(34)+">Load music tools</button>";
	strExtensionInnerHTML+="<button id="+String.fromCharCode(34)+"btnLoadShaderThinkpad"+String.fromCharCode(34)+" onclick="+String.fromCharCode(34)+"window.mhd.netspace.computer.loadShaderThinkpad()"+String.fromCharCode(34)+">Load shader thinkpad</button>";
	var divLoadSaveDownloadLinksOptions=document.getElementById("divLoadSaveDownloadLinksOptions");
	var divExtensionManager=document.createElement("div");
	divExtensionManager.id="divExtensionManager";
	divExtensionManager.style.display="none";
	divExtensionManager.innerHTML=strExtensionInnerHTML;
	divLoadSaveDownloadLinksOptions.innerHTML=strButtonExtensionHTML+divExtensionManager.outerHTML+divLoadSaveDownloadLinksOptions.innerHTML;
};
var ExtensionManager=function(){
	ExtensionManagerConstructor(this);
	ExtensionManagerConstructor_strF(this);
};
ExtensionManager.prototype.btnExtensionManagerClicked=function(){
	if(null==window.mhd.netspace)return;
	var divExtensionManager=document.getElementById("divExtensionManager");
	if("none"==divExtensionManager.style.display)
		divExtensionManager.style.display="";
	else divExtensionManager.style.display="none";
};
ExtensionManager.prototype.btnExtensionClicked=function(strId){
	var divExtension=document.getElementById("divExtension"+strId);
	if("none"==divExtension.style.display)
		divExtension.style.display="";
	else divExtension.style.display="none";
};
ExtensionManager.prototype.addExtension=function(strId,strButton,funInit){
	var divExtensionManager=document.getElementById("divExtensionManager");
	this.lstExtensions.push(strId);
	var divExtension=document.createElement("div");
	divExtension.id="divExtension"+strId;
	divExtension.style.display="none";
	var btnExtension=document.createElement("button");
	btnExtension.id="btnExtension"+strId;
	btnExtension.innerText=strButton+"...";
	btnExtension.onclick=function(){window.mhd.netspace.extensionManager.btnExtensionClicked(strId);};
	divExtensionManager.appendChild(btnExtension);
	divExtensionManager.appendChild(divExtension);
	if(undefined!=funInit&&null!=funInit)
		funInit();
};
ExtensionManager.prototype.appendChild=function(strId,theChild){
	var divExtension=document.getElementById("divExtension"+strId);
	divExtension.appendChild(theChild);
};
ExtensionManager.prototype.removeChild=function(strId,theChild){
	var divExtension=document.getElementById("divExtension"+strId);
	divExtension.removeChild(theChild);
};

var The_NetspacesConstructor=function(that,gl,objStrFargs){
	/*mhdmodiff: One The Netspace Room (The Netspace "Lite"), many Computers in window.mhd.netspace.lstComputers[ii]*/
	that.gl=gl;
	that.blnLoad3dWorldsOnStart=false;
	that.blnTextEditorOnStart=true;
	that.blnComputerTextDivMode=true;
	that.lstTextScreenSize=[66,36];
	that.strTextEditorCommandLineModeArgs="-maxi"
	;/*var blnComputerTextDivMode=false;*//*var blnComputerTextDivMode=true;*//*var lstTextScreenSize=[33,18];*//*var lstTextScreenSize=[66,36];*//*var lstTextScreenSize=[132,72];*//*var strTextEditorCommandLineModeArgs="";*//*var strTextEditorCommandLineModeArgs="-mini";*//*var strTextEditorCommandLineModeArgs="";*/
	that.intUnitSquareSize=10;
	that.lstColors=[[255,255,255,255],
		[0,0,0,255],
		[255,100,0,255],
		[255,255,0,255],
		[0,255,0,255],
		[255,0,0,255],
		[255,50,150,255],
		[128,0,128,255],
		[100,50,0,255],
		[0,0,255,255]
	];
	/*var epsilon=10*(-10);*/
	that.epsilon=Math.pow(10,-10);
	/*mov ax,bx*/
	that.vec2={};that.vec2.create=function(a){var b=new Float32Array(2);if(a){b[0]=a[0];b[1]=a[1]}return b};
	that.vec2.set=function(b,a){b[0]=a[0];b[1]=a[1];return b};
	that.vec2.add=function(c,a,b){c[0]=a[0]+b[0];c[1]=a[1]+b[1];return c};
	that.vec2.subtract=function(c,a,b){c[0]=a[0]-b[0];c[1]=a[1]-b[1];return c};
	that.vec2.scale=function(c,a,b){c[0]=a[0]*b;c[1]=a[1]*b;return c};
	that.vec2.multiply=function(c,a,b){c[0]=a[0]*b[0];c[1]=a[1]*b[1];return c;};
	that.vec2.dot=function(a,b){return a[0]*b[0]+a[1]*b[1]};
	that.vec2.normalize=function(b,a){var c=a[0],d=a[1],e=Math.sqrt(c*c+d*d);if(e){if(e==1){b[0]=c;b[1]=d;return b}}else{b[0]=0;b[1]=0;return b}e=1/e;b[0]=c*e;b[1]=d*e;return b};
	that.vec2.length=function(a){var b=a[0],c=a[1];return Math.sqrt(b*b+c*c)};
	that.vec2.linearCombination=function(y,a,x,b){y[0]=a*x[0]+b[0];y[1]=a*x[1]+b[1];return y;};
	that.vec3={};that.vec3.create=function(a){var b=new Float32Array(3);if(a){b[0]=a[0];b[1]=a[1];b[2]=a[2]}return b};
	that.vec3.set=function(b,a){b[0]=a[0];b[1]=a[1];b[2]=a[2];return b};
	that.vec3.add=function(c,a,b){c[0]=a[0]+b[0];c[1]=a[1]+b[1];c[2]=a[2]+b[2];return c};
	that.vec3.subtract=function(c,a,b){c[0]=a[0]-b[0];c[1]=a[1]-b[1];c[2]=a[2]-b[2];return c};
	that.vec3.scale=function(c,a,b){c[0]=a[0]*b;c[1]=a[1]*b;c[2]=a[2]*b;return c};
	that.vec3.multiply=function(c,a,b){c[0]=a[0]*b[0];c[1]=a[1]*b[1];c[2]=a[2]*b[2];return c;};
	that.vec3.linearCombination=function(y,a,x,b){y[0]=a*x[0]+b[0];y[1]=a*x[1]+b[1];y[2]=a*x[2]+b[2];return y;};
	that.vec3.normalize=function(b,a){var c=a[0],d=a[1],e=a[2],f=Math.sqrt(c*c+d*d+e*e);if(f){if(f==1){b[0]=c;b[1]=d;b[2]=e;return b}}else{b[0]=0;b[1]=0;b[2]=0;return b}f=1/f;b[0]=c*f;b[1]=d*f;b[2]=e*f;return b};
	that.vec3.cross=function(c,a,b){var d=a[0],e=a[1],f=a[2],g=b[0],h=b[1],i=b[2];c[0]=e*i-f*h;c[1]=f*g-d*i;c[2]=d*h-e*g;return c};
	that.vec3.length=function(a){var b=a[0],c=a[1];d=a[2];return Math.sqrt(b*b+c*c+d*d)};
	that.vec3.dot=function(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]};
	that.vec3.dot=function(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]};
	that.vec3.transformMat4=function(c,a,b){var d=b[0],e=b[1],f=b[2];var g=a[3]*d+a[7]*e+a[11]*f+a[15];g=g||1.0;c[0]=(a[0]*d+a[4]*e+a[8]*f+a[12])/g;c[1]=(a[1]*d+a[5]*e+a[9]*f+a[13])/g;c[2]=(a[2]*d+a[6]*e+a[10]*f+a[14])/g;return c;};
	that.vec4={};that.vec4.create=function(a){var b=new Float32Array(4);if(a){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3]}return b};
	that.vec4.length=function(a){var b=a[0],c=a[1],d=a[2],e=a[3];return Math.sqrt(b*b+c*c+d*d+e*e)};
	that.vec4.normalize=function(b,a){var c=a[0],d=a[1],e=a[2],f=a[3],g=Math.sqrt(c*c+d*d+e*e+f*f);if(g==0){b[0]=0;b[1]=0;b[2]=0;b[3]=0;return b}g=1/g;b[0]=c*g;b[1]=d*g;b[2]=e*g;b[3]=f*g;return b};
	that.vec4.set=function(b,a){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];return b};
	that.vec4.add=function(c,a,b){c[0]=a[0]+b[0];c[1]=a[1]+b[1];c[2]=a[2]+b[2];c[3]=a[3]+b[3];return c};
	that.vec4.subtract=function(c,a,b){c[0]=a[0]-b[0];c[1]=a[1]-b[1];c[2]=a[2]-b[2];c[3]=a[3]-b[3];return c};
	that.vec4.scale=function(c,a,b){c[0]=a[0]*b;c[1]=a[1]*b;c[2]=a[2]*b;c[3]=a[3]*b;return c};
	that.vec4.multiply=function(c,a,b){c[0]=a[0]*b[0];c[1]=a[1]*b[1];c[2]=a[2]*b[2];c[3]=a[3]*b[3];return c;};
	that.vec4.linearCombination=function(y,a,x,b){y[0]=a*x[0]+b[0];y[1]=a*x[1]+b[1];y[2]=a*x[2]+b[2];y[3]=a*x[3]+b[3];return y;};
	that.mat3={};
	that.mat3.create=function(a){var b=new Float32Array(9);if(a){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];b[9]=a[9]}return b};
	that.mat3.identity=function(a){if(a){a[0]=1;a[1]=0;a[2]=0;a[3]=0;a[4]=1;a[5]=0;a[6]=0;a[7]=0;a[8]=1;return a}var b=new Float32Array(9);b[0]=1;b[1]=0;b[2]=0;b[3]=0;b[4]=1;b[5]=0;b[6]=0;b[7]=0;b[8]=1;return b};
	that.mat3.transpose=function(b,a){var c=new Float32Array(9);c[0]=a[0];c[1]=a[3];c[2]=a[6];c[3]=a[1];c[4]=a[4];c[5]=a[7];c[6]=a[2];c[7]=a[5];c[8]=a[8];b[0]=c[0];b[1]=c[1];b[2]=c[2];b[3]=c[3];b[4]=c[4];b[5]=c[5];b[6]=c[6];b[7]=c[7];b[8]=c[8];return b};
	that.mat3.set=function(b,a){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];return b};
	that.mat3.add=function(c,a,b){c[0]=a[0]+b[0];c[1]=a[1]+b[1];c[2]=a[2]+b[2];c[3]=a[3]+b[3];c[4]=a[4]+b[4];c[5]=a[5]+b[5];c[6]=a[6]+b[6];c[7]=a[7]+b[7];c[8]=a[8]+b[8];return c};
	that.mat3.subtract=function(c,a,b){c[0]=a[0]-b[0];c[1]=a[1]-b[1];c[2]=a[2]-b[2];c[3]=a[3]-b[3];c[4]=a[4]-b[4];c[5]=a[5]-b[5];c[6]=a[6]-b[6];c[7]=a[7]-b[7];c[8]=a[8]-b[8];return c};
	that.mat3.multiply=function(c,a,b){var d=a[0],e=a[1],f=a[2],g=a[3],h=a[4],i=a[5],j=a[6],k=a[7],l=a[8],m=b[0],n=b[1],o=b[2],p=b[3],q=b[4],r=b[5],s=b[6],t=b[7],u=b[8];c[0]=d*m+e*p+f*s;c[1]=d*n+e*q+f*t;c[2]=d*o+e*r+f*u;c[3]=g*m+h*p+i*s;c[4]=g*n+h*q+i*t;c[5]=g*o+h*r+i*u;c[6]=j*m+k*p+l*s;c[7]=j*n+k*q+l*t;c[8]=j*o+k*r+l*u;};that.mat3.multiplyVec3=function(c,a,b){var d=a[0],e=a[1],f=a[2],g=a[3],h=a[4],i=a[5],j=a[6],k=a[7],l=a[8],m=b[0],n=b[1],o=b[2];c[0]=d*m+e*n+f*o;c[1]=g*m+h*n+o*i;c[2]=j*m+k*n+l*o;return c;};
	that.mat4={};that.mat4.create=function(a){var b=new Float32Array(16);if(a){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];b[9]=a[9];b[10]=a[10];b[11]=a[11];b[12]=a[12];b[13]=a[13];b[14]=a[14];b[15]=a[15]}return b};
	that.mat4.identity=function(a){if(a){a[0]=1;a[1]=0;a[2]=0;a[3]=0;a[4]=0;a[5]=1;a[6]=0;a[7]=0;a[8]=0;a[9]=0;a[10]=1;a[11]=0;a[12]=0;a[13]=0;a[14]=0;a[15]=1;return a}var b=new Float32Array(16);b[0]=1;b[1]=0;b[2]=0;b[3]=0;b[4]=0;b[5]=1;b[6]=0;b[7]=0;b[8]=0;b[9]=0;b[10]=1;b[11]=0;b[12]=0;b[13]=0;b[14]=0;b[15]=1;return b;};
	that.mat4.transpose=function(b,a){var c=new Float32Array(16); c[0]=a[0];c[1]=a[4];c[2]=a[8];c[3]=a[12];c[4]=a[1];c[5]=a[5];c[6]=a[9];c[7]=a[13];c[8]=a[2];c[9]=a[6];c[10]=a[10];c[11]=a[14];c[12]=a[3];c[13]=a[7];c[14]=a[11];c[15]=a[15];b[0]=c[0];b[1]=c[1];b[2]=c[2];b[3]=c[3];b[4]=c[4];b[5]=c[5];b[6]=c[6];b[7]=c[7];b[8]=c[8];b[9]=c[9];b[10]=c[10];b[11]=c[11];b[12]=c[12];b[13]=c[13];b[14]=c[14];b[15]=c[15];return b};
	that.mat4.multiply=function(c,a,b){var d=a[0],e=a[1],f=a[2],g=a[3],h=a[4],i=a[5],j=a[6],k=a[7],l=a[8],m=a[9],n=a[10],o=a[11],p=a[12],q=a[13],r=a[14],s=a[15],t=b[0],u=b[1],v=b[2],w=b[3],x=b[4],y=b[5],z=b[6],A=b[7],B=b[8],C=b[9],D=b[10],E=b[11],F=b[12],G=b[13],H=b[14],I=b[15];c[0]=t*d+u*h+v*l+w*p;c[1]=t*e+u*i+v*m+w*q;c[2]=t*f+u*j+v*n+w*r;c[3]=t*g+u*k+v*o+w*s;c[4]=x*d+y*h+z*l+A*p;c[5]=x*e+y*i+z*m+A*q;c[6]=x*f+y*j+z*n+A*r;c[7]=x*g+y*k+z*o+A*s;c[8]=B*d+C*h+D*l+E*p;c[9]=B*e+C*i+D*m+E*q;c[10]=B*f+C*j+D*n+E*r;c[11]=B*g+C*k+D*o+E*s;c[12]=F*d+G*h+H*l+I*p;c[13]=F*e+G*i+H*m+I*q;c[14]=F*f+G*j+H*n+I*r;c[15]=F*g+G*k+H*o+I*s;return c;};
	that.mat4.multiplyVec4=function(c,a,b){var d=b[0],e=b[1],f=b[2],g=b[3];c[0]=a[0]*d+a[4]*e+a[8]*f+a[12]*g;c[1]=a[1]*d+a[5]*e+a[9]*f+a[13]*g;c[2]=a[2]*d+a[6]*e+a[10]*f+a[14]*g;c[3]=a[3]*d+a[7]*e+a[11]*f+a[15]*g;return c};
	that.mat4.translate=function(c,a,b){var d=a[0],e=a[1],f=a[2],g=a[3],h=a[4],i=a[5],j=a[6],k=a[7],l=a[8],m=a[9],n=a[10],o=a[11],p=b[0],q=b[1],r=b[2];c[0]=d;c[1]=e;c[2]=f;c[3]=g;c[4]=h;c[5]=i;c[6]=j;c[7]=k;c[8]=l;c[9]=m;c[10]=n;c[11]=o;c[12]=d*p+h*q+l*r+a[12];c[13]=e*p+i*q+m*r+a[13];c[14]=f*p+j*q+n*r+a[14];c[15]=g*p+k*q+o*r+a[15];return c;};
	that.mat4.set=function(b,a){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];b[9]=a[9];b[10]=a[10];b[11]=a[11];b[12]=a[12];b[13]=a[13];b[14]=a[14];b[15]=a[15];return b};
	that.mat4.add=function(c,a,b){c[0]=a[0]+b[0];c[1]=a[1]+b[1];c[2]=a[2]+b[2];c[3]=a[3]+b[3];c[4]=a[4]+b[4];c[5]=a[5]+b[5];c[6]=a[6]+b[6];c[7]=a[7]+b[7];c[8]=a[8]+b[8];c[9]=a[9]+b[9];c[10]=a[10]+b[10];c[11]=a[11]+b[11];c[12]=a[12]+b[12];c[13]=a[13]+b[13];c[14]=a[14]+b[14];c[15]=a[15]+b[15];return c};
	that.mat4.subtract=function(c,a,b){c[0]=a[0]-b[0];c[1]=a[1]-b[1];c[2]=a[2]-b[2];c[3]=a[3]-b[3];c[4]=a[4]-b[4];c[5]=a[5]-b[5];c[6]=a[6]-b[6];c[7]=a[7]-b[7];c[8]=a[8]-b[8];c[9]=a[9]-b[9];c[10]=a[10]-b[10];c[11]=a[11]-b[11];c[12]=a[12]-b[12];c[13]=a[13]-b[13];c[14]=a[14]-b[14];c[15]=a[15]-b[15];return c};
	that.mat4.scale=function(c,a,b){var d=b[0],e=b[1],f=b[2];c[0]=a[0]*d;c[1]=a[1]*d;c[2]=a[2]*d;c[3]=a[3]*d;c[4]=a[4]*e;c[5]=a[5]*e;c[6]=a[6]*e;c[7]=a[7]*e;c[8]=a[8]*f;c[9]=a[9]*f;c[10]=a[10]*f;c[11]=a[11]*f;c[12]=a[12];c[13]=a[13];c[14]=a[14];c[15]=a[15];return c};
	that.mat4.rotateX=function(c,a,b){var d=Math.sin(b),e=Math.cos(b),f=a[0],g=a[1],h=a[2],i=a[3],j=a[4],k=a[5],l=a[6],m=a[7],n=a[8],o=a[9],p=a[10],q=a[11],r=a[12],s=a[13],t=a[14],u=a[15];c[0]=f;c[1]=g;c[2]=h;c[3]=i;c[4]=e*j+d*n;c[5]=e*k+d*o;c[6]=e*l+d*p;c[7]=e*m+d*q;c[8]=-d*j+e*n;c[9]=-d*k+e*o;c[10]=-d*l+e*p;c[11]=-d*m+e*q;c[12]=r;c[13]=s;c[14]=t;c[15]=u;return c;};
	that.mat4.rotateY=function(c,a,b){var d=Math.sin(b),e=Math.cos(b),f=a[0],g=a[1],h=a[2],i=a[3],j=a[4],k=a[5],l=a[6],m=a[7],n=a[8],o=a[9],p=a[10],q=a[11],r=a[12],s=a[13],t=a[14],u=a[15];c[0]=e*f-d*n;c[1]=e*g-d*o;c[2]=e*h-d*p;c[3]=e*i-d*q;c[4]=j;c[5]=k;c[6]=l;c[7]=m;c[8]=d*f+e*n;c[9]=d*g+e*o;c[10]=d*h+e*p;c[11]=d*i+e*q;c[12]=r;c[13]=s;c[14]=t;c[15]=u;return c;};
	that.mat4.rotateZ=function(c,a,b){var d=Math.sin(b),e=Math.cos(b),f=a[0],g=a[1],h=a[2],i=a[3],j=a[4],k=a[5],l=a[6],m=a[7],n=a[8],o=a[9],p=a[10],q=a[11],r=a[12],s=a[13],t=a[14],u=a[15];c[0]=e*f+d*j;c[1]=e*g+d*k;c[2]=e*h+d*l;c[3]=e*i+d*m;c[4]=-d*f+e*j;c[5]=-d*g+e*k;c[6]=-d*h+e*l;c[7]=-d*i+e*m;c[8]=n;c[9]=o;c[10]=p;c[11]=q;c[12]=r;c[13]=s;c[14]=t;c[15]=u;return c;};
	that.mat4.perspective=function(e,a,b,c,d){var f=1/Math.tan(a/2),g=1/(c-d);e[0]=f/b;e[1]=0;e[2]=0;e[3]=0;e[4]=0;e[5]=f;e[6]=0;e[7]=0;e[8]=0;e[9]=0;e[10]=(d+c)*g;e[11]=-1;e[12]=0;e[13]=0;e[14]=2*d*c*g;e[15]=0;return e;};
	that.mat4.lookAt=function(d,a,b,c){var e=a[0],f=a[1],g=a[2],h=b[0],i=b[1],j=b[2],k=c[0],l=c[1],m=c[2];if(Math.abs(e-h)<epsilon&&Math.abs(f-i)<epsilon&&Math.abs(g-j)<epsilon){d[0]=1;d[1]=0;d[2]=0;d[3]=0;d[4]=0;d[5]=1;d[6]=0;d[7]=0;d[8]=0;d[9]=0;d[10]=1;d[11]=0;d[12]=0;d[13]=0;d[14]=0;d[15]=1;return d;}n=e-h;o=f-i;p=g-j;q=Math.sqrt(n*n+o*o+p*p);n/=q;o/=q;p/=q;r=l*p-m*o;s=m*n-k*p;t=k*o-l*n;q=Math.sqrt(r*r+s*s+t*t);if(!q){r=0;s=0;t=0;}else{r/=q;s/=q;t/=q;}u=o*t-p*s;v=p*r-n*t;w=n*s-o*r;q=Math.sqrt(u*u+v*v+w*w);if(!q){u=0;v=0;w=0;}else{u/=q;v/=q;w/=q;}d[0]=r;d[1]=u;d[2]=n;d[3]=0;d[4]=s;d[5]=v;d[6]=o;d[7]=0;d[8]=t;d[9]=w;d[10]=p;d[11]=0;d[12]=-(r*e+s*f+t*g);d[13]=-(u*e+v*f+w*g);d[14]=-(n*e+o*f+p*g);d[15]=1;return d;};
	that.mat4.getTranslation=function(b,a){b[0]=a[12];b[1]=a[13];b[2]=a[14];return b;};
	that.degree=Math.PI/180;
	that.txtFunFunFun=document.createElement("textarea");	
	that.txtFunFunFun.disabled=false;
	that.txtFunFunFun.enabled=false;
	that.txtFunFunFun.id="txtFunFunFun";
	that.txtFunFunFun.value="f(x)=";
	var divTheNetspacesLite=document.getElementById("divTheNetspacesLite");	
	divTheNetspacesLite.appendChild(that.txtFunFunFun);
	that.chkShaderThinkpad=document.createElement("input");
	that.chkShaderThinkpad.type="checkbox";
	that.chkShaderThinkpad.id="chkShaderThinkpad";
	divTheNetspacesLite.appendChild(that.chkShaderThinkpad);
	divTheNetspacesLite.appendChild(document.createTextNode("Shader thinkpad"));
	that.divLoadSaveDownloadLinksOptions=document.createElement("div");
	that.divLoadSaveDownloadLinksOptions.id="divLoadSaveDownloadLinksOptions";
	//that.divLoadSaveDownloadLinksOptions.style.display="none";
	divTheNetspacesLite.appendChild(that.divLoadSaveDownloadLinksOptions);
	that.chk3dMouseMode=document.createElement("input");
	that.chk3dMouseMode.type="checkbox";
	that.chk3dMouseMode.id="chk3dMouseMode";
	that.chk3dMouseMode.checked=true;
	divTheNetspacesLite.appendChild(that.chk3dMouseMode);
	divTheNetspacesLite.appendChild(document.createTextNode("3d mouse"));
	that.chkKeyboardOff=document.createElement("input");
	that.chkKeyboardOff.type="checkbox";
	that.chkKeyboardOff.id="chkKeyboardOff";
	window.mhd.chkKeyboardOff=that.chkKeyboardOff;
	divTheNetspacesLite.appendChild(that.chkKeyboardOff);
	divTheNetspacesLite.appendChild(document.createTextNode("Keyboard Off"));
	that.divTouchscreenKeys=document.createElement("div");
	that.divTouchscreenKeys.id="divTouchscreenKeys";
	divTheNetspacesLite.appendChild(that.divTouchscreenKeys);
	that.chkTouchscreenKeys=document.createElement("input");
	that.chkTouchscreenKeys.type="checkbox";
	that.chkTouchscreenKeys.id="chkTouchscreenKeys";
	divTheNetspacesLite.appendChild(that.chkTouchscreenKeys);
	divTheNetspacesLite.appendChild(document.createTextNode("Touchscreen Keys"));
	that.chkPreventDefaultKeyactions=document.createElement("input");
	that.chkPreventDefaultKeyactions.type="checkbox";
	that.chkPreventDefaultKeyactions.id="chkPreventDefaultKeyactions";
	divTheNetspacesLite.appendChild(that.chkPreventDefaultKeyactions);
	divTheNetspacesLite.appendChild(document.createTextNode("preventDefault() keyactions"));

	that.extensionManager=new ExtensionManager();
};
var The_NetspacesConstructor_strF=function(that,gl,objStrFargs){
	that.objStrFargs=objStrFargs;
};
var The_Netspaces=function(gl,objStrFargs){
	The_NetspacesConstructor(this,gl,objStrFargs);
	The_NetspacesConstructor_strF(this,gl,objStrFargs);
};

The_Netspaces.prototype.approximateEqual=function(int0,int1){
	var precision=5;
	if(Math.abs(int1-int0)<precision)return true;
		return false;
};
The_Netspaces.prototype.estimateColorNumber=function(theColor){
	var precision=0.0001;
	var intR,intG,intB,intAlpha;
	var lstReturn=theColor;
	intR=lstReturn[0];intG=lstReturn[1];intB=lstReturn[2];intAlpha=lstReturn[3];
	if(approximateEqual(intR,intG)&&approximateEqual(intG,intB)&&(intR>0)&&(intG>0)&&(intB>0))return 0;
	if(approximateEqual(0,intR)&&approximateEqual(0,intG)&&approximateEqual(0,intB))return 1;
	if((Math.abs(intG/intR-lstColors[2][1]/255.)<precision)&&(approximateEqual(0,intB)))return 2;
	if(approximateEqual(intR,intG)&&approximateEqual(0,intB))return 3;
	if(approximateEqual(0,intR)&&(0<intG)&&approximateEqual(0,intB))return 4;
	if((0<intR)&&approximateEqual(0,intG)&&approximateEqual(0,intB))return 5;
	if((Math.abs(intG/intR-lstColors[6][1]/255.)<precision)&&(Math.abs(intG/intB-lstColors[6][1]/(1.*lstColors[6][2]))<precision))return 6;
	if(approximateEqual(intR,intB)&&approximateEqual(0,intG))return 7;
	if((Math.abs(intG/intR-lstColors[8][1]/(1.*lstColors[8][0]))<precision)&&(approximateEqual(0,intB)))return 8;
	if(approximateEqual(0,intR)&&approximateEqual(0,intG)&&(0<intB))return 9;
	for(var ii=60;ii<=100;ii++)
		if((Math.abs(intG/intR-ii/255.)<precision)&&(approximateEqual(0,intB)))return 2;
	for(var i=25;i<=75;i++)
		for(j=125;j<=175;j++)
			if((Math.abs(intG/intR-i/255.)<precision)&&(Math.abs(intG/intB-i/(1.*j))<precision))return 6;
	for(var i=50;i<=80;i++)
		for(j=75;j<=125;j++)
			if((Math.abs(intG/intR-i/(1.*j))<precision)&&(approximateEqual(0,intB)))return 8;
	return -1;
};
The_Netspaces.prototype.flush=function(strInput,intMax){
	return(strInput.length<intMax)?flush("0"+strInput,intMax):strInput;
};
The_Netspaces.prototype.rand=function(min,max){return min+(Math.abs(max-min)*Math.random());};
The_Netspaces.prototype.floorRand=function(min,max){return min+Math.floor(Math.abs(max-min)*Math.random());};
The_Netspaces.prototype.toRadian=function(a){return a*degree;};
The_Netspaces.prototype.ij=function(i,j,theCols,theRows){
		return j*theCols+i;
};
The_Netspaces.prototype.ijk=function(i,j,k,Xcount,Ycount,Zcount){
	return Xcount*Ycount*k+Xcount*j+i;
};
The_Netspaces.prototype.nonNumber=function(a){
	if("number"!=typeof(a))return true;
	/*if(NaN==a)return true;*/
	if(true==Number.isNaN(a))return true;
	return false;
};
The_Netspaces.prototype.entryFlat=function(entry){
	if(NaN==entry)return entry;
	if("number"==typeof(entry))return entry;
	return flatten(entry);
};
The_Netspaces.prototype.flatten=function(mat){
	var flatMat=[];
	var entry=null;
	for(var ii=0;ii<mat.length;ii++){
		if((undefined==mat[ii])||(null==mat[ii])) entry=0;
		else entry=entryFlat(mat[ii]);
		if("number"==typeof(entry))
			flatMat.push(entry);
		else{
			for(var jj=0;jj<entry.length;jj++)
				flatMat.push(entry[jj]);
		}
	}
	return flatMat;
};
The_Netspaces.prototype.scaleList=function(lstArray,floatScale){
	for(var ii=0;ii<lstArray.length;ii++)lstArray[ii]*=floatScale;
	return lstArray;
};
The_Netspaces.prototype.emptyList=function(size){
	var list=[];
	for(var ii=0;ii<size;ii++)
		list.push(0);
	return list;
};
The_Netspaces.prototype.parseFloatList=function(strList){
	if("["!=strList[0]||"]"!=strList[strList.length-1])
		return null;
	var strInner=strList.substring(1,strList.length-1);
	var lstStrEntries=strInner.split(",");
	var lstFloats=[];
	var fltNumber;
	for(var ii=0;ii<lstStrEntries.length;ii++){
		fltNumber=parseFloat(lstStrEntries[ii]);
		if(true==nonNumber(fltNumber))return null;
		lstFloats.push(fltNumber);
	}
	return lstFloats;
};
The_Netspaces.prototype.parseIntList=function(strList){
	if("["!=strList[0]||"]"!=strList[strList.length-1])
		return null;
	var strInner=strList.substring(1,strList.length-1);
	var lstStrEntries=strInner.split(",");
	var lstInts=[];
	var intNumber;
	for(var ii=0;ii<lstStrEntries.length;ii++){
		intNumber=parseInt(lstStrEntries[ii]);
		if(true==nonNumber(intNumber))return null;
		lstInts.push(intNumber);
	}
	return lstInts;
};
The_Netspaces.prototype.parseList=function(strList){
	if("["!=strList[0]||"]"!=strList[strList.length-1])
		return null;
	var strInner=strList.substring(1,strList.length-1);
	var lstStrEntries=strInner.split(",");
	var lstList=[];
	var intNumber;
	for(var ii=0;ii<lstStrEntries.length;ii++){
		lstList.push(lstStrEntries[ii]);
	}
	return lstList;
};
The_Netspaces.prototype.copyList=function(lstBufferSrc){
	var lstBufferDst=[];	
	for(var ii=0;ii<lstBufferSrc.length;ii++){
		lstBufferDst.push(lstBufferSrc[ii]);
	}
	return lstBufferDst;
};
The_Netspaces.prototype.isList=function(lstBufferSrc){
	if("object"!=typeof(lstBufferSrc))return false;
	if(lstBufferSrc.constructor==[].constructor)return true;
	return false;
};
The_Netspaces.prototype.copyListRecursive=function(lstBufferSrc){
	var lstBufferDst=[];	
	for(var ii=0;ii<lstBufferSrc.length;ii++){
		if(true==isList(lstBufferSrc[ii]))
			lstBufferDst.push(copyListRecursive(lstBufferSrc[ii]));
		else
		lstBufferDst.push(lstBufferSrc[ii]);
	}
	return lstBufferDst;
};
The_Netspaces.prototype.copyString=function(strSrc){
	return strSrc.split("").join("");
};
The_Netspaces.prototype.copyStringList=function(lstBufferSrc){
	var lstBufferDst=[];	
	for(var ii=0;ii<lstBufferSrc.length;ii++){
		lstBufferDst.push(copyString(lstBufferSrc[ii]));
	}
	return lstBufferDst;
};
The_Netspaces.prototype.copyDictionary=function(dctSrc){
	var dctDst={};
	for(x in dctSrc){
		dctDst[x]=dctSrc[x];
	}
	return dctDst;
};
The_Netspaces.prototype.concatenateLists=function(list1,list2){
	var list3=[];	
	for(var ii=0;ii<list1.length;ii++)
		list3.push(list1[ii]);
	for(var ii=0;ii<list2.length;ii++)
		list3.push(list2[ii]);
	return list3;
};
The_Netspaces.prototype.emptyUint8Array=function(size){
	return new Uint8Array(size);
};
The_Netspaces.prototype.emptyUint32Array=function(size){
	return new Uint32Array(size);
};
The_Netspaces.prototype.emptyFloat32Array=function(size){
	return new Float32Array(size);
};
The_Netspaces.prototype.clickComponent=function(cmp){
	var mouseEvent=document.createEvent("MouseEvents");
	mouseEvent.initMouseEvent("click",true,false,window,0,0,0,0,0,false,false,false,false,0,null);
	cmp.dispatchEvent(mouseEvent);
};
The_Netspaces.prototype.openFile=function(func,objArgs){
	if(null!=objArgs){
	}
	//mhdmodiff--
	var readFile=function(e){
		var file=e.target.files[0];
		//mhdmodiff--
		//arrNames=file.name.split(".");	
		var arrNames=file.name.split(".");	
		//mhdmodiff--
		var blnNonUnicode;
		if(!file)
			return;
		var reader0=new FileReader();
		var reader=new FileReader();
		reader0.onload=function(e){
			window.mhd.netspace.nonUnicode(e.target.result,function(exists){
				if(exists){blnNonUnicode=true;}
					else{blnNonUnicode=false;reader.readAsText(file);}
				},objArgs);
			};
		reader0.readAsDataURL(file);
		reader.onload=function(e){
			var contents=e.target.result;
			if(null!=fileInput.func)
				fileInput.func(contents);
			document.body.removeChild(fileInput);
		};
		function previewText(){
			reader.readAsText(file);
				return;
		}
		function checkText(){
			if(blnNonUnicode==false){
				reader.readAsText(file);
				retrun;
			}
			if(blnNonUnicode==-1){
				setTimeout(checkText,1000);
			}
		}
	};
	//mhdmodiff
	var fileInput=document.createElement("input");
	fileInput.type="file";
	fileInput.style.display="none";
	fileInput.onchange=readFile;
	fileInput.func=func;
	document.body.appendChild(fileInput);
	window.mhd.netspace.clickComponent(fileInput);
};
The_Netspaces.prototype.previewFile=function(contents){
	document.getElementById("txtFunFunFun").value=contents;
};
The_Netspaces.prototype.nonUnicode=function(url,callback,objArgs){
	var img=new Image();
	img.onload=function(){callback(true)};
	img.onerror=function(){callback(false)};
	img.src=url;
	//mhdmodiff
	window.mhd.netspace.addImage(url,objArgs);
};
The_Netspaces.prototype.addImage=function(theSrc,objArgs){
	var previewImage=document.createElement("img");
	previewImage.onload=function(){
		var previewCanvas=document.createElement("canvas");
		previewCanvas.id="previewCanvas";
		previewCanvas.width=previewImage.width;
		previewCanvas.height=previewImage.height;
		var intImageWidth=previewImage.width;
		var intImageHeight=previewImage.height;
		var divLoadSection=document.getElementById("divLoadSection");
		previewContext=previewCanvas.getContext("2d");
		previewContext.drawImage(previewImage,0,0,previewImage.width,previewImage.height);
		var imageData=previewContext.getImageData(0,0,previewImage.width,previewImage.height);
		var secondCanvas=null;
		var textureImage=null;
		var lstReturn=window.mhd.netspace.createTexture(imageData,previewImage.width,previewImage.height);
		secondCanvas=lstReturn[0];
		textureImage=lstReturn[1];
		secondCanvas.theImageData=imageData;
		objArgs.func(imageData,intImageWidth,intImageHeight);
	};

	previewImage.id="testimg";
	previewImage.src=theSrc;
};
The_Netspaces.prototype.createTexture=function(imageData,textureWidth,textureHeight){
	var textureCanvas=document.createElement("canvas");
	textureCanvas.width=textureWidth;
	textureCanvas.height=textureHeight;
	var textureContext=textureCanvas.getContext("2d");
	var index=0;
	var textureImage=textureContext.createImageData(textureWidth,textureHeight);
	for (var j=0;j<textureHeight;j+=1){
		for(var i=0;i<textureWidth;i+=1){
			index=(j*textureWidth+i)*4;
			textureImage.data[index+0]=imageData.data[index+0];
			textureImage.data[index+1]=imageData.data[index+1];
			textureImage.data[index+2]=imageData.data[index+2];
			textureImage.data[index+3]=imageData.data[index+3];
		}
	}
	textureContext.putImageData(textureImage,0,0);
	return [textureCanvas,textureImage];
};
The_Netspaces.prototype.linkSaveFile=function(contents,strFilename,strLinkname){
	var a=document.getElementById(strLinkname);
	if(strFilename)a.setAttribute("download",strFilename);
	var blob=new Blob([contents],{type:"text/plain"});
	var strUrl=URL.createObjectURL(blob);
	a.setAttribute("href",strUrl);
};
The_Netspaces.prototype.linkSaveFile_subset=function(contents,strFilename,strLinkname,intStart,intEnd){
	var a=document.getElementById(strLinkname);
	if(strFilename)a.setAttribute("download",strFilename);
	var blob=new Blob([contents],{type:"text/plain"});
	var strUrl=URL.createObjectURL(blob.slice(intStart,intEnd,{type:"text/plain"}));
	a.setAttribute("href",strUrl);
};
The_Netspaces.prototype.pictureLinkSaveFile=function(contents,strFilename,strLinkname,intPictureWidth,intPictureHeight){
	var canvas=document.createElement("canvas");
	canvas.width=intPictureWidth;
	canvas.height=intPictureHeight;
	var canvasContext=canvas.getContext("2d");
	var index=0;
	var canvasImage=canvasContext.createImageData(intPictureWidth,intPictureHeight);
	for (var j=0;j<intPictureHeight;j++){
		for(var i=0;i<intPictureWidth;i++){
			index=(j*intPictureWidth+i)*4;
			canvasImage.data[index+0]=contents[index+0];
			canvasImage.data[index+1]=contents[index+1];
			canvasImage.data[index+2]=contents[index+2];
			canvasImage.data[index+3]=contents[index+3];
		}
	}
	canvasContext.putImageData(canvasImage,0,0);
	canvas.toBlob(function(blob){
		var strUrl=URL.createObjectURL(blob);
		var a=document.getElementById(strLinkname);
		if(strFilename)a.setAttribute("download",strFilename);
		a.setAttribute("href",strUrl);
		alert("saveTheNetspaceToPictureBbit(); done");
	});
};
The_Netspaces.prototype.floatToString=function(theFloat,intPrecision){
	var fltMultiplicator=1.*(Math.pow(10,intPrecision));
	return ""+Math.round(fltMultiplicator*theFloat)/fltMultiplicator;
};
The_Netspaces.prototype.arrayToString=function(theArray,intPrecision){
	if(null==theArray)return "null";if(undefined==theArray)return "undefined";
	var strArray="[";
	for(var ii=0;ii<theArray.length;ii++)
		if(ii+1<theArray.length)
			strArray+=floatToString(theArray[ii],intPrecision)+",";
		else strArray+=floatToString(theArray[ii],intPrecision);
	strArray+="]";
	return strArray;
};
export{ExtensionManager,The_Netspaces};
