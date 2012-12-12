var baseUrl = 'http://www.thingbuzz.com';

function renderFeed(data) {
  for (var i=0; i < data.feed.length; i++) {
    var postView = $($('#post-template').html());
    postView.data('post', data.feed[i]);
    postView.find('.url').attr('href', baseUrl + '/posts/' + data.feed[i]._id);
    postView.find('.text').text(data.feed[i].comments[0].comment);
    $('#feed').append(postView);
  }
}

$('#feed').on('click', '.post a.url', function() {
  var i, comment, commentView, post;

  $('#feed').hide();
  $('#post').html('');
  post = $(this).parents('li').data('post');
  for (i=0; i < post.comments.length; i++) {
    comment = post.comments[i];
    commentView = $($('#comment-template').html());
    commentView.find('.user').text(comment.user.displayName);
    commentView.find('.text').text(comment.comment);
    $('#post').append(commentView);
  }
  $('#post').show();
});

$(function() {
  chrome.tabs.getSelected(null, function(tab) {
    url = baseUrl + '/products/' + encodeURIComponent(tab.url) + '/feed';
    $.ajax({
      url: url,
      success: renderFeed
    });
  });
});
