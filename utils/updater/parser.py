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

def get_text_from_url(url: str) -> str:
    '''Получение текста со страницы по ссылке'''

    r = requests.get(url, headers=headers)
    soup = BeautifulSoup(r.text, 'html.parser')

    # Удаляем все ссылки
    for a_tag in soup.find_all('a'):
        a_tag.decompose()

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

    text = get_text_from_url(url).replace('—', '-') \
            .encode('cp1251', errors='ignore').decode('cp1251', errors='ignore')
    write_to_pdf(text.split('\n'), name)


if __name__ == '__main__':
    parse_to_pdf('https://t.me/s/vleti?before=215', 'etu.pdf')
