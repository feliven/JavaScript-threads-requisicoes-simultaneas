import { exibeCotacao } from "./exibeCotacao.js";
const elemGraficoDolar = document.getElementById("graficoDolar");
const enderecoApi = "https://economia.awesomeapi.com.br/last/USD-BRL";
class Cotacoes {
    bid = 0;
    ask = 0;
    nomeMoedas = "";
    async carregarCotacoes() {
        try {
            const respostaApi = await fetch(enderecoApi);
            const dados = (await respostaApi.json());
            console.log(dados);
            // Convertemos para número no momento da atribuição
            this.bid = Number(dados.USDBRL.bid);
            this.ask = Number(dados.USDBRL.ask);
            const nomeMoedas = dados.USDBRL.name;
            this.salvarNomeMoedas(nomeMoedas);
        }
        catch (error) {
            console.error("ERRO:", error);
        }
    }
    getBid() {
        return this.bid;
    }
    getAsk() {
        return this.ask;
    }
    salvarNomeMoedas(nomeMoedas) {
        this.nomeMoedas = nomeMoedas;
    }
}
const cotacoes = new Cotacoes();
await cotacoes.carregarCotacoes();
const nomeMoedas = cotacoes.nomeMoedas;
const tituloGrafico = document.getElementById("texto-grafico-titulo");
tituloGrafico.textContent = `Variação de ${nomeMoedas} desde o login`;
// @ts-ignore
const graficoDolar = new Chart(elemGraficoDolar, {
    type: "line",
    data: {
        labels: [],
        datasets: [
            {
                label: "Bid",
                data: [],
                borderWidth: 1,
            },
            {
                label: "Ask",
                data: [],
                borderWidth: 1,
            },
        ],
    },
});
function horarioFormatado() {
    const agora = Temporal.Now.plainTimeISO();
    const formatter = new Intl.NumberFormat("pt-BR", { minimumIntegerDigits: 2 });
    const hora = formatter.format(agora.hour);
    const minuto = formatter.format(agora.minute);
    const segundo = formatter.format(agora.second);
    return `${hora}:${minuto}:${segundo}`;
}
// async function atualizarGrafico(chart: Chart) {
//   await cotacoes.carregarCotacoes();
//   const agoraFormatado = horarioFormatado();
//   chart.data.labels?.push(agoraFormatado);
//   chart.data.datasets[0]?.data.push(cotacoes.getBid());
//   chart.data.datasets[1]?.data.push(cotacoes.getAsk());
//   chart.update();
// }
// const intervalo = 3000;
// function inicializarGrafico(chart: Chart, interval: number) {
//   // adiciona dois dados iniciais
//   atualizarGrafico(graficoDolar);
//   atualizarGrafico(graficoDolar);
//   setTimeout(() => {
//     chart.data.labels?.shift();
//     chart.data.datasets[0]?.data.shift();
//     chart.data.datasets[1]?.data.shift();
//   }, interval);
//   setInterval(async () => {
//     await atualizarGrafico(graficoDolar);
//   }, interval);
// }
// function inicializarTabela(interval: number) {
//   let cotacaoMedia = (cotacoes.getBid() + cotacoes.getAsk()) / 2;
//   exibeCotacao("dólar", "dólares", cotacaoMedia);
//   setInterval(async () => {
//     cotacaoMedia = (cotacoes.getBid() + cotacoes.getAsk()) / 2;
//     exibeCotacao("dólar", "dólares", cotacaoMedia);
//   }, interval);
// }
// inicializarGrafico(graficoDolar, intervalo);
// inicializarTabela(intervalo);
function atualizarGraficoWorker(chart, hora, valorBid, valorAsk) {
    chart.data.labels?.push(hora);
    chart.data.datasets[0]?.data.push(valorBid);
    chart.data.datasets[1]?.data.push(valorAsk);
    chart.update();
}
let workerDolar = new Worker("./scripts/workers/workerDolar.js", { type: "module" });
workerDolar.addEventListener("message", (event) => {
    const dados = event.data;
    const bid = Number(dados.bid);
    const ask = Number(dados.ask);
    let cotacaoMedia = (bid + ask) / 2;
    let horario = horarioFormatado();
    exibeCotacao("dólar", "dólares", cotacaoMedia);
    atualizarGraficoWorker(graficoDolar, horario, bid, ask);
});
workerDolar.postMessage("usd");
