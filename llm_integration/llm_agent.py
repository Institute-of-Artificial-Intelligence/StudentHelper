import os
import re
from dotenv import load_dotenv
from yandex_cloud_ml_sdk import YCloudML
from langchain_community.chat_models import ChatPerplexity
from llm_decider import llm_decider
from llm_memory import load_chat_history, update_chat_history


load_dotenv()
perplexity_api_key = os.getenv("PERPLEXITY_API_KEY")
yandex_folder_id = os.getenv("YANDEX_FOLDER_ID")
yandex_api_key = os.getenv("YANDEX_API_KEY")

# Инициализация Sonar из Perplexity
sonar_model = ChatPerplexity(
    model="llama-3.1-sonar-small-128k-online",
    temperature=0.5,
    api_key=perplexity_api_key
)

# Инициализация Llama из YandexCloud
sdk = YCloudML(
        folder_id=yandex_folder_id,
        auth=yandex_api_key,
    )

llama_model = sdk.models.completions("llama").configure(
    temperature=0.5,
    max_tokens=2000,
).langchain(model_type="chat")

# Форматирование ответа от LLM
def format_response(response):
    text = response.content if hasattr(response, "content") else str(response)
    text = text.replace("###", "")
    text = re.sub(r'\[\d+\]', '', text)
    citations = response.additional_kwargs.get("citations", [])
    

    if citations:
        links_text = "\n\n Полезные ссылки:\n" + "\n".join(f"- {url}" for url in citations)
    else:
        links_text = ""

    return f"{text.strip()}{links_text}"

# LLM агент
def llm_agent(question, history):
    category = llm_decider(question)

    messages = [{"role": "system", "content": "Общайся с пользователем на русском языке в шутливой форме. Ты бот, помогающий студентам выбрать высшие учебные заведения Российской Федерации города Санкт-Петербурга."
    "Давай только актуальные ссылки. Старайся не повторяться."}]
    for entry in history:
        messages.append({"role": "user", "content": entry["user"]})
        messages.append({"role": "assistant", "content": entry["bot"]})
    messages.append({"role": "user", "content": question})
    
    if category == "Нелегальный, провокационный или связан с политикой":
        reply = "Извини, друг, но я не могу ответить тебе на этот вопрос."
        return reply

    elif category == "Легальный, не связан с образованием, не требует поиска в интернете":
        response = llama_model.invoke(messages)
        reply = format_response(response)
        return reply

    elif category == "Легальный, не связан с образованием, требует поиска в интернете":
        intermediate_answer = sonar_model.invoke(messages)
        prompt = f"Вот ответ от модели, полученный после интернет-поиска:\n\n{intermediate_answer}\n\nПереформулируй это как обычный текст без ссылок и упоминаний об источниках."
        messages.append({"role": "user", "content": prompt})
        response = llama_model.invoke(messages)
        reply = format_response(response)
        return reply

    elif category == "Легальный, связан с получением информации про получение образования":
        response = sonar_model.invoke(messages)
        reply = format_response(response)
        return reply

    else:
        reply = "Не удалось определить категорию запроса."
        return reply

# Основной цикл
if __name__ == '__main__':
    chat_history = load_chat_history()

    while True:
        question = input("Введите ваш вопрос (или 'выход' для завершения): ")
        if question.lower() in ("выход", "exit", "quit"):
            print("Пока")
            break

        answer = llm_agent(question, chat_history)
        print("Ответ агента:", answer)