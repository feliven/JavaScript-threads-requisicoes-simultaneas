import type { Chart } from "./shared/types/Chart.js";
import type { CodigosMoedas, DadosApi } from "./shared/types/DadosApi.js";
import { exibeCotacao } from "./exibeCotacao.js";
import { enderecoApiUsd, enderecoApiIene } from "./shared/vars.js";

const elemGraficoDolar = document.getElementById("graficoDolar") as HTMLCanvasElement;
const elemGraficoIene = document.getElementById("graficoIene") as HTMLCanvasElement;
const elemListaDolar = document.getElementById("dolar") as HTMLUListElement;
const elemListaIene = document.getElementById("iene") as HTMLUListElement;

class Cotacoes {
  private bid = 0;
  private ask = 0;
  private nomesMoedas = "";

  constructor(
    private enderecoApi: string,
    private codigosMoedas: CodigosMoedas,
  ) {}

  async carregarCotacoes() {
    try {
      const respostaApi = await fetch(this.enderecoApi);
      const dados = (await respostaApi.json()) as DadosApi;

      console.log(dados);

      // Convertemos para número no momento da atribuição
      this.bid = Number(dados[this.codigosMoedas].bid);
      this.ask = Number(dados[this.codigosMoedas].ask);

      const nomesMoedas = dados[this.codigosMoedas].name;
      this.setNomesMoedas(nomesMoedas);
    } catch (error) {
      console.error("ERRO:", error);
    }
  }

  getBid(): number {
    return this.bid;
  }

  getAsk(): number {
    return this.ask;
  }

  getNomesMoedas(): string {
    return this.nomesMoedas;
  }

  private setNomesMoedas(nomeMoedas: string): void {
    this.nomesMoedas = nomeMoedas;
  }
}

const cotacoesDolar = new Cotacoes(enderecoApiUsd, "USDBRL");
await cotacoesDolar.carregarCotacoes();
const tituloGraficoDolar = document.getElementById("titulo-grafico-dolar") as HTMLHeadingElement;
tituloGraficoDolar.textContent = `Variação de ${cotacoesDolar.getNomesMoedas()} desde o login`;

const cotacoesIene = new Cotacoes(enderecoApiIene, "BRLJPY");
await cotacoesIene.carregarCotacoes();
const tituloGraficoIene = document.getElementById("titulo-grafico-iene") as HTMLHeadingElement;
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

function horarioFormatado(): string {
  const agora = Temporal.Now.plainTimeISO();

  const formatter = new Intl.NumberFormat("pt-BR", { minimumIntegerDigits: 2 });

  const hora = formatter.format(agora.hour);
  const minuto = formatter.format(agora.minute);
  const segundo = formatter.format(agora.second);

  return `${hora}:${minuto}:${segundo}`;
}

function atualizarGraficoWorker(chart: Chart, hora: string, valorBid: number, valorAsk: number) {
  chart.data.labels?.push(hora);

  chart.data.datasets[0]?.data.push(valorBid);
  chart.data.datasets[1]?.data.push(valorAsk);
  chart.update();
}

let workerDolar = new Worker("./scripts/workers/workerDolar.js", { type: "module" });

workerDolar.addEventListener("message", (event) => {
  const dados = event.data as DadosApi["USDBRL"];
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
  const dados = event.data as DadosApi["BRLJPY"];
  const bid = Number(dados.bid);
  const ask = Number(dados.ask);
  let cotacaoMedia = (bid + ask) / 2;
  let horario = horarioFormatado();

  exibeCotacao(elemListaIene, "iene", "ienes", cotacaoMedia);

  atualizarGraficoWorker(graficoIene, horario, bid, ask);
});

workerIene.postMessage("jpy");
