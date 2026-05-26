# Forum Design — hairstylesforseniors

> Полный self-contained отчёт для реализации форума без регистрации на сайте
> `hairstylesforseniors`. Документ написан так, чтобы в новой сессии можно
> было читать только его и сразу приступать к реализации, не пересобирая
> контекст из кода.

---

## 0. TL;DR

Делаем отдельный раздел `/forum` на сайте `hairstylesforseniors-client`.
Без регистрации. Имя пользователя сохраняется в `localStorage`, аватар —
identicon, сгенерированный из имени. Все записи идут через прокси
`api.nice-advice.info` (там уже хранится Strapi-токен, rate-limit и GPT
модерация). Боты создают часть тредов и ответов через
`gc-gemini-generator`, используя пул `forum-persona` — для посетителя они
неотличимы от живых людей. Чтение идёт публично с Strapi.

---

## 1. Окружение и доступы

### Проекты на диске

```
C:/Users/nazar/OneDrive/Desktop/GC-coding/
├── hairstylesforseniors-client/      ← фронт (React + Vite, port 5173)
└── nice-advice/
    └── gc-gemini-generator/          ← cron-генератор + backend прокси
        └── .env                      ← STRAPI_TOKEN, OPENAI_API_KEY, TG_TOKEN
```

### Strapi

- URL: `https://vivid-triumph-4386b82e17.strapiapp.com`
- Token: лежит в `nice-advice/gc-gemini-generator/.env` как `STRAPI_TOKEN`
  (`Bearer e978fa4adf9...`)
- Существующий backend-прокси (Express): `api.nice-advice.info` —
  уже принимает `POST /comment` для комментариев под статьями. Сюда же
  добавляем форумные эндпоинты.

### Dev-команды

```bash
# Фронт
cd hairstylesforseniors-client && npm run dev   # → http://localhost:5173

# Бэкенд-прокси / cron-генератор
cd nice-advice/gc-gemini-generator
# PM2 — см. ecosystem.config.js
```

---

## 2. Что уже есть в Strapi (collection types)

Через `/api/content-type-builder/content-types` (с админ-токеном) видны три
форумных типа:

### 2.1 `discussion-thread` (PUBLIC read OK, write 403)

```jsonc
{
  "title":                 "string",     // required, maxLength 200
  "slug":                  "uid",        // targetField: title
  "body":                  "text",       // maxLength 5000
  "authorName":            "string",     // required, maxLength 50
  "authorAvatar":          "media",      // не используем (см. ниже identicon)
  "authorAvatarIdenticon": "string",     // строка для генерации SVG identicon
  "persona":               "relation → forum-persona (manyToOne)",
  "site":                  "enumeration", // ["hairstyles","cholesterin","nice-advice","shared"]
  "category":              "string",     // свободная строка (не отдельный CT)
  "linkedPost":            "relation → post (manyToOne)",      // не используем
  "linkedPost2":           "relation → post2 (manyToOne)",     // не используем
  "linkedPost3":           "relation → post3 (manyToOne)",     // не используем сейчас
  "isPinned":              "boolean default false",
  "isLocked":              "boolean default false",
  "isAutoCreated":         "boolean default false", // true для ботовских
  "viewCount":             "integer default 0",
  "commentCount":          "integer default 0",
  "lastActivityAt":        "datetime",
  "ipHash":                "string",
  "comments":              "relation → forum-comment (oneToMany, mappedBy thread)"
}
```

### 2.2 `forum-comment` (PUBLIC read OK, write 403)

```jsonc
{
  "thread":                "relation → discussion-thread (manyToOne, inversedBy comments)",
  "body":                  "text",       // required, maxLength 5000
  "authorName":            "string",     // required, maxLength 50
  "authorAvatar":          "media",
  "authorAvatarIdenticon": "string",
  "persona":               "relation → forum-persona (manyToOne)",
  "parentComment":         "relation → forum-comment (manyToOne, SELF)",
  "likes":                 "integer default 0",
  "isHidden":              "boolean default false",
  "isFlagged":             "boolean default false",
  "ipHash":                "string",
  "userAgent":             "string",
  "editedAt":              "datetime"
}
```

