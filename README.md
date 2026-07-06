# PDV Fuzzy Logic — Bonificação Dinâmica com Lógica Fuzzy

MVP em React Native que simula um PDV (ponto de venda) onde a taxa de **cashback**
concedida ao cliente é calculada dinamicamente por um **motor de inferência fuzzy
(Mamdani)**, em vez de regras fixas de desconto.

> Projeto acadêmico — UTFPR, disciplina de Sistemas Inteligentes Aplicados.

## Ideia

Programas de fidelidade tradicionais usam faixas fixas ("gastou R$100, ganha 5%").
Esse MVP demonstra como a lógica fuzzy permite uma bonificação mais suave e
contextual, combinando duas variáveis do cliente/compra:

- **Valor do ticket** (R$ gasto no carrinho)
- **Engajamento do cliente** (score sintético de 0 a 100)

para produzir uma **taxa de cashback (%)** que reflete o quão fortemente a compra
se encaixa em cada perfil, em vez de saltar abruptamente entre faixas.

## Como funciona o motor fuzzy

Implementado em `src/fuzzy/`, seguindo o pipeline clássico de inferência Mamdani:

1. **Fuzzificação** (`sets.ts`) — cada variável de entrada é mapeada em conjuntos
   linguísticos via funções de pertinência triangulares/trapezoidais
   (`membershipFunctions.ts`):
   - Ticket: `baixo`, `medio`, `alto`
   - Engajamento: `iniciante`, `frequente`, `vip`
   - Saída (cashback): `minimo`, `padrao`, `premium`
2. **Base de regras** (`rules.ts`) — matriz 3x3 (Ticket × Engajamento → Cashback),
   por exemplo `Alto + VIP → Premium` e `Médio + Frequente → Padrão`.
3. **Inferência e agregação** (`inference.ts`) — cada regra é avaliada com
   T-norma mínimo (força da regra = `min` das pertinências de entrada) e as
   regras que apontam para a mesma saída são combinadas com S-norma máximo.
4. **Defuzzificação** — método do centroide sobre o domínio de saída (0–10%),
   retornando a taxa final de cashback aplicada ao valor do carrinho.

O hook `useFuzzyCashback.ts` conecta esse motor (funções puras) ao ciclo de
renderização do React, recalculando apenas quando ticket ou engajamento mudam.

## App

- **Catálogo** (`CatalogScreen`) — lista de produtos mockados, permite montar um
  carrinho.
- **Carrinho** (`CartScreen`) — mostra os itens, permite escolher/simular o
  perfil do cliente (via botões de perfil pré-definidos ou um slider de
  engajamento) e exibe em tempo real:
  - o grau de pertinência do ticket e do engajamento em cada conjunto fuzzy;
  - quais regras foram ativadas e com que força;
  - a taxa de cashback resultante e o valor final em reais.

Dados mockados em `src/data/products.ts` e `src/data/customers.ts`.

## Stack

- React Native 0.86 + React 19, TypeScript
- `@react-native-community/slider` para o controle de engajamento
- `react-native-safe-area-context`
- Jest para testes do motor fuzzy (`src/fuzzy/*.test.ts`)

## Rodando o projeto

> Siga primeiro o guia [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment)
> do React Native.

Instale as dependências:

```sh
npm install
```

Inicie o Metro:

```sh
npm start
```

Em outro terminal, rode no Android ou iOS:

```sh
npm run android
# ou
npm run ios
```

Para iOS, instale as dependências nativas antes do primeiro build:

```sh
bundle install
bundle exec pod install
```

### Testes e lint

```sh
npm test
npm run lint
```

## Estrutura

```
src/
  data/            produtos e perfis de clientes mockados
  fuzzy/           motor de inferência fuzzy (sets, regras, inferência, hook)
  screens/         telas de Catálogo e Carrinho
  types.ts         tipos e helpers do carrinho
```
