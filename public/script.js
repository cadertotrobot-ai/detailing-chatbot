const chatMessages = document.getElementById("chatMessages");
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");

const messages = [
  {
    role: "assistant",
    content:
      "Hi! I can help with detailing prices, services, and booking requests. What vehicle are we working on?",
  },
];

function addMessage(content, sender) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${sender}`;
  messageDiv.textContent = content;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const text = userInput.value.trim();

  if (!text) return;

  addMessage(text, "user");

  messages.push({
    role: "user",
    content: text,
  });

  userInput.value = "";

  addMessage("Typing...", "bot");
  const typingMessage = chatMessages.lastChild;

  try {
    const response = await fetch("/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });

    const data = await response.json();

    typingMessage.remove();

    if (!response.ok) {
      addMessage("Sorry, something went wrong. Please try again.", "bot");
      return;
    }

    addMessage(data.reply, "bot");

    messages.push({
      role: "assistant",
      content: data.reply,
    });
  } catch (error) {
    typingMessage.remove();
    addMessage("Sorry, I could not connect right now.", "bot");
  }
});
