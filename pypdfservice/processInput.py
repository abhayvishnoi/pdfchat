import os
from PyPDF2 import PdfReader # type: ignore
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
import google.generativeai as genai
from langchain.vectorstores import FAISS
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains.question_answering import load_qa_chain
from langchain.prompts import PromptTemplate
from dotenv import load_dotenv
import os
import json
import docx2txt

load_dotenv()
Gkey=os.getenv("GOOGLE_API_KEY")
print('Gkey',Gkey)
genai.configure(api_key=Gkey)


# read all pdf files and return text


def get_pdf_text(pdf_docs):
    text = ""
    for pdf in pdf_docs:
        pdf_reader = PdfReader(pdf)
        for page in pdf_reader.pages:
            text += page.extract_text()
    return text

# split text into chunks


def get_text_chunks(text):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=10000, chunk_overlap=1000)
    chunks = splitter.split_text(text)
    return chunks  # list of strings

# get embeddings for each chunk


def get_vector_store(chunks,chatId):
    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/embedding-001")  # type: ignore
    vector_store = FAISS.from_texts(chunks, embedding=embeddings)
    vector_store.save_local("faiss_index_"+chatId)


def get_conversational_chain():
    prompt_template = """
    Answer the question as detailed as possible from the provided context, make sure to provide all the details, if the answer is not in
    provided context just say, "answer is not available in the context", don't provide the wrong answer\n\n
    Context:\n {context}?\n
    Question: \n{question}\n

    Answer:
    """

    model = ChatGoogleGenerativeAI(model="gemini-1.5-pro",
                                   client=genai,
                                   temperature=0.7,
                                   )
    prompt = PromptTemplate(template=prompt_template,
                            input_variables=["context", "question"])
    chain = load_qa_chain(llm=model, chain_type="stuff", prompt=prompt)
    return chain


def user_input(user_question,vectorStoreId):
    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/embedding-001")  # type: ignore

    new_db = FAISS.load_local(vectorStoreId, embeddings, allow_dangerous_deserialization=True) 
    docs = new_db.similarity_search(user_question)

    chain = get_conversational_chain()

    response = chain({"input_documents": docs, "question": user_question}, return_only_outputs=True, )

    print(response)
    return response

def get_word_text(file_paths):
    text=""
    for file in file_paths:
        text += docx2txt.process(file)
    return text

def process_input(prompt,file_paths,chatId):    
   
    with open("processedFiles.txt","r") as f:
        processedChats = f.read().splitlines()
    print(chatId,processedChats)

    text=""

    for file in file_paths:
        if file.split(".")[-1] in ["doc","docx"]:
            print("word file",file)
            text+=get_word_text([file])
        else:
            print("pdf file",file)
            text+=get_pdf_text([file])
    if not chatId in processedChats:
        text_chunks = get_text_chunks(text)
        with open(f"chunksList{chatId}.json","w") as f:
            data={"chunks":text_chunks}
            json.dump(data, f)
        get_vector_store(text_chunks,chatId)
        with open("processedFiles.txt","a") as f:
                f.write(chatId + "\n")
    else:
        with open(f"chunksList{chatId}.json","r") as f:
            data = json.load(f)
            text_chunks = data["chunks"]
    vectorStoreId="faiss_index_"+chatId
    response = user_input(prompt,vectorStoreId)
                # placeholder = st.empty()
    full_response = ''
    for item in response['output_text']:
        full_response += item
    if response is not None:
        message = {"sender": "ai", "text": full_response}
    return message
            # st.session_state.messages.append(message)


# if __name__ == "__main__":
#     main()