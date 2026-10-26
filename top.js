(function(){
  /* Scroll reveals: hide only what is below the fold, then slide it in. Without JS everything stays visible. */
  var els=[].slice.call(document.querySelectorAll(".sg-in-left,.sg-in-right"));
  var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(!reduce&&"IntersectionObserver" in window){
    var vh=window.innerHeight;
    els.forEach(function(el){ if(el.getBoundingClientRect().top>vh*0.92) el.classList.add("sg-pre"); });
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.remove("sg-pre"); io.unobserve(en.target); } });
    },{threshold:0.12,rootMargin:"0px 0px -6% 0px"});
    els.forEach(function(el){ if(el.classList.contains("sg-pre")) io.observe(el); });
  }
  /* Offer links pre-tick the matching waitlist option */
  document.querySelectorAll("[data-pick]").forEach(function(a){
    a.addEventListener("click",function(){
      var v=a.getAttribute("data-pick");
      document.querySelectorAll('#waitlist input[name=intent]').forEach(function(cb){ if(cb.value===v) cb.checked=true; });
    });
  });
})();
