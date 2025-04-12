export interface QuickReplyOption {
  id: string;
  text: string;
}

export const sendMessageToBackend = async (message: string): Promise<string> => {
  try {
    // Отправляем запрос на ваш сервер Flask с сообщением пользователя
    const response = await fetch('http://localhost:8888/send_message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    // Проверяем, если ответ от сервера успешный
    if (!response.ok) {
      throw new Error('Ошибка при получении ответа с сервера');
    }

    // Получаем JSON ответ от сервера
    const data = await response.json();
    return data.response;

  } catch (error) {
    console.error("Ошибка при отправке сообщения на сервер:", error);
    throw error;
  }
};

export const getBotResponse = async (message: string): Promise<{ text: string; quickReplies: QuickReplyOption[] }> => {
  const botResponse = await sendMessageToBackend(message);

  return {
    text: botResponse,
    quickReplies: []
  };
};
