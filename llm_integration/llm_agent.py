import os
import re
from dotenv import load_dotenv
from langchain_community.chat_models import ChatPerplexity
from yandex_cloud_ml_sdk import YCloudML

from llm_integration.llm_decider import llm_decider
from llm_integration.llm_text_messages import *
from utils.database import chat_manager, universities_manager
from utils.updater import update_universities
from utils.qdrant_processor import qdrant_processor


MAX_MESSAGES_SIZE = 3

load_dotenv()
perplexity_api_key = os.getenv('PERPLEXITY_API_KEY')
yandex_folder_id = os.getenv('YANDEX_FOLDER_ID')
yandex_api_key = os.getenv('YANDEX_API_KEY')

# Инициализация Sonar из Perplexity
sonar_model = ChatPerplexity(
    model='sonar-reasoning',
    temperature=0.5,
    api_key=perplexity_api_key
)

# Инициализация Llama из YandexCloud
sdk = YCloudML(
    folder_id=yandex_folder_id,
    auth=yandex_api_key,
)
llama_model = sdk.models.completions('llama').configure(
    temperature=0.5,
    max_tokens=2000,
).langchain(model_type='chat')

# Инициализация Qdrant
qdrant = qdrant_processor.QdrantProcessor()


def format_response(response):
    '''Простое форматирование ответа от LLM'''
    text = response.content if hasattr(response, 'content') else str(response)
    text = text.replace('###', '')
    text = re.sub(r'\[\d+\]', '', text)
    return f'{text.strip()}'


def create_chat_history(history: list) -> None:
    '''Создание в переменной истории чата по переданным сообщениям'''
    messages = [{'role': 'system', 'content': 'Общайся с пользователем'}]
    for entry in history:
        messages.append({'role': entry['author'], 'content': entry['text']})
    return messages


def determine_universities(history: list, question: str) -> list:
    '''Определение упоминаемых в запросе университетов с учётом истории чата'''
    messages = history + [{
        'role': 'user',
        'content': DETERMINE_UNIVERSITIES_MESSAGE(question)
    }]
    answer = format_response(llama_model.invoke(messages))
    universities_list = []
    if 'Нет университетов' not in answer:
        universities_list = answer.split('\n')
    return universities_list


def llm_agent(messages: list, question: str) -> str:
    '''
    LLM агент, выдающий ответ на вопрос с учётом истории чата.\n
    Принимает на вход сообщения в формате подходящем языковой модели
    (первым должно быть системное сообщение) и вопрос.\n
    Возвращает ответ на вопрос.
    '''
    category = llm_decider(question)

    while len(messages) > 1 + MAX_MESSAGES_SIZE * 2:
        # Удаление самых ранних сообщений пользователь-модель
        messages.pop(1)
        messages.pop(1)
    print(messages)
    # Добавление сообщения пользователя в историю чата
    messages.append({'role': 'user', 'content': question})
    
    if category == 'Нелегальный, провокационный или связан с политикой':
        reply = ANSWER_ILLEGAL_MESSAGE

    elif category == 'Легальный, обычное общение, не требует поиска в интернете':
        messages[0] = {'role': 'system', 'content': SYSTEM_SIMPLE_MESSAGE}
        response = llama_model.invoke(messages)
        reply = format_response(response)

    elif category == 'Легальный, обычное общение, требует поиска в интернете':
        reply = ANSWER_NOT_UNIVERSITY_MESSAGE

    elif category == 'Легальный, связан с получением информации про получение образования':
        messages[0] = {'role': 'system', 'content': SYSTEM_MAIN_MESSAGE}
        universities = determine_universities(messages[1:-1], question)
        print(universities)
        # Если упоминается всего один университет в запрсое
        if len(universities) == 1:
            university = universities[0]
            universities_list = universities_manager.get_universities()
            answer = format_response(llama_model.invoke([{
                'role': 'user',
                'content': CHECK_UNIVERSITY_MESSAGE(university, universities_list)
            }]))
            # В случае отсутствия университета в списке, он добавляется туда
            if answer.find('false') != -1:
                update_universities.update_universitites(university)
            # Получение контекста из qdrant'а
            context = qdrant.search(query=question, university=university, limit=8)
            messages[-1] = {
                'role': 'user',
                'content': f'''
                    Отвечай на вопрос студента в соответствии с ранее заданными инструкциями. 
                    Для ответа используй предоставленный контекст. Если в контексте не хватает информации, то ищи информацию в интернете.
                    Контекст: {context}.
                    Вопрос: {question}.
                    '''
            }
        # Если вуза два или более, то происходит сразу выполнение запроса
        # Если - один, то выполнение происходит после предобработки
        response = sonar_model.invoke(
            messages,
            web_search_options={
                'search_context_size': 'high',
            }
        )
        reply = format_response(response)

    else:
        reply = ANSWER_UNKNOWN_MESSAGE

    # Сохранение в историю чата
    reply_to_save = re.sub(r'<think>.*?</think>', '', reply, count=1, flags=re.DOTALL)
    chat_manager.add_message('user', question)
    chat_manager.add_message('assistant', reply_to_save)
    messages.append({'role': 'assistant', 'content': reply_to_save})

    return reply


# Основной цикл
if __name__ == '__main__':
    chat_history = chat_manager.get_messages()
    messages = create_chat_history(chat_history)
    while True:
        question = input("Введите ваш вопрос (или 'выход' для завершения): ")
        if question.lower() in ("выход", "exit", "quit", ""):
            print("Пока")
            break
        print("Ответ агента:", llm_agent(messages, question))
