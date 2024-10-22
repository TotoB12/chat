import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "https://esm.run/@google/generative-ai";
import { marked } from "https://esm.run/marked";

const API_KEY_STORAGE_KEY = 'gemini-api-key';
let chat;
let attachedFiles = [];

// DOM Elements
const apiKeyModal = document.getElementById('api-key-modal');
const apiKeyInput = document.getElementById('api-key-input');
const saveApiKeyBtn = document.getElementById('save-api-key');
const clearKeyBtn = document.getElementById('clear-key');
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const chatHistory = document.getElementById('chat-history');
const fileInput = document.getElementById('file-input');
const attachmentPreviews = document.getElementById('attachment-previews');
const dropArea = document.getElementById('drop-area');

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
    const safetySettings = [
        {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
        }
    ];
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
            temperature: 0.2,
        },
        // safetySettings: safetySettings,
    });

    chat = model.startChat();
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
    if (!message && attachedFiles.length === 0) return;

    // Add user message to chat
    addMessageToChat('user', message);
    messageInput.value = '';

    try {
        // Process attached files
        const fileParts = await processAttachedFiles();

        // Prepare the message parts
        const messageParts = [];
        if (message) messageParts.push({ text: message });
        messageParts.push(...fileParts);

        // Add assistant message placeholder
        const assistantMessageEl = addMessageToChat('assistant', '');

        // Send the message with attached files
        const result = await chat.sendMessageStream(messageParts);
        let fullResponse = '';

        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            fullResponse += chunkText;
            assistantMessageEl.innerHTML = marked.parse(fullResponse);
            scrollToBottom();
        }
    } catch (error) {
        console.error(error);
        addMessageToChat('error', 'An error occurred. Please try again.');
    } finally {
        // Clear attachments after sending
        attachedFiles = [];
        attachmentPreviews.innerHTML = '';
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

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

// Handle drag and drop
['dragenter', 'dragover'].forEach(eventName => {
    document.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropArea.style.display = 'block';
    });
});

['dragleave', 'drop'].forEach(eventName => {
    document.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropArea.style.display = 'none';
    });
});

dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
});

// Handle attached files
function handleFiles(files) {
    for (let file of files) {
        attachedFiles.push(file);
        displayAttachmentPreview(file);
    }
}

// Display attachment previews
function displayAttachmentPreview(file) {
    const previewDiv = document.createElement('div');
    previewDiv.className = 'attachment-preview';

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-attachment';
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', () => {
        attachedFiles = attachedFiles.filter(f => f !== file);
        attachmentPreviews.removeChild(previewDiv);
    });

    let previewContent;
    if (file.type.startsWith('image/')) {
        previewContent = document.createElement('img');
        previewContent.src = URL.createObjectURL(file);
    } else {
        previewContent = document.createElement('div');
        previewContent.textContent = file.name;
    }

    previewDiv.appendChild(previewContent);
    previewDiv.appendChild(removeBtn);
    attachmentPreviews.appendChild(previewDiv);
}

async function processAttachedFiles() {
    const fileParts = [];
    for (let file of attachedFiles) {
        const fileUri = await uploadFile(file);
        fileParts.push({
            file_data: {
                mime_type: file.type,
                file_uri: fileUri
            }
        });
    }
    return fileParts;
}

// Upload file to File API
async function uploadFile(file) {
    const apiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    const uploadUrl = `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${apiKey}`;

    // Start resumable upload
    const startUploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
            'X-Goog-Upload-Protocol': 'resumable',
            'X-Goog-Upload-Command': 'start',
            'X-Goog-Upload-Header-Content-Length': file.size,
            'X-Goog-Upload-Header-Content-Type': file.type,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            file: { display_name: file.name }
        })
    });

    if (!startUploadResponse.ok) {
        throw new Error('Failed to initiate file upload.');
    }

    const uploadUrlFromHeader = startUploadResponse.headers.get('X-Goog-Upload-URL');

    // Upload the file data
    const uploadResponse = await fetch(uploadUrlFromHeader, {
        method: 'POST',
        headers: {
            'Content-Length': file.size,
            'X-Goog-Upload-Offset': '0',
            'X-Goog-Upload-Command': 'upload, finalize'
        },
        body: file
    });

    if (!uploadResponse.ok) {
        throw new Error('Failed to upload file data.');
    }

    const fileInfo = await uploadResponse.json();
    const fileUri = fileInfo.file.uri;
    const fileName = fileInfo.file.name;
    let fileState = fileInfo.file.state;

    // Ensure the file state is ACTIVE
    while (fileState === 'PROCESSING') {
        // Optionally, you can display a message to the user about processing
        console.log(`Processing file ${file.name}, please wait...`);
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds

        // Fetch the file info again
        const fileStatusResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/files/${fileName}?key=${apiKey}`);

        if (!fileStatusResponse.ok) {
            throw new Error('Failed to fetch file status.');
        }

        const fileStatusInfo = await fileStatusResponse.json();
        fileState = fileStatusInfo.file.state;
    }

    if (fileState !== 'ACTIVE') {
        throw new Error(`File ${file.name} is not active.`);
    }

    // Return the file URI to be used in the message parts
    return fileUri;
}