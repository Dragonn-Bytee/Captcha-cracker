# AutoLogin with Captcha Pause Chrome Extension

This Chrome extension automates the login process for a specific target domain while intelligently pausing for manual CAPTCHA solving. 

## Features
- Autofills username/email and clicks Next.
- Autofills password securely.
- Pauses automation and prompts for manual interaction if a CAPTCHA is detected.
- Clean, modern, dark-mode popup UI.
- Securely stores credentials via `chrome.storage.local`.
- Fully customizable CSS selectors for flexibility on different websites.
- Restricts actions and permissions only to a specified target domain.

## Setup Instructions

1. **Configure Target Domain**
   - Open `manifest.json` in a text editor.
   - The domain is already configured for `https://students.cuchd.in/*`. If you need to add other domains, update the `host_permissions` array and the `content_scripts[0].matches` array.

2. **Load into Chrome**
   - Open Google Chrome and go to `chrome://extensions/`.
   - Enable **Developer mode** in the top right corner.
   - Click on **Load unpacked** in the top left.
   - Select the `captcha filler` folder containing this project.

3. **Configure Settings**
   - Click the extension icon in your browser toolbar to open the popup.
   - Enter your Username/Email and Password.
   - (Optional) Expand **Advanced: CSS Selectors** to adjust the CSS selectors if the extension isn't accurately detecting the fields on your specific target website.
   - Click **Save Settings**.

4. **Usage**
   - Navigate to the login page of your configured target domain.
   - The extension will automatically fill the username and proceed.
   - It will then fill the password and perform a check for a CAPTCHA.
   - If a CAPTCHA is detected, a floating popup will appear on the bottom right. Solve the CAPTCHA manually, then click **"I have solved the CAPTCHA"** to automatically submit the form.

## Security Notice
Your credentials are saved locally within Chrome's isolated extension storage (`chrome.storage.local`) and are never exposed to external servers or logged in the browser console. The extension's permissions are tightly scoped to the domains you define in `manifest.json`.

## Uploading to GitHub

To share or back up this extension on GitHub, follow these steps:

1. **Create a new repository** on your GitHub account.
2. **Initialize Git** in this directory (if you haven't already):
   - Open your terminal or command prompt in the `captcha filler` folder.
   - Run: `git init`
3. **Commit your files**:
   - Run: `git add .` (This includes all files, but respects the `.gitignore` provided).
   - Run: `git commit -m "Initial commit of AutoLogin Extension"`
4. **Push to GitHub**:
   - Run the commands provided by GitHub to link your remote repository, typically:
     ```bash
     git remote add origin https://github.com/YourUsername/YourRepoName.git
     git branch -M main
     git push -u origin main
     ```
