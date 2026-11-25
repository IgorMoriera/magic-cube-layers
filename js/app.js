// Interface: visualizador 3D (p5.js), Resolver, Aprender, Dicas, Cronômetro e legenda.
// Depende de js/engine.js (constante global ENGINE) e do p5.js.
{
const E=ENGINE;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const HEX={W:'#f4f4ef',Y:'#ffd400',G:'#00a651',B:'#1f5fd6',R:'#d6202a',O:'#ff7a00','?':'#77787f',X:'#38393f'};
const RGB={};for(const k in HEX)RGB[k]=[1,3,5].map(i=>parseInt(HEX[k].slice(i,i+2),16));
const CN={W:'branco',Y:'amarelo',G:'verde',B:'azul',R:'vermelho',O:'laranja'};
const DESC={R:'Direita para cima',"R'":'Direita para baixo',R2:'Direita, meia volta',L:'Esquerda para baixo',"L'":'Esquerda para cima',L2:'Esquerda, meia volta',
 U:'Topo para a esquerda',"U'":'Topo para a direita',U2:'Topo, meia volta',D:'Base para a direita',"D'":'Base para a esquerda',D2:'Base, meia volta',
 F:'Frente, sentido horário',"F'":'Frente, anti-horário',F2:'Frente, meia volta',B:'Trás, horário visto de trás',"B'":'Trás, anti-horário visto de trás',B2:'Trás, meia volta',
 M:'Fatia do meio para baixo',"M'":'Fatia do meio para cima',M2:'Fatia do meio, meia volta',y:'Cubo inteiro para a esquerda',"y'":'Cubo inteiro para a direita',y2:'Cubo inteiro, meia volta',z2:'Cubo de cabeça para baixo'};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const chips=(ms,cls='')=>E.parse(ms).map(m=>`<span class="mv ${cls}">${esc(m)}</span>`).join('');
const rand=n=>Math.floor(Math.random()*n);
function scramble(n=22){const a=[];let l='',l2='';const ax={U:0,D:0,R:1,L:1,F:2,B:2};
 while(a.length<n){const F='URFDLB'[rand(6)];if(F===l||(ax[F]===ax[l]&&ax[F]===ax[l2]))continue;l2=l;l=F;a.push(F+['',"'",'2'][rand(3)]);}return a;}
const flat=subs=>subs.flatMap(s=>[...s.pre,...s.alg]);

// ---------- Visualizador 3D (p5.js) ----------
const V=(()=>{
 const st={f:E.solved(),q:[],anim:null,speed:1,mask:null,yaw:-0.62,pitch:0.5,ty:-0.62,tp:0.5,drag:null,spin:0};
 const fns=[];let p=null,S=40,ready=false;
 const wrap=document.createElement('div');wrap.className='vw';
 wrap.innerHTML=`<div class="tag"></div><div class="tools"><button data-v="flip" aria-label="Ver de baixo ou de cima" title="Ver de baixo / de cima"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v18M6 9l6-6 6 6M6 15l6 6 6-6"/></svg></button><button data-v="front" aria-label="Recentrar a visão" title="Recentrar"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg></button></div><div class="big"><b></b><span></span></div><div class="hint">Arraste para girar</div>`;
 const tag=wrap.querySelector('.tag'),big=wrap.querySelector('.big');let bigT;
 const cubies=[],byKey={};
 for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)for(let z=-1;z<=1;z++){if(!x&&!y&&!z)continue;const c={p:[x,y,z],fl:[]};byKey[c.p.join()]=c;cubies.push(c);}
 E.POS.forEach((q,i)=>byKey[q.join()].fl.push(i));
 const PIECE=E.POS.map(q=>byKey[q.join()].fl);
 const AX={R:[0,1,-1],L:[0,-1,1],U:[1,1,-1],D:[1,-1,1],F:[2,1,-1],B:[2,-1,1],M:[0,0,1],E:[1,0,1],S:[2,0,-1],x:[0,9,-1],y:[1,9,-1],z:[2,9,-1]};
 const info=m=>{const b=AX[m[0]],s=m.slice(1);let d=b[2],k=1;if(s==="'")d=-d;if(s==='2')k=2;return{ax:b[0],layer:b[1],ang:d*k*Math.PI/2,k};};
 const rotv=(v,ax,a)=>{const c=Math.cos(a),s=Math.sin(a),[x,y,z]=v;return ax===0?[x,y*c-z*s,y*s+z*c]:ax===1?[x*c+z*s,y,-x*s+z*c]:[x*c-y*s,x*s+y*c,z];};
 const LT=(()=>{const v=[-0.35,0.62,0.7],n=Math.hypot(...v);return v.map(a=>a/n);})();
 const emit=m=>{fns.forEach(fn=>fn(m));if(m){big.querySelector('b').textContent=m;big.querySelector('span').textContent=DESC[m]||'';big.classList.add('show');clearTimeout(bigT);bigT=setTimeout(()=>big.classList.remove('show'),1300);}};
 function finish(){const A=st.anim;st.f=E.mv(st.f,[A.m]);st.anim=null;A.cb&&A.cb();}
 function next(){const it=st.q.shift(),a=info(it.m);st.anim={...a,m:it.m,t:0,dur:330/st.speed*(a.k===2?1.45:1)*(a.layer===9?1.25:1),cb:it.cb};emit(it.m);}
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 function sketch(s){
  s.setup=()=>{s.pixelDensity(Math.min(2,window.devicePixelRatio||1));s.createCanvas(Math.max(10,wrap.clientWidth),Math.max(10,wrap.clientHeight),s.WEBGL);s.setAttributes('antialias',true);ready=true;size();};
  s.draw=()=>{const dt=Math.min(60,s.deltaTime||16);
   if(!st.drag){st.yaw+=(st.ty-st.yaw)*0.14;st.pitch+=(st.tp-st.pitch)*0.14;}
   if(st.spin&&!st.drag&&!reduce)st.ty+=st.spin*dt;
   if(!st.anim&&st.q.length)next();
   let A=st.anim,ang=0;
   if(A){A.t+=dt/A.dur;if(A.t>=1){finish();A=st.anim;if(A){A.t=0;}}if(A){const t=Math.min(1,A.t);ang=A.ang*(t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2);}}
   s.clear();s.push();s.scale(1,-1,1);s.rotateX(st.pitch);s.rotateY(st.yaw);s.noStroke();
   for(const c of cubies){const mov=A&&(A.layer===9||c.p[A.ax]===A.layer);
    s.push();if(mov)s.rotate(ang,A.ax===0?[1,0,0]:A.ax===1?[0,1,0]:[0,0,1]);
    s.translate(c.p[0]*S,c.p[1]*S,c.p[2]*S);s.fill(16,16,18);s.box(S*0.96);
    for(const i of c.fl){const n=E.NOR[i];let v=mov?rotv(n,A.ax,ang):n;v=rotv(rotv(v,1,st.yaw),0,st.pitch);
     const sh=0.58+0.42*Math.max(0,v[0]*LT[0]+v[1]*LT[1]+v[2]*LT[2]);
     const col=st.mask&&!st.mask(st.f,i)?RGB.X:(RGB[st.f[i]]||RGB['?']);
     s.push();s.translate(n[0]*S*0.492,n[1]*S*0.492,n[2]*S*0.492);if(n[0])s.rotateY(Math.PI/2);else if(n[1])s.rotateX(Math.PI/2);
     s.fill(col[0]*sh,col[1]*sh,col[2]*sh);s.plane(S*0.86);s.pop();}
    s.pop();}
   s.pop();};
 }
 function size(){if(!p||!ready)return;const w=Math.max(10,wrap.clientWidth),h=Math.max(10,wrap.clientHeight);if(p.width!==w||p.height!==h)p.resizeCanvas(w,h);S=Math.min(w,h)*0.165;}
 const ro=new ResizeObserver(()=>size());ro.observe(wrap);
 if(typeof p5!=='undefined'){try{p=new p5(sketch,wrap);}catch(e){p=null;}}
 if(!p){const d=document.createElement('div');d.className='err';d.textContent='Não foi possível carregar o 3D (p5.js). Os passos em texto continuam funcionando.';wrap.appendChild(d);}
 // arrastar para girar
 wrap.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;st.drag={x:e.clientX,y:e.clientY,t:e.pointerType};wrap.setPointerCapture(e.pointerId);});
 wrap.addEventListener('pointermove',e=>{const d=st.drag;if(!d)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;d.x=e.clientX;d.y=e.clientY;
  st.yaw+=dx*0.011;st.ty=st.yaw;if(d.t==='mouse'){st.pitch=Math.max(-1.45,Math.min(1.45,st.pitch+dy*0.011));st.tp=st.pitch;}});
 const end=()=>{st.drag=null;};wrap.addEventListener('pointerup',end);wrap.addEventListener('pointercancel',end);
 const VIEWS={front:[-0.62,0.5],low:[-0.62,-0.55],U:[0,1.25],D:[0,-1.25],F:[0,0.2],R:[-Math.PI/2,0.2],B:[Math.PI,0.2],L:[Math.PI/2,0.2]};
 function view(k){const[y,pt]=VIEWS[k]||VIEWS.front;let t=y;while(t-st.ty>Math.PI)t-=2*Math.PI;while(st.ty-t>Math.PI)t+=2*Math.PI;st.ty=t;st.tp=pt;}
 wrap.querySelector('.tools').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.v==='flip')st.tp=st.tp>0?-0.55:0.5;else view('front');});
 return{
  attach(el){if(wrap.parentNode!==el)el.appendChild(wrap);requestAnimationFrame(size);},
  set(f){st.q=[];if(st.anim){st.anim=null;}st.f=f.slice();},
  play(ms,o={}){const a=E.parse(ms);if(!a.length){o.done&&setTimeout(o.done,0);return;}
   a.forEach((m,i)=>st.q.push({m,cb:()=>{o.each&&o.each(m,i);if(i===a.length-1&&o.done)o.done();}}));
   if(!p){const run=()=>{if(!st.q.length)return;const it=st.q.shift();st.f=E.mv(st.f,[it.m]);emit(it.m);it.cb();setTimeout(run,60);};setTimeout(run,0);}},
  stop(){st.q=[];},busy:()=>!!st.anim||st.q.length>0,
  speed(x){st.speed=x;},mask(k){st.mask=k?MASKS[k]:null;},spin(v){st.spin=v;},view,tag(t){tag.textContent=t||'';},on(fn){fns.push(fn);},
  get f(){return st.f;},PIECE};
})();
const pc=(f,i)=>V.PIECE[i].map(j=>f[j]);
const MASKS={
 centers:(f,i)=>V.PIECE[i].length===1, edges:(f,i)=>V.PIECE[i].length===2, corners:(f,i)=>V.PIECE[i].length===3,
 cross:(f,i)=>{const n=V.PIECE[i].length;return n===1||(n===2&&pc(f,i).includes('W'));},
 l1:(f,i)=>V.PIECE[i].length===1||pc(f,i).includes('W'),
 f2l:(f,i)=>V.PIECE[i].length===1||!pc(f,i).includes('Y'),
 olle:(f,i)=>{const n=V.PIECE[i].length;if(n===1||!pc(f,i).includes('Y'))return true;return n===2&&f[i]==='Y';},
 oll:(f,i)=>{const n=V.PIECE[i].length;if(n===1||!pc(f,i).includes('Y'))return true;return f[i]==='Y';},
 cp:(f,i)=>{const n=V.PIECE[i].length;if(n===1||!pc(f,i).includes('Y'))return true;return n===3||f[i]==='Y';}};

