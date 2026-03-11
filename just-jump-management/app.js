let sessions = JSON.parse(localStorage.getItem("sessions") || "[]")

function save(){
localStorage.setItem("sessions",JSON.stringify(sessions))
}

const hours=[]

for(let h=9;h<=20;h++){

let hour=h.toString().padStart(2,"0")

hours.push(hour+":00")

if(h!=20)
hours.push(hour+":30")

}

function initSelect(){

const select=document.getElementById("time")

hours.forEach(h=>{
select.innerHTML+=`<option value="${h}">${h}</option>`
})

}

function showDate(){

const today=new Date()

const options={
weekday:"long",
year:"numeric",
month:"long",
day:"numeric"
}

document.getElementById("todayDate").innerText=
today.toLocaleDateString("fr-FR",options)

}

function renderPlanning(){

const planning=document.getElementById("planning")

planning.innerHTML=""

let total=0

hours.forEach(hour=>{

let sessionsHour=sessions.filter(s=>s.time===hour)

if(sessionsHour.length===0) return

let block=document.createElement("div")
block.className="hourBlock"

block.innerHTML=`<div class="hourTitle">${hour}</div>`

let container=document.createElement("div")

sessionsHour.forEach(s=>{

const remain=s.end-Date.now()

const totalDuration=s.duration

let percent=(remain/totalDuration)*100

if(percent<0)percent=0
if(percent>100)percent=100

let className="session"

if(remain<=180000 && remain>0)
className+=" yellow"

if(remain<=0)
className+=" red"

total+=Number(s.people)

let div=document.createElement("div")
div.className=className

div.innerHTML=`

<div class="sessionName">${s.name}</div>

<div>👥 ${s.people}</div>

<div class="timer">${format(Math.floor(remain/1000))}</div>

<div class="timeBar">
<div class="timeProgress" style="width:${percent}%"></div>
</div>

<div class="buttons">

<button onclick="edit(${s.id})">✏️</button>
<button onclick="remove(${s.id})">❌</button>

</div>

`

container.appendChild(div)

})

block.appendChild(container)

planning.appendChild(block)

})

document.getElementById("total").innerText=total

}

function addSession(){

const name=document.getElementById("name").value
const people=document.getElementById("people").value
const time=document.getElementById("time").value

if(!name||!people)return

let start=Date.now()

let duration=3600000

let end=start+duration

sessions.push({

id:Date.now(),

name,

people,

time,

start,

end,

duration

})

save()

document.getElementById("name").value=""
document.getElementById("people").value=""

renderPlanning()

}

function remove(id){

sessions=sessions.filter(s=>s.id!==id)

save()

renderPlanning()

}

function edit(id){

let s=sessions.find(x=>x.id===id)

let minutes=prompt("Modifier temps restant (minutes)")

if(!minutes)return

s.end=Date.now()+(minutes*60000)

save()

renderPlanning()

}

function format(sec){

let sign=""

if(sec<0){
sign="-"
sec=Math.abs(sec)
}

let m=Math.floor(sec/60)
let s=sec%60

return sign+m+":"+s.toString().padStart(2,"0")

}

initSelect()

showDate()

setInterval(renderPlanning,1000)

renderPlanning()

function exportPDF(){

const { jsPDF } = window.jspdf

const doc = new jsPDF()

let y = 20

doc.setFontSize(18)
doc.text("Just Jump Management",10,10)

const today=new Date().toLocaleDateString("fr-FR")

doc.setFontSize(12)
doc.text("Date : "+today,10,18)

hours.forEach(hour=>{

let sessionsHour=sessions.filter(s=>s.time===hour)

if(sessionsHour.length===0) return

doc.text(hour,10,y)
y+=6

sessionsHour.forEach(s=>{

doc.text(
`- ${s.name} (${s.people} personnes)`,
15,
y
)

y+=6

})

y+=4

})

doc.save("planning-just-jump.pdf")

}