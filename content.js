(async () => {
    if (!window.EyeDropper) {
        alert("お使いのブラウザはEyeDropper APIをサポートしていません。Chromeの最新版をご利用ください。");
        return;
    }

    const eyeDropper = new EyeDropper();
    try {
        // カラーピッカーを開いて色を取得
        const result = await eyeDropper.open();
        const hexColor = result.sRGBHex; // #RRGGBB 形式で取得される

        // ユーザーが設定しているフォーマットを取得
        chrome.storage.sync.get({ format: 'hex' }, (items) => {
            const format = items.format;
            let finalColor = hexColor;

            if (format === 'rgb') {
                finalColor = hexToRgb(hexColor);
            } else if (format === 'hsl') {
                finalColor = hexToHsl(hexColor);
            }

            // クリップボードにコピー
            navigator.clipboard.writeText(finalColor).then(() => {
                showToast(`✔ Copied: ${finalColor}`);
            }).catch(err => {
                console.error("Clipboard copy failed:", err);
                alert(`色のコピーに失敗しました。\n取得した色: ${finalColor}`);
            });
        });

    } catch (e) {
        // ユーザーがピッカーの起動をキャンセルした場合（Escキーを押すなど）
        console.log("EyeDropper canceled or error:", e);
    }

    // --- 変換用ヘルパー関数群 ---

    function hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgb(${r}, ${g}, ${b})`;
    }

    function hexToHsl(hex) {
        let r = parseInt(hex.slice(1, 3), 16) / 255;
        let g = parseInt(hex.slice(3, 5), 16) / 255;
        let b = parseInt(hex.slice(5, 7), 16) / 255;

        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max == min) {
            h = s = 0; // achromatic
        } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
    }

    // --- 画面上にコピー完了のトースト通知を出す関数 ---
    function showToast(message) {
        // 既存のトーストがあれば削除
        const existing = document.getElementById("ccp-toast");
        if (existing) existing.remove();

        const toast = document.createElement("div");
        toast.id = "ccp-toast";
        toast.textContent = message;
        Object.assign(toast.style, {
            position: "fixed",
            bottom: "20px",
            right: "20px",
            padding: "12px 24px",
            backgroundColor: "#1e293b",
            color: "#f8fafc",
            borderRadius: "8px",
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: "15px",
            fontWeight: "500",
            zIndex: "2147483647",
            opacity: "0",
            transition: "opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            transform: "translateY(20px)",
            pointerEvents: "none"
        });

        document.documentElement.appendChild(toast);

        // サクッとアニメーション表示させる
        requestAnimationFrame(() => {
            toast.style.opacity = "1";
            toast.style.transform = "translateY(0)";
        });

        // 2.5秒後に消す
        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateY(20px)";
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }
})();