// ---------- Legenda ----------
const FAMS=[['R','direita'],['L','esquerda'],['U','cima'],['D','baixo'],['F','frente'],['B','trás'],['M','fatia do meio, como o L'],['y','cubo inteiro, como o U']];
$('#fams').innerHTML=FAMS.map(([k,n])=>`<div class="fam"><h3>${k} <span>· ${n}</span></h3><div class="ch">${[k,k+"'",k+'2'].concat(k==='y'?['z2']:[]).map(m=>`<button class="chip" data-m="${m}"><b>${m}</b><span>${DESC[m]}</span></button>`).join('')}</div></div>`).join('');
const legendChips=$$('#fams .chip');
V.on(m=>legendChips.forEach(c=>c.classList.toggle('on',c.dataset.m===m)));
let active=null;
$('#fams').addEventListener('click',e=>{const b=e.target.closest('.chip');if(!b)return;const m=b.dataset.m;
 active&&active.pause&&active.pause();V.stop();
 const stage=$('.view.on .stage');if(stage&&stage.getBoundingClientRect().bottom<0)stage.scrollIntoView({behavior:'smooth',block:'center'});
 const go=()=>{if(V.busy())return setTimeout(go,60);V.play([m,E.invMove(m)],{done:()=>active&&active.resume&&setTimeout(active.resume,500)});};setTimeout(go,stage?300:0);});

