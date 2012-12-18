chrome.extension.onMessage.addListener(function(message) {
  if ('fb-login' === message) {
    chrome.tabs.onUpdated.addListener(onUpdated);
  }
});

function onUpdated(tabId, changeInfo, tab) {
  if (~changeInfo.url.indexOf('://www.facebook.com/connect/login_success.html')) {
    localStorage.fbCode = changeInfo.url.split('?')[1].split('&')[0].split('=')[1];
    chrome.tabs.remove(tab.id, function() {
      chrome.tabs.onUpdated.removeListener(onUpdated);
      chrome.tabs.executeScript(null, {
        code: 'alert("Nice! You are now logged in. Click on the extension again.")'
      });
    });
  }
}
