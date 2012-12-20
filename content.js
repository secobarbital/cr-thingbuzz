function suitability(a) {
  var max, min;
  max = Math.max(a.width, a.height);
  min = a.width + a.height - max;
  return (min/max) * min * max;
}

function querySelector(selector) {
  return document.querySelector(selector) || {};
}

var link, name, image;

link = querySelector('link[rel="canonical"]').href ||
  querySelector('meta[property="og:url"]').content ||
  querySelector('meta[name="og:url"]').content ||
  querySelector('meta[name="twitter:url"]').content ||
  window.location.href;

name = querySelector('span#btAsinTitle').innerText ||
  querySelector('meta[property="og:title"]').content ||
  querySelector('meta[name="og:title"]').content ||
  querySelector('meta[name="twitter:title"]').content ||
  querySelector('h1#productPageDetailsName').innerText ||
  querySelector('title').innerText || 'Something';
name = name.trim();

image = querySelector('img#main-image').src ||
  querySelector('meta[property="og:image"]').content ||
  querySelector('meta[name="og:image"]').content ||
  querySelector('meta[name="twitter:image"]').content ||
  querySelector('div#product-top-image-container img').src;

if (!image) {
  image = Array.prototype.slice.apply(document.querySelectorAll('img')).sort(function(a, b) {
    return suitability(b) - suitability(a);
  }).map(function(img) {
    return img.src;
  })[0];
}

chrome.extension.sendMessage({
  name: name,
  link: link,
  image_url: image
});
