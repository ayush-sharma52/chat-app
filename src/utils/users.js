//addUser , removeUser, getUsersInRoom, getUsers

const users=[];

const addUser=({id,username,room})=>{
username=username.trim().toLowerCase();
room=room.trim().toLowerCase();
if(!username || !room)
return {
    error:'username and room are required',
}

const existingUser=users.find(user=>user.username===username && user.room===room)

if(existingUser)
return{
    error:'User already in the room'
}

const user={username,room,id}
users.push(user);
return {user};

}

const removeUser=(id)=>{
const index=users.findIndex(user=>user.id===id);

if(index!==-1)
return users.splice(index,1)[0];

}
const getUser=(id)=>{
    return users.find(user=>user.id===id);
}

const getUsersInRoom=(room)=>{
room=room.trim().toLowerCase();
return users.filter(user=>user.room===room);
}

module.exports={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}