import os
import re
from dotenv import load_dotenv
from langchain_community.chat_models import ChatPerplexity
from yandex_cloud_ml_sdk import YCloudML

from llm_integration.llm_decider import llm_decider
from llm_integration.llm_text_messages import *


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


def format_response(response) -> str:
    """
    Простое форматирование ответа от LLM
    
    Args:
        response: ответ от языковой модели определённой структуры
    
    Returns:
        Строка с текстом ответа от языковой модели
    """
    text = response.content if hasattr(response, 'content') else str(response)
    text = text.replace('###', '')
    text = re.sub(r'\[\d+\]', '', text)
    return f'{text.strip()}'


def llm_agent(questions_history: list, question: str) -> str:
    """
    LLM агент, выдающий ответ на вопрос с учётом истории вопросов от пользователя.

    Args:
        questions_history: история вопросов, на которые пользователь уже получал ответ
        question: вопрос, на который требуется получить ответ

    Returns:
        Строка с ответом на вопрос
    """
    category = llm_decider(question)

    if category == 'Нелегальный, провокационный или связан с политикой':
        reply = ANSWER_ILLEGAL_MESSAGE

    elif category == 'Легальный, обычное общение, не требует поиска в интернете':
        messages = [
            {'role': 'system', 'content': SYSTEM_SIMPLE_MESSAGE},
            {'role': 'user', 'content': USER_SIMPLE_WRAPPER(questions_history, question)}
        ]
        response = llama_model.invoke(messages)
        reply = format_response(response)

    elif category == 'Легальный, обычное общение, требует поиска в интернете':
        reply = ANSWER_NOT_UNIVERSITY_MESSAGE

    elif category == 'Легальный, связан с получением информации про получение образования':
        messages = [
            {'role': 'system', 'content': SYSTEM_MAIN_MESSAGE},
            {'role': 'user', 'content': ''}
        ]
        response = sonar_model.invoke(
            messages,
            web_search_options={
                'search_context_size': 'high'
            }
        )
        reply = format_response(response)

    else:
        reply = ANSWER_UNKNOWN_MESSAGE

    return reply


'''
if __name__ == '__main__':
    chat_history = chat_manager.get_messages()
    messages = create_chat_history(chat_history)
    while True:
        question = input('Введите ваш вопрос (или \'выход\' для завершения): ')
        if question.lower() in ('выход', 'exit', 'quit', ''):
            print('Пока')
            break
        print('Ответ агента:', llm_agent(messages, question))
'''
