const util = require('util');
const fs = require('fs');
const express = require('express');

const router = express.Router();

const readFileAsync = util.promisify(fs.readFile);

/**
 * Higher-order fall sem umlykur async middleware með villumeðhöndlun.
 *
 * @param {function} fn Middleware sem grípa á villur fyrir
 * @returns {function} Middleware með villumeðhöndlun
 */
function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

/**
 * Les gögn async úr JSON skrá.
 *
 * @returns {object} Gögnum úr JSON skrá
 */
async function readList() {
  // hér væri líka hægt að gera bara `require('./lecrures.json')`  en sýnum
  // hvernig skjal lesið og JSON unnið
  const file = await readFileAsync('./lectures.json');

  const json = JSON.parse(file);

  return json;
}

/**
 * Route handler sem birtir lista af fyrirlestrum.
 *
 * @param {object} req Request hlutur
 * @param {object} res Response hlutur
 */
async function list(req, res) {
  const title = 'Fyrirlestrar';
  const json = await readList();
  const { lectures } = json;

  res.render('lectures', { title, lectures });
}

/**
 * Route handler sem birtir fyrirlestur. Ef fyrirlestur finnst ekki í JSON skrá
 * er kallað í next() sem mun enda í 404 handler.
 *
 * @param {object} req Request hlutur
 * @param {object} res Response hlutur
 * @param {function} next Næsta middleware
 */
async function lecture(req, res, next) {
  const { slug } = req.params;

  const json = await readList();
  const { lectures } = json;

  const foundLecture = lectures.find(a => a.slug === slug);

  if (!foundLecture) {
    // sendum í 404 handler
    return next();
  }

  const { title } = foundLecture;

  return res.render('lecture', { title, lecture: foundLecture });
}

router.get('/', catchErrors(list));
router.get('/:slug', catchErrors(lecture));

module.exports = router;