// ---------- Resolver ----------
const FACE_UI=[['U','Cima'],['F','Frente'],['R','Direita'],['B','Trás'],['L','Esquerda'],['D','Baixo']];
const NEIGH={U:['B','F','L','R'],F:['U','D','L','R'],R:['U','D','F','B'],B:['U','D','R','L'],L:['U','D','B','F'],D:['F','B','L','R']};
const FN={U:'cima',D:'baixo',F:'frente',B:'trás',R:'direita',L:'esquerda'};
const HINT={U:'Verde de frente para você: incline o cubo e olhe o topo (branco). A borda de cima da grade encosta no azul.',F:'Olhe direto para a frente (verde), com o branco em cima.',R:'Gire o cubo para a esquerda e olhe a face vermelha, com o branco em cima.',B:'Gire até a face azul ficar de frente, com o branco em cima.',L:'Olhe a face laranja, com o branco em cima.',D:'Volte o verde para a frente e incline o cubo para ver a base (amarelo). A borda de cima da grade encosta no verde.'};
const RS={cur:E.mv(E.solved(),scramble()),face:'U',color:'W',mode:'edit',tok:[],subs:[],states:[],idx:0,playing:false,speed:1};
const FI=F=>E.FACES.indexOf(F)*9;
function drawEditor(){
 const cnt={};RS.cur.forEach(c=>cnt[c]=(cnt[c]||0)+1);
 $('#faces').innerHTML=FACE_UI.map(([F,n])=>{const miss=RS.cur.slice(FI(F),FI(F)+9).filter(c=>c==='?').length;return`<button data-f="${F}" class="${F===RS.face?'on':''}"><i style="background:${HEX[E.HOME[F]]}"></i><span>${n}<small>${miss?miss+' a pintar':CN[E.HOME[F]]}</small></span></button>`;}).join('');
 const F=RS.face,[t,b,l,r]=NEIGH[F],nb=(G,cls,pos)=>`<div class="nb ${cls}" style="background:${HEX[E.HOME[G]]};${pos}">${FN[G]}</div>`;
 $('#ed').innerHTML=nb(t,'','grid-column:2;grid-row:1')+nb(l,'v','grid-column:1;grid-row:2')+`<div class="g3" style="grid-column:2;grid-row:2">${Array.from({length:9},(_,k)=>{const c=RS.cur[FI(F)+k];return`<button data-k="${k}" class="${k===4?'c':''} ${c==='?'?'q':''}" style="${c==='?'?'':'background:'+HEX[c]}" aria-label="${k===4?'Centro fixo':'Quadradinho '+(k+1)}"></button>`;}).join('')}</div>`+nb(r,'v','grid-column:3;grid-row:2')+nb(b,'','grid-column:2;grid-row:3');
 $('#faceHint').textContent=HINT[F];
 $('#pal').innerHTML='WGRBOY'.split('').map(c=>`<button data-c="${c}" class="${c===RS.color?'on':''} ${(cnt[c]||0)>9?'bad':''}" style="background:${HEX[c]}" aria-label="${CN[c]}, ${cnt[c]||0} de 9">${cnt[c]||0}/9</button>`).join('');
 if(RS.mode==='edit')V.set(RS.cur);}
$('#faces').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;RS.face=b.dataset.f;drawEditor();V.view(RS.face);});
$('#ed').addEventListener('click',e=>{const b=e.target.closest('button[data-k]');if(!b||b.dataset.k==='4')return;RS.cur[FI(RS.face)+ +b.dataset.k]=RS.color;$('#edMsg').hidden=true;drawEditor();});
$('#pal').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;RS.color=b.dataset.c;drawEditor();});
$('#rnd').onclick=()=>{RS.cur=E.mv(E.solved(),scramble());$('#edNote').textContent='Exemplo embaralhado — troque pelas cores do seu cubo quando quiser.';$('#edMsg').hidden=true;drawEditor();};
$('#clr').onclick=()=>{RS.cur=RS.cur.map((c,i)=>i%9===4?c:'?');$('#edNote').textContent='Tudo limpo: pinte face por face. Os centros já vêm certos.';$('#edMsg').hidden=true;drawEditor();};
$('#sol').onclick=()=>{RS.cur=E.solved();$('#edMsg').hidden=true;drawEditor();};
$('#go').onclick=()=>{const v=E.validate(RS.cur),m=$('#edMsg');m.classList.remove('ok');
 if(!v.ok){m.textContent=v.msg;m.hidden=false;return;}
 if(E.isSolved(RS.cur)){m.textContent='Esse cubo já está montado. Embaralhe e pinte de novo!';m.classList.add('ok');m.hidden=false;return;}
 const sol=E.solve(RS.cur);RS.tok=[];RS.subs=[];
 sol.stages.forEach(sg=>sg.subs.forEach(sb=>{const si=RS.subs.length;RS.subs.push({...sb,stage:sg.id,start:RS.tok.length});
  sb.pre.forEach(m=>RS.tok.push({m,stage:sg.id,sub:si,pre:true}));sb.alg.forEach(m=>RS.tok.push({m,stage:sg.id,sub:si,pre:false}));RS.subs[si].end=RS.tok.length;}));
 RS.states=[RS.cur.slice()];RS.tok.forEach((t,k)=>RS.states.push(E.mv(RS.states[k],[t.m])));
 RS.mode='play';RS.idx=0;RS.playing=false;$('#editor').hidden=true;$('#player').hidden=false;V.view('front');V.set(RS.states[0]);buildStrip();drawPlayer();};
$('#edit').onclick=()=>{RS.playing=false;V.stop();RS.mode='edit';$('#player').hidden=true;$('#editor').hidden=false;V.set(RS.cur);drawEditor();V.view(RS.face);V.tag('');};
const STN={1:'Cruz',2:'1ª camada',3:'2ª camada',4:'Cruz de cima',5:'Face de cima',6:'Cantos',7:'Minerva'};
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
function prep(pre,w,fb){const r=pre.filter(m=>/^[xyz]/.test(m)),u=pre.filter(m=>m[0]==='U'),t=[];
 if(r.length&&w.r)t.push(`gire o cubo inteiro (${r.join(' ')}) ${w.r}`);if(u.length&&w.u)t.push(`gire o topo (${u.join(' ')}) ${w.u}`);return t.length?cap(t.join(' e '))+'.':(fb||'');}
