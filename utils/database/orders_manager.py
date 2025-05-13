from supabase import create_client
from dotenv import load_dotenv
import os

TABLE_NAME = 'orders'

load_dotenv()
url = os.getenv('SUPABASE_URL_PROFILES')
key = os.getenv('SUPABASE_KEY_PROFILES')

supabase = create_client(url, key)


def create_order(user_id: str, order_id: str):
    '''Внесение в таблицу данных о заказе для определённого пользователя'''
    try:
        new_order = {
            'id': user_id,
            'order_id': order_id
        }
        response = supabase.table(TABLE_NAME) \
                         .insert(new_order) \
                         .execute()
        
        return response.data
    except Exception as e:
        print(f"db_orders/create_order> Ошибка при создании заказа: {e}")
        return None


def update_order_status(order_id: str, status: str):
    '''Обновление статуса заказа'''
    try:
        response = supabase.table(TABLE_NAME).update({
            'status': status,
        }).eq('order_id', order_id).execute()
        
        return response.data
    except Exception as e:
        print(f'db_orders/update_order_status> Ошибка во время вноса данных о подписке: {e}')
        return None


def get_user_by_order(order_id: str):
    '''Получение id пользователя по номеру заказа'''
    try:
        response = supabase.table(TABLE_NAME) \
                        .select('id') \
                        .eq('order_id', order_id) \
                        .limit(1) \
                        .execute()
        
        if response.data and len(response.data) > 0:
            return response.data[0]['id']
        return None
        
    except Exception as e:
        print(f'db_orders/get_user_by_order> Ошибка при поиске заказа: {e}')
        return None


if __name__ == '__main__':
    print(update_order_status('11270', 'В работе'))
