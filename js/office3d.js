/* Office3D: ruang kantor 3D yang bisa diputar 360 derajat (three.js r149). Satuan meter. */
(function(){
'use strict';
var L=11.6,W=4.5,H=2.9;
var VIEWS={
  masuk:{p:[0.9,1.55,2.25],yaw:0,pitch:-2,fov:74},
  kerja:{p:[5.2,1.5,2.95],yaw:180,pitch:-6,fov:74},
  lounge:{p:[5.9,1.5,3.7],yaw:-58,pitch:-5,fov:74},
  pantry:{p:[7.4,1.5,2.4],yaw:0,pitch:-3,fov:74},
  denah:{p:[L/2,12,W/2],yaw:0,pitch:-90,fov:50}
};
var R=Math.PI/180;

function cv(w,h){var c=document.createElement('canvas');c.width=w;c.height=h;return c}
function ctex(c){var t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t}

function build(oakImg){
  var scene=new THREE.Scene();
  scene.background=new THREE.Color(0x7cc8f0);
  var root=new THREE.Group();scene.add(root);
  var seed=7;function rnd(){seed=(seed*16807)%2147483647;return (seed-1)/2147483646}

  /* ---------- tekstur ---------- */
  var oakC=cv(174,450);oakC.getContext('2d').drawImage(oakImg,0,0,174,450);
  var oakT=ctex(oakC);
  var darkC=cv(174,450),dx=darkC.getContext('2d');dx.drawImage(oakImg,0,0,174,450);
  dx.globalCompositeOperation='multiply';dx.fillStyle='#8c7c70';dx.fillRect(0,0,174,450);
  dx.globalCompositeOperation='source-over';dx.fillStyle='rgba(40,34,30,.18)';dx.fillRect(0,0,174,450);
  var darkT=ctex(darkC);
  var sc=cv(64,64),sx=sc.getContext('2d');sx.fillStyle='#1c120b';sx.fillRect(0,0,64,64);
  for(var i=0;i<4;i++){sx.fillStyle='#3a2415';sx.fillRect(i*16+2,0,12,64);sx.fillStyle='#51331e';sx.fillRect(i*16+2,0,4,64)}
  var slatT=ctex(sc);
  var fc=cv(128,128),fx=fc.getContext('2d');fx.fillStyle='#bdbdc1';fx.fillRect(0,0,128,128);
  for(var n=0;n<900;n++){fx.fillStyle='rgba(120,120,130,'+(Math.random()*.06)+')';fx.fillRect(Math.random()*128,Math.random()*128,2,2)}
  fx.strokeStyle='#8c8c92';fx.lineWidth=3;fx.strokeRect(0,0,128,128);
  var floorT=ctex(fc);
  var rc=cv(256,128),rx=rc.getContext('2d');rx.fillStyle='#64646a';rx.fillRect(0,0,256,128);
  for(var k=0;k<260;k++){rx.fillStyle=Math.random()<.5?'rgba(30,30,36,.35)':'rgba(190,190,198,.3)';var y=Math.random()*128,x=Math.random()*256;rx.fillRect(x,y,20+Math.random()*90,1+Math.random()*2)}
  var rugT=ctex(rc);
  var tc=cv(640,360),tx=tc.getContext('2d');
  var g=tx.createLinearGradient(0,0,0,360);g.addColorStop(0,'#4f86c4');g.addColorStop(.45,'#e9b574');g.addColorStop(.62,'#f6c98a');g.addColorStop(1,'#9aa75a');tx.fillStyle=g;tx.fillRect(0,0,640,360);
  var rg=tx.createRadialGradient(150,170,4,150,170,170);rg.addColorStop(0,'rgba(255,245,200,.95)');rg.addColorStop(1,'rgba(255,210,130,0)');tx.fillStyle=rg;tx.fillRect(0,0,640,360);
  tx.fillStyle='rgba(255,255,255,.55)';[[90,50,70,12],[300,30,100,14],[470,70,80,10]].forEach(function(c){tx.beginPath();tx.ellipse(c[0],c[1],c[2],c[3],0,0,7);tx.fill()});
  tx.fillStyle='#8b8a6a';tx.beginPath();tx.moveTo(0,230);tx.lineTo(120,200);tx.lineTo(260,225);tx.lineTo(380,190);tx.lineTo(640,235);tx.lineTo(640,360);tx.lineTo(0,360);tx.fill();
  tx.fillStyle='#5d6b32';tx.beginPath();tx.moveTo(330,360);tx.lineTo(390,210);tx.lineTo(440,150);tx.lineTo(480,125);tx.lineTo(560,115);tx.lineTo(600,170);tx.lineTo(640,190);tx.lineTo(640,360);tx.fill();
  tx.fillStyle='#8a9a3c';tx.beginPath();tx.moveTo(0,360);tx.lineTo(0,290);tx.lineTo(160,260);tx.lineTo(330,300);tx.lineTo(500,270);tx.lineTo(640,300);tx.lineTo(640,360);tx.fill();
  tx.fillStyle='#b9d4de';tx.beginPath();tx.ellipse(250,285,50,9,0,0,7);tx.fill();
  tx.strokeStyle='rgba(235,235,225,.8)';tx.lineWidth=3;tx.beginPath();tx.moveTo(560,360);tx.quadraticCurveTo(470,300,520,250);tx.quadraticCurveTo(560,210,500,170);tx.stroke();
  var tvT=new THREE.CanvasTexture(tc);

  /* ---------- bahan ---------- */
  var M={};function lam(c,o){var p={color:c,side:THREE.DoubleSide};if(o)for(var k in o)p[k]=o[k];return new THREE.MeshLambertMaterial(p)}
  M.oak=lam(0xffffff,{map:oakT});M.dark=lam(0xffffff,{map:darkT});M.slat=lam(0xffffff,{map:slatT});
  M.floor=lam(0xffffff,{map:floorT});M.rug=lam(0xffffff,{map:rugT});
  M.white=lam(0xf4f4f5);M.top=lam(0xb9b9bd);M.black=lam(0x1d1d20);M.chair=lam(0x232326);M.base=lam(0xe8e8ea);
  M.cream=lam(0xddd5c8);M.cushion=lam(0xcfc7ba);M.steel=lam(0xb4b7ba);M.cab=lam(0x4b4c50);M.shelf=lam(0xcbb18b);M.glass=lam(0xa9c9cc,{transparent:true,opacity:.55});
  M.tv=lam(0xffffff,{map:tvT});M.tvf=lam(0x151517);M.edge=new THREE.LineBasicMaterial({color:0x111111});

  function put(mesh,x,y,z,edge){mesh.position.set(x,y,z);if(edge)mesh.userData.edge=1;return mesh}
  function box(w,h,d,m,x,y,z,edge,parent){var me=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);put(me,x,y,z,edge);(parent||root).add(me);return me}

  /* ---------- lantai ---------- */
  (function(){var gm=new THREE.PlaneGeometry(L,W);gm.rotateX(-Math.PI/2);var uv=gm.attributes.uv;for(var i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*L/.6,uv.getY(i)*W/.6);var f=new THREE.Mesh(gm,M.floor);f.position.set(L/2,0,W/2);root.add(f)})();

  /* ---------- dinding ---------- */
  function wallPos(wall,t){return wall==='n'?[t,0]:wall==='s'?[t,W]:wall==='w'?[0,t]:[L,t]}
  var wallRot={n:0,s:Math.PI,w:Math.PI/2,e:-Math.PI/2};
  function panel(wall,s,e,m,kind,off){
    var w=e-s,gm=new THREE.PlaneGeometry(w,H),uv=gm.attributes.uv;
    for(var i=0;i<uv.count;i++){
      var u=uv.getX(i),v=uv.getY(i);
      if(kind==='slat'){uv.setXY(i,u*w/.16,v*H/.4)}
      else{var vo=off===undefined?rnd()*.4:off;uv.setXY(i,u*Math.min(1,w/.6),vo+v*.58)}
    }
    var me=new THREE.Mesh(gm,m),p=wallPos(wall,(s+e)/2);me.position.set(p[0],H/2,p[1]);me.rotation.y=wallRot[wall];me.userData.edge=1;root.add(me);return me;
  }
  function run(wall,s,e,m,step){for(var a=s;a<e-.001;a+=step){panel(wall,a,Math.min(e,a+step),m,'wood')}}
  /* utara: kayu oak terang */
  run('n',0,L,M.oak,.6);
  /* selatan: kayu gelap abu-cokelat */
  run('s',0,L,M.dark,1.2);
  /* timur */
  run('e',0,3.0,M.oak,.6);panel('e',3.0,4.2,M.slat,'slat');run('e',4.2,W,M.oak,.6);
  /* barat: abu | slat+pintu | oak 3x60 | slat | abu */
  panel('w',0,.15,M.dark,'wood',0);panel('w',.15,1.35,M.slat,'slat');
  run('w',1.35,3.15,M.oak,.6);
  panel('w',3.15,4.35,M.slat,'slat');panel('w',4.35,W,M.dark,'wood',0);
  /* aksen slat di dinding utara (area lounge) */
  panel('n',5.3,6.5,M.slat,'slat').position.z=.005;
  /* pintu tersembunyi di panel slat barat */
  (function(){var dm=lam(0x1a0f08);box(.02,2.1,.03,dm,.012,1.05,3.38);box(.02,2.1,.03,dm,.012,1.05,4.1);box(.02,.03,.75,dm,.012,2.1,3.74)})();

  /* ---------- meja ---------- */
  function desk(cx,cz,w,d,rot,ped){
    var gp=new THREE.Group();gp.position.set(cx,0,cz);gp.rotation.y=rot||0;root.add(gp);
    box(w,.035,d,M.top,0,.74,0,true,gp);
    box(.03,.72,d-.05,M.white,-w/2+.04,.36,0,true,gp);
    box(.03,.72,d-.05,M.white,w/2-.04,.36,0,true,gp);
    box(w-.1,.3,.02,M.white,0,.58,-d/2+.06,true,gp);
    if(ped){var px=ped>0?w/2-.28:-w/2+.28;box(.4,.55,d-.1,M.white,px,.38,0,true,gp);
      for(var i=0;i<3;i++){box(.34,.005,.01,M.black,px,.58-i*.17,d/2-.045,false,gp)}}
    /* colokan */
    box(.07,.004,.03,M.black,w/2-.2,.76,d/2-.12,false,gp);
    return gp;
  }
  /* baris atas (3 meja) */
  desk(1.3,.36,1.6,.72,0,1);desk(2.7,.36,1.2,.72,0,1);desk(3.9,.36,1.2,.72,0,1);
  /* kolom kiri (2 meja) menghadap ke barat */
  desk(.36,1.35,1.2,.72,Math.PI/2,-1);desk(.36,2.55,1.2,.72,Math.PI/2,1);
  /* pulau 2x2 */
  desk(2.7,2.07,1.2,.6,0,0);desk(3.9,2.07,1.2,.6,0,0);desk(2.7,2.67,1.2,.6,0,0);desk(3.9,2.67,1.2,.6,0,0);

  /* ---------- kursi ---------- */
  function chair(x,z,th){
    var gp=new THREE.Group();gp.position.set(x,0,z);gp.rotation.y=th;root.add(gp);
    /* dudukan + bingkai putih tipis */
    box(.5,.08,.5,M.chair,0,.5,.0,false,gp);box(.52,.03,.52,M.base,0,.46,0,false,gp);
    /* sandaran tinggi, agak miring ke belakang */
    var bk=box(.46,.58,.06,M.chair,0,.88,-.27,false,gp);bk.rotation.x=-.12;
    box(.04,.6,.05,M.base,-.24,.88,-.27,false,gp).rotation.x=-.12;box(.04,.6,.05,M.base,.24,.88,-.27,false,gp).rotation.x=-.12;
    /* sandaran kepala */
    var hd=box(.3,.17,.06,M.chair,0,1.3,-.33,false,gp);hd.rotation.x=-.12;
    box(.03,.2,.03,M.base,0,1.2,-.31,false,gp);
    /* sandaran tangan */
    [-.28,.28].forEach(function(sx){box(.04,.22,.04,M.base,sx,.62,-.05,false,gp);box(.06,.03,.3,M.chair,sx,.74,.0,false,gp)});
    var c=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.34,10),M.base);c.position.y=.28;gp.add(c);
    for(var i=0;i<5;i++){var a=i*Math.PI*2/5,s2=box(.3,.03,.045,M.base,Math.cos(a)*.15,.07,Math.sin(a)*.15,false,gp);s2.rotation.y=-a;box(.05,.05,.05,M.black,Math.cos(a)*.29,.04,Math.sin(a)*.29,false,gp)}
    return gp;
  }
  chair(1.57,1.05,Math.PI);chair(2.87,1.05,Math.PI);chair(4.1,1.05,Math.PI);
  chair(1.0,1.3,-Math.PI/2);chair(1.0,2.45,-Math.PI/2);
  chair(2.65,1.55,0);chair(3.85,1.55,0);chair(2.65,3.2,Math.PI);chair(3.85,3.2,Math.PI);

  /* ---------- partisi slat + rak ---------- */
  (function(){
    var N=19,im=new THREE.InstancedMesh(new THREE.BoxGeometry(.06,2.55,.05),lam(0x6a4326),N),m=new THREE.Matrix4();
    for(var i=0;i<N;i++){m.setPosition(4.75,1.4,.12+i*.113);im.setMatrixAt(i,m)}
    root.add(im);
    box(.08,.07,2.3,lam(0x5a371d),4.75,2.7,1.13,true);box(.08,.07,2.3,lam(0x5a371d),4.75,.1,1.13,true);
    box(.35,.03,2.2,M.shelf,5.0,.78,1.2,true);box(.35,.03,2.2,M.shelf,5.0,.4,1.2,true);box(.35,.03,2.2,M.shelf,5.0,.05,1.2,true);
    for(var j=0;j<3;j++)box(.35,.78,.03,M.shelf,5.0,.4,.1+j*1.1,true);
  })();

  /* ---------- lounge ---------- */
  (function(){
    var rg=new THREE.Mesh(new THREE.PlaneGeometry(3.3,1.6),M.rug);rg.rotation.x=-Math.PI/2;rg.position.set(6.55,.012,1.0);root.add(rg);
    var s=new THREE.Group();s.position.set(7.2,0,.7);root.add(s);
    box(2.0,.35,.85,M.cream,0,.3,.05,true,s);box(2.0,.5,.25,M.cream,0,.62,-.32,true,s);
    [-1,1].forEach(function(sd){var c=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,.85,24),M.cream);c.rotation.x=Math.PI/2;c.position.set(sd*1.0,.48,.05);s.add(c)});
    box(.8,.42,.13,M.cushion,-.45,.72,-.15,true,s).rotation.x=-.25;box(.8,.42,.13,M.cushion,.45,.72,-.15,true,s).rotation.x=-.25;
    /* TV di dinding selatan + meja lipat */
    box(2.35,1.35,.05,M.tvf,7.5,1.55,W-.03,true);
    var scr=new THREE.Mesh(new THREE.PlaneGeometry(2.27,1.28),M.tv);scr.position.set(7.5,1.55,W-.058);scr.rotation.y=Math.PI;root.add(scr);
    box(1.8,.04,.6,M.top,7.5,.75,3.55,true);
    [6.7,8.3].forEach(function(x){box(.07,.72,.07,M.black,x,.38,3.55,false);box(.06,.04,.55,M.black,x,.03,3.55,false)});
  })();

  /* ---------- pantry ---------- */
  box(.9,1.85,.75,M.steel,10.3,.925,.45,true);box(.02,.02,.0,M.black,10.3,1.0,.07);
  box(.02,1.1,.03,M.black,10.12,1.0,.8);box(.02,1.1,.03,M.black,10.48,1.0,.8);box(.9,.01,.02,M.black,10.3,1.0,.83);
  box(.6,.86,2.0,M.cab,11.28,.43,2.1,true);box(.01,.004,1.9,M.black,10.98,.43,2.1);box(.01,.004,1.9,M.black,10.98,.72,2.1);
  box(.02,.03,.9,M.steel,10.97,.78,2.1);

  /* ---------- pintu kaca di dinding selatan ---------- */
  (function(){
    var x=9.3,z=W-.03;
    box(.08,2.1,.09,M.white,x,1.05,z,true);box(.08,2.1,.09,M.white,x+.9,1.05,z,true);box(1.0,.08,.09,M.white,x+.45,2.1,z,true);
    var gm=new THREE.Mesh(new THREE.PlaneGeometry(.82,2.02),M.glass);gm.position.set(x+.45,1.03,z);root.add(gm);
  })();

  /* ---------- lampu & cahaya ---------- */
  scene.add(new THREE.AmbientLight(0xffffff,.55));
  scene.add(new THREE.HemisphereLight(0xffffff,0xa8a8ad,.32));
  var dl=new THREE.DirectionalLight(0xffffff,.22);dl.position.set(3,8,2);scene.add(dl);

  /* ---------- garis tepi bergaya SketchUp ---------- */
  scene.updateMatrixWorld(true);
  var pos=[];
  root.traverse(function(o){
    if(o.isMesh&&o.userData.edge){
      var eg=new THREE.EdgesGeometry(o.geometry,20).applyMatrix4(o.matrixWorld),a=eg.attributes.position.array;
      for(var i=0;i<a.length;i++)pos.push(a[i]);eg.dispose();
    }
  });
  var lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  scene.add(new THREE.LineSegments(lg,M.edge));
  return scene;
}

