// login.js - save basic auth credentials and redirect to main
(function(){
    const username = document.getElementById('username');
    const password = document.getElementById('password');
    const btn = document.getElementById('btnSaveCreds');
    const status = document.getElementById('loginStatus');
    const goRegister = document.getElementById('goRegister');

    function setStatus(msg, ok=true){
        status.textContent = msg;
        status.style.color = ok ? 'green' : 'darkred';
    }

    function authHeader(u,p){
        return {'Authorization':'Basic '+btoa(u+':'+p),'Content-Type':'application/json'};
    }

    btn.addEventListener('click', async ()=>{
        const u = username.value.trim();
        const p = password.value;
        if(!u||!p) return setStatus('请输入用户名和密码', false);
        try{
            const res = await fetch('/api/auth/me', { headers: authHeader(u,p) });
            if(res.ok){
                localStorage.setItem('hrms_auth', JSON.stringify({u,p}));
                setStatus('登录成功，正在跳转...');
                setTimeout(()=> location.href = '/main.html', 400);
            } else {
                const text = await res.text();
                setStatus('登录失败: '+res.status + ' ' + text, false);
            }
        }catch(e){
            setStatus('连接失败: '+e.message, false);
        }
    });

    goRegister.addEventListener('click', ()=> location.href = '/register.html');
})();