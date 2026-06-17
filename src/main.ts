import type { Chart } from "./charttype.js";
import { exibeCotacao } from "./exibeCotacao.js";

const elemGraficoDolar = document.getElementById("graficoDolar") as HTMLCanvasElement;

const enderecoApi = "https://economia.awesomeapi.com.br/last/USD-BRL";

interface DadosApi {
  USDBRL: {
    code: string;
    codein: string;
    name: string;
    high: string;
    low: string;
    varBid: string;
    pctChange: string;
    bid: string;
    ask: string;
    timestamp: string;
    create_date: string;
  };
}

class Cotacoes {
  bid = 0;
  ask = 0;
  nomeMoedas = "";

  async carregarCotacoes() {
    try {
      const respostaApi = await fetch(enderecoApi);
      const dados = (await respostaApi.json()) as DadosApi;

      console.log(dados);

      // Convertemos para número no momento da atribuição
      this.bid = Number(dados.USDBRL.bid);
      this.ask = Number(dados.USDBRL.ask);

      const nomeMoedas = dados.USDBRL.name;
      this.salvarNomeMoedas(nomeMoedas);
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

  salvarNomeMoedas(nomeMoedas: string): void {
    this.nomeMoedas = nomeMoedas;
  }
}

const cotacoes = new Cotacoes();
await cotacoes.carregarCotacoes();

const nomeMoedas = cotacoes.nomeMoedas;
const tituloGrafico = document.getElementById("texto-grafico-titulo") as HTMLHeadingElement;
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

async function atualizarGrafico(chart: Chart) {
  await cotacoes.carregarCotacoes();

  const agora = Temporal.Now.plainTimeISO();

  const formatter = new Intl.NumberFormat("pt-BR", { minimumIntegerDigits: 2 });

  const hora = formatter.format(agora.hour);
  const minuto = formatter.format(agora.minute);
  const segundo = formatter.format(agora.second);

  const agoraFormatado = `${hora}:${minuto}:${segundo}`;
  chart.data.labels?.push(agoraFormatado);

  chart.data.datasets[0]?.data.push(cotacoes.getBid());
  chart.data.datasets[1]?.data.push(cotacoes.getAsk());
  chart.update();
}

const intervalo = 3000;

function inicializarGrafico(chart: Chart, interval: number) {
  // adiciona dois dados iniciais
  atualizarGrafico(graficoDolar);
  atualizarGrafico(graficoDolar);

  setTimeout(() => {
    chart.data.labels?.shift();
    chart.data.datasets[0]?.data.shift();
    chart.data.datasets[1]?.data.shift();
  }, interval);

  setInterval(async () => {
    await atualizarGrafico(graficoDolar);
  }, interval);
}

function inicializarTabela(interval: number) {
  const cotacaoMedia = (cotacoes.getBid() + cotacoes.getAsk()) / 2;

  exibeCotacao("dólar", "dólares", cotacaoMedia);

  setInterval(async () => {
    exibeCotacao("dólar", "dólares", cotacaoMedia);
  }, interval);
}

inicializarGrafico(graficoDolar, intervalo);
inicializarTabela(intervalo);
