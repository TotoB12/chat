import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";
import { marked } from "https://esm.run/marked";

const API_KEY_STORAGE_KEY = 'gemini-api-key';
let chat;

// DOM Elements
const apiKeyModal = document.getElementById('api-key-modal');
const apiKeyInput = document.getElementById('api-key-input');
const saveApiKeyBtn = document.getElementById('save-api-key');
const clearKeyBtn = document.getElementById('clear-key');
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const chatHistory = document.getElementById('chat-history');

// Check for existing API key
function checkApiKey() {
    const savedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (!savedApiKey) {
        apiKeyModal.style.display = 'flex';
        return false;
    }
    return true;
}

// Initialize Gemini Chat
async function initializeChat() {
    const apiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    chat = model.startChat({
        generationConfig: {
            temperature: 0.2,
        },
    });
}

// Event Listeners
saveApiKeyBtn.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
        localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
        apiKeyModal.style.display = 'none';
        initializeChat();
    }
});

clearKeyBtn.addEventListener('click', () => {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
    chat = null;
    chatHistory.innerHTML = '';
    apiKeyModal.style.display = 'flex';
});

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!checkApiKey()) return;
    if (!chat) await initializeChat();

    const message = messageInput.value.trim();
    if (!message) return;

    // Add user message to chat
    addMessageToChat('user', message);
    messageInput.value = '';

    try {
        // Add assistant message placeholder
        const assistantMessageEl = addMessageToChat('assistant', '');
        
        // Stream the response
        const result = await chat.sendMessageStream(message);
        let fullResponse = '';

        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            fullResponse += chunkText;
            assistantMessageEl.innerHTML = marked.parse(fullResponse);
            scrollToBottom();
        }
    } catch (error) {
        addMessageToChat('error', 'An error occurred. Please try again.');
    }
});

// Helper Functions
function addMessageToChat(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;
    
    const iconDiv = document.createElement('div');
    iconDiv.className = 'message-icon';
    iconDiv.textContent = role === 'user' ? '👤' : '🤖';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = role === 'error' ? content : marked.parse(content);
    
    messageDiv.appendChild(iconDiv);
    messageDiv.appendChild(contentDiv);
    chatHistory.appendChild(messageDiv);
    scrollToBottom();
    
    return contentDiv;
}

function scrollToBottom() {
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

// Initialize
checkApiKey();
if (localStorage.getItem(API_KEY_STORAGE_KEY)) {
    initializeChat();
}