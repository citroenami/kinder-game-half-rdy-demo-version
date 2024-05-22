import { chars } from "./data/scripts/chars.js";
import {scenes} from "./data/scripts/scenes.js";
import {map_group} from "./data/scripts/map_group.js";
import {map_participants} from "./data/scripts/map_participants.js";
import {manufactureElement} from "./data/scripts/manufactureElement.js";
import {charPosition} from "./data/scripts/charPosition.js";
import {fetchRelevantNodsBuildingInside} from './data/scripts/hidableNodsBuildingInside.js';
import {items} from './data/items.js';
import {inventory} from './data/inventory.js';
/* 
- we need to keep track if map areas are lock or not
- we need to keep track which area the user is currently on
*/

/*  we could keep track of user movement by assigning
  a unique 'position' value to each area where the user can 
  navigate to e.g: desert-nav, wrong-turn-nav 
  and we can do that with the lock states as well
  e.g: char-5-on, char-5-off (5 is desert)
  and this should be a closure 
*/ 


let userCurrentPosition = 6;
let userCurrentPositionMainScene = 4;
let inventoryItems = false;
let shopItems = true;
let lockedOrNot = '';
let areaExitable = false;
let inventoryMinimised = false;
let busFull = false;
let insideBuilding = false;
let insideBuildingForText = false;
let inventoryAlreadyOnScreen = false;
let currentInventoryPosition;
let inventorySlots = [];
let movedToInventoryItemCharNames = [];
let mainSceneItemsInInventory = [];
// temporarily false
let firstRun = true;
let secondRun = false;
let begeleidsterBusNod;
let begeleidsterWoodsNod;
let begeleidsterPlayGroundNod;
let begeleidsterBuildingNod;
let infoShoutinWoods = false;
let childrenToIgnorWoods = [];
let subsceneWhere = 'woods_board';
let lastInventoryState;
let scene3Nods = [];
// this is only true when scene3
// temporarily true for generateAeriaChars();
let woods_side = true;
let woodQuestDone = false;
let remainingItems = [];
let itemNodsGlobal = [];
let notRightComboMsg = false;
let notRightComboMsgTimeoutId;
let endPositionWoods = false;
let leaveAlready = 0;
let ObsoleteItems = [];
let itemNumIneed = undefined;
let timeoutCollisonPreventerId;
let inappropriateEntryAttempt = false;
let returnForItems = false;
let okToLeaveInvBuilding = false;
// set scene temporarily
export let currentScene = scenes[1];
alterScenes();
function alterScenes(scene = 0){
  let curScene = scene > 0 ? scene : 0;

  if(lockedOrNot === 'unlocked' || lockedOrNot === '') {
    
    currentScene = scenes[curScene];
  }
}

// this changes as player makes advancement in game
let mapAreaStates = [{
  mapArea : 6,
  state : 'unlocked'
},{
  mapArea : 5,
  state : 'locked'
},{
  mapArea : 7,
  state : 'locked'
},];

game();
function game() {
   handleClueTextField();
   prepareGameField();
}

export function getCharByNum(num) {
  console.log(num);
  let charOfInterest;
  chars.forEach((char)=>{
    if(char.charId === num) {
      charOfInterest = char;
    }
  });
  return charOfInterest;
  }

function handleClueTextField() {
  let clueText = 'Find the right item combo,<br> so you can get kid to safety!';
  let changeBtn = currentScene.sceneNum === 1
  ?
  'Start Game!'
  :
  'Give Clue!'
  ;
  if(currentScene.sceneNum === 2){
    if(userCurrentPositionMainScene === 4){
      let areaExitable = busFull ? true : false;
      let exitable = areaExitable ? 'exit-ok' : 'exit-not-ok';
      changeBtn = `<span class= exit-${exitable}>Exit!`
    } else if(userCurrentPositionMainScene === 12){
      changeBtn = 'Enter Area!'
    } else if(userCurrentPositionMainScene === 13){
      changeBtn = 'Enter Area!'
    } else if(userCurrentPositionMainScene === 14){
      if(insideBuildingForText){
        changeBtn = 'Exit Building!'
      } else {
        changeBtn = 'Enter Building!'
      }
      
    }
  } else if(currentScene.sceneNum === 3){
      if(subsceneWhere === 'woods_board'){
        changeBtn = 'Return';
      } else if(subsceneWhere === 'woods'){
        changeBtn = 'Enter area';
      }
  }
  else if(currentScene.sceneNum === 4){
    if(woodQuestDone === true){
      changeBtn = 'Return';
    } 
}

  let makeClueBtn = `
  <button 
  class="clue-btn js-clue-btn"
  >
    ${changeBtn}
  </button>`;

let makeClueBox = 
  `<p 
  class="clue-textbox js-clue-textbox"
  >
    Welcome to kinderbegeleidster! This text area is 
    for clues, feel free to ask for clue if you're stuck!
  </p>`;

const clueContainerElement = 
document.querySelector('.js-clue-window');

clueContainerElement.innerHTML =
makeClueBtn;

clueContainerElement.innerHTML +=
makeClueBox;

const clueDscriptionElement = 
document.querySelector('.js-clue-textbox');


let clueBtn = document.querySelector('.js-clue-btn');
clueBtn.addEventListener('click',()=>{
  if(currentScene.sceneNum === 1){
    alterScenes(1);
    game();
  } else if(currentScene.sceneNum === 2){
    console.log('hi');

    // this we need so we dont enter building even if we
    // are not on area 14 (building x mark pos)
    if(userCurrentPositionMainScene === 14) {
    
      // if we inside shop than this btn is true

      let inventroyBuildingInsideNod = 
      document.querySelector(
        '.js-inventory_building_inside-character'
      );
      // items musnt be included into chars_participating
      // otherwise they disappear too
      let school_vacation_mainAreaNod = 
      document.querySelector(
        '.js-school_vacation_main-character'
      );
      let concatenatedSelectors = fetchRelevantNodsBuildingInside();
      let allHidableNods = school_vacation_mainAreaNod.
      querySelectorAll(concatenatedSelectors);
      if(!insideBuilding){
        // if we inside here we can choose to leave if press btn
        // currently when we inside here we can leave building
        //by pressing minimize inventory or unfold it
     
      // items musnt be included into chars_participating
      // otherwise they disappear too
     
      allHidableNods.forEach((nod)=>{
        nod.classList.add('building-inside');

        inventroyBuildingInsideNod.classList.add(
          'building-inside-true'
        );
      });
      // we are not allowing this to become true 
      // just because we unfold and collapse inventory
      // we dont generate all this if is false
      // !!! solution: we dont turn this to true!!!
      // coz if we do the next time the code regenerates
      // its got gonna regenerate this part of code
      insideBuildingForText = true;
      handleClueTextField();
      if(okToLeaveInvBuilding){
        insideBuilding = true;
      }
      } else {
        insideBuilding = false;
        insideBuildingForText = false;
        // we we are not inside the building we force game
        // to run again.
        //since we dont regenerate content anymore we work with 
        //classes
        allHidableNods.forEach((nod)=>{
          nod.classList.remove('building-inside');
  
          inventroyBuildingInsideNod.classList.remove(
            'building-inside-true'
          );
        });
        game();
      }
    } else if(userCurrentPositionMainScene === 12){
      //alterScenes(2);
      //game();
    }else if(userCurrentPositionMainScene === 13){
      alterScenes(2);
      game();
    }
  } else if(currentScene.sceneNum === 3){
    if(subsceneWhere === 'woods_board'){
      firstRun = true;
      if(returnForItems){
        secondRun = false;
      } else {
        secondRun = true;
      }
      alterScenes(1);
      game();
    } else if(subsceneWhere === 'woods'){
      if(secondRun){
        woods_side = true;
        alterScenes(3);
        game();
      } else {
        inappropriateEntryAttempt = true;
        handleClueTextField();
      }
    }
  } else if(currentScene.sceneNum === 4){
    if(woodQuestDone === true){
      userCurrentPositionMainScene = 4;
      secondRun = true;
     if(leaveAlready < 1){
      leaveAlready++;
      alterScenes(2);
      game();
     }else {
      firstRun = true;
      alterScenes(1);
      game();
     }
    } else {
      timeoutCollisonPreventerId = setTimeout(()=>{
        clueDscriptionElement.
        innerHTML = clueText;
      },0);
    }
  }
  
});



if(infoShoutinWoods){
    clueDscriptionElement.innerHTML = 
    'A desperate young voice calling for help from direction: Woods';
}else {
    clueDscriptionElement.innerHTML = currentDescription();
}




  function currentDescription() {
    if(currentScene.sceneNum === 1){
      let HTML = '';
      let getCurrentPace = CurrentPace();
      mapAreaStates.forEach((AreaState)=>{
        if(AreaState.mapArea === userCurrentPosition){
          lockedOrNot = AreaState.state 
          === 'locked'
          ?
          'locked'
          :
          'unlocked'
          ;
          HTML += `You are currently on: 
          <span class='currentPlace'>${getCurrentPace}!
          </span><br>This area is <span 
          class='currentState${lockedOrNot}'>
           ${AreaState.state}!
           </span>`;
        }
      });
  
      function CurrentPace(){
          let char = getCharByNum(userCurrentPosition);
          return char.name;
      }
      return HTML;
    } else if(currentScene.sceneNum === 2){
      if(userCurrentPositionMainScene === 4){
        if(busFull){
          return 'Press button to Exit area!';
        } else {
          if(woodQuestDone){
            return 'You can`t exit with a half full bus!';
          }else {
            return 'You can`t exit with an empty bus!';
          }
        }
        
      } else if(userCurrentPositionMainScene === 12){
        return 'Enter area: Playground';
      }else if(userCurrentPositionMainScene === 13){
        return 'Enter area: Woods';
      } else if(userCurrentPositionMainScene === 14){
        if(insideBuildingForText !== true){
          return 'An inventory building!';
        } else {
          if(okToLeaveInvBuilding){
            return 'An inventory building!';
          } else {
            return 'Please gather all items before leaving!';
          }
        }
        
      }
    } else if(currentScene.sceneNum === 3){
      if(subsceneWhere === 'woods'){
        if(!inappropriateEntryAttempt){
          return 'Enter area: Woods';
        } else {
          setTimeout(()=>{
            inappropriateEntryAttempt = false;
            returnForItems = true;
            prepareGameField();
          },3000);
          return 'Gather items to gain entry here!';
        }
      } else if(subsceneWhere === 'woods_board'){
        return 'Return to previous area';
      }
    }else if(currentScene.sceneNum === 4){
      if(subsceneWhere === 'woods'){
        if(woodQuestDone === false){
          if(notRightComboMsg){
            notRightComboMsgTimeoutId = setTimeout(()=>{
              clueDscriptionElement.
              innerHTML = "That's <spam class='currentStatelocked'>not</spam> it! Keep looking further!";
            },1000);
          }
          
          if(typeof timeoutCollisonPreventerId === 'number'){
            return clueText;
          } else {
            return '';
          }
        } else {
          return 'Congratulations for finding the right combo!';
        }
        
      } 
    }
  }

}

