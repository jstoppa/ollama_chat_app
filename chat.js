const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('chat-input');

userInput.addEventListener('keypress', async (event) => {
	if (event.key === 'Enter') {
		const prompt = userInput.value;
		userInput.value = '';

		appendMessage('User', prompt);

		try {
			const response = await fetch(
				'http://localhost:11434/api/generate',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						model: 'llama2',
						prompt: prompt,
					}),
				}
			);

			if (response.ok) {
				const reader = response.body.getReader();
				let result = '';

				while (true) {
					const { done, value } = await reader.read();
					if (done) break;

					const chunk = new TextDecoder().decode(value);
					if (chunk) {
						result += JSON.parse(chunk)?.response;
						appendMessage('Assistant', result);
					}
				}
			} else {
				appendMessage(
					'Error',
					'Failed to get a response from the API.'
				);
			}
		} catch (error) {
			appendMessage(
				'Error',
				'An error occurred while communicating with the API.'
			);
		}
	}
});

function appendMessage(sender, message) {
	const messageElement = document.createElement('div');
	messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
	chatMessages.appendChild(messageElement);
	chatMessages.scrollTop = chatMessages.scrollHeight;
}
