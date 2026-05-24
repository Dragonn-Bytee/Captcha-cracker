// content.js
console.log("AutoLogin: Content script injected.");

let state = {
    usernameFilled: false,
    nextClicked: false,
    passwordFilled: false,
    waitingForCaptchaCheck: false,
    captchaPopupShown: false,
    submitClicked: false
};

// Fill element natively to trigger frontend frameworks (React/Vue/Angular) properly
function fillElement(el, value) {
    if (!el || !value) return;
    el.focus();
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    if (nativeInputValueSetter) {
        nativeInputValueSetter.call(el, value);
    } else {
        el.value = value;
    }
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.blur();
}

// Robust click method for various frameworks
function clickElement(el) {
    if (!el) return;
    el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
    el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
    el.click();
}

// Show the floating CAPTCHA popup
function showCaptchaPopup(submitSel) {
    if (document.getElementById('captcha-pause-popup')) return;

    const popup = document.createElement('div');
    popup.id = 'captcha-pause-popup';
    // Style as a clean, modern floating UI
    popup.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: #1e293b;
        border: 2px solid #f59e0b;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        z-index: 2147483647; /* Max z-index */
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #fff;
        display: flex;
        flex-direction: column;
        gap: 16px;
        align-items: center;
        animation: autoLoginSlideIn 0.3s ease-out;
    `;
    
    // Add a simple keyframe animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes autoLoginSlideIn {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    const text = document.createElement('div');
    text.innerText = "Please solve CAPTCHA manually.";
    text.style.fontWeight = "600";
    text.style.fontSize = "16px";
    
    const btn = document.createElement('button');
    btn.innerText = "I have solved the CAPTCHA";
    btn.style.cssText = `
        background: #10b981;
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        transition: background 0.2s, transform 0.1s;
    `;
    btn.onmouseover = () => btn.style.background = "#059669";
    btn.onmouseout = () => btn.style.background = "#10b981";
    btn.onmousedown = () => btn.style.transform = "scale(0.98)";
    btn.onmouseup = () => btn.style.transform = "scale(1)";
    
    btn.onclick = () => {
        popup.remove();
        console.log("AutoLogin: Captcha confirmed solved.");
        const submitBtn = document.querySelector(submitSel);
        if (submitBtn) {
            submitBtn.click();
            state.submitClicked = true;
            console.log("AutoLogin: Post-CAPTCHA Submit button clicked.");
        } else {
            console.log("AutoLogin: Submit button not found after CAPTCHA.");
        }
    };
    
    popup.appendChild(text);
    popup.appendChild(btn);
    document.body.appendChild(popup);
}

// Automatically solve CAPTCHA using Free OCR API
async function autoSolveCaptcha(imgEl, inputSel, submitSel) {
    if (!imgEl || imgEl.tagName.toLowerCase() !== 'img') {
        console.log("AutoLogin: Captcha element is not an image, cannot auto-solve. Defaulting to manual.");
        showCaptchaPopup(submitSel); // fallback to manual
        return;
    }

    console.log("AutoLogin: Attempting to auto-solve CAPTCHA...");
    state.captchaPopupShown = true;
    
    // Create a temporary popup to show progress
    const progressPopup = document.createElement('div');
    progressPopup.id = 'captcha-progress-popup';
    progressPopup.style.cssText = `
        position: fixed; bottom: 30px; right: 30px;
        background: #1e293b; border: 2px solid #3b82f6; border-radius: 12px;
        padding: 20px; color: #fff; z-index: 2147483647;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    `;
    progressPopup.innerText = "🤖 Auto-solving CAPTCHA via OCR...";
    document.body.appendChild(progressPopup);

    try {
        // Draw to canvas to extract base64
        const canvas = document.createElement('canvas');
        canvas.width = imgEl.width || imgEl.naturalWidth;
        canvas.height = imgEl.height || imgEl.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imgEl, 0, 0);
        const base64Image = canvas.toDataURL('image/png');

        const formData = new FormData();
        formData.append('base64Image', base64Image);
        formData.append('language', 'eng');
        formData.append('scale', 'true');
        formData.append('OCREngine', '2'); 

        // Make request to Free OCR API
        const response = await fetch('https://api.ocr.space/parse/image', {
            method: 'POST',
            headers: { 'apikey': 'helloworld' },
            body: formData
        });

        const result = await response.json();
        let text = '';
        if (result && result.ParsedResults && result.ParsedResults.length > 0) {
            text = result.ParsedResults[0].ParsedText.replace(/[^a-zA-Z0-9]/g, ''); // alphanumeric only
        }

        if (text && text.length > 0) {
            console.log("AutoLogin: Solved CAPTCHA: " + text);
            progressPopup.innerText = "✅ CAPTCHA Solved: " + text;
            
            // Fill the captcha input
            const inputEl = document.querySelector(inputSel);
            if (inputEl) {
                fillElement(inputEl, text);
            }
            
            setTimeout(() => {
                progressPopup.remove();
                const submitBtn = document.querySelector(submitSel);
                if (submitBtn) {
                    clickElement(submitBtn);
                    state.submitClicked = true;
                    console.log("AutoLogin: Submitted after auto-solving.");
                }
            }, 1000);
        } else {
            throw new Error("OCR could not read the text.");
        }
    } catch (err) {
        console.error("AutoLogin: Failed to auto-solve CAPTCHA", err);
        progressPopup.remove();
        showCaptchaPopup(submitSel); // fallback to manual if API fails
    }
}

