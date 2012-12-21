var baseUrl = localStorage.baseUrl || 'http://www.thingbuzz.com',
    socket = io.connect(baseUrl);

socket.emit('room:join', null);

function notifyOnComment(post) {
  var lastComment, notification;
  lastComment = post.comments[post.comments.length - 1];
  notification = webkitNotifications.createNotification(
    post.object ? post.object.image_url : 'http://graph.facebook.com/' + lastComment.user.id + '/picture',
    post.object ? post.object.name : 'New comment on a post you\'ve seen',
    lastComment.user.displayName + ' : "' +  lastComment.comment.replace(/@\[(.+?):(.+?)\]/g, "@$2") + '"'
  );
  notification.onclick = function() {
    chrome.tabs.create({
      url: post.object ? post.object.links[0] : baseUrl + '/posts/' + post._id
    }); 
    this.cancel();
  }
  notification.show();
}

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

socket.on('feed:create', function(post) {
  var notification;
  if (socket.listeners('feed/' + post._id + ':update').length == 0)
    socket.on('feed/' + post._id + ':update', notifyOnComment);
  notification = webkitNotifications.createNotification(
    post.object ? post.object.image_url : 'http://graph.facebook.com/' + post.subject.authHash.id + '/picture',
    post.object ? post.object.name : 'You\'ve got a new question!',
    post.subject.authHash.displayName + ' : "' +  post.comments[0].comment.replace(/@\[(.+?):(.+?)\]/g, "@$2") + '"'
  );
  notification.onclick = function() {
    chrome.tabs.create({
      url: post.object ? post.object.links[0] : baseUrl + '/posts/' + post._id
    }); 
    this.cancel();
  }
  notification.show();
});

chrome.extension.onMessage.addListener(function(message) {
  if ('login' === message) {
    chrome.tabs.onUpdated.addListener(onUpdated);
  } else if (message.action && 'socketListener' === message.action) {
    if (socket.listeners(message.message).length == 0)
      socket.on(message.message, notifyOnComment);
  }
});
