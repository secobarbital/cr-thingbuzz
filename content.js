window.addEventListener('message', function(e) {
  if ('closeWindow' === e.data) {
    window.document.body.removeChild(document.getElementById('tb-login'));
    window.alert("Nice! You are now logged in. Click on the extension again.");
  } else if ('addIframe' === e.data.action) {
    var iframe = document.createElement("iframe");
    iframe.src = e.data.src;
    iframe.id = "tb_login";
    window. document.body.appendChild(iframe);
  }
});


