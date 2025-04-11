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
    model="sonar-reasoning",
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
    return f"{text.strip()}"

# LLM агент
def llm_agent(question, history):
    category = llm_decider(question)

    ### грамотно реализовать память чата
    ### альтернативный вариант: переодически через LLM (имеется ввиду Llama) прогонять историю и сокращать ее - нужен хороший промпт
    ### хороший вариант - supabase, возможно можно ее бесплатно в докере развернуть

    ### например первый запрос: ЛЭТИ - ответ выдал
    ### второй: ИТМО - ответ выдал
    ### третий: сравни их - не понял и применился третий if (или 2 elif еще) - решить это
    messages = [{"role": "system",
                 "content":
                 '''Общайся с пользователем на русском языке в шутливой форме.
                    Ты — ассистент, специализирующийся на поиске и структурировании актуальной информации для абитуриентов, поступающих в высшие учебные заведения Российской Федерации.
                    Твоя задача — найти и выдать полезную информацию для поступления в ВУЗ. Также ты можешь просто общаться с пользователем.
                    Формат: Текст, содержащий в себе информацию для ответа абитуриенту. Текст всегда должен содержать внутри себя ссылки на информацию.
                    Суть: Выдавай самую актуальную и точную информацию на запрос пользователя на текущий год. Обязательно ищи релевантные источники информации и строго всегда выдавай их в формате "Ссылки: url"
                    Стиль: Неформальный, но без нецензурной лексики, с вводными словами и пояснениями.
                    Полнота: Стремись собрать максимально полную и полезную подборку информации и ссылок, релевантную абитуриенту.
                '''}]
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
        reply = "Извини, друг, но мне кажется этот вопрос не связан с твоим поступлением в высшие учебные заведения."
        return reply

    elif category == "Легальный, связан с получением информации про получение образования":
        ### добавить логику обработки есть ли у нас такой вуз в базе данных
        ### если вуза нет, то подключаем модуль парсинга по вузу
        ### следующий шаг (или если вуз уже есть), то берем контекст оттуда вставляем его в промпт (надо поменять промпт)

        ### если вуза два или более, то просто запускаем модель
        response = sonar_model.invoke(
            messages,
            web_search_options={
                'search_context_size': 'high',
            }
        )
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