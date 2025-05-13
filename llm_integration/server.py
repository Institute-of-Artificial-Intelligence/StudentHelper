from flask import Flask, request, jsonify
from flask_cors import CORS
from llm_integration.llm_agent import llm_agent, create_chat_history
from llm_integration.payment import check_payment
from utils.database import chat_manager, users_manager
from time import sleep
import threading

UPDATE_SUBSRIPTIONS_TIME = 300 # seconds

app = Flask(__name__)
CORS(app)

chat_history = chat_manager.get_messages()
messages = create_chat_history(chat_history)

@app.route("/send_message", methods=["POST"])
def send_message():
    data = request.json
    user_message = data.get("message")
    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    bot_response = llm_agent(messages, user_message)

    response_data = {
        "response": bot_response,
        "quickReplies": []
    }

    return jsonify(response_data)


@app.route('/api/payments/', methods=['POST'])
def notigication_payment():
    data = request.json

    result = check_payment(data)
    print('---server/notification_payment---', data, '-----', result, '-----', sep='\n')

    result['tocken'] = True
    # В запросе передан некорректный токен
    if not result['tocken']:
        return jsonify({'error': 'Bad tocken'}), 400
    # Если оплата прошла успешно
    if result['confirmed']:
        # Разобраться с идентификацей пользователя по номеру заказа
        users_manager.set_new_subscribe('', minutes=5)

    return 'OK'

    '''amount = data.get('Amount')
    if result['tocken'] and result['confirmed']:
        print(f'Прошла успешно оплата заказа номер {data.get('OrderId')} на сумму {amount // 100}.{amount % 100}')
    elif result['confirmed']:
        print('Некорректная подпись уведомления')
    elif result['tocken']:
        print(
            f'----- Статус заказа не является подтверждением платежа -----',
            f'Номер заказа: {data.get('OrderId')}',
            f'Статус заказа: {data.get('Status')}',
            f'Успешность прохождения запроса: {data.get('Success')}',
            f'Код и описание ошибки: {data.get('ErrorCode')} - {data.get('Details')}',
            f'Сумма заказа: {amount // 100}.{amount % 100}',
            sep='\n')'''


def subscribes_checker():
    while True:
        users_manager.update_expired_subscriptions()
        print('server/subscribes_checker> Выполнена проверка истёкших подписок')
        sleep(UPDATE_SUBSRIPTIONS_TIME)


if __name__ == "__main__":
    # Запуск потока с обработкой подписок
    thread = threading.Thread(target=subscribes_checker, daemon=True)
    thread.start()
    # Запуск сервера
    app.run(debug=True, host="0.0.0.0", port=5000)