### 2.3 `forum-persona` (PUBLIC 403 — admin only)

Пул бот-личностей. Никогда не отдаётся клиенту. По описанию схемы:
> *"never grant Public role any permission on this content type. Exposes
> isBot and botPersona which must stay hidden from website visitors."*

```jsonc
{
  "displayName":     "string required maxLength 50",
  "username":        "uid",
  "avatar":          "media",
  "bio":             "text maxLength 500",
  "isBot":           "boolean default true",
  "botPersona":      "text",                    // промпт-стиль для GPT
  "site":            "enumeration",             // тот же enum
  "isActive":        "boolean default true",
  "usageCount":      "integer default 0",
  "lastUsedAt":      "datetime",
  "ageHint":         "integer",
  "regionHint":      "string",
  "threadsStarted":  "relation → discussion-thread (oneToMany)",
  "commentsMade":    "relation → forum-comment (oneToMany)"
}
```

### 2.4 Проверки публичного доступа (curl, без токена)

| Endpoint                                | GET   | POST  |
|-----------------------------------------|-------|-------|
| `/api/discussion-threads`               | 200   | 403   |
| `/api/forum-comments`                   | 200   | 403   |
| `/api/forum-personas`                   | 403   | 403   |

Сейчас в базе пусто — `total: 0` для тредов и комментариев.

---

## 3. Решения по продукту (зафиксированы с пользователем)

| Вопрос                          | Решение                                                    |
|---------------------------------|------------------------------------------------------------|
| Где живёт форум                 | Только отдельный раздел `/forum`. Не привязан к постам.    |
| Кто создаёт треды               | Гибрид: боты + реальные посетители                         |
| Структура                       | Категории → треды → ответы (вложенные) → лайки             |
| Запись в Strapi                 | Через прокси `api.nice-advice.info`, не напрямую           |
| Анти-спам                       | Rate-limit по IP-hash + GPT проверка нормальности текста   |
| Активность ботов                | ~3–5 тредов/день, 10–20 ответов/день                       |

### Дефолты для 4 финальных уточнений (использовать, если пользователь не переопределит)

1. **Категории (6)**: `Hair Care` · `Styling Tips` · `Color & Dye` ·
   `Hair Loss & Thinning` · `Products & Tools` · `Lifestyle & Confidence`
2. **Сайт**: на старте только `hairstyles`, но компоненты пишутся с
   `site` пропом — чтобы потом подключить cholesterin / nice-advice без
   рефакторинга.
3. **GPT-фильтр**: тот же `OPENAI_API_KEY`, что для комментариев. Модель
   `gpt-5-nano` (дёшево, быстро). Промпт ниже в §6.2.
4. **UI-стилистика**: matched с существующим `Comments.tsx` — карточки,
   gradient identicon-аватары, та же типография. CSS-переменные/токены
   следовать `Comments.css`.

---

## 4. Архитектура целиком

