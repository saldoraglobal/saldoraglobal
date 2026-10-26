(function(){
  var $=function(id){return document.getElementById(id)};
  if(!$("q-ctn"))return;
  var n=function(v){var x=parseFloat(v);return isFinite(x)&&x>0?x:0};
  var usd=function(v){return "$"+Math.round(v).toLocaleString("en-US")};
  function calc(){
    var qr=$("q-ctn").value, qv=parseFloat(qr), ok=qr===""||(isFinite(qv)&&qv>=0&&Math.floor(qv)===qv);
    $("q-ctn").setAttribute("aria-invalid",ok?"false":"true");
    var d=String($("q-dim").value).split(/[x×*\s,]+/).filter(Boolean).map(parseFloat);
    var dimOk=d.length===3&&d.every(function(x){return isFinite(x)&&x>0});
    $("q-dim").setAttribute("aria-invalid",dimOk?"false":"true");
    var errs=[]; if(!ok)errs.push("Cartons must be a whole number."); if(!dimOk)errs.push("Enter carton size as three numbers, like 60x40x45.");
    $("q-err").textContent=errs.join(" ");
    var q=ok?n(qr):0, cbm=dimOk?d[0]*d[1]*d[2]/1e6*q:0, kg=n($("q-kg").value)*q;
    var v=n($("q-val").value), duty=v*n($("q-duty").value)/100;
    var mpf=v?Math.min(Math.max(v*0.003464,33.58),651.50):0, hmf=v*0.00125;
    var fees=duty+mpf+hmf, total=v+n($("q-fr").value)+fees;
    var vp=cbm/33.2*100, wp=kg/28200*100;
    $("r-cbm").textContent=cbm.toFixed(2)+" m³";
    $("r-wm").textContent=Math.max(cbm,kg/1000).toFixed(2)+" W/M";
    $("r-fees").textContent=usd(fees);
    $("r-vol").textContent=vp.toFixed(0)+"%"+(vp>100?" · over":"");
    $("r-wt").textContent=wp.toFixed(0)+"%"+(wp>100?" · over":"");
    $("r-vbar").style.width=Math.min(vp,100)+"%";$("r-wbar").style.width=Math.min(wp,100)+"%";
    $("r-total").textContent=usd(total);
  }
  ["q-ctn","q-dim","q-kg","q-val","q-duty","q-fr"].forEach(function(id){$(id).addEventListener("input",calc)});
  calc();
})();