/**
 * first we generate all chars with their div and img
 */
function prepareGameField() {
 
    let currentSceneCharacters = [];
    let currentSceneContainerCharacter;
    let gameField = document.querySelector('.js-game-field');
  
  
    let HTML = '';
    let imgElements = makeImgElements();
    // object with all chars and their corresponding numbers
    let makeCharContainers = makeCharElements(imgElements);
  
  
    function makeImgElements() {
      let imgElements = [];
  
      let imgClassName;
      let imgPath;
      let makeResourcePath; 
      let imgElement;
  
      function makeResPath(imgPath) {
        let resPath = `
        data/resources/${imgPath}
        `;
        return resPath;
      }
  
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
      
      chars.forEach((char)=>{
       
          imgClassName = char.name;
          imgPath = char.img;
          makeResourcePath = makeResPath(imgPath);
          imgElement = makeImgElement(imgClassName,makeResourcePath);
          imgElements.push(imgElement);
       
      });
        return imgElements;
    }
  
    function makeCharElements(imgElements) {
      let charObjects = [];
      let charElements = '';
      let helper;
      let charSpecimen;
      let styleAbs = 'position: absolute';
      let currentContainerName = currentScene.sceneNum
      === 2 ? 'school_vacation_main' : 'full_map';

      
      imgElements.forEach((imgElement,index)=>{
        let stylePos;
        helper = getCharByNum(index+1);
        // charPosition is set up in a way that it can
        // only be used in scene 1
        stylePos = currentScene.sceneNum === 1 ?
        fetchCharPos(helper)
        :
        '';
        
        charSpecimen = `
        <div
        style='${helper.name === currentContainerName ? '' : styleAbs};
        ${stylePos} '
        
  
        class = 
        '
        ${helper.name}-character
        js-${helper.name}-character
        '
        >
          ${imgElement}
        </div>
        `;
  
        charElements += charSpecimen;
        charObjects.push({
          charNum : index+1,
          charElement : charSpecimen
        });
      });
      
      return charObjects;
    }
  
    function fetchCharPos(char) {
      let toReturn = '';
      charPosition.forEach((charPos)=>{

          if(charPos.charNum === char.charId){
            toReturn = charPos.charPosition;
          } 
        });
      return toReturn;

    }
    
  
    makeCharContainers.forEach((charContainer)=>{

      if(currentScene.chars_participating.includes(charContainer.charNum)) {
        currentSceneCharacters.push(charContainer);
      }
      
    });
  
    let multipleChar = turnCharElementToChar(currentSceneCharacters[0]);
    
    function turnCharElementToChar(charObj) {
      let char = getCharByNum(charObj.charNum);
      return char;
    }
  
    let test = manufactureElement(multipleChar,2);
    //gameField.innerHTML = test;
  
  
    /**
     * first we need to put everything into their necessary
     * container 
     */
    //full_map character always relative(in css)
    
  
    function findCurrentSceneCharElementByNum (num) {
      console.log(currentSceneCharacters);
      let char;
      // currentSceneCharacters is an Obj with HTML div and num
      currentSceneCharacters.forEach((SceneCharacter)=>{
        console.log(SceneCharacter);
        if(SceneCharacter.charNum === num) {
          char = SceneCharacter;
        }
      });
      
      return char;
    }
  
    function findCurrentSceneAreaCharElement () {
      let toReturn = [];
      let i;
      let chars = currentScene.areaContainerCharacter;
      // currentSceneCharacters is an Obj with HTML div and num
        for(i=0; i < chars.length; i++){
          currentSceneCharacters.forEach((SceneCharacter)=>{
            if(chars[i] === SceneCharacter.charNum ) {
              toReturn.push(SceneCharacter.charElement);
            }
        });
        }
      return toReturn;
    }
  
    function findCurrentSceneFieldCharElement () {
      let toReturn = [];
      let i;
      let chars = currentScene.fieldContainerCharacter;
      // currentSceneCharacters is an Obj with HTML div and num
        for(i=0; i < chars.length; i++){
          currentSceneCharacters.forEach((SceneCharacter)=>{
            if(chars[i] === SceneCharacter.charNum ) {
              toReturn.push(SceneCharacter.charElement);
            }
        });
        }
      
      return toReturn;
    }
  
    function generateDOM(charNum) { 
      let char;
      let charPassiveNosElements = [];
      let helper;
      if(typeof charNum === 'number') {
        char = getCharByNum(charNum);
        // this is full map and its already on the dom
      return document.querySelector(`.js-${char.name}-character`);
      } else {
        charNum.forEach((arrayElement)=>{
          char = getCharByNum(arrayElement);
          // these are not yet on the dom so null unless in ''
          helper = `document.querySelector('.js-${char.name}-character')`;
          charPassiveNosElements.push(helper);
        });
        return charPassiveNosElements;
      }
    }

    // this is better than previous approach
    function generateDOMFromChar(incomingChar){
      let concatenatedChars = [];
      if(Array.isArray(incomingChar)){
        incomingChar.forEach((char)=>{
          concatenatedChars.push(`.js-${char.name}-character`);
        });
      } else {

      }
      let DOMChars = concatenatedChars.join(',');
      return DOMChars;
    }
  
    function turnStringToCode(string){
      return eval(string);
    }

    function generateAeriaChars(){
        
      let DOMareaContainerCharacters = generateDOM(currentScene.areaContainerCharacter);
      console.log(DOMareaContainerCharacters);
  
      DOMareaContainerCharacters.forEach((DOMareaContainerCharacter)=>{
        // here is our nod for areas like desert,ect..
        let fetchCurrentSceneFieldCharElement = findCurrentSceneFieldCharElement();
        fetchCurrentSceneFieldCharElement.forEach((FieldCharElem)=>{  
          
          if(!DOMareaContainerCharacter.includes('inside')) {
            let turnStringToCodeVar = turnStringToCode(DOMareaContainerCharacter);
            //!! i must learn appendchild() before going further here!!
            turnStringToCodeVar.innerHTML += FieldCharElem;
          }
        });

      });
    }
  
    renderGame();
    function renderGame() {
      //this is a character of the characters.js 
      currentSceneContainerCharacter = getCharByNum(currentScene.sceneContainerCharacter);
      //this is a character from the HTML div kind
      let sceneCharObj = findCurrentSceneCharElementByNum(currentSceneContainerCharacter.charId);
     
      // this is a complete char div
      let currentSceneContCharElement = sceneCharObj.charElement;
      // this is on the field
      
    if(firstRun){
        gameField.innerHTML = currentSceneContCharElement;
      
        
      // we make a dom from full map
      let DOMcurrentSceneContCharElement = generateDOM(currentSceneContainerCharacter.charId);
      // this is on the gamefield we just needed a nod of it
      // we need to place areas on the map here
      // all this has to be generated automatically !!! -->
      let fetchAreaElements = findCurrentSceneAreaCharElement();
      // here we use appendchild cow its is designed to append DOM nodes
      fetchAreaElements.forEach((elm)=>{
        console.log(elm);
          DOMcurrentSceneContCharElement.innerHTML += elm;
        
      });
      /**
       * When you use += with innerHTML, 
       * you're essentially overwriting the entire HTML 
       * content of the element each time you add something.
       * This can cause any previously attached event 
       * listeners or interactive elements to be detached or
       * become non-functional because the old HTML content
       * is replaced with the new one.
       * DOMcurrentSceneContCharElement.innerHTML 
       * += inventoryNormalChar;
       */
      
      generateAeriaChars();
    }
    

      handleScene();
      function handleScene() {
        if(currentScene.sceneNum === 1) {
          let schoolAreaNod = document.querySelector('.js-school_vacation-character');
          let schoolBusNod = schoolAreaNod.querySelector('.js-bus-character');
          
          nodStyles(schoolBusNod,'','','-90px','10px','100');

          if(userCurrentPosition !== 6){
            schoolBusNod.style.display = 'none';
          }
      
          let x_markSchoolNod = schoolAreaNod.querySelector('.js-position_field-character');
          nodStyles(x_markSchoolNod,'','','-120px','0px','99');

          // by default we on school-area
      
          let schoolLocked = schoolAreaNod.querySelector('.js-map_area_locked-character');
          let schoolunLocked = schoolAreaNod.querySelector('.js-map_area_unlocked-character');
          
          schoolLocked.style.display = 'none';
          nodStyles(schoolunLocked,'','0px','0px','','100');
      
          //now we need to adjust the positions of items desert-area
          let desertAreaNod = document.querySelector('.js-desert-character');
          let desertBusNod = desertAreaNod.querySelector('.js-bus-character');
          nodStyles(desertBusNod,'','','30px','-100px','100');
      
          if (userCurrentPosition !== 5) {
            desertBusNod.style.display = 'none';
          }
      
          let desertLocked = desertAreaNod.querySelector('.js-map_area_locked-character');
          let desertunLocked = desertAreaNod.querySelector('.js-map_area_unlocked-character');
          nodStyles(desertLocked,'','0px','0px','','100');
          
          desertunLocked.style.display = 'none';
          
            
          let x_markdesertAreaNodNod = desertAreaNod.querySelector('.js-position_field-character');
          nodStyles(x_markdesertAreaNodNod,'','','0px','-110px','99');
      
          //adjust the positions of chars inside desert-area
          let wrong_turnAreaNod = document.querySelector('.js-wrong_turn-character');
          let wrong_turnBusNod = wrong_turnAreaNod.querySelector('.js-bus-character');
          nodStyles(wrong_turnBusNod,'','','30px','-110px','100');
    
          if (userCurrentPosition !== 7) {
            wrong_turnBusNod.style.display = 'none';
          }
      
          let wrong_turnLocked = wrong_turnAreaNod.querySelector('.js-map_area_locked-character');
          let wrong_turnunLocked = wrong_turnAreaNod.querySelector('.js-map_area_unlocked-character');
      
          
          wrong_turnunLocked.style.display = 'none';
          nodStyles(wrong_turnLocked,'','0px','0px','','100');
          
          let x_markwrong_turnAreaNodNod = wrong_turnAreaNod.querySelector('.js-position_field-character');
          nodStyles(x_markwrong_turnAreaNodNod,'','','0px','-120px','99');

          // lets put event listeners on parents of x-marks
          schoolAreaNod.addEventListener('click',()=>{
            userCurrentPosition = 6;
            game();
          });
      
          desertAreaNod.addEventListener('click',()=>{
            userCurrentPosition = 5;
            game();
          });
      
          wrong_turnAreaNod.addEventListener('click',()=>{
            userCurrentPosition = 7;
            game();
          });
      
        } else if(currentScene.sceneNum === 2){
          
        if(firstRun){
          let school_vacation_mainAreaNod = document.querySelector('.js-school_vacation_main-character');
          
          // bus 'parking place'
          let busNod = school_vacation_mainAreaNod.querySelector('.js-bus-character');
          if(woodQuestDone){
            let kidDiv = document.createElement('DIV');
            kidDiv.
            className = 'kid_boy_head-character js-kid_boy_head-character';
            kidDiv.dataset.charId = '31';

            let kidImg = document.createElement('IMG');
            kidImg.className = 'kid_boy_head-character-img js-kid_boy_head-character-img';
            kidImg.src = 'data/resources/kid_boy_head.png';
            kidDiv.appendChild(kidImg);
            busNod.appendChild(kidDiv);
          let kidBoyChar = busNod.querySelector('.js-kid_boy_head-character');
          nodStyles(kidBoyChar,'','','-80px','10px','101');
          }
          let xMarkBusNod = busNod.querySelector('.js-position_field-character');
          nodStyles(busNod,'0px','50%','','50%','100');
          nodStyles(xMarkBusNod,'','','-100px','-10px','99');
          begeleidsterBusNod = busNod.querySelector('.js-kinderbegeleidster-character');
          nodStyles(begeleidsterBusNod,'','','-80px','10px','100');

          //play ground
          let PLayGroundNod = school_vacation_mainAreaNod.
          querySelector('.js-board_playground-character');
          nodStyles(PLayGroundNod,'230px','','0px','','99');
          begeleidsterPlayGroundNod = PLayGroundNod.
          querySelector('.js-kinderbegeleidster-character');
          nodStyles(begeleidsterPlayGroundNod,'','','-80px','20px','100');

          // woods 
          let woodsNod = school_vacation_mainAreaNod.
          querySelector('.js-board_woods-character');
          nodStyles(woodsNod,'230px','0px','','','99');
          begeleidsterWoodsNod = woodsNod.
          querySelector('.js-kinderbegeleidster-character');
          nodStyles(begeleidsterWoodsNod,'','','-80px','20px','100');

          if(!woodQuestDone){
             // shouting1 in woods 
          let shoutingFromRight1Char = getCharByNum(17);
           
          let shoutingFromRight1HTMLMarkdown = manufactureElement(
            shoutingFromRight1Char
          );
          addToScreen(woodsNod,shoutingFromRight1HTMLMarkdown);
          let shoutRight1Nod = woodsNod.
          querySelector('.js-distant_shout_from_right1-character');
          nodStyles(shoutRight1Nod,'50px','5px','','','100');

           // shouting2 in woods 
           let shoutingFromRight2Char = getCharByNum(18);
           
           let shoutingFromRight2HTMLMarkdown = manufactureElement(
             shoutingFromRight2Char
           );
           addToScreen(woodsNod,shoutingFromRight2HTMLMarkdown);
           let shoutRight2Nod = woodsNod.
           querySelector('.js-distant_shout_from_right2-character');
           nodStyles(shoutRight2Nod,'50px','5px','','','100');
         
           // incessant shouting from right
          
           shouting(shoutRight1Nod,shoutRight2Nod);
           function shouting(shoutRight1Nod,shoutRight2Nod) {
            let shout1Interval = setInterval(()=>{
              shoutRight1Nod.style.display = 'initial';
              shoutRight2Nod.style.display = 'none';
            },800);
            let shout2Interval = setInterval(()=>{
              shoutRight1Nod.style.display = 'none';
              shoutRight2Nod.style.display = 'initial';
            },1600);
           }
          }
         

          // inventory building 'outside'
          let inventory_building = school_vacation_mainAreaNod.querySelector('.js-inventory_building-character');
          nodStyles(inventory_building,'','','120px','250px','100');
          let xMarkBuildingNod = inventory_building.querySelector('.js-position_field-character');
          nodStyles(xMarkBuildingNod,'','','-100px','30px','99');
          begeleidsterBuildingNod = inventory_building.querySelector('.js-kinderbegeleidster-character');
          nodStyles(begeleidsterBuildingNod,'','','-80px','50px','100');
          

          // inventory building 'inside'
          let inventroyBuildingInsideNod = document.querySelector(
            '.js-inventory_building_inside-character'
          );
        

          let inventoryCollCharNum = getCharByNum(20);
           
          let inventoryCollapsedChar = manufactureElement(
            inventoryCollCharNum
          );
         
          addToScreen(school_vacation_mainAreaNod,inventoryCollapsedChar);
          
          // we add inventory we happen to know which char
          // is the inventory 19
          let inventoryCharNum = getCharByNum(19);
          // this returns a string
          let inventoryNormalChar = manufactureElement(
            inventoryCharNum
          );
          
          // use appendChild not to remove existing even listeners
          // for appendchild to work inventoryNormalChar has to be
          // a DOM element so here we use += instead of appendchild
          // !!! solution insertAdjacentHTML('beforeend', HTMLvar);!!!
          /**
           * "beforebegin"
           * Before the element. Only valid if the element is
           *  in the DOM tree and has a parent element.
           * <!-- beforebegin -->
              <p>
                <!-- afterbegin -->
                foo
                <!-- beforeend -->
              </p>
              <!-- afterend -->
           */
          // we need this so when we change field 
          // inventory doesnt unfold from minimized state
  
          
            let inventoryCollNod = school_vacation_mainAreaNod.
            querySelector('.js-inventory_whole_minimised-character');
          
           
            
            nodStyles(inventoryCollNod,'0px','0px','','','100');
            
           
            //console.log(getEventListeners(document.querySelector('.js-inventory_whole_minimised-character')));
           
            addToScreen(inventoryCollNod,
              inventoryNormalChar);
            
            
            // do the same with normal inventory
            
            let inventoryNormlaNod = inventoryCollNod.
            querySelector('.js-inventory_whole-character');
            
            nodStyles(inventoryNormlaNod,'25px','0px','','','100');
         

            let currentItemChars = getCurrentItems();

            function getCurrentItems() {
              let relevantItemsList = currentScene.school_area_items;
              let itemsArray = [];
              let itemChars = [];
              items.forEach(item => {
                if(relevantItemsList.includes(item.itemId)){
                  itemsArray.push(item);
                }
              });
              itemsArray.forEach((item)=>{
                chars.forEach((char)=>{
                  if(item.charId === char.charId){
                    itemChars.push(char);
                  }
                });
              });
              return itemChars;
            }
            let manufacturedItemElements = [];
  
            currentItemChars.forEach((itemChar)=>{
              manufacturedItemElements.push(
                manufactureElement(
                  itemChar
                )
              );
            });

            // generate nods of items
            let itemRawNods = generateDOMFromChar(currentItemChars);
            // we dont want to regeerate inventory when we 
            // get back to previous scene
            if(!secondRun){
              addToScreen(inventroyBuildingInsideNod,
                manufacturedItemElements);
                secondRun = true;
            }
            
            /* 
            if(shopItems) {
              
                addToScreen(inventroyBuildingInsideNod,
                  manufacturedItemElements);
                  
             not relevant anymore
            } else {
              addToScreen(inventoryNormlaNod,
                mainSceneItemsInInventory);
            }*/
            
            // when we click on an item it gets added to inventory
            let itemNods = inventroyBuildingInsideNod.
            querySelectorAll(itemRawNods);
            

              itemNods.forEach((actualItemNod,index)=>{
                console.log(actualItemNod);
                
                let clicked = false;
                actualItemNod.addEventListener('click',function itemlIstener1() {
                  // item has to start with small letter
                  let charName = actualItemNod.dataset.itemName;
                  movedToInventoryItemCharNames.push(charName);
                  let itemId = actualItemNod.dataset.itemId;
                  //1. we remove item from building table
                  const originalParent = inventroyBuildingInsideNod;
                  const newParent = inventoryNormlaNod; 

                  let divToMove = inventroyBuildingInsideNod.
                  querySelector(`.js-${charName}-character`);
                  console.log(divToMove);
                  
                  //2. we add it to inventory
                  newParent.appendChild(divToMove);
                  console.log(inventoryNormlaNod.children);
                  let allChildren = Array.from(inventoryNormlaNod.children);
                  let divChildren = [];

                  allChildren.forEach((divChildCandidate)=>{
                    if(divChildCandidate.nodeName === 'DIV'){
                      divChildren.push(divChildCandidate);
                    }
                  });
                  console.log(divChildren);
                  console.log(divChildren.length);
                  
                    if(divChildren.length === 3){
                      insideBuilding = true;
                      okToLeaveInvBuilding = true;
                    }
                  
                 
                // let currentNodeParent = divToMove.parentNode;
                mainSceneItemsInInventory.push(divToMove);
                  //console.log("Current parent of the node:", currentNodeParent);
                  // associate item num with inventory num

                  divToMove.classList.add(`${charName}-inside-inventory`);
                  // we set new position to item

                  //originalParent.removeChild(divToMove);
                  //getInventorySlot(divMoved,itemId);
                  
                  clicked = true;
                  if(clicked){
                    actualItemNod.removeEventListener('click',itemlIstener1);
                  }
                  });
                
               
              });

              // barbaric but i save this here so i can detach
              // event listeners at a safe place, meaning where
              // they are surely not needed anymore
        
              itemNodsGlobal = itemNods;

              // this we need so when we return to previous 
              // area we still have the items in inventory
              mainSceneItemsInInventory.forEach((item)=>{
                inventoryNormlaNod.appendChild(item);
              });
              
            


            function getInventorySlot(nod,itemId){
              inventory.forEach((slot)=>{
                if(slot.slotNum === itemId){
                  nod.style.position = slot.position;
                  let top = slot.top;
                  let right = slot.top;
                  let bottom = slot.top;
                  let left = slot.top;
                  nodStyles(nod,top,right,bottom,left,'101');
                }
              });
            }
  
            function addToScreen(whereNod,whatElement){
              //nod means document.querry.. bla bla

              if(Array.isArray(whatElement)){
                whatElement.forEach(element => {
                  if(typeof element === 'string'){
                    whereNod.insertAdjacentHTML(
                      'beforeend', element
                    );
                  } else {
                    whereNod.insertAdjacentHTML(
                      'beforeend', element.outerHTML
                    );
                  }

                });
              } else {
                whereNod.insertAdjacentHTML(
                  'beforeend', whatElement
                );
              }
            }

            // we make inventory collapse on topright click
           
            // if this is defined, than it means the inventory has
            // a state from previous times, so we override the default
            // state
        
         
            
            // when we regenerate this part its absolute by default
            // so we need to make position to reflect current state
            // regardless of default position state
            // when inventoryMinimised is true than pos is static
            // but when we regenerate code it turns back to absolute

            // easy solution just put this into a function
            function regenerateInventoryState(){

             }
             let children;
             //children = inventroyNormalNod.children;
             // i have to separate item children only

             /**
              *  - a reference to a DOM element 
              *  - an HTML string representation
              */
            // here we need to pay attention if we inside building
            // or we leave building automatically at every refresh
            inventoryNormlaNod.style.display =
            lastInventoryState;
            inventoryCollNod.addEventListener('click',function(event){
              let child = inventoryNormlaNod;
              //!!! this is very usefull !!!  console.log(event.target.parentNode);
             // event.target -> a kep a divben
             // event.target.parentNode -> a szulo div

              let itemInventoryNods = inventoryCollNod.
              querySelectorAll(itemRawNods);
              /* 
                if(itemInventoryNods.length > 2) {
                  inventoryItems = true;
                  shopItems = false;
                }*/
                
                let imgNod = this.
                querySelector('.js-inventory_whole_minimised-character-img');
                

              if(event.target === imgNod){
              if(!inventoryMinimised){
                inventoryMinimised = true;
                inventoryNormlaNod.style.display = 'none';
                lastInventoryState = 'none';
                // when inventory collapses we apply class
                // on items so they disappear
                //regenerateInventoryState();
              } else {
                inventoryMinimised = false;
                inventoryNormlaNod.style.display = 'initial';
                //regenerateInventoryState();
                lastInventoryState = 'initial';
              }
            }
            });
          
            
            /*console.log(getEventListeners(document.querySelector('.js-school_vacation_main-character').
            querySelector('.js-inventory_whole_minimised-character')));*/
    
        
          // info about shouting
          Array.from(woodsNod.children).forEach((child)=>{
            if(child.className.includes('shout')){
              // we make shure the size of this array doesnt
              // get out of hand
                childrenToIgnorWoods.push(child);

              child.addEventListener('click',()=>{
                infoShoutinWoods = true;
                handleClueTextField();
                let timeoutInfo = setTimeout(()=>{
                  infoShoutinWoods = false;
                  handleClueTextField();
                },5000);
              });
            }
          });

          busNod.addEventListener('click',()=>{
            userCurrentPositionMainScene = 4;
            game();
          });

          PLayGroundNod.addEventListener('click',()=>{
            userCurrentPositionMainScene = 12;
            game();
          });

          inventory_building.addEventListener('click',()=>{
            userCurrentPositionMainScene = 14;
            game();
          });

          // childrenToIgnorWoods[0] -> div 
          // childrenToIgnorWoods[0].children[0] -> img (inside the div)
          woodsNod.addEventListener('click',function woodsBoardListnr(event){
            if(woodQuestDone){
              woodsNod.removeEventListener('click',woodsBoardListnr);
              // need to return so function ends early
              return;
            }

            if(event.target !== childrenToIgnorWoods[0].
              children[0]
            && event.target !== childrenToIgnorWoods[1].
              children[0]){
              userCurrentPositionMainScene = 13;
              game();
            }
            
          });
          firstRun = false;
         
        }
        
        console.log(userCurrentPositionMainScene);
        if(userCurrentPositionMainScene !== 4){
          begeleidsterBusNod.style.display = 'none';
        }else{
          begeleidsterBusNod.style.display = 'initial';
        } 
        if(userCurrentPositionMainScene !== 12) {
          begeleidsterPlayGroundNod.style.display = 'none';

        } else{
          begeleidsterPlayGroundNod.style.display = 'initial';
        } 
        if(userCurrentPositionMainScene !== 13) {
          begeleidsterWoodsNod.style.display = 'none';

        } else{
          begeleidsterWoodsNod.style.display = 'initial';
        } 
        if(userCurrentPositionMainScene !== 14) {
          begeleidsterBuildingNod.style.display = 'none';

        } else{
          begeleidsterBuildingNod.style.display = 'initial';
        } 
        

      } else if(currentScene.sceneNum === 3){
        gameField.innerHTML = currentSceneContCharElement;

        subsceneWhere = 'woods_board';
        handleClueTextField();

        let aeriaChars;
        let aeriaCharsElement;
        let currentSceneAllChildren = [];
        let aeriaContCharsArray = [];
        let aeriaCharsArrayDissected;
        let DOMcurrentSceneContCharElement = generateDOM(currentSceneContainerCharacter.charId);
        let HTMLmarkup = '';

        
        currentScene.areaContainerCharacter.forEach((aeriaChar)=>{
          aeriaChars = getCharByNum(aeriaChar);
          aeriaCharsElement = manufactureElement(aeriaChars);
          // this is an HTML markup string and not element ->
          // it doesnt automatically become child of the div
          // i had to use the accumulator pattern.. -.-
          HTMLmarkup += aeriaCharsElement;
        });
        console.log(HTMLmarkup);
        DOMcurrentSceneContCharElement.innerHTML += HTMLmarkup;
        // this we need for positioning wood board
        
        let charContainerWoodsDom;
        let charContainerWoodsBoardDom;
       
        

        currentSceneAllChildren = Array.from(DOMcurrentSceneContCharElement.children);
        // we get the relevant ones out of this array
        currentSceneAllChildren.forEach((childChar)=>{
          if(childChar.dataset.charId){
            let dataCharIdNum = Number(childChar.dataset.charId);
            if(currentScene.areaContainerCharacter.includes(dataCharIdNum)){
            putRelevantContentIntoSceneCont(dataCharIdNum);
            }
          }
        });

        // so here we have charNum of areaContChar
        // we make node of it and add x-mark and begel..ster
        
        function putRelevantContentIntoSceneCont(charNum){
          let character = getCharByNum(charNum);

          //its already on field so we just make dom of it
          charContainerWoodsDom = DOMcurrentSceneContCharElement.
          querySelector(`.js-${character.name}-character`);

          if(character.name === 'board_woods'){
            charContainerWoodsBoardDom = charContainerWoodsDom;
            charContainerWoodsDom.classList.add('b-w-c-sub-scene');
          }
          //create x mark and beg..girl
          let appendableCharsArray = createAppendableChars(currentScene.aeriaCharacter);
          // and than add it to the container

          appendableCharsArray.forEach((appendableChar)=>{
            let tempContainer = document.createElement('div');
            tempContainer.innerHTML = appendableChar;
            //let divElement = tempContainer.firstChild;
            let tempFragment = document.createRange().createContextualFragment(appendableChar);
            // Retrieve the first element child from the 
            // DocumentFragment
            let firstChildElement = tempFragment.firstElementChild;
            console.log(firstChildElement);
            charContainerWoodsDom.appendChild(firstChildElement);
          });
          
        }
        if(scene3Nods.length <= 1){
          scene3Nods.push(charContainerWoodsDom);
          scene3Nods.push(charContainerWoodsBoardDom);
        }

        if(charContainerWoodsDom.classList.contains('action-scene')){
          charContainerWoodsDom.classList.remove('action-scene');
        }

        if(charContainerWoodsBoardDom.classList.contains('action-scene')){
          charContainerWoodsBoardDom.classList.remove('action-scene');
        }

        //cringe but has to d this manually..
        //board nods
        //cringe but has to d this manually..
        let kinderbegeleidsterWoodsBoardNod = charContainerWoodsBoardDom.
        querySelector('.js-kinderbegeleidster-character');
        let position_fieldWoodsBoardNod = charContainerWoodsBoardDom.
        querySelector('.js-position_field-character');

        nodStyles(kinderbegeleidsterWoodsBoardNod,'115px','','','20px','101');
        nodStyles(position_fieldWoodsBoardNod,'100px','','','','100');

        //woods nods
        let kinderbegeleidsterWoodsNod = charContainerWoodsDom.
        querySelector('.js-kinderbegeleidster-character');
        let position_fieldWoodsNod = charContainerWoodsDom.
        querySelector('.js-position_field-character');

        // first time we arrive at this area 
        kinderbegeleidsterWoodsNod.style.display = 'none';

        nodStyles(kinderbegeleidsterWoodsNod,'265px','40%','','40%','101');
        nodStyles(position_fieldWoodsNod,'250px','27%','','','100');
        
        
        charContainerWoodsDom.addEventListener('click',()=>{
          kinderbegeleidsterWoodsNod.style.display = 'initial';
          kinderbegeleidsterWoodsBoardNod.style.display = 'none';
          subsceneWhere = 'woods';
          handleClueTextField();
        });
        charContainerWoodsBoardDom.addEventListener('click',()=>{
          kinderbegeleidsterWoodsNod.style.display = 'none';
          kinderbegeleidsterWoodsBoardNod.style.display = 'initial';
          subsceneWhere = 'woods_board';
          handleClueTextField();
        });
        
        function createAppendableChars(charsToCreate){
          let character;
          let charElement;
          let appendableChars = [];
          charsToCreate.forEach((char)=>{
            character = getCharByNum(char);
            charElement = manufactureElement(character);
            console.log(charElement);
            appendableChars.push(charElement);
          });
          return appendableChars;
        }

      } else if(currentScene.sceneNum === 4) {
        if(woods_side) {
          // first swipe off previous scene content
          console.log(scene3Nods);
          scene3Nods.forEach((scene3nod)=>{
            scene3nod.classList.add('action-scene');
          });
          // than add current scene content
          // if display: none, than cant parentdiv.children
          console.log(currentSceneContCharElement);
          let fieldCharDivArray = [];
          let storyActorCharDivArray = [];
          let DOMcurrentSceneContCharElement =
          generateDOM(currentSceneContainerCharacter.charId);
          let questsotryItemsContChar;
          let questresultItemsContChar;

       
          let inventoryNormlaNod;
          

          // items
        if(!endPositionWoods){
          generateAndHandleItems();
        }
      

          generateFieldChars();
          // tree action chars
        if(!endPositionWoods){
          generateStoryActorChars();
        }
          // item action chars
          generateActorResultChars();
         
          

          function generateAndHandleItems(){
            let allChildren;
            let inventroyCollChar;
            let inventroyCollCharElement;

            inventroyCollChar = getCharByNum(20);
            inventroyCollCharElement = manufactureElement(inventroyCollChar);
            let tempDivContainer = document.createElement('div');
            tempDivContainer.innerHTML = inventroyCollCharElement;
            DOMcurrentSceneContCharElement.
            appendChild(tempDivContainer.firstElementChild);
          
            let inventoryCollNod = DOMcurrentSceneContCharElement.
            querySelector('.js-inventory_whole_minimised-character');

            nodStyles(inventoryCollNod,'0px','0px','','','100');

            allChildren = Array.from(DOMcurrentSceneContCharElement.children);

            allChildren.forEach((child)=>{
              let imgElement = child.querySelector('img');
              if(imgElement !== null){
                let imgParElDiv = imgElement.parentElement;
                
                  if(imgParElDiv.className.includes('woods')){
                    let divToRemove = imgParElDiv;
                    DOMcurrentSceneContCharElement.removeChild(divToRemove);
                  }
              }
            });
            // do the same with normal inventory
            let inventroyNormChar;
            let inventroyNormCharElement;

            inventroyNormChar = getCharByNum(19);
            inventroyNormCharElement = manufactureElement(inventroyNormChar);
            tempDivContainer = document.createElement('div');
            tempDivContainer.innerHTML = inventroyNormCharElement;
            inventoryCollNod.
            appendChild(tempDivContainer.firstElementChild);
           
            inventoryNormlaNod = inventoryCollNod.
            querySelector('.js-inventory_whole-character');
            nodStyles(inventoryNormlaNod,'25px','0px','','','100');

            // fill up inventroy with items
            mainSceneItemsInInventory.forEach((item)=>{
              inventoryNormlaNod.appendChild(item);
            });
        


          }
          
          function generateFieldChars(){
          let fieldContChars;
          let fieldContCharsElement;
          let currentSceneAllChildren = [];
          
          

          currentScene.fieldContainerCharacter.forEach((fieldChar)=>{
            fieldContChars = getCharByNum(fieldChar);
            fieldContCharsElement = manufactureElement(fieldContChars);
            let tempDivContainer = document.createElement('div');
            tempDivContainer.innerHTML = fieldContCharsElement;
            // this is an HTML markup string and not element ->
            // it doesnt automatically become child of the div
            // i had to use the accumulator pattern.. -.-
            DOMcurrentSceneContCharElement.
            appendChild(tempDivContainer.firstElementChild);
          });
          
         
          currentSceneAllChildren = Array.from(DOMcurrentSceneContCharElement.children);
          // we get the relevant ones out of this array
          console.log(currentSceneAllChildren);
          currentSceneAllChildren.forEach((sceneChild)=>{
            if(sceneChild.nodeName === 'DIV'){
              fieldCharDivArray.push(sceneChild);
            }
          });
          
          fieldCharDivArray.forEach((childChar)=>{

          let dataCharIdNum = Number(childChar.dataset.charId);
          if(currentScene.fieldContainerCharacter.includes(dataCharIdNum)){
            if(dataCharIdNum === 26){
              questresultItemsContChar = childChar;
             }
            
            if(dataCharIdNum === 32){
            questsotryItemsContChar = childChar;
           }
          }
            

          });

          }
          
          function generateStoryActorChars(){
            let storyChars;
            let storyCharsElement;
            let storyActionAllChildren = [];
            let actionCharDivArray = [];
            

            currentScene.actor_chars_story.forEach((storyChar)=>{
              storyChars = getCharByNum(storyChar);
              storyCharsElement = manufactureElement(storyChars);
              let tempDivContainer = document.createElement('div');
              tempDivContainer.innerHTML = storyCharsElement;
              // this is an HTML markup string and not element ->
              // it doesnt automatically become child of the div
              // i had to use the accumulator pattern.. -.-
              questsotryItemsContChar.
              appendChild(tempDivContainer.firstElementChild);
            });
            
            
            storyActionAllChildren = Array.from(questsotryItemsContChar.children);
            // we get the relevant ones out of this array
            
            storyActionAllChildren.forEach((storyChild)=>{
              if(storyChild.nodeName === 'DIV'){
                actionCharDivArray.push(storyChild);
              }
            });
            console.log(actionCharDivArray);
            actionCharDivArray.forEach((childChar)=>{
  
            let dataCharIdNum = Number(childChar.dataset.charId);
            if(currentScene.actor_chars_story.includes(dataCharIdNum)){
              console.log(dataCharIdNum);
            }
              
  
            });
  
          }
         
          

          function generateActorResultChars(){
            let storyResultChars;
            let storyResultCharsElement;
            let storyActionResultAllChildren = [];
            let actionResultCharDivArray = [];

            // create items
            items.forEach((item)=>{
              remainingItems.push(item);
            });
            

            currentScene.actor_chars_result.forEach((resultChar)=>{
              storyResultChars = getCharByNum(resultChar);
              storyResultCharsElement = manufactureElement(storyResultChars);
              let tempDivContainer = document.createElement('div');
              tempDivContainer.innerHTML = storyResultCharsElement;
              // this is an HTML markup string and not element ->
              // it doesnt automatically become child of the div
              // i had to use the accumulator pattern.. -.-
              if(!endPositionWoods){
              questresultItemsContChar.
              appendChild(tempDivContainer.firstElementChild);
             } else {
              if(resultChar === 29){
                questresultItemsContChar.
                appendChild(tempDivContainer.firstElementChild);
                
              }
             }
            });
            
            if(!endPositionWoods){
            storyActionResultAllChildren = Array.from(questresultItemsContChar.children);
            // we get the relevant ones out of this array
            
            storyActionResultAllChildren.forEach((storyChild)=>{
              if(storyChild.nodeName === 'DIV'){
                actionResultCharDivArray.push(storyChild);
              }
            });
            console.log(actionResultCharDivArray);
            let itemNodsObj = [];
            let charBoxToTry = [];
            let slot1 = undefined;
            let slot2 = undefined;
            let itemsChildren = [];
            let itemsChildrenDivs = [];

            // vars for item match check
            let pattern = [22,23];
            let attempt1 = undefined;
            let attempt2 = undefined;
            let itemsObjToTry = [];
            

            actionResultCharDivArray.forEach((childChar)=>{
            // we separate from all items the items that
            // participate in this part of game
          
            let dataCharIdNum = Number(childChar.dataset.charId);
            if(currentScene.actor_chars_result.includes(dataCharIdNum)){
              remainingItems.forEach((remainingItem)=>{
                if(remainingItem.charId === dataCharIdNum){
                  let itemCharDom = generateDOM(dataCharIdNum);
                  itemNodsObj.push({
                    dataCharIdNum,
                    itemCharDom
                  });
                  //honeyNod.classList.add('item_honey-inside_questbox-slot2');
                }
              });

            }
            });
            

            // use classlist to put out chars on screen
            //itemNodsObj
            itemsChildren = Array.from(inventoryNormlaNod.children); 
            itemsChildren.forEach((itemsChild)=>{
              if(itemsChild.nodeName === 'DIV'){
                itemsChildrenDivs.push(itemsChild);
              }
            });

            // have to detach previously attached event listeners
            // so they dont submerge again and cause problems..
            /*
            itemNodsGlobal.forEach((itemNods)=>{
              itemNods.removeEventListener();
            });*/
            // not valid solution..


            itemsChildrenDivs.forEach((itemsChild)=>{
              let itemCharDom = itemsChild;
              let dataCharIdNum = Number(itemCharDom.dataset.charId);
              
             

              itemCharDom.addEventListener('mouseover', ()=>{
                itemsChild.style.border = '3px solid yellow';
              });

              itemCharDom.addEventListener('mouseout', () => {
                itemsChild.style.border = ''; 
              });

              itemCharDom.addEventListener('click',function itemCharEL(){
                if(itemNumIneed === undefined){
                  handleInventoryQuestboxInteraction(itemCharDom,dataCharIdNum);
                } else {
                  itemCharDom.removeEventListener('click',itemCharEL);
                }
              });
             
              
            });

            let questDOM = DOMcurrentSceneContCharElement.
            querySelector('.js-insertplace_quest_items-character');

            /*if(endPositionWoods){
              questDOM.style.display = 'none';
              console.log('ztf');
              // -.-
            }*/
            

            let stickItemInQuest = questDOM.
            querySelector('.js-item_stick-character');

            let honeyItemInQuest = questDOM.
            querySelector('.js-item_honey-character');
            
            let ropeItemInQuest = questDOM.
            querySelector('.js-item_rope-character');

            // they are not well positioned by default
            // we fix this first
            setDefaultItemPlaceInQuestbox();
            function setDefaultItemPlaceInQuestbox() {
              stickItemInQuest.style.display = 'none';
              honeyItemInQuest.style.display = 'none';
              ropeItemInQuest.style.display = 'none';
            }
          
            function resetOneDefaultItemPlaceInQuestbox(nod){
              nod.style.display = 'initial';
            }

            function handleInventoryQuestboxInteraction(itemCharDom,dataCharIdNum){
              
              // itemNodsObj - contains the 3 items
              console.log(itemNodsObj);

              itemNodsObj.forEach((itemNodObj)=>{
                if(itemNodObj.dataCharIdNum === dataCharIdNum){
                  itemCharDom.style.display = 'none';
                  if(Object.keys(itemsObjToTry).length < 2){
                    itemsObjToTry.push({
                      dataCharIdNum : itemNodObj.dataCharIdNum,
                      itemCharDom : itemNodObj.itemCharDom
                    });
                  } 
                }
              });
              console.log(itemsObjToTry);
              console.log(Object.keys(itemsObjToTry).length);
              if(Object.keys(itemsObjToTry).length === 2){
                itemsObjToTry.forEach((itemToTry)=>{
                  if(attempt1 === undefined){
                    attempt1 = itemToTry.dataCharIdNum;
                  } else {
                    attempt2 = itemToTry.dataCharIdNum;
                  }
                });
              }
              // fill up slots
            
            
              if(Object.keys(itemsObjToTry).length > 0){
                itemsObjToTry.forEach((itemToTry)=>{
                  if(itemToTry.dataCharIdNum === 22){
                    if(slot1 === undefined){
                      slot1 = {
                        dataCharIdNum : itemToTry.dataCharIdNum,
                        itemCharDom : ropeItemInQuest 
                        };
                    } else {
                      slot2 = {
                        dataCharIdNum : itemToTry.dataCharIdNum,
                        itemCharDom : ropeItemInQuest 
                        };
                    }
                  } else if(itemToTry.dataCharIdNum === 23){
                    if(slot1 === undefined){
                      slot1 = {
                        dataCharIdNum : itemToTry.dataCharIdNum,
                        itemCharDom : honeyItemInQuest 
                        };
                    } else {
                      slot2 = {
                        dataCharIdNum : itemToTry.dataCharIdNum,
                        itemCharDom : honeyItemInQuest 
                        };
                    }
                  }else if(itemToTry.dataCharIdNum === 24){
                    if(slot1 === undefined){
                      slot1 = {
                        dataCharIdNum : itemToTry.dataCharIdNum,
                        itemCharDom : stickItemInQuest 
                        };
                    } else {
                      slot2 = {
                        dataCharIdNum : itemToTry.dataCharIdNum,
                        itemCharDom : stickItemInQuest 
                        };
                    }
                  }
                });
              }
              if(slot1 != undefined){
                if(slot1.dataCharIdNum === 22){
                  resetOneDefaultItemPlaceInQuestbox(slot1.itemCharDom);
                  slot1.itemCharDom.
                  classList.add('item_rope-inside_questbox-slot1');
                } else if(slot1.dataCharIdNum === 23){
                  resetOneDefaultItemPlaceInQuestbox(slot1.itemCharDom);
                  slot1.itemCharDom.
                  classList.add('item_honey-inside_questbox-slot1');
                } else if(slot1.dataCharIdNum === 24){
                  resetOneDefaultItemPlaceInQuestbox(slot1.itemCharDom);
                  slot1.itemCharDom.
                  classList.add('item_stick-inside_questbox-slot1');
                }
              }

              if(slot2 != undefined){
                if(slot2.dataCharIdNum === 22){
                  resetOneDefaultItemPlaceInQuestbox(slot2.itemCharDom);
                  slot2.itemCharDom.
                  classList.add('item_rope-inside_questbox-slot2');
                } else if(slot2.dataCharIdNum === 23){
                  resetOneDefaultItemPlaceInQuestbox(slot2.itemCharDom);
                  slot2.itemCharDom.
                  classList.add('item_honey-inside_questbox-slot2');
                } else if(slot2.dataCharIdNum === 24){
                  resetOneDefaultItemPlaceInQuestbox(slot2.itemCharDom);
                  slot2.itemCharDom.
                  classList.add('item_stick-inside_questbox-slot2');
                }
              }


              if(attempt1 != undefined && attempt2 != undefined){
                if(pattern.includes(attempt1) &&
                   pattern.includes(attempt2) &&
                   attempt1 != attempt2
                ){
                  document.querySelector('.js-quest_solved-character').
                  style.zIndex = '101';
                  document.querySelector('.js-kid_rescued_from_bear-character').
                  style.zIndex = '100';
                  document.querySelector('.js-bear_eating-character').
                  style.opacity = '1';
                  document.querySelector('.js-bear-character').
                  style.zIndex = '100';
                  

                  ObsoleteItems.push(attempt1);
                  ObsoleteItems.push(attempt2);
                  
                  itemNodsObj.forEach((itemNodObj)=>{
                    if(itemNodObj.dataCharIdNum !== attempt1 ||
                       itemNodObj.dataCharIdNum !== attempt2
                    ){
                      itemNumIneed = itemNodObj.dataCharIdNum;
                    }
                  });
                  

                  woodQuestDone = true;
                  endPositionWoods = true;
                  scene3Nods = [];
                  handleClueTextField();
                } else{
                  if(attempt1 != undefined &&
                     attempt2 != undefined){
                  setTimeout(()=>{
                    console.log('i run');
                    // !!! attempt1,attempt2 = undefined; !!!
                    // this only reassigns attempt2
                    attempt1 = undefined;
                    attempt2 = undefined;
                    console.log(attempt1);
                    itemsObjToTry.forEach((itemToTry)=>{
                      itemToTry.itemCharDom.style.display = 'initial';
                    });
                    itemsObjToTry = [];
                    if(slot1.itemCharDom.classList.
                      contains('item_rope-inside_questbox-slot1')){
                        slot1.itemCharDom.classList.
                        remove('item_rope-inside_questbox-slot1');
                    } else if(slot1.itemCharDom.classList.
                      contains('item_stick-inside_questbox-slot1')){
                        slot1.itemCharDom.classList.
                        remove('item_stick-inside_questbox-slot1');
                    } else if(slot1.itemCharDom.classList.
                      contains('item_honey-inside_questbox-slot1')){
                        slot1.itemCharDom.classList.
                        remove('item_honey-inside_questbox-slot1');
                    }

                    if(slot2.itemCharDom.classList.
                      contains('item_rope-inside_questbox-slot2')){
                        slot2.itemCharDom.classList.remove('item_rope-inside_questbox-slot2');
                    } else if(slot2.itemCharDom.classList.
                      contains('item_stick-inside_questbox-slot2')){
                        slot2.itemCharDom.classList.
                        remove('item_stick-inside_questbox-slot2');
                    } else if(slot2.itemCharDom.classList.
                      contains('item_honey-inside_questbox-slot2')){
                        slot2.itemCharDom.classList.
                        remove('item_honey-inside_questbox-slot2');
                    }
                    setDefaultItemPlaceInQuestbox();
                    slot1 = undefined;
                    slot2 = undefined;
                  },1000);
                  notRightComboMsg = true;
                  handleClueTextField();
                  setTimeout(()=>{
                    notRightComboMsg = false;
                    handleClueTextField();
                  },3000);
                }
              } 
              } else{
                // hogy lehet az egyik undefined a masik meg toltott?
                console.log(attempt1);
                console.log(attempt2);
              }
            }

          }
        }
      }
      }
      //now we need to adjust the positions of items school-area
      function nodStyles(nod,top,right,bottom,left,zIndex) {
        let nodVar = nod;
        let topVar = top;
        let rightVar = right;
        let bottomVar = bottom;
        let leftVar = left;
        let zIndexVar = zIndex;
        nod.style.top = topVar;
        nod.style.right = rightVar;
        nod.style.bottom = bottomVar;
        nod.style.left = leftVar;
        nod.style.zIndex = zIndexVar;
      }

    }
}

}
