from supabase import create_client
from dotenv import load_dotenv
import os

TABLE_NAME = 'chat_history'

load_dotenv()
url = os.getenv('SUPABASE_URL_PROFILES')
key = os.getenv('SUPABASE_KEY_PROFILES')

supabase = create_client(url, key)


def get_messages(user_id: str = None, limit: int = None) -> list:
    """
    Получение истории чата с возможным ограничение по количеству сообщений

    Args:
        user_id: ID пользователя, для которого нужно получить историю (None - история всех сообщений)
        limit: количество последних сообщений в формате (вопрос-ответ) (None - все сообщения)

    Returns:
        Список всех сообщений, отсортированных от старых к новым
    """
    try:
        query = (
            supabase.table(TABLE_NAME)
            .select('author', 'text', 'created_at')
            .order('created_at', desc=True)
        )
        if user_id is not None:
            query = query.eq('user_id', user_id)
        if limit is not None:
            query = query.limit(limit * 2)

        response = query.execute()
        return reversed(response.data) if response.data else []
    except Exception as e:
        print('database/chat_manager/get_messages>  Возникла ошибка при чтении:', e)
        return []


def add_message(user_id: str, author: str, text: str) -> bool:
    """
    Сохранение сообщения в историю чата

    Args:
        user_id: ID полльзователя, для истории чата которого сообщение сохраняется
        author: автор сообщения (пользователь - user, языковая модель - assistant)
        text: текст сообщения
    
    Returns:
        out: Результат сохранения сообщения в историю чата: True - успешно, False - не успешно
    """
    try:
        response = (
            supabase.table(TABLE_NAME)
            .insert({'user_id': user_id, 'author': author, 'text': text})
            .execute()
        )
        if response.data:
            return True
        else:
            print('database/chat_manager/add_message>  Произошла ошибка при записи:', response.error)
            return False
    except Exception as e:
        print('database/chat_manager/add_message>  Произошла ошибка при записи:', e)
        return False


if __name__ == '__main__':
    print(get_messages())
