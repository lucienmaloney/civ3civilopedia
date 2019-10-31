const PAGES = {
  'Wonders': 'gwdr',
  'City_Improvements': 'bldg',
  'Technologies': 'tech',
  'Governments': 'gvmt',
}

class Civilopedia {
  static urlPathToFilePath(section, page, desc) {
    return `public/civ3/${desc ? 'desc_' : ''}${section.toLowerCase()}_${page.toLowerCase()}.txt`;
  }

  static fileNameToUrlPath(fileName, book = 'civilopedia') {
    let fn = fileName;
    let desc = '';
    if (fileName.match(/^desc_/)) {
      fn = fn.substr(5);
      desc = '/desc';
    }
    const section = fn.substr(0, 4);
    const name = fn.substr(5);
    if (section === 'MENU') {
      return `/${book}/${PAGES[name]}`;
    }
    return `/${book}/${section}/${name}${desc}`;
  }

  static replaceLinks(text) {
    return text.replace(/\$LINK<([^=]*)=([^>]*)>/g, function(a, b, c) {
      return ` <a href="${Civilopedia.fileNameToUrlPath(c)}">${b}</a>`
    });
  }

  static formatText(text) {
    return (text.replace(/\[/g, '<i>')
                .replace(/\]/g, '</i>')
                .replace(/\{/g, '<b>')
                .replace(/\}/g, '</b>')
                .replace(/\n/g, ' ')
                .replace(/\^/g, '\n'))
                .replace(/    /g, '\t')
                .replace(/  /g, ' ');
  }

  static cleanText(text) {
    return text.split('\n').filter(t => t[0] !== '#').join('\n').trim();
  }

  static parseText(text) {
    return Civilopedia.cleanText(Civilopedia.formatText(Civilopedia.replaceLinks(text)));
  }
}

module.exports = Civilopedia;
