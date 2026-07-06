# MVP: Motor Fuzzy para Bonificação Dinâmica em Programas de Fidelidade e Cashback

**Contexto do projeto**: UTFPR - Sistemas Inteligentes Aplicados. Documento de referência: `atividade_sistemas_inteligentes.pdf` (Carlos Kvasir, David Marlon Pereira). O documento define o problema (cashback fixo/booleano é injusto e não cruza variáveis), a abordagem (Lógica Fuzzy, modelo Mamdani, defuzzificação por centroide) e um plano de UI web em React com sliders. Esta spec adapta esse plano para **React Native (mobile)**, com uma UI de vendas (catálogo + carrinho) usando produtos mockados, para servir como MVP de apresentação.

## Objetivo

Demonstrar, ao vivo, como a lógica fuzzy substitui regras rígidas de cashback por um cálculo suave e explicável, cruzando **valor do ticket** e **engajamento do cliente**.

## 1. Modelo Fuzzy (Mamdani)

### 1.1 Variável de entrada: Valor do Ticket (R$)

Domínio: R$ 0 a R$ 600 (teto usado apenas para desenhar a função `Alto`, que na prática é ilimitada).

| Conjunto | Forma | Pontos (a, b, c, d) | Significado |
|---|---|---|---|
| Baixo | Trapézio | (0, 0, 50, 100) | Pertinência 1.0 até R$50, cai a 0 em R$100 |
| Médio | Triângulo | (50, 150, 250) | Pertinência 0 em R$50, pico 1.0 em R$150, 0 em R$250 |
| Alto | Trapézio | (150, 250, 600, 600) | Sobe a partir de R$150, pertinência 1.0 a partir de R$250 |

Isso é fiel ao documento (Baixo 0-100, Médio 50-250, Alto acima de 200) com sobreposição suave nas fronteiras R$50-100 e R$150-250.

### 1.2 Variável de entrada: Engajamento do Cliente (score 0-100)

O documento não define uma escala numérica (apenas os rótulos Iniciante/Frequente/VIP baseados em "histórico de uso"). Definimos um score sintético 0-100 para fins de MVP:

| Conjunto | Forma | Pontos | Significado |
|---|---|---|---|
| Iniciante | Trapézio | (0, 0, 20, 50) | Cliente novo/pouco histórico |
| Frequente | Triângulo | (20, 50, 80) | Cliente com uso recorrente |
| VIP | Trapézio | (50, 80, 100, 100) | Cliente de altíssimo engajamento |

Perfis mockados (score fixo, usado como ponto de partida do slider):
- João (Cliente Novo): score 10
- Maria (Cliente Frequente): score 55
- Carlos (Cliente VIP): score 90

### 1.3 Variável de saída: Taxa de Cashback (%)

| Conjunto | Forma | Pontos | Faixa aproximada |
|---|---|---|---|
| Mínimo | Trapézio | (0, 0, 1, 2.5) | 1% a 2% |
| Padrão | Triângulo | (2, 4, 6) | 3% a 5% |
| Premium | Trapézio | (5, 7, 10, 10) | 6% a 10% |

### 1.4 Base de regras (matriz completa 3×3 = 9 regras)

| Ticket \ Engajamento | Iniciante | Frequente | VIP |
|---|---|---|---|
| **Baixo** | Mínimo | Mínimo | Padrão |
| **Médio** | Mínimo | Padrão | Premium |
| **Alto** | Padrão | Premium | Premium |

As 3 regras citadas explicitamente no documento (Médio+Frequente→Padrão, Alto+VIP→Premium, Alto+Iniciante→Padrão) são um subconjunto desta matriz.

### 1.5 Pipeline de inferência

1. **Fuzzificação**: para o ticket e o engajamento numéricos, calcular o grau de pertinência em cada um dos 3 conjuntos linguísticos correspondentes (0 a 1).
2. **Inferência (Min-Max)**: para cada uma das 9 regras, calcular a força de ativação = `min(pertinência do antecedente 1, pertinência do antecedente 2)` (T-norma mínimo / AND). Regras com força 0 são descartadas do resultado exibido na UI.
3. **Agregação**: para cada conjunto de saída (Mínimo/Padrão/Premium), agregar as forças de todas as regras que apontam para ele usando `max` (S-norma).
4. **Defuzzificação (Centroide)**: discretizar o domínio de saída (0 a 10%, passo pequeno, ex: 0.1), truncar a função de pertinência de cada conjunto de saída pela força agregada, unir (`max` pontual) as três formas truncadas, e calcular o centroide (centro de gravidade) da área resultante. Esse valor é a taxa final de cashback.

