var baseUrl = 'http://www.thingbuzz.com';

$('.feed').on('click', 'a', function(e) {
  chrome.tabs.create({
    url: $(this).attr('href')
  });
});

$(function() {
  var renderFeed = function(data) {
    for (var i=0; i < data.feed.length; i++) {
      var postView = $($('#post-template').html());
      postView.find('.url').attr('href', baseUrl + '/posts/' + data.feed[i]._id);
      postView.find('.text').text(data.feed[i].comments[0].comment);
      $('#feed').append(postView);
    }
  }

  chrome.tabs.getSelected(null, function(tab) {
    url = baseUrl + '/products/' + encodeURIComponent(tab.url) + '/feed';
    $.ajax({
      url: url,
      success: renderFeed
    });
  });
});
