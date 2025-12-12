// register.js - public registration for EMPLOYEE
(function () {
    const btn = document.getElementById('btnRegister');
    const back = document.getElementById('backToLogin');
    const status = document.getElementById('registerStatus');

    function setStatus(msg, ok=true){
        status.textContent = msg;
        status.style.color = ok ? 'green' : 'darkred';
    }

    btn.addEventListener('click', async ()=>{
        const username = document.getElementById('reg_username').value.trim();
        const password = document.getElementById('reg_password').value;
        const role = document.getElementById('reg_role').value;
        if(!username||!password) return setStatus('用户名/密码必填', false);
        try{
            const res = await fetch('/api/auth/register', {
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body: JSON.stringify({username,password,role})
            });
            if(res.ok){
                setStatus('注册成功，1.5 秒后跳转到登录');
                setTimeout(()=> location.href = '/login.html', 1500);
            } else {
                const txt = await res.text();
                setStatus('注册失败: ' + res.status + ' ' + txt, false);
            }
        }catch(e){
            setStatus('请求失败: '+e.message, false);
        }
    });

    back.addEventListener('click', ()=> location.href = '/login.html');
})();