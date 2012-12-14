var baseUrl = 'http://www.thingbuzz.com';

var socket = io.connect(baseUrl);

socket.on('feed:create', addPost);

function addPost(post) {
  var commentView, commentsView, post, postView, question;

  socket.on('feed/' + post._id + ':update', addComment(post._id));

  question = post.comments[0].comment.replace(/@\[(.+?):(.+?)\]/g, "@$2")
  postView = $($('#post-template').html());
  postView.attr('id', post._id);
  postView.find('.url').attr('href', '#' + postView.attr('id') + '-comments');
  postView.find('.text').text(question);
  postView.find('.ui-li-count').text('-1');
  $('[data-role="content"] ul').append(postView);

  commentsView = $($('#conversation').html());
  commentsView.attr('id', post._id + '-comments');
  commentsView.attr('data-url', post._id + '-comments');
  commentsView.find('div[data-role="header"] h1').text(question);
  $('body').append(commentsView);

  post.comments.forEach(function(comment) {
    addComment(post._id)(post, comment);
  });

  $('[data-role="content"] ul').listview('refresh');
}

function addComment(postId) {
  return function(post, comment) {
    var commentView, conversation, countEl, scroll;

    comment = comment || post.comments[post.comments.length - 1];
    commentView = $($('#comment-template').html());
    commentView.find('.user').text(comment.user.displayName);
    commentView.find('.text').text(comment.comment.replace(/@\[(.+?):(.+?)\]/g, "@$2"));
    conversation = $('#' + postId + '-comments .conversation');
    scroll = conversation.scrollTop() + conversation.innerHeight() == conversation.prop('scrollHeight');
    conversation.append(commentView);
    if (scroll)
      conversation.scrollTop(conversation.innerHeight());
    countEl = $('#' + postId + ' .ui-li-count');
    countEl.text(parseInt(countEl.text()) + 1);
  }
}

function renderFeed(data) {
  data.feed.forEach(addPost);
}

$(function() {
  chrome.tabs.getSelected(null, function(tab) {
    url = baseUrl + '/products/' + encodeURIComponent(tab.url) + '/feed';
    $.getJSON(url, renderFeed).success(function(data) {
      socket.emit('room:join', data.productId + '/wall');
    });
  });
});
