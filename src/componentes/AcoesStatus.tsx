import { useState } from 'react';
import { situacaoOrcamento } from '../dominio/prazos';
import { TRANSICOES } from '../dominio/status';
import { useOrdens } from '../hooks/useOrdens';
import type { OrdemServico, Resultado, StatusOS } from '../tipos';

interface AcoesStatusProps {
  os: OrdemServico;
}

const TEXTO_ACAO: Record<StatusOS, string> = {
  recebido: '',
  diagnostico: 'Iniciar diagnóstico',
  aguardando: 'Emitir orçamento',
  reparo: 'Cliente aprovou',
  recusado: 'Cliente recusou',
  pronto: 'Marcar como pronto',
  entregue: 'Registrar entrega',
  devolvido: 'Devolver aparelho',
};

export function AcoesStatus({ os }: AcoesStatusProps) {
  const { mudarStatus, reemitirOrcamento, hoje } = useOrdens();
  const [mensagem, setMensagem] = useState<{ tipo: 'erro' | 'ok'; texto: string }>();
  const proximos = TRANSICOES[os.status];
  const vencido = os.status === 'aguardando' && situacaoOrcamento(os, hoje).tipo === 'vencido';

  function tratar(r: Resultado<OrdemServico>, sucesso: string) {
    setMensagem(r.ok ? { tipo: 'ok', texto: sucesso } : { tipo: 'erro', texto: r.erro });
  }

  if (proximos.length === 0) {
    return <p className="texto-fraco">Esta OS está encerrada.</p>;
  }

  return (
    <div className="acoes-status">
      <div className="acoes-status__botoes">
        {proximos.map((destino) => (
          <button
            key={destino}
            type="button"
            className={`botao ${destino === 'recusado' ? 'botao--perigo-leve' : 'botao--primario'}`}
            onClick={() => tratar(mudarStatus(os.id, destino), `Status atualizado: ${TEXTO_ACAO[destino]}.`)}
          >
            {TEXTO_ACAO[destino]}
          </button>
        ))}
        {vencido && (
          <button type="button" className="botao" onClick={() => tratar(reemitirOrcamento(os.id), 'Orçamento reemitido: vale por mais 7 dias.')}>
            Reemitir orçamento
          </button>
        )}
      </div>
      {mensagem && (
        <p className={mensagem.tipo === 'erro' ? 'texto-erro' : 'texto-sucesso'} role={mensagem.tipo === 'erro' ? 'alert' : 'status'}>
          {mensagem.texto}
        </p>
      )}
    </div>
  );
}
