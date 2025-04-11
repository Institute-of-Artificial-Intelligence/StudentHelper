from flask import Flask, request, jsonify
from flask_cors import CORS
from llm_agent import llm_agent, load_chat_history, update_chat_history

app = Flask(__name__)
CORS(app)

chat_history = load_chat_history()

@app.route("/send_message", methods=["POST"])
def send_message():
    data = request.json
    user_message = data.get("message")
    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    bot_response = llm_agent(user_message, chat_history)
    update_chat_history(chat_history, user_message, bot_response)

    response_data = {
        "response": bot_response,
        "quickReplies": []
    }

    return jsonify(response_data)


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
