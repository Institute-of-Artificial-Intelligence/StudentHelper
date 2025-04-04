from urllib.request import urlretrieve
import os


def download(url: str, dir: str, num: int = 0) -> None:
    file = url.rsplit('/', 1)[-1]
    name, ext = file.rsplit('.', 1)
    os.makedirs(f'./{dir}/', exist_ok=True)
    urlretrieve(
        url=url,
        filename=f'./{dir}/{name} {num}.{ext}'
    )


if __name__ == '__main__':
    download('https://pish.etu.ru/assets/files/rp-dlya-sajta-rop.pdf', 'ПИШ', 1)