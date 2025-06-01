
export interface QuickReplyOption {
  id: string;
  text: string;
}

export const sendMessageToBackend = async (message: string, userId: string): Promise<string> => {
  try {
    // Отправляем запрос на ваш сервер Flask с сообщением пользователя и user_id
    const response = await fetch('https://postupi.site/api/send_message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        message,
        user_id: userId 
      }),
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

export const getBotResponse = async (message: string, userId: string): Promise<{ text: string; quickReplies: QuickReplyOption[] }> => {
  const botResponse = await sendMessageToBackend(message, userId);

  return {
    text: botResponse,
    quickReplies: []
  };
};