function describe(sb){const p=sb.piece||[],k=sb.kase,pr=sb.pre,cs={c:'até o canto ficar logo acima do lugar dele'};
 switch(k){
 case'cruz':return[`Meio branco e ${CN[p[1]]}`,`Leve este meio para cima, encostado no centro ${CN[p[1]]}, sem desmanchar o que já está pronto. Não há fórmula: siga os giros.`];
 case'virar':return['Virar o cubo','Cruz pronta! Vire o cubo de cabeça para baixo (z2): o branco vai para baixo e o amarelo fica em cima.'];
 case'c_dir':case'c_fre':case'c_cima':{const pos=prep(pr,{r:'para o lugar dele ficar na frente-direita',u:cs.c},'O canto já está acima do lugar dele, na frente-direita.');
  const t={c_dir:"O branco aponta para a direita: R U R'.",c_fre:"O branco aponta para a frente: F' U' F.",c_cima:"O branco aponta para cima: R U2 R' U' — o canto vira um dos outros casos."}[k];
  return[`Canto branco, ${CN[p[1]]} e ${CN[p[2]]}`,pos+' '+t];}
 case'c_preso':return[`Canto branco, ${CN[p[1]]} e ${CN[p[2]]} preso`,`Ele está embaixo, mas no lugar errado ou girado. ${prep(pr,{r:'para deixá-lo na frente-direita'})} Tire-o com R U R' — ele sobe para a camada de cima.`];
 case'e_dir':case'e_esq':return[`Meio ${CN[p[0]]} e ${CN[p[1]]}`,prep(pr,{r:`para o centro ${CN[p[0]]} ficar de frente`,u:'até o meio formar um T com o centro da frente'},'O meio já forma um T com o centro da frente.')+' '+(k==='e_dir'?`A cor de cima (${CN[p[1]]}) é a do centro da direita: U R U R' U' F' U' F.`:`A cor de cima (${CN[p[1]]}) é a do centro da esquerda: U' L' U' L U F U F'.`)];
 case'e_preso':return[`Meio ${CN[p[0]]} e ${CN[p[1]]} preso`,`Ele está na camada do meio, mas invertido ou no lugar errado. ${prep(pr,{r:'para deixá-lo na frente-direita'})} Aplique o caso da direita: um meio amarelo entra e o preso sobe.`];
 case'x_L':return['Aparece um L',`${prep(pr,{u:'para deixar o L atrás e à esquerda'},'O L já está atrás e à esquerda.')} Aplique F U R U' R' F'.`];
 case'x_linha':return['Aparece uma linha',`${prep(pr,{u:'para deixá-la deitada'},'A linha já está deitada.')} Aplique F U R U' R' F' — ela vira um L.`];
 case'x_ponto':return['Só o ponto',"Só o centro está amarelo. Aplique F U R U' R' F' de qualquer lado — vira uma linha."];
 case'o_1':return['1 canto amarelo (peixinho)',`${prep(pr,{u:'para ele ficar na frente-esquerda'},'Ele já está na frente-esquerda.')} Aplique R U R' U R U2 R'.`];
 case'o_0':return['Nenhum canto amarelo',`${prep(pr,{u:'até o canto da frente-esquerda ter o amarelo virado para a esquerda'},'O canto da frente-esquerda já tem o amarelo virado para a esquerda.')} Aplique R U R' U R U2 R'.`];
 case'o_2':return['2 cantos amarelos',`${prep(pr,{u:'até o canto da frente-esquerda ter o amarelo virado para a frente'},'O canto da frente-esquerda já tem o amarelo virado para a frente.')} Aplique R U R' U R U2 R'.`];
 case'p_farois':return['Faróis',`Dois cantos vizinhos têm a mesma cor do lado. ${prep(pr,{u:'para deixá-los atrás'},'Eles já estão atrás.')} Aplique R' F R' B2 R F' R' B2 R2.`];
 case'p_diag':return['Sem faróis',"Nenhum par de cantos combina. Aplique R' F R' B2 R F' R' B2 R2 de qualquer lado — os faróis aparecem."];
 case'p_alinhar':return['Alinhar os cantos',`Os cantos já estão certos entre si. Gire o topo (${sb.alg.join(' ')}) para alinhá-los com os centros.`];
 case'm_a':case'm_b':return['Um meio certo',`${prep(pr,{r:'para deixar o meio certo atrás'},'O meio certo já está atrás.')} `+(k==='m_a'?"A frente do meio da frente tem a cor do centro da esquerda: F2 U M' U2 M U F2.":"A frente do meio da frente tem a cor do centro da direita: F2 U' M' U2 M U' F2.")];
 case'm_zero':return['Nenhum meio certo',"Nenhum meio de cima está certo ainda. Aplique F2 U M' U2 M U F2 de qualquer lado — um deles fica certo."];}
 return['',''];}
function curSub(){const i=Math.min(RS.idx,RS.tok.length-1);return RS.tok.length?RS.tok[i].sub:-1;}
function stageStart(id){const t=RS.tok.findIndex(x=>x.stage===id);return t;}
function buildStrip(){let h='',last=0;
 RS.tok.forEach((t,k)=>{if(t.stage!==last){if(last)h+='</div>';h+=`<h4>${t.stage} · ${STN[t.stage]}</h4><div class="mvs">`;last=t.stage;}h+=`<span class="mv${t.pre?' pre':''}" data-k="${k}">${esc(t.m)}</span>`;});
 $('#pStrip').innerHTML=h+'</div>';$('#pTotal').textContent=RS.tok.length;
 $('#pStages').innerHTML=[1,2,3,4,5,6,7].map(id=>{const n=RS.tok.filter(t=>t.stage===id).length;return`<button data-s="${id}" ${n?'':'class="dn"'}>${id} · ${STN[id]} <small>(${n})</small></button>`;}).join('');}
function drawPlayer(animK){const N=RS.tok.length,k=animK??RS.idx;
 const si=k>=N?-1:RS.tok[k].sub;const stage=k>=N?8:RS.tok[k].stage;
 $$('#pStages button').forEach(b=>b.classList.toggle('on',+b.dataset.s===stage));
 const strip=$$('#pStrip .mv');strip.forEach((el,j)=>{el.classList.toggle('now',j===animK);el.classList.toggle('dn',j<RS.idx&&j!==animK);});
 const nowEl=strip[animK??RS.idx];if(nowEl){const box=$('#pStrip');const top=nowEl.offsetTop-box.offsetTop;if(top<box.scrollTop||top>box.scrollTop+box.clientHeight-40)box.scrollTop=top-60;}
 if(si<0){$('#pCard').innerHTML=`<p class="lbl">Fim</p><h3>Cubo montado!</h3><p>Foram ${N} movimentos. Use Voltar para rever qualquer giro ou toque num passo acima.</p>`;V.tag('Cubo montado');}
 else{const sb=RS.subs[si],[t,d]=describe(sb);
  $('#pCard').innerHTML=`<p class="lbl">Passo ${sb.stage} de 7 · ${STN[sb.stage]}</p><h3>${esc(t)}</h3><p>${esc(d)}</p><div class="mvs">${[...sb.pre.map((m,j)=>[m,true,sb.start+j]),...sb.alg.map((m,j)=>[m,false,sb.start+sb.pre.length+j])].map(([m,pre,j])=>`<span class="mv${pre?' pre':''}${j===k?' now':j<RS.idx?' dn':''}">${esc(m)}</span>`).join('')}</div>${sb.pre.length?'<p class="lbl" style="margin:8px 0 0">Tracejado: posicionar o cubo. Cheio: o algoritmo do passo.</p>':''}`;
  V.tag(`Passo ${sb.stage} · ${STN[sb.stage]}`);}
 $('#pBar').style.width=(N?RS.idx/N*100:0)+'%';$('#pPos').textContent=`${RS.idx} / ${N}`;
 $('#icPlay').hidden=RS.playing;$('#icPause').hidden=!RS.playing;$('#bPlay').setAttribute('aria-label',RS.playing?'Pausar':'Tocar');}
