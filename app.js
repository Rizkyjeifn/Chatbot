import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getDatabase, ref, set, get, push, onValue } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDk2jj0wdaIJCIKBQ7b9y_JmVo8Lcy_LgU",
  databaseURL: "https://panel-adaa4-default-rtdb.firebaseio.com",
  projectId: "panel-adaa4"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

let myId = "";
let chatWith = "";

const authScreen = document.getElementById("authScreen");
const inboxScreen = document.getElementById("inboxScreen");
const chatScreen = document.getElementById("chatScreen");
const newChatSheet = document.getElementById("newChatSheet");

/* AUTH */
window.showLogin = () => {
  loginForm.classList.remove("hide");
  registerForm.classList.add("hide");
};

window.showRegister = () => {
  registerForm.classList.remove("hide");
  loginForm.classList.add("hide");
};

window.register = async () => {
  const id = regId.value;
  const pass = regPass.value;

  const userRef = ref(db, "users/" + id);
  if ((await get(userRef)).exists()) {
    regError.textContent = "ID sudah terdaftar";
    return;
  }

  await set(userRef, { password: pass });
  myId = id;
  openInbox();
};

window.login = async () => {
  const id = loginId.value;
  const pass = loginPass.value;

  const snap = await get(ref(db, "users/" + id));
  if (!snap.exists()) {
    loginError.textContent = "Akun belum ada, silakan daftar";
    return;
  }

  if (snap.val().password !== pass) {
    loginError.textContent = "Kata sandi salah 🙂";
    return;
  }

  myId = id;
  openInbox();
};

/* INBOX */
function openInbox() {
  authScreen.classList.add("hide");
  inboxScreen.classList.remove("hide");
  loadInbox();
}

function loadInbox() {
  onValue(ref(db, "chats"), snap => {
    inboxList.innerHTML = "";
    snap.forEach(c => {
      if (c.key.includes(myId)) {
        const other = c.key.replace(myId, "").replace("_", "");

        const item = document.createElement("div");
        item.className = "inbox-item";

        item.innerHTML = `
          <div class="avatar">👤</div>
          <div>@${other}</div>
        `;

        item.onclick = () => openChat(other);
        inboxList.appendChild(item);
      }
    });
  });
}

/* NEW CHAT */
window.openNewChat = () => {
  newChatSheet.classList.remove("hide");
};

window.startChat = () => {
  const id = targetId.value.trim();
  if (!id) return;

  newChatSheet.classList.add("hide");
  targetId.value = "";
  openChat(id);
};

newChatSheet.onclick = e => {
  if (e.target === newChatSheet)
    newChatSheet.classList.add("hide");
};

/* CHAT */
window.openChat = id => {
  chatWith = id;
  inboxScreen.classList.add("hide");
  chatScreen.classList.remove("hide");
  chatTitle.textContent = "@" + id;

  const cid = [myId, id].sort().join("_");
  const chatRef = ref(db, "chats/" + cid);

  onValue(chatRef, snap => {
    chatMessages.innerHTML = "";
    snap.forEach(m => {
      const div = document.createElement("div");
      div.className = "msg " + (m.val().from === myId ? "me" : "other");
      div.textContent = m.val().text;
      chatMessages.appendChild(div);
    });
  });
};

window.sendMessage = () => {
  if (!messageInput.value) return;

  const cid = [myId, chatWith].sort().join("_");
  push(ref(db, "chats/" + cid), {
    from: myId,
    text: messageInput.value
  });

  messageInput.value = "";
};

window.backInbox = () => {
  chatScreen.classList.add("hide");
  inboxScreen.classList.remove("hide");
};