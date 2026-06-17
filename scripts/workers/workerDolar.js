const enderecoApi = "https://economia.awesomeapi.com.br/last/USD-BRL";
const intervalo = 3000;
async function carregarCotacoes() {
    try {
        const respostaApi = await fetch(enderecoApi);
        const dados = (await respostaApi.json());
        postMessage(dados.USDBRL);
    }
    catch (error) {
        console.error("ERRO:", error);
    }
}
addEventListener("message", () => {
    carregarCotacoes();
    setInterval(() => {
        carregarCotacoes();
    }, intervalo);
});
export {};
