var baseUrl = 'http://www.thingbuzz.com';

var socket = io.connect(baseUrl);

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
  var i, j, commentView, commentsView, post, postView;

  for (i=0; i < data.feed.length; i++) {
    post = data.feed[i];
    socket.on('feed/' + post._id + ':update', addComment(post._id));
    question = post.comments[0].comment.replace(/@\[(.+?):(.+?)\]/g, "@$2")
    postView = $($('#post-template').html());
    postView.attr('id', post._id);
    postView.find('.url').attr('href', '#' + postView.attr('id') + '-comments');
    postView.find('.text').text(question);
    postView.find('.ui-li-count').text('-1');
    $('[data-role="content"] ul').append(postView);

    commentsView = $($('#conversation').html())
    commentsView.attr('id', post._id + '-comments');
    commentsView.attr('data-url', post._id + '-comments');
    commentsView.find('div[data-role="header"] h1').text(question);
    $('body').append(commentsView);

    for (j=0; j < post.comments.length; j++) {
      addComment(post._id)(post, post.comments[j]);
    }
  }
  $('[data-role="content"] ul').listview('refresh');
}

$(function() {
  chrome.tabs.getSelected(null, function(tab) {
    url = baseUrl + '/products/' + encodeURIComponent(tab.url) + '/feed';
    $.getJSON(url, renderFeed).success(function(data) {
      socket.emit('room:join', data.productId + '/wall');
    });
  });
});
