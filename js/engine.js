// ===== Motor do cubo (adesivos) + solucionador pelo método de camadas =====
const FACES='URFDLB';
const NORM={U:[0,1,0],D:[0,-1,0],R:[1,0,0],L:[-1,0,0],F:[0,0,1],B:[0,0,-1]};
const POS=[],NOR=[],IDX={};
for(let fi=0;fi<6;fi++){const F=FACES[fi];for(let r=0;r<3;r++)for(let c=0;c<3;c++){let p;
 if(F==='U')p=[c-1,1,r-1];else if(F==='R')p=[1,1-r,1-c];else if(F==='F')p=[c-1,1-r,1];
 else if(F==='D')p=[c-1,-1,1-r];else if(F==='L')p=[-1,1-r,c-1];else p=[1-c,1-r,-1];
 const i=fi*9+r*3+c;POS[i]=p;NOR[i]=NORM[F];IDX[p+'|'+NORM[F]]=i;}}
const HOME={U:'W',R:'R',F:'G',D:'Y',L:'O',B:'B'};
const solved=()=>Array.from({length:54},(_,i)=>HOME[FACES[Math.floor(i/9)]]);
function rot(v,ax,d){const[x,y,z]=v;
 if(ax===0)return d<0?[x,z,-y]:[x,-z,y];
 if(ax===1)return d<0?[-z,y,x]:[z,y,-x];
 return d<0?[y,-x,z]:[-y,x,z];}
const BASE={R:[0,v=>v[0]===1,-1],L:[0,v=>v[0]===-1,1],U:[1,v=>v[1]===1,-1],D:[1,v=>v[1]===-1,1],
 F:[2,v=>v[2]===1,-1],B:[2,v=>v[2]===-1,1],M:[0,v=>v[0]===0,1],E:[1,v=>v[1]===0,1],S:[2,v=>v[2]===0,-1],
 x:[0,()=>true,-1],y:[1,()=>true,-1],z:[2,()=>true,-1]};
const PERM={};
for(const k in BASE){const[ax,inL,d]=BASE[k];const p=[];
 for(let i=0;i<54;i++)p[i]=inL(POS[i])?IDX[rot(POS[i],ax,d)+'|'+rot(NOR[i],ax,d)]:i;
 const p2=p.map(j=>p[j]),p3=p.map(j=>p2[j]);PERM[k]=p;PERM[k+'2']=p2;PERM[k+"'"]=p3;}
