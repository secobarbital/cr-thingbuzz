chrome.tabs.onUpdated.addListener(function() {
  chrome.tabs.getAllInWindow(null, function(tabs) {
    tabs.forEach(function(tab) {
      if (~tab.url.indexOf('://www.facebook.com/connect/login_success.html')) {
        localStorage.fbCode = tab.url.split('?')[1].split('&')[0].split('=')[1];
        chrome.tabs.remove(tab.id);
      }
    });
  });
});

