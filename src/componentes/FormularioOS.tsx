import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { IMEI_OBRIGATORIO, validarFormulario } from '../dominio/validacao';
import { useOrdens } from '../hooks/useOrdens';
import type { DadosFormularioOS, ErrosFormulario } from '../tipos';
import { CampoFormulario } from './CampoFormulario';
import { descricaoDoCampo } from './descricaoDoCampo';

interface FormularioOSProps {
  inicial: DadosFormularioOS;
  idAtual: string | null;
  textoBotao: string;
  onSalvar: (dados: DadosFormularioOS) => void;
}

const ORDEM: (keyof DadosFormularioOS)[] = ['cliente', 'telefone', 'marca', 'modelo', 'imei', 'defeito', 'dataEntrada'];

const MARCAS = ['Apple', 'Samsung', 'Motorola', 'Xiaomi', 'Realme', 'LG', 'Outra'];

export function FormularioOS({ inicial, idAtual, textoBotao, onSalvar }: FormularioOSProps) {
  const { ordens, hoje } = useOrdens();
  const [dados, setDados] = useState<DadosFormularioOS>(inicial);
  const [tentouEnviar, setTentouEnviar] = useState(false);
  const refs = useRef<Partial<Record<keyof DadosFormularioOS, HTMLElement | null>>>({});

  const todosErros: ErrosFormulario = validarFormulario(dados, ordens, idAtual, hoje);
  const erroVisivel = (campo: keyof DadosFormularioOS) => (tentouEnviar ? todosErros[campo] : undefined);

  function alterar(campo: keyof DadosFormularioOS, valor: string) {
    setDados((atual) => ({ ...atual, [campo]: valor }));
  }

  function enviar(evento: FormEvent) {
    evento.preventDefault();
    setTentouEnviar(true);
    const primeiroInvalido = ORDEM.find((campo) => todosErros[campo]);
    if (primeiroInvalido) {
      refs.current[primeiroInvalido]?.focus();
      return;
    }
    onSalvar(dados);
  }

  const props = (campo: keyof DadosFormularioOS, dica?: string) => ({
    id: `campo-${campo}`,
    name: campo,
    value: dados[campo],
    onChange: (e: { target: { value: string } }) => alterar(campo, e.target.value),
    'aria-invalid': Boolean(erroVisivel(campo)),
    'aria-describedby': descricaoDoCampo(`campo-${campo}`, erroVisivel(campo), dica),
    ref: (el: HTMLElement | null) => {
      refs.current[campo] = el;
    },
  });

  const dicaImei = 'Disque *#06# no aparelho para ver o IMEI';

  return (
    <form className="formulario" onSubmit={enviar} noValidate>
      <fieldset className="formulario__grupo">
        <legend>Cliente</legend>
        <CampoFormulario id="campo-cliente" rotulo="Nome do cliente" erro={erroVisivel('cliente')}>
          <input className="entrada" autoComplete="name" {...props('cliente')} />
        </CampoFormulario>
        <CampoFormulario id="campo-telefone" rotulo="Telefone (WhatsApp)" erro={erroVisivel('telefone')} dica="Com DDD, ex.: (99) 99123-4567">
          <input className="entrada" type="tel" inputMode="tel" autoComplete="tel" {...props('telefone', 'Com DDD')} />
        </CampoFormulario>
      </fieldset>

      <fieldset className="formulario__grupo">
        <legend>Aparelho</legend>
        <div className="formulario__linha">
          <CampoFormulario id="campo-marca" rotulo="Marca" erro={erroVisivel('marca')}>
            <select className="entrada" {...props('marca')}>
              <option value="">Selecione</option>
              {MARCAS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </CampoFormulario>
          <CampoFormulario id="campo-modelo" rotulo="Modelo" erro={erroVisivel('modelo')}>
            <input className="entrada" placeholder="ex.: iPhone 11" {...props('modelo')} />
          </CampoFormulario>
        </div>
        <CampoFormulario id="campo-imei" rotulo={IMEI_OBRIGATORIO ? 'IMEI' : 'IMEI (opcional)'} erro={erroVisivel('imei')} dica={dicaImei}>
          <input className="entrada entrada--mono" inputMode="numeric" maxLength={17} {...props('imei', dicaImei)} />
        </CampoFormulario>
        <CampoFormulario id="campo-defeito" rotulo="Defeito relatado" erro={erroVisivel('defeito')}>
          <textarea className="entrada" rows={3} {...props('defeito')} />
        </CampoFormulario>
        <CampoFormulario id="campo-dataEntrada" rotulo="Data de entrada" erro={erroVisivel('dataEntrada')}>
          <input className="entrada" type="date" max={hoje} {...props('dataEntrada')} />
        </CampoFormulario>
      </fieldset>

      <div className="formulario__acoes">
        <button type="submit" className="botao botao--primario">
          {textoBotao}
        </button>
      </div>
    </form>
  );
}
