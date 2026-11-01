/* ClubScene: ilustrasi 3D interaktif terinspirasi dari build Roblox Studio (tunnel neon + rig panggung).
   Bukan replika persis, hanya representasi gaya. three.js r149. */
(function(){
'use strict';
var R=Math.PI/180;

function build(){
  var scene=new THREE.Scene();
  scene.background=new THREE.Color(0x8fc3ec);
  scene.fog=new THREE.Fog(0xbfe0f6,5,15);
  var root=new THREE.Group();scene.add(root);
  var seed=11;function rnd(){seed=(seed*16807)%2147483647;return (seed-1)/2147483646}

  var hemi=new THREE.HemisphereLight(0xffffff,0x3a3a46,.9);scene.add(hemi);
  var dir=new THREE.DirectionalLight(0xffffff,.55);dir.position.set(2,6,3);scene.add(dir);

  var neonMat=new THREE.MeshBasicMaterial({color:0x33c7ff});
  var neonMat2=new THREE.MeshBasicMaterial({color:0xeaf8ff});
  var trussMat=new THREE.MeshStandardMaterial({color:0xe7d9b0,roughness:.6,metalness:.15});
  var trussDark=new THREE.MeshStandardMaterial({color:0x2a2a30,roughness:.7,metalness:.2});
  var dotMat=new THREE.MeshBasicMaterial({color:0xfff6d8});

  var N=7,RINGS=[];
  for(var i=0;i<N;i++){
    var t=i/(N-1);
    var y=t*7.2-0.6;
    var rad=1.75+t*1.9;
    var twist=t*38*R;
    RINGS.push({y:y,r:rad,a:twist});
    var torus=new THREE.Mesh(new THREE.TorusGeometry(rad,.045,8,72),neonMat);
    torus.rotation.x=Math.PI/2;torus.position.y=y;root.add(torus);
    var torus2=new THREE.Mesh(new THREE.TorusGeometry(rad-.14,.018,6,72),neonMat2);
    torus2.rotation.x=Math.PI/2;torus2.position.y=y;torus2.material.transparent=true;torus2.material.opacity=.75;root.add(torus2);
  }

  var M=16;
  function strut(ax,ay,az,bx,by,bz,mat,rr){
    var a=new THREE.Vector3(ax,ay,az),b=new THREE.Vector3(bx,by,bz);
    var mid=a.clone().add(b).multiplyScalar(.5),len=a.distanceTo(b);
    var geo=new THREE.CylinderGeometry(rr||.028,rr||.028,len,5);
    var me=new THREE.Mesh(geo,mat);
    me.position.copy(mid);
    me.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());
    root.add(me);return me;
  }
  for(var i=0;i<N-1;i++){
    var r0=RINGS[i],r1=RINGS[i+1];
    for(var j=0;j<M;j++){
      var th0=(j/M)*Math.PI*2+r0.a, th1=((j+.5)/M)*Math.PI*2+r1.a;
      var ax=Math.cos(th0)*r0.r,az=Math.sin(th0)*r0.r;
      var bx=Math.cos(th1)*r1.r,bz=Math.sin(th1)*r1.r;
      strut(ax,r0.y,az,bx,r1.y,bz,trussMat);
      var th0b=((j+1)/M)*Math.PI*2+r0.a;
      var cx=Math.cos(th0b)*r0.r,cz=Math.sin(th0b)*r0.r;
      strut(bx,r1.y,bz,cx,r0.y,cz,trussMat);
    }
  }

  for(var k=0;k<60;k++){
    var ri=RINGS[Math.floor(rnd()*N)],th=rnd()*Math.PI*2;
    var rr=ri.r+(rnd()-.5)*.12;
    var dot=new THREE.Mesh(new THREE.SphereGeometry(.028+rnd()*.03,6,6),dotMat);
    dot.position.set(Math.cos(th)*rr,ri.y+(rnd()-.5)*.3,Math.sin(th)*rr);
    root.add(dot);
  }

  function boom(x0,y0,z0,x1,y1,z1){
    strut(x0,y0,z0,x1,y1,z1,trussDark,.032);
    var segs=5;
    for(var s=0;s<segs;s++){
      var ta=s/segs,tb=(s+1)/segs;
      var ax=x0+(x1-x0)*ta,ay=y0+(y1-y0)*ta,az=z0+(z1-z0)*ta;
      var bx=x0+(x1-x0)*tb,by=y0+(y1-y0)*tb,bz=z0+(z1-z0)*tb;
      var ox=(s%2===0?.26:-.26);
      strut(ax,ay,az,bx+ox*.4,by+.12,bz,trussDark,.014);
    }
  }
  boom(-2.0,-0.6,-0.6, -0.5,2.6,-3.2);
  boom(1.8,-0.65,-0.5, 0.5,2.3,-3.0);

  var floorGeo=new THREE.CircleGeometry(2.2,32);
  var floor=new THREE.Mesh(floorGeo,new THREE.MeshStandardMaterial({color:0x14141a,roughness:.5}));
  floor.rotation.x=-Math.PI/2;floor.position.y=-0.62;root.add(floor);

  return scene;
}

function init(host,opts){
  opts=opts||{};
  return new Promise(function(resolve,reject){
    try{
      var renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
      var dpr=Math.min(window.devicePixelRatio||1,2);renderer.setPixelRatio(dpr);
      var cvs=renderer.domElement;cvs.className='o3-cv';host.appendChild(cvs);
      var scene=build(),cam=new THREE.PerspectiveCamera(68,1,.05,40);
      var st={yaw:18,pitch:64,fov:68},active=true,raf=0,idle=0,auto=true,vyaw=0,vpitch=0;
      var CPOS=new THREE.Vector3(0.15,-0.25,0.3);
      function size(){var w=host.clientWidth||300,h=host.clientHeight||300;renderer.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}
      function apply(){
        cam.fov=st.fov;cam.updateProjectionMatrix();
        var yw=st.yaw*R,pt=st.pitch*R;
        cam.position.copy(CPOS);
        var dir=new THREE.Vector3(Math.sin(yw)*Math.cos(pt),Math.sin(pt),Math.cos(yw)*Math.cos(pt));
        cam.up.set(0,1,0);
        cam.lookAt(cam.position.clone().add(dir));
      }
      function draw(){apply();renderer.render(scene,cam)}
      function loop(){
        raf=0;if(!active)return;
        var now=performance.now(),dt=Math.min(.05,(now-(loop.l||now))/1000);loop.l=now;
        if(Math.abs(vyaw)>.01||Math.abs(vpitch)>.01){st.yaw+=vyaw*dt*60;st.pitch=Math.max(28,Math.min(85,st.pitch+vpitch*dt*60));vyaw*=.92;vpitch*=.92}
        else if(auto&&!dragging&&now-idle>2200&&!opts.noAuto){st.yaw+=dt*4.2}
        draw();raf=requestAnimationFrame(loop);
      }
      function kick(){if(active&&!raf){loop.l=performance.now();raf=requestAnimationFrame(loop)}}
      var dragging=false,lx=0,ly=0,ptrs={};
      host.addEventListener('pointerdown',function(e){
        ptrs[e.pointerId]={x:e.clientX,y:e.clientY};dragging=true;lx=e.clientX;ly=e.clientY;vyaw=vpitch=0;idle=performance.now();
        try{host.setPointerCapture(e.pointerId)}catch(_){}
        host.classList.add('drag');kick();
      });
      host.addEventListener('pointermove',function(e){
        if(!ptrs[e.pointerId])return;ptrs[e.pointerId]={x:e.clientX,y:e.clientY};idle=performance.now();
        var dx=e.clientX-lx,dy=e.clientY-ly;lx=e.clientX;ly=e.clientY;
        var k=.22;
        st.yaw-=dx*k;vyaw=-dx*k*.4;
        if(e.pointerType!=='touch'){st.pitch=Math.max(28,Math.min(85,st.pitch+dy*k));vpitch=dy*k*.4}
        kick();
      });
      function up(e){delete ptrs[e.pointerId];if(!Object.keys(ptrs).length){dragging=false;host.classList.remove('drag');idle=performance.now()}kick()}
      host.addEventListener('pointerup',up);host.addEventListener('pointercancel',up);
      host.tabIndex=0;
      var ro=new ResizeObserver(function(){size();kick();if(!active)draw()});ro.observe(host);
      size();draw();kick();
      resolve({setActive:function(a){active=a;if(a){idle=performance.now();kick()}else if(raf){cancelAnimationFrame(raf);raf=0}}});
    }catch(err){reject(err)}
  });
}
window.ClubScene={init:init};
})();
