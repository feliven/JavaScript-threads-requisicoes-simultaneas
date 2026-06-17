const lista = document.getElementById("dolar");
export function exibeCotacao(nomeSingular, nomePlural, valor) {
    lista.textContent = "";
    for (let multiplicador = 1; multiplicador <= 1000; multiplicador *= 10) {
        const itemLista = document.createElement("li");
        const valorFormatado = (valor * multiplicador).toFixed(2);
        const nome = multiplicador === 1 ? nomeSingular : nomePlural;
        itemLista.textContent = `${multiplicador} ${nome}: R$ ${valorFormatado}`;
        lista.appendChild(itemLista);
    }
}