function step(){if(V.busy()||RS.idx>=RS.tok.length){if(RS.idx>=RS.tok.length){RS.playing=false;drawPlayer();}return;}
 const k=RS.idx;drawPlayer(k);V.play([RS.tok[k].m],{done:()=>{RS.idx=k+1;drawPlayer();if(RS.playing)setTimeout(()=>{if(RS.playing)step();},RS.tok[RS.idx]&&RS.tok[RS.idx].sub!==RS.tok[k].sub?650/RS.speed:40);}});}
function back(){if(V.busy()||RS.idx<=0)return;const k=RS.idx-1;drawPlayer(k);V.play([E.invMove(RS.tok[k].m)],{done:()=>{RS.idx=k;drawPlayer();}});}
function seek(k){RS.playing=false;V.stop();const go=()=>{if(V.busy())return setTimeout(go,40);RS.idx=Math.max(0,Math.min(RS.tok.length,k));V.set(RS.states[RS.idx]);drawPlayer();};go();}
$('#bPlay').onclick=()=>{if(RS.playing){RS.playing=false;drawPlayer();return;}if(RS.idx>=RS.tok.length)seek(0);RS.playing=true;drawPlayer();setTimeout(step,RS.idx>=RS.tok.length?80:0);};
$('#bNext').onclick=()=>{RS.playing=false;step();};$('#bPrev').onclick=()=>{RS.playing=false;back();};
$('#bFirst').onclick=()=>{const s=RS.tok[Math.max(0,RS.idx-1)];if(!s)return;let t=stageStart(s.stage);if(t===RS.idx&&s.stage>1){for(let id=s.stage-1;id>=1;id--){const x=stageStart(id);if(x>=0){t=x;break;}}}seek(Math.max(0,t));};
$('#bLast').onclick=()=>{const s=RS.tok[RS.idx];if(!s)return;let t=RS.tok.findIndex((x,j)=>j>RS.idx&&x.stage>s.stage);seek(t<0?RS.tok.length:t);};
$('#pStages').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const t=stageStart(+b.dataset.s);if(t>=0)seek(t);});
$('#pStrip').addEventListener('click',e=>{const s=e.target.closest('.mv');if(s)seek(+s.dataset.k);});
$('#spd').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;RS.speed=+b.dataset.s;V.speed(RS.speed);$$('#spd button').forEach(x=>x.classList.toggle('on',x===b));});
const CTRL={};
CTRL.resolver={enter(){V.mask(null);V.spin(0);V.speed(RS.speed);if(RS.mode==='play'){V.set(RS.states[RS.idx]);V.view('front');drawPlayer();}else{V.tag('Seu cubo');drawEditor();V.view(RS.face);}},
 leave(){RS.playing=false;},pause(){RS.playing=false;if(RS.mode==='play')drawPlayer();}};

