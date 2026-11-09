# Proposta de tema livre

**Equipe:** Rafael Rodrigues Pontara e Marcos Antonio Cirqueira

## 1. Nome da aplicação

Bancada: ordens de serviço para assistência técnica de celulares.

## 2. Problema

Quem usa: o técnico e o atendente de uma assistência técnica de celulares (como as lojas de conserto de Balsas).

Problema: cada aparelho que chega passa por diagnóstico, orçamento, aprovação do cliente, reparo e entrega, e depois ainda tem garantia. Hoje isso é controlado em papel (a "via da OS" grampeada no aparelho) ou em conversas de WhatsApp. O técnico não sabe quais aparelhos estão atrasados, o orçamento passado há duas semanas é aprovado com o preço antigo, a garantia é conferida "de cabeça" e o mesmo aparelho às vezes ganha duas OS.

A aplicação organiza o fluxo inteiro e calcula automaticamente prazos, validade do orçamento, garantia e o que cobrar.

## 3. Telas

| Rota | Tela | O que mostra |
| --- | --- | --- |
| `/` | Painel | Indicadores e as OS que precisam de atenção (atrasadas, orçamento vencido, prontas para retirada) |
| `/ordens` | Lista | Ordens em cartões, com busca e filtro por status |
| `/ordens/nova` | Cadastro | Formulário da OS: cliente, telefone, marca, modelo, IMEI, defeito e data de entrada |
| `/ordens/:id` | Detalhe | Dados, orçamento, botões do fluxo de status, situação de prazo/garantia e histórico |
| `/ordens/:id/editar` | Edição | Formulário preenchido e exclusão com confirmação |
| `/servicos` | Catálogo | Serviços com preço, prazo e garantia, carregados por `fetch` |
| `/servicos/novo` | Novo serviço | Cadastro de serviço próprio da loja no catálogo |
| `/relatorio` | Relatório | Faturamento, ticket médio, taxa de aprovação, atrasadas e serviços mais feitos |

## 4. Entidades

```ts
type StatusOS = 'recebido' | 'diagnostico' | 'aguardando' | 'reparo'
              | 'pronto' | 'entregue' | 'recusado' | 'devolvido';

type CategoriaServico = 'tela' | 'bateria' | 'conector' | 'camera' | 'software' | 'placa';

interface ServicoCatalogo {
  id: string;
  nome: string;
  categoria: CategoriaServico;
  precoCentavos: number;
  prazoDias: number;
  garantiaDias: number;
  descricao: string;
}

interface ItemOrcamento {
  servicoId: string;
  nome: string;
  precoCentavos: number;
  prazoDias: number;
  garantiaDias: number;
}

interface OrdemServico {          // cadastro completo: criar, listar, ver, editar e excluir
  id: string;
  numero: number;                 // sequencial
  cliente: string;
  telefone: string;
  marca: string;
  modelo: string;
  imei: string;
  defeito: string;
  dataEntrada: string;            // 'AAAA-MM-DD'
  itens: ItemOrcamento[];
  descontoCentavos: number;
  orcamentoEmitidoEm: string | null;
  aprovadoEm: string | null;
  entregueEm: string | null;
  status: StatusOS;
  historico: { status: StatusOS; data: string }[];
}
```

## 5. Regras de negócio

| Regra | Exemplo de entrada | Resultado esperado |
| --- | --- | --- |
| R1. O IMEI é opcional; quando informado, tem 15 dígitos e o último confere pelo algoritmo de Luhn | `490154203237519` | Recusado: *IMEI inválido* (o correto é `...518`) |
| R2. O desconto é de no máximo 10% do subtotal | Tela R$ 350 + película R$ 30, desconto R$ 50 | Recusado: *Desconto máximo de 10% (R$ 38,00)*. Com R$ 20, total R$ 360,00 |
| R3. O orçamento vale 7 dias; vencido não pode ser aprovado | Emitido em 01/11/2026, aprovação em 09/11/2026 | Recusado: *Orçamento vencido em 08/11/2026* |
| R4. Previsão de entrega = aprovação + prazo do serviço mais demorado | Aprovada em 03/11, serviços de 2 e 5 dias, hoje 09/11 | Previsão 08/11/2026, *Atrasada 1 dia* |
| R5. A garantia conta da entrega, pela maior garantia dos serviços | Entregue em 15/08/2026, garantia de 90 dias, hoje 09/11 | Em garantia até 13/11/2026, faltam 4 dias |
| R6. Orçamento recusado cobra taxa de diagnóstico de R$ 30; aprovado não cobra a taxa | Orçamento de R$ 360 recusado | Valor a cobrar R$ 30,00 |
| R7. A OS segue o fluxo Recebido → Diagnóstico → Aguardando → Reparo → Pronto → Entregue (ou Recusado → Devolvido), sem pular etapas | Recebido direto para Pronto | Recusado: *Transição inválida* |
| R8. Um aparelho (IMEI) só pode ter uma OS aberta | Nova OS com IMEI que está em reparo na OS #4 | Recusado: *Este aparelho já tem uma OS aberta (OS #4)* |

## 6. Fonte de dados

JSON próprio em `public/dados/servicos.json`, carregado por `fetch` (tabela de serviços da loja). Exemplo:

```json
[
  {
    "id": "tela-ip11",
    "nome": "Troca de tela iPhone 11",
    "categoria": "tela",
    "precoCentavos": 35000,
    "prazoDias": 2,
    "garantiaDias": 90,
    "descricao": "Display LCD compatível, com aplicação de vedação."
  }
]
```

As ordens de serviço ficam no Context e persistem no `localStorage`.

## 7. Divisão do trabalho

| Integrante | Parte |
| --- | --- |
| Rafael Rodrigues Pontara | Tipos, regras de negócio e testes; Context, serviço do catálogo e persistência; publicação |
| Marcos Antonio Cirqueira | Telas de lista, cadastro, detalhe, edição, catálogo e relatório; componentes, layout, responsividade e acessibilidade |
