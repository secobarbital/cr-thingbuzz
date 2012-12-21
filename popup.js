var baseUrl = localStorage.baseUrl || 'http://www.thingbuzz.com',
    socket = io.connect(baseUrl);

function addPost(post) {
  var commentView, commentsView, post, postView, questioni, updatedPost;

  socket.on('feed/' + post._id + ':update', addComment(post._id));
  chrome.extension.sendMessage({
    action: 'socketListener',
    message: 'feed/'+ post._id + ':update'
  });

  question = post.comments[0].comment.replace(/@\[(.+?):(.+?)\]/g, "@$2");


  postView = $($('#post-template').html());
  updatedPost = JSON.parse(localStorage.updatedPost || "{}");
  if (updatedPost[post._id]) {
    postView.find('.text').before($('#updated').html());
    delete(updatedPost[post._id]);
    localStorage.updatedPost = JSON.stringify(updatedPost);
  }
  postView.attr('id', post._id);
  postView.find('.url').attr('href', '#' + postView.attr('id') + '-comments');
  postView.find('.text').text(question);
  postView.find('.ui-li-count').text('-1');
  $('[data-role="content"] ul.scrolly').prepend(postView);

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
      conversation.scrollTop(conversation.prop('scrollHeight'));
    countEl = $('#' + postId + ' .ui-li-count');
    countEl.text(parseInt(countEl.text()) + 1);
  }
}

function replay() {
  socket.emit('replay:fetch', {}, function(err, actions) {
    if (actions && actions.length) {
      actions.forEach(function(action) {
        socket.emit(action.message, action.data, function(err) {
        });
      });
    }
  });
}

function loadDataFor(tabUrl) {
  url = baseUrl + '/products/' + encodeURIComponent(tabUrl) + '/feed';
  $.getJSON(url).done(function(data) {
    data.feed.reverse().forEach(addPost);
    socket.emit('room:join', data.productId + '/wall');
    replay();
  }).always(function() {
    var currentView;
    if (localStorage.currentView) {
      currentView = JSON.parse(localStorage.currentView);
      if (currentView[tabUrl]){
        $.mobile.changePage($(currentView[tabUrl]), {transition: 'slide'});
      }
    } else {
      $('#new-question textarea').focus();
    }
  }).fail(replay);
}

function authorize(cb) {
  return function(err) {
    if ('Unauthorized' === err) {
      chrome.extension.sendMessage('login');
      chrome.tabs.create({
        url: baseUrl + '/login?redirectTo=/glade'
      });
    } else if (cb) {
      cb.apply(this, arguments);
    }
  }
}

$('body').on('keypress', 'textarea', function(e) {
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
    }, authorize(function(err, post) {
      if (post && post.objectId) {
        socket.emit('room:join', post.objectId + '/wall');
      }
    }));
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
    }, authorize());
    $(this).find('textarea').val('');
  }
}).on('pageshow', function(e, data) {
  var hash, url;
  hash = data.prevPage && data.prevPage.context && data.prevPage.context.location.hash;

  url = $('#new-question input[name="link"]').val();
  var currentView = JSON.parse(localStorage.currentView || "{}");
  if (hash && hash.length > 0) {
    currentView[url]=hash;
  } else {
    delete(currentView[url]);
  }
  localStorage.currentView = JSON.stringify(currentView);

  if (hash && ~hash.indexOf('-comments')) {
    $(hash + ' textarea').focus();
  }
});

chrome.extension.onMessage.addListener(function(message) {
  var questionEl;

  if (message.link) {
    questionEl = $('#new-question');
    questionEl.find('input[name="name"]').val(message.name);
    questionEl.find('input[name="link"]').val(message.link);
    questionEl.find('input[name="image_url"]').val(message.image_url);
    questionEl.find('textarea').attr('placeholder', 'Ask a question about ' + message.name).textinput('enable');

    loadDataFor(message.link);
  }
});

chrome.tabs.executeScript(null, {
  file: 'content.js'
});

socket.on('feed:create', addPost);
