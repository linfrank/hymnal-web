/*global $ */

function valid(s){
  return s !== null && s !== undefined;
}

function get(s){
  return valid(s) ? s : '';
}

/* Hymnbook Cover */

function makeCoverPage(title) {
  var s = '<div class="hymnbook-cover">';
  s += '<div class="hymnbook-title">' + get(title) + '</div>';
  s += '<div class="progress-bar-total">';
  s += '<div id="progress-bar" class="progress-bar-current" style="width:0%"></div>';
  s += '</div>';
  s += '</div>';
  return s;
}

/* Hymn page */

function getCategory(hymn){
  return get(hymn.properties.Category);
}

function getTitle(hymn){
  return valid(hymn.title)? hymn.title : '' //makeHorizontalLine(100, 1, '#333'); //'Hymn '+hymn.id.substr(hymn.id.lastIndexOf('.')+1);
}

function getMeter(hymn){
  return valid(hymn.meter)? hymn.meter : '';
}

function updateBook(book){
  $('#book-name').text(book);
}

function makeCategory(cat){
  return '<h4 class="hymn-category">'+cat+'</h4>';
}

function makeTitle(title){
  return '<h4 class="hymn-title">'+title+'</h4>';
}

function makeMeter(meter){
  return '<p class="hymn-meter">'+meter+'</p>';
}

function makeSection(sect){
  var s = '<div class="hymn-section">';
  if (!sect.chorus && sect.stanza > 0){
    s += '<div class="hymn-verse-number col-sm-1 col-xs-12">';
    s += sect.stanza;
  } else {
    s += '<div class="col-sm-1 col-xs-12">';
    // empty div
  }
  s += '</div>';
  var style = sect.chorus? 'hymn-chorus' : 'hymn-verse';
  s += '<div class="' + style + ' col-sm-11 col-xs-12">';
  for (var i = 0; i < sect.lines.length; i++){
    s += '<p>' + sect.lines[i] + '</p>';
  }
  s += '</div>';
  s += '</div>';
  return s;
}

function makeSong(song){
  var s = '<div class="hymn-song">';
  for (var i = 0; i < song.length; i++){
    s += makeSection(song[i]);
  }
  s += '</div>';
  return s;
}

function makeNote(note){
  if (valid(note)){
    return '<div class="hymn-note">'+note+'</div>';
  }
  else{
    return '';
  }
}

function makeAuthors(type, authors){
  var s = '<div class="row hymn-author">';
  s += '<div class="col-xs-6 hymn-author-type">';
  s += type;
  s += '</div>';
  s += '<div class="col-xs-6 hymn-author-name">';
  for (var i = 0; i < authors.length; i++){
    s += authors[i] + '<br/>';
  }
  s += '</div>';
  s += '</div>';
  return s;
}

function makeAuthorship(hymn){

  var hasWriters = valid(hymn.writers) && hymn.writers.length > 0;
  var hasComposers = valid(hymn.composers) && hymn.composers.length > 0;

  var s = '';
  if (!hasWriters && !hasComposers) return s;

  s += '<div class="row hymn-authorship">';

  if (hasWriters && hasComposers){
    s += '<div class="col-md-6">';
    s += makeAuthors("Lyrics", hymn.writers);
    s += '</div>';
    s += '<div class="col-md-6">';
    s += makeAuthors("Music", hymn.composers);
    s += '</div>';
  }
  else{
    var type = hasWriters? "Lyrics" : "Music";
    var authors = hasWriters? hymn.writers : hymn.composers;
    s += '<div class="col-md-6 col-md-offset-3">';
    s += makeAuthors(type, authors);
    s += '</div>';
  }
  s += '</div>';

  return s;
}

function makeHymnPage(hymn){
  var s = '<div class="hymn-page flip-page">';
  s += makeCategory(getCategory(hymn));
  s += makeTitle(getTitle(hymn));
  s += makeMeter(getMeter(hymn));
  s += makeSong(hymn.song);
  if (valid(hymn.note)) s += makeNote(hymn.note);
  s += makeAuthorship(hymn);
  s += '</div>';
  return s;
}

function updateNav(hymn){
  var prop = hymn.properties;
  if (valid(prop) && valid(prop.Book)) updateBook(prop.Book);
}

/* Topics page */

function makeTopicsPage(topics){
  
}

/* Misc */

function makeHorizontalLine(length, width, color){
  var w = width + 2;
  var s = '<svg width="' + length + 'px" height="' + w + 'px" viewBox="0 0 ' + length + ' ' + w + '">';
  s += '<line x1="0" y1="' + (w / 2) + '" x2="' + length + '" y2="' + (w / 2) + '" style="stroke: ' + color + ';"/>';
  s += '</svg>';
  return s;
}