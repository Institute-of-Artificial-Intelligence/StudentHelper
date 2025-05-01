from supabase import create_client
from dotenv import load_dotenv
import os

TABLE_NAME = 'university_links'

load_dotenv()
url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_KEY')

supabase = create_client(url, key)


def insert_links(university_name: str, links_dict: dict) -> None:
    '''Вставка в БД полезных ссылок для определённого университета'''

    for link_name, link in links_dict.items():
        try:
            response = (
                supabase.table(TABLE_NAME)
                .insert({'university_name': university_name, 'link_name': link_name, 'link': link})
                .execute()
            )
            if not response.data:
                print('Произошла ошибка при записи:', response.error)
        except Exception as e:
            print('Произошла ошибка при записи:', e)


def get_links_by_university(university_name: str) -> dict:
    '''Получение полезных ссылок по названию университета'''

    try:
        command = (
            supabase.table(TABLE_NAME)
            .select('link_name', 'link')
            .eq('university_name', university_name)
        )
        response = command.execute()
        return response.data if response.data else []
    except Exception as e:
        print('Возникла ошибка при чтении:', e)
        return []


def get_universities() -> list:
    '''Получение списка университетов из базы данных'''

    try:
        command = (
            supabase.table(TABLE_NAME)
            .select('university_name')
        )
        response = command.execute()
        return list(set(item['column_name'] for item in response.data)) if response.data else []
    except Exception as e:
        print('Возникла ошибка при чтении:', e)
        return []


if __name__ == '__main__':
    print(get_links_by_university('Санкт-Петербургский политехнический университет Петра Великого'))