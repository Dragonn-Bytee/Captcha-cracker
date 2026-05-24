document.addEventListener('DOMContentLoaded', () => {
    const fields = ['enabledToggle', 'username', 'password', 'userSel', 'passSel', 'nextSel', 'submitSel', 'captchaSel', 'captchaInputSel'];
    
    // Load existing settings
    chrome.storage.local.get(fields.map(f => f === 'enabledToggle' ? 'enabled' : f), (data) => {
        document.getElementById('enabledToggle').checked = data.enabled !== false; // true by default
        if (data.username) document.getElementById('username').value = data.username;
        if (data.password) document.getElementById('password').value = data.password;
        if (data.userSel) document.getElementById('userSel').value = data.userSel;
        if (data.passSel) document.getElementById('passSel').value = data.passSel;
        if (data.nextSel) document.getElementById('nextSel').value = data.nextSel;
        if (data.submitSel) document.getElementById('submitSel').value = data.submitSel;
        if (data.captchaSel) document.getElementById('captchaSel').value = data.captchaSel;
        if (data.captchaInputSel) document.getElementById('captchaInputSel').value = data.captchaInputSel;
    });

    // Save settings
    document.getElementById('saveBtn').addEventListener('click', () => {
        const btn = document.getElementById('saveBtn');
        const originalText = btn.innerText;
        btn.innerHTML = '<span class="loader"></span> Saving...';
        
        const data = {
            enabled: document.getElementById('enabledToggle').checked,
            username: document.getElementById('username').value,
            password: document.getElementById('password').value,
            userSel: document.getElementById('userSel').value,
            passSel: document.getElementById('passSel').value,
            nextSel: document.getElementById('nextSel').value,
            submitSel: document.getElementById('submitSel').value,
            captchaSel: document.getElementById('captchaSel').value,
            captchaInputSel: document.getElementById('captchaInputSel').value,
        };

        chrome.storage.local.set(data, () => {
            btn.classList.add('success');
            btn.innerText = 'Settings Saved ✓';
            setTimeout(() => {
                btn.classList.remove('success');
                btn.innerText = originalText;
            }, 2000);
        });
    });
});
