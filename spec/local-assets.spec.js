var Peepub          = require('pe-epub');
var _               = require('lodash');
var fs              = require('fs');
var cheerio         = require('cheerio');
var path            = require('path');
var epubJson        = require('../examples/example.json');
var pp;



describe("Local assets in the EPUB", function(){
  beforeEach(function(){
    pp = new Peepub(_.cloneDeep(epubJson), true);
  });

  it("can pull in local assets", function(){
    var epubPath = '';
    var localTestFile = __dirname + "/assets/test.jpg";
    runs(function(){
      pp.json.pages[0].body += "<img src='file://"+localTestFile+"'/>";
      pp.create(function(err, file){
        epubPath = pp._epubPath();
      });
    });

    waitsFor(function(){
      return epubPath !== '';
    }, "it to assemble everything");

    runs(function(){
      expect(fs.existsSync(epubPath + Peepub.EPUB_CONTENT_DIR + 'assets/' + path.basename(localTestFile))).toBe(true);
      pp.clean();
    });
  });

  it("can pull in local pages", function(){
    var epubPath = '';
    var localTestFile = __dirname + "/assets/test.html";

    fs.writeFileSync(localTestFile, "<!DOCTYPE html>\n<body>\n" + pp.json.pages[0].body + "\n</body>\n</html>");
    var ogPageBody = pp.json.pages[0].body;
    pp.json.pages[0].body = 'file://' + localTestFile;

    runs(function(){
      pp.create(function(err, file){
        epubPath = pp._epubPath();
      });
    });

    waitsFor(function(){
      return epubPath !== '';
    }, "it to assemble everything");

    runs(function(){
      var firstPage  = fs.readFileSync(epubPath + Peepub.EPUB_CONTENT_DIR + pp.json.pages[0].href, 'utf8');
      var $page      = cheerio.load(firstPage);

      expect($page('body').html().replace(/(\n|\t)/g, '')).toBe(ogPageBody.replace(/(\n|\t)/g, ''));

      fs.unlinkSync(localTestFile);
      pp.clean();
    });
  });
  
});