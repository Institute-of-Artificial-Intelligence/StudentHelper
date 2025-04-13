import os
import re
from dotenv import load_dotenv
from yandex_cloud_ml_sdk import YCloudML
from langchain_community.chat_models import ChatPerplexity

from .links import filter_links, download_web_or_pdf
from ..database import universities_manager
from ..qdrant_processor.qdrant_processor import QdrantProcessor

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


def delete_folder(folder_path):
    '''Удаление папки с файлами'''

    if not os.path.exists(folder_path):
        print(f"Папка {folder_path} не существует.")
        return
    for root, dirs, files in os.walk(folder_path, topdown=False):
        for file in files:
            file_path = os.path.join(root, file)
            try:
                os.remove(file_path)
            except Exception as e:
                print(f"Ошибка при удалении файла {file_path}: {e}")
        
        for dir in dirs:
            dir_path = os.path.join(root, dir)
            try:
                os.rmdir(dir_path)
            except Exception as e:
                print(f"Ошибка при удалении подпапки {dir_path}: {e}")
    try:
        os.rmdir(folder_path)
        print(f"Папка {folder_path} успешно удалена.")
    except Exception as e:
        print(f"Ошибка при удалении основной папки: {e}")


def handle_response_with_links(response) -> dict:
    '''Извлекает все ссылки с названиями из ответа, данного нейросетью'''

    links = set(response.additional_kwargs.get('citations')) if hasattr(response, 'additional_kwargs') else set()
    if not hasattr(response, 'content'):
        return {'other': links}
    text = response.content

    ans = {}
    in_text = set()
    text.replace('\n', '')
    for line in text.split('\n'):
        if ':' in line:
            name, link = line.split(':', 1)
            ans[name.strip()] = link.strip()
            in_text.add(link.strip())

    ans['other'] = links - in_text
    return ans


def update_universitites(name: str):
    '''Добавляет данные об университете  в хранилище'''

    messages = [{
        'role': 'user',
        'content': f'''
        Ты — ассистент, специализирующийся на поиске и структурировании актуальной информации для абитуриентов. Твоя задача — найти и выдать полезные ссылки по поступлению в университет "{name}", строго в указанном формате.
        Требования к результату:
        Суть: Найди и выдай ссылки, содержащие важную и актуальную информацию, необходимую поступающему: правила приема, сроки подачи документов, проходные баллы, конкурс, условия поступления и пр.
        Формат: Ответ должен быть представлен строго в следующем формате:
        Правила приема: url
        Сроки подачи документов: url
        Проходные баллы: url
        Конкурс: url
        Условия поступления: url
        Военная кафедра: url
        Общежитие: url
        Стипендия: url
        Активности: url
        Другая полезная ссылка: url
        — Важно: Вставляй только ссылки, без описаний и пояснений.
        — Продолжай перечисление другими релевантными пунктами в том же стиле.
        Стиль: Информационный, нейтральный, без вводных слов и пояснений.
        Полнота: Стремись собрать максимально полную и полезную подборку ссылок, релевантную поступающему.
        Входные данные: Название университета — "{name}".
        Ожидаемый результат: Список ссылок в требуемом формате, без заголовков, маркировок или пояснений.'''
    }]
    response = sonar_model.invoke(
        messages,
        temperature=0.1,
        top_p=0.2,
        extra_body={"search_domain_filter": []},
        web_search_options={
            'search_context_size': 'high',
        },
    )
    
    links = handle_response_with_links(response)
    other = links.pop('other')
    links = filter_links(links, ['youtube.com', 'vk.com', 'dzen.ru', 't.me'])
    block = links.pop('block')
    #print(links, other, block, sep='\n')
    print(links)

    dir_name = re.sub(r'[\\/*?:"<>|]', ' ', name).strip()
    os.makedirs(dir_name, exist_ok=True)
    bad_links = download_web_or_pdf(links, dir_name)

    qdrant = QdrantProcessor()
    universities_manager.insert_links(name, links)
    for title, link in links.items():
        if link not in bad_links:
            qdrant.upload_document(f'{dir_name}/{title}.pdf')
    delete_folder(dir_name)
        
        
if __name__ == '__main__':
    update_universitites('Санкт-Петербургский государственный университет им. В.И. Ленина (Ульянова)')
