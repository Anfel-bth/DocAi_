# DocAI — Local AI Document Assistant

DocAI is a **local AI document assistant** that lets you upload `.txt` or `.pdf` files and ask questions about their content.

It uses **RAG (Retrieval-Augmented Generation)** with a local **Mistral 7B** model and **nomic-embed-text** through llama.cpp. Documents and questions are processed locally, with no cloud API required.

## Architecture

```text
React (Vite :5173)
       |
       v
Express Backend (:3000)
       |
       +---- SQLite
       |
       +---- Embeddings (:8081)
       |     nomic-embed-text
       |
       +---- LLM (:8080)
             Mistral 7B
```

## Features

* PDF and TXT document upload
* Automatic text extraction and chunking
* Embedding-based document retrieval
* Local Mistral 7B question answering
* SQLite storage
* React + Vite frontend
* Jest + Supertest testing
* Fully local and private

## Setup

### 1. Download the Models

Download:

* **Mistral 7B Instruct GGUF — Q4_K_M**
* **nomic-embed-text-v1.5 GGUF**

Place both models in:

```text
C:\llama\models\
```

### 2. Start llama.cpp

Start the Mistral server:

```bash
.\llama-server.exe -m .\models\mistral-7b-instruct-v0.2.Q4_K_M.gguf -c 4096 --port 8080
```

Start the embedding server in another terminal:

```bash
.\llama-server.exe -m .\models\nomic-embed-text-v1.5.f16.gguf --port 8081 --embedding
```

### 3. Start the Backend

```bash
cd backend
npm install
npm run db:init
npm run dev
```

Configure the required environment variables in your local `.env` file.

### 4. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

## How RAG Works

```text
Document
   ↓
Text extraction
   ↓
Chunking
   ↓
Embeddings
   ↓
SQLite

Question
   ↓
Question embedding
   ↓
Similarity search
   ↓
Relevant chunks
   ↓
Mistral 7B
   ↓
Answer
```

## Testing

```bash
cd backend
npm test
```

## Tech Stack

| Layer      | Technology        |
| ---------- | ----------------- |
| Frontend   | React + Vite      |
| Backend    | Node.js + Express |
| Database   | SQLite            |
| LLM        | Mistral 7B GGUF   |
| Embeddings | nomic-embed-text  |
| AI Runtime | llama.cpp         |
| Retrieval  | Cosine similarity |
| Testing    | Jest + Supertest  |

## Limitations

* No OCR for scanned PDFs
* Single-user/local-only
* CPU inference by default
* Brute-force similarity search instead of a vector index

## Author

**Anfel Benatmane**
Computer Science — AI & Data Science
