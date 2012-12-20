function onUpdated(tabId, changeInfo, tab) {
  if (changeInfo.url && ~changeInfo.url.indexOf('/glade')) {
    chrome.tabs.onUpdated.removeListener(onUpdated);
    chrome.tabs.remove(tab.id, function() {
      chrome.tabs.executeScript(null, {
        code: 'alert("Nice! You are now logged in. Click on the extension again.")'
      });
    });
  }
}

chrome.extension.onMessage.addListener(function(message) {
  if ('login' === message) {
    chrome.tabs.onUpdated.addListener(onUpdated);
  }
});
