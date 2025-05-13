from datetime import datetime, timedelta
from supabase import create_client
from dotenv import load_dotenv
import os

TABLE_NAME = 'profiles'

load_dotenv()
url = os.getenv('SUPABASE_URL_PROFILES')
key = os.getenv('SUPABASE_KEY_PROFILES')

supabase = create_client(url, key)


def set_subscribe(user_id: str, subscribe_start: datetime, subscribe_end: datetime):
    '''Установка даты начала и окончания подписки для пользователя по его id'''
    try:
        response = supabase.table(TABLE_NAME).update({
            'subscribe': True,
            'subscribe_start': subscribe_start.isoformat(),
            'subscribe_end': subscribe_end.isoformat()
        }).eq('id', user_id).execute()
        
        return response.data
    except Exception as e:
        print(f'db_users/set_subscribe> Ошибка во время вноса данных о подписке: {e}')
        return None


def set_new_subscribe(user_id: str, **kwargs):
    '''Установка подписки пользователю с текущего момента на определённый срок'''
    current_date = datetime.now()
    end_date = datetime.now() + timedelta(**kwargs)
    return set_subscribe(user_id, current_date, end_date)


def update_expired_subscriptions():
    '''Перевод в False всех истёкших подписок у пользователей'''
    current_date = datetime.now().isoformat()
    
    try:
        response = supabase.table('profiles') \
            .update({'subscribe': False}) \
            .lt('subscribe_end', current_date) \
            .execute()
        
        return response.data
    except Exception as e:
        print(f'db_users/update_expired_subscriptions> Ошибка при обновлении: {e}')
        return None


if __name__ == '__main__':
    '''print(set_subscribe(
        user_id='',
        subscribe_start=datetime.now(),
        subscribe_end=datetime.now() + timedelta(minutes=10)
    ))'''
    print(update_expired_subscriptions())