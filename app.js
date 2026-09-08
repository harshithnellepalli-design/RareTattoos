const supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_PUBLISHABLE_KEY);

const defaultSiteSettings = {
  phone: "+91 98765 43210",
  email: "hello@rare-tattoo-studio.com",
  instagram: "@rare_tattoo_studio",
  address: "Bengaluru, India",
  logoImage: "assets/rare-tattoos-logo.jpg",
  heroImage: "assets/rare-tattoos-logo.jpg"
};

const defaultDesigns = [
  { id: 1, name: "Black & Grey Lion", style: "Black & Grey", price: 5000, description: "Bold shaded realism.", image: "assets/rare-tattoos-logo.jpg" },
  { id: 2, name: "Fine Line Rose", style: "Fine Line", price: 2500, description: "Minimal botanical detail.", image: "assets/rare-tattoos-logo.jpg" },
  { id: 3, name: "Custom Raven", style: "Custom", price: 6000, description: "Dark custom composition.", image: "assets/rare-tattoos-logo.jpg" },
  { id: 4, name: "Realism Portrait", style: "Realism", price: 8000, description: "Detailed portrait work.", image: "assets/rare-tattoos-logo.jpg" },
  { id: 5, name: "Geometric Wolf", style: "Custom", price: 4500, description: "Sharp geometric blackwork.", image: "assets/rare-tattoos-logo.jpg" },
  { id: 6, name: "Minimal Symbol", style: "Fine Line", price: 1800, description: "Small clean-line tattoo.", image: "assets/rare-tattoos-logo.jpg" }
];

const money = n => "₹" + Number(n).toLocaleString("en-IN");

async function loadPublicData() {
  const [{ data: designsData, error: designsError }, { data: settingsData, error: settingsError }] = await Promise.all([
    supabaseClient.from("designs").select("id,name,style,price,description,image").order("created_at", { ascending: false }),
    supabaseClient.from("site_settings").select("phone,email,instagram,address,logo_image,hero_image").eq("id", true).maybeSingle()
  ]);
  if (designsError) throw designsError;
  if (settingsError) throw settingsError;
  return {
    designs: designsData?.length ? designsData : defaultDesigns,
    settings: settingsData ? { ...defaultSiteSettings, ...settingsData, logoImage: settingsData.logo_image, heroImage: settingsData.hero_image } : defaultSiteSettings
  };
}

async function renderPublic() {
  try {
    const { designs, settings } = await loadPublicData();
    const fallbackImage = settings.logoImage || defaultSiteSettings.logoImage;
    const galleryEl = document.getElementById("gallery");
    if (galleryEl) galleryEl.innerHTML = designs.map(x => `<article class="gallery-card"><img src="${x.image || fallbackImage}" alt="${x.name}" style="width:100%;height:260px;object-fit:cover;border-radius:18px 18px 0 0;display:block;"><div class="caption"><strong>${x.name}</strong><br><span>${x.style} · From ${money(x.price)}</span></div></article>`).join("");
    const pricesEl = document.getElementById("prices");
    if (pricesEl) pricesEl.innerHTML = designs.slice(0, 6).map(x => `<article class="price-card"><h3>${x.style}</h3><div class="price">${money(x.price)}+</div><p>${x.description || ""}</p></article>`).join("");
    const bookingStyleEl = document.getElementById("bookingStyle");
    if (bookingStyleEl) bookingStyleEl.innerHTML = '<option value="">Select a style</option>' + [...new Set(designs.map(x => x.style))].map(style => `<option>${style}</option>`).join("");
    document.querySelectorAll(".brand img").forEach(img => { img.src = settings.logoImage || fallbackImage; });
    const heroImageEl = document.getElementById("heroImage");
    if (heroImageEl) heroImageEl.src = settings.heroImage || fallbackImage;
    document.getElementById("studioPhone").textContent = settings.phone;
    document.getElementById("studioEmail").textContent = settings.email;
    document.getElementById("studioInstagram").textContent = settings.instagram;
    document.getElementById("studioAddress").textContent = settings.address;
    document.getElementById("year").textContent = new Date().getFullYear();
  } catch (error) {
    console.error("Unable to load studio data:", error);
  }
}

function toggleMenu() { document.querySelector(".site-header").classList.toggle("mobile-open"); }

document.addEventListener("DOMContentLoaded", () => {
  renderPublic();
  const form = document.getElementById("bookingForm");
  if (!form) return;
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const { error } = await supabaseClient.from("bookings").insert({ id: Date.now(), ...data, status: "Pending" });
    if (error) {
      alert("Unable to send booking request. Please try again.");
      console.error(error);
      return;
    }
    form.reset();
    document.getElementById("bookingSuccess").hidden = false;
  });
});
