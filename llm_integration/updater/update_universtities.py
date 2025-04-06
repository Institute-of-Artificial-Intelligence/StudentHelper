# Берем из базы данных университеты и если запрос пользователя говорит о каком-то новом университете, которого нет в БД, то parser используем
import os
import re
from dotenv import load_dotenv
from yandex_cloud_ml_sdk import YCloudML
from langchain_community.chat_models import ChatPerplexity

from parser import parse_to_pdf

# Загрузка значений из .env
load_dotenv()
perplexity_api_key = os.getenv("PERPLEXITY_API_KEY")
yandex_folder_id = os.getenv("YANDEX_FOLDER_ID")
yandex_api_key = os.getenv("YANDEX_API_KEY")

# Инициализация Sonar из Perplexity
sonar_model = ChatPerplexity(
    model="llama-3.1-sonar-small-128k-online",
    temperature=0.5,
    api_key=perplexity_api_key,
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


def format_response(response):
    '''Форматирование ответа от нейросети'''

    text = response.content if hasattr(response, "content") else str(response)
    text = text.replace("###", "")
    text = re.sub(r'\[\d+\]', '', text)
    citations = response.additional_kwargs.get("citations", [])
    if citations:
        links_text = "\n\n Полезные ссылки:\n" + "\n".join(f"- {url}" for url in citations)
    else:
        links_text = ""

    return f"{text.strip()}{links_text}"


def get_universities() -> list:
    '''Получение списка университетов'''

    # Хардкод
    return ['ИТМО', 'СПбГМТУ']


def extract_links_from_response(response) -> set:
    '''Извлекает все ссылки из ответа, данного нейросетью'''

    text = response.content if hasattr(response, 'content') else ''
    links = response.additional_kwargs.get('citations') if hasattr(response, 'additional_kwargs') else None
    links = set(links) if links != None else set()

    url_pattern = re.compile(
        r'(?:(?:https?|ftp|file)://|www\.|ftp\.)'  # протокол или www/ftp
        r'(?:\([-A-Z0-9+&@#/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#/%=~_|$?!:,.])*'  # символы в скобках
        r'(?:\([-A-Z0-9+&@#/%=~_|$?!:,.]*\)|[A-Z0-9+&@#/%=~_|$])',  # закр. символы
        re.IGNORECASE
    )
    links.update(set(url_pattern.findall(text)))

    return links


def delete_pdf_from_links(links: set) -> set:
    '''Удаляет ссылки на pdf-документы из множества ссылок'''

    keys = list(links)
    for link in keys:
        if link.rsplit('.', 1)[-1] == 'pdf':
            links.remove(link)
    return links


def update_universitites(name: str):
    '''Добавляет данные об университете при отсутствии сведений о нём в хранилище'''

    universities = get_universities()
    messages = [{
        'role': 'user',
        'content': f'Проверь, есть ли в списке университетов {universities} следующий университет: {name}. '
                    'Дай ответ одним словом "true" или "false".',
    }]
    answer = llama_model.invoke(messages)
    print(format_response(answer))

    if format_response(answer).find('false') != -1:
        messages = [{
            'role': 'user',
            'content': f'Выдай важную актуальную для поступающего абитуриента информацию об университете "{name}" '
                        'со ссылками. Важна информация о сроках подачи документов, проходных баллах и конкурсе, '
                        'условиях поступления, специфике ВУЗа, дополнительных возможностях (общежитие, военная '
                        'кафедра, стипендия, активности). Не используй для поиска социальные сети (vk.com, t.me), '
                        'в основном ориентируйся на официальный сайт университета'
        }]
        response = sonar_model.invoke(
            messages,
            temperature=0.1,
            top_p=0.2,
            web_search_options={
                'search_context_size': 'high'
            }
        )
        links = extract_links_from_response(response)
        print(*links, sep='\n')
        links = delete_pdf_from_links(links)

        os.makedirs(name, exist_ok=True)
        for link in links:
            parse_to_pdf(link, f'{name}/{re.sub(r'[/|\\:?*"<>]', '_', link)}.pdf')
        


if __name__ == '__main__':
    update_universitites('ЛЭТИ')
