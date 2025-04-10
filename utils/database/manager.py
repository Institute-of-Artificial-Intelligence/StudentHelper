import sqlite3

DB_PATH = 'assets/db.sqlite'


def create_universitites_table() -> None:
    '''Создание таблицы с ссылками для университета'''

    # Подключение к базе данных
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Создание таблицы, если она ещё не существует
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS university_links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            university_name TEXT NOT NULL,
            link_name TEXT NOT NULL,
            link TEXT NOT NULL
        )
    ''')

    # Сохраняем изменения и закрываем соединение
    conn.commit()
    conn.close()



def insert_links(university_name: str, links_dict: dict) -> None:
    '''Вставка в БД полезных ссылок для определённого университета'''

    # Подключение к базе данных
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Вставка данных из словаря
    for link_name, link in links_dict.items():
        cursor.execute('''
            INSERT INTO university_links (university_name, link_name, link)
            VALUES (?, ?, ?)
        ''', (university_name, link_name, link))

    # Сохраняем изменения и закрываем соединение
    conn.commit()
    conn.close()


def get_links_by_university(university_name: str) -> dict:
    '''Получение полезных ссылок по названию университета'''

    # Подключение к базе данных
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Получение ссылок по названию университета
    cursor.execute('''
        SELECT link_name, link FROM university_links
        WHERE university_name = ?
    ''', (university_name,))
    
    # Преобразование результата в словарь
    rows = cursor.fetchall()
    links_dict = {link_name: link for link_name, link in rows}

    # Закрытие соединения
    conn.close()

    return links_dict


if __name__ == '__main__':
    links = {
        'link1': 'me.tg',
        'link2': 'he.org',
        'link3': 'she.name'
    }
    create_universitites_table()
    insert_links('МГУ', links)
    print(get_links_by_university('МГУ'))