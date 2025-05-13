from dotenv import load_dotenv
from hashlib import sha256
from os import getenv

load_dotenv()
terminal_key = getenv('TERMINAL_KEY')


def tocken_check(data: dict) -> bool:
    '''Проверка корректности токена в уведомлении'''
    # Соединение значений в одну строку
    values_list = []
    for key in filter(lambda x: x != 'Token', sorted(data.keys())):
        value = data[key]
        if isinstance(value, bool):
            value = 'true' if value else 'false'
        values_list.append(str(value))
    concatenated_values = ''.join(values_list)
    # Сравнение получившегося токена с переданным
    return sha256(concatenated_values.encode('ascii')).hexdigest() == data.get('Token')


def confirmed_check(data: dict) -> bool:
    '''Основная проверка на успешность проведения операции'''
    return (
        data.get('TerminalKey') == terminal_key
        and data.get('Success')
        and data.get('ErrorCode') == '0'
        and data.get('Status') == 'CONFIRMED'
    )


def order_status_getter(data: dict) -> dict:
    '''Проверка присутствия информации о заказе и её получение'''
    order_id = data.get('OrderId')
    status = data.get('Status')
    return {
        'order_id': order_id,
        'status': status
    } if status is not None and order_id is not None else None


def check_payment(data: dict) -> dict:
    '''
    Проверка успешности проведения платежа в уведомлении от Т-Банка.\n
    :param data: JSON-уведомление от банка в виде словаря.
    :return: Словарь с результатом проверки платежа.
    '''
    return {
        'tocken': tocken_check(data),
        'confirmed': confirmed_check(data),
        'order_status': order_status_getter(data)
    }
