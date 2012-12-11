$(function() {
  processTBData = function (data) {
    console.log('DATA', data);
  }

  chrome.tabs.getSelected(null, function(tab) {
    console.log('tab.url', tab.url);
    url = "http://l-sumboh.corp.nextag.com:3000/products/" + encodeURIComponent(tab.url) + "/feed"
    console.log('URL', url);
    $.ajax({url: url, success: processTBData});
  })

});
