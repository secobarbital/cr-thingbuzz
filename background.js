function login(message) {
  chrome.tabs.executeScript(null, {
    file: 'content.js'
  }, function() {
    chrome.tabs.executeScript(null, {
      code: 'window.postMessage({action: "addIframe", src: "' + message.url + '"}, "*");'
    });
  });
}

chrome.extension.onMessage.addListener(function(message) {
  if ('login' === message.action) {
    login(message);
  }
});
