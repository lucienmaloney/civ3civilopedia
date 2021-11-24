const fs = require('fs');
const Civ = require('./Civilopedia');
const router = require('express').Router();

class Page {
  constructor(page, name, image, abbr, color) {
    this.page = page;
    this.name = name;
    this.image = image;
    this.abbr = abbr;
    this.color = color;
  }

  get path() {
    return `/civilopedia/${this.abbr}`;
  }

  get bordercolor() {
    return 'red';
  }

  get view() {
    return `civ3pedia/${this.page}`;
  }
}

const PAGES = {
  race: new Page('concepts', 'Tribes', 'menu', 'race', 'red'),
  tech: new Page('advances', 'Civiliation Advances', 'literature', 'tech', 'grey'),
  gwdr: new Page('improvement', 'Great Wonders', 'thepyramids', 'gwdr', 'yellow'),
  swdr: new Page('improvement', 'Small Wonders', 'apollo', 'swdr', 'yellow'),
  bldg: new Page('improvement', 'City Improvements', 'walls', 'bldg', 'yellow'),
  gvmt: new Page('government', 'Governments', 'democracy', 'gvmt', 'pink'),
  prto: new Page('unit', 'Units', 'rifleman', 'prto', 'blue'),
  tfrm: new Page('actions', 'Worker Actions', 'clearwetlands', 'tfrm', 'limegreen'),
  terr: new Page('terrain', 'Terrain', 'mountains', 'terr', 'limegreen'),
  good: new Page('resources', 'Resources', 'oil', 'good', 'orange'),
  gcon: new Page('concepts', 'Game Concepts', 'concepts', 'gcon', 'red'),
}

const CIVILOPEDIA_JSON = require('../../public/civ3complete.json');

let CIVILOPEDIA_NAMES = {};
Object.keys(CIVILOPEDIA_JSON).forEach(k1 => {
  Object.keys(CIVILOPEDIA_JSON[k1]).forEach(k2 => {
    CIVILOPEDIA_NAMES[CIVILOPEDIA_JSON[k1][k2].name] = k2;
  });
});

function nameToLink(name) {
  const key = CIVILOPEDIA_NAMES[name];
  return {
    name: name.replace(/\(([^)]+)\)/, ''),
    path: Civ.fileNameToUrlPath(key),
    image: name.toLowerCase().replace(/_| |\//g, '').replace(/\(([^)]+)\)/, ''),
    bordercolor: PAGES[key.substring(0, 4)].color,
  };
}

router.get('/', function(req, res, next) {
  const keys = Object.keys(PAGES);

  res.status(200).render(PAGES.gcon.view, {
    header: 'Main Menu',
    image: 'menured',
    menu: keys.map(k => PAGES[k]),
    uplink: '',
    leftlink: '',
    rightlink: '',
    letterlink: '/civilopedia',
  });
});

router.get('/:section', function(req, res, next) {
  const section = (req.params.section || '').toLowerCase();

  if (PAGES[section].name) {
    let keys = Object.keys(CIVILOPEDIA_JSON[section] || CIVILOPEDIA_JSON.bldg);
    if (section === 'bldg') {
      keys = keys.filter(k => CIVILOPEDIA_JSON.bldg[k].type === 'Improvement');
    } else if (section === 'gwdr') {
      keys = keys.filter(k => CIVILOPEDIA_JSON.bldg[k].type === 'Great Wonder');
    } else if (section === 'swdr') {
      keys = keys.filter(k => CIVILOPEDIA_JSON.bldg[k].type === 'Small Wonder');
    }


    const menu = keys.map(k => {
      const name = (CIVILOPEDIA_JSON[section] || CIVILOPEDIA_JSON.bldg)[k].name;
      const image = section === 'gcon' ? 'concepts' : name.toLowerCase().replace(/_| |\//g, '').replace(/\(([^)]+)\)/, '');
      return {
        name: name.replace(/\(([^)]+)\)/, ''),
        image: image,
        path: Civ.fileNameToUrlPath(k),
        bordercolor: PAGES[section].color,
      };
    });

    const sectionKeys = Object.keys(PAGES);
    const length = sectionKeys.length;
    const index = sectionKeys.indexOf(section);

    res.status(200).render(PAGES.gcon.view, {
      header: PAGES[section].name,
      text: '',
      image: PAGES[section].image,
      menu: menu,
      uplink: '/civilopedia',
      leftlink: `/civilopedia/${sectionKeys[(index + length - 1) % length]}`,
      rightlink: `/civilopedia/${sectionKeys[(index + 1) % length]}`,
      letterlink: `/civilopedia/${section}`,
    });
  } else {
    next();
  }
});

