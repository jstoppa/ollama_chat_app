import ollama from 'ollama';

class ChatController {
	constructor(ollama) {
		this.ollama = ollama;
		this.messages = [];
		this.stopResponse = false;
		this.initElements();
		this.attachEventListeners();
	}

	initElements() {
		this.chatMessages = document.getElementById('chat-messages');
		this.userInput = document.getElementById('chat-input');
		this.stopChatElement = document.getElementById('stop-chat');
	}

	attachEventListeners() {
		this.stopChatElement.addEventListener(
			'click',
			() => (this.stopResponse = true)
		);
		this.userInput.addEventListener('keypress', (event) =>
			this.handleKeyPress(event)
		);
	}

	async handleKeyPress(event) {
		if (event.key === 'Enter') {
			const prompt = this.userInput.value.trim();
			this.userInput.value = '';
			if (!prompt || this.stopResponse) return;

			this.appendMessage('user', prompt);
			this.messages.push({ role: 'user', content: prompt });
			this.processResponse(prompt);
		}
	}

	async processResponse(prompt) {
		try {
			this.toggleChat(true);
			const response = await this.ollama.chat({
				model: 'llama2',
				messages: this.messages,
				stream: true,
			});
			const messageId = Date.now();
			let responseFullContent = '';
			for await (const part of response) {
				if (part?.message?.content) {
					this.appendMessage(
						'assistant',
						part.message.content,
						messageId
					);
					responseFullContent += part.message.content;
				}
				if (this.stopResponse) break;
			}
			if (responseFullContent) {
				this.messages.push({
					role: 'assistant',
					content: responseFullContent,
				});
			}
		} catch (error) {
			console.error('Chat API error:', error);
			this.appendMessage(
				'error',
				'An error occurred while communicating with the API.'
			);
		} finally {
			this.stopResponse = false;
			this.toggleChat(false); // Re-enable input
		}
	}

	appendMessage(role, message, messageId) {
		let messageElement;
		if (messageId) {
			messageElement = document.getElementById(messageId);
			if (!messageElement) {
				messageElement = document.createElement('div');
				messageElement.setAttribute('id', messageId);
			}
		} else messageElement = document.createElement('div');
		messageElement.className = `message ${role}-message`;
		messageElement.innerHTML += message.replace(/\n/g, '<br>');
		this.chatMessages.appendChild(messageElement);
		this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
	}

	toggleChat(disable) {
		this.userInput.disabled = disable;
		if (!disable) this.userInput.focus();
	}
}

const chatController = new ChatController(ollama);
