const defaultDesigns = [
  {id:1,name:"Black & Grey Lion",style:"Black & Grey",price:5000,description:"Bold shaded realism."},
  {id:2,name:"Fine Line Rose",style:"Fine Line",price:2500,description:"Minimal botanical detail."},
  {id:3,name:"Custom Raven",style:"Custom",price:6000,description:"Dark custom composition."},
  {id:4,name:"Realism Portrait",style:"Realism",price:8000,description:"Detailed portrait work."},
  {id:5,name:"Geometric Wolf",style:"Custom",price:4500,description:"Sharp geometric blackwork."},
  {id:6,name:"Minimal Symbol",style:"Fine Line",price:1800,description:"Small clean-line tattoo."}
];
const designs = () => JSON.parse(localStorage.getItem("rare_designs") || "null") || defaultDesigns;
const bookings = () => JSON.parse(localStorage.getItem("rare_bookings") || "[]");
const money = n => "₹" + Number(n).toLocaleString("en-IN");

function renderPublic(){
  const d=designs();
  document.getElementById("gallery").innerHTML=d.map((x,i)=>`<article class="gallery-card"><div class="demo-art">${["◈","✦","◉","△","✧","◇"][i%6]}</div><div class="caption"><strong>${x.name}</strong><br><span>${x.style} · From ${money(x.price)}</span></div></article>`).join("");
  document.getElementById("prices").innerHTML=d.slice(0,6).map(x=>`<article class="price-card"><h3>${x.style}</h3><div class="price">${money(x.price)}+</div><p>${x.description}</p></article>`).join("");
  document.getElementById("bookingStyle").innerHTML='<option value="">Select a style</option>'+[...new Set(d.map(x=>x.style))].map(s=>`<option>${s}</option>`).join("");
  document.getElementById("year").textContent=new Date().getFullYear();
}
function toggleMenu(){document.querySelector(".site-header").classList.toggle("mobile-open")}
document.addEventListener("DOMContentLoaded",()=>{
  renderPublic();
  const form=document.getElementById("bookingForm");
  if(form) form.addEventListener("submit",e=>{
    e.preventDefault();
    const data=Object.fromEntries(new FormData(form).entries());
    data.id=Date.now(); data.status="Pending"; data.createdAt=new Date().toISOString();
    const b=bookings(); b.unshift(data); localStorage.setItem("rare_bookings",JSON.stringify(b));
    form.reset(); document.getElementById("bookingSuccess").hidden=false;
  });
});