```
┌──────────────────────────────────────────────────┐
│  hairstylesforseniors-client  (React, port 5173) │
│  Маршруты: /forum, /forum/c/:cat,                │
│            /forum/t/:slug, /forum/new            │
└────────────┬─────────────────────┬───────────────┘
             │                     │
        READ │                     │ WRITE
             │                     │
             ▼                     ▼
   ┌─────────────────┐   ┌──────────────────────────┐
   │  Strapi         │   │  api.nice-advice.info    │
   │  /api/discussion│   │  /forum/thread   POST    │
   │       -threads  │   │  /forum/reply    POST    │
   │  /api/forum-    │   │  /forum/like     POST    │
   │       comments  │   │                          │
   │  (public GET)   │   │  - rate-limit (ipHash)   │
   └─────────────────┘   │  - honeypot + min-time   │
             ▲           │  - GPT modercheck        │
             │           │  - TG-уведом. при flag   │
             │ WRITE     └──────────────┬───────────┘
             │ STRAPI_TOKEN             │
             │                          │ STRAPI_TOKEN
             ├──────────────────────────┘
             │
             │ WRITE (auto-generated)
             │
   ┌─────────┴───────────────────────────────────┐
   │  gc-gemini-generator (PM2)                  │
   │  - functionsForum.js                        │
   │    · genThread(site)   cron 10:00, 19:00    │
   │    · genReply(site)    cron каждые ~90 мин  │
   │    · seedPersonas()    one-shot            │
   │  - использует pool из forum-persona         │
   │  - помечает isAutoCreated: true             │
   └─────────────────────────────────────────────┘
```

**Жёсткое правило**: фронт **никогда** не держит `STRAPI_TOKEN`. Любая
запись только через прокси.

---

## 5. Структура страниц фронта

| Маршрут                     | Компонент            | Назначение                                                  |
|-----------------------------|----------------------|-------------------------------------------------------------|
| `/forum`                    | `Forum.tsx`          | Карточки 6 категорий + 10 свежих тредов + CTA "Start"      |
| `/forum/c/:categoryKey`     | `ForumCategory.tsx`  | Список тредов категории, пагинация, сортировки             |
| `/forum/t/:slug`            | `Thread.tsx`         | OP + дерево ответов + форма ответа                          |
| `/forum/new`                | `NewThread.tsx`      | Форма создания треда                                        |

### Сортировки на странице категории

- `Latest` (default) — `sort=lastActivityAt:desc`
- `Most active` — `sort=commentCount:desc&filters[createdAt][$gte]=now-7d`
- `Top` — нужно посчитать по сумме `likes` всех comments треда; на v1
  делаем `sort=viewCount:desc` (без отдельного агрегата)

### Состояния UI

- Пустая категория → empty state с CTA "Be the first to start a thread"
- Заблокированный тред (`isLocked: true`) → форма ответа скрыта, badge
  "Locked"
- Закреплённый тред (`isPinned: true`) → всегда наверху списка категории
  с золотой иконкой 📌

---

## 6. Запись через прокси `api.nice-advice.info`

### 6.1 Endpoints

```
POST /forum/thread
  body: { site, category, title, body, authorName, website?, t0 }
  resp: { documentId, slug } | { error: "rate_limit"|"rejected"|"flagged"|... }

POST /forum/reply
  body: { site, threadDocumentId, parentCommentDocumentId?, body, authorName, website?, t0 }
  resp: { documentId } | { error }

POST /forum/like
  body: { commentDocumentId }
  resp: { likes }   // просто инкремент, без идемпотентности
```

`website` — honeypot-поле (должно быть пустым).
`t0` — таймштамп открытия формы (клиент шлёт `Date.now()`). Если
`Date.now() - t0 < 3000` мс → 422.

### 6.2 Pipeline для POST /forum/thread и /forum/reply

```
1. honeypot check (`website !== ""`) → 422
2. min-time check (`now - t0 < 3000`) → 422
3. rate-limit (sha256(IP + secret) → Redis/memory)
     - 5/мин   → 429
     - 20/час  → 429
     - 50/день → 429
4. длины: title 5..200, body 10..5000, name 2..50 → 422
5. GPT modercheck (см. ниже) → если REJECT, ответить 422 без записи
6. POST в Strapi с STRAPI_TOKEN
     - thread: { ...data, ipHash, isAutoCreated: false, lastActivityAt: now }
     - reply:  { ...data, ipHash, userAgent }
       + затем PATCH thread → commentCount++, lastActivityAt = now
7. если GPT вернул FLAG → дополнительно патчим isFlagged: true и шлём в TG
8. возвращаем клиенту { documentId, slug? }
```

