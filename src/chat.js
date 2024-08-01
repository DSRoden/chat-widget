// chat.js

import { postData } from './backendService.js';

export function initializeChat({initialData}) {
    window.huddleSendMessage = () => {
        const chatInput = document.getElementById('huddleWidgetChatInput');
        const chatContainer = document.getElementById('huddleWidgetChatContainer');

        if (chatInput.value.trim() === '') return;

        // User message
        const userMessage = document.createElement('div');
        userMessage.className = 'chat-message user-message';
        userMessage.innerText = chatInput.value;
        chatContainer.appendChild(userMessage);

        chatInput.value = ''; // Clear input
        chatContainer.scrollTop = chatContainer.scrollHeight; // Scroll to bottom

        // Typing indicator with default SVG avatar
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'chat-message ai-message typing-indicator';
        typingIndicator.innerHTML = `
            <img src="${initialData.avatarUrl}" class="ai-avatar" alt="${initialData.aiName}">

            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        `;
        chatContainer.appendChild(typingIndicator);
        chatContainer.scrollTop = chatContainer.scrollHeight; // Scroll to bottom

        // Simulate fetching the AI response and avatar from the data
        setTimeout(async () => {
            typingIndicator.remove();
            
            try {
                const response = await postData('/chat/send-message', { message: chatInput.value, payload: null });
                const aiMessage = document.createElement('div');
                aiMessage.className = 'chat-message ai-message';
                console.log('response:', response);
                aiMessage.innerHTML = `
                    <img src="${initialData.avatarUrl}" class="ai-avatar" alt="${initialData.aiName}">
                    <span>${response.message}</span>
                `;
                chatContainer.appendChild(aiMessage);
                chatContainer.scrollTop = chatContainer.scrollHeight; // Scroll to bottom
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }, 2000); // Delay for 2 seconds to simulate typing
    };
    window.huddleToggleChat = () => {
        const chatContainer = document.getElementById('huddleWidgetChatContainer');
        const button = document.querySelector('#huddleWidgetHideChat button');

        // check if chatContainer is visible
        if (chatContainer.style.display === 'none') {
            chatContainer.style.display = 'block';
            // get the button inside #huddleWidgetHideChat
            button.innerText = 'Hide Chat';
            return;
        } else {
            chatContainer.style.display = 'none';
            button.innerText = 'Show Chat';
            return;
        }
    };
}
