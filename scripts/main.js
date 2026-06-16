const graficoDolar = document.getElementById("graficoDolar");

const enderecoApi = "https://economia.awesomeapi.com.br/USD-BRL/100";

class Cotacoes {
  bidArray = [];
  askArray = [];
  labels = [];
  nomeMoedas = "";

  async carregarCotacoes() {
    try {
      const respostaApi = await fetch(enderecoApi);
      const dados = await respostaApi.json();

      console.log(dados);

      const bidArray = dados.map((dado) => {
        return dado.bid;
      });
      const askArray = dados.map((dado) => {
        return dado.ask;
      });

      const nomeMoedas = dados[0].name;

      this.salvarCotacoes(bidArray, askArray);
      this.salvarNomeMoedas(nomeMoedas);
    } catch (error) {
      console.error("ERRO:", error);
    }
  }

  salvarCotacoes(bidArray, askArray) {
    this.bidArray = bidArray;
    this.askArray = askArray;
  }

  salvarNomeMoedas(nomeMoedas) {
    this.nomeMoedas = nomeMoedas;
  }

  gerarLabels() {
    for (let i = 0; i < this.bidArray.length; i++) {
      this.labels.push(this.bidArray.length - i);
    }

    return this.labels;
  }
}

const cotacoes = new Cotacoes();
await cotacoes.carregarCotacoes();
const bids = cotacoes.bidArray;
const asks = cotacoes.askArray;

const nomeMoedas = cotacoes.nomeMoedas;
const tituloGrafico = document.getElementById("texto-grafico-titulo");

tituloGrafico.textContent = `Variação de ${nomeMoedas} desde o login`;

const labels = cotacoes.gerarLabels();

new Chart(graficoDolar, {
  type: "line",
  data: {
    labels: labels,
    datasets: [
      {
        label: "Bid",
        data: bids,
        borderWidth: 1,
      },
      {
        label: "Ask",
        data: asks,
        borderWidth: 1,
      },
    ],
  },
});
