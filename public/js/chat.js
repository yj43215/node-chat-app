


const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
//Options
const { username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})
const autoscroll = ()=>{
    const $newMessage= $messages.lastElementChild

    const newMessageStyle =getComputedStyle($newMessage)
    const newmsgMargin =parseInt(newMessageStyle.marginBottom)
    const newmessageHeight = $newMessage.offsetHeight + newmsgMargin
    

    const visibleheight =$messages.offsetHeight

    const containerheight =$messages.scrollHeight
     
    const scrolloffset =$messages.scrollTop +visibleheight
    if( containerheight-newmessageHeight <= scrolloffset ){
        $messages.scrollTop=$messages.scrollHeight

    }
}
socket.on('message', (message) => {
    console.log(messages)
    const html = Mustache.render(messageTemplate, {
        username:message.username,
        message:message.text,
        createdAt:moment(messages.createdAt).format('h:mm A')
    })
    
    
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (url) => {
    
    const html = Mustache.render(locationMessageTemplate, {
        username:url.username,
        url:url.url,
        createdAt:moment(url.createdAt).format('h:mm A')
    })
    console.log(html)
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error) {
            return console.log(error)
        }

        console.log('Message delivered!')
    })
})

socket.on('roomData',({room,users})=>{
    $sidebar.innerHTML=''
    const html=Mustache.render(sidebarTemplate,{
        room,users
    })
    $sidebar.insertAdjacentHTML('beforeend', html)

})
$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared!')  
        })
    })
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})
console.log({username,room});