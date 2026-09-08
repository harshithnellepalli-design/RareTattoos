const defaultSiteSettings = {
  phone: "+91 98765 43210",
  email: "hello@rare-tattoo-studio.com",
  instagram: "@rare_tattoo_studio",
  address: "Bengaluru, India",
  logoImage: "assets/rare-tattoos-logo.jpg",
  heroImage: "assets/rare-tattoos-logo.jpg"
};

const defaultDesigns = [
  {id:1,name:"Black & Grey Lion",style:"Black & Grey",price:5000,description:"Bold shaded realism.",image:"assets/rare-tattoos-logo.jpg"},
  {id:2,name:"Fine Line Rose",style:"Fine Line",price:2500,description:"Minimal botanical detail.",image:"assets/rare-tattoos-logo.jpg"},
  {id:3,name:"Custom Raven",style:"Custom",price:6000,description:"Dark custom composition.",image:"assets/rare-tattoos-logo.jpg"},
  {id:4,name:"Realism Portrait",style:"Realism",price:8000,description:"Detailed portrait work.",image:"assets/rare-tattoos-logo.jpg"},
  {id:5,name:"Geometric Wolf",style:"Custom",price:4500,description:"Sharp geometric blackwork.",image:"assets/rare-tattoos-logo.jpg"},
  {id:6,name:"Minimal Symbol",style:"Fine Line",price:1800,description:"Small clean-line tattoo.",image:"assets/rare-tattoos-logo.jpg"}
];

const siteSettings = () => ({...defaultSiteSettings, ...(JSON.parse(localStorage.getItem("rare_site_settings") || "null") || {})});
const designs = () => JSON.parse(localStorage.getItem("rare_designs") || "null") || defaultDesigns;
const bookings = () => JSON.parse(localStorage.getItem("rare_bookings") || "[]");
const money = n => "₹" + Number(n).toLocaleString("en-IN");

function renderPublic(){
  const d = designs();
  const settings = siteSettings();
  const fallbackImage = settings.logoImage || "assets/rare-tattoos-logo.jpg";

  const galleryEl = document.getElementById("gallery");
  if (galleryEl) {
    galleryEl.innerHTML = d.map((x,i)=>`<article class="gallery-card"><img src="${x.image || fallbackImage}" alt="${x.name}" style="width:100%;height:260px;object-fit:cover;border-radius:18px 18px 0 0;display:block;"> <div class="caption"><strong>${x.name}</strong><br><span>${x.style} · From ${money(x.price)}</span></div></article>`).join("");
  }

  const pricesEl = document.getElementById("prices");
  if (pricesEl) {
    pricesEl.innerHTML = d.slice(0, 6).map(x => `<article class="price-card"><h3>${x.style}</h3><div class="price">${money(x.price)}+</div><p>${x.description}</p></article>`).join("");
  }

  const bookingStyleEl = document.getElementById("bookingStyle");
  if (bookingStyleEl) {
    bookingStyleEl.innerHTML = '<option value="">Select a style</option>' + [...new Set(d.map(x => x.style))].map(s => `<option>${s}</option>`).join("");
  }

  const brandImgs = document.querySelectorAll(".brand img");
  brandImgs.forEach(img => { img.src = settings.logoImage || "assets/rare-tattoos-logo.jpg"; });

  const heroImageEl = document.getElementById("heroImage");
  if (heroImageEl) {
    heroImageEl.src = settings.heroImage || fallbackImage;
  }

  const phoneEl = document.getElementById("studioPhone");
  const emailEl = document.getElementById("studioEmail");
  const instagramEl = document.getElementById("studioInstagram");
  const addressEl = document.getElementById("studioAddress");
  if (phoneEl) phoneEl.textContent = settings.phone;
  if (emailEl) emailEl.textContent = settings.email;
  if (instagramEl) instagramEl.textContent = settings.instagram;
  if (addressEl) addressEl.textContent = settings.address;

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
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
    form.reset(); const success=document.getElementById("bookingSuccess"); if(success) success.hidden=false;
  });
});