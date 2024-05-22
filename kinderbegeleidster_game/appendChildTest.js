let gamefieldNod = document.querySelector('.js-game-field');
gamefieldNod.innerHTML = `
  <div class='hi'><button>Hi</button></div>
`;



let btnNod = document.querySelector('.hi');
btnNod.addEventListener('click',()=>{
  console.log('ok');
});

//like this the event listener from btnNod is lost
// unless we use gamefieldNod.insertAdjacentHTML('beforeend', `
//<div class='bye'><button>Bye</button></div>`);
gamefieldNod.insertAdjacentHTML('beforeend', `
<div class='bye'><button>Bye</button></div>
`); 

let tempContainer = document.createElement('div');

tempContainer.innerHTML = '<div class="test">Your div content goes here</div>';

let divElement = tempContainer.firstChild;

gamefieldNod.appendChild(divElement);
/**
The reason for using a temporary container like 
tempContainer is to leverage its ability to parse
 HTML strings into DOM elements. The createElement()
  method creates a new, empty div element in memory,
   which isn't directly visible in the DOM tree 
   until you append it to the document.

Here's why it's used in the context you provided:

Parsing HTML String: When you set the innerHTML
 property of the tempContainer, it automatically
  parses the HTML string into actual DOM elements.
   This allows you to work with the HTML string as 
   if it were part of the document structure.
Extracting Element: After setting the innerHTML,
 you extract the first child of tempContainer. 
 This child is the div element created from the HTML string.
Manipulation Without Rendering: By manipulating elements 
in this way (using a detached container), you avoid direct
 manipulation of the live DOM, which can trigger 
 reflows and repaints. This can be beneficial for 
 performance when dealing with complex DOM manipulation.
Appending: Once you have the desired element (divElement),
 you can append it to the document where needed. */
console.log(gamefieldNod.children);
console.log(document.querySelector('.test').parentElement);






