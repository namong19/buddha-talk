// 2-11-2023
// import bot from './assets/bot.svg';
import bot from './assets/buddha1.png';
//import bot from './assets/buddha2.png';
//import bot from './assets/om.png';
import user from './assets/user.svg';

// No React here so we need to address the targets manually
const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

// create a variable
let loadInterval;

// create a function to show the three animated dots
function loader(element) {
  element.textContent = '';

  loadInterval = setInterval(() => {
    element.textContent += '.';

    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300)
}

// create another function to type text instead of appearing as a whole
function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if(index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    }else {
      clearInterval(interval);
    }
  }, 20);
}

// create another function to generate a unique id for each message
function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);
  
  return `id-${timestamp}-${hexadecimalString}`;
}
// Create a different color stripe for user and AI
function chatStripe(isAi, value, uniqueId) {
  return (
      `<div class="wrapper ${isAi && 'ai'}">
          <div class="chat">
              <div class="profile">
                  <img 
                    src=${isAi ? bot : user} 
                    alt="${isAi ? 'bot' : 'user'}" 
                  />
              </div>
              <div class="message" id=${uniqueId}>${value}</div>
          </div>
      </div>`
  )
}

// create an async function to trigger the AI generator response
const handleSubmit = async (e) => {
  // The default is reloading the browser which we don't want
  e.preventDefault();

  const data = new FormData(form);

  // user's chatstripe, not bot's chatstripe(false)
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));
  
  // clear the text area input
  form.reset();

  // bot's chatstripe
  // first, generate the message's id 
  const uniqueId = generateUniqueId();
  // bot's chatstripe
  chatContainer.innerHTML += chatStripe(true, "", uniqueId);

  // make sure to show the message by setting the scrolling
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // Get the message
  const messageDiv = document.getElementById(uniqueId);

  // turn on the loader
  loader(messageDiv);
  // fetch data from server -> bot's response - https if deployed or http if using localhost:5000
  // const response =await fetch('http://localhost:5000', {

  const response = await fetch('https://buddha-talk.onrender.com/', {  
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  })

  // with the message body, we no longer need to load the dot
  clearInterval(loadInterval);
  // set the messageDiv to an empty string since we don't know its state (1,2, or 3 dots)
  messageDiv.innerHTML = '';

  if(response.ok) {
    const data = await response.json(); // this is giving us the direct response from the backend
    const parseData = data.bot.trim();

    typeText(messageDiv, parseData);
  } else {
    const err = await response.text();

    messageDiv.innerHTML = "Something went wrong";

    alert(err);
  }

}

// listening and calling
form.addEventListener('submit', handleSubmit);
// Submit by "Enter" key, not a button :-)
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
})