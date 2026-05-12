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
const useLocationBtn = document.getElementById("useLocationBtn");
const locationResult = document.getElementById("locationResult");

// Replace these with your real business coordinates
const BUSINESS_LATITUDE = 47.0833798;
const BUSINESS_LONGITUDE = -122.2853885;

// Change this to your real mobile detailing service radius
const SERVICE_RADIUS_MILES = 50;

function calculateDistanceMiles(lat1, lon1, lat2, lon2) {
  const earthRadiusMiles = 3958.8;

  const lat1Radians = lat1 * Math.PI / 180;
  const lat2Radians = lat2 * Math.PI / 180;
  const deltaLatRadians = (lat2 - lat1) * Math.PI / 180;
  const deltaLonRadians = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(deltaLatRadians / 2) * Math.sin(deltaLatRadians / 2) +
    Math.cos(lat1Radians) *
      Math.cos(lat2Radians) *
      Math.sin(deltaLonRadians / 2) *
      Math.sin(deltaLonRadians / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusMiles * c;
}

if (useLocationBtn) {
  useLocationBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
      locationResult.textContent =
        "Your browser does not support location checking. Please contact us with your address.";
      locationResult.style.color = "#dc2626";
      return;
    }

    locationResult.textContent = "Checking your location...";
    locationResult.style.color = "#4b5563";

    navigator.geolocation.getCurrentPosition((position) => {
            const customerLat = position.coords.latitude;
            const customerLng = position.coords.longitude;
            
            // This calculates the distance from your shop
            const distance = calculateDistanceMiles(BUSINESS_LATITUDE, BUSINESS_LONGITUDE, customerLat, customerLng);
            const roundedDist = distance.toFixed(1);

            if (distance <= SERVICE_RADIUS_MILES) {
                // 1. Hide the location section (the pop-up)
                const locationSection = document.getElementById('location');
                if (locationSection) {
                    locationSection.style.display = 'none';
                }
                
                // 2. Add the success message to the chat
                addMessage(`Great news! You are only ${roundedDist} miles away. What vehicle are we detailing today?`, "bot");
            } else {
                locationResult.textContent = `You're ${roundedDist} miles away. That is outside our 30-mile range.`;
                locationResult.style.color = "#dc2626";
            }
        }, (error) => {
            locationResult.textContent = "Unable to retrieve location. Please type your ZIP code.";
            locationResult.style.color = "#dc2626";
        });
  });
}