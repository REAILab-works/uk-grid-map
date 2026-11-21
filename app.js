(function(){
'use strict';
var GROUPS=[['Storage','#9C8CD4','储能'],['Solar + storage','#D9A85B','光伏+储能'],['Solar','#E8D49A','光伏'],['Onshore wind','#7DBB9C','陆上风电'],['Offshore wind','#6E9BD8','海上风电'],['Gas & thermal','#C97B66','燃气与火电'],['Nuclear','#C48BB0','核电'],['Hydro & marine','#6BB5B5','水电与海洋能'],['Demand','#8F98A6','用电负荷'],['Other','#646D7B','其他']];
var KV={400:{c:'#A9BCD0',zh:'400 kV',en:'400 kV'},275:{c:'#5F7088',zh:'275 kV',en:'275 kV'}};
var COL={},ZH={};GROUPS.forEach(function(g){COL[g[0]]=g[1];ZH[g[0]]=g[2]});
var T={
 en:{eyebrow:'GB grid queue',live:'DATA',loading:'Reading the NESO TEC register…',waiting:'waiting to connect to Great Britain’s transmission grid.',only:'Only',connected:'is connected today.',conn:'Connected',wait:'Waiting',by:'Contracted to connect by',all:'All years',play:'Play',pause:'Pause',top:'Longest queues · MW',back:'← Back',projects:'projects',project:'project',waitingMW:'waiting',allStatus:'All statuses',foot:'Dashed rings are planned connection nodes with no substation yet, placed at the approximate area. Lines are a schematic of 400 kV and 275 kV circuits; the moving light is decorative and does not show power flow.',approx:'approximate location',area:'approximate area · planned node',src:function(d,n,p){return 'Source: <a href="https://www.neso.energy/data-portal/transmission-entry-capacity-tec-register" target="_blank" rel="noopener">NESO TEC register</a>, snapshot of '+d+'. '+n+' queued entries in view; '+p+'% of their MW placed on the map. Circuits: NESO ETYS 2024 Appendix B via <a href="https://github.com/andrewlyden/PyPSA-GB" target="_blank" rel="noopener">PyPSA-GB</a> (MIT). Locations: © OpenStreetMap contributors (ODbL), PyPSA-GB, Nominatim. Supported by National Energy SO Open Data. Independent project, not endorsed by NESO.'},tour:'▶ 30-second tour',filt:'queued under the current filter.',err:'Data snapshot is missing.',search:'Search substation, project or developer',none:'No match'},
 zh:{eyebrow:'英国电网并网排队',live:'数据',loading:'正在读取 NESO TEC 登记表…',waiting:'正在排队，等待接入英国输电网。',only:'目前已并网的只有',connected:'。',conn:'已并网',wait:'排队中',by:'合同并网年份截至',all:'全部年份',play:'播放',pause:'暂停',top:'排队最长的变电站 · MW',back:'← 返回',projects:'个项目',project:'个项目',waitingMW:'排队',allStatus:'全部状态',foot:'虚线圆圈是尚未建成的规划接入节点，位置为大致区域。线路为 400 kV 和 275 kV 输电回路的示意连线；流动光点仅为装饰，不代表潮流方向。',approx:'大致位置',area:'大致区域 · 规划节点',src:function(d,n,p){return '数据：<a href="https://www.neso.energy/data-portal/transmission-entry-capacity-tec-register" target="_blank" rel="noopener">NESO TEC 登记表</a>，'+d+' 版快照。当前视图 '+n+' 条排队记录，其中 '+p+'% 的容量已定位到地图。线路：NESO ETYS 2024 附录 B，经 <a href="https://github.com/andrewlyden/PyPSA-GB" target="_blank" rel="noopener">PyPSA-GB</a>（MIT）整理。位置：© OpenStreetMap 贡献者（ODbL）、PyPSA-GB、Nominatim。Supported by National Energy SO Open Data。独立项目，未获 NESO 背书。'},tour:'▶ 30 秒看懂',filt:'符合当前筛选条件的排队容量。',err:'缺少数据快照。',search:'搜索变电站、项目或开发商',none:'没有匹配结果'}
};
var lang='en';try{lang=localStorage.getItem('gbq-lang')||(/^zh/i.test(navigator.language)?'zh':'en')}catch(e){}
function t(k){return T[lang][k]}
function gname(g){return lang==='zh'?ZH[g]:g}
function $(id){return document.getElementById(id)}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function gw(mw){return (mw/1000).toLocaleString('en-GB',{maximumFractionDigits:1,minimumFractionDigits:1})}
function mwf(mw){return Math.round(mw).toLocaleString('en-GB')}
function norm(s){return (s||'').toLowerCase().replace(/\d+(\s*\/\s*\d+)*\s*kv/g,' ').replace(/\b(substation|sub station|gsp|grid supply point|s\/s|switching station|converter station|tee|\(.*?\))\b/g,' ').replace(/&/g,' and ').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim()}
function shortName(s){return String(s).replace(/\s*\d+(\s*\/\s*\d+)*\s*kv.*$/i,'').replace(/\s+(GSP|Substation|S\/S)$/i,'').trim()}
function classify(pt){
  var a=String(pt||'').split(';').map(function(x){return x.trim()});
  function has(p){return a.some(function(x){return x.indexOf(p)===0})}
  if(has('Wind Offshore'))return 'Offshore wind';
  if(has('Wind Onshore'))return 'Onshore wind';
  if(has('PV'))return has('Energy Storage')?'Solar + storage':'Solar';
  if(has('Energy Storage')||has('LAES'))return 'Storage';
  if(has('Nuclear'))return 'Nuclear';
  if(has('CCGT')||has('OCGT')||has('CHP')||has('Gas')||has('Thermal')||has('Oil')||has('Biomass')||has('Waste')||has('Hydrogen'))return 'Gas & thermal';
  if(has('Hydro')||has('Pump Storage')||has('Tidal'))return 'Hydro & marine';
  if(has('Demand'))return 'Demand';
  return 'Other';
}
var SUBS={},NODES={};
String(window.SUBS_RAW||'').split('\n').forEach(function(l){var p=l.split('|');if(p.length>=3)SUBS[p[0]]=[+p[1],+p[2],p[3]||'x']});
String(window.NODES_RAW||'').split('\n').forEach(function(l){var p=l.split('|');if(p.length>=3)NODES[p[0]]=[+p[1],+p[2],'a',p[3]||p[0]]});
function mobile(){return window.innerWidth<=760}
function guard(lat,to){return !((to==='SHET'&&lat<55.2)||(to==='SPT'&&(lat<54.6||lat>56.7))||(to==='NGET'&&lat>55.9))}
function locate(site,to){
  var k=norm(site),c=SUBS[k]||SUBS[k.replace(/^new /,'')];
  if(c&&guard(c[0],to))return c;
  var m=k.match(/^(.*?)\s*connection node/);
  if(m&&NODES[m[1]])return NODES[m[1]];
  return null;
}

var state={groups:{},status:'all',cust:null,sel:null,year:null,playing:null,kv:{400:true,275:true}};
var LN={en:{circ:'circuits',circ1:'circuit',rating:'winter rating',len:'route',links:'Connected circuits',approxLine:'one end located approximately',grid:'Grid'},zh:{circ:'回路',circ1:'回路',rating:'冬季额定容量',len:'线路长度',links:'相连回路',approxLine:'一端为大致位置',grid:'电网'}};
function ln(k){return LN[lang][k]}
GROUPS.forEach(function(g){state.groups[g[0]]=true});
var nEntries=0,dataDate='',rows=[],connectedMW=0,readAt='',map,layer,pulses,lines,lastList=[],years=[],nRows=0,pctPlaced=0;

function passBase(r){return (state.status==='all'||r.status===state.status)&&(state.cust==null||r.cust===state.cust)&&(state.year==null||r.y<=state.year)}

function filtered(){return state.status!=='all'||state.cust!=null||state.year!=null||GROUPS.some(function(g){return !state.groups[g[0]]})}
function hero(tot){
  var all=tot+connectedMW,yrs=years.length?years:[0];
  $('hero').innerHTML='<div class="toprow"><span class="eyebrow">'+t('eyebrow')+'</span><span class="right"><button class="lang" id="lang">'+(lang==='en'?'中文':'EN')+'</button><span class="live"><i></i>'+t('live')+' '+esc(dataDate)+'</span></span></div>'+
    (rows.length?'<h1><span id="big">'+gw(lastTot==null?0:lastTot)+'</span><small>GW</small></h1>'+
    (filtered()?'<p class="lede">'+t('filt')+'</p>':'<p class="lede">'+t('waiting')+' <br>'+t('only')+' <span class="mono" style="color:var(--text)">'+gw(connectedMW)+' GW</span> '+t('connected')+'</p>')+
    '<button class="tour" id="tourbtn">'+t('tour')+'</button>'+(filtered()?'':'<div class="ratio"><i style="width:'+(all?connectedMW/all*100:0).toFixed(1)+'%;background:var(--accent)"></i><i style="flex:1;background:rgba(255,255,255,.14)"></i></div>'+
    '<div class="ratio-key"><span>'+t('conn')+'</span><span>'+t('wait')+'</span></div>')+
    '<div class="yr"><div class="yrhead"><span>'+t('by')+'</span><b class="mono" id="yrv">'+(state.year==null?t('all'):state.year)+'</b></div>'+
    '<div class="yrrow"><button class="play" id="play" aria-label="'+(state.playing?t('pause'):t('play'))+'">'+(state.playing?'❚❚':'▶')+'</button><input type="range" id="yr" min="'+yrs[0]+'" max="'+yrs[yrs.length-1]+'" step="1" value="'+(state.year==null?yrs[yrs.length-1]:state.year)+'"></div></div>'
    :'<h1>—</h1><p class="lede">'+t('loading')+'</p>');
  $('lang').onclick=function(){lang=lang==='en'?'zh':'en';try{localStorage.setItem('gbq-lang',lang)}catch(e){}document.documentElement.lang=lang==='zh'?'zh-CN':'en';render(true)};
  var yr=$('yr');if(yr){yr.oninput=function(){stop();var v=+yr.value;state.year=v>=years[years.length-1]?null:v;state.sel=null;render(true)}}
  var tb=$('tourbtn');if(tb)tb.onclick=function(){tourStart()};
  var pl=$('play');if(pl)pl.onclick=function(){state.playing?stop():play()};
  if(rows.length)tween(tot);
}
var lastTot=null,raf=0,intro=true,reduce=false;
try{reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}
function tween(to){
  var el=$('big');if(!el)return;var from=lastTot==null?0:lastTot;lastTot=to;
  if(from===to||reduce||!window.requestAnimationFrame){el.textContent=gw(to);return}
  cancelAnimationFrame(raf);var t0=null,dur=from===0?1200:450;
  function step(now){if(t0==null)t0=now;var k=Math.min(1,(now-t0)/dur);k=1-Math.pow(1-k,3);var e=$('big');if(e)e.textContent=gw(from+(to-from)*k);if(k<1)raf=requestAnimationFrame(step)}
  raf=requestAnimationFrame(step);
}
function stop(){if(state.playing){clearInterval(state.playing);state.playing=null;var p=$('play');if(p)p.textContent='▶'}}
function play(){
  var i=0;state.year=years[0];state.sel=null;render(true);
  state.playing=setInterval(function(){i++;if(i>=years.length){stop();state.year=null;render(true);return}state.year=years[i];render(true)},700);
  var p=$('play');if(p)p.textContent='❚❚';
}

function buildLegend(){
  var base=rows.filter(passBase),by={},statuses={};
  base.forEach(function(r){by[r.group]=(by[r.group]||0)+r.mw});
  rows.forEach(function(r){statuses[r.status]=1});
  var h='';
  GROUPS.forEach(function(g){
    var v=by[g[0]]||0;if(v<=0)return;
    h+='<div class="chip'+(state.groups[g[0]]?'':' off')+'" data-g="'+esc(g[0])+'"><span class="sw" style="background:'+g[1]+'"></span>'+esc(gname(g[0]))+'<span class="gw">'+gw(v)+'</span></div>';
  });
  h+='<span class="sep"></span>';
  [400,275].forEach(function(v){h+='<div class="chip kv'+(state.kv[v]?'':' off')+'" data-kv="'+v+'"><span class="ln" style="background:'+KV[v].c+'"></span>'+v+' kV</div>'});
  h+='<span class="sep"></span><select id="fStatus" aria-label="Project status"><option value="all">'+t('allStatus')+'</option>'+Object.keys(statuses).sort().map(function(s){return '<option value="'+esc(s)+'"'+(state.status===s?' selected':'')+'>'+esc(s)+'</option>'}).join('')+'</select>';
  var el=$('legend');el.innerHTML=h;
  el.querySelectorAll('.chip[data-g]').forEach(function(c){c.onclick=function(){var g=c.getAttribute('data-g');state.groups[g]=!state.groups[g];state.sel=null;render(true)}});
  el.querySelectorAll('.chip[data-kv]').forEach(function(c){c.onclick=function(){var v=+c.getAttribute('data-kv');state.kv[v]=!state.kv[v];c.classList.toggle('off',!state.kv[v]);styleLines()}});
  $('fStatus').onchange=function(e){state.status=e.target.value;state.sel=null;render(true)};
}

function render(rebuild){
  if(rebuild)buildLegend();
  var tot=0,placed=0,spots={},n=0;
  rows.forEach(function(r){
    if(!passBase(r)||!state.groups[r.group])return;
    n++;tot+=r.mw;
    if(r.loc){placed+=r.mw;var k=r.loc[0]+','+r.loc[1];var s=spots[k]||(spots[k]={loc:r.loc,q:r.loc[2],mw:0,by:{},rows:[],name:r.loc[2]==='a'?r.loc[3]:r.site});s.mw+=r.mw;s.by[r.group]=(s.by[r.group]||0)+r.mw;s.rows.push(r);if(s.q!=='a'&&r.site.length<s.name.length)s.name=r.site}
  });
  nRows=n;pctPlaced=tot?Math.round(placed/tot*100):0;
  hero(tot);
  layer.clearLayers();pulses.clearLayers();
  var list=Object.keys(spots).map(function(k){return spots[k]}).sort(function(a,b){return b.mw-a.mw});
  list.slice().reverse().forEach(function(s,ix){
    var top='Other',m=-1;Object.keys(s.by).forEach(function(g){if(s.by[g]>m){m=s.by[g];top=g}});
    s.top=top;var col=COL[top],area=s.q==='a';
    var c=L.circleMarker([s.loc[0],s.loc[1]],{radius:mobile()?2+Math.sqrt(s.mw)*0.12:3+Math.sqrt(s.mw)*0.22,color:col,weight:area?1.2:.8,opacity:area?.9:.95,dashArray:area?'3 4':null,fillColor:col,fillOpacity:area?.06:.62,className:'b'});
    var label=area?(lang==='zh'?s.name+' 规划节点':s.name.replace(/\b\w/g,function(x){return x.toUpperCase()})+' connection nodes'):shortName(s.name);
    s.label=label;
    var note=area?t('area'):(s.q==='n'||s.q==='g'?t('approx'):'');
    c.bindTooltip('<div class="tt"><b>'+esc(label)+'</b><span>'+mwf(s.mw)+' MW · '+esc(gname(top))+(note?' · '+esc(note):'')+'</span></div>',{direction:'top',offset:[0,-4]});
    c.on('click',function(){select(s)});
    c.addTo(layer);
    var p=c.getElement();if(p){p.style.color=col;if(intro)p.style.animationDelay=Math.min(1000,ix*2)+'ms'}
  });
  list.filter(function(s){return s.q!=='a'}).slice(0,3).forEach(function(s){L.marker([s.loc[0],s.loc[1]],{interactive:false,keyboard:false,icon:L.divIcon({className:'pulse',html:'<i></i><i></i>',iconSize:[0,0]})}).addTo(pulses)});
  var lab=[];list.filter(function(s){return s.q!=='a'}).forEach(function(s){if(lab.length>=(mobile()?3:5)||lab.some(function(o){return Math.abs(o.loc[0]-s.loc[0])<0.7&&Math.abs(o.loc[1]-s.loc[1])<1.6}))return;lab.push(s)});
  lab.forEach(function(s){
    L.tooltip({permanent:true,direction:'right',offset:[10,0],className:'lbl',interactive:false}).setLatLng([s.loc[0],s.loc[1]]).setContent('<b>'+esc(s.label)+'</b> '+gw(s.mw)+' GW').addTo(pulses);
  });
  lastList=list;
  readAt=dataDate?new Date(dataDate+'T12:00:00').toLocaleDateString(lang==='zh'?'zh-CN':'en-GB',{day:'numeric',month:'short',year:'numeric'}):'';
  $('src').innerHTML=T[lang].src(esc(readAt),n.toLocaleString('en-GB'),pctPlaced);
  if(state.sel){var still=list.filter(function(s){return s.loc===state.sel.loc})[0];state.sel=still||null}
  renderSide();
}

function select(s){stop();state.sel=s;$('side').classList.remove('collapsed');map.flyTo([s.loc[0],s.loc[1]],Math.max(map.getZoom(),8),{duration:.8});renderSide()}

function renderSide(){
  styleLines();
  var el=$('side'),h='<button class="handle" id="handle" aria-label="Expand list"></button>',list=lastList;
  if(state.sel){
    var s=state.sel,mix=Object.keys(s.by).sort(function(a,b){return s.by[b]-s.by[a]});
    h+='<button class="back" id="back">'+t('back')+'</button><p class="dname">'+esc(s.label)+'</p>';
    if(s.q==='a'||s.q==='n'||s.q==='g')h+='<p class="tag">'+esc(s.q==='a'?t('area'):t('approx'))+'</p>';
    h+='<p class="dsum"><b>'+mwf(s.mw)+' MW</b> '+t('waitingMW')+' · '+s.rows.length+' '+(s.rows.length===1?t('project'):t('projects'))+'</p>';
    h+='<div class="mix">'+mix.map(function(g){return '<i title="'+esc(gname(g))+': '+mwf(s.by[g])+' MW" style="display:block;width:'+(s.by[g]/s.mw*100).toFixed(1)+'%;background:'+COL[g]+'"></i>'}).join('')+'</div>';
    var cn=connected();
    if(cn.length){
      h+='<p class="sec" style="margin-top:16px">'+ln('links')+'</p><div class="links">';
      cn.forEach(function(l){var other=near([l[0],l[1]],s.loc)?l[8]:l[7];h+='<div class="lk"><span class="ln" style="background:'+KV[l[4]].c+'"></span><span class="nm">'+esc(other)+'</span><span class="mono">'+l[4]+' kV'+(l[9]?' · '+mwf(l[9])+' MVA':'')+'</span></div>'});
      h+='</div><p class="sec" style="margin-top:16px">TEC</p>';
    }
    s.rows.slice().sort(function(a,b){return b.mw-a.mw}).forEach(function(r){
      h+='<div class="proj"><div class="t"><span><span class="dot" style="background:'+COL[r.group]+'"></span>'+esc(r.name)+'</span><span>'+mwf(r.mw)+'</span></div>'+
        '<div class="m">'+esc(r.status)+' · '+esc(r.y||'n/a')+' · '+esc(r.cust)+(s.q==='a'?' · '+esc(shortName(r.site)):'')+'</div></div>';
    });
  }else{
    h+='<p class="sec">'+t('top')+'</p><input id="q" type="search" autocomplete="off" placeholder="'+esc(t('search'))+'" value="'+esc(state.query||'')+'"><div id="res"></div>';
    h+='<p class="foot">'+t('foot')+'</p><p class="foot msrc">'+$('src').innerHTML+'</p>';
  }
  el.innerHTML=h;el.scrollTop=0;
  var b=$('back');if(b)b.onclick=function(){state.sel=null;renderSide()};
  var hd=$('handle');if(hd)hd.onclick=function(){el.classList.toggle('collapsed')};
  var q=$('q');if(q){q.oninput=function(){state.query=q.value;fillRes()};fillRes()}
}
function fillRes(){
  var list=lastList,q=(state.query||'').toLowerCase().trim(),h='';
  var mx=0;var pts=q?list.filter(function(s){return s.label.toLowerCase().indexOf(q)>=0||s.rows.some(function(r){return (r.name+' '+r.cust+' '+r.site).toLowerCase().indexOf(q)>=0})}):list.filter(function(s){return s.q!=='a'});
  pts.slice(0,10).forEach(function(s){if(s.mw>mx)mx=s.mw});
  pts.slice(0,10).forEach(function(s,i){h+='<div class="site" data-i="'+list.indexOf(s)+'"><span class="rk">'+String(i+1).padStart(2,'0')+'</span><span class="nm"><span class="dot" style="background:'+COL[s.top]+'"></span>'+esc(s.label)+'</span><span class="mw">'+mwf(s.mw)+'</span><span class="bar"><i style="width:'+(mx?s.mw/mx*100:0).toFixed(1)+'%;background:'+COL[s.top]+'"></i></span></div>'});
  if(!pts.length)h='<p class="foot">'+t('none')+'</p>';
  var el=$('res');el.innerHTML=h;
  el.querySelectorAll('.site[data-i]').forEach(function(r){r.onclick=function(){select(list[+r.getAttribute('data-i')])}});
}

var segs=[];
function baseW(l){return (l[4]===400?.9:.6)+Math.min(1.8,(l[9]||0)/3000)}
function lineTip(l){
  var bits=[l[4]+' kV',l[5]+' '+(l[5]===1?ln('circ1'):ln('circ'))];
  if(l[9])bits.push(mwf(l[9])+' MVA '+ln('rating'));
  if(l[10])bits.push(l[10]+' km '+ln('len'));
  return '<div class="tt"><b>'+esc(l[7])+' — '+esc(l[8])+'</b><span>'+esc(bits.join(' · '))+(l[6]?'<br>'+esc(ln('approxLine')):'')+'</span></div>';
}
function drawLines(){
  var rend=L.svg({pane:'grid',padding:.5});
  (window.GRID_LINES||[]).slice().sort(function(a,b){return a[4]-b[4]}).forEach(function(l){
    var p=L.polyline([[l[0],l[1]],[l[2],l[3]]],{renderer:rend,color:KV[l[4]].c,weight:baseW(l),opacity:.4,lineCap:'round',dashArray:l[6]?'2 5':null,className:'gl'});
    p.bindTooltip(function(){return lineTip(l)},{sticky:true,direction:'top',offset:[0,-6]});
    p.on('mouseover',function(){if(state.kv[l[4]])p.setStyle({opacity:1,weight:baseW(l)+1.2,color:'#E3C68B'})});
    p.on('mouseout',function(){styleOne(segs[p._i])});
    var f=null;
    if(l[4]===400&&!reduce){f=L.polyline([[l[0],l[1]],[l[2],l[3]]],{renderer:rend,color:'#E9EEF5',weight:1,opacity:.35,dashArray:'1 22',lineCap:'round',interactive:false,className:'flow'})}
    p._i=segs.length;segs.push({p:p,l:l,hot:false,f:f});p.addTo(lines);if(f)f.addTo(lines);
    var el=p.getElement();if(el)el.style.color=KV[l[4]].c;
  });
}
function near(a,b){return Math.abs(a[0]-b[0])<0.03&&Math.abs(a[1]-b[1])<0.04}
function styleOne(s){
  var on=state.kv[s.l[4]],any=!!state.sel;
  s.p.setStyle({opacity:!on?0:(s.hot?.95:(any?.12:.55)),weight:baseW(s.l)+(s.hot?1.2:0),color:s.hot?'#E3C68B':KV[s.l[4]].c});
  var el=s.p.getElement();if(el){el.style.pointerEvents=on?'':'none';el.classList.toggle('hot',s.hot)}
  if(s.f)s.f.setStyle({opacity:!on?0:(any&&!s.hot?.06:.35)});
}
function styleLines(){
  var loc=state.sel&&state.sel.q!=='a'?state.sel.loc:null;
  segs.forEach(function(s){s.hot=!!loc&&(near([s.l[0],s.l[1]],loc)||near([s.l[2],s.l[3]],loc));styleOne(s)});
  segs.forEach(function(s){if(s.hot)s.p.bringToFront()});
}
function connected(){return segs.filter(function(s){return s.hot}).map(function(s){return s.l})}

/* ---------- guided tour ---------- */
var UC='Under Construction/Commissioning',tour={i:-1,auto:null};
function L2(z,e){return lang==='zh'?z:e}
function pc(a,b){return (a/b*100).toFixed(1).replace(/\.0$/,'')}
function tstat(){var s={tot:0,st:{},g:{},c:{}};rows.forEach(function(r){s.tot+=r.mw;s.st[r.status]=(s.st[r.status]||0)+r.mw;s.g[r.group]=(s.g[r.group]||0)+r.mw;s.c[r.cust]=(s.c[r.cust]||0)+r.mw});return s}
function reset(){GROUPS.forEach(function(g){state.groups[g[0]]=true});state.status='all';state.cust=null;state.year=null;state.sel=null}
function home(){map.flyTo(mobile()?[54.4,-2.6]:[54.6,-3.8],mobile()?5:6,{duration:1})}
function fit(pred){var pts=lastList.filter(pred||function(){return true}).map(function(s){return [s.loc[0],s.loc[1]]});if(!pts.length)return;
  map.flyToBounds(L.latLngBounds(pts),{paddingTopLeft:mobile()?[16,130]:[430,50],paddingBottomRight:mobile()?[16,230]:[370,100],maxZoom:9,duration:1})}
function tsteps(){
  var s=tstat(),top=Object.keys(s.c).sort(function(a,b){return s.c[b]-s.c[a]})[0],stor=(s.g['Storage']||0)+(s.g['Solar + storage']||0),off=s.g['Offshore wind']||0;
  return [
   {t:L2('排队容量是已并网的 '+(s.tot/connectedMW).toFixed(1)+' 倍','The queue is '+(s.tot/connectedMW).toFixed(1)+'× today’s connected grid'),
    b:L2(gw(s.tot)+' GW 在排队，今天已并网 '+gw(connectedMW)+' GW。每个圆圈是一个变电站，越大排得越长。',gw(s.tot)+' GW is waiting; '+gw(connectedMW)+' GW is connected. Each circle is a substation: the bigger, the longer the queue.'),
    a:function(){reset();render(true);home()}},
   {t:L2('只有 '+pc(s.st[UC]||0,s.tot)+'% 在施工','Only '+pc(s.st[UC]||0,s.tot)+'% is under construction'),
    b:L2('排队容量里 '+pc(s.st['Scoping']||0,s.tot)+'% 还停在 Scoping（初步设想）阶段，施工或调试中的只有 '+gw(s.st[UC]||0)+' GW。地图现在只显示这一小部分。',pc(s.st['Scoping']||0,s.tot)+'% of the queue is still at the Scoping stage; only '+gw(s.st[UC]||0)+' GW is under construction or commissioning. The map now shows just that slice.'),
    a:function(){reset();state.status=UC;render(true);home()}},
   {t:L2('电池储能（含光储）占 '+pc(stor,s.tot)+'%','Batteries (incl. solar + storage): '+pc(stor,s.tot)+'%'),
    b:L2('储能与光伏+储能合计 '+gw(stor)+' GW，是排队里最大的一类。',"Storage and solar + storage add up to "+gw(stor)+' GW, the largest category in the queue.'),
    a:function(){reset();GROUPS.forEach(function(g){state.groups[g[0]]=g[0]==='Storage'||g[0]==='Solar + storage'});render(true);fit(function(x){return x.q!=='a'})}},
   {t:L2('一家开发商就排了 '+gw(s.c[top])+' GW','One developer: '+gw(s.c[top])+' GW'),
    b:L2(top+' 名下的记录合计 '+gw(s.c[top])+' GW，相当于今天全部已并网容量的 '+pc(s.c[top],connectedMW)+'%。',top+' holds '+gw(s.c[top])+' GW of entries, equal to '+pc(s.c[top],connectedMW)+'% of everything connected today.'),
    a:function(){reset();state.cust=top;render(true);fit()}},
   {t:'',b:'',a:function(){reset();render(true);var sp=lastList.filter(function(x){return x.q!=='a'})[0];if(sp){tour.sp=sp;select(sp);var c=$('story');if(c){c.querySelector('b').textContent=L2('最堵的变电站：','Longest queue: ')+sp.label;c.querySelector('p').textContent=L2(gw(sp.mw)+' GW，'+sp.rows.length+' 个项目在排队。点开圆圈能看到每一个项目。',gw(sp.mw)+' GW across '+sp.rows.length+' projects. Click any circle to see each one.')}}}},
   {t:L2('海上风电 '+gw(off)+' GW','Offshore wind: '+gw(off)+' GW'),
    b:L2('占排队总量的 '+pc(off,s.tot)+'%。圆圈越大，这个接入点排的海上风电越多。','That is '+pc(off,s.tot)+'% of the queue. The bigger the circle, the more offshore wind waits at that connection point.'),
    a:function(){reset();GROUPS.forEach(function(g){state.groups[g[0]]=g[0]==='Offshore wind'});render(true);fit()}}
  ];
}
function tourShow(i){
  var st=tsteps();if(i<0||i>=st.length){tourStop();return}
  tour.i=i;var d=st[i],c=$('story');
  if(!c){c=document.createElement('div');c.id='story';c.className='panel';document.body.appendChild(c)}
  var dots='';for(var k=0;k<st.length;k++)dots+='<i'+(k===i?' class="on"':'')+'></i>';
  c.innerHTML='<div class="sk">'+(i+1)+' / '+st.length+'</div><b>'+esc(d.t)+'</b><p>'+esc(d.b)+'</p><div class="sc"><button id="sprev" aria-label="prev"'+(i?'':' disabled')+'>←</button><span class="dots">'+dots+'</span><button id="snext" aria-label="next">'+(i===st.length-1?'✓':'→')+'</button><button id="sx" aria-label="close">✕</button></div>';
  c.classList.add('show');document.body.classList.add('touring');
  $('sprev').onclick=function(){tourHold();tourShow(tour.i-1)};
  $('snext').onclick=function(){tourHold();tourShow(tour.i+1)};
  $('sx').onclick=function(){tourStop()};
  stop();d.a();
}
function tourHold(){if(tour.auto){clearInterval(tour.auto);tour.auto=null}}
function tourStart(){tourHold();tourShow(0);tour.auto=setInterval(function(){tourShow(tour.i+1)},8500)}
function tourStop(){tourHold();tour.i=-1;var c=$('story');if(c)c.classList.remove('show');document.body.classList.remove('touring');reset();render(true);home()}

function start(T0){
  connectedMW=T0.connectedMW;nEntries=T0.entries;dataDate=T0.date;
  T0.rows.forEach(function(x){
    rows.push({name:x[0],cust:x[1],site:x[2]||'Unknown',mw:x[3],y:x[4],status:x[5]||'Unknown',to:x[6]||'Unknown',group:classify(x[7]),loc:locate(x[2],x[6])});
  });
  var ys={};rows.forEach(function(r){if(r.y)ys[r.y]=1});
  var cur=new Date().getFullYear();
  years=Object.keys(ys).map(Number).filter(function(y){return y>=cur}).sort(function(a,b){return a-b});
  render(true);
}

document.documentElement.lang=lang==='zh'?'zh-CN':'en';
document.body.classList.add('intro');setTimeout(function(){intro=false;document.body.classList.remove('intro')},2800);
map=L.map('map',{zoomControl:false,minZoom:4,maxZoom:13}).setView(mobile()?[54.4,-2.6]:[54.6,-3.8],mobile()?5:6);
if(mobile())$('side').classList.add('collapsed');
map.createPane('grid');map.getPane('grid').style.zIndex=350;
L.control.zoom({position:'bottomright'}).addTo(map);
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',{maxZoom:16,attribution:'&copy; Esri &middot; Leaflet'}).addTo(map);
map.attributionControl.setPrefix(false);
lines=L.layerGroup().addTo(map);drawLines();
layer=L.layerGroup().addTo(map);
pulses=L.layerGroup().addTo(map);
hero(0);

if(window.TEC){start(window.TEC)}else{var d=document.createElement('div');d.className='err';d.textContent=t('err');document.body.appendChild(d)}
})();
