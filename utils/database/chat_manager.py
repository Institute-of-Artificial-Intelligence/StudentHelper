from supabase import create_client
from dotenv import load_dotenv
import os

TABLE_NAME = 'chat_history'

load_dotenv()
url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_KEY')

supabase = create_client(url, key)


def get_messages() -> list:
    try:
        command = (
            supabase.table(TABLE_NAME)
            .select('author', 'text', 'created_at')
        )
        response = command.execute()
        return response.data if response.data else []
    except Exception as e:
        print('Возникла ошибка при чтении:', e)
        return []


def add_message(author: str, text: str) -> bool:
    try:
        response = (
            supabase.table(TABLE_NAME)
            .insert({'author': author, 'text': text})
            .execute()
        )
        if response.data:
            return True
        else:
            print('Произошла ошибка при записи:', response.error)
            return False
    except Exception as e:
        print('Произошла ошибка при записи:', e)
        return False


if __name__ == '__main__':
    print(get_messages())