// 1. ضع مفتاح OpenRouter الخاص بك هنا
const API_KEY = ""; // Keep API credentials on a secure server.

const API_URL = "https://openrouter.ai/workspaces/default/keys";
const MODEL = "openrouter/free";

// 2. تعليمات وشخصية البوت (عدّلها لتناسب محتوى موقعك)
const SYSTEM_INSTRUCTION = "أنت مساعد ذكي خاص بالموقع. أجب عن أسئلة الزوار باللهجة المصرية بأسلوب ودود ومختصر.";

// 3. ذاكرة المحادثة
let conversationHistory = [
  { role: "system", content: SYSTEM_INSTRUCTION }
];

// عناصر الواجهة
const chatToggleBtn = document.getElementById("chatToggleBtn");
const chatWidget = document.getElementById("chatWidget");
const closeChatBtn = document.getElementById("closeChatBtn");
const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

// فتح وإغلاق نافذة الشات عند الضغط على الأيقونة
chatToggleBtn.addEventListener("click", () => {
  chatWidget.classList.toggle("hidden");
  if (!chatWidget.classList.contains("hidden")) {
    userInput.focus();
  }
});

// إغلاق النافذة من زر X
closeChatBtn.addEventListener("click", () => {
  chatWidget.classList.add("hidden");
});

// أحداث الإرسال
sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    sendMessage();
  }
});

// دالة إضافة الرسائل للشاشة
function appendMessage(text, isUser) {
  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${isUser ? "user-msg" : "bot-msg"}`;
  msgDiv.textContent = text;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msgDiv;
}

// دالة إرسال الرسالة واستقبال الرد
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  appendMessage(text, true);
  userInput.value = "";
  sendBtn.disabled = true;

  conversationHistory.push({
    role: "user",
    content: text
  });

  const loadingMsg = appendMessage("جاري الكتابة...", false);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "HTTP-Referer": window.location.href,
        "X-Title": document.title || "Website Chatbot",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: conversationHistory
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "حدث خطأ في الاتصال بالسيرفر");
    }

    const botReply = data.choices[0].message.content;
    loadingMsg.textContent = botReply;

    conversationHistory.push({
      role: "assistant",
      content: botReply
    });

  } catch (error) {
    loadingMsg.textContent = "خطأ: " + error.message;
  } finally {
    sendBtn.disabled = false;
    userInput.focus();
  }
}