// ---------- Aprender ----------
const OLL="F U R U' R' F'",SUNE="R U R' U R U2 R'",AP="R' F R' B2 R F' R' B2 R2",UA="F2 U M' U2 M U F2",UB="F2 U' M' U2 M U' F2",HP="M2 U M2 U2 M2 U M2",ZP="M2 U M2 U M' U2 M2 U2 M' U2";
const STEPS=[
 {dot:'Início',kick:'Antes de começar',title:'Conheça as peças',goal:'O cubo tem três tipos de peça. Entender isso é metade do caminho.',base:'top',
  how:['Centros (6): uma cor só, e nunca saem do lugar. A cor do centro é a cor daquela face.','Meios (12): peças de 2 cores, entre dois centros.','Cantos (8): peças de 3 cores, nas quinas.','O método de camadas monta o cubo de baixo para cima: primeira camada, segunda camada e, por último, a camada de cima.'],
  cases:[{t:'Centros',d:'Só os 6 centros coloridos.',demo:{spin:1,mask:'centers'}},{t:'Meios',d:'As 12 peças de 2 cores.',demo:{spin:1,mask:'edges'}},{t:'Cantos',d:'As 8 peças de 3 cores.',demo:{spin:1,mask:'corners'}}],video:'_X7PyBKjEHU'},
 {dot:'Códigos',kick:'Notação',title:'Como ler os movimentos',goal:'Cada letra é uma face. Leia da esquerda para a direita e gire.',base:'top',
  how:['R direita, L esquerda, U cima, D baixo, F frente, B trás (iniciais em inglês).','Letra sozinha: sentido horário, olhando de frente para a face. Com apóstrofo (R\'): anti-horário. Com 2 (U2): meia volta.','M é a fatia do meio, girando como o L. y gira o cubo inteiro, como o U, e z2 vira o cubo de cabeça para baixo.','A legenda completa fica no fim da página.'],
  cases:[{t:'R e R\'',demo:{seq:"R R'"}},{t:'U e U\'',demo:{seq:"U U'"}},{t:'F e F\'',demo:{seq:"F F'"}},{t:'M e M\'',demo:{seq:"M M'"}},{t:'y e y\'',demo:{seq:"y y'"}}]},
 {dot:'1',kick:'Passo 1 de 7 · Primeira camada',title:'Cruz',goal:'Montar uma cruz branca em cima, com cada meio branco encostado no centro da sua outra cor — um "T" em cada lado.',base:'top',mask:'cross',
  how:['Segure o cubo com o centro branco em cima.','Ache um meio que tenha branco e veja a outra cor dele.','Leve esse meio para cima, sobre o centro da outra cor, sem desmanchar os que já estão certos.','Repita com os 4 meios. Não há fórmula: é intuitivo e fica fácil com a prática.'],
  cases:[{t:'Meio embaixo',d:'Gire a base (D) até ele ficar embaixo do centro da sua cor e suba com meia volta (F2).',demo:{seq:'D F2'}},{t:'Meio na camada do meio',d:'Um giro da lateral leva ele direto para cima.',demo:{seq:'F'}},{t:'Meio em cima, virado',d:'Branco virado para o lado: F U\' R U conserta sem estragar o resto.',demo:{seq:"F U' R U"}},{t:'Exemplo completo',d:'Um cubo embaralhado e a cruz montada meio a meio. Cada volta traz um embaralhamento novo.',demo:{random:1}}],
  note:'Confira os lados: cada meio branco precisa formar um "T" com o centro da lateral. Branco em cima com a lateral errada não conta.',video:'qt7qiYqMN6k'},
 {dot:'2',kick:'Passo 2 de 7 · Primeira camada',title:'Cantos da 1ª camada',goal:'Encaixar os 4 cantos brancos e completar a primeira camada.',base:'bot',mask:'l1',
  how:['Vire o cubo de cabeça para baixo (z2): a cruz fica embaixo e o amarelo em cima.','Ache um canto com branco na camada de cima e veja as outras duas cores dele.','Gire o cubo inteiro para o lugar desse canto ficar na frente-direita, embaixo.','Gire o topo até o canto ficar logo acima do lugar e veja para onde aponta o branco.'],
  cases:[{t:'Branco para a direita',alg:"R U R'",demo:{seq:"R U R'"}},{t:'Branco para a frente',alg:"F' U' F",demo:{seq:"F' U' F"}},{t:'Branco para cima',alg:"R U2 R' U'",d:'Vira um dos casos acima; aí é só aplicar.',demo:{seq:"R U2 R' U' R U R'"}},{t:'Canto preso embaixo',alg:"R U R'",d:'No lugar errado ou girado: deixe-o na frente-direita e tire com R U R\'.',demo:{seq:"R U R' U' R U2 R' U' R U R'"}},{t:'Com posicionamento',d:'Antes do caso: gire o cubo (y) e o topo (U2).',demo:{seq:"y U2 R U R'"}}],
  note:'R U R\' e F\' U\' F são espelhos: um encaixa pela direita, o outro pela frente.',video:'lnk2OzL0r9Q'},
 {dot:'3',kick:'Passo 3 de 7 · Segunda camada',title:'Meios da 2ª camada',goal:'Encaixar os 4 meios da camada do meio — os que não têm amarelo.',base:'bot',mask:'f2l',
  how:['Continue com o branco embaixo.','Procure na camada de cima um meio sem amarelo.','Gire o topo até a cor da lateral dele bater com o centro logo abaixo (um "T" de pé) e gire o cubo para esse centro ficar de frente.','A cor de cima do meio diz para que lado ele vai.'],
  cases:[{t:'Vai para a direita',alg:"U R U R' U' F' U' F",d:'U R U R\' U\' tira o canto junto; F\' U\' F é o caso "branco para a frente" do passo 2.',demo:{seq:"U R U R' U' F' U' F"}},{t:'Vai para a esquerda',alg:"U' L' U' L U F U F'",d:'O espelho do anterior.',demo:{seq:"U' L' U' L U F U F'"}},{t:'Meio preso',d:'Nenhum meio sem amarelo em cima, mas a camada não está pronta: deixe o preso na frente-direita e aplique o caso da direita. Ele sobe e vira um caso normal.',demo:{inv:"U R U R' U' F' U' F U2 U R U R' U' F' U' F",fn:'stageEdges'}}],
  note:'Nunca coloque na 2ª camada um meio que tem amarelo: ele é da camada de cima.',video:'ciE5VTYcVxk'},
 {dot:'4',kick:'Passo 4 de 7 · Última camada',title:'Cruz de cima',goal:'Formar uma cruz amarela em cima, sem se preocupar com as laterais.',base:'bot',mask:'olle',
  how:['Olhe só os meios com amarelo virado para cima: aparece um ponto, um L ou uma linha.','O algoritmo é sempre o mesmo, F U R U\' R\' F\'. O que muda é a posição.'],
  cases:[{t:'L',alg:OLL,d:'Deixe o L atrás e à esquerda e aplique uma vez.',demo:{inv:OLL,fn:'stageTopCross'}},{t:'Linha',alg:OLL,d:'Deixe a linha deitada (esquerda–direita): vira um L.',demo:{inv:"F R U R' U' F'",fn:'stageTopCross'}},{t:'Ponto',alg:OLL,d:'De qualquer lado: vira uma linha, depois um L.',demo:{setup:OLL+' '+OLL+' U2 '+OLL,fn:'stageTopCross'}}],
  note:'Só existem 0, 2 ou 4 meios amarelos para cima. Se aparecer 1 ou 3, o cubo foi desmontado e remontado errado.',video:'toj3ktQOOo8'},
 {dot:'5',kick:'Passo 5 de 7 · Última camada',title:'Face de cima',goal:'Deixar toda a face de cima amarela.',base:'bot',mask:'oll',
  how:['Conte os cantos com o amarelo virado para cima: 0, 1 ou 2.','Posicione girando o topo (U) e aplique R U R\' U R U2 R\'.','Repita até a face ficar toda amarela.'],
  cases:[{t:'1 canto (peixinho)',alg:SUNE,d:'Canto amarelo na frente-esquerda. Se sobrar 1 canto de novo, repita.',demo:{inv:SUNE,fn:'stageTopFace'}},{t:'Nenhum canto',alg:SUNE,d:'Amarelo virado para a esquerda no canto da frente-esquerda.',demo:{setup:SUNE+' '+SUNE,fn:'stageTopFace'}},{t:'2 cantos',alg:SUNE,d:'Amarelo virado para a frente no canto da frente-esquerda.',demo:{setup:SUNE+' '+SUNE+' '+SUNE,fn:'stageTopFace'}}],
  note:'Só pode haver 0, 1, 2 ou 4 cantos amarelos para cima — nunca 3. Se tiver 3, um canto foi encaixado torto ao remontar.',video:'jAIBruUkx_A'},
 {dot:'6',kick:'Passo 6 de 7 · Última camada',title:'Cantos no lugar',goal:'Levar cada canto de cima para o lugar certo.',base:'bot',mask:'cp',
  how:['Procure numa lateral dois cantos vizinhos com a mesma cor: os "faróis".','Deixe os faróis atrás e aplique R\' F R\' B2 R F\' R\' B2 R2.','Sem faróis, aplique de qualquer lado: eles aparecem.','No fim, gire o topo para alinhar os cantos com os centros.'],
  cases:[{t:'Faróis',alg:AP,demo:{inv:AP,fn:'stageCornersLL'}},{t:'Sem faróis',alg:AP,d:'Os cantos trocados estão na diagonal.',demo:{setup:AP+' U '+AP,fn:'stageCornersLL'}}],
  note:'Com os faróis atrás, uma aplicação basta; depois é só alinhar o topo.',video:'XoZatPVeUUc'},
 {dot:'7',kick:'Passo 7 de 7 · Última camada',title:'Minerva',goal:'Trocar os meios de cima de lugar e terminar o cubo.',base:'bot',
  how:['Procure um meio que já combine com o centro da lateral e gire o cubo inteiro (y) para deixá-lo atrás.','Olhe a cor da frente do meio da frente: ela diz qual algoritmo usar.','M\' é a fatia do meio para cima; M, para baixo.'],
  cases:[{t:'Cor do centro da esquerda',alg:UA,demo:{inv:UA,fn:'stageMinerva'}},{t:'Cor do centro da direita',alg:UB,demo:{inv:UB,fn:'stageMinerva'}},{t:'Nenhum certo: opostos',d:'Aplique o primeiro de qualquer lado: um meio fica certo.',demo:{setup:HP,fn:'stageMinerva'}},{t:'Nenhum certo: vizinhos',demo:{setup:ZP,fn:'stageMinerva'}}],
  note:'Você nunca precisa trocar só 2 meios. Se precisar, o cubo foi remontado errado.',video:'DG_OLDDZ7E4'}];
