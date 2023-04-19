// when html page is rendered this script will run and then this function will run which will in turn tell the 
// server that now client is connected and hence it can be called as a response
const socket=io();
const messageForm=document.querySelector('#msg-form');
const messageFormInput=messageForm.querySelector('input');
const messageFormButton=messageForm.querySelector('button')
const locationButton=document.querySelector('#location');
const messages=document.querySelector('#messages');

// templates
const messageTemplate=document.querySelector('#message-template').innerHTML;
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML;
const locationTemplate=document.querySelector('#location-message-template').innerHTML;

const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true});
const autoScroll=()=>{
    // New message element
    const $newMessage = messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = messages.offsetHeight

    // Height of messages container
    const containerHeight = messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        messages.scrollTop = messages.scrollHeight
    }
}

socket.on('message',(msg)=>{
    const html=Mustache.render(messageTemplate,{...msg,createdAt:moment(msg.createdAt).format('h:mm a')});
    messages.insertAdjacentHTML('beforeend',html);
    autoScroll();
})

socket.on('locationMessage',(msg)=>{
    const html=Mustache.render(locationTemplate,{...msg,createdAt:moment(msg.createdAt).format('h:mm a')});
  
    messages.insertAdjacentHTML('beforeend',html);
    autoScroll();
})

socket.on('roomData',(data)=>{
       const html=Mustache.render(sidebarTemplate,{room:data.room,users:data.users});


document.querySelector('#sidebar').innerHTML=html;

})
messageForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    messageFormButton.setAttribute('disabled','disabled');
    socket.emit('send message',e.target.elements.message.value,(error)=>{
        messageFormInput.value='';
        messageFormInput.focus();
        messageFormButton.removeAttribute('disabled');
        
        if(error)
        return console.log(error);
       
        console.log('Message Delivered!');
    });
})

locationButton.addEventListener('click',(e)=>{
    if(!navigator.geolocation)
    return alert('geolocation is not supported by your browser.');

    locationButton.setAttribute('disabled','disabled');
    navigator.geolocation.getCurrentPosition(position=>{
        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },(msg)=>{
            locationButton.removeAttribute('disabled');
            console.log(msg);
        });
    });
})

socket.emit('join',{username,room},(error)=>{
if(error)
{alert(error)
location.href='/'
}

})
 