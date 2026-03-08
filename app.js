const API = "http://localhost:3000"

let user = null
let sessions = []

function initTimes() {

const select = document.getElementById("time")

for (let h = 9; h <= 20; h++) {

let hour = h.toString().padStart(2,"0")

select.innerHTML += `<option value="${hour}:00">${hour}:00</option>`

if (h !== 20)
select.innerHTML += `<option value="${hour}:30">${hour}:30</option>`

}

}

initTimes()

function parseJwt(token) {

const base64Url = token.split('.')[1]
const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
'%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
).join(''))

return JSON.parse(jsonPayload)

}

window.handleCredentialResponse = (response) => {

user = parseJwt(response.credential)

document.getElementById("user").innerText =
"Connecté : " + user.name

document.getElementById("form").style.display = "block"

}

window.onload = () => {

google.accounts.id.initialize({
client_id:"291194226780-f5h7q772nvlb5b4bp9njkivk8id25vu9.apps.googleusercontent.com",
callback:handleCredentialResponse
})

google.accounts.id.renderButton(
document.getElementById("login"),
{ theme:"outline", size:"large" }
)

loadSessions()

setInterval(loadSessions,3000)

}

async function loadSessions(){

const res = await fetch(API + "/sessions")
sessions = await res.json()

render()

}

function render(){

const container = document.getElementById("sessions")
container.innerHTML = ""

let total = 0

sessions.forEach(s => {

const end = s.start + 3600000
const remain = Math.floor((end - Date.now()) / 1000)

let className = "session"

if(remain <= 180 && remain > 0)
className += " yellow"

if(remain <= 0)
className += " red"

total += Number(s.people)

container.innerHTML += `

<div class="${className}">

<div class="sessionTitle">
${s.time}
</div>

<div>
${s.name}
</div>

<div>
👥 ${s.people} personnes
</div>

<div class="timer">
Temps restant : ${remain}s
</div>

${user ? `<button onclick="deleteSession('${s.id}')">Supprimer</button>` : ""}

</div>

`

})

document.getElementById("total").innerText = total

}

async function addSession(){

if(!user) return

const name = document.getElementById("name").value
const people = document.getElementById("people").value
const time = document.getElementById("time").value

if(!name || !people) return

await fetch(API + "/sessions",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

id:Date.now().toString(),

name,

people,

time,

start:Date.now()

})

})

document.getElementById("name").value = ""
document.getElementById("people").value = ""

loadSessions()

}

async function deleteSession(id){

await fetch(API + "/delete",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({id})

})

loadSessions()

}