from flask import Flask, request, jsonify
from flask_cors import CORS
from llm_agent import llm_agent, create_chat_history
from utils.database import chat_manager

app = Flask(__name__)
CORS(app)

messages_history = chat_manager.get_messages()
chat_history = create_chat_history(messages_history)

@app.route("/send_message", methods=["POST"])
def send_message():
    data = request.json
    user_message = data.get("message")
    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    bot_response = llm_agent(chat_history, user_message)

    response_data = {
        "response": bot_response,
        "quickReplies": []
    }

    return jsonify(response_data)


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)