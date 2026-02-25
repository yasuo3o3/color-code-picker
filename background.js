// アイコンをクリックしたときのイベントリスナー
chrome.action.onClicked.addListener((tab) => {
    injectAndExecute(tab.id);
});

// キーボードショートカット（Ctrl+Shift+Eなど）を押したときのイベントリスナー
chrome.commands.onCommand.addListener((command, tab) => {
    if (command === "pick-color") {
        injectAndExecute(tab.id);
    }
});

function injectAndExecute(tabId) {
    // targetタブに content.js を注入・実行する
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
    }).catch((err) => {
        console.error("Failed to inject content script: ", err);
    });
}
