(async function () {
    const script = document.currentScript;
    const agentId = script.getAttribute("data-id");

    // ✅ AUTO-DETECT SERVER URL (Works on Localhost AND Railway automatically)
    // It checks where this script file was loaded from.
    const scriptUrl = new URL(script.src);
    const serverUrl = scriptUrl.origin;

    // Default Config
    let config = { color: "#000000" };

    // Fetch Branding
    try {
        const res = await fetch(`${serverUrl}/widget/config/${agentId}`);
        if (res.ok) {
            const data = await res.json();
            if (data.color) config.color = data.color;
        }
    } catch (e) {
        console.warn("Using default widget style");
    }

    // Create Bubble
    const btn = document.createElement("div");
    btn.id = "chatpilot-widget-button"; // ✅ Added ID for cleanup
    btn.style.cssText = `
    position: fixed; bottom: 20px; right: 20px;
    width: 60px; height: 60px; 
    background: ${config.color}; 
    border-radius: 50%; cursor: pointer; z-index: 999999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    display: flex; align-items: center; justify-content: center;
    transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  `;

    // Icon
    btn.innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>`;
    document.body.appendChild(btn);

    // Create Iframe
    const iframe = document.createElement("iframe");
    iframe.id = "chatpilot-widget-iframe"; // ✅ Added ID for cleanup
    iframe.src = `${serverUrl}/chat.html?agentId=${agentId}`;
    iframe.style.cssText = `
    position: fixed; bottom: 90px; right: 20px;
    width: 380px; height: 600px; max-height: 80vh; max-width: 90vw;
    background: white;
    border: none; border-radius: 16px; z-index: 999999;
    box-shadow: 0 8px 30px rgba(0,0,0,0.12);
    display: none;
    opacity: 0;
    transition: opacity 0.2s ease, transform 0.2s ease;
    transform: translateY(20px);
  `;
    document.body.appendChild(iframe);

    // Toggle Logic
    let isOpen = false;
    btn.onclick = () => {
        isOpen = !isOpen;
        if (isOpen) {
            iframe.style.display = "block";
            // Small delay to allow display:block to apply before opacity transition
            setTimeout(() => {
                iframe.style.opacity = "1";
                iframe.style.transform = "translateY(0)";
            }, 10);
            btn.style.transform = "scale(0.95)";
        } else {
            iframe.style.opacity = "0";
            iframe.style.transform = "translateY(20px)";
            setTimeout(() => {
                iframe.style.display = "none";
            }, 200);
            btn.style.transform = "scale(1)";
        }
    };
})();