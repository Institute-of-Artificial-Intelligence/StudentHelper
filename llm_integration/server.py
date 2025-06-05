import re
import threading
from flask import Flask, request, jsonify
from flask_cors import CORS
from time import sleep

from llm_integration.llm_agent import llm_agent
from llm_integration.payment import check_payment
from utils.database import chat_manager, users_manager, orders_manager, profiles_manager

MAX_MESSAGES_SIZE = 2
UPDATE_SUBSRIPTIONS_TIME = 300  # секунды

app = Flask(__name__)
CORS(app)


@app.route("/api/send_message", methods=["POST"])
def send_message():
    data = request.json
    user_id = data.get("user_id")
    user_message = data.get("message")
    if not user_message or not user_id:
        return jsonify({"error": "No message or user_id provided"}), 400

    chat_history = chat_manager.get_messages(user_id, MAX_MESSAGES_SIZE)
    messages = [{'role': message['author'], 'content': message['text']} for message in chat_history]
    bot_response = llm_agent(messages, user_message)
    #chat_manager.add_message(user_id, 'user', user_message)
    #chat_manager.add_message(user_id, 'assistant', re.sub(r'<think>.*?</think>', '', bot_response, count=1, flags=re.DOTALL))

    return jsonify({"response": bot_response, "quickReplies": []})


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
    if not result['tocken'] or not result['order_status']:
        return jsonify({'error': 'Bad tocken'}), 400

    orders_manager.update_order_status(**result['order_status'])
    user_id = orders_manager.get_user_by_order(result['order_status']['order_id'])

    if result['confirmed']:
        users_manager.set_new_subscribe(user_id, days=30)

    return 'OK'


@app.route("/api/profile/<int:vk_id>", methods=["GET"])
def get_profile(vk_id):
    try:
        profile = profiles_manager.get_profile_by_vk_id(vk_id)
        if profile:
            return jsonify(profile)
        return jsonify({"error": "Профиль не найден"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/profile/<int:vk_id>", methods=["POST"])
def update_profile(vk_id):
    try:
        data = request.json
        updated = profiles_manager.update_profile_by_vk_id(
            vk_id,
            phone=data.get("phone"),
            school=data.get("school"),
            user_type=data.get("user_type")
        )
        if updated:
            return jsonify({"success": True})
        return jsonify({"error": "Не удалось обновить профиль"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def subscribes_checker():
    while True:
        users_manager.update_expired_subscriptions()
        print('server/subscribes_checker> Выполнена проверка истёкших подписок')
        sleep(UPDATE_SUBSRIPTIONS_TIME)


if __name__ == "__main__":
    thread = threading.Thread(target=subscribes_checker, daemon=True)
    thread.start()
    app.run(debug=True, host="0.0.0.0", port=5000)
