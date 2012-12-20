var baseUrl = localStorage.baseUrl || 'http://www.thingbuzz.com',
    socket = io.connect(baseUrl);

socket.emit('room:join', null);
socket.on('feed:create', function(post) {
  var notification;
  notification = webkitNotifications.createNotification(
    'http://graph.facebook.com/' + post.subject.authHash.id + '/picture',
    'You\'ve got a new question!',
    post.subject.authHash.displayName + ' : "' +  post.comments[0].comment + '"'
  );
  notification.onclick = function() {
    chrome.tabs.create({
      url: post.object ? post.object.links[0] : baseUrl + '/posts/' + post._id
    }); 
    this.cancel();
  }
  notification.show();
});

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
