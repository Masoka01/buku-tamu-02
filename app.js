// Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBL20DH-OKKNpF1hTzbrX2fQVn6xqQCaFc",
  authDomain: "buku-tamu-01.firebaseapp.com",
  databaseURL:
    "https://buku-tamu-01-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "buku-tamu-01",
  storageBucket: "buku-tamu-01.appspot.com",
  messagingSenderId: "999306269197",
  appId: "1:999306269197:web:9f8b3cbec95857618e3b44",
  measurementId: "G-P706ZYGTZM",
};

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const guestsRef = database.ref("guests");

// Format tanggal
function formatDate(dateString) {
  const options = {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString("id-ID", options);
}

// Handle form submission
document.getElementById("guestForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;

  // Tampilkan loading
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';

  // Ambil nilai form
  const name = document.getElementById("name").value.trim();
  const address = document.getElementById("address").value.trim();
  const attendance = document.getElementById("attendance").value;
  const message = document.getElementById("message").value.trim();

  // Validasi dasar
  if (!name || !message || !attendance) {
    alert("Harap isi nama, pesan, dan konfirmasi kehadiran!");
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
    return;
  }

  // Data yang akan dikirim ke Firebase
  const guestData = {
    name: name,
    address: address || "-",
    attendance: attendance,
    message: message,
    timestamp: new Date().toISOString(),
  };

  // Kirim data ke Firebase
  guestsRef
    .push(guestData)
    .then(function () {
      alert("Terima kasih atas pesan Anda!");
      document.getElementById("guestForm").reset();
    })
    .catch(function (error) {
      console.error("Error:", error);
      alert("Maaf, terjadi kesalahan. Silakan coba lagi.");
    })
    .finally(function () {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    });
});

// Tampilkan pesan tamu
guestsRef.on("value", function (snapshot) {
  const guests = snapshot.val();
  const guestMessages = document.getElementById("guestMessages");

  guestMessages.innerHTML = "";

  if (guests) {
    // Konversi ke array dan urutkan berdasarkan waktu (terbaru di bawah)
    const guestsArray = Object.entries(guests)
      .map(([id, guest]) => ({ id, ...guest }))
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // Tampilkan setiap pesan
    guestsArray.forEach(function (guest) {
      const messageCard = document.createElement("div");
      messageCard.className = "message-card";

      // Buat elemen status kehadiran
      const attendanceStatus = document.createElement("span");
      attendanceStatus.className = `attendance-status ${
        guest.attendance === "Hadir" ? "hadir" : "tidak-hadir"
      }`;
      attendanceStatus.textContent = guest.attendance;

      messageCard.innerHTML = `
        <div class="message-header">
          <div class="message-name">${guest.name}</div>
          <div class="message-date">${formatDate(guest.timestamp)}</div>
        </div>
        <div class="message-meta">
          ${attendanceStatus.outerHTML}
          ${
            guest.address
              ? `<div class="message-address">${guest.address}</div>`
              : ""
          }
        </div>
        <div class="message-content">"${guest.message}"</div>
      `;
      guestMessages.appendChild(messageCard);
    });

    // Scroll ke bawah
    guestMessages.scrollTop = guestMessages.scrollHeight;
  } else {
    guestMessages.innerHTML =
      '<p style="text-align:center;color:#666;">Belum ada pesan</p>';
  }
});
