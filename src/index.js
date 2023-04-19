const Path=require('path');
const http=require('http');
const express=require('express');
const socketio=require('socket.io');
const Filter=require('bad-words');
const {generateMessage}=require('./utils/messages');
const {  addUser,
    removeUser,
    getUser,
    getUsersInRoom}=require('./utils/users');

const app=express();
// we had not made server like this before because express take care of these things behind the scenes but here we did it 
// now for to use socket.io

const server=http.createServer(app);
const io=socketio(server);

const port=process.env.Port||3000;

const publicDirectoryPath=Path.join(__dirname,'../public')
app.use(express.static(publicDirectoryPath));

// let count=0;

io.on('connection',(socket)=>{
    console.log("New Web Socket Connection");


socket.on('join',(options,cb)=>{
    const {error,user}=addUser({id:socket.id,...options})
    if(error)
    return   cb(error);

    socket.join(user.room);
    
socket.emit('message',generateMessage('Welcome!','admin'));
socket.broadcast.to(user.room).emit('message',generateMessage(`${user.username} user has joined!`,'admin'))
io.to(options.room).emit('roomData',{
    room:user.room,
    users:getUsersInRoom(user.room)
})
cb();
})

socket.on('send message',(msg,cb)=>{
    const user=getUser(socket.id);
    const filter=new Filter();
    if(filter.isProfane(msg))
    return cb('Profanity is not allowed');

    io.to(user.room).emit('message',generateMessage(msg,user.username));
    cb();
})

socket.on('sendLocation',(coords,cb)=>{
    const user=getUser(socket.id);
    io.to(user.room).emit('locationMessage',generateMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`,user.username));
    cb('location shared');
})

socket.on('disconnect',()=>{
    const user=removeUser(socket.id);
    if(user)
    {io.to(user.room).emit('message',generateMessage(`${user.username} has left`,'admin'));
    io.to(user.room).emit('roomData',{
        room:user.room,
        users:getUsersInRoom(user.room)
    })}
})

// emitting to currently connected client
// socket.emit('countUpdated',count);
        
// socket.on('countIncremented',()=>{
//     ++count;
//     // socket.emit('countUpdated',count);
//     // emitting to all clients
//     io.emit('countUpdated',count);

//     })

})


server.listen(port,()=>{
    console.log('server up on port '+port);
})