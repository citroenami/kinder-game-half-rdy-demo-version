// manufacture as many HTML element from a char object as given
import {items} from '../items.js';

export function manufactureElement(character,charClass = '') {
    let imgClassName = character.name;
    let imgPath = character.img;
    
    let makeResourcePath = makeResPath(imgPath); 
    let imgElement = makeImgElement(imgClassName,makeResourcePath);
    let makeChar = makeCharElement(character,imgElement);

    function makeImgElement(imgClassName,makeResourcePath) {
      let imgElement = `
        <img class= 
        '
        ${imgClassName}-character-img
        js-${imgClassName}-character-img
        '
        src = 
        '
        ${makeResourcePath}
        '
        >
      `;
      return imgElement;
    }

    function makeResPath(imgPath) {
      let resPath = `
      data/resources/${imgPath}
      `;
      return resPath;
    }
    // here we implement unique id for items
    function makeCharElement(character,imgElement) {
      let charElement = '';
      let attachNum = 0;
      if(character.name.includes('item')){
        attachNum = getItemNum(character);
      }
      let dataOk = `data-item-name="${character.name}"
      data-item-id="${attachNum}"
      `;
      
      charElement = `
        <div
        class = 
        '
        ${character.name}-character
        js-${character.name}-character
        ${charClass}
        '
        ${attachNum > 0 ? dataOk : ''}
        data-char-id="${character.charId}"
        >
          ${imgElement}
        </div>
        `;
      
      return charElement;
    }
    return makeChar;
}

function getItemNum(char) {
  let itemIdNum;
  let charId = char.charId

  items.forEach((item)=>{
    if(item.charId === charId){
      itemIdNum = item.itemId
    }
  });
  return itemIdNum;
}