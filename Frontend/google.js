/**
 * Google Login Example using Google Identity Services
 * 1. Add your Google Client ID below.
 * 2. Include this script in your HTML file.
 * 3. Add a <div id="g_id_onload"> and <div class="g_id_signin"></div> in your HTML.
 */

const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID_HERE'; // Replace with your client ID

// Load Google Identity Services script
function loadGoogleScript() {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
}

// Initialize Google Sign-In
function initializeGoogleSignIn() {
    window.onload = () => {
        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
        });
        google.accounts.id.renderButton(
            document.getElementById('google-signin-btn'),
            { theme: 'outline', size: 'large' }
        );
        google.accounts.id.prompt();
    };
}

// Handle the credential response
function handleCredentialResponse(response) {
    // The response.credential is a JWT token
    console.log('Google credential:', response.credential);
    // You can send this token to your backend for verification
}

// Add a button container to the DOM
function addGoogleButtonContainer() {
    const btn = document.createElement('div');
    btn.id = 'google-signin-btn';
    document.body.appendChild(btn);
}

// Run everything
addGoogleButtonContainer();
loadGoogleScript();
setTimeout(initializeGoogleSignIn, 1000); // Wait for script to load