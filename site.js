/* Saldora Global — shared behaviour: mobile menu and intent-tagged sign-up forms.
   Sign-ups go to info@saldoraglobal.com through FormSubmit, the same service the live site's chat already uses. */
(function(){
  var btn=document.getElementById("menu-btn"), menu=document.getElementById("mobile-menu");
  if(btn&&menu&&!window.SALDORA_SKIP_MENU){
    btn.addEventListener("click",function(){
      var open=menu.classList.toggle("open");
      btn.setAttribute("aria-expanded",open?"true":"false");
      btn.setAttribute("aria-label",open?"Close menu":"Open menu");
    });
    menu.addEventListener("click",function(e){ if(e.target.tagName==="A"){menu.classList.remove("open");btn.setAttribute("aria-expanded","false");} });
  }

  var ENDPOINT="https://formsubmit.co/ajax/info@saldoraglobal.com";
  var EMAIL=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  document.querySelectorAll("form[data-signup]").forEach(function(form){
    form.addEventListener("submit",function(e){
      e.preventDefault();
      var msg=form.querySelector(".form-msg"), email=form.querySelector("input[type=email]");
      var consent=form.querySelector("input[name=consent]");
      var intents=[].slice.call(form.querySelectorAll("input[name=intent]:checked")).map(function(x){return x.value;});
      var fixed=form.getAttribute("data-intent"); if(fixed) intents=[fixed];
      var say=function(t,bad){ if(msg){msg.textContent=t;msg.classList.toggle("is-error",!!bad);} };
      if(!email||!EMAIL.test(email.value.trim())) return say("Enter a valid email address.",true);
      if(!intents.length) return say("Choose at least one option.",true);
      if(consent&&!consent.checked) return say("Tick the box to confirm we can email you.",true);
      var b=form.querySelector("button[type=submit]"); if(b) b.disabled=true;
      say("Sending…");
      fetch(ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},
        body:JSON.stringify({_subject:"Sign-up: "+intents.join(" + "),_template:"table",
          "Email":email.value.trim(),"Signed up for":intents.join(", "),"Consent":"Yes",
          "Page":location.pathname||"/","Form":form.getAttribute("data-signup")})})
      .then(function(r){ if(!r.ok) throw new Error(); return r.json(); })
      .then(function(){
        say(form.getAttribute("data-success")||"Thanks. You're on the list.");
        var reveal=form.getAttribute("data-reveal"); if(reveal){var el=document.getElementById(reveal); if(el) el.hidden=false;}
        form.reset();
      })
      .catch(function(){ say("That didn't go through. Email info@saldoraglobal.com and we'll add you by hand.",true); })
      .then(function(){ if(b) b.disabled=false; });
    });
  });
})();
