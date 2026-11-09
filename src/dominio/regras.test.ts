import { describe, expect, it } from 'vitest';
import { HOJE, PELICULA, PLACA, TELA, criarOS } from './fixtures';
import { validarImei } from './imei';
import { calcularOrcamento, validarDesconto } from './orcamento';
import { situacaoGarantia, situacaoOrcamento, situacaoPrazo, valorACobrar } from './prazos';
import { gerarCsv, gerarRelatorio } from './relatorio';
import { mudarStatus, proximoNumero, reemitirOrcamento } from './status';
import { validarFormulario } from './validacao';
import type { DadosFormularioOS, DadosFormularioServico, ServicoCatalogo } from '../tipos';
import { montarServico, validarServico } from './servicos';

describe('R1 - IMEI (algoritmo de Luhn)', () => {
  it('S01: aceita IMEI com dígito verificador correto', () => {
    expect(validarImei('490154203237518')).toBe(true);
  });
  it('S02: recusa IMEI com um dígito trocado ou tamanho errado', () => {
    expect(validarImei('490154203237519')).toBe(false);
    expect(validarImei('49015420323751')).toBe(false);
  });
});

describe('R2 - Orçamento e desconto máximo de 10%', () => {
  it('S03: tela R$ 350 + película R$ 30 com desconto de R$ 20 dá R$ 360', () => {
    const r = calcularOrcamento([TELA, PELICULA], 2000);
    expect(r.subtotal).toBe(38000);
    expect(r.total).toBe(36000);
  });
  it('S04: desconto de R$ 50 é recusado, R$ 38 é aceito', () => {
    expect(validarDesconto([TELA, PELICULA], 5000)).toEqual({
      ok: false,
      erro: 'Desconto máximo de 10% (R$ 38,00)',
    });
    expect(validarDesconto([TELA, PELICULA], 3800)).toEqual({ ok: true, valor: 3800 });
  });
});

describe('R3 - Validade do orçamento (7 dias)', () => {
  it('S05: emitido em 05/11 vale até 12/11, faltam 3 dias', () => {
    expect(situacaoOrcamento({ orcamentoEmitidoEm: '2026-11-05' }, HOJE)).toEqual({
      tipo: 'valido',
      validoAte: '2026-11-12',
      diasRestantes: 3,
    });
  });
  it('S06: emitido em 01/11 venceu em 08/11 e não pode ser aprovado', () => {
    const os = criarOS({ status: 'aguardando', itens: [TELA], orcamentoEmitidoEm: '2026-11-01' });
    expect(situacaoOrcamento(os, HOJE).tipo).toBe('vencido');
    expect(mudarStatus(os, 'reparo', HOJE)).toEqual({
      ok: false,
      erro: 'Orçamento vencido em 08/11/2026. Emita um novo orçamento.',
    });
    const reemitida = reemitirOrcamento(os, HOJE);
    expect(reemitida.ok && mudarStatus(reemitida.valor, 'reparo', HOJE).ok).toBe(true);
  });
});

describe('R4 - Prazo de entrega', () => {
  const os = criarOS({ status: 'reparo', itens: [TELA, PLACA], aprovadoEm: '2026-11-03' });
  it('S07: aprovada em 03/11 com prazo de 5 dias está 1 dia atrasada em 09/11', () => {
    expect(situacaoPrazo(os, HOJE)).toEqual({ tipo: 'atrasada', previsao: '2026-11-08', diasAtraso: 1 });
  });
  it('S08: a mesma OS já pronta não conta como atrasada', () => {
    expect(situacaoPrazo({ ...os, status: 'pronto' }, HOJE).tipo).toBe('concluida');
  });
});

describe('R5 - Garantia', () => {
  it('S09: entregue em 15/08 com 90 dias de garantia, faltam 4 dias', () => {
    const os = criarOS({ status: 'entregue', itens: [TELA, PELICULA], entregueEm: '2026-08-15' });
    expect(situacaoGarantia(os, HOJE)).toEqual({ tipo: 'ativa', validaAte: '2026-11-13', diasRestantes: 4 });
  });
  it('S10: entregue em 01/08 teve a garantia expirada em 30/10', () => {
    const os = criarOS({ status: 'entregue', itens: [TELA], entregueEm: '2026-08-01' });
    expect(situacaoGarantia(os, HOJE)).toEqual({ tipo: 'expirada', validaAte: '2026-10-30' });
  });
});

describe('R6 - Taxa de diagnóstico', () => {
  it('S11: orçamento aprovado cobra o total, sem taxa', () => {
    const os = criarOS({ status: 'entregue', itens: [TELA, PELICULA], descontoCentavos: 2000, aprovadoEm: '2026-11-02' });
    expect(valorACobrar(os)).toBe(36000);
  });
  it('S12: orçamento recusado cobra só R$ 30 de diagnóstico', () => {
    expect(valorACobrar(criarOS({ status: 'recusado', itens: [TELA] }))).toBe(3000);
  });
});

describe('R7 - Fluxo de status', () => {
  it('S13: não pula etapas', () => {
    expect(mudarStatus(criarOS(), 'pronto', HOJE)).toEqual({
      ok: false,
      erro: 'Transição inválida: Recebido → Pronto para retirada',
    });
  });
  it('S14: não emite orçamento vazio, e emitir grava a data de hoje', () => {
    const os = criarOS({ status: 'diagnostico' });
    expect(mudarStatus(os, 'aguardando', HOJE)).toEqual({
      ok: false,
      erro: 'Adicione pelo menos um serviço ao orçamento',
    });
    const r = mudarStatus({ ...os, itens: [TELA] }, 'aguardando', HOJE);
    expect(r.ok && r.valor.orcamentoEmitidoEm).toBe(HOJE);
    expect(r.ok && r.valor.historico.at(-1)).toEqual({ status: 'aguardando', data: HOJE });
    expect(os.historico).toHaveLength(1);
  });
  it('numera a próxima OS a partir do maior número', () => {
    expect(proximoNumero([])).toBe(1);
    expect(proximoNumero([{ numero: 3 }, { numero: 7 }, { numero: 5 }])).toBe(8);
  });
});

