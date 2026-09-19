// YAHAN APNI GROQ API KEY DAALEIN
const API_KEY = "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"; 

const chatBox = document.getElementById("chat-box");
const userInpuawait new Promise(resolve => setTimeout(resolve, 15)); // Typing speedt = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const micBtn = document.getElementById("mic-btn");

// UI mein message add karne ka function
function appendMessage(text, sender, isError = false) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("msg", sender);
    if (isError) msgDiv.classList.add("bot-error");
    
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return msgDiv;
}

// Hacker Typewriter Effect
async function typeWriterEffect(element, text) {
    element.innerHTML = "> ";
    for (let i = 0; i < text.length; i++) {
        element.innerHTML += text.charAt(i);
        chatBox.scrollTop = chatBox.scrollHeight;
        await new Promise(resolve => setTimeout(resolve, 15)); // Typing speed
    }
}

// Groq API Call
async function fetchAIResponse(userText) {
    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json", 
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [
                    { role: "system", content: "You are an advanced, professional AI system. Provide direct, highly accurate, and concise answers." },
                    { role: "user", content: userText }
                ]
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error?.message || "API Connection Failed.");
        }
        return data.choices[0].message.content;

    } catch (error) {
        throw error;
    }
}

// Message Send Handler
async function handleSend() {
    const text = userInput.value.trim();
    if (!text) return;

    userInput.value = "";
    appendMessage(text, "user");

    const loadingMsg = appendMessage("> Processing request...", "bot");

    try {
        const aiResponse = await fetchAIResponse(text);
        loadingMsg.innerHTML = ""; // Clear loading
        await typeWriterEffect(loadingMsg, aiResponse);
    } catch (error) {
        loadingMsg.innerHTML = "> SYSTEM_ERROR: " + error.message;
        loadingMsg.classList.add("bot-error");
    }
}

// Voice Recognition
function setupVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("System Warning: Browser does not support Voice Recognition.");
        return;
    }

    const rec = new SpeechRecognition();
    rec.lang = "hi-IN";

    rec.onstart = () => {
        micBtn.classList.add("listening");
        micBtn.innerText = "🎙️";
    };

    rec.onresult = async (e) => {
        micBtn.classList.remove("listening");
        micBtn.innerText = "🎤";
        
        const transcript = e.results[0][0].transcript;
        appendMessage(transcript, "user");
        
        const loadingMsg = appendMessage("> Processing voice input...", "bot");
        
        try {
            const aiResponse = await fetchAIResponse(transcript);
            loadingMsg.innerHTML = "";
            await typeWriterEffect(loadingMsg, aiResponse);
            
            // TTS (Text to Speech)
            const utterance = new SpeechSynthesisUtterance(aiResponse);
            utterance.lang = "hi-IN";
            speechSynthesis.speak(utterance);
        } catch (error) {
            loadingMsg.innerHTML = "> SYSTEM_ERROR: " + error.message;
            loadingMsg.classList.add("bot-error");
        }
    };

    rec.onerror = () => {
        micBtn.classList.remove("listening");
        micBtn.innerText = "🎤";
    };

    rec.start();
}

// Event Listeners
sendBtn.addEventListener("click", handleSend);
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSend();
});
micBtn.addEventListener("click", setupVoice);

