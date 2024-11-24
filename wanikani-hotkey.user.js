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

  const asyncTimeout = async (timeout) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, timeout);
    });
  }

  const tryPlayAudio = async () => {
    const pressShowInfo = document.querySelector('.additional-content__item.additional-content__item--item-info');

    if(pressShowInfo.classList.contains('additional-content__item--disabled')) {
      return;
    }

    if(!pressShowInfo.classList.contains('additional-content__item--open')) {
      pressShowInfo.click();
    }

    let secondAudioItem = document.querySelectorAll('.reading-with-audio__audio-item')[1];
    const start = Date.now();
    let elapsedTime = 0;
    while(!secondAudioItem) {
      await asyncTimeout(100);
      secondAudioItem = document.querySelectorAll('.reading-with-audio__audio-item')[1];
      elapsedTime = Date.now() - start;
      if(elapsedTime > 5000) {
        break;
      }
    }

    if (secondAudioItem) {
      const audioElement = secondAudioItem.querySelector('audio');
      
      if (audioElement) {
        audioElement.play()
        return true;
      } else {
        console.error("Audio element not found in the second audio-item.");
      }
    } else {
      console.error("Second audio-item not found.");
    }
    return false;
  }

  window.addEventListener("keydown", function(e) {
    if (e.key === HOTKEY || e.key === HOTKEY.toUpperCase()) {
      tryPlayAudio();
    }
  })
   
})();
