import { exibeCotacao } from "./exibeCotacao.js";
import { enderecoApiUsd, enderecoApiIene } from "./shared/vars.js";
const elemGraficoDolar = document.getElementById("graficoDolar");
const elemGraficoIene = document.getElementById("graficoIene");
const elemListaDolar = document.getElementById("dolar");
const elemListaIene = document.getElementById("iene");
class Cotacoes {
    enderecoApi;
    codigosMoedas;
    bid = 0;
    ask = 0;
    nomesMoedas = "";
    constructor(enderecoApi, codigosMoedas) {
        this.enderecoApi = enderecoApi;
        this.codigosMoedas = codigosMoedas;
    }
    async carregarCotacoes() {
        try {
            const respostaApi = await fetch(this.enderecoApi);
            const dados = (await respostaApi.json());
            console.log(dados);
            // Convertemos para número no momento da atribuição
            this.bid = Number(dados[this.codigosMoedas].bid);
            this.ask = Number(dados[this.codigosMoedas].ask);
            const nomesMoedas = dados[this.codigosMoedas].name;
            this.setNomesMoedas(nomesMoedas);
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
    getNomesMoedas() {
        return this.nomesMoedas;
    }
    setNomesMoedas(nomeMoedas) {
        this.nomesMoedas = nomeMoedas;
    }
}
const cotacoesDolar = new Cotacoes(enderecoApiUsd, "USDBRL");
await cotacoesDolar.carregarCotacoes();
const tituloGraficoDolar = document.getElementById("titulo-grafico-dolar");
tituloGraficoDolar.textContent = `Variação de ${cotacoesDolar.getNomesMoedas()} desde o login`;
const cotacoesIene = new Cotacoes(enderecoApiIene, "BRLJPY");
await cotacoesIene.carregarCotacoes();
const tituloGraficoIene = document.getElementById("titulo-grafico-iene");
tituloGraficoIene.textContent = `Variação de ${cotacoesIene.getNomesMoedas()} desde o login`;
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
    options: {
        responsive: true,
        maintainAspectRatio: false,
    },
});
// @ts-ignore
const graficoIene = new Chart(elemGraficoIene, {
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
    options: {
        responsive: true,
        maintainAspectRatio: false,
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
    exibeCotacao(elemListaDolar, "dólar", "dólares", cotacaoMedia);
    atualizarGraficoWorker(graficoDolar, horario, bid, ask);
});
workerDolar.postMessage("usd");
let workerIene = new Worker("./scripts/workers/workerIene.js", { type: "module" });
workerIene.addEventListener("message", (event) => {
    const dados = event.data;
    const bid = Number(dados.bid);
    const ask = Number(dados.ask);
    let cotacaoMedia = (bid + ask) / 2;
    let horario = horarioFormatado();
    exibeCotacao(elemListaIene, "iene", "ienes", cotacaoMedia);
    atualizarGraficoWorker(graficoIene, horario, bid, ask);
});
workerIene.postMessage("jpy");