const parse=s=>Array.isArray(s)?s.filter(Boolean):String(s).trim().split(/\s+/).filter(Boolean);
function mv(f,s){for(const m of parse(s)){const p=PERM[m],g=new Array(54);for(let i=0;i<54;i++)g[p[i]]=f[i];f=g;}return f;}
const invMove=m=>m.endsWith("'")?m.slice(0,-1):m.endsWith('2')?m:m+"'";
const inv=s=>parse(s).slice().reverse().map(invMove);
const isSolved=f=>{for(let k=0;k<6;k++)for(let j=0;j<9;j++)if(f[k*9+j]!==f[k*9+4])return false;return true;};
// ---- peças ----
const posOf=n=>{const p=[0,0,0];for(const ch of n)NORM[ch].forEach((v,i)=>p[i]+=v);return p;};
const st=(n,F)=>IDX[posOf(n)+'|'+NORM[F]];
const EDGES=['UF','UR','UB','UL','DF','DR','DB','DL','FR','FL','BR','BL'];
const CORNERS=['UFR','URB','UBL','ULF','DRF','DFL','DLB','DBR'];
const ctr=(f,F)=>f[FACES.indexOf(F)*9+4];
const faceOf=(f,c)=>{for(const F of FACES)if(ctr(f,F)===c)return F;return null;};
const colorsAt=(f,n)=>[...n].map(F=>f[st(n,F)]);
function findPiece(f,cols){for(const n of cols.length===2?EDGES:CORNERS){const c=colorsAt(f,n);if(cols.every(x=>c.includes(x)))return n;}return null;}
const homeOf=(f,cols)=>cols.map(c=>faceOf(f,c)).join('');
function pieceOK(f,cols){const h=homeOf(f,cols);return[...h].every((F,i)=>f[st(h,F)]===cols[i]);}
// ---- validação ----
const OPP={U:'D',D:'U',R:'L',L:'R',F:'B',B:'F'};
const det=(a,b,c)=>a[0]*(b[1]*c[2]-b[2]*c[1])-a[1]*(b[0]*c[2]-b[2]*c[0])+a[2]*(b[0]*c[1]-b[1]*c[0]);
function parity(p){let s=0;const seen=[];for(let i=0;i<p.length;i++){if(seen[i])continue;let j=i,l=0;while(!seen[j]){seen[j]=1;j=p[j];l++;}s+=l-1;}return s%2;}
const CNAME={W:'branco',Y:'amarelo',G:'verde',B:'azul',R:'vermelho',O:'laranja'};
function validate(f){const cnt={};for(const c of f)cnt[c]=(cnt[c]||0)+1;
 if(cnt['?'])return{ok:false,msg:`Ainda faltam ${cnt['?']} quadradinhos para pintar.`};
 for(const c of 'WYGBRO')if(cnt[c]!==9)return{ok:false,msg:`O ${CNAME[c]} aparece ${cnt[c]||0} vezes — cada cor precisa aparecer 9 vezes.`};
 const ep=[],cp=[];let eo=0,co=0;
 for(const n of EDGES){const H=colorsAt(f,n).map(c=>faceOf(f,c));
  if(H[0]===H[1]||OPP[H[0]]===H[1])return{ok:false,msg:'Há um meio (peça de 2 cores) com uma combinação de cores que não existe.'};
  const home=EDGES.findIndex(e=>[...e].every(x=>H.includes(x)));if(ep.includes(home))return{ok:false,msg:'Há dois meios com as mesmas cores.'};ep.push(home);
  const pf=[...n].find(x=>'UD'.includes(x))||[...n].find(x=>'FB'.includes(x));
  const prim=H.find(x=>'UD'.includes(x))||H.find(x=>'FB'.includes(x));
  if(faceOf(f,f[st(n,pf)])!==prim)eo++;}
 for(const n of CORNERS){const H=colorsAt(f,n).map(c=>faceOf(f,c));
  if(new Set(H.map(x=>'UD'.includes(x)?0:'RL'.includes(x)?1:2)).size<3)return{ok:false,msg:'Há um canto (peça de 3 cores) com uma combinação de cores que não existe.'};
  if(det(NORM[H[0]],NORM[H[1]],NORM[H[2]])!==det(NORM[n[0]],NORM[n[1]],NORM[n[2]]))return{ok:false,msg:'Há um canto com as cores numa ordem impossível — confira os adesivos dele.'};
  const home=CORNERS.findIndex(c=>[...c].every(x=>H.includes(x)));if(cp.includes(home))return{ok:false,msg:'Há dois cantos com as mesmas cores.'};cp.push(home);
  co+=H.findIndex(x=>'UD'.includes(x));}
 if(eo%2)return{ok:false,msg:'Um meio está virado ao contrário. Confira as cores; se o cubo já foi desmontado, uma peça pode ter sido encaixada invertida.'};
 if(co%3)return{ok:false,msg:'Um canto está girado. Confira as cores; se o cubo já foi desmontado, um canto pode ter sido encaixado torto.'};
 if(parity(ep)!==parity(cp))return{ok:false,msg:'Parece que duas peças estão trocadas. Confira as cores com calma.'};
 return{ok:true};}
// ---- Passo 1: cruz (uma peça por vez, busca curta) ----
const FM=[];for(const F of 'URFDLB')for(const s of ['',"'",'2'])FM.push(F+s);
function distTable(a0,b0){const d=new Map(),q=[[a0,b0]];d.set(a0*54+b0,0);
 for(let qi=0;qi<q.length;qi++){const[a,b]=q[qi],k=d.get(a*54+b);for(const m of FM){const p=PERM[m],key=p[a]*54+p[b];if(!d.has(key)){d.set(key,k+1);q.push([p[a],p[b]]);}}}return d;}
function solveEdges(T){const s0=[];T.forEach(t=>s0.push(t.w,t.o));
 const h=s=>{let m=0;for(let i=0;i<T.length;i++){const v=T[i].tab.get(s[2*i]*54+s[2*i+1]);if(v>m)m=v;}return m;};
 const path=[];
 function dfs(s,g,b,last){const hv=h(s);if(hv===0)return true;if(g+hv>b)return false;
  for(const m of FM){const F=m[0];if(F===last||(OPP[F]===last&&'URF'.includes(F)))continue;
   const p=PERM[m];path.push(m);if(dfs(s.map(l=>p[l]),g+1,b,F))return true;path.pop();}return false;}
 for(let b=0;b<=12;b++)if(dfs(s0,0,b,''))return path.slice();return[];}
