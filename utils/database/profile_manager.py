from supabase import create_client
from dotenv import load_dotenv
import os

# Загрузка переменных окружения
load_dotenv()
url = os.getenv('SUPABASE_URL_PROFILES')
key = os.getenv('SUPABASE_KEY_PROFILES')

supabase = create_client(url, key)

def get_profile_by_vk_id(vk_id: int):
    try:
        response = supabase.table("profiles") \
            .select("*") \
            .eq("vk_id", vk_id) \
            .maybe_single() \
            .execute()
        return response.data
    except Exception as e:
        print(f"get_profile_by_vk_id> Ошибка при получении профиля: {e}")
        return None

def update_profile_by_vk_id(vk_id: int, phone=None, school=None, user_type=None):
    try:
        fields = {}
        if phone: fields["phone"] = phone
        if school: fields["school"] = school
        if user_type: fields["user_type"] = user_type

        if not fields:
            print("update_profile_by_vk_id> Нечего обновлять.")
            return

        response = supabase.table("profiles") \
            .update(fields) \
            .eq("vk_id", vk_id) \
            .execute()
        print("✅ Обновление успешно:", response.data)
        return response.data
    except Exception as e:
        print(f"update_profile_by_vk_id> Ошибка: {e}")
        return None

if __name__ == '__main__':
    vk_id = 234234234234
    print(get_profile_by_vk_id(vk_id))

    update_profile_by_vk_id(
        vk_id=vk_id,
        phone="+7 900 123-45-67",
        school="ФМЛ №239",
        user_type="Абитуриент"
    )
