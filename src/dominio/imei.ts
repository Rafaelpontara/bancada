// algoritmo de Luhn: da direita pra esquerda, dobra um digito sim e um nao
export function validarImei(imei: string): boolean {
  if (!/^\d{15}$/.test(imei)) return false;

  let soma = 0;
  for (let i = 0; i < 15; i++) {
    let digito = Number(imei[14 - i]);
    if (i % 2 === 1) {
      digito *= 2;
      if (digito > 9) digito -= 9;
    }
    soma += digito;
  }
  return soma % 10 === 0;
}
