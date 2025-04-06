import json
import os

HISTORY_FILE = "chat_history.json"

# Загрузка истории
def load_chat_history():
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

# Сохранение истории
def save_chat_history(history):
    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(history, f, ensure_ascii=False, indent=2)

# Добавление новой записи в историю
def update_chat_history(history, user_message, bot_reply):
    history.append({
        "user": user_message,
        "bot": bot_reply
    })
    save_chat_history(history)