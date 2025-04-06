import PyPDF2
import glob
import os

def extract_text_from_pdf(pdf_path):
    text = ""
    try:
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                text += page.extract_text() + "\n"
    except Exception as e:
        print(f"Error processing {pdf_path}: {str(e)}")
    return text

def process_university_docs(university_name, qdrant_manager):
    pdf_dir = os.path.join(university_name, "*.pdf")
    documents = []
    
    for pdf_file in glob.glob(pdf_dir):
        text = extract_text_from_pdf(pdf_file)
        if text.strip():
            documents.append(text)
    
    if documents:
        qdrant_manager.add_documents(documents, university_name)