function stageCross(f){const subs=[],W=ctr(f,'U');
 const T=['F','R','B','L'].map(X=>{const e=[W,ctr(f,X)],ga=st('U'+X,'U'),gb=st('U'+X,X);return{e,tab:distTable(ga,gb)};});
 const locs=t=>{const n=findPiece(f,t.e),c=colorsAt(f,n);return{...t,w:st(n,n[c.indexOf(t.e[0])]),o:st(n,n[c.indexOf(t.e[1])])};};
 const done=[];
 while(done.length<4){let best=null;
  for(const t of T){if(done.includes(t))continue;const sol=solveEdges([...done,t].map(locs));if(!best||sol.length<best.sol.length)best={t,sol};}
  done.push(best.t);f=mv(f,best.sol);subs.push({pre:[],alg:best.sol,kase:best.sol.length?'cruz':'pronta',piece:best.t.e});}
 return{f,subs};}
// ---- auxiliares ----
const ROTS=['','y',"y'",'y2'],AUF=['','U',"U'",'U2'];
const pick=(f,list,test)=>{for(const r of list)if(test(r?mv(f,r):f))return r;return '';};
const P=s=>parse(s);
// ---- Passo 2: 1ª camada (branco embaixo) ----
const AL={c_dir:"R U R'",c_fre:"F' U' F",c_cima:"R U2 R' U'",e_dir:"U R U R' U' F' U' F",e_esq:"U' L' U' L U F U F'",
 oll:"F U R U' R' F'",sune:"R U R' U R U2 R'",aperm:"R' F R' B2 R F' R' B2 R2",ua:"F2 U M' U2 M U F2",ub:"F2 U' M' U2 M U' F2"};
function stageCorners(f){const subs=[],Wc=ctr(f,'D');
 for(let guard=0;guard<24;guard++){const cs=['F','R','B','L'].map((X,i,a)=>[Wc,ctr(f,X),ctr(f,a[(i+1)%4])]);
  if(cs.every(c=>pieceOK(f,c)))break;
  let c=cs.find(c=>!pieceOK(f,c)&&findPiece(f,c)[0]==='U'),pre,alg,kase;
  if(c){const r=pick(f,ROTS,g=>homeOf(g,c).split('').sort().join('')==='DFR');let g=r?mv(f,r):f;
   const u=pick(g,AUF,h=>findPiece(h,c)==='UFR');g=u?mv(g,u):g;
   const wf=['U','F','R'].find(F=>g[st('UFR',F)]===Wc);
   kase=wf==='R'?'c_dir':wf==='F'?'c_fre':'c_cima';pre=P([r,u].join(' '));alg=P(AL[kase]);}
  else{c=cs.find(c=>!pieceOK(f,c));pre=P(pick(f,ROTS,g=>findPiece(g,c)==='DRF'));kase='c_preso';alg=P(AL.c_dir);}
  f=mv(f,[...pre,...alg]);subs.push({pre,alg,kase,piece:c});}
 return{f,subs};}
// ---- Passo 3: 2ª camada ----
function stageEdges(f){const subs=[];
 for(let guard=0;guard<24;guard++){const E=['F','R','B','L'].map((X,i,a)=>[ctr(f,X),ctr(f,a[(i+1)%4])]);
  if(E.every(e=>pieceOK(f,e)))break;
  let e=null,n;for(const x of E){n=findPiece(f,x);if(n[0]==='U'){e=x;break;}}
  let pre,alg,kase;
  if(e){const side=f[st(n,n[1])],top=f[st(n,'U')];
   const r=pick(f,ROTS,g=>ctr(g,'F')===side);let g=r?mv(f,r):f;
   const u=pick(g,AUF,h=>findPiece(h,e)==='UF'&&h[st('UF','F')]===side);g=u?mv(g,u):g;
   kase=ctr(g,'R')===top?'e_dir':'e_esq';pre=P([r,u].join(' '));alg=P(AL[kase]);e=[side,top];}
  else{e=E.find(x=>!pieceOK(f,x));pre=P(pick(f,ROTS,g=>findPiece(g,e)==='FR'));kase='e_preso';alg=P(AL.e_dir);}
  f=mv(f,[...pre,...alg]);subs.push({pre,alg,kase,piece:e});}
 return{f,subs};}
