var baseUrl = 'http://l-sumboh.corp.nextag.com:3000';

function renderFeed(data) {
  var i, j, commentView, commentsView, post, postView;

  for (i=0; i < data.feed.length; i++) {
    post = data.feed[i];
    question = post.comments[0].comment
    postView = $($('#post-template').html());
    postView.attr('id', post._id);
    postView.find('.url').attr('href', '#' + postView.attr('id') + '-comments');
    postView.find('.text').text(question.replace(/@\[(.+?):(.+?)\]/g, "@$2"));
    $('[data-role="content"] ul').append(postView);

    commentsView = $($('#conversation').html())
    commentsView.attr('id', post._id + '-comments');
    commentsView.attr('data-url', post._id + '-comments');
    commentsView.find('div[data-role="header"] h1').text(question.replace(/@\[(.+?):(.+?)\]/g, "@$2"));
    for (j=1; j < post.comments.length; j++) {
      comment = post.comments[j];
      commentView = $($('#comment-template').html());
      commentView.find('.user').text(comment.user.displayName);
      commentView.find('.text').text(comment.comment.replace(/@\[(.+?):(.+?)\]/g, "@$2"));
      commentsView.find('div[data-role="content"] .conversation').append(commentView);
    }
    $('body').append(commentsView)
  }
  $('[data-role="content"] ul').listview('refresh');
}

$(function() {
  chrome.tabs.getSelected(null, function(tab) {
    url = baseUrl + '/products/' + encodeURIComponent(tab.url) + '/feed';
    $.getJSON(url, renderFeed);
  });
});
