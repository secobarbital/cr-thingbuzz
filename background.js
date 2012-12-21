var baseUrl = localStorage.baseUrl || 'http://www.thingbuzz.com',
    socket = io.connect(baseUrl);

socket.emit('room:join', null);

function notify(post) {
  var newPost, updated;
  newPost = (post.comments.length == 1 && !post.text) || (post.text && !post.comments);
  updated = JSON.parse(localStorage.updatedPost || "{}");
  updated[post._id]= 1;
  localStorage.updatedPost = JSON.stringify(updated);

  if (newPost && socket.listeners('feed/' + post._id + ':update').length == 0) {
    socket.on('feed/' + post._id + ':update', notify);
  }

  if (post.objectId) {
    socket.emit('product:read', {productId: post.objectId}, function(err, product) {
      if (product) {
        post.object = product;
      }
      doNotification(post, newPost);
    });
  } else {
    doNotification(post, newPost);
  }
}

function doNotification(post, newPost) {
  var defaultTitle, lastComment, notification;
  defaultTitle = newPost ? "You've got a new question" : "New comment on a post you've seen";
  lastComment = post.comments[post.comments.length - 1];
  notification = webkitNotifications.createNotification(
    post.object ? post.object.image_url : 'http://graph.facebook.com/' + lastComment.user.id + '/picture',
    post.object ? post.object.name : defaultTitle,
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

socket.on('feed:create', notify);

chrome.extension.onMessage.addListener(function(message) {
  if ('login' === message) {
    chrome.tabs.onUpdated.addListener(onUpdated);
  } else if (message.action && 'socketListener' === message.action) {
    if (socket.listeners(message.message).length == 0)
      socket.on(message.message, notify);
  }
});
