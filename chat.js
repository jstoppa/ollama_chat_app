import ollama from 'ollama';

// type of messages
const MessageType = Object.freeze({
	User: 0,
	Assistant: 1,
	Error: 2,
});

// variable to keep message conversation
const messages = [];
let stopChat = false;

const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('chat-input');
const stopChatElement = document.getElementById('stop-chat');
stopChatElement.addEventListener('click', function () {
	stopChat = true;
});

// listen to enter key pressed
userInput.addEventListener('keypress', async (event) => {
	if (event.key === 'Enter') {
		const prompt = userInput.value;
		userInput.value = '';

		if (stopChat) stopChat = false;

		appendMessage(MessageType.User, prompt);

		messages.push({ role: 'user', content: prompt });

		try {
			userInput.disabled = true;
			const response = await ollama.chat({
				model: 'llama2',
				messages: messages,
				stream: true,
			});
			const responseId = Math.floor(Math.random() * 10000000);
			let currentMessage = '';
			addNewAssistantMessage(responseId);

			for await (const part of response) {
				if (part?.message?.content) {
					currentMessage += part.message.content;
					appendMessage(
						MessageType.Assistant,
						part.message.content,
						responseId
					);
					if (stopChat) {
						stopChat = false;
						break;
					}
				}
			}
			if (currentMessage)
				messages.push({
					role: 'assistant',
					content: currentMessage,
				});
			userInput.disabled = false;
			userInput.focus();
		} catch (error) {
			appendMessage(
				MessageType.Error,
				'An error occurred while communicating with the API.'
			);
			userInput.disabled = false;
			userInput.focus();
		}
	}
});

function addNewAssistantMessage(responseId) {
	const messageElement = document.createElement('div');
	messageElement.setAttribute('id', responseId);
	messageElement.setAttribute('class', 'message assistant-message');
	chatMessages.appendChild(messageElement);
	chatMessages.scrollTop = chatMessages.scrollHeight;
}

function appendMessage(messageType, message, messageId) {
	if (messageId) {
		const messageElement = document.getElementById(messageId);
		if (message === '\n') messageElement.innerHTML += '<br>';
		else messageElement.innerHTML += message;
		chatMessages.scrollTop = chatMessages.scrollHeight;
	} else {
		const messageElement = document.createElement('div');
		switch (messageType) {
			case MessageType.User:
				messageElement.setAttribute('class', 'message user-message');
				break;
			case MessageType.Error:
				break;
		}
		messageElement.innerHTML = message;
		chatMessages.appendChild(messageElement);
		chatMessages.scrollTop = chatMessages.scrollHeight;
	}
}
