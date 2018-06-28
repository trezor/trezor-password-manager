window.addEventListener('load', function() {
    var val = window.location.hash;
    chrome.runtime.sendMessage({type: 'dropboxConnectToken', content: val});
    window.location.hash = '';
    if (window.close) {
        return window.close();
    }
});