### 6.3 GPT modercheck — промпт

```
SYSTEM:
You are a moderation classifier for an English-language hair-care forum
aimed at people 50+. Classify the message into exactly one of:
- OK: relevant, civil, hair/beauty/lifestyle topic
- FLAG: borderline (mild rudeness, off-topic but not malicious, contains
  promotional links)
- REJECT: profanity, slurs, harassment, explicit sexual content,
  hate speech, obvious spam (gambling/crypto/pharma/SEO links)

Output strictly one of: OK, FLAG, REJECT

USER:
<userText>
```

Использовать `gpt-5-nano`, `temperature: 0`, `max_tokens: 5`.
Параллельно к тексту проверяем и `title` (одним вызовом склеив их).

---

## 7. Идентификация пользователя без регистрации

- `localStorage` ключ `hfs_forum_name` — сохраняем имя после первого
  поста (по аналогии с `hfs_commenter_name` для комментариев).
- `localStorage` ключ `hfs_forum_liked` — `Set<commentId>` для
  визуального состояния лайка (на бэке инкремент без проверки — мы
  принимаем, что счётчик "социально приблизительный").
- Identicon-аватар: SHA-256 от имени → берём первые 6 hex-символов как
  HSL цвет + первые 2 буквы имени. Существующий код в `Comments.tsx`
  (`Avatar` component, gradient из палитры) переиспользуем как
  `components/forum/Identicon.tsx`. Поле `authorAvatarIdenticon` в схеме
  можно использовать чтобы зафиксировать seed (например `${name}#${ts}`)
  и не зависеть только от имени — на случай, если двое выберут одно имя
  и захотят разные аватары. Но в v1 можно слать просто имя.

---

## 8. Бот-генератор (gc-gemini-generator)

### 8.1 Новые файлы

```
nice-advice/gc-gemini-generator/
├── functionsForum.js          ← seedPersonas, genThread, genReply
└── ecosystem.config.js        ← добавить cron-апсы
```

### 8.2 Функции

```js
// functionsForum.js (псевдокод)

const SITE = 'hairstyles';
const CATEGORIES = ['Hair Care','Styling Tips','Color & Dye',
                    'Hair Loss & Thinning','Products & Tools',
                    'Lifestyle & Confidence'];

// 8.2.1 ОДНОРАЗОВО: посеять ~20 личностей для hairstyles
async function seedPersonas(count = 20) {
  for (let i = 0; i < count; i++) {
    const p = await generatePersonaWithGPT({
      site: SITE,
      audience: 'women & men aged 50–75, traditional, warm, conversational',
    });
    // p = { displayName, bio, botPersona (writing style), ageHint, regionHint }
    await strapi.post('/forum-personas', { data: { ...p, site: SITE, isBot: true, isActive: true } });
  }
}

// 8.2.2 Создать тред (cron 2x в день)
async function genThread() {
  const persona = await pickLeastRecentlyUsedPersona(SITE);
  const category = pickRandom(CATEGORIES);
  const recentTitles = await getRecentThreadTitles(SITE, 10); // чтобы не дублироваться

  const { title, body } = await gpt({
    prompt: buildThreadPrompt(persona, category, recentTitles)
  });

  await strapi.post('/discussion-threads', {
    data: {
      title, body, category,
      site: SITE,
      authorName: persona.displayName,
      authorAvatarIdenticon: persona.displayName,
      persona: persona.id,
      isAutoCreated: true,
      lastActivityAt: new Date().toISOString(),
    }
  });

  await touchPersona(persona.id);
}

// 8.2.3 Ответить на старый тред (cron каждые ~90 мин)
async function genReply() {
  // Найти тред где lastActivityAt > 8h и commentCount < 12
  const thread = await pickStaleThread(SITE);
  if (!thread) return;

  const persona = await pickLeastRecentlyUsedPersona(SITE, exclude=thread.persona?.id);
  const recentComments = await getRecentComments(thread.id, 5);

  const { body } = await gpt({
    prompt: buildReplyPrompt(persona, thread, recentComments)
  });

  await strapi.post('/forum-comments', {
    data: {
      thread: thread.id,
      body,
      authorName: persona.displayName,
      authorAvatarIdenticon: persona.displayName,
      persona: persona.id,
    }
  });
  await strapi.put(`/discussion-threads/${thread.documentId}`, {
    data: { commentCount: thread.commentCount + 1, lastActivityAt: new Date().toISOString() }
  });
  await touchPersona(persona.id);
}
```

