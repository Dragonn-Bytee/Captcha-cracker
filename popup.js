document.addEventListener('DOMContentLoaded', () => {
    const fields = ['enabledToggle', 'username', 'password', 'userSel', 'passSel', 'nextSel', 'submitSel', 'captchaSel', 'captchaInputSel'];
    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (!tabs || tabs.length === 0 || !tabs[0].url) return;
        
        let hostname = '';
        try {
            const currentUrl = new URL(tabs[0].url);
            hostname = currentUrl.hostname;
        } catch (e) {
            console.error("Invalid URL");
            return;
        }

        // Display the hostname in the popup so user knows which site they are editing
        const header = document.querySelector('h2') || document.createElement('h2');
        header.innerText = 'Settings for: ' + hostname;
        header.style.fontSize = '14px';
        header.style.wordBreak = 'break-all';

        // Load existing settings for this hostname
        chrome.storage.local.get([hostname], (result) => {
            const data = result[hostname] || {};
            
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

        // Save settings for this hostname
        document.getElementById('saveBtn').addEventListener('click', () => {
            const btn = document.getElementById('saveBtn');
            const originalText = btn.innerText;
            btn.innerHTML = '<span class="loader"></span> Saving...';
            
            const siteData = {
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

            chrome.storage.local.set({ [hostname]: siteData }, () => {
                btn.classList.add('success');
                btn.innerText = 'Settings Saved ✓';
                setTimeout(() => {
                    btn.classList.remove('success');
                    btn.innerText = originalText;
                }, 2000);
            });
        });
    });
});