describe('R8 - Validação do cadastro', () => {
  const valido: DadosFormularioOS = {
    cliente: 'João Silva',
    telefone: '(99) 99123-4567',
    marca: 'Samsung',
    modelo: 'Galaxy A54',
    imei: '490154203237518',
    defeito: 'Não carrega a bateria',
    dataEntrada: HOJE,
  };
  it('S15: aceita um cadastro correto', () => {
    expect(validarFormulario(valido, [], null, HOJE)).toEqual({});
  });
  it('S16: aponta o erro de cada campo', () => {
    const erros = validarFormulario(
      { ...valido, cliente: 'Jo', telefone: '999123', imei: '490154203237519', dataEntrada: '2026-11-10' },
      [],
      null,
      HOJE,
    );
    expect(Object.keys(erros)).toEqual(['cliente', 'telefone', 'imei', 'dataEntrada']);
    expect(erros.imei).toBe('IMEI inválido: o dígito verificador não confere');
  });
  it('S17: recusa segunda OS aberta para o mesmo IMEI, mas aceita se a anterior foi entregue', () => {
    const aberta = criarOS({ numero: 4, status: 'reparo' });
    expect(validarFormulario(valido, [aberta], null, HOJE).imei).toBe('Este aparelho já tem uma OS aberta (OS #4)');
    expect(validarFormulario(valido, [{ ...aberta, status: 'entregue' }], null, HOJE)).toEqual({});
    expect(validarFormulario(valido, [aberta], aberta.id, HOJE)).toEqual({});
  });
});

describe('R9 - Relatório', () => {
  const ordens = [
    criarOS({ id: 'a', numero: 1, status: 'entregue', itens: [TELA, PELICULA], descontoCentavos: 2000, aprovadoEm: '2026-11-02', entregueEm: '2026-11-04' }),
    criarOS({ id: 'b', numero: 2, status: 'entregue', itens: [TELA], aprovadoEm: '2026-11-02', entregueEm: '2026-11-05' }),
    criarOS({ id: 'c', numero: 3, status: 'devolvido', itens: [PLACA] }),
    criarOS({ id: 'd', numero: 4, status: 'reparo', itens: [PLACA], aprovadoEm: '2026-11-01' }),
  ];
  it('S18: faturamento, ticket médio, aprovação e atrasos', () => {
    const r = gerarRelatorio(ordens, HOJE);
    expect(r.faturamento).toBe(36000 + 35000 + 3000);
    expect(r.ticketMedio).toBe(35500);
    expect(r.taxaAprovacao).toBe(75);
    expect(r.atrasadas).toBe(1);
    expect(r.servicosMaisFeitos[0]).toEqual({ nome: 'Troca de tela iPhone 11', quantidade: 2 });
  });
  it('gera CSV com cabeçalho e uma linha por OS', () => {
    const linhas = gerarCsv(ordens).split('\n');
    expect(linhas[0]).toBe('OS;Entrada;Cliente;Aparelho;Status;Total');
    expect(linhas[1]).toBe('1;01/11/2026;Maria Souza;Apple iPhone 11;Entregue;R$ 360,00');
    expect(linhas).toHaveLength(5);
  });
});

describe('R8 - IMEI opcional', () => {
  it('aceita cadastro sem IMEI, mas confere o IMEI quando digitado', () => {
    const dados: DadosFormularioOS = {
      cliente: 'Ana Lima', telefone: '99987654321', marca: 'Motorola', modelo: 'Moto G54',
      imei: '', defeito: 'Não liga depois da queda', dataEntrada: HOJE,
    };
    expect(validarFormulario(dados, [criarOS({ imei: '', status: 'reparo' })], null, HOJE)).toEqual({});
    expect(validarFormulario({ ...dados, imei: '123' }, [], null, HOJE).imei).toBe('IMEI deve ter 15 dígitos (disque *#06# no aparelho)');
  });
});

describe('R10 - Cadastro de serviço', () => {
  const dados: DadosFormularioServico = { nome: 'Troca de tela iPhone 12', categoria: 'tela', preco: '450,00', prazoDias: '2', garantiaDias: '90', descricao: '' };
  const catalogo: ServicoCatalogo[] = [{ id: 'tela-ip11', nome: 'Troca de tela iPhone 11', categoria: 'tela', precoCentavos: 35000, prazoDias: 2, garantiaDias: 90, descricao: '' }];

  it('aceita um serviço válido e monta com o preço em centavos', () => {
    expect(validarServico(dados, catalogo)).toEqual({});
    expect(montarServico(dados, 'x')).toMatchObject({ precoCentavos: 45000, prazoDias: 2, garantiaDias: 90, proprio: true });
  });

  it('recusa nome repetido (sem diferenciar maiúsculas), preço zero e prazo fora do limite', () => {
    const erros = validarServico({ ...dados, nome: 'troca de tela IPHONE 11', preco: '0', prazoDias: '90' }, catalogo);
    expect(erros).toEqual({
      nome: 'Já existe um serviço com esse nome',
      preco: 'Informe um preço maior que zero, como 120,00',
      prazoDias: 'Prazo em dias inteiros, de 0 a 60',
    });
  });
});
