# CLAUDE.md

Landing page แบบ static สำหรับ **ClaudeHero** (ธุรกิจให้บริการ AI) ธีมขาวดำพรีเมียม เขียนด้วย HTML/CSS/JS ล้วน ไม่มี framework, build step, package manager หรือ backend

## โครงสร้าง
- `index.html` — ทุก section อยู่ในไฟล์เดียว: nav → hero → marquee → services → stats → process → pricing → testimonials → FAQ → contact → footer
- `css/style.css` — สไตล์ทั้งหมด จัดเป็นบล็อกตาม section (คั่นด้วย `/* ---------- Name ---------- */`) แล้วตามด้วย responsive และ reduced-motion ไว้ท้ายไฟล์
- `js/main.js` — IIFE เดียว แต่ละฟีเจอร์เป็นบล็อกแยกกันและทำงานเฉพาะเมื่อพบ element ใน DOM

## การรัน / ทดสอบ
เปิด `index.html` ในเบราว์เซอร์ได้โดยตรง ไม่ต้องมี server ในเครื่องนี้ไม่มี Node.js ให้ตรวจ syntax ของ JS ด้วยการดู DevTools console แทน ทดสอบขนาดจอที่ 1024 / 860 / 640 / 400px

## กฎด้านดีไซน์
- **ใช้แค่ขาว ดำ และเทา ห้ามเพิ่มสีอื่น** ใช้ token ใน `:root` (`--black`, `--ink`, `--ink-2`, `--gray`, `--gray-2`, `--silver`, `--white`, `--line-dark`, `--line-light`) แทนการเขียนค่าสีตรง ๆ
- section ใหม่ต้องใช้ `.section--dark` หรือ `.section--light` และสลับกับ section ข้างเคียง
- ฟอนต์: `--font-sans` (Inter + Noto Sans Thai) สำหรับข้อความทั่วไป ส่วน `<em>` จะเป็น Playfair Display ตัวเอียงโดยอัตโนมัติ ใช้เน้นคำในหัวข้อ
- easing ใช้ `var(--ease)` เสมอ
- หัว section ใช้รูปแบบ `.section-head` > `.eyebrow` ("0N — Name") + `.section-title` + `.section-desc` ถ้าเพิ่มหรือย้าย section ต้องเรียงเลขลำดับใน eyebrow ใหม่
- เนื้อหาเป็นภาษาไทย หัวข้อหลักผสมภาษาอังกฤษได้

## รูปแบบที่ JS ใช้ (ใช้ต่อได้เลย)
- `.reveal` — fade/slide-in เมื่อเลื่อนถึง หน่วงเวลาได้ด้วย inline `style="--d:.1s"`
- `data-count="500"` (+ `data-decimals`) — ตัวเลขที่นับขึ้น
- `data-split` — แยกหัวข้อทีละคำเพื่อทำ text reveal (ใช้กับ hero title)
- `.magnetic` — ปุ่มที่ขยับตามเมาส์ (เฉพาะเครื่องที่มีเมาส์)
- ราคา: `.amount[data-monthly][data-yearly]` จะสลับค่าตามปุ่ม `#billingSwitch`
- รีวิว: เพิ่ม `<figure class="quote">` ใน `#slider .slider__track` แล้ว JS จะสร้างจุดนำทางให้เอง
- FAQ: คัดลอกบล็อก `.acc` ได้เลย
- ฟอร์ม: กฎตรวจข้อมูลอยู่ใน object `rules` ใน `main.js` โดย key คือ `name` ของ field

## ข้อควรระวัง
- ทุก animation ต้องรองรับ `prefers-reduced-motion` (มีทั้งใน CSS ท้ายไฟล์และตัวแปร `reduceMotion` ใน JS)
- ฟอร์มติดต่อ**ยังไม่ได้ส่งข้อมูลไปที่ใด** ตอนนี้แค่จำลองการส่งด้วย `setTimeout`
- ข้อมูลลูกค้า รีวิว สถิติ ราคา ข้อมูลติดต่อ และ "ISO 27001" เป็น**ข้อมูลสมมติ** ต้องเปลี่ยนก่อนเผยแพร่จริง
- ทรัพยากรภายนอกมีแค่ Google Fonts ไม่มี library หรือ dependency อื่น ควรคงไว้แบบนี้
