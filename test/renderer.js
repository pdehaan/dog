/*jshint asi:true, esnext:true */

var dog = require('..')
  , test = require('tap').test
  , path = require('path')
  , postunoDir = path.join(__dirname, 'fixtures', 'testblog', 'postuno')
  ;

test('when rendering postuno that has an inlined and an external snippet', function (t) {

  dog.renderer.render(postunoDir, function (err, html) {
    t.test('# renders main header', function (t) {
      t.ok(~html.indexOf('<h1>Blog Uno</h1>'), 'Blog Uno')
      t.end()
    })

    t.test('# renders inlined javascript snippet with peacock', function (t) {
      t.ok(~html.indexOf('<h2>Inlined snippet</h2>'), 'header')
      t.ok(~html.indexOf('<pre><code class="lang-javascript"><div class="highlight"><pre>'), 'pre and div with highlight class')
      t.ok(~html.indexOf('<span class="k">var</span> some <span class="o">=</span> <span class="s">\'javascript\'</span><span class="p">;</span>'), 'snippet')
      t.end()
    })

    t.test('# renders inlined python snippet with node-syntaxhighlighter', function (t) {
      t.ok(~html.indexOf('<h2>Inlined snippet</h2>'), 'header')
      t.ok(~html.indexOf('<pre><code class="lang-python">'), 'pre and div with python language')
      t.ok(~html.indexOf('class="syntaxhighlighter'), 'syntaxhighlighter class')
      t.ok(~html.indexOf('<code class="plain">some </code><code class="keyword">=</code> <code class="string">\'python\'</code><code class="plain">;</code>'), 'snippet')
      t.end()
    })

    t.test('# renders external snippet javascript snippet with peacock', function (t) {
      t.ok(~html.indexOf('<h2>Snippet pulled in</h2>'), 'header')
      t.ok(~html.indexOf('<pre><code class="lang-js"><div class="highlight"><pre>'), 'pre and div with highlight class')
      t.ok(~html.indexOf('<span class="k">var</span> simple <span class="o">=</span> <span class="f">1</span><span class="p">;</span>'), 'snippet')
      t.end()
    })

    t.test('# wraps it in blog-post article', function (t) {
      t.ok(~html.indexOf('<article class="blog-post"'))
      t.end()
    })

    t.end()
  })

})


