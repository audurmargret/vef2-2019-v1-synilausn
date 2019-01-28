const jsdom = require('jsdom');

const { JSDOM } = jsdom;
const { document } = (new JSDOM()).window;

/**
 * Hjálparfall sem býr til element og bætir við börnum, ef einhver skilgreind.
 *
 * @param {string} name Nafn á elementi sem búa á til
 * @param {...string|object} children Börn sem bæta á við, geta verið strengur
 *   eða element. Ef strengur er textanóðu bætt við, annars er elementi bætt við
 *   sem barni
 * @returns {object} Element með börnum
 */
function el(name, ...children) {
  const element = document.createElement(name);

  if (Array.isArray(children)) {
    for (let child of children) { /* eslint-disable-line */
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child) {
        element.appendChild(child);
      }
    }
  }

  return element;
}

/**
 * Býr til element sem heldur utan um alla sértæka hluti.
 *
 * @param {string} type Gerð á hlut
 * @param  {...object} data Börn sem bæta á við
 * @returns {object} Element fyrir hlut
 */
function item(type, ...data) {
  const content = el('div', ...data);
  content.classList.add('item__content');

  const wrapper = el('div', content);
  wrapper.classList.add('item', `item--${type}`);

  return wrapper;
}

/**
 * Býr til textahlut þar sem <p> umlykur hverja línu.
 *
 * @param {string} data Texti
 * @returns {object} Element fyrir texta
 */
function text(data) {
  const split = data.split('\n');

  const texts = split.map((t) => {
    const p = el('p', t);
    p.classList.add('item__text');
    return p;
  });

  return item('text', ...texts);
}

/**
 * Býr til tilvitnun með texta og vísun.
 *
 * @param {string} data Texti tilvitnunar
 * @param {string} attribute Sá sem vísað er í
 * @returns {object} Element fyrir tilvitnun
 */
function quote(data, attribute) {
  const quoteText = el('p', data);
  quoteText.classList.add('item__quote');

  const quoteAttribute = el('p', attribute);
  quoteAttribute.classList.add('item__attribute');

  const blockquote = el('blockquote', quoteText, quoteAttribute);

  return item('blockquote', blockquote);
}

/**
 * Býr til fyrirsögn.
 *
 * @param {string} data Texti fyrirsagnar
 * @returns {object} Element fyrir fyrirsögn.
 */
function heading(data) {
  const element = el('h3', data);
  element.classList.add('item__heading');

  return item('heading', element);
}

/**
 * Býr til lista úr fylki af strengjum.
 *
 * @param {array} data Fylki af strengjum
 * @returns {object} Element fyrir lista
 */
function list(data) {
  const items = data.map((i) => {
    const li = el('li', i);
    li.classList.add('item__li');
    return li;
  });

  const ul = el('ul', ...items);
  ul.classList.add('item__ul');

  return item('list', ul);
}

/**
 * Býr til kóðabút.
 *
 * @param {string} data Kóðabútur
 * @returns {object} Element fyrir kóða
 */
function code(data) {
  const element = el('pre', data);
  element.classList.add('item__code');

  return item('code', element);
}

/**
 * Býr til YouTube myndband í iframe.
 *
 * @param {string} url Slóð á YouTube myndband
 * @returns {object} Element fyrir myndband
 */
function youtube(url) {
  const iframe = el('iframe');
  iframe.classList.add('item__iframe');
  iframe.setAttribute('src', url);
  iframe.setAttribute('frameborder', 0);
  iframe.setAttribute('allowfullscreen', true);

  return item('youtube', iframe);
}

/**
 * Býr til mynd með texta.
 *
 * @param {string} data Slóð á mynd
 * @param {string} caption Texti við mynd
 * @returns {object} Element fyrir mynd
 */
function image(data, caption) {
  const imageElement = el('img');
  imageElement.classList.add('image__img');
  imageElement.setAttribute('alt', caption);
  imageElement.setAttribute('src', data);

  const imageAttribution = el('p', caption);
  imageAttribution.classList.add('item__caption');

  const blockquote = el('div', imageElement, imageAttribution);

  return item('image', blockquote);
}

/**
 * Býr til HTML streng út frá fylki af efni þar sem efni hefur ákveðna týpu og
 * gögn.
 *
 * @param {array} content Fylki af efni
 * @returns {string} HTML streng fyrir efni
 */
function createContent(content) {
  const wrapper = el('div');

  content.forEach((i) => {
    let contentItem;
    switch (i.type) {
      case 'youtube':
        contentItem = youtube(i.data);
        break;
      case 'text':
        contentItem = text(i.data);
        break;
      case 'list':
        contentItem = list(i.data);
        break;
      case 'heading':
        contentItem = heading(i.data);
        break;
      case 'code':
        contentItem = code(i.data);
        break;
      case 'quote':
        contentItem = quote(i.data, i.attribute);
        break;
      case 'image':
        contentItem = image(i.data, i.caption);
        break;
      default:
        contentItem = el('div', i.type);
    }

    wrapper.appendChild(contentItem);
  });

  return wrapper.outerHTML;
}

module.exports = createContent;
