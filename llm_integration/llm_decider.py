from yandex_cloud_ml_sdk import YCloudML
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("YANDEX_API_KEY")
folder_id = os.getenv("YANDEX_FOLDER_ID")

sdk = YCloudML(
    folder_id=folder_id,
    auth=api_key,
)

def llm_decider(question):
    model = sdk.models.text_classifiers("yandexgpt").configure(
        task_description="Определи тип запроса пользователя",
        labels=["Нелегальный, провокационный или связан с политикой",
                "Легальный, не связан с образованием, не требует поиска в интернете",
                "Легальный, не связан с образованием, требует поиска в интернете",
                "Легальный, связан с получением информации про получение образования"]
    )

    result = model.run(question)
    best_label = max(result, key=lambda x: x.confidence)
    return best_label.label