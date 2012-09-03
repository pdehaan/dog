/* Metadata schema:
 *
 * PostData : {
 *  title: 'post title'
 *  name: 'post_name' (same as containing folder)
 *  created: date
 *  updated: date
 *  tags: [] (for this particular post)
 * }
 *
 * BlogData: {
 *  posts [
 *    "post1"
 *    "post2"
 *  ]
 *  tags: [] (of all posts)
 *  styles: []
 * }
 * 
 */

var utl  =  require('./utl')
  , fs   =  require('fs')
  , log  =  require('npmlog')
  , path =  require('path')
    , defaultBlogMetadata = {
        posts :  []
      , tags  :  []
      , styles:  [ 'code', 'code-fixes', 'blog' ]
    }
  ;

function createPostMetadata(current, opts) {
  var metadata = utl.merge(current, opts)
    , json = JSON.stringify(metadata, undefined, 2)
    ;

  log.info('publisher', 'Created/Updated PostMetadata:', json);
  return { metadata: metadata, json: json };
}

function createBlogMetadata(current, postMetadata) {

  if(current.posts.indexOf(postMetadata.name) < 0) current.posts.push(postMetadata.name);

  postMetadata.tags.forEach(function (tag) {
    if(current.tags.indexOf(tag) < 0) { 
      log.info('publisher', 'adding tag', tag);
      current.tags.push(tag);
    }
  });

  var json = JSON.stringify(current, undefined, 2);

  log.info('publisher', 'Created/Updated IndexMetadata:', json);
  return { metadata: current, json: json };
}

/* 
 * Calls back with metadata found inside given file if it exists, otherwise with null
 */
function resolveCurrentMetadata(metadataFile, cb) {
  var metadata;

  utl.exists(metadataFile, function (exists) {
    if (!exists) { 
      cb(null, null);
      return;
    }

    fs.readFile(metadataFile, 'utf8', function (err, data) {
      if (err) { cb(err); return; }  
      try {
        var current = JSON.parse(data);
        cb(null, current);
      } catch (excep) {
        cb(excep);
      }
    });
  });
}

function publish(postdir, opts, published) {
  var postMetadataFile =  path.join(postdir, 'post.json')
    , blogMetadataFile =  path.join(postdir, '..', 'blog.json')
    , defaultPostMetadata =  {
        created :  utl.now()
      , updated :  utl.now()
      , tags    :  []
      , name    :  utl.innermostDir(postdir)
      , title   :  "Untitled"
      }
    , metadata
    ;
  
  function writePostMetadata(cb) {

    resolveCurrentMetadata(postMetadataFile, function (err, currentMetadata) {
      if (err) { published(err); return; }

      metadata = createPostMetadata(currentMetadata || defaultPostMetadata, opts);
      fs.writeFile(postMetadataFile, metadata.json, 'utf8', function (err) {
        if (err) published(err); else cb(metadata.metadata);
      });
    });
  }

  function writeBlogMetadata(postMetadata) {

    resolveCurrentMetadata(blogMetadataFile, function (err, currentBlogMetadata) {
      if (err) { published(err); return; }
      
      metadata = createBlogMetadata(currentBlogMetadata || defaultBlogMetadata, postMetadata);
      fs.writeFile(blogMetadataFile, metadata.json, 'utf8', function (err) {
        if (err) published(err); else published(null);
      });
    });
  }

  opts.updated = utl.now();

  utl.ensurePathExists(postdir, function (err) {
    if (err) { published(err); return; }

    writePostMetadata(writeBlogMetadata);
  });
}

function includeStyles(blogdir, styles, included) {

  var stylesdir = path.join(blogdir, 'assets', 'styles')
    , blogMetadataFile = path.join(blogdir, 'blog.json')
    ;

  function ensureStylesExist(cb) {
    var tasks = styles.length
      , abort = false
      ;

    styles.forEach(function (style) {
      var stylesPath = path.join(stylesdir, style + '.css');

      utl.ensurePathExists(stylesPath, function (err) {
        if (abort) return;
        if (err) { cb(err); abort = true; return; }
        if (--tasks === 0) cb(null);
      });
    });
  }
  
  ensureStylesExist(function (err) {
    if (err) { included(err); return; }
    log.info('publisher', 'including', styles);

    resolveCurrentMetadata(blogMetadataFile, function (err, currentBlogMetadata) {
      if (err) { included(err); return; }
      
      metadata = currentBlogMetadata || defaultBlogMetadata;
      metadata.styles = styles;
      var json = JSON.stringify(metadata, null, 2);

      fs.writeFile(blogMetadataFile, json, 'utf8', function (err) {
        if (err) included(err); else included(null);
      });
    });
  });
}


module.exports = {
    publish : publish
    // TODO: not tested yet
  , includeStyles : includeStyles
};

if (module.parent) return;

includeStyles(path.join(__dirname, '..', 'blog'), ['code', 'code-fixes'], function (err) {
  if (err) { log.error('publisher', err); }
});