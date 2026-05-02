// Shared Wikipedia/Wikimedia image fetching for ERA MAPS
// Exposes globals: imgCache, isBadWikiImg, loadCommonsImg, loadWikiImg, getVenueImage

var imgCache = {};
var _noImg = {};  // venues where all sources have been tried and failed

function isBadWikiImg(url, title, w, h) {
  if (/\.svg/i.test(url || '')) return true;
  if ((w && w < 100) || (h && h < 100)) return true;
  var s = (title || url || '').toLowerCase();
  return /logo|icon|flag|map|diagram|chart|coat.of.arms|seal|emblem|portrait|headshot/.test(s);
}

function loadCommonsImg(query, cb) {
  var cn = '_cm' + Math.random().toString(36).substr(2, 9), done = false;
  var t = setTimeout(function () { if (done) return; done = true; cb(null); try { delete window[cn]; } catch (e) { } }, 6000);
  window[cn] = function (d) {
    if (done) return; done = true; clearTimeout(t); try {
      var pages = d.query && d.query.pages ? Object.values(d.query.pages) : [];
      var found = pages.filter(function (pg) {
        if (!pg.imageinfo || !pg.imageinfo[0]) return false;
        var ii = pg.imageinfo[0];
        if (!ii.thumburl && !ii.url) return false;
        var tt = pg.title || '';
        if (!/\.(jpg|jpeg|png)$/i.test(tt)) return false;
        if (/Commons-logo|Icon|Symbol|Flag_of|Logo|Pictogram|Map_of|Locator|Location_map|Wikimedia|Red_pog|Ambox|Nuvola|Padlock|OOjs|Wikidata|Information_icon|Gnome|Portal-|PD-icon|Gtk-dialog|Circle-icons|Noun_Project|Fairytale|Fxemoji|Breezeicons/i.test(tt)) return false;
        return true;
      });
      if (found.length > 0) { var ii = found[0].imageinfo[0]; cb(ii.thumburl || ii.url); } else { cb(null); }
    } catch (e) { cb(null); } try { delete window[cn]; } catch (e) { }
  };
  var s = document.createElement('script');
  s.src = 'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=' + encodeURIComponent(query + ' Los Angeles') + '&gsrnamespace=6&gsrlimit=4&prop=imageinfo&iiprop=url&iiurlwidth=500&format=json&callback=' + cn;
  s.onerror = function () { if (done) return; done = true; clearTimeout(t); cb(null); try { delete window[cn]; } catch (e) { } };
  document.head.appendChild(s); setTimeout(function () { try { s.remove(); } catch (e) { } }, 7000);
}

