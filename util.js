var reGithubProject = /^.*github\.com\/(.*)\.git.*$/;

exports.getRepoName = function(pkgInfo) {
  var url = ((pkgInfo || {}).repository || {}).url;
  var match = reGithubProject.exec(url);

  return match ? match[1].split('/').splice(0, 2).join('/') : '';
};