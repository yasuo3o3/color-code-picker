document.addEventListener('DOMContentLoaded', restoreOptions);

// ラジオボタンの変更を監視して自動保存する
const radios = document.querySelectorAll('input[name="format"]');
radios.forEach(radio => {
    radio.addEventListener('change', saveOptions);
});

let timeoutId = null;

function saveOptions() {
    const selectedFormat = document.querySelector('input[name="format"]:checked').value;

    chrome.storage.sync.set({ format: selectedFormat }, () => {
        // 保存完了のステータス表示
        const status = document.getElementById('status');
        status.innerHTML = '✨ 設定を保存しました。';
        status.classList.add('show');

        // 連続で変更された場合に備えてタイムアウトをリセット
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
            status.classList.remove('show');
        }, 2000);
    });
}

function restoreOptions() {
    // デフォルトは "hex"
    chrome.storage.sync.get({ format: 'hex' }, (items) => {
        const radio = document.querySelector(`input[value="${items.format}"]`);
        if (radio) {
            radio.checked = true;
        }
    });
}