function checkRoutine(data) {
    if (!data.enabled) return;
    
    const userEl = document.querySelector(data.userSel);
    const passEl = document.querySelector(data.passSel);
    const nextBtn = document.querySelector(data.nextSel);
    const submitBtn = document.querySelector(data.submitSel);

    // 1. Fill username
    if (userEl && userEl.offsetParent !== null && !state.usernameFilled && data.username) {
        console.log("AutoLogin: Filling username...");
        fillElement(userEl, data.username);
        state.usernameFilled = true;
    }
    
    // 2. Fill password
    if (passEl && passEl.offsetParent !== null && !state.passwordFilled && data.password) {
        console.log("AutoLogin: Filling password...");
        fillElement(passEl, data.password);
        state.passwordFilled = true;
    }

    // 3. Automation Steps
    // If we only have username filled and no password yet, look for Next button
    if (state.usernameFilled && (!passEl || passEl.offsetParent === null) && !state.passwordFilled && nextBtn && nextBtn.offsetParent !== null && !state.nextClicked) {
        setTimeout(() => {
            clickElement(nextBtn);
            state.nextClicked = true;
            console.log("AutoLogin: Next button clicked.");
        }, 800); // Increased delay slightly to allow UI updates
    }

    // If password is filled, we check for captcha, then submit
    if (state.passwordFilled && !state.submitClicked) {
        if (!state.waitingForCaptchaCheck) {
            state.waitingForCaptchaCheck = true;
            // Wait slightly for CAPTCHA iframe/div to render into the DOM
            setTimeout(() => {
                const currentCaptcha = document.querySelector(data.captchaSel);
                if (currentCaptcha && currentCaptcha.offsetParent !== null) {
                    if (!state.captchaPopupShown) {
                        console.log("AutoLogin: CAPTCHA detected.");
                        // Try to auto-solve if it's an image, else manual
                        autoSolveCaptcha(currentCaptcha, data.captchaInputSel, data.submitSel);
                    }
                } else {
                    const currentSubmit = document.querySelector(data.submitSel);
                    if (currentSubmit && currentSubmit.offsetParent !== null) {
                        clickElement(currentSubmit);
                        state.submitClicked = true;
                        console.log("AutoLogin: Submit button clicked automatically (no CAPTCHA detected).");
                    } else {
                        console.log("AutoLogin: Waiting for submit button...");
                        state.waitingForCaptchaCheck = false; // Retry finding submit button
                    }
                }
            }, 1000);
        }
    }
}

// Load configurations and start the interval tracker
const hostname = window.location.hostname;
chrome.storage.local.get([hostname], (result) => {
    const data = result[hostname] || {};
    
    if (data.enabled === false) {
        console.log("AutoLogin: Extension is disabled for " + hostname);
        return;
    }
    
    // Defaults using strict CSS selectors
    const config = {
        enabled: data.enabled !== false,
        username: data.username || '',
        password: data.password || '',
        userSel: data.userSel || 'input[type="text"], input[type="email"], input[name*="user" i], input[name*="email" i]',
        passSel: data.passSel || 'input[type="password"]',
        nextSel: data.nextSel || 'button[id*="next" i], button[class*="next" i], input[id*="next" i], input[class*="next" i], a[id*="next" i], a[class*="next" i]',
        submitSel: data.submitSel || 'button[type="submit"], input[type="submit"], button[id*="login" i], button[id*="submit" i]',
        captchaSel: data.captchaSel || 'img[src*="captcha" i], img[id*="captcha" i]',
        captchaInputSel: data.captchaInputSel || 'input[id*="captcha" i], input[name*="captcha" i]'
    };
    
    console.log("AutoLogin: Starting automation routine for " + hostname);
    setInterval(() => checkRoutine(config), 1000);
});