### 8.3 Промпт для создания персоны

```
Generate a persona for a hair-care forum reader aged 50–75.
Return JSON:
{
  "displayName":  "first name only, no last name. Common US/UK names.",
  "ageHint":      55–75,
  "regionHint":   "US state OR UK county",
  "bio":          "2 sentences, warm, mentions a hobby or family",
  "botPersona":   "Writing style: tone, vocabulary, typical concerns. 3-4 sentences. Will be fed back into GPT to write posts in this voice."
}
```

### 8.4 Промпт для треда

```
You are {persona.displayName}, age {persona.ageHint}, from {persona.regionHint}.
Bio: {persona.bio}
Writing style: {persona.botPersona}

Write a new forum thread in category "{category}" for an English-language
hair-care forum for people 50+.

Rules:
- Title: 40–120 chars, sounds like a real question or experience, no clickbait
- Body: 80–300 words, first-person, conversational, may ask a question
- No promotional content, no links, no profanity
- Do NOT repeat any of these recent titles: {recentTitles}

Output strictly JSON: { "title": "...", "body": "..." }
```

### 8.5 Cron (PM2 / node-cron)

```js
// в ecosystem.config.js или в server.js (где сейчас крутится)
schedule: [
  { fn: genThread, cron: '0 10 * * *', tz: 'America/New_York' },  // 10:00 EST
  { fn: genThread, cron: '0 19 * * *', tz: 'America/New_York' },  // 19:00 EST
  { fn: genReply,  cron: '*/90 * * * *' },                         // каждые ~90 мин
]
```

Запасной вариант — простой `setInterval` в `server.js` с jitter
(`base + Math.random() * 30min`), чтобы выглядело органично.

---

## 9. Файловые изменения — точный список

### 9.1 Создать

```
hairstylesforseniors-client/src/
├── pages/
│   ├── Forum.tsx
│   ├── ForumCategory.tsx
│   ├── Thread.tsx
│   └── NewThread.tsx
├── components/forum/
│   ├── ThreadCard.tsx
│   ├── CategoryCard.tsx
│   ├── CommentTree.tsx
│   ├── ReplyForm.tsx
│   ├── LikeButton.tsx
│   └── Identicon.tsx
├── services/
│   └── forumAPI.ts
└── styles/
    └── forum.css

nice-advice/gc-gemini-generator/
├── functionsForum.js
└── (роутер /forum/* в server.js или отдельным файлом forumRoutes.js)
```

### 9.2 Изменить

- `hairstylesforseniors-client/src/App.tsx` — 4 новых `<Route>`
- `hairstylesforseniors-client/src/layout/Header.tsx` — пункт меню "Forum"
- `hairstylesforseniors-client/src/layout/Footer.tsx` — линк на форум
- `nice-advice/gc-gemini-generator/server.js` — подключить forum routes
- `nice-advice/gc-gemini-generator/ecosystem.config.js` — cron tasks

### 9.3 Strapi (через UI Strapi или скриптом)

- Дать Public-роли права на `discussion-thread.find/findOne` и
  `forum-comment.find/findOne` (если ещё не выданы — у меня GET сейчас
  возвращает 200, значит уже выданы).
- Подтвердить, что Public **не имеет** доступа к `forum-persona` (сейчас
  403 — ОК).