// ---- Passos 4 a 7: última camada ----
const yE=f=>['UF','UR','UB','UL'].filter(n=>f[st(n,'U')]===ctr(f,'U'));
const yC=f=>['UFR','URB','UBL','ULF'].filter(n=>f[st(n,'U')]===ctr(f,'U'));
function crossShape(f){const y=yE(f);if(!y.length)return'ponto';if(y.length===4)return'pronta';const s=y.join();return(s==='UF,UB'||s==='UR,UL')?'linha':'L';}
const llCorners=['UFR','URB','UBL','ULF'];
const cornersOK=f=>AUF.some(u=>{const g=u?mv(f,u):f;return llCorners.every(n=>pieceOK(g,colorsAt(g,n)));});
const HL={F:['UFR','ULF'],R:['UFR','URB'],B:['URB','UBL'],L:['UBL','ULF']};
const hasHL=(f,X)=>f[st(HL[X][0],X)]===f[st(HL[X][1],X)];
function loop(f,step){const subs=[];for(let i=0;i<6;i++){const s=step(f);if(!s)break;f=mv(f,[...s.pre,...s.alg]);subs.push(s);}return{f,subs};}
const stageTopCross=f=>loop(f,f=>{const sh=crossShape(f);if(sh==='pronta')return null;let u='';
 if(sh==='L')u=pick(f,AUF,g=>yE(g).join()==='UB,UL');if(sh==='linha')u=pick(f,AUF,g=>yE(g).join()==='UR,UL');
 return{pre:P(u),alg:P(AL.oll),kase:'x_'+sh};});
const stageTopFace=f=>loop(f,f=>{const k=yC(f).length,Y=ctr(f,'U');if(k===4)return null;
 const u=pick(f,AUF,g=>g[st('ULF',k===1?'U':k===0?'L':'F')]===Y);return{pre:P(u),alg:P(AL.sune),kase:'o_'+k};});
function stageCornersLL(f){const r=loop(f,f=>{if(cornersOK(f))return null;
  const any=['F','R','B','L'].some(X=>hasHL(f,X));const u=any?pick(f,AUF,g=>hasHL(g,'B')):'';
  return{pre:P(u),alg:P(AL.aperm),kase:any?'p_farois':'p_diag'};});
 const u=pick(r.f,AUF,g=>llCorners.every(n=>pieceOK(g,colorsAt(g,n))));
 if(u){r.subs.push({pre:[],alg:[u],kase:'p_alinhar'});r.f=mv(r.f,u);}return r;}
const okEdges=f=>['UF','UR','UB','UL'].filter(n=>pieceOK(f,colorsAt(f,n)));
const stageMinerva=f=>loop(f,f=>{if(isSolved(f))return null;const k=okEdges(f).length;
 if(k===0)return{pre:[],alg:P(AL.ua),kase:'m_zero'};
 const r=pick(f,ROTS,g=>okEdges(g).includes('UB'));const g=r?mv(f,r):f;
 const a=g[st('UF','F')]===ctr(g,'L');return{pre:P(r),alg:P(a?AL.ua:AL.ub),kase:a?'m_a':'m_b'};});
function solve(f){const stages=[];let r;
 r=stageCross(f);stages.push({id:1,subs:r.subs});f=mv(r.f,'z2');
 r=stageCorners(f);stages.push({id:2,subs:[{pre:[],alg:['z2'],kase:'virar'},...r.subs]});f=r.f;
 for(const[id,fn]of[[3,stageEdges],[4,stageTopCross],[5,stageTopFace],[6,stageCornersLL],[7,stageMinerva]]){r=fn(f);stages.push({id,subs:r.subs});f=r.f;}
 return{stages,f};}
const ENGINE={FACES,POS,NOR,IDX,HOME,PERM,solved,mv,inv,invMove,parse,isSolved,st,ctr,faceOf,colorsAt,findPiece,pieceOK,validate,solve,
 stageCross,stageCorners,stageEdges,stageTopCross,stageTopFace,stageCornersLL,stageMinerva,AL,AUF,ROTS,crossShape,yC,EDGES,CORNERS};
if(typeof module!=='undefined')module.exports=ENGINE;
