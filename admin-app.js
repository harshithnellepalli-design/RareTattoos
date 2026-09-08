const adminSupabase = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_PUBLISHABLE_KEY);

const adminDefaultDesigns = [
  { id: 1, name: "Black & Grey Lion", style: "Black & Grey", price: 5000, description: "Bold shaded realism.", image: "assets/rare-tattoos-logo.jpg" },
  { id: 2, name: "Fine Line Rose", style: "Fine Line", price: 2500, description: "Minimal botanical detail.", image: "assets/rare-tattoos-logo.jpg" },
  { id: 3, name: "Custom Raven", style: "Custom", price: 6000, description: "Dark custom composition.", image: "assets/rare-tattoos-logo.jpg" },
  { id: 4, name: "Realism Portrait", style: "Realism", price: 8000, description: "Detailed portrait work.", image: "assets/rare-tattoos-logo.jpg" },
  { id: 5, name: "Geometric Wolf", style: "Custom", price: 4500, description: "Sharp geometric blackwork.", image: "assets/rare-tattoos-logo.jpg" },
  { id: 6, name: "Minimal Symbol", style: "Fine Line", price: 1800, description: "Small clean-line tattoo.", image: "assets/rare-tattoos-logo.jpg" }
];

const adminMoney = n => "₹" + Number(n).toLocaleString("en-IN");

async function adminQuery(table, query) {
  const result = await query;
  if (result.error) throw result.error;
  return result.data;
}

async function loadAdminData() {
  let designs = await adminQuery("designs", adminSupabase.from("designs").select("id,name,style,price,description,image").order("created_at", { ascending: false }));
  if (!designs.length) {
    designs = await adminQuery("designs", adminSupabase.from("designs").upsert(adminDefaultDesigns).select("id,name,style,price,description,image"));
  }
  const bookings = await adminQuery("bookings", adminSupabase.from("bookings").select("*").order("created_at", { ascending: false }));
  const settings = await adminQuery("site_settings", adminSupabase.from("site_settings").select("*").eq("id", true).maybeSingle());
  return { designs, bookings, settings };
}

function settingsToForm(settings) {
  document.getElementById("settingPhone").value = settings?.phone || "";
  document.getElementById("settingEmail").value = settings?.email || "";
  document.getElementById("settingInstagram").value = settings?.instagram || "";
  document.getElementById("settingAddress").value = settings?.address || "";
  document.getElementById("settingLogoImage").value = settings?.logo_image || "assets/rare-tattoos-logo.jpg";
  document.getElementById("settingHeroImage").value = settings?.hero_image || "assets/rare-tattoos-logo.jpg";
}

async function renderAdmin() {
  try {
    const { designs, bookings, settings } = await loadAdminData();
    document.getElementById("totalBookings").textContent = bookings.length;
    document.getElementById("pendingBookings").textContent = bookings.filter(x => x.status === "Pending").length;
    document.getElementById("confirmedBookings").textContent = bookings.filter(x => x.status === "Confirmed").length;
    document.getElementById("designCount").textContent = designs.length;
    document.getElementById("bookingRows").innerHTML = bookings.length ? bookings.map(x => `<tr><td><strong>${x.name}</strong><br><span style="color:#777">${x.email || ""}</span></td><td>${x.style || "Custom"}<br><span style="color:#777">${x.placement || ""} ${x.size || ""}</span></td><td>${x.date}<br>${x.time}</td><td>${x.phone}</td><td><span class="status">${x.status}</span></td><td><div class="admin-actions"><button class="mini" onclick="setStatus(${x.id},'Confirmed')">Confirm</button><button class="mini" onclick="setStatus(${x.id},'Completed')">Done</button><button class="mini" onclick="setStatus(${x.id},'Cancelled')">Cancel</button></div></td></tr>`).join("") : `<tr><td colspan="6" style="text-align:center;color:#777;padding:40px">No bookings yet.</td></tr>`;
    document.getElementById("designRows").innerHTML = designs.map(x => `<tr><td><strong>${x.name}</strong></td><td>${x.style}</td><td>${adminMoney(x.price)}+</td><td>${x.description || ""}</td><td><div class="admin-actions"><button class="mini" onclick="openDesign(${x.id})">Edit</button><button class="mini" onclick="deleteDesign(${x.id})">Delete</button></div></td></tr>`).join("");
    settingsToForm(settings);
  } catch (error) {
    alert("Unable to load dashboard data. Check that the Supabase SQL setup was completed.");
    console.error(error);
  }
}

