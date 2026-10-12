# JARVIS AI Website + Android API (phone se setup)

## Is ZIP mein kya hai
- `server.js`: Express backend; Gemini API key sirf server environment mein rakhi jaati hai.
- `public/index.html`: basic JARVIS-style website.
- `/health`: server status.
- `POST /api/chat`: Android app aur website ke liye AI endpoint.
- Default model `gemini-2.5-flash` hai; hosting ke environment variable `GEMINI_MODEL` se badal sakte ho.

## Important security note
Is demo website mein browser chat ke liye token prompt aata hai. Public users ke liye aise token ko website mein expose mat karna. Production mein login/rate-limits add karo. Android APK mein permanent shared token/API key extract kiya ja sakta hai; isliye ye starter personal testing ke liye hai, production-grade user authentication nahi.

## Phone se deploy (Render ka example)
1. GitHub app/site kholo, naya repository banao, naam `jarvis-ai-server`.
2. Is ZIP ke andar ki files repository ke root mein upload karo. `package.json`, `server.js`, `public/` root par hon.
3. Render par account banao → New → Web Service → apna GitHub repo connect karo.
4. Build command: `npm install`
5. Start command: `npm start`
6. Environment variables add karo:
   - `GEMINI_API_KEY` = Google AI Studio se banaya hua Gemini API key
   - `JARVIS_API_TOKEN` = lamba random secret token (example format: 40+ random letters/numbers; apna token khud banao)
   - `GEMINI_MODEL` = `gemini-2.5-flash`
7. Deploy hone par Render URL milega, e.g. `https://your-service.onrender.com`. Example URL ko apne actual URL se replace karna.
8. Browser mein `https://YOUR-SERVICE.onrender.com/health` kholo. `ok:true` aaye to server chal raha hai.

## Android JARVIS mein connect karna
Project mein jo `JarvisAiEngine.kt` Gemini ko direct call karta hai, usko backend endpoint call karne ke liye update karna hoga. Is starter ZIP mein tumhare app ke exact classes/build files include nahi hain, kyunki installed APK se source project ko automatically edit nahi kiya ja sakta.

Backend request:
- URL: `https://YOUR-SERVICE.onrender.com/api/chat`
- Method: `POST`
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer YOUR_JARVIS_API_TOKEN`
- JSON body: `{"message":"Namaste JARVIS","history":[]}`
- Expected response: `{"reply":"...","model":"gemini-2.5-flash"}`

## Gemini API key
Google AI Studio mein Gemini API key banao aur sirf hosting ke Environment Variables mein rakho. Is key ko Android app, GitHub source, ya website HTML/JS mein paste mat karo.

## Quota/cost
Gemini API ki availability, free-tier quota aur prices account, region, model aur policy ke hisaab se badal sakte hain. Free unlimited hone ki guarantee nahi. 429 aaye to quota/rate limit check karo. Billing enable karne se pehle pricing/limits padh lena.
