# CRM da Garagem do Jota

App para gerir clientes, pedidos, orçamentos, marcações e serviços da
Garagem do Jota. Feita para usar principalmente no telemóvel.

A app já está toda construída. Falta só um passo para ficar a funcionar
a sério: ligá-la a um sítio onde os dados ficam guardados para sempre
(hoje ainda está a "apontar" para um sítio de testes que não existe).
Este documento é o guia, passo a passo, para fazeres isso quando
estiveres pronto — sem precisares de perceber nada de programação.

Não tens de fazer isto sozinho: quando estiveres pronto, diz-me e eu
vou-te guiando em tempo real por estes passos.

---

## Parte 1 — Criar o sítio onde os dados ficam guardados (Supabase)

1. Vai a [supabase.com](https://supabase.com) e cria uma conta gratuita
   (podes entrar com o teu Google, por exemplo).
2. Cria um **novo projeto**. Dá-lhe o nome "garagem-do-jota" e escolhe
   uma palavra-passe forte para a base de dados (guarda-a nas Notas do
   telemóvel — não é a mesma palavra-passe que vais usar para abrir a
   app).
3. Espera 1-2 minutos enquanto o Supabase prepara o projeto.
4. No menu da esquerda, vai a **SQL Editor**.
5. Abre o ficheiro `supabase/migrations/0001_init.sql` desta pasta,
   copia todo o conteúdo, cola no SQL Editor do Supabase e clica em
   **Run**. Isto cria automaticamente todas as tabelas (clientes,
   viaturas, pedidos, etc.).
6. No menu da esquerda, vai a **Table Editor** — devias ver ali as
   tabelas todas criadas. É aqui que podes, mais tarde, ver ou corrigir
   dados diretamente, à mão, como rede de segurança.
7. Vai a **Project Settings → API**. Vais precisar de copiar dois
   valores:
   - **Project URL** (algo como `https://xxxxx.supabase.co`)
   - **service_role key** (uma chave secreta longa — nunca a partilhes
     nem a coloques em sítios públicos)

## Parte 2 — Publicar a app (Vercel)

1. Vai a [vercel.com](https://vercel.com) e cria uma conta gratuita
   (o mais simples é entrar com a tua conta do GitHub).
2. Clica em **Add New → Project** e escolhe este repositório do
   GitHub.
3. Antes de clicar em "Deploy", abre **Environment Variables** e
   adiciona estas três:

   | Nome | Valor |
   |---|---|
   | `SUPABASE_URL` | o "Project URL" que copiaste no passo anterior |
   | `SUPABASE_SERVICE_ROLE_KEY` | a "service_role key" que copiaste |
   | `APP_PASSWORD` | a palavra-passe que queres usar para abrir a app no telemóvel (esta é diferente da palavra-passe da base de dados) |

4. Clica em **Deploy** e espera 1-2 minutos.
5. No final, a Vercel dá-te um link (algo como
   `garagem-do-jota.vercel.app`) — é esse o endereço da tua app.

## Parte 3 — Pôr a app no ecrã principal do iPhone

1. Abre o link da app no Safari do iPhone.
2. Introduz a palavra-passe (`APP_PASSWORD`) que definiste.
3. Toca no botão de partilhar (o quadrado com a seta a apontar para
   cima) na barra de baixo do Safari.
4. Escolhe **Adicionar ao Ecrã Principal**.
5. A partir daí passas a ter um ícone da app, como se fosse uma app
   normal — sem precisares de abrir o Safari.

---

## Como mudar preços mais tarde

Os preços "desde" de cada pacote e da limpeza de estofos não estão
escritos no código — estão numa tabela chamada `configuracoes_precos`,
visível e editável no **Table Editor** do Supabase. Basta abrir a
tabela, clicar no valor que queres mudar, escrever o novo valor e
guardar. A app usa sempre os valores mais recentes dessa tabela.

## Como mudar a palavra-passe da app mais tarde

Em **Vercel → o teu projeto → Settings → Environment Variables**,
edita o valor de `APP_PASSWORD` e volta a publicar (Vercel faz isso
automaticamente a seguir a guardares).

---

## Notas técnicas (para referência futura)

- Next.js (App Router) + Tailwind CSS, mobile-first.
- Base de dados: Postgres via Supabase. Todas as tabelas e regras
  estão em `supabase/migrations/0001_init.sql`.
- As regras de preço (Tecido/Alcântara sempre mais caro que
  Pele/Sintético; combo de 10€ só em Completo + estofos) vivem todas
  numa única função, em `lib/pricing.ts` — nenhum ecrã calcula preços
  por fora dela.
- Acesso protegido por palavra-passe única (`APP_PASSWORD`), sem
  contas de utilizador — ver `middleware.ts` e `lib/auth.ts`.
- Fotos de antes/depois ficam no Supabase Storage, no balde
  `fotos-servicos`.
- P1 por construir a seguir: dashboard de rentabilidade e lembretes de
  clientes a reativar.
