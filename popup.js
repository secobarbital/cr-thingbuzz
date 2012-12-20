var baseUrl = localStorage.baseUrl || 'http://www.thingbuzz.com',
    socket = io.connect(baseUrl);

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

function loadDataFor(tabUrl) {
  url = baseUrl + '/products/' + encodeURIComponent(tabUrl) + '/feed';
  $.getJSON(url).success(function(data) {
    data.feed.forEach(addPost);
    socket.emit('room:join', data.productId + '/wall');
    $('#new-question textarea').focus();
  });
}

$('body').on('click', '.tb-login', function(e) {
  chrome.extension.sendMessage('login');
}).on('keypress', 'textarea', function(e) {
  if (e.keyCode === 13) {
    e.preventDefault();
    $(this).parents('form').submit();
  }
}).on('submit', '#new-question', function(e) {
  var comment = $(this).find('textarea').val().trim();

  e.preventDefault();
  e.stopPropagation();

  if (comment) {
    socket.emit('user:post', {
      comment: comment,
      object: {
        name: $(this).find('[name="name"]').val(),
        link: $(this).find('[name="link"]').val(),
        image_url: $(this).find('[name="image_url"]').val()
      }
    }, function(err, post) {
      if (!err) {
        socket.emit('room:join', post.objectId + '/wall');
      }
    });
    $(this).find('textarea').val('');
  }
}).on('submit', '.post-data form', function(e) {
  var comment = $(this).find('textarea').val().trim();

  e.preventDefault();
  e.stopPropagation();

  if (comment) {
    socket.emit('comments:create', {
      postId: $(this).parents('div[data-role="page"]').attr('id').replace('-comments', ''),
      comment: comment
    });
    $(this).find('textarea').val('');
  }
}).on('pageshow', function(e, data) {
  var hash = data.prevPage && data.prevPage.context && data.prevPage.context.location.hash;

  if (hash && ~hash.indexOf('-comments')) {
    $(hash + ' textarea').focus();
  }
});

socket.on('feed:create', addPost);

socket.on('loggedIn', function() {
  sessionStorage.loggedIn = true;
  $('a.tb-login').hide();
  $('.post-data form').show();
});

chrome.extension.onMessage.addListener(function(message) {
  var questionEl;

  if (message.link) {
    questionEl = $('#new-question');
    questionEl.find('input[name="name"]').val(message.name);
    questionEl.find('input[name="link"]').val(message.link);
    questionEl.find('input[name="image_url"]').val(message.image_url);
    questionEl.find('textarea').textinput('enable');

    loadDataFor(message.link);
  }
});

chrome.tabs.executeScript(null, {
  file: 'content.js'
});
