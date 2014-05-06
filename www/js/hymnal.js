/*global $ */

function valid(s){
  return s !== null && s !== undefined;
}

function get(s){
  return valid(s) ? s : '';
}

function getCategory(hymn){
  return get(hymn.properties.Category);
}

function getTitle(hymn){
  return valid(hymn.title)? hymn.title : 'Hymn '+hymn.id.substr(hymn.id.lastIndexOf('.')+1);
}

function getMeter(hymn){
  return valid(hymn.meter)? hymn.meter : '';
}

function updateBook(book){
  $('#book-name').text(book);
}

function updateBookNumber(bookNumber){
  $('#book-number').text(bookNumber);
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
  var style = sect.chorus? 'hymn-chorus' : 'hymn-verse';
  var s = '<div class="row hymn-section">';
  s += '<div class="col-xs-1">';
  if (!sect.chorus && sect.stanza > 0){
    s += '<p>' + sect.stanza + '</p>';
  }
  s += '</div>';
  s += '<div class="col-xs-11">';
  s += '<p class="'+style+'">';
  for (var i = 0; i < sect.lines.length; i++){
    s += sect.lines[i] + '<br/>';
  }
  s += '</p>';
  s += '</div>';  
  s += '</div>';
  return s;
}

function makeSong(song){
  var s = '<div class="row hymn-song">';
  for (var i = 0; i < song.length; i++){
    s += makeSection(song[i]);
  }
  s += '</div>';
  return s;
}

function makeNote(note){
  if (valid(note)){
    return '<div class="hymn-note"><p>'+note+'</p></div>';
  }
  else{
    return '';
  }
}

function makeAuthors(type, authors){
  //console.log(type+"/"+authors);
  var s = '<div class="row">';
  s += '<div class="col-sm-4">';
  s += '<p class="hymn-author-type">'+type;
  if (authors.length > 1) s += 's';
  s += ':</p>';
  s += '</div>';
  s += '<div class="col-sm-8"><p class="hymn-author-name">';
  for (var i = 0; i < authors.length; i++){
    s += authors[i] + '<br/>';
  }
  s += '</p></div>';
  s += '</div>';
  return s;
}

function makeAuthorship(hymn){

  var n = 0;
  if (valid(hymn.writers)) n++;
  if (valid(hymn.composers)) n++;

  var s = '';
  if (n < 1) return s;

  s += '<div class="row hymn-author">';

  if (n > 1){
    s += '<div class="col-md-6">';
    s += makeAuthors("Writer", hymn.writers);
    s += '</div>';
    s += '<div class="col-md-6">';
    s += makeAuthors("Composer", hymn.composers);
    s += '</div>';
  }
  else{
    var type = valid(hymn.writers)? "Writer" : "Composer";
    var authors = valid(hymn.writers)? hymn.writers : hymn.composers;
    s += '<div class="col-md-6 col-md-offset-3">';
    s += makeAuthors(type, authors);
    s += '</div>';
  }
  s += '</div>';

  return s;
}

function makePage(hymn){
  var s = '';
  s += makeCategory(getCategory(hymn));
  s += makeTitle(getTitle(hymn));
  s += makeMeter(getMeter(hymn));
  s += makeSong(hymn.song);
  if (valid(hymn.note)) s += makeNote(hymn.note);
  s += '<hr/>';
  s += makeAuthorship(hymn);
  return s;
}

function updateNav(hymn){
  var prop = hymn.properties;
  if (valid(prop) && valid(prop.Book)) updateBook(prop.Book);
  if (valid(prop) && valid(prop.BookNumber)) updateBookNumber(prop.BookNumber);
}