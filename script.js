document.addEventListener('DOMContentLoaded',()=>{
  const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];

  // Mobile navigation
  const toggle=$('.nav-toggle'), nav=$('.main-nav');
  toggle?.addEventListener('click',()=>{
  nav?.classList.toggle('open');
  toggle.setAttribute('aria-expanded',nav.classList.contains('open'));
});
  $$('.main-nav a').forEach(a=>a.addEventListener('click',()=>nav?.classList.remove('open')));
  $$('.drop-btn').forEach(b=>b.addEventListener('click',e=>{if(innerWidth<=760){e.preventDefault();b.parentElement.classList.toggle('open')}}));


  // Theme switcher
  const themeBtn=$('.theme-toggle');
  const savedTheme=localStorage.getItem('skyTheme');
  if(savedTheme==='dark') document.body.classList.add('dark-mode');
  function syncThemeIcon(){
    if(themeBtn) themeBtn.textContent=document.body.classList.contains('dark-mode')?'☀':'☾';
  }
  syncThemeIcon();
  themeBtn?.addEventListener('click',()=>{
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('skyTheme',document.body.classList.contains('dark-mode')?'dark':'light');
    syncThemeIcon();
  });

  // Mouse-following sky glow
  addEventListener('pointermove',e=>{
    document.documentElement.style.setProperty('--mx',`${e.clientX}px`);
    document.documentElement.style.setProperty('--my',`${e.clientY}px`);
  },{passive:true});

  // Back to top
  const topBtn=$('.scroll-top');
  function syncTop(){topBtn?.classList.toggle('show',scrollY>500)}
  addEventListener('scroll',syncTop,{passive:true}); syncTop();
  topBtn?.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));

  // Pause the home slider while the pointer is over it.
  const slider=$('.slider');
  slider?.addEventListener('mouseenter',()=>clearInterval(timer));
  slider?.addEventListener('mouseleave',restart);

  // Header + reading progress
  const header=$('.site-header'), progress=$('#progress');
  function scrollUI(){
    header?.classList.toggle('scrolled',scrollY>20);
    if(progress){const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=max?`${scrollY/max*100}%`:'0%';}
  }
  addEventListener('scroll',scrollUI,{passive:true});scrollUI();

  // Reveal-on-scroll
  const reveals=$$('.reveal');
  if('IntersectionObserver' in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('show');io.unobserve(e.target)}}),{threshold:.12});reveals.forEach(e=>io.observe(e))}else reveals.forEach(e=>e.classList.add('show'));

  // Home slider
  const slides=$('.slides'), slideItems=$$('.slide',slides||document), dots=$$('.dot'); let slideIndex=0, timer;
  function goSlide(i){if(!slides||!slideItems.length)return;slideIndex=(i+slideItems.length)%slideItems.length;slides.style.transform=`translateX(-${slideIndex*100}%)`;dots.forEach((d,n)=>d.classList.toggle('active',n===slideIndex));}
  $('.prev-slide')?.addEventListener('click',()=>{goSlide(slideIndex-1);restart()});$('.next-slide')?.addEventListener('click',()=>{goSlide(slideIndex+1);restart()});dots.forEach((d,n)=>d.addEventListener('click',()=>{goSlide(n);restart()}));
  function restart(){clearInterval(timer);if(slideItems.length>1)timer=setInterval(()=>goSlide(slideIndex+1),5500)} if(slideItems.length>1){goSlide(0);restart()}

  // Tabs
  $$('.tab-btn').forEach(btn=>btn.addEventListener('click',()=>{const id=btn.dataset.tab;$$('.tab-btn').forEach(b=>b.classList.toggle('active',b===btn));$$('.tabcontent').forEach(c=>c.classList.toggle('active',c.id===id));}));

  // Goal cards
  $$('.goal-card').forEach(card=>card.addEventListener('click',()=>card.classList.toggle('open')));

  // Fun facts: click works on touch screens as well as hover
  $$('.funfact-card').forEach(card=>card.addEventListener('click',()=>card.classList.toggle('flipped')));

  // Gallery lightbox
  const lightbox=$('#lightbox'), lightImg=$('#lightboxImage'), caption=$('.lightbox-caption'); const thumbs=$$('.thumbnail'); let current=0;
  function showImage(i){if(!thumbs.length)return;current=(i+thumbs.length)%thumbs.length;lightImg.src=thumbs[current].src;lightImg.alt=thumbs[current].alt; if(caption)caption.textContent=thumbs[current].dataset.caption||thumbs[current].alt;}
  thumbs.forEach((img,i)=>img.closest('button')?.addEventListener('click',()=>{showImage(i);lightbox?.classList.add('open');lightbox?.setAttribute('aria-hidden','false')}));
  function closeLight(){lightbox?.classList.remove('open');lightbox?.setAttribute('aria-hidden','true')}
  $('.close')?.addEventListener('click',closeLight);$('.prev')?.addEventListener('click',()=>showImage(current-1));$('.next')?.addEventListener('click',()=>showImage(current+1));
  lightbox?.addEventListener('click',e=>{if(e.target===lightbox)closeLight()});
  addEventListener('keydown',e=>{if(!lightbox?.classList.contains('open'))return;if(e.key==='Escape')closeLight();if(e.key==='ArrowLeft')showImage(current-1);if(e.key==='ArrowRight')showImage(current+1)});

  // Contact validation
  const contactForm=$('#contactForm');
  contactForm?.addEventListener('submit',e=>{
    e.preventDefault();
    let ok=true;
    const name=$('#name'), email=$('#email'), message=$('#message');
    $$('.error',contactForm).forEach(x=>x.textContent='');
    const success=$('#formSuccess');
    if(success) success.style.display='none';
    if(!name?.value.trim()){ $('#nameError').textContent='Please enter your name.'; ok=false; }
    if(!email?.value.trim()){ $('#emailError').textContent='Please enter your email.'; ok=false; }
    else if(!email.validity.valid){ $('#emailError').textContent='Please enter a valid email address.'; ok=false; }
    if(!message?.value.trim() || message.value.trim().length<10){ $('#messageError').textContent='Message must be at least 10 characters.'; ok=false; }
    if(ok){
      if(success) success.style.display='block';
      contactForm.reset();
      setTimeout(()=>{if(success)success.style.display='none'},5000);
    }
  });

  // Demo localStorage authentication
  const user=localStorage.getItem('skySiteUser');
  $$('.protected').forEach(()=>{if(!user)location.href='login.html'});
  /* Logout confirmation popup: Yes logs out, No keeps the user on the current page. */
  const createLogoutModal=()=>{
    let modal=document.querySelector('#logoutConfirmModal');
    if(modal)return modal;

    modal=document.createElement('div');
    modal.id='logoutConfirmModal';
    modal.className='logout-confirm-modal';
    modal.setAttribute('aria-hidden','true');
    modal.innerHTML=`
      <div class="logout-confirm-backdrop"></div>
      <div class="logout-confirm-card" role="dialog" aria-modal="true" aria-labelledby="logoutConfirmTitle">
        <button type="button" class="logout-confirm-close" id="logoutConfirmClose" aria-label="Close">×</button>
        <div class="logout-confirm-icon">↗</div>
        <span class="logout-confirm-kicker">SECURE SESSION</span>
        <h3 id="logoutConfirmTitle">Do you want to logout?</h3>
        <p>Your current session will be ended and you will return to the login page.</p>
        <div class="logout-confirm-actions">
          <button type="button" class="logout-no-btn" id="logoutNo">NO</button>
          <button type="button" class="logout-yes-btn" id="logoutYes">YES, LOGOUT</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    return modal;
  };

  const closeLogoutModal=()=>{
    const modal=document.querySelector('#logoutConfirmModal');
    if(!modal)return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
    document.body.classList.remove('logout-modal-open');
  };

  const openLogoutModal=()=>{
    const modal=createLogoutModal();
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    document.body.classList.add('logout-modal-open');
    setTimeout(()=>document.querySelector('#logoutNo')?.focus(),80);
  };

  $$('.logout-nav').forEach(btn=>btn.addEventListener('click',e=>{
    e.preventDefault();
    openLogoutModal();
  }));

  document.addEventListener('click',e=>{
    if(e.target.closest('#logoutNo') || e.target.closest('#logoutConfirmClose') || e.target.classList.contains('logout-confirm-backdrop')){
      closeLogoutModal();
    }
    if(e.target.closest('#logoutYes')){
      localStorage.removeItem('skySiteUser');
      closeLogoutModal();
      document.body.classList.add('logout-exit');
      setTimeout(()=>{ location.href='login.html'; },420);
    }
  });

  document.addEventListener('keydown',e=>{
    if(e.key==='Escape' && document.querySelector('#logoutConfirmModal.open')) closeLogoutModal();
  });
});

// Login / sign-up is intentionally simple and client-side for a laboratory demonstration.
function setupAuth(){
  const loginForm=document.querySelector('#loginForm'), signupForm=document.querySelector('#signupForm'); if(!loginForm&&!signupForm)return;
  const loginMsg=document.querySelector('#loginMessage'), signupMsg=document.querySelector('#signupMessage');
  const successModal=document.querySelector('#accountSuccessModal');
  const closeSuccessModal=document.querySelector('#closeSuccessModal');
  const successModalLogin=document.querySelector('#successModalLogin');

  /* Login-page dark mode toggle. This only changes the login UI theme. */
  const setupLoginTheme=()=>{
    if(document.querySelector('#loginThemeToggle'))return;
    const toggle=document.createElement('button');
    toggle.type='button';
    toggle.id='loginThemeToggle';
    toggle.className='login-theme-toggle';
    toggle.setAttribute('aria-label','Toggle dark mode');
    toggle.setAttribute('title','Toggle dark mode');
    toggle.innerHTML='<span class="theme-icon">☾</span><span class="theme-label">Dark</span>';
    document.body.appendChild(toggle);

    const saved=localStorage.getItem('skyTheme');
    const systemDark=window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    if(saved==='dark' || (!saved && systemDark)) document.body.classList.add('dark-login');

    const sync=()=>{
      const dark=document.body.classList.contains('dark-login');
      toggle.querySelector('.theme-icon').textContent=dark?'☀':'☾';
      toggle.querySelector('.theme-label').textContent=dark?'Light':'Dark';
      toggle.setAttribute('aria-label',dark?'Switch to light mode':'Switch to dark mode');
      toggle.setAttribute('title',dark?'Switch to light mode':'Switch to dark mode');
    };
    sync();
    toggle.addEventListener('click',()=>{
      document.body.classList.toggle('dark-login');
      localStorage.setItem('skyTheme',document.body.classList.contains('dark-login')?'dark':'light');
      sync();
    });
  };
  setupLoginTheme();

  const openSuccessModal=()=>{
    successModal?.classList.add('open');
    successModal?.setAttribute('aria-hidden','false');
    document.body.classList.add('modal-open');
    setTimeout(()=>successModalLogin?.focus(),120);
  };
  const closeSuccess=()=>{
    successModal?.classList.remove('open');
    successModal?.setAttribute('aria-hidden','true');
    document.body.classList.remove('modal-open');
  };

  document.querySelector('#showSignup')?.addEventListener('click',()=>{
    document.querySelector('#loginPanel').classList.remove('active');
    document.querySelector('#signupPanel').classList.add('active');
    signupMsg.textContent='';
  });
  document.querySelector('#showLogin')?.addEventListener('click',()=>{
    document.querySelector('#signupPanel').classList.remove('active');
    document.querySelector('#loginPanel').classList.add('active');
    loginMsg.textContent='';
  });

  document.querySelector('#loginPassword')?.addEventListener('input',e=>document.querySelector('#showLoginPass').checked&&(e.target.type='text'));
  document.querySelector('#showLoginPass')?.addEventListener('change',e=>document.querySelector('#loginPassword').type=e.target.checked?'text':'password');
  document.querySelector('#showSignupPass')?.addEventListener('change',e=>{
    document.querySelector('#signupPassword').type=e.target.checked?'text':'password';
    document.querySelector('#signupConfirm').type=e.target.checked?'text':'password';
  });

  closeSuccessModal?.addEventListener('click',closeSuccess);
  successModal?.querySelector('.success-modal-backdrop')?.addEventListener('click',closeSuccess);
  successModalLogin?.addEventListener('click',()=>{
    closeSuccess();
    document.querySelector('#signupPanel').classList.remove('active');
    document.querySelector('#loginPanel').classList.add('active');
    document.querySelector('#loginUsername').value=document.querySelector('#signupUsername').value.trim();
    document.querySelector('#loginPassword')?.focus();
  });
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape' && successModal?.classList.contains('open')) closeSuccess();
  });

  loginForm?.addEventListener('submit',e=>{
    e.preventDefault();
    const u=localStorage.getItem('skySiteAccount');
    const username=document.querySelector('#loginUsername').value.trim();
    const password=document.querySelector('#loginPassword').value;
    loginMsg.textContent='';
    if(!u){loginMsg.textContent='No account found. Please sign up first.';return}
    try{
      const a=JSON.parse(u);
      if(a.username===username&&a.password===password){
        localStorage.setItem('skySiteUser',username);

        /* Keep the original login behavior, but add a cinematic sky-to-Earth transition before redirecting. */
        document.body.classList.add('login-transition');

        const loginShell=document.querySelector('.login-shell');
        if(loginShell) loginShell.classList.add('login-entering');

        const loginButton=loginForm.querySelector('.auth-btn');
        if(loginButton){
          loginButton.disabled=true;
          loginButton.textContent='ENTERING EARTH...';
        }

        loginForm.style.pointerEvents='none';
        loginMsg.textContent='';

        setTimeout(()=>{
          location.href='index.html';
        },3700);
      }else loginMsg.textContent='Incorrect username or password.';
    }catch{loginMsg.textContent='Saved account data is invalid. Please sign up again.'}
  });

  signupForm?.addEventListener('submit',e=>{
    e.preventDefault();
    const username=document.querySelector('#signupUsername').value.trim();
    const password=document.querySelector('#signupPassword').value;
    const confirm=document.querySelector('#signupConfirm').value;
    signupMsg.textContent='';
    if(username.length<3){signupMsg.textContent='Username must be at least 3 characters.';return}
    if(password.length<6){signupMsg.textContent='Password must be at least 6 characters.';return}
    if(password!==confirm){signupMsg.textContent='Passwords do not match.';return}

    localStorage.setItem('skySiteAccount',JSON.stringify({username,password}));
    signupForm.reset();
    openSuccessModal();
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setupAuth);else setupAuth();