### 1.6 Dados expostos para o painel didático

A função de inferência retorna, além da taxa final, os graus intermediários:
```ts
{
  ticketMemberships: { baixo: number; medio: number; alto: number };
  engagementMemberships: { iniciante: number; frequente: number; vip: number };
  activatedRules: Array<{ ticketSet, engagementSet, outputSet, strength: number }>; // strength > 0
  cashbackRate: number; // % final, resultado do centroide
}
```

## 2. Arquitetura do App (React Native, bare, TypeScript)

Projeto já scaffolded em `mvpFuzzy/` (RN 0.86, TS). Sem `react-navigation` — troca de tela via estado local em `App.tsx`, para evitar dependências nativas extras num MVP.

```
src/
  fuzzy/
    membershipFunctions.ts   # trapezoid(x,a,b,c,d), triangle(x,a,b,c) — funções puras
    sets.ts                  # definição dos 3 conjuntos de Ticket, Engajamento e Cashback
    rules.ts                 # matriz de 9 regras
    inference.ts             # fuzzificação + Min-Max + agregação + centroide
    useFuzzyCashback.ts       # hook (useMemo) ligando o motor ao estado da UI
  data/
    products.ts               # produtos mockados
    customers.ts              # perfis mockados
  screens/
    CatalogScreen.tsx
    CartScreen.tsx
  App.tsx                      # estado do carrinho + navegação entre telas
```

Estado do carrinho (`{ product, quantity }[]`) vive em `App.tsx`, passado por props — sem Redux/Context (escopo pequeno, 2 telas).

## 3. Dados Mockados

**Produtos** (preços calibrados para cobrir as 3 faixas de ticket sozinhos ou combinados):
- 🎧 Fone de Ouvido — R$ 39,90 (cai em "Baixo")
- 👟 Tênis Esportivo — R$ 149,90 (cai em "Médio")
- 💻 Notebook — R$ 349,90 (cai em "Alto")

**Clientes** (perfis com score de engajamento fixo, editável via slider):
- João, Cliente Novo — score 10 (Iniciante)
- Maria, Cliente Frequente — score 55 (Frequente)
- Carlos, Cliente VIP — score 90 (VIP)

## 4. Telas

### CatalogScreen
Lista os 3 produtos com botão de adicionar ao carrinho (incrementa quantidade). Barra flutuante inferior aparece quando o carrinho não está vazio, mostrando contagem de itens, subtotal, e botão "Ver Carrinho".

### CartScreen
- Lista de itens do carrinho com controles de quantidade (+/-) e remoção.
- Total do ticket calculado automaticamente.
- Seletor de cliente mockado (3 botões: João/Maria/Carlos) que preenche o score de engajamento.
- Slider de engajamento (0-100), ajustável livremente após selecionar o perfil.
- Painel didático "Como o Fuzzy calculou": pertinências do ticket e do engajamento, lista de regras ativadas com sua força, e o resultado final (taxa de cashback % + valor em R$).
- Recalcula tudo em tempo real via `useMemo` (sem debounce).

## 5. Estratégia de Testes

TDD (Jest, já configurado) para o motor fuzzy — é o núcleo avaliado na apresentação:
- `membershipFunctions.test.ts`: valores de fronteira e interiores dos trapézios/triângulos (0, nos vértices, entre vértices, fora do domínio).
- `inference.test.ts`: casos das 3 regras citadas no documento + casos de fronteira do ticket (R$100, R$200) e do engajamento (score 20, 50, 80) + verificação de que o centroide fica dentro da faixa esperada do conjunto de saída dominante.

UI (telas) verificada manualmente rodando o app — sem necessidade de testes automatizados de componente para este MVP.

## 6. Fora de escopo

- Persistência (AsyncStorage, backend, API).
- Navegação com `react-navigation` ou deep linking.
- Autenticação de cliente real (perfis são mockados).
- Internacionalização (só português/BRL).
