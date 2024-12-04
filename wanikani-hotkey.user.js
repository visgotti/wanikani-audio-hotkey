// ==UserScript==
// @name          WaniKani Second Audio Hotkey
// @namespace     https://www.wanikani.com
// @description   Plays second audio when pressing the k key
// @version       0.0.1
// @author        Visgotti
// @include       *://www.wanikani.com*
// @match        https://www.wanikani.com*
// @match        https://www.wanikani.com/subjects/review*
// @match        https://www.wanikani.com/subject-lessons/*
// @grant         none
// ==/UserScript==

const HOTKEY = 'k';

(function() {
  "use strict";

  let lastPlayedAudioSrc = '';
  let lastPlayedAudioCharacters = '';

  const waitUntilTrue = async (fn, timeout = 5000, checkInterval=100) => {
    const startAt = Date.now();

    const checkCondition = async (resolve, reject) => {
      let resolved = false;
      try {
        resolved = await fn();
      } catch (err) {
        console.error('Error occurred while checking function:', err);
      }
      if (resolved) {
        return resolve(true);
      } else if (Date.now() - startAt > timeout) {
        return reject(`Timeout of ${timeout} checking for condition.`);
      } else {
        setTimeout(() => checkCondition(resolve, reject), checkInterval);
      }
    };
    return new Promise(checkCondition);
  };

  const tryPlayAudio = async () => {
    const pressShowInfo = document.querySelector('.additional-content__item.additional-content__item--item-info');

    // only works on vocab pages
    const characterHeader = document.querySelector('.quiz .character-header');
    if(!characterHeader || !characterHeader.classList.contains('character-header--vocabulary')) {
      return false;
    }

    // dont play if not enabled yet.
    if(pressShowInfo.classList.contains('additional-content__item--disabled')) {
      return;
    }

    // open show info to ensure we can get audio elements.
    if(!pressShowInfo.classList.contains('additional-content__item--open')) {
      pressShowInfo.click();
    }

    let secondAudioItem;
    let currentItemCharacters;

    try {
      await waitUntilTrue(() => {
        const currentCharacters = document.querySelector('.quiz .character-header__characters');
        if(!currentCharacters) {
          return false;
        }
        currentItemCharacters = currentCharacters.textContent;
        secondAudioItem = document.querySelectorAll('.reading-with-audio__audio-item')[1];
        if(!secondAudioItem) {
          return false;
        }
        return true;
      }, 10000, 100);
      
      let audioElement;
      let audioElementSrc;
      const getAudioElement = () => {
        secondAudioItem = document.querySelectorAll('.reading-with-audio__audio-item')[1];
        if(!secondAudioItem) {
          return false;
        }
        audioElement = secondAudioItem.querySelector('audio');
        if(!audioElement) {
          return false;
        }
        return audioElement;
      }

      if(lastPlayedAudioCharacters && currentItemCharacters === lastPlayedAudioCharacters) {
        audioElement = getAudioElement()
        audioElement.play();
        return true;
      } else {
        await waitUntilTrue(() => {
          audioElement = getAudioElement();
          const sourceElement = audioElement.querySelector('source');
          audioElementSrc = sourceElement.getAttribute('src');
          if(!audioElementSrc) {
            return false;
          }
          if(!lastPlayedAudioSrc) {
            return true;
          }
          return lastPlayedAudioSrc !== audioElementSrc;
        });
        lastPlayedAudioCharacters = currentItemCharacters;
        lastPlayedAudioSrc = audioElementSrc;
        try {
          audioElement.pause();
        } catch (err) {
          console.error('Error occurred while trying to pause audio:', err);
        }
        audioElement.src = audioElementSrc;
        audioElement.load();
        audioElement.play();
        return true;
      }
    } catch (err) {
      console.error('Error occurred while trying to play audio:', err);
      return false;
    }
  }

  window.addEventListener("keydown", function(e) {
    if (e.key === HOTKEY || e.key === HOTKEY.toUpperCase()) {
      tryPlayAudio();
    }
  })
   
})();