function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}
function wrapA(a){while(a>180)a-=360;while(a<-180)a+=360;return a}

function init(host,opts){
  opts=opts||{};
  return new Promise(function(resolve,reject){
    if(!window.THREE){reject(new Error('three'));return}
    var img=new Image();
    img.onload=function(){
      try{
        var renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
        var dpr=Math.min(window.devicePixelRatio||1,2);renderer.setPixelRatio(dpr);
        var cvs=renderer.domElement;cvs.className='o3-cv';host.appendChild(cvs);
        var scene=build(img),cam=new THREE.PerspectiveCamera(74,1,.05,60);
        var st={x:.9,y:1.55,z:2.25,yaw:0,pitch:-2,fov:74},active=true,raf=0,idle=0,auto=true,tween=null,cb=null,cur='masuk',vyaw=0,vpitch=0;
        var plan=false;
        function size(){var w=host.clientWidth||300,h=host.clientHeight||300;renderer.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}
        function planDist(){var a=cam.aspect,vf=st.fov*R,hf=2*Math.atan(Math.tan(vf/2)*a);return Math.max((L*1.02)/(2*Math.tan(hf/2)),(W*1.15)/(2*Math.tan(vf/2)))+H}
        function apply(){
          cam.fov=st.fov;cam.updateProjectionMatrix();
          var yw=st.yaw*R,pt=st.pitch*R;
          cam.position.set(st.x,st.y,st.z);
          var dir=new THREE.Vector3(Math.cos(pt)*Math.cos(yw),Math.sin(pt),Math.cos(pt)*Math.sin(yw));
          cam.up.set(0,1,0);
          if(Math.abs(st.pitch)>89){cam.up.set(0,0,-1);cam.up.applyAxisAngle(new THREE.Vector3(0,1,0),-yw);}
          cam.lookAt(cam.position.clone().add(dir));
        }
        function draw(){apply();renderer.render(scene,cam)}
        function loop(t){
          raf=0;if(!active)return;
          var now=performance.now(),dt=Math.min(.05,(now-(loop.l||now))/1000);loop.l=now;
          if(tween){
            var k=Math.min(1,(now-tween.t0)/tween.d),e=ease(k);
            st.x=tween.a.x+(tween.b.x-tween.a.x)*e;st.y=tween.a.y+(tween.b.y-tween.a.y)*e;st.z=tween.a.z+(tween.b.z-tween.a.z)*e;
            st.yaw=tween.a.yaw+tween.dy*e;st.pitch=tween.a.pitch+(tween.b.pitch-tween.a.pitch)*e;st.fov=tween.a.fov+(tween.b.fov-tween.a.fov)*e;
            if(k>=1){tween=null;idle=performance.now()}
          }else if(!plan){
            if(Math.abs(vyaw)>.01||Math.abs(vpitch)>.01){st.yaw+=vyaw*dt*60;st.pitch=Math.max(-80,Math.min(80,st.pitch+vpitch*dt*60));vyaw*=.92;vpitch*=.92}
            else if(auto&&!dragging&&now-idle>2600&&!opts.noAuto){st.yaw+=dt*5}
          }
          draw();raf=requestAnimationFrame(loop);
        }
        function kick(){if(active&&!raf){loop.l=performance.now();raf=requestAnimationFrame(loop)}}
        function goTo(key,instant){
          var v=VIEWS[key];if(!v)return;cur=key;plan=key==='denah';
          var b={x:v.p[0],y:v.p[1],z:v.p[2],pitch:v.pitch,fov:v.fov};
          if(plan){var d=planDist();b.y=d;b.x=L/2;b.z=W/2;st.fov=v.fov;
            b.y=(function(){var a=cam.aspect,vf=v.fov*R,hf=2*Math.atan(Math.tan(vf/2)*a);return Math.max((L*1.03)/(2*Math.tan(hf/2)),(W*1.12)/(2*Math.tan(vf/2)))+H})()}
          var dy=wrapA(v.yaw-wrapA(st.yaw));
          tween={t0:performance.now(),d:instant?1:1200,a:{x:st.x,y:st.y,z:st.z,yaw:st.yaw,pitch:st.pitch,fov:st.fov},b:b,dy:dy};
          vyaw=vpitch=0;if(cb)cb(key);kick();
        }
        /* input */
        var dragging=false,lx=0,ly=0,ptrs={},pd=0,moved=0;
        host.addEventListener('pointerdown',function(e){
          if(e.target.closest&&e.target.closest('.o3-ui'))return;
          ptrs[e.pointerId]={x:e.clientX,y:e.clientY};dragging=true;lx=e.clientX;ly=e.clientY;moved=0;vyaw=vpitch=0;tween=null;idle=performance.now();
          try{host.setPointerCapture(e.pointerId)}catch(_){}
          var ks=Object.keys(ptrs);if(ks.length===2){var a=ptrs[ks[0]],b=ptrs[ks[1]];pd=Math.hypot(a.x-b.x,a.y-b.y)}
          host.classList.add('drag');kick();
        });
        host.addEventListener('pointermove',function(e){
          if(!ptrs[e.pointerId])return;ptrs[e.pointerId]={x:e.clientX,y:e.clientY};idle=performance.now();
          var ks=Object.keys(ptrs);
          if(ks.length===2){var a=ptrs[ks[0]],b=ptrs[ks[1]],d=Math.hypot(a.x-b.x,a.y-b.y);if(pd){st.fov=Math.max(38,Math.min(100,st.fov*(pd/d)))}pd=d;kick();return}
          if(plan)return;
          var dx=e.clientX-lx,dy=e.clientY-ly;lx=e.clientX;ly=e.clientY;moved+=Math.abs(dx)+Math.abs(dy);
          var k=.22*(st.fov/74);
          st.yaw-=dx*k;vyaw=-dx*k*.4;
          if(e.pointerType!=='touch'){st.pitch=Math.max(-80,Math.min(80,st.pitch+dy*k));vpitch=dy*k*.4}
          kick();
        });
        function up(e){delete ptrs[e.pointerId];if(!Object.keys(ptrs).length){dragging=false;host.classList.remove('drag');idle=performance.now()}pd=0;kick()}
        host.addEventListener('pointerup',up);host.addEventListener('pointercancel',up);
        host.addEventListener('wheel',function(e){if(!(e.ctrlKey||e.metaKey))return;e.preventDefault();st.fov=Math.max(38,Math.min(100,st.fov+e.deltaY*.05));kick()},{passive:false});
        host.addEventListener('dblclick',function(e){if(e.target.closest&&e.target.closest('.o3-ui'))return;st.fov=st.fov<60?74:48;kick()});
        host.addEventListener('keydown',function(e){
          var m={ArrowLeft:[-6,0],ArrowRight:[6,0],ArrowUp:[0,-4],ArrowDown:[0,4]}[e.key];if(!m)return;e.preventDefault();
          tween=null;st.yaw+=m[0];st.pitch=Math.max(-80,Math.min(80,st.pitch+m[1]));idle=performance.now();kick();
        });
        host.tabIndex=0;
        var ro=new ResizeObserver(function(){size();kick();if(!active)draw()});ro.observe(host);
        size();
        var api={
          goTo:goTo,views:Object.keys(VIEWS),current:function(){return cur},
          onView:function(f){cb=f},
          setActive:function(a){active=a;if(a){idle=performance.now();kick()}else if(raf){cancelAnimationFrame(raf);raf=0}},
          setAuto:function(a){auto=a}
        };
        goTo('masuk',true);draw();kick();
        resolve(api);
      }catch(err){reject(err)}
    };
    img.onerror=function(){reject(new Error('oak'))};
    img.src=opts.oak||'assets/3d/oak.jpg';
  });
}
window.Office3D={init:init};
})();
