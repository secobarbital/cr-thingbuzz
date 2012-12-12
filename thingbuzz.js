var baseUrl = 'http://www.thingbuzz.com';

function renderFeed(data) {
  var i, post, postView;

  for (i=0; i < data.feed.length; i++) {
    post = data.feed[i];
    postView = $($('#post-template').html());
    postView.data('post', JSON.stringify(post));
    postView.find('.url').attr('href', baseUrl + '/posts/' + post._id);
    postView.find('.text').text(post.comments[0].comment);
    $('#feed').append(postView);
  }
}

$('#feed').on('click', '.post a.url', function() {
  var i, comment, commentView, post;

  $('#feed').hide();
  $('#post').html('');
  post = JSON.parse($(this).parents('li').data('post'));
  for (i=0; i < post.comments.length; i++) {
    comment = post.comments[i];
    commentView = $($('#comment-template').html());
    commentView.find('.user').text(comment.user.displayName);
    commentView.find('.text').text(comment.comment);
    $('#post').append(commentView);
  }
  $('#post').show();
});

$.jQTouch({});

$(function() {
  chrome.tabs.getSelected(null, function(tab) {
    url = baseUrl + '/products/' + encodeURIComponent(tab.url) + '/feed';
    $.getJSON(url, renderFeed);
  });
});
