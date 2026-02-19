<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
# ai-asistent

---

## SmartBet AI — Backend API

ეს არის NestJS სერვერი, რომელიც Angular ფრონტს ემსახურება. მისი მიზანია Google-ის Gemini AI-სთან კომუნიკაცია და პასუხების real-time streaming.

### როგორ მუშაობს

```
Angular ფრონტი
      |
      | GET /ai/ask-stream?prompt=...&sessionId=...&mode=...
      |
   Controller  ←  DTO validation (prompt, sessionId, mode)
      |
   AiService
      |
      |── mode=games?    → GamesService-იდან JSON ჩამოტვირთვა + ფილტრაცია
      |── mode=navigate? → ისტორია არ გამოიყენება
      |── mode=sports?   → ჩვეულებრივი კითხვა
      |
   Gemini API  ←  სწორი prompt + კონფიგი + ისტორია
      |
      | stream chunks...
      |
Angular ფრონტი  ←  SSE (Server-Sent Events) real-time
```

### 3 რეჟიმი

**`sports` — default**
მომხმარებელი სვამს სპორტულ კითხვებს. AI არის ანალიტიკოსი, იყენებს Google Search-ს უახლესი ამბებისთვის. საუბრის ისტორია ინახება.

**`games` — დაგეგმილი თამაშები**
მომხმარებელი კითხვებს სვამს კონკრეტული მატჩების შესახებ. Backend:
1. `GAMES_API_URL`-იდან სრულ JSON-ს ჩამოტვირთავს
2. prompt-ის სიტყვებით ფილტრავს (მხოლოდ შესაბამისი თამაშები)
3. გაფილტრულ მონაცემებს prompt-ს წინ ამატებს და Gemini-ზე გზავნის

Google Search გამორთულია — პასუხი მხოლოდ მოწოდებული მონაცემებიდან.

**`navigate` — ნავიგაცია**
მომხმარებელი ითხოვს გვერდზე გადასვლას. AI აბრუნებს მხოლოდ JSON-ს:
```json
{"type":"navigate","path":"/sports"}
```
ფრონტი ამ JSON-ს კითხულობს და Angular Router-ით გადადის შესაბამის გვერდზე. ისტორია არ ინახება.

### ოპტიმიზაცია რეჟიმების მიხედვით

| | sports | games | navigate |
|---|---|---|---|
| temperature | 0.2 | 0.1 | 0.0 |
| maxTokens | 600 | 400 | 80 |
| Google Search | ✅ | ❌ | ❌ |
| ისტორია | ✅ | ✅ | ❌ |

### Session ისტორია

ყოველ მომხმარებელს აქვს უნიკალური `sessionId`. სერვერი მეხსიერებაში ინახავს თითოეული session-ის საუბრის ისტორიას, რათა AI-მ კონტექსტი იცოდეს. `games` mode-ში ისტორიაში JSON გარეშე ინახება მხოლოდ მომხმარებლის კითხვა — ტოკენების დაზოგვისთვის.

### Endpoints

| Method | Path | აღწერა |
|---|---|---|
| `GET` | `/ai/ask-stream` | SSE streaming — AI-ს პასუხი |
| `DELETE` | `/ai/history/:sessionId` | session-ის ისტორიის წაშლა |

### Environment Variables

| ცვლადი | აღწერა |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API გასაღები |
| `GAMES_API_URL` | გარე სპორტული API-ს URL |
| `CORS_ORIGIN` | დაშვებული origin(ები), მძიმით გამოყოფილი |
| `PORT` | სერვერის პორტი (default: 3000) |