function loadWikiImg(slug, cb) {
  if (!slug) { cb(null); return; }
  if (imgCache[slug] !== undefined) { cb(imgCache[slug]); return; }
  var cn = '_w' + Math.random().toString(36).substr(2, 9), done = false;
  var t = setTimeout(function () { if (done) return; done = true; imgCache[slug] = null; cb(null); try { delete window[cn]; } catch (e) { } }, 6000);
  function fallbackGallery() {
    var cn2 = '_wf' + Math.random().toString(36).substr(2, 9), done2 = false;
    var t2 = setTimeout(function () { if (done2) return; done2 = true; imgCache[slug] = null; cb(null); try { delete window[cn2]; } catch (e) { } }, 6000);
    window[cn2] = function (d) {
      if (done2) return; done2 = true; clearTimeout(t2); try {
        var pages = d.query && d.query.pages ? Object.values(d.query.pages) : [];
        var found = pages.filter(function (pg) {
          if (!pg.imageinfo || !pg.imageinfo[0]) return false;
          var ii = pg.imageinfo[0];
          if (!ii.thumburl && !ii.url) return false;
          var tt = pg.title || '';
          if (!/\.(jpg|jpeg|png)$/i.test(tt)) return false;
          if (/Commons-logo|Icon|Symbol|Flag_of|Logo|Pictogram|Map_of|Locator|Location_map|Wikimedia|Red_pog|Ambox|Question_book|Edit-clear|Text-x|Folder_Hex|Disambig|Crystal_Clear|Nuvola|Padlock|Semi-protection|Lock-|OOjs|Increase2|Decrease2|Steady2|Star_full|Star_empty|Gold_medal|Silver_medal|Bronze_medal|Wikidata|Information_icon|Gnome|Replacement_character|Unbalanced|Search_icon|Portal-|P_vip|Emojione|Twemoji|Cscr-|PD-icon|Gtk-dialog|Circle-icons|Noun_Project|Fairytale|Silk-|Farm-Fresh|Fxemoji|Breezeicons|Splashscreen|LA_Skyline_Mountains2|LA.Skyline.Mountains/i.test(tt)) return false;
          if (isBadWikiImg(ii.thumburl || ii.url, tt, ii.thumbwidth, ii.thumbheight)) return false;
          return true;
        });
        var u = found.length > 0 ? (found[0].imageinfo[0].thumburl || found[0].imageinfo[0].url) : null;
        imgCache[slug] = u; cb(u);
      } catch (e) { imgCache[slug] = null; cb(null); } try { delete window[cn2]; } catch (e) { }
    };
    var s2 = document.createElement('script');
    s2.src = 'https://en.wikipedia.org/w/api.php?action=query&titles=' + encodeURIComponent(decodeURIComponent(slug)) + '&generator=images&gimlimit=3&prop=imageinfo&iiprop=url&iiurlwidth=500&redirects=1&format=json&callback=' + cn2;
    s2.onerror = function () { if (done2) return; done2 = true; clearTimeout(t2); imgCache[slug] = null; cb(null); try { delete window[cn2]; } catch (e) { } };
    document.head.appendChild(s2); setTimeout(function () { try { s2.remove(); } catch (e) { } }, 7000);
  }
  window[cn] = function (d) {
    if (done) return; done = true; clearTimeout(t); try {
      var p = Object.values(d.query.pages)[0];
      var u = p && p.thumbnail ? p.thumbnail.source : null;
      if (u && isBadWikiImg(u, p.pageimage, p.thumbnail.width, p.thumbnail.height)) u = null;
      if (u) { imgCache[slug] = u; cb(u); } else { fallbackGallery(); }
    } catch (e) { fallbackGallery(); } try { delete window[cn]; } catch (e) { }
  };
  var s = document.createElement('script');
  s.src = 'https://en.wikipedia.org/w/api.php?action=query&titles=' + encodeURIComponent(decodeURIComponent(slug)) + '&prop=pageimages&pithumbsize=500&redirects=1&format=json&callback=' + cn;
  s.onerror = function () { if (done) return; done = true; clearTimeout(t); imgCache[slug] = null; cb(null); try { delete window[cn]; } catch (e) { } };
  document.head.appendChild(s); setTimeout(function () { try { s.remove(); } catch (e) { } }, 7000);
}

// Main entry point: resolves the best image URL for a venue.
// Tries in order: v.img → Wikipedia → Wikimedia Commons.
// Calls cb synchronously on cache hit, asynchronously otherwise.
// cb receives the image URL string, or null if nothing found.
function getVenueImage(v, cb) {
  if (v.img) { cb(v.img); return; }
  if (_noImg[v.id]) { cb(null); return; }

  var query = v.n + (v.h ? ' ' + v.h : '');

  if (v.w) {
    // imgCache[v.w] truthy means we have a URL (from wiki or a previous commons fallback)
    if (imgCache[v.w]) { cb(imgCache[v.w]); return; }
    loadWikiImg(v.w, function (url) {
      if (url) { cb(url); }
      else {
        loadCommonsImg(query, function (cUrl) {
          if (cUrl) { imgCache[v.w] = cUrl; }  // cache commons result under wiki key
          else { _noImg[v.id] = true; }
          cb(cUrl);
        });
      }
    });
  } else {
    var cKey = '_c_' + v.id;
    if (imgCache[cKey] !== undefined) { cb(imgCache[cKey]); return; }
    loadCommonsImg(query, function (cUrl) {
      imgCache[cKey] = cUrl || null;
      if (!cUrl) _noImg[v.id] = true;
      cb(cUrl);
    });
  }
}
