from urllib.request import urlretrieve
from urllib.parse import urlparse

from .parser import parse_to_pdf


def is_link_valid(link: str) -> bool:
    '''Проверяет ссылку на корректность'''

    try:
        result = urlparse(link)
        return all([result.scheme, result.netloc])
    except AttributeError:
        return False


def filter_links(links_dict: dict, block_domens: list) -> dict:
    '''
    Обходит словарь со ссылками: {название: ссылка}.
    Проверяет корректность ссылок и нахождение домена в списке блокировок.
    '''

    ans = {'block': set()}

    for key, value in links_dict.items():
        if is_link_valid(value):
            block = False
            for domen in block_domens:
                if domen in value:
                    ans['block'].add(value)
                    block = True
                    break
            if not block:
                ans[key] = value
    
    return ans


def download_pdf(url: str, name: str, dir: str) -> None:
    '''Скачивает pdf в директорию'''

    try:
        urlretrieve(
            url=url,
            filename=f'./{dir}/{name}.pdf'
        )
    except Exception:
        print('Не удалось скачать', url)


def download_web_or_pdf(links: dict, dir: str) -> None:
    '''
    Обходит словарь со ссылками: {название: ссылка}.
    Если ссылка указывает на pdf, то скачивает этот файл, иначе парсит web-страницу в pdf.
    '''

    for name, link in links.items():
        if link.rsplit('.', 1)[-1] == 'pdf':
            download_pdf(link, name, dir)
        else:
            parse_to_pdf(link, f'{dir}/{name}.pdf')