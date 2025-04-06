import json
import queue
from pprint import pprint
from threading import Thread
from time import sleep

from links_extractor import get_all_website_links
from pdf_downloader import download

from ..llm_integration.qdrant_manager import QdrantManager
from ..llm_integration.pdf_processor import process_university_docs

FILENAME = 'u.json'
DEBUG = False
THREADS_EXTRACTOR = 6
THREADS_DOWNLOADER = 2


def read_websites(filename: str) -> list:
    '''Считывание json файла с сайтами и названиями'''

    with open(filename, 'r', encoding='utf-8') as file:
        data = json.load(file)
        if type(data) == dict:
            data = [data]
        if type(data) == list:
            return data
    return []


def thread_handle_url(
    free: list,
    num: int,
    urls_set: set,
    pdfs_set: set,
    urls: queue.Queue,
    pdfs_queue: queue.Queue,
    web_page: str
) -> None:
    '''Функция обработки очереди ссылок для потока'''

    while True:
        # Получение ссылки из очереди
        if all(free):
            break
        if urls.empty():
            free[num] = True
            sleep(1)
            continue
        url = urls.get()
        free[num] = False

        # Извлечение всех ссылок со страницы
        website_urls = get_all_website_links(url, web_page)

        # Добавление полученных ссылок во множества и в очередь
        for internal_url in website_urls['url']:
            if internal_url not in urls_set:
                urls.put(internal_url)
        urls_set.update(website_urls['url'])
        for pdf_url in website_urls['pdf']:
            if pdf_url not in pdfs_set:
                pdfs_queue.put(pdf_url)
        pdfs_set.update(website_urls['pdf'])


pdf_counter = 0

def thread_download(q: queue.Queue, dir: str, free: list) -> None:
    '''Функция скачивания pdf-файлов по ссылкам из очереди'''
    global pdf_counter

    while not q.empty() or not all(free):
        if q.empty():
            sleep(1)
            continue
        url = q.get()
        # Использование pdf_counter не гарантирует правильную нумерацию
        download(url, dir, pdf_counter)
        pdf_counter += 1


def handle_url(name: str, web_page: str) -> None:
    '''Обход по всему университету и скачивание всех pdf в директорию с названием университета'''

    # Создание множеств посещённых ссылок
    urls_set = {web_page}
    pdfs_set = set()
    # Занятость потоков
    free_extractors = [False] * THREADS_EXTRACTOR

    # Создание очередей для ссылок сайта и для ссылок на pdf
    urls = queue.Queue()
    pdfs_queue = queue.Queue()
    urls.put(web_page)

    # Создание и запуск потоков на обход сайта
    threads_extractors = [Thread(
        target=thread_handle_url,
        args=(free_extractors, i, urls_set, pdfs_set, urls, pdfs_queue, web_page)
    ) for i in range(THREADS_EXTRACTOR)]
    for thread in threads_extractors:
        thread.start()

    # Создание и запуск потоков на Скачивание всех pdf-файлов по ссылкам
    threads_downloaders = [Thread(
        target=thread_download,
        args=(pdfs_queue, name, free_extractors)
    ) for _ in range(THREADS_DOWNLOADER)]
    for thread in threads_downloaders:
        thread.start()
        
    # Ожидание завершения потоков
    for thread in threads_extractors:
        thread.join()
    for thread in threads_downloaders:
        thread.join()
    
    return pdfs_set


def main():
    qdrant = QdrantManager()
    universities = read_websites(FILENAME)
    
    for uni in universities:
        if qdrant.university_exists(uni['name']):
            print(f"Skipping {uni['name']}, already exists")
            continue
            
        for url in uni['web_pages']:
            handle_url(uni['name'], url)
        
        process_university_docs(uni['name'], qdrant)

if __name__ == '__main__':
    main()