const baseUrl = "http://localhost:5000/api";

async function register() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const res = await fetch(`${baseUrl}/auth/register`, {
    method: "POST", headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ name, email, password })
  });
  const data = await res.json();
  alert(data.message || data.error);
  if (res.ok) window.location = "login.html";
}

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const res = await fetch(`${baseUrl}/auth/login`, {
    method: "POST", headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (res.ok) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);
    if (data.role === "admin") window.location = "admin.html";
    else window.location = "index.html";
  } else alert(data.error);
}

function goTo(p) { window.location = p; }
function logout() { localStorage.clear(); window.location = "login.html"; }

window.onload = async () => {
  const path = window.location.pathname.split("/").pop();
  if (path === "index.html" || path === "") loadRooms();
  if (path === "admin.html") loadBookings();
  if (path === "admin_rooms.html") loadRoomsAdmin();
};

async function loadRooms() {
  const res = await fetch(`${baseUrl}/bookings/rooms`);
  const rooms = await res.json();
  const div = document.getElementById("rooms");
  if (!div) return;
  div.innerHTML = rooms.map(r => `<div class="room-item"><b>${r.room_number}</b> - ${r.room_type} - ₹${r.price} (${r.status}) ${r.status==='available'?`<button onclick="book(${r.id})">Book</button>`:''}</div>`).join('');
}

async function book(id) {
  const check_in = prompt("Check-in (YYYY-MM-DD):");
  const check_out = prompt("Check-out (YYYY-MM-DD):");
  const token = localStorage.getItem("token");
  if (!token) return alert("Please login to book");
  const res = await fetch(`${baseUrl}/bookings/book`, {
    method: "POST", headers: {"Content-Type":"application/json","Authorization":`Bearer ${token}`},
    body: JSON.stringify({ room_id: id, check_in, check_out })
  });
  const data = await res.json();
  alert(data.message || data.error);
  loadRooms();
}

async function loadBookings() {
  const token = localStorage.getItem("token");
  if (!token) return window.location = "login.html";
  const res = await fetch(`${baseUrl}/bookings/all`, { headers: { "Authorization": `Bearer ${token}` } });
  const data = await res.json();
  const div = document.getElementById("bookings");
  if (!div) return;
  div.innerHTML = data.length ? data.map(b => `<div class="room-item">#${b.id} Room ${b.room_number || b.room_id} — ${b.user_name || b.user_id} (${b.check_in} to ${b.check_out})</div>`).join('') : '<p>No bookings</p>';
}

// Admin rooms management
async function loadRoomsAdmin() {
  const res = await fetch(`${baseUrl}/bookings/rooms`);
  const rooms = await res.json();
  const div = document.getElementById("rooms");
  if (!div) return;
  div.innerHTML = rooms.map(r => `<div class="room-item"><b>${r.room_number}</b> - ${r.room_type} - ₹${r.price} (${r.status})
    <div class="row"><button onclick="editRoom(${r.id},'${r.room_number}','${r.room_type}',${r.price},'${r.status}')">Edit</button><button onclick="deleteRoom(${r.id})">Delete</button></div>
  </div>`).join('');
}

async function addRoom() {
  const room_number = document.getElementById("room_number").value;
  const room_type = document.getElementById("room_type").value;
  const price = document.getElementById("price").value;
  const token = localStorage.getItem("token");
  const res = await fetch(`${baseUrl}/bookings/rooms/add`, {
    method: "POST", headers: {"Content-Type":"application/json","Authorization":`Bearer ${token}`},
    body: JSON.stringify({ room_number, room_type, price })
  });
  const data = await res.json();
  alert(data.message || data.error);
  loadRoomsAdmin();
}

async function editRoom(id, number, type, price, status) {
  const newNum = prompt("Room number:", number);
  const newType = prompt("Room type:", type);
  const newPrice = prompt("Price:", price);
  const newStatus = prompt("Status (available/booked):", status);
  const token = localStorage.getItem("token");
  const res = await fetch(`${baseUrl}/bookings/rooms/${id}`, {
    method: "PUT", headers: {"Content-Type":"application/json","Authorization":`Bearer ${token}`},
    body: JSON.stringify({ room_number:newNum, room_type:newType, price:newPrice, status:newStatus })
  });
  const data = await res.json();
  alert(data.message || data.error);
  loadRoomsAdmin();
}

async function deleteRoom(id) {
  if (!confirm("Delete this room?")) return;
  const token = localStorage.getItem("token");
  const res = await fetch(`${baseUrl}/bookings/rooms/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
  const data = await res.json();
  alert(data.message || data.error);
  loadRoomsAdmin();
}
