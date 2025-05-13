from flask import Flask, request, jsonify
from flask_cors import CORS
from llm_integration.llm_agent import llm_agent, create_chat_history
from llm_integration.payment import check_payment
from utils.database import chat_manager, users_manager, orders_manager
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


@app.route('/api/orders/', methods=['POST'])
def create_order():
    data = request.json
    id = data.get('id')
    order_id = data.get('order_id')

    if id and order_id:
        orders_manager.create_order(id, order_id)
        return 'OK'

    return jsonify({'error': 'Bad data'}), 400


@app.route('/api/payments/', methods=['POST'])
def notigication_payment():
    data = request.json

    result = check_payment(data)

    print('---server/notification_payment---', data, '-----', result, '-----', sep='\n')

    result['tocken'] = True
    # В запросе передан некорректный токен
    if not result['tocken'] or not result['order_status']:
        return jsonify({'error': 'Bad tocken'}), 400
    
    orders_manager.update_order_status(**result['order_status'])
    user_id = orders_manager.get_user_by_order(result['order_status']['order_id'])

    # Если оплата прошла успешно
    if result['confirmed']:
        # Разобраться с идентификацей пользователя по номеру заказа
        users_manager.set_new_subscribe(user_id, minutes=5)

    return 'OK'


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