window.setStatus = async (id, status) => {
  const { error } = await adminSupabase.from("bookings").update({ status }).eq("id", id);
  if (error) return console.error(error);
  renderAdmin();
};

window.clearBookings = async () => {
  if (!confirm("Delete all bookings?")) return;
  const { error } = await adminSupabase.from("bookings").delete().neq("id", 0);
  if (error) return console.error(error);
  renderAdmin();
};

window.openDesign = async id => {
  const designs = await adminQuery("designs", adminSupabase.from("designs").select("*").eq("id", id || 0));
  const design = designs[0];
  document.getElementById("designModal").classList.add("open");
  document.getElementById("modalTitle").textContent = design ? "Edit tattoo design" : "Add tattoo design";
  document.getElementById("designId").value = design?.id || "";
  document.getElementById("designName").value = design?.name || "";
  document.getElementById("designStyle").value = design?.style || "Black & Grey";
  document.getElementById("designPrice").value = design?.price || "";
  document.getElementById("designDesc").value = design?.description || "";
  document.getElementById("designImage").value = design?.image || "";
};

window.closeDesign = () => document.getElementById("designModal").classList.remove("open");

window.deleteDesign = async id => {
  if (!confirm("Delete this design?")) return;
  const { error } = await adminSupabase.from("designs").delete().eq("id", id);
  if (error) return console.error(error);
  renderAdmin();
};

document.addEventListener("DOMContentLoaded", async () => {
  const oldLoginForm = document.getElementById("loginForm");
  const loginForm = oldLoginForm.cloneNode(true);
  loginForm.querySelector("#username").type = "email";
  loginForm.querySelector("#username").value = "";
  loginForm.querySelector("#username").placeholder = "you@example.com";
  loginForm.querySelector("#username").parentElement.firstChild.textContent = "Email";
  loginForm.querySelector("#password").placeholder = "Your password";
  loginForm.querySelector("small").textContent = "Use the admin user created in Supabase Authentication.";
  oldLoginForm.replaceWith(loginForm);

  const { data: { session } } = await adminSupabase.auth.getSession();
  const showDashboard = async () => {
    document.getElementById("login").classList.add("hidden");
    document.getElementById("dashboard").classList.remove("hidden");
    await renderAdmin();
  };
  if (session) await showDashboard();

  loginForm.addEventListener("submit", async event => {
    event.preventDefault();
    const { error } = await adminSupabase.auth.signInWithPassword({
      email: loginForm.querySelector("#username").value.trim(),
      password: loginForm.querySelector("#password").value
    });
    if (error) return alert(error.message);
    await showDashboard();
  });

  document.getElementById("designForm").addEventListener("submit", async event => {
    event.preventDefault();
    const id = document.getElementById("designId").value;
    const design = {
      id: id ? Number(id) : Date.now(),
      name: document.getElementById("designName").value.trim(),
      style: document.getElementById("designStyle").value,
      price: Number(document.getElementById("designPrice").value),
      description: document.getElementById("designDesc").value.trim(),
      image: document.getElementById("designImage").value.trim() || "assets/rare-tattoos-logo.jpg"
    };
    const { error } = await adminSupabase.from("designs").upsert(design);
    if (error) return alert(error.message);
    closeDesign();
    renderAdmin();
  });

  document.getElementById("settingsForm").addEventListener("submit", async event => {
    event.preventDefault();
    const settings = {
      id: true,
      phone: document.getElementById("settingPhone").value.trim(),
      email: document.getElementById("settingEmail").value.trim(),
      instagram: document.getElementById("settingInstagram").value.trim(),
      address: document.getElementById("settingAddress").value.trim(),
      logo_image: document.getElementById("settingLogoImage").value.trim(),
      hero_image: document.getElementById("settingHeroImage").value.trim()
    };
    const { error } = await adminSupabase.from("site_settings").upsert(settings);
    if (error) return alert(error.message);
    alert("Studio details saved.");
    renderAdmin();
  });
});
