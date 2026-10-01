# Núcleo Dra. Renata Bogéa — site

Landing page estática (HTML, CSS e JS, sem build) publicada no GitHub Pages.

## Estrutura

```
index.html            página única (SEO, schema.org e FAQ incluídos)
assets/css/style.css  sistema visual e responsivo
assets/js/main.js     interações, animações e formulário
assets/img, equipe    fotos otimizadas
assets/video          vídeo vertical do hero
assets/brand          logo, monograma e ícones
```

## Ajustes comuns

- **WhatsApp da clínica:** `CLINICA_WHATSAPP` em `assets/js/main.js`.
- **E-mail de agendamento (opcional):** publique o backend e preencha `AGENDA_API` em `assets/js/main.js`. Sem ele, o formulário envia a solicitação pelo WhatsApp.
- **Domínio próprio:** troque `https://meirelesth.github.io/Renata-Bogea/` em `index.html`, `robots.txt` e `sitemap.xml`, e crie o arquivo `CNAME`.
- **CRM:** a publicidade médica (CFM) exige nome e CRM da responsável técnica. Há um comentário no rodapé de `index.html` indicando onde inserir.

## Rodar localmente

```
python -m http.server 8000
```

Depois abra http://localhost:8000.
