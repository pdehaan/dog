#!/usr/bin/env node

var render = module.exports.render = require('./lib/renderer').render
  , publish = module.exports.publish = require('./lib/publish')
  ;

if (module.parent) return;

var log = require('npmlog')
  , path = require('path')
  ;

var argv = require('optimist')
    .alias('a', 'action')
    .describe('a', 'One of the following: preview, publish')
    .default('a', 'preview')

    .alias('p', 'post')
    .describe('p', 'The directory in which the post resides inside the blog directory')
    .demand('p')

    .alias('t', 'title')
    .describe('t', 'The title to give to the post')

    .alias('s', 'tags')
    .describe('s', 'Post subjects with which it will be tagged')
    .default('s', 'untagged')

    .argv
  , postdir = path.join(__dirname, 'blog', argv.post)
  ;

  
switch(argv.action) {

  case 'preview':
    render(postdir, function (err, html) {
      if (err) { log.error('blog', err); return; }

      log.info('preview', 'Opening blog %s in browser', argv.blog);
      require('./lib/preview')(postdir, html);
    });
    break;
  
  case 'publish':
    var tags = argv.tags
          .split(' ')
          .map(function (s) { return s.trim(); })
      , opts = {
          title: argv.title
        , tags: tags
      };

    publish(postdir, opts, function (err) {
      if (err) { log.error('publish', err); return; }
      log.info('publish', 'Post %s successfully published/updated', argv.post);
    });
    break;

  
  default:
    log.error('blog-engine', 'Unknown action:', argv.action);
    break;
}
  





