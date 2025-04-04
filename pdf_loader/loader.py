import json
import queue
from pprint import pprint
from threading import Thread
from time import sleep

from links_extractor import get_all_website_links
from pdf_downloader import download

FILENAME = 'u.json'
DEBUG = False
THREADS = 8


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
        #print(url)
        website_urls = get_all_website_links(url, web_page)

        # Добавление полученных ссылок во множества и в очередь
        pdfs_set.update(website_urls['pdf'])
        for internal_url in website_urls['url']:
            if internal_url not in urls_set:
                urls.put(internal_url)
        urls_set.update(website_urls['url'])


def thread_download(q: queue.Queue, dir: str) -> None:
    while not q.empty():
        url, idx = q.get()
        download(url, dir, idx)


def handle_url(name: str, web_page: str) -> None:
    '''Обход по всему университету и скачивание всех pdf в директорию с названием университета'''

    urls_set = {web_page}
    pdfs_set = set()
    free_extractors = [False] * THREADS

    urls = queue.Queue()
    urls.put(web_page)

    threads_extractors = [Thread(
        target=thread_handle_url,
        args=(free_extractors, i, urls_set, pdfs_set, urls, web_page)
    ) for i in range(THREADS)]

    for thread in threads_extractors:
        thread.start()
    for thread in threads_extractors:
        thread.join()

    # Скачивание всех pdf-файлов по ссылкам
    urls = queue.Queue()
    for idx, url in enumerate(pdfs_set):
        urls.put((url, idx))
    
    threads_downloaders = [Thread(
        target=thread_download,
        args=(urls, name)
    ) for _ in range(THREADS)]

    for thread in threads_downloaders:
        thread.start()
    for thread in threads_downloaders:
        thread.join()
    
    return pdfs_set


if __name__ == '__main__':
    objects = read_websites(FILENAME)
    for obj in objects:
        for url in obj['web_pages']:
            print(f'===== {obj['name']} =====', *handle_url(obj['name'], url), sep='\n')
