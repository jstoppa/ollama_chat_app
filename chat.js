import ollama from 'ollama';

const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('chat-input');
userInput.addEventListener('keypress', async (event) => {
	if (event.key === 'Enter') {
		const prompt = userInput.value;
		userInput.value = '';

		appendMessage('User', prompt);

		try {
			userInput.disabled = true;
			const response = await ollama.chat({
				model: 'llama2',
				messages: [{ role: 'user', content: prompt }],
				stream: true,
			});
			const responseId = Math.floor(Math.random() * 10000000);
			addNewMessage('Assistant', responseId);

			for await (const part of response) {
				if (part?.message?.content) {
					appendMessage(
						'Assistant',
						part.message.content,
						responseId
					);
				}
			}
			userInput.disabled = false;
			userInput.focus();
		} catch (error) {
			appendMessage(
				'Error',
				'An error occurred while communicating with the API.'
			);
			userInput.disabled = false;
			userInput.focus();
		}
	}
});

function addNewMessage(sender, responseId) {
	const messageElement = document.createElement('div');
	messageElement.setAttribute('id', responseId);
	messageElement.innerHTML = `<strong>${sender}: </strong>`;
	chatMessages.appendChild(messageElement);
	chatMessages.scrollTop = chatMessages.scrollHeight;
}

function appendMessage(sender, message, messageId) {
	if (messageId) {
		const messageElement = document.getElementById(messageId);
		if (message === '\n') messageElement.innerHTML += '<br>';
		else messageElement.innerHTML += message;
		chatMessages.scrollTop = chatMessages.scrollHeight;
	} else {
		const messageElement = document.createElement('div');
		messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
		chatMessages.appendChild(messageElement);
		chatMessages.scrollTop = chatMessages.scrollHeight;
	}
}