- API-токен `STRAPI_TOKEN` в .env уже full-access — для бэкенда хватает.

---

## 10. Strapi API — конкретные запросы

### 10.1 Чтение (без токена)

```
GET /api/discussion-threads
    ?filters[site][$eq]=hairstyles
    &sort=lastActivityAt:desc
    &pagination[page]=1
    &pagination[pageSize]=20
    &populate=*
```

```
GET /api/discussion-threads
    ?filters[site][$eq]=hairstyles
    &filters[category][$eq]=Hair%20Care
    &sort=lastActivityAt:desc
```

```
GET /api/discussion-threads/:documentId
    ?populate[comments][sort]=createdAt:asc
    &populate[comments][populate][parentComment]=*
```

```
GET /api/forum-comments
    ?filters[thread][documentId][$eq]=<id>
    &sort=createdAt:asc
    &pagination[pageSize]=100
```

### 10.2 Запись (от backend, с STRAPI_TOKEN)

```
POST /api/discussion-threads
Headers: Authorization: <STRAPI_TOKEN>
Body: {
  "data": {
    "title": "...",
    "body": "...",
    "authorName": "...",
    "authorAvatarIdenticon": "...",
    "site": "hairstyles",
    "category": "Hair Care",
    "isAutoCreated": false,
    "ipHash": "<sha256>",
    "lastActivityAt": "<ISO>"
  }
}
```

```
POST /api/forum-comments
Body: {
  "data": {
    "thread": "<thread documentId>",
    "parentComment": "<comment documentId or null>",
    "body": "...",
    "authorName": "...",
    "authorAvatarIdenticon": "...",
    "ipHash": "<sha256>",
    "userAgent": "<UA>"
  }
}
```

```
PUT /api/discussion-threads/<documentId>
Body: { "data": { "commentCount": N, "lastActivityAt": "<ISO>" } }
```

---

## 11. Анти-спам — все 4 слоя в одном месте

| Слой           | Где                              | Что делает                                                       |
|----------------|----------------------------------|------------------------------------------------------------------|
| Honeypot       | Frontend form + backend          | Скрытое поле `website`. Если заполнено → 422 без записи          |
| Min-time       | Frontend → backend (`t0`)        | `now - t0 < 3000ms` → 422                                        |
| Rate-limit     | Backend (api.nice-advice.info)   | sha256(IP+secret). 5/min, 20/hour, 50/day → 429                  |
| GPT modercheck | Backend                          | gpt-5-nano классифицирует OK/FLAG/REJECT. REJECT блокирует.      |
| TG-уведомление | Backend → TG_BOT                 | FLAG → пост сохраняется + сообщение в `ADMIN_CHAT_ID`            |

Также, хотя бан не запланирован: пишем `ipHash` и `userAgent` в каждую
запись — на случай если понадобится массовый soft-ban или анализ.

---

## 12. Что **НЕ** делаем в v1 (YAGNI)

- ❌ Регистрация / аутентификация / OAuth
- ❌ Поиск по форуму (мало контента)
- ❌ Markdown / WYSIWYG (plain text + автолинки достаточно)
- ❌ Загрузка картинок в посты (вектор спама без модерации)
- ❌ Уведомления о новых ответах (нет аккаунтов → некуда слать)
- ❌ Edit / Delete своих постов (без auth ненадёжно; `editedAt` в схеме
  есть — оставляем для v2)
- ❌ Подписка на тред / RSS
- ❌ Multi-site UI (на v1 только hairstyles; компоненты пишем с `site`
  пропом, чтобы потом расширить без рефакторинга)
- ❌ Pagination внутри тредов (если >50 комментов — collapse "show more")
- ❌ Real-time через socket.io (socket.io-client уже в deps, но для
  форума не нужен на v1)

---

## 13. Порядок реализации (чтобы делать инкрементально)

### Фаза 1 — Read-only форум (1 день)

