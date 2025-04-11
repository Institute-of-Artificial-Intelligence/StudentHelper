import requests
from bs4 import BeautifulSoup

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont


headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def replace_table_to_dict(soup: BeautifulSoup) -> None:
    '''В структуре soup преобразовывает все таблицы в словари'''

    tables = soup.find_all('table')
    
    for table in tables:
        table_dict = {'head': {}, 'body': {}, 'foot': {}}
        
        # Обработка thead (заголовки)
        thead = table.find('thead')
        if thead:
            for row_idx, row in enumerate(thead.find_all('tr'), start=1):
                row_dict = {}
                for col_idx, cell in enumerate(row.find_all(['th', 'td']), start=1):
                    row_dict[f'col{col_idx}'] = cell.get_text(strip=True)
                table_dict['head'][f'row{row_idx}'] = row_dict
        
        # Обработка tbody (основное содержимое)
        tbody = table.find('tbody') or table  # Если tbody нет, берём всю таблицу
        rows_in_body = tbody.find_all('tr') if tbody != table else table.find_all('tr')
        
        # Исключение строк, которые уже попали в thead или tfoot
        if thead:
            rows_in_body = [row for row in rows_in_body if row not in thead.find_all('tr')]
        tfoot = table.find('tfoot')
        if tfoot:
            rows_in_body = [row for row in rows_in_body if row not in tfoot.find_all('tr')]
        
        for row_idx, row in enumerate(rows_in_body, start=1):
            row_dict = {}
            for col_idx, cell in enumerate(row.find_all(['th', 'td']), start=1):
                row_dict[f'col{col_idx}'] = cell.get_text(strip=True)
            table_dict['body'][f'row{row_idx}'] = row_dict
        
        # Обработка tfoot (подвал таблицы)
        tfoot = table.find('tfoot')
        if tfoot:
            for row_idx, row in enumerate(tfoot.find_all('tr'), start=1):
                row_dict = {}
                for col_idx, cell in enumerate(row.find_all(['th', 'td']), start=1):
                    row_dict[f'col{col_idx}'] = cell.get_text(strip=True)
                table_dict['foot'][f'row{row_idx}'] = row_dict
        
        # Замена таблицы на словарь
        table.replace_with(f"{table_dict}")


def get_text_from_url(url: str) -> str:
    '''Парсинг html-страницы по ссылке'''

    r = requests.get(url, headers=headers)
    soup = BeautifulSoup(r.text, 'html.parser')

    # Удаление всех ссылок
    '''for a_tag in soup.find_all('a'):
        a_tag.decompose()'''
    # Удаление со странице всех тегов заголовка и навигации
    for header in soup.find_all(['header', 'nav', 'footer']):
        header.decompose()
    # Удаление со страницы div тега с id='header' или с class='header'
    header_div = soup.find('div', {'id': 'header'})
    if header_div:
        header_div.decompose()
    header_div = soup.find('div', {'class': 'header'})
    if header_div:
        header_div.decompose()
    # Удаление со страницы div тега с id='footer' или с class='footer'
    header_div = soup.find('div', {'id': 'footer'})
    if header_div:
        header_div.decompose()
    header_div = soup.find('div', {'class': 'footer'})
    if header_div:
        header_div.decompose()
    
    # замена таблиц на словари
    replace_table_to_dict(soup)

    return soup.get_text("\n", True)


def split_string_by_width(
    c: canvas.Canvas, 
    text: str, 
    max_width: int, 
    font_name: str, 
    font_size: int
):
    '''Разбиение строки на части, которые не превышают max_width'''

    lines = []
    current_line = []
    
    # Устанавливание шрифта для корректного расчёта ширины
    c.setFont(font_name, font_size)
    
    for word in text.split():
        # Проверка ширины текущей строки + новое слово
        test_line = ' '.join(current_line + [word])
        test_width = c.stringWidth(test_line, font_name, font_size)
        
        if test_width <= max_width:
            current_line.append(word)
        else:
            # Если строка переполняется, сохраняем текущую и начинаем новую
            lines.append(' '.join(current_line))
            current_line = [word]
    
    # Добавление последней строки
    if current_line:
        lines.append(' '.join(current_line))
    
    return lines


def write_to_pdf(string_array: list, filename: str) -> None:
    '''Запись массива строк в PDF-файл'''

    # Загрузка шрифта, поддерживающего кириллицу
    try:
        pdfmetrics.registerFont(TTFont('Arial', './font/arial.ttf'))
        font_name = 'Arial'
    except:
        font_name = 'Times-Roman'

    cnv = canvas.Canvas(filename, pagesize=letter)
    margin = 0.5 * inch
    max_width = letter[0] - 2 * margin  # Ширина текстовой области
    
    font_size = 12
    line_height = 0.25 * inch
    y = letter[1] - margin
    
    cnv.setFont(font_name, font_size)

    for text in string_array:
        # Разбиваем строку, если она слишком длинная
        lines = split_string_by_width(cnv, text, max_width, font_name, font_size)
        
        for line in lines:
            if y < margin:  # Если кончилось место, новая страница
                cnv.showPage()
                y = letter[1] - margin
                cnv.setFont(font_name, font_size)
            
            cnv.drawString(margin, y, line)
            y -= line_height

    cnv.save()


def parse_to_pdf(url: str, name: str) -> str:
    '''Парсинг веб-страницы в pdf файл'''

    text = get_text_from_url(url).replace('—', '-').replace('–', '-') \
            .encode('cp1251', errors='ignore').decode('cp1251', errors='ignore')
    write_to_pdf(text.split('\n'), name)


if __name__ == '__main__':
    parse_to_pdf('https://priem.sut.ru/bak/statistika-prokhodnykh-ballov', 'test.pdf')
