import {getCharByNum,currentScene} from '../../script.js';

 // here we have all the nods execpt inventory and the things
  // that can be collected inside building
  // and the scene container char
  export function fetchRelevantNodsBuildingInside() {
    let allCharNums = currentScene.chars_participating;
    // except these chars we make invis
    // remember: inventory is not included in scenes.js
    let relevantChars = currentScene.relevant_chars_shop_inside;
    let charNumsToHide = [];
    let charsToHide = [];
    let charsToHideNodes = [];
    charNumsToHide = allCharNums.filter(
      num => !relevantChars.includes(num)
    );
    // now fetch chars by num
    charNumsToHide.forEach((CharNumToHide)=>{
      let helper = getCharByNum(CharNumToHide);
      charsToHide.push(helper);
    });
    // now we make nodes from chars that we wanna hide
    // for now we dont care about numbers
    charsToHide.forEach((char)=>{
      charsToHideNodes.push(
        `.js-${char.name}-character`
      );
    });
    let concatenatedSelectors = charsToHideNodes.join(',');
    return concatenatedSelectors;
  }