1. `forumAPI.ts` — функции `getThreads(site, category?, page, sort)`,
   `getThread(slug)`, `getComments(threadId)`
2. `Identicon.tsx` — переиспользовать palette/hash из `Comments.tsx`
3. `Forum.tsx` + `ForumCategory.tsx` + `Thread.tsx` — read-only вьюхи
4. `App.tsx` + `Header.tsx` — роуты + пункт меню
5. Smoke-test: открыть `/forum` локально (пока БД пустая — увидим empty
   states)

### Фаза 2 — Бот наполняет форум (1 день)

6. `functionsForum.js` — `seedPersonas` (запустить вручную один раз)
7. `genThread` + `genReply` — запустить вручную для проверки
8. Добавить cron в `ecosystem.config.js`
9. К концу дня — в Strapi должно быть ~5 тредов и ~10 ответов от ботов;
   на фронте `/forum` показывает живой контент

### Фаза 3 — Write от посетителей (1 день)

10. Backend: `forumRoutes.js` в `nice-advice/gc-gemini-generator` —
    эндпоинты `POST /forum/thread`, `/forum/reply`, `/forum/like`
11. Перенести rate-limit middleware (если есть для /comment) или
    написать новый, общий
12. GPT modercheck — переиспользовать ту же функцию что для /comment
13. Frontend: `NewThread.tsx`, `ReplyForm.tsx`, `LikeButton.tsx`
14. End-to-end тест с реальной формой

### Фаза 4 — Polish

15. Sitemap.xml — добавить роуты форума (vite-plugin-sitemap уже стоит)
16. SEO meta-теги на `Forum.tsx` и `Thread.tsx`
17. Empty / loading / error states
18. Mobile responsive чек (аудитория 50+ — крупный шрифт, hit-target ≥44px)

---

## 14. Открытые вопросы (если пользователь не подтвердил — использовать дефолты из §3)

1. Точный список 6 категорий — финальный?
2. Подключать сразу cholesterin / nice-advice или только hairstyles?
3. Какую модель использовать в GPT modercheck: gpt-5-nano (дефолт) или
   Gemini Flash (есть `GEMINI_API_KEY` в .env)?
4. Стилистика UI — match Comments.tsx (дефолт) или ближе к классическому
   форуму?
5. Сколько персон seed'ить на старте — 20 (дефолт) хватит?

---

## 15. Контрольный чек перед стартом следующей сессии

В начале работы:

```bash
# 1. Проверить, что Strapi жив и видит content types
curl -s "https://vivid-triumph-4386b82e17.strapiapp.com/api/discussion-threads" | head -c 300

# 2. Проверить .env с токеном
cat nice-advice/gc-gemini-generator/.env | grep STRAPI

# 3. Поднять фронт
cd hairstylesforseniors-client && npm run dev

# 4. Поднять backend (если нужно тестировать запись)
cd nice-advice/gc-gemini-generator && pm2 start ecosystem.config.js
```

Текущее состояние (на момент написания этого репорта):
- Strapi пустой по форуму (`total: 0`)
- Frontend форумного кода нет
- Backend форумных эндпоинтов нет
- Generator форумных функций нет
- Все content types в Strapi уже созданы и доступны

---

## 16. Связанные файлы для чтения

- `hairstylesforseniors-client/src/components/Comments.tsx` — паттерны
  identicon-аватара, localStorage имени, pagination, относительного
  времени. Переиспользовать!
- `hairstylesforseniors-client/src/components/Comments.css` — стили
  для матчинга
- `hairstylesforseniors-client/src/services/postsAPI.ts` — паттерн axios
  + populate-запросов к Strapi
- `nice-advice/gc-gemini-generator/server.js` — где подключать новые
  forum routes
- `nice-advice/gc-gemini-generator/functionsHairStyles.js` — паттерн
  работы с GPT/Gemini и Strapi для сайта hairstyles
