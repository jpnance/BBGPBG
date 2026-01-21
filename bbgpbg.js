const debugButton = document.querySelector('button.debug');

debugButton?.addEventListener('click', debugMakePicks);

const validateAndCopyButtons = document.querySelectorAll('button.validate-and-copy');

validateAndCopyButtons.forEach((button) => {
  button.addEventListener('click', validateForm);
});

const modalDialog = document.querySelector('dialog');
const closeModalButton = document.querySelector('button.close-modal');

closeModalButton.addEventListener('click', closeModal);

function ensureTwoPicksForProposer([ proposerId, picks ]) {
  const numberOfPicks = picks.filter((picks) => picks.value !== 'X').length;

  const proposer = picks[0].proposer; // bleh, dirty

  if (numberOfPicks < 2) {
    throw new Error(`You need to make more picks from ${proposer}'s props.`);
  }
  else if (numberOfPicks > 2) {
    throw new Error(`You have made too many picks from ${proposer}'s props.`);
  }
}

function ensureTwoPicksPerProposer(picks) {
  try {
    Object.entries(picks).forEach(ensureTwoPicksForProposer);
  } catch (exception) {
    throw exception;
  }
}

function gatherAllInputs() {
  return document.querySelectorAll('input');
}

function gatherAllPicks(selector) {
  const inputs = gatherAllInputs();

  const picksByProposer =
    Array.from(inputs)
      .filter(selectedInputs)
      .map(toPickTuple)
      .filter(removeSelectorsOwnPicks(selector))
      .reduce(groupPicksByProposer, {});

  return picksByProposer;
}

function removeSelectorsOwnPicks(selector) {
  return ([ propId, prop ]) => {
    return !propId.startsWith(selector.toLowerCase().replace(/[ \.]/g, ''));
  };
}

function groupPicksByProposer(picksByProposer, currentPickTuple) {
  const proposerId = currentPickTuple[0].split('-')[0];
  const pick = currentPickTuple[1];

  picksByProposer[proposerId] = picksByProposer[proposerId] ?? [];

  picksByProposer[proposerId].push(pick);

  return picksByProposer;
}

function selectedInputs(input) {
  return input.checked;
}

function toPickTuple(pick) {
  return [pick.name, { propId: pick.name, proposer: pick.dataset.proposer, proposal: pick.dataset.proposal, value: pick.value }];
};

function validateForm(event) {
  event.preventDefault();
  event.stopPropagation();

  let caughtAnError = false;

  const selector = getSelector();

  let picks = gatherAllPicks(selector);

  try {
    ensureSelector();
    ensureTwoPicksPerProposer(picks);
  } catch (exception) {
    openModalWith('Not yet!', exception.message);
    caughtAnError = true;
  } finally {
    if (!caughtAnError) {
      writeToClipboard(prettifyPicks(picks));
      openModalWith('Almost done!', 'Your ticket has been copied to your clipboard. Open up a new email to jpnance@gmail.com and paste in the contents. It\'ll look a little weird but you should be able to recognize it as your ticket.');
    }
  }
}

function writeToClipboard(text) {
  navigator.clipboard.writeText(text);
}

function closeModal() {
  modalDialog.close();
}

function openModalWith(heading, description) {
  const h1 = modalDialog.querySelector('h1');
  const p = modalDialog.querySelector('p');

  h1.textContent = heading;
  p.textContent = description;

  modalDialog.showModal();
}

function debugMakePicks() {
  const inputs = gatherAllInputs();

  inputs.forEach((input) => {
    if (input.id.endsWith('-0-0') || input.id.endsWith('-1-0')) {
      input.click();
    }
  });
}

function prettifyPicks(picks) {
  const selector = getSelector();

  return Object.entries(picks)
    .map(([proposerId, props]) => {
      return props.filter((prop) => prop.value !== 'X');
    })
    .flat()
    .map(({ propId, proposer, proposal, value }) => {
      return [propId, selector, proposer, proposal, value].join(' | ');
    })
    .join('\r\n');
}

function getSelector() {
  const whoAreYouSelect = document.querySelector('select.who-are-you');

  return whoAreYouSelect.value;
}

function ensureSelector() {
    const selector = getSelector();

    if (selector === '--') {
      throw new Error('Tell me who you are with the drop-down menu at the top.');
    }
}
