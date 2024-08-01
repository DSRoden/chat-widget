import { initializeChat } from './chat.js';
import { getData } from './backendService.js';
import { initializeStories } from './stories.js';
import './styles.css';
import widgetHTML from './widget.html';

// Function to apply UI theme
function applyUITheme(theme) {
    const widget = document.getElementById('huddleWidget');
    if (theme.backgroundColor) {
        widget.style.backgroundColor = theme.backgroundColor;
    }
    if (theme.borderColor) {
        widget.style.borderColor = theme.borderColor;
    }
    if (theme.borderRadius) {
        widget.style.borderRadius = theme.borderRadius;
    }
    // Add other theme properties as needed
}

// Function to append HTML to the body
function appendHTML(html) {
    const existingElement = document.getElementById('huddleWidgetContainer');
    if (!existingElement) {
        const div = document.createElement('div');
        div.id = 'huddleWidgetContainer';
        div.className = 'huddle-widget-container'; // Add the unique class here
        div.innerHTML = html;
        document.body.appendChild(div);
    } else {
        existingElement.innerHTML = html;
    }
}

// Function to fetch data
async function fetchData(apiKey) {
    const data = await getData('/chat/data.json');
    console.log('Fetched data:', data); // Debugging line
    // Validate the apiKey
    if (data.apiKey !== apiKey) {
        console.error('Invalid API Key'); // Debugging line
        throw new Error('Invalid API Key');
    }
    return data;
}

// Function to initialize the widget
window.initializeHuddleWidget = async (options = {}) => {
    const { apiKey, defaultDisplay = true } = options;

    if (!apiKey) {
        console.error('API Key is required to initialize the widget.');
        return;
    }

    try {
        const data = await fetchData(apiKey);
        appendHTML(widgetHTML);
        console.log('Appended HTML to the body.');

        const huddleCircle = document.getElementById('huddleWidgetCircle');
        huddleCircle.style.backgroundImage = `url(${data.avatarUrl})`;
        const huddleWidget = document.getElementById('huddleWidget');
        const closeButton = document.getElementById('huddleWidgetClose');
        const huddleWidgetMenuButton = document.getElementById('huddleWidgetMenuButton');
        huddleWidgetMenuButton.style.backgroundImage = `url(${data.avatarUrl})`;

        if (data.uiTheme) {
            applyUITheme(data.uiTheme);
        }

        if (!defaultDisplay) {
            huddleCircle.style.display = 'none';
            console.log('Default display is false, hiding the circle.');
        } else {
            huddleCircle.style.display = 'flex';
            console.log('Default display is true, showing the circle.');
        }

        let storiesInitialized = false;

        huddleCircle.addEventListener('click', () => {
            console.log('Circle clicked.');
            if (huddleWidget.style.display === 'none' || huddleWidget.style.display === '') {
                huddleWidget.style.display = 'block';
                huddleWidget.style.opacity = '1';
                huddleWidget.style.transform = 'scaleY(1) scaleX(1)';
                huddleCircle.style.display = 'none';
                closeButton.style.display = 'block';
                console.log('Widget opened.');

                if (!storiesInitialized) {
                    initializeStories(data.storyCategories, data.stories);
                    storiesInitialized = true;
                }
            } else {
                huddleWidget.style.display = 'none';
                closeButton.style.display = 'none';
                console.log('Widget closed.');
            }
        });

        closeButton.addEventListener('click', () => {
            huddleWidget.style.display = 'none';
            if (!defaultDisplay) {
                huddleCircle.style.display = 'none';
                console.log('Default display is false, hiding the circle.');
            } else {
                huddleCircle.style.display = 'flex';
                closeButton.style.display = 'none';

                console.log('Default display is true, showing the circle.');
            }
            console.log('Widget closed with close button.');
        });

        initializeChat({ initialData: data });

        // Display greeting message from data
        const chatContainer = document.getElementById('huddleWidgetChatContainer');
        const greetingMessage = document.createElement('div');
        greetingMessage.className = 'chat-message ai-message';
        greetingMessage.innerHTML = `
            <img src="${data.avatarUrl}" class="ai-avatar" alt="${data.aiName}">
            <span>${data.greeting}</span>
        `;
        chatContainer.appendChild(greetingMessage);
        console.log('Greeting message displayed.');
    } catch (error) {
        console.error('Failed to initialize the widget:', error);
    }
};

window.HuddleWidget = function(command, options) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        if (command === 'initialize') {
            console.log('Document ready, initializing widget.');
            initializeHuddleWidget(options);
        }
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            if (command === 'initialize') {
                console.log('DOM content loaded, initializing widget.');
                initializeHuddleWidget(options);
            }
        });
    }

    // Process any queued commands
    const queue = window.HuddleWidget.q;
    if (queue) {
        for (let i = 0; i < queue.length; i++) {
            console.log('Processing queued command:', queue[i]);
            window.HuddleWidget.apply(null, queue[i]);
        }
    }
}

window.huddleSendMessage = async () => {
    const chatInput = document.getElementById('huddleWidgetChatInput');
    const chatContainer = document.querySelector('.huddleWidgetChatContainer');

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
        <img src="path/to/ai-avatar.png" class="ai-avatar" alt="Typing...">
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
                <img src="path/to/ai-avatar.png" class="ai-avatar" alt="AI">
                <span>${response.message}</span>
            `;
            chatContainer.appendChild(aiMessage);
            chatContainer.scrollTop = chatContainer.scrollHeight; // Scroll to bottom
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }, 2000); // Delay for 2 seconds to simulate typing
};