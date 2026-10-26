(function(){
  var CONTAINERS=[{name:"20′ Standard",cbm:33.2,kg:28200},{name:"40′ Standard",cbm:67.7,kg:26700},{name:"40′ High Cube",cbm:76.4,kg:26500}];
  var unit="metric";
  var rows=[{q:120,l:60,w:40,h:45,wt:18.5},{q:40,l:80,w:60,h:50,wt:32},{q:15,l:120,w:80,h:60,wt:65}];
  var $=function(id){return document.getElementById(id)};
  var num=function(v){var x=parseFloat(v);return isFinite(x)&&x>0?x:0};
  var fmt=function(v,d){d=d==null?2:d;return v.toLocaleString("en-US",{minimumFractionDigits:d,maximumFractionDigits:d})};
  var usd=function(v){return "$"+fmt(v,2)};
  var toM=function(v){return unit==="metric"?v/100:v*0.0254};
  var toKg=function(v){return unit==="metric"?v:v*0.45359237};
  function renderRows(){
    $("rows").innerHTML=rows.map(function(r,i){return '<tr>'+
      '<td><input id="q'+i+'" data-i="'+i+'" data-k="q" type="number" min="0" step="1" inputmode="numeric" value="'+r.q+'" aria-label="Number of cartons, row '+(i+1)+'"></td>'+
      ["l","w","h","wt"].map(function(k){return '<td><input id="'+k+i+'" data-i="'+i+'" data-k="'+k+'" type="number" min="0" step="any" value="'+r[k]+'" aria-label="'+({l:"Length",w:"Width",h:"Height",wt:"Weight per carton"})[k]+', row '+(i+1)+'"></td>'}).join("")+
      '<td class="out" id="c'+i+'">–</td><td><button type="button" class="del" data-del="'+i+'" aria-label="Remove row '+(i+1)+'">×</button></td></tr>'}).join("");
    calc();
  }
  $("rows").addEventListener("input",function(e){var t=e.target;if(t.dataset.k){rows[+t.dataset.i][t.dataset.k]=t.value;calc();}});
  $("rows").addEventListener("click",function(e){var d=e.target.dataset.del;if(d!==undefined){rows.splice(+d,1);if(!rows.length)rows.push({q:1,l:"",w:"",h:"",wt:""});renderRows();}});
  $("add").onclick=function(){rows.push({q:1,l:"",w:"",h:"",wt:""});renderRows();};
  function setUnit(u){
    if(u===unit)return;
    var lf=u==="imperial"?1/2.54:2.54, wf=u==="imperial"?2.20462262:0.45359237;
    rows=rows.map(function(r){var o={q:r.q};["l","w","h"].forEach(function(k){o[k]=r[k]===""?"":+(num(r[k])*lf).toFixed(1)});o.wt=r.wt===""?"":+(num(r.wt)*wf).toFixed(1);return o});
    unit=u;
    $("u-metric").setAttribute("aria-pressed",u==="metric");$("u-imperial").setAttribute("aria-pressed",u==="imperial");
    var Ls=u==="metric"?"cm":"in";["l","w","h"].forEach(function(k){$("th-"+k).textContent=k.toUpperCase()+" "+Ls});
    $("th-wt").textContent=(u==="metric"?"kg":"lb")+" / ctn";
    renderRows();
  }
  $("u-metric").onclick=function(){setUnit("metric")};$("u-imperial").onclick=function(){setUnit("imperial")};
  var summary={};
  function calc(){
    var cbm=0,kg=0,ctn=0,bad=[];
    rows.forEach(function(r,i){
      var qEl=$("q"+i), qv=parseFloat(r.q), ok=r.q===""||(isFinite(qv)&&qv>=0&&Math.floor(qv)===qv);
      if(qEl)qEl.setAttribute("aria-invalid",ok?"false":"true");
      var neg=["l","w","h","wt"].some(function(k){var x=parseFloat(r[k]);var el=$(k+i);var b=isFinite(x)&&x<0;if(el)el.setAttribute("aria-invalid",b?"true":"false");return b});
      var c=$("c"+i);
      if(!ok||neg){bad.push(i+1);if(c)c.textContent="–";return}
      var q=num(r.q), v=toM(num(r.l))*toM(num(r.w))*toM(num(r.h))*q;
      cbm+=v;kg+=toKg(num(r.wt))*q;ctn+=q;
      if(c)c.textContent=fmt(v,3);
    });
    $("row-err").textContent=bad.length?"Row "+bad.join(", ")+": cartons must be a whole number, and sizes and weights can't be negative. Those rows are left out of the totals.":"";
    $("o-cbm").textContent=fmt(cbm,3)+" m³";$("o-cuft").textContent=fmt(cbm*35.3147,1)+" cu ft";
    $("o-kg").textContent=fmt(kg,1)+" kg";$("o-lb").textContent=fmt(kg*2.20462,1)+" lb";
    $("ctn-count").textContent=fmt(ctn,0)+" ctns";
    [["air",6000],["exp",5000]].forEach(function(m){
      var vol=cbm*1e6/m[1], ch=Math.max(vol,kg), isVol=vol>kg;
      $("o-"+m[0]).textContent=fmt(ch,1)+" kg";
      var p=$("p-"+m[0]);p.textContent=kg||vol?(isVol?"volume":"actual"):"–";p.className="pill"+(isVol?" vol":"");
    });
    var rt=Math.max(cbm,kg/1000), lv=cbm>=kg/1000;
    $("o-lcl").textContent=fmt(rt,3)+" W/M";
    var pl=$("p-lcl");pl.textContent=kg||cbm?(lv?"volume":"weight"):"–";pl.className="pill"+(lv?" vol":"");
    summary={cbm:cbm,kg:kg,ctn:ctn,air:Math.max(cbm*1e6/6000,kg),exp:Math.max(cbm*1e6/5000,kg),rt:rt};
    $("boxes").innerHTML=CONTAINERS.map(function(c){
      var vp=cbm/c.cbm*100, wp=kg/c.kg*100, p=Math.max(vp,wp);
      var st=p>100?"Over capacity":p>85?"Above the 85% practical limit":"Within the practical limit";
      return '<div class="box"><div class="top"><b>'+c.name+'</b><span>'+st+'</span></div>'+
        '<div class="bars"><span>Volume</span><div class="bar" role="img" aria-label="'+c.name+' volume '+fmt(vp,0)+' percent"><i class="'+(vp>85?"over":"")+'" style="width:'+Math.min(vp,100)+'%"></i><span class="mark"></span></div>'+
        '<span>Weight</span><div class="bar" role="img" aria-label="'+c.name+' payload '+fmt(wp,0)+' percent"><i class="'+(wp>85?"over":"")+'" style="width:'+Math.min(wp,100)+'%"></i><span class="mark"></span></div></div>'+
        '<div class="top"><span>'+fmt(vp,0)+'% of '+c.cbm+' m³ volume</span><span>'+fmt(wp,0)+'% of '+fmt(c.kg,0)+' kg payload</span></div></div>';
    }).join("");
    landed();
  }
  function landed(){
    var errs=[];
    document.querySelectorAll("#lc-fields input, details input").forEach(function(el){var x=parseFloat(el.value);var b=el.value!==""&&(!isFinite(x)||x<0);el.setAttribute("aria-invalid",b?"true":"false");if(b)errs.push(el.labels[0].firstChild.textContent.trim())});
    var v=num($("f-value").value), fr=num($("f-freight").value), ins=num($("f-ins").value);
    var dr=num($("f-duty").value), xr=num($("f-extra").value), loc=num($("f-local").value);
    var unitsRaw=parseFloat($("f-units").value), units=isFinite(unitsRaw)&&unitsRaw>=1?Math.floor(unitsRaw):1;
    if($("f-units").value!==""&&!(isFinite(unitsRaw)&&unitsRaw>=1&&Math.floor(unitsRaw)===unitsRaw)){errs.push("Units must be a whole number of 1 or more");$("f-units").setAttribute("aria-invalid","true")}
    var mn=num($("f-mpfmin").value), mx=num($("f-mpfmax").value);
    var minMaxBad=mx>0&&mn>mx;
    $("f-mpfmin").setAttribute("aria-invalid",minMaxBad?"true":"false");$("f-mpfmax").setAttribute("aria-invalid",minMaxBad?"true":"false");
    if(minMaxBad)errs.push("MPF minimum is higher than the maximum, so the fee below ignores both limits");
    var ocean=$("f-mode").value==="ocean";
    var duty=v*dr/100, extra=v*xr/100;
    var mpf=v*num($("f-mpf").value)/100;
    if(!minMaxBad){mpf=Math.max(mpf,mn);if(mx)mpf=Math.min(mpf,mx)}
    if(!v)mpf=0;
    var hmf=ocean?v*num($("f-hmf").value)/100:0;
    var total=v+fr+ins+duty+extra+mpf+hmf+loc;
    $("lc-err").textContent=errs.length?"Check: "+errs.join(". ")+".":"";
    var lines=[["Goods value",v],["International freight",fr],["Insurance",ins],["Duty ("+dr+"%)",duty]];
    if(xr)lines.push(["Additional tariffs ("+xr+"%)",extra]);
    lines.push(["Merchandise Processing Fee",mpf]);
    if(ocean)lines.push(["Harbor Maintenance Fee",hmf]);
    lines.push(["Broker, port and trucking",loc]);
    $("ledger").innerHTML=lines.map(function(l){return '<div><span>'+l[0]+'</span><span>'+usd(l[1])+'</span></div>'}).join("")+
      '<div class="total"><span>Landed cost estimate</span><span>'+usd(total)+'</span></div>'+
      '<div><span>Per unit ('+fmt(units,0)+' units)</span><span>'+usd(total/units)+'</span></div>'+
      '<div><span>Added on top of goods value</span><span>'+(v?fmt((total-v)/v*100,1)+"%":"–")+'</span></div>';
    summary.landed={lines:lines,total:total,units:units};
  }
  document.querySelectorAll("#lc-fields input, #lc-fields select, details input").forEach(function(el){el.addEventListener("input",landed)});
  $("copy").onclick=function(){
    var s=summary,L=s.landed;
    var txt=["Saldora Global Shipment Calculator — estimate",
      "Cartons: "+fmt(s.ctn,0)+" | Volume: "+fmt(s.cbm,3)+" m³ | Gross: "+fmt(s.kg,1)+" kg",
      "Chargeable — Air: "+fmt(s.air,1)+" kg | Express: "+fmt(s.exp,1)+" kg | LCL: "+fmt(s.rt,3)+" W/M",""]
      .concat(L.lines.map(function(l){return l[0]+": "+usd(l[1])}))
      .concat(["Landed cost estimate: "+usd(L.total)+" ("+usd(L.total/L.units)+" per unit)","","Estimate only. Confirm classification and duty with a licensed customs broker."]).join("\n");
    var done=function(m){$("toast").textContent=m;setTimeout(function(){$("toast").textContent=""},3000)};
    try{navigator.clipboard.writeText(txt).then(function(){done("Copied")},function(){done("Copy isn't allowed here. Select the figures instead.")})}catch(e){done("Copy isn't allowed here. Select the figures instead.")}
  };
  renderRows();
})();
