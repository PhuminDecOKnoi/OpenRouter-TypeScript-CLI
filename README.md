# OpenRouter TypeScript CLI

โปรเจกต์ตัวอย่างสำหรับสร้าง CLI ด้วย **TypeScript + Node.js** เพื่อรับคำถามจากผู้ใช้ ส่งคำถามไปยัง **OpenRouter API** และแสดงผลลัพธ์กลับมาพร้อมข้อมูลสถานะ เช่น model, provider, response status และแหล่งที่มาของคำตอบ

---

## วัตถุประสงค์ของโปรเจกต์

โปรเจกต์นี้ออกแบบมาเพื่อใช้เป็นพื้นฐานในการเรียนรู้และพัฒนา CLI ที่สามารถเชื่อมต่อกับ LLM API ได้อย่างเป็นระบบ

ความสามารถหลัก:

1. รับคำถามจากผู้ใช้ผ่าน Terminal
2. ส่งคำถามไปยัง OpenRouter API
3. แสดงสถานะการเรียก API
4. แสดงคำตอบจาก Model
5. แสดงข้อมูล Model / Provider ที่ใช้ตอบ
6. รองรับการแนบแหล่งที่มาของคำตอบ เช่น link, institution, document, person หรือ source อื่น ๆ
7. ใช้ `.env` เพื่อเก็บ API Key อย่างปลอดภัย

---

## Tech Stack

| รายการ | ใช้สำหรับ |
|---|---|
| Node.js | Runtime สำหรับรันโปรแกรม |
| TypeScript | เขียนโค้ดแบบ type-safe |
| tsx | รัน TypeScript โดยไม่ต้อง build ก่อน |
| dotenv | โหลดค่า environment variables จาก `.env` |
| OpenRouter API | เชื่อมต่อกับ LLM models |

---

## Project Structure

```text
OpenRouter-TypeScript-CLI/
├── src/
│   └── index.ts
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
