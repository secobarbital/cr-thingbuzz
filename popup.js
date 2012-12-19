var baseUrl = localStorage.baseUrl || 'http://www.thingbuzz.com';

var socket = io.connect(baseUrl);

socket.on('feed:create', addPost);

socket.on('loggedIn', function() {
  sessionStorage.loggedIn = true;
  $('a.tb-login').hide();
  $('.post-data form').show();
});

function addPost(post) {
  var commentView, commentsView, post, postView, question, tbLogin;

  socket.on('feed/' + post._id + ':update', addComment(post._id));

  question = post.comments[0].comment.replace(/@\[(.+?):(.+?)\]/g, "@$2");
  postView = $($('#post-template').html());
  postView.attr('id', post._id);
  postView.find('.url').attr('href', '#' + postView.attr('id') + '-comments');
  postView.find('.text').text(question);
  postView.find('.ui-li-count').text('-1');
  $('[data-role="content"] ul').append(postView);

  commentsView = $($('#conversation').html());
  if (localStorage.baseUrl) {
    tbLogin = commentsView.find('.tb-login');
    tbLogin.attr('href', tbLogin.attr('href').replace('http://www.thingbuzz.com', baseUrl));
  }
  commentsView.attr('id', post._id + '-comments');
  commentsView.attr('data-url', post._id + '-comments');
  commentsView.find('div[data-role="header"] h1').text(question);
  if (sessionStorage.loggedIn) {
    commentsView.find('a.tb-login').hide();
  } else {
    commentsView.find('form').hide();
  }
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

function loadDataFor(tabUrl) {
  url = baseUrl + '/products/' + encodeURIComponent(tabUrl) + '/feed';
  $.getJSON(url, renderFeed).success(function(data) {
    socket.emit('room:join', data.productId + '/wall');
  });
}

$('body').on('click', '.tb-login', function(e) {
  chrome.extension.sendMessage(null, 'login');
});

$('body').on('keypress', '.post-data textarea', function(e) {
  if (e.keyCode === 13) {
    e.preventDefault();
    $(this).parents('form').submit();
  }
});

$('body').on('submit', '.post-data form', function(e) {
  e.preventDefault();
  socket.emit('comments:create', {
    postId: $(this).parents('div[data-role="page"]').attr('id').replace('-comments',''),
    comment: $(this).find('textarea').val()
  });
  $(this).find('textarea').val('');
  return false;
});

$(function() {
  if (chrome.tabs) {
    chrome.tabs.getSelected(null, function(tab) {
      loadDataFor(tab.url);
    });
  } else {
    loadDataFor(parent.location.href);
  }
});
