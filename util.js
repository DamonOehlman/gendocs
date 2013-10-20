var regexes = [
  /^.*(github\.com)\/(.*)\.git.*$/, // github
  /^.*(bitbucket\.org)\/(.*)\.git.*$/ // bitbucket
];

exports.getRepoName = function(pkgInfo) {
  var url = ((pkgInfo || {}).repository || {}).url;
  var match = regexes.reduce(function(memo, regex) {
    return memo || regex.exec(url);
  }, false);

  return match && {
    host: match[1],
    path: match[2].split('/').splice(0, 2).join('/')
  };
};