# OpenRouter TypeScript Starter

A professional TypeScript CLI starter project for connecting to the OpenRouter API.

โปรเจกต์ตัวอย่างสำหรับเรียนรู้และพัฒนา AI CLI Application ด้วย **TypeScript + Node.js + OpenRouter API** โดยรองรับการรับคำถามจาก Terminal, ส่งคำถามไปยัง OpenRouter, แสดงคำตอบจาก AI, แสดงสถานะ API response และแสดงข้อมูลแหล่งที่มาของคำตอบในรูปแบบที่ตรวจสอบได้มากขึ้น

---

## Overview

This project demonstrates how to build a simple but structured AI command-line interface using TypeScript and OpenRouter.

It is designed for:

- Learning TypeScript with real API integration
- Building an AI CLI assistant
- Testing OpenRouter models
- Practicing API response handling
- Preparing a foundation for future AI Agent development

---

## Features

- TypeScript-based CLI application
- Load API Key securely from `.env`
- Send user input to OpenRouter Chat Completions API
- Display AI-generated answers in Terminal
- Show OpenRouter API response status
- Show response time, model, finish reason, and token usage
- Show API source and model source
- Ask AI to return answer sources such as link, institution, person, book, paper, or law
- Basic error handling for API errors
- Safe GitHub-ready project structure

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript |
| Runtime | Node.js |
| Package Manager | npm |
| Environment Variables | dotenv |
| CLI Input | node:readline/promises |
| AI Gateway | OpenRouter API |

---

## Project Structure

```text
openrouter-ts-starter/
├─ src/
│  └─ index.ts
├─ .env.example
├─ .gitignore
├─ package.json
├─ package-lock.json
├─ tsconfig.json
└─ README.md