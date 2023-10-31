export const scriptLoader = `
window.onload = function() {
  var script = document.createElement('script');
  script.src = '/scripts/bundle.js';
  script.id = 'bundle-loader';
  script.async = true;
  script.defer = true;
  console.log(script);
  document.body.appendChild(script);
}
`