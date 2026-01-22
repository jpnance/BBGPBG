import 'dotenv/config';
import { readFileSync } from 'node:fs';
import pug from 'pug';
import superagent from 'superagent';
import config from './config.js';

const { sheetId, year } = config;
const apiKey = process.env.GOOGLE_SHEETS_API_KEY;

if (!apiKey) {
  console.error('Error: GOOGLE_SHEETS_API_KEY environment variable is not set');
  process.exit(1);
}

let glossaryFields = await superagent
  .get(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Glossary`)
  .query({ alt: 'json', key: apiKey })
  .then((response) => response.body.values);

let propFields = await superagent
  .get(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Props`)
  .query({ alt: 'json', key: apiKey })
  .then((response) => response.body.values);

const groupedProps =
  propFields
    .reduce(groupPropsByProposer, [])
    .sort(byProposerName);

const glossary = glossaryFields.reduce(glossaryEntries, {});

console.log(groupedPropsToHtml(groupedProps, glossary));

function lineToFields(line) {
  return line.split('\t');
}

function groupPropsByProposer(propsByProposer, [ propId, proposer, proposal, sideOne, sideTwo, winningSide, justification, pushable, notes, glossaryReferences ]) {
  let defaultPropsByProposer = { proposer, proposerId: proposer.toLowerCase().replace(/[ \.]/g, ''), props: [] };
  let existingPropsByProposer = propsByProposer.find((props) => props.proposer === proposer) || defaultPropsByProposer;

  if (existingPropsByProposer === defaultPropsByProposer) {
    propsByProposer.push(existingPropsByProposer);
  }

  existingPropsByProposer.props.push({
    proposal,
    sides: [sideOne, sideTwo],
    pushable,
    notes,
    glossaryReferences: glossaryReferences?.split(',') || [],
  });

  return propsByProposer;
}

function byProposerName(a, b) {
  return a.proposer.localeCompare(b.proposer);
}

function groupedPropsToHtml(groupedProps, glossary) {
  const compiledTemplate = pug.compileFile('template.pug');

  return compiledTemplate({ groupedProps, glossary, year });
}

function glossaryEntries(glossary, [term, definition]) {
  glossary[term.trim()] = definition.trim();

  return glossary;
}
