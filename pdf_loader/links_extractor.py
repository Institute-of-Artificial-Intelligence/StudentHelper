import requests
from urllib.parse import urlparse, urljoin
from bs4 import BeautifulSoup

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}


def get_all_website_links(url: str, homepage: str) -> dict:
    '''Находит все ссылки, находящиеся на том же сайте'''

    urls = set()
    pdf_urls = set()
    # Домен
    domain = urlparse(homepage).netloc
    domains = {domain, domain.replace('www.', '')}
    # Парсинг страницы
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.content, 'html.parser')

    # Обход по всем тегам "a"
    for a in soup.find_all('a'):
        href = a.attrs.get('href')
        if href != '' and not (href is None):
            # Составление ссылки без параметров
            parsed_href = urlparse(urljoin(homepage, href))
            href = parsed_href.scheme + '://' + parsed_href.netloc + parsed_href.path
            # Проверка ссылки на корректность и на принадлежность домену
            parsed_link = urlparse(href)
            if not (bool(parsed_link.scheme) and bool(parsed_link.netloc)) or \
               (href in urls) or \
               (href in pdf_urls):
                continue
            if href.rsplit('.', 1)[-1] == 'pdf':
                pdf_urls.add(href)
            elif parsed_link.netloc in domains:
                urls.add(href)

    return {'url': urls, 'pdf': pdf_urls}


if __name__ == '__main__':
    from pprint import pprint
    pprint(get_all_website_links('http://www.adygnet.ru/', 'http://www.adygnet.ru/'))
