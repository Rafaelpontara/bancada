import type { DadosFormularioOS, DataISO, ErrosFormulario, OrdemServico } from '../tipos';
import { ehDataValida, diasEntre } from './datas';
import { validarImei } from './imei';
import { estaAberta } from './status';

// por enquanto o IMEI é opcional; para exigir, trocar para true
export const IMEI_OBRIGATORIO = false;

export function somenteDigitos(texto: string): string {
  return texto.replace(/\D/g, '');
}

export function validarFormulario(
  dados: DadosFormularioOS,
  ordens: OrdemServico[],
  idAtual: string | null,
  hoje: DataISO,
): ErrosFormulario {
  const erros: ErrosFormulario = {};

  if (dados.cliente.trim().length < 3) {
    erros.cliente = 'Informe o nome com pelo menos 3 letras';
  }

  const telefone = somenteDigitos(dados.telefone);
  if (telefone.length < 10 || telefone.length > 11) {
    erros.telefone = 'Telefone deve ter 10 ou 11 dígitos, com DDD';
  }

  if (dados.marca.trim() === '') erros.marca = 'Informe a marca';
  if (dados.modelo.trim() === '') erros.modelo = 'Informe o modelo';

  const imei = somenteDigitos(dados.imei);
  if (imei === '') {
    if (IMEI_OBRIGATORIO) erros.imei = 'Informe o IMEI (disque *#06# no aparelho)';
  } else if (imei.length !== 15) {
    erros.imei = 'IMEI deve ter 15 dígitos (disque *#06# no aparelho)';
  } else if (!validarImei(imei)) {
    erros.imei = 'IMEI inválido: o dígito verificador não confere';
  } else {
    const duplicada = ordens.find((os) => os.id !== idAtual && os.imei === imei && estaAberta(os.status));
    if (duplicada) {
      erros.imei = `Este aparelho já tem uma OS aberta (OS #${duplicada.numero})`;
    }
  }

  if (dados.defeito.trim().length < 10) {
    erros.defeito = 'Descreva o defeito com pelo menos 10 caracteres';
  }

  if (!ehDataValida(dados.dataEntrada)) {
    erros.dataEntrada = 'Informe uma data válida';
  } else if (diasEntre(hoje, dados.dataEntrada) > 0) {
    erros.dataEntrada = 'A data de entrada não pode ser futura';
  }

  return erros;
}
