import os
import re
from dotenv import load_dotenv
from yandex_cloud_ml_sdk import YCloudML
from langchain_community.chat_models import ChatPerplexity

from llm_integration.llm_decider import llm_decider
from utils.database import chat_manager, universities_manager
from utils.updater import update_universities


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

messages = []

# Перемещение в переменную истории чата
def create_chat_history(history):
    global messages

    messages.append({"role": "system",
                    "content":
                    '''Общайся с пользователем на русском языке в шутливой форме.
                        Ты — ассистент, специализирующийся на поиске и структурировании актуальной информации для абитуриентов, поступающих в высшие учебные заведения Российской Федерации.
                        Твоя задача — найти и выдать полезную информацию для поступления в ВУЗ. Также ты можешь просто общаться с пользователем.
                        Формат: Текст, содержащий в себе информацию для ответа абитуриенту. Текст всегда должен содержать внутри себя ссылки на информацию.
                        Суть: Выдавай самую актуальную и точную информацию на запрос пользователя на текущий год. Обязательно ищи релевантные источники информации и строго всегда выдавай их в формате "Ссылки: url"
                        Стиль: Неформальный, но без нецензурной лексики, с вводными словами и пояснениями.
                        Полнота: Стремись собрать максимально полную и полезную подборку информации и ссылок, релевантную абитуриенту.
                    '''})
    for entry in history:
        messages.append({"role": entry["author"], "content": entry["text"]})

# Определение университетов, упоминаемых в запросе
def determine_universities(history: list, question: str) -> list:
    messages = history + [{
        'role': 'user',
        'content': 
        f'''Тебе требуется определить полное название всех университетов, упоминаемых в запросе.
        Суть: определи все университеты находящиеся в запросе.
        Формат: ответ должен быть в виде списка университетов, упоминаемых в запросе. Каждое название университета должно быть с новой строки. Если запрос не затрагивает никаких университетов, то нужно вывести всего одну строку "Нет университетов".
        - Важно: ответ должен содержать только список университетов или строку "Нет университетов".
        Полнота: стремись определить полные названия университетов, которые используются официально.
        Входные данные: Запрос - "{question}"
        Ожидаемый результат: список университетов в требуемом формате, без заголовков, маркировок и пояснений.
        '''
    }]
    answer = format_response(llama_model.invoke(messages))
    universities_list = []
    if 'Нет университетов' not in answer:
        universities_list = answer.split('\n')
    return universities_list

# LLM агент
def llm_agent(question):
    global messages
    category = llm_decider(question)

    # Сохранение сообщения пользователя в историю чата
    chat_manager.add_message('user', question)
    messages.append({"role": "user", "content": question})
    
    if category == "Нелегальный, провокационный или связан с политикой":
        reply = "Извини, друг, но я не могу ответить тебе на этот вопрос."

    elif category == "Легальный, обычное общение, не требует поиска в интернете":
        response = llama_model.invoke(messages)
        reply = format_response(response)

    elif category == "Легальный, обычное общение, требует поиска в интернете":
        reply = "Извини, друг, но мне кажется этот вопрос не связан с твоим поступлением в высшие учебные заведения."

    elif category == "Легальный, связан с получением информации про получение образования":
        # Получение списка университетов из запроса
        short_messages_history = messages[1:-1]
        if len(short_messages_history) > 3:
            short_messages_history = short_messages_history[-3:]
        universities = determine_universities(short_messages_history, question)
        # Если упоминается всего один университет в запрсое
        if len(universities) == 1:
            university = universities[0]
            universities_list = universities_manager.get_universities()
            request = [{
                'role': 'user',
                'content': 
                        f'''Проверь, есть ли в списке университетов {universities_list} следующий университет: {university}.
                        Суть: определи, есть ли в списке университетов определённый университет с учётом различных вариантов названий.
                        Формат: ответ должен представлять из себя одно слово: "true" или "false".
                        Входные данные: список университетов - {universities_list}, определяемый университет - {university}.
                        Ожидаемый результат: ответ одним словом: true - если университет есть в списке, false - если нет.''',
            }]
            answer = format_response(llama_model.invoke(request))
            # В случае отсутствия университета в списке, он добавляется туда
            if answer.find('false') != -1:
                update_universities.update_universitites(university)
            reply = university + ' ' + answer
            ### следующий шаг (или если вуз уже есть), то берем контекст оттуда вставляем его в промпт (надо поменять промпт)
        # Если вуза два или более, то запуск модели
        else:
            reply = reply = universities.__str__()
            '''response = sonar_model.invoke(
                messages,
                web_search_options={
                    'search_context_size': 'high',
                }
            )
            reply = format_response(response)'''

    else:
        reply = "Не удалось определить категорию запроса."

    # Сохранение ответа в историю чата
    chat_manager.add_message('assistant', reply)
    messages.append({'role': 'assistant', 'content': reply})

    return reply

# Основной цикл
if __name__ == '__main__':
    chat_history = chat_manager.get_messages()
    create_chat_history(chat_history)

    while True:
        question = input("Введите ваш вопрос (или 'выход' для завершения): ")
        if question.lower() in ("выход", "exit", "quit"):
            print("Пока")
            break

        answer = llm_agent(question)
        print("Ответ агента:", answer)