const BASES={top:()=>E.solved(),bot:()=>E.mv(E.solved(),'z2')};
function mkDemo(d,ctx){const base=BASES[d.base||ctx.base||'top']();
 if(d.spin)return{start:base,moves:[],spin:1};
 if(d.random){const s=E.mv(E.solved(),scramble());return{start:s,moves:flat(E.stageCross(s).subs)};}
 if(d.bottomCross){const s=E.mv(E.solved(),scramble()),mp={U:'D',D:'U',R:'L',L:'R',F:'F',B:'B'};return{start:E.mv(s,'z2'),moves:flat(E.stageCross(s).subs).map(m=>mp[m[0]]+m.slice(1))};}
 let start=base;if(d.seq)start=E.mv(base,E.inv(d.seq));if(d.inv)start=E.mv(base,E.inv(d.inv));if(d.setup)start=E.mv(start,d.setup);
 return{start,moves:d.fn?flat(E[d.fn](start).subs):E.parse(d.seq)};}
let demoTok=0,demoCtx=null;
function runDemo(d,ctx,label){const tok=++demoTok;demoCtx=[d,ctx,label];V.stop();V.mask(d.mask||ctx.mask||null);V.view(d.view||ctx.view||'front');V.tag(label);V.speed(1);
 let dm=mkDemo(d,ctx);V.spin(dm.spin?0.00035:0);
 const cyc=()=>{if(tok!==demoTok)return;if(d.random||d.bottomCross)dm=mkDemo(d,ctx);
  const wait=()=>{if(tok!==demoTok)return;if(V.busy())return setTimeout(wait,50);V.set(dm.start);if(!dm.moves.length)return;
   setTimeout(()=>{if(tok!==demoTok)return;V.play(dm.moves,{done:()=>setTimeout(cyc,1700)});},900);};wait();};cyc();}
const demoPause=()=>{demoTok++;V.spin(0);},demoResume=()=>{if(demoCtx)runDemo(...demoCtx);};
const L={i:0,c:0};
$('#dots').innerHTML=STEPS.map((s,i)=>`<button data-i="${i}" aria-label="${esc(s.title)}">${s.dot}</button>`).join('');
$('#track').innerHTML=STEPS.map((s,i)=>`<article class="slide" data-i="${i}"><p class="kick">${s.kick}</p><h2>${s.title}</h2><p class="goal">${s.goal}</p><ol>${s.how.map(h=>`<li>${h}</li>`).join('')}</ol><div class="cases">${s.cases.map((c,j)=>`<button class="case" data-i="${i}" data-j="${j}"><span class="h">${c.t}<span>Ver no cubo</span></span>${c.d?`<span class="p">${c.d}</span>`:''}${c.alg?`<span class="mvs">${chips(c.alg)}</span>`:''}</button>`).join('')}</div>${s.note?`<div class="note">${s.note}</div>`:''}${s.video?`<a class="vid" href="https://www.youtube.com/watch?v=${s.video}">Assistir ao vídeo deste passo <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17 17 7M9 7h8v8"/></svg></a>`:''}</article>`).join('');
const track=$('#track');
const fitTrack=()=>{const sl=track.children[L.i];if(sl)track.style.height=sl.offsetHeight+'px';};new ResizeObserver(fitTrack).observe(track);
function learnCase(i,j){L.i=i;L.c=j;requestAnimationFrame(fitTrack);$$('.case').forEach(b=>b.classList.toggle('on',+b.dataset.i===i&&+b.dataset.j===j));$$('#dots [data-i]').forEach(b=>b.classList.toggle('on',+b.dataset.i===i));
 const s=STEPS[i];runDemo(s.cases[j].demo,s,`${s.dot.length<3?'Passo '+s.dot+' · ':''}${s.cases[j].t}`);}
function goSlide(i){i=Math.max(0,Math.min(STEPS.length-1,i));track.scrollTo({left:i*track.clientWidth,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});if(i!==L.i)learnCase(i,0);}
$('.carnav').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;goSlide(b.dataset.d?L.i+ +b.dataset.d:+b.dataset.i);});
track.addEventListener('click',e=>{const b=e.target.closest('.case');if(b)learnCase(+b.dataset.i,+b.dataset.j);});
let scT;track.addEventListener('scroll',()=>{clearTimeout(scT);scT=setTimeout(()=>{const i=Math.round(track.scrollLeft/Math.max(1,track.clientWidth));if(i!==L.i&&$('#v-aprender').classList.contains('on'))learnCase(i,0);},140);});
CTRL.aprender={enter(){requestAnimationFrame(()=>{track.scrollLeft=L.i*track.clientWidth;});learnCase(L.i,L.c);},leave:demoPause,pause:demoPause,resume:demoResume};

// ---------- Dicas ----------
const TIPS=[
 {t:'Cruz direto embaixo',d:'Em vez de montar a cruz em cima e virar o cubo (z2), monte-a já embaixo. No começo dá mais trabalho, mas você economiza a virada e já enxerga os cantos da camada de cima. Planeje a cruz antes de girar: ela quase sempre cabe em 8 movimentos ou menos.',demo:{bottomCross:1,mask:'cross',view:'low'}},
 {t:'2ª camada sem pausas',d:'Enquanto executa o algoritmo de um meio, já procure o próximo com os olhos. Existe também a versão abaixo, com o mesmo resultado: use a que seus dedos fizerem mais rápido.',alg:"U R U' R' U' F' U F",demo:{base:'bot',mask:'f2l',seq:"U R U' R' U' F' U F"}},
 {t:'Cruz de cima em um algoritmo',d:'Com a linha deitada, F R U R\' U\' F\' monta a cruz direto. Com o L atrás e à esquerda, use F U R U\' R\' F\'. Assim linha e L saem com um algoritmo só.',alg:"F R U R' U' F'",demo:{base:'bot',mask:'olle',seq:"F R U R' U' F'"}},
 {t:'Antissune: o peixinho ao contrário',d:'Quando o peixinho "nada" para o outro lado, R U R\' U R U2 R\' precisa ser feito duas vezes. O espelho resolve de uma vez.',alg:"L' U' L U' L' U2 L",demo:{base:'bot',mask:'oll',seq:"L' U' L U' L' U2 L"}},
 {t:'Cantos na diagonal de uma vez',d:'Sem faróis, o método pede o algoritmo dos cantos duas vezes. Este troca os cantos da diagonal de uma só vez (ele mexe nos meios de cima, mas eles ainda vão ser arrumados na Minerva).',alg:"F R U' R' U' R U R' F' R U R' U' R' F R F'",demo:{base:'bot',mask:'cp',seq:"F R U' R' U' R U R' F' R U R' U' R' F R F'"}},
 {t:'Meios opostos',d:'Quando os meios de cima estão trocados com o oposto (frente com trás, esquerda com direita), este algoritmo resolve de uma vez, sem Minerva dupla.',alg:HP,demo:{base:'bot',seq:HP}},
 {t:'Meios vizinhos',d:'Para trocar dois pares de meios vizinhos de uma vez.',alg:ZP,demo:{base:'bot',seq:ZP}},
 {t:'Como mexer os dedos',d:'Segure o cubo com os polegares na frente e os outros dedos atrás. Faça o U com o indicador direito empurrando a parte de trás do topo e o U\' com o indicador esquerdo. R e R\' saem do pulso, sem soltar o cubo. Quanto menos você reposicionar as mãos, mais rápido fica.'},
 {t:'Treine com o cronômetro',d:'Devagar e sem pausas é mais rápido do que rápido com pausas. Cronometre, acompanhe a média de 5 e tente baixar um pouquinho a cada semana.',link:1}];
