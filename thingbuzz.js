var baseUrl = 'http://www.thingbuzz.com';

function renderFeed(data) {
  var i, commentView, commentsView, post, postView;

  for (i=0; i < data.feed.length; i++) {
    post = data.feed[i];
    postView = $($('#post-template').html());
    postView.attr('id', post._id);
    postView.find('.url').attr('href', '#' + postView.attr('id'));
    postView.find('.text').text(post.comments[0].comment);
    commentsView = postView.find('.comments');
    commentsView.attr('id', post._id + '/comments').hide();
    for (i=1; i < post.comments.length; i++) {
      comment = post.comments[i];
      commentView = $($('#comment-template').html());
      commentView.find('.user').text(comment.user.displayName);
      commentView.find('.text').text(comment.comment);
      commentsView.append(commentView);
    }
    $('#jqt').append(postView);
  }
}

$('#jqt').on('click', '.post a.url', function() {
});

$.jQTouch({});

$(function() {
  chrome.tabs.getSelected(null, function(tab) {
    url = baseUrl + '/products/' + encodeURIComponent(tab.url) + '/feed';
    $.getJSON(url, renderFeed);
  });
});