router.get('/:section/:page/:desc(desc)?', function(req, res, next) {
  let section = (req.params.section || '').toLowerCase();
  section = section === "govt" ? "gvmt" : section;
  const page = (req.params.page || '').toLowerCase();
  const full = `${section}_${page}`;
  const desc = req.params.desc;

  if (CIVILOPEDIA_JSON[section] && CIVILOPEDIA_JSON[section][full]) {
    const data = CIVILOPEDIA_JSON[section][full];
    const image = section === 'gcon' ? 'concepts' : `${data.name.toLowerCase().replace(/_| |\//g, '').replace(/\(([^)]+)\)/, '')}`;
    const view = desc ? PAGES.gcon.view : PAGES[section].view;
    const descLabel = desc ? 'Effects' : section === 'race' || section === 'gcon' ? 'More' : 'Description';

    const sectionKeys = Object.keys(CIVILOPEDIA_JSON[section]);
    const length = sectionKeys.length;
    const index = sectionKeys.indexOf(full);

    const menuSection = data.type === 'Great Wonder' ? 'gwdr' : data.type === 'Small Wonder' ? 'swdr' : section;

    let advances = [];
    let resources = [];
    let techdata = [];
    let techadvances = {};
    let linkdata = {};
    if (data.Resources) {
      resources = data.Resources.map(nameToLink);
    }
    if (data.Advance) {
      advances.push(nameToLink(data.Advance));
    } else if (section === 'gvmt' && data.requires) {
      advances.push(nameToLink(data.requires));
    }
    if(section === 'tech') {
      const keys = Object.keys(data.allows);
      keys.forEach(key => {
        if (data.allows[key].length) {
          techdata.push({
            name: key,
            data: data.allows[key].map(nameToLink),
          });
        }
      });

      techadvances.tech = nameToLink(data.name);
      techadvances.requires = data.tech.requires.map(nameToLink);
      techadvances.allows = data.tech.allows.map(nameToLink);
    }
    if (section === 'bldg') {
      if (data.Obsolete) {
        linkdata.obsolete = Civ.fileNameToUrlPath(CIVILOPEDIA_NAMES[data.Obsolete]);
      }
      if (data['Required Government']) {
        linkdata.reqgov = Civ.fileNameToUrlPath(CIVILOPEDIA_NAMES[data['Required Government']]);
      }
    }
    if (section === 'prto' && data['Upgrades To']) {
      linkdata.upgradesto = Civ.fileNameToUrlPath(CIVILOPEDIA_NAMES[data['Upgrades To']]);
    }

    res.status(200).render(view, {
      text: desc ? Civ.parseText(data.description) : Civ.parseText(data.text),
      header: data.name.replace(/\(([^)]+)\)/, ''),
      image: image,
      menu: [],
      uplink: `/civilopedia/${menuSection}`,
      letterlink: `/civilopedia/${menuSection}`,
      more: data.description ? descLabel : '',
      moreLink: `/civilopedia/${section}/${page}${desc ? '' : '/desc'}`,
      leftlink: `/civilopedia/${section}/${sectionKeys[(index + length - 1) % length].substring(5)}`,
      rightlink: `/civilopedia/${section}/${sectionKeys[(index + 1) % length].substring(5)}`,
      data: data,
      resources,
      advances,
      techdata,
      techadvances,
      linkdata,
    });
  } else {
    next();
  }
});

module.exports = router;
