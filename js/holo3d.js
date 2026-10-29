/* Hologram kepala 3D (wireframe) dari jaring wajah, mata melirik mengikuti kursor. three.js r149. */
(function(){
'use strict';
function init(host,opts){
  opts=opts||{};
  return fetch(opts.mesh||'assets/profil/face-mesh.json').then(function(r){return r.json()}).then(function(D){
    var reduce=!!opts.reduce;
    var renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
    renderer.setClearColor(0x000000,0);renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    var cv=renderer.domElement;cv.className='hx-cv';host.appendChild(cv);
    var scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(26,1,.1,50);cam.position.set(0,-.25,10.5);cam.lookAt(0,-.25,0);

    var uni={uT:{value:0},uA:{value:1}};
    function lineMat(a,col){
      return new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
        uniforms:{uT:uni.uT,uA:{value:a},uC:{value:new THREE.Color(col||0x55e6ff)}},
        vertexShader:'varying float vY;varying float vZ;void main(){vY=position.y;vec4 mv=modelViewMatrix*vec4(position,1.0);vZ=-mv.z;gl_Position=projectionMatrix*mv;}',
        fragmentShader:'uniform float uT;uniform float uA;uniform vec3 uC;varying float vY;varying float vZ;void main(){float w=pow(max(0.,1.-abs(fract(vY*.3-uT*.22)-.5)*7.),2.);float d=clamp((11.4-vZ)/2.2,0.,1.);gl_FragColor=vec4(uC*(.5+.6*d+1.1*w),uA*(.35+.65*d));}'});
    }
    var head=new THREE.Group(),body=new THREE.Group();scene.add(body);scene.add(head);

    /* jaring wajah */
    var V=new Float32Array(D.v),base=new Float32Array(D.v);
    var fg=new THREE.BufferGeometry();fg.setAttribute('position',new THREE.BufferAttribute(V,3));fg.setIndex(D.e);
    head.add(new THREE.LineSegments(fg,lineMat(.95)));
    var pg=new THREE.BufferGeometry();pg.setAttribute('position',fg.attributes.position);
    var pts=new THREE.Points(pg,new THREE.PointsMaterial({color:0xbafaff,size:.028,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false}));head.add(pts);

    /* tengkorak: ellipsoid kawat bagian belakang dan atas */
    (function(){
      var P=[],cx=0,cy=.5,cz=-.78,rx=.9,ry=1.34,rz=1.12,LAT=12,LON=26;
      function pt(th,ph){return [cx+rx*Math.sin(th)*Math.cos(ph),cy+ry*Math.cos(th),cz+rz*Math.sin(th)*Math.sin(ph)]}
      function ok(p){return p[2]<-.34||p[1]>1.12}
      for(var i=1;i<LAT;i++){var th=i/LAT*Math.PI*.78;for(var j=0;j<LON;j++){var a=pt(th,j/LON*6.2832),b=pt(th,(j+1)/LON*6.2832);if(ok(a)&&ok(b))P.push(a[0],a[1],a[2],b[0],b[1],b[2])}}
      for(var j=0;j<LON;j++){var ph=j/LON*6.2832;for(var i=0;i<LAT;i++){var t1=i/LAT*Math.PI*.78,t2=(i+1)/LAT*Math.PI*.78,a=pt(t1,ph),b=pt(t2,ph);if(ok(a)&&ok(b))P.push(a[0],a[1],a[2],b[0],b[1],b[2])}}
      var g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));head.add(new THREE.LineSegments(g,lineMat(.5)));
    })();

    /* leher dan bahu: kisi segitiga */
    (function(){
      var P=[],N=16;
      function ring(y,rx,rz,z0){var r=[];for(var i=0;i<N;i++){var a=i/N*6.2832;r.push([rx*Math.sin(a),y,z0+rz*Math.cos(a)])}return r}
      var rings=[ring(-.85,.52,.46,-.32),ring(-1.35,.5,.45,-.34),ring(-1.9,.58,.52,-.3),ring(-2.35,1.35,.62,-.25),ring(-2.85,2.05,.78,-.2)];
      for(var k=0;k<rings.length;k++){var R=rings[k];
        for(var i=0;i<N;i++){var a=R[i],b=R[(i+1)%N];P.push(a[0],a[1],a[2],b[0],b[1],b[2]);
          if(k<rings.length-1){var c=rings[k+1][i],d=rings[k+1][(i+1)%N];P.push(a[0],a[1],a[2],c[0],c[1],c[2]);P.push(a[0],a[1],a[2],d[0],d[1],d[2])}}}
      var g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));body.add(new THREE.LineSegments(g,lineMat(.42)));
    })();

    /* mata 3D */
    var eyes=[];
    [D.L,D.R].forEach(function(E){
      var r=E.w*.4,grp=new THREE.Group();grp.position.set(E.c[0],E.c[1],E.c[2]-r*.78);
      var ball=new THREE.Group();grp.add(ball);
      var wf=new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.SphereGeometry(r,12,9)),new THREE.LineBasicMaterial({color:0x4fd8ff,transparent:true,opacity:.28,blending:THREE.AdditiveBlending,depthWrite:false}));ball.add(wf);
      var iris=new THREE.Mesh(new THREE.CircleGeometry(r*.56,28),new THREE.MeshBasicMaterial({color:0x7fefff,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false}));iris.position.z=r*.985;ball.add(iris);
      var ring=new THREE.Mesh(new THREE.RingGeometry(r*.5,r*.58,32),new THREE.MeshBasicMaterial({color:0xe8ffff,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false}));ring.position.z=r*.99;ball.add(ring);
      var pupil=new THREE.Mesh(new THREE.CircleGeometry(r*.24,22),new THREE.MeshBasicMaterial({color:0x021521}));pupil.position.z=r*.995;ball.add(pupil);
      head.add(grp);eyes.push({ball:ball,E:E});
    });
    var lidIdx=D.L.idx.concat(D.R.idx);

    /* interaksi */
    var mx=null,my=null,lastMove=0,g={x:0,y:0},tg={x:0,y:0},hd={x:0,y:0},ht={x:0,y:0},idle=0,blinkT=1800,blink=0,vis=true,raf=0,t0=performance.now();
    function mv(e){mx=e.clientX;my=e.clientY;lastMove=performance.now()}
    window.addEventListener('pointermove',mv,{passive:true});window.addEventListener('pointerdown',mv,{passive:true});
    function size(){var w=host.clientWidth||300,h=host.clientHeight||300;renderer.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}
    size();if(window.ResizeObserver)new ResizeObserver(size).observe(host);else window.addEventListener('resize',size);

    function frame(now){
      raf=0;if(!vis)return;
      var dt=Math.min(.05,(now-(frame.l||now))/1000);frame.l=now;
      var r=host.getBoundingClientRect(),cx=r.left+r.width*.5,cy=r.top+r.height*.4;
      if(mx!==null&&now-lastMove<5000){
        tg.x=Math.max(-1,Math.min(1,(mx-cx)/420));tg.y=Math.max(-1,Math.min(1,(my-cy)/320));
      }else if(!reduce){
        idle-=dt*1000;if(idle<=0){idle=1100+Math.random()*2200;tg.x=(Math.random()*2-1)*.85;tg.y=(Math.random()*2-1)*.5}
      }else{tg.x=0;tg.y=0}
      var f=reduce?1:1-Math.pow(.0008,dt);
      g.x+=(tg.x-g.x)*f;g.y+=(tg.y-g.y)*f;
      var fh=reduce?1:1-Math.pow(.02,dt);
      ht.x=tg.x*.5;ht.y=tg.y*.32;hd.x+=(ht.x-hd.x)*fh;hd.y+=(ht.y-hd.y)*fh;
      head.rotation.y=hd.x;head.rotation.x=hd.y;body.rotation.y=hd.x*.35;
      eyes.forEach(function(e){e.ball.rotation.y=(g.x*.72-hd.x*.55);e.ball.rotation.x=(g.y*.38-hd.y*.4)});
      /* kedip: gerakkan titik kelopak ke tengah mata */
      var k=1;
      if(!reduce){blinkT-=dt*1000;if(blinkT<=0){blink=1;blinkT=2800+Math.random()*3400}if(blink>0){blink-=dt/.2;k=Math.max(.08,Math.abs(Math.max(0,blink)*2-1))}}
      [D.L,D.R].forEach(function(E){var yc=E.c[1];E.idx.forEach(function(i){V[i*3+1]=yc+(base[i*3+1]-yc)*k})});
      fg.attributes.position.needsUpdate=true;
      uni.uT.value=reduce?0:(now-t0)/1000;
      renderer.render(scene,cam);
      raf=requestAnimationFrame(frame);
    }
    function kick(){if(!raf&&vis)raf=requestAnimationFrame(frame)}
    return {setActive:function(v){vis=v;if(v)kick()},kick:kick,dispose:function(){renderer.dispose()}};
  });
}
window.Holo3D={init:init};
})();