$('#tips').innerHTML=TIPS.map((t,i)=>`<div class="card tip"><h3>${t.t}</h3><p>${t.d}</p>${t.alg?`<div class="mvs" style="margin-bottom:10px">${chips(t.alg)}</div>`:''}${t.demo?`<button class="btn" data-t="${i}">Ver no cubo</button>`:''}${t.link?'<a class="btn" style="display:inline-flex;align-items:center;text-decoration:none" href="#cronometro">Abrir o cronômetro</a>':''}</div>`).join('');
let tipCur=-1;
$('#tips').addEventListener('click',e=>{const b=e.target.closest('[data-t]');if(!b)return;tipCur=+b.dataset.t;$$('#tips [data-t]').forEach(x=>x.classList.toggle('pri',x===b));runDemo(TIPS[tipCur].demo,{},TIPS[tipCur].t);});
CTRL.dicas={enter(){if(tipCur>=0)runDemo(TIPS[tipCur].demo,{},TIPS[tipCur].t);else{demoTok++;V.mask(null);V.spin(0);V.set(BASES.bot());V.view('front');V.tag('Toque em "Ver no cubo" numa dica');}},leave:demoPause,pause:demoPause,resume:()=>{if(tipCur>=0)demoResume();}};

// ---------- Cronômetro ----------
const T={scr:scramble(20),t0:0,run:false,raf:0,list:[]};
try{T.list=JSON.parse(localStorage.getItem('cubo-tempos')||'[]');if(!Array.isArray(T.list))T.list=[];}catch(e){T.list=[];}
const fmt=ms=>{if(ms==null)return'–';const s=ms/1000;return s<60?s.toFixed(2):Math.floor(s/60)+':'+(s%60).toFixed(2).padStart(5,'0');};
function drawTimer(){$('#scr').innerHTML=chips(T.scr);
 const ts=T.list.map(x=>x.t);$('#sBest').textContent=ts.length?fmt(Math.min(...ts)):'–';$('#sN').textContent=ts.length;
 if(ts.length>=5){const l=ts.slice(0,5).sort((a,b)=>a-b).slice(1,4);$('#sAo5').textContent=fmt(l.reduce((a,b)=>a+b,0)/3);}else $('#sAo5').textContent='–';
 $('#hist').innerHTML=T.list.slice(0,12).map((x,i)=>`<tr><td>${T.list.length-i}</td><td class="n"><b>${fmt(x.t)}</b></td><td style="font-size:13px;color:var(--mut)">${esc(x.s)}</td><td><button class="x" data-i="${i}" aria-label="Apagar">✕</button></td></tr>`).join('')||'<tr><td style="color:var(--mut)">Nenhum tempo ainda.</td></tr>';}
const save=()=>{try{localStorage.setItem('cubo-tempos',JSON.stringify(T.list.slice(0,200)));}catch(e){}};
function tick(){$('#clockT').textContent=fmt(performance.now()-T.t0);T.raf=requestAnimationFrame(tick);}
function toggle(){if(!T.run){T.run=true;T.t0=performance.now();$('#clock').classList.add('run');$('#clockS').textContent='Toque ou espaço para parar';tick();}
 else{T.run=false;cancelAnimationFrame(T.raf);const dt=performance.now()-T.t0;$('#clockT').textContent=fmt(dt);$('#clock').classList.remove('run');$('#clockS').textContent='Toque para começar de novo';
  T.list.unshift({t:dt,s:T.scr.join(' ')});save();T.scr=scramble(20);drawTimer();V.set(E.mv(E.solved(),T.scr));}}
$('#clock').addEventListener('click',toggle);
$('#newScr').onclick=()=>{T.scr=scramble(20);drawTimer();V.set(E.mv(E.solved(),T.scr));};
$('#showScr').onclick=()=>{V.stop();V.set(E.solved());V.speed(3);V.play(T.scr,{done:()=>V.speed(1)});};
$('#hist').addEventListener('click',e=>{const b=e.target.closest('[data-i]');if(!b)return;T.list.splice(+b.dataset.i,1);save();drawTimer();});
CTRL.cronometro={enter(){V.mask(null);V.spin(0);V.speed(1);V.tag('Embaralhamento atual');V.view('front');V.set(E.mv(E.solved(),T.scr));drawTimer();},leave(){}};

// ---------- Navegação ----------
const VIEWS=['resolver','aprender','dicas','cronometro'];
function route(){let v=location.hash.slice(1);if(!VIEWS.includes(v))v='resolver';
 if(active&&active!==CTRL[v])active.leave&&active.leave();
 VIEWS.forEach(x=>{$('#v-'+x).classList.toggle('on',x===v);$(`[data-nav="${x}"]`).classList.toggle('on',x===v);});
 active=CTRL[v];V.attach($('#v-'+v+' .stage'));active.enter();}
addEventListener('hashchange',route);
addEventListener('keydown',e=>{if(e.target.closest&&e.target.closest('input,textarea,select'))return;const v=VIEWS.find(x=>$('#v-'+x).classList.contains('on'));
 if(v==='resolver'&&RS.mode==='play'){if(e.key==='ArrowRight'){e.preventDefault();$('#bNext').click();}else if(e.key==='ArrowLeft'){e.preventDefault();$('#bPrev').click();}else if(e.key===' '&&e.target===document.body){e.preventDefault();$('#bPlay').click();}}
 else if(v==='aprender'&&(e.key==='ArrowRight'||e.key==='ArrowLeft')&&!e.target.closest('.track')){e.preventDefault();goSlide(L.i+(e.key==='ArrowRight'?1:-1));}
 else if(v==='cronometro'&&e.code==='Space'){e.preventDefault();if(e.target.tagName==='BUTTON')e.target.blur();if(!e.repeat)toggle();}});
$('#clock').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();toggle();}});
route();
}
