import type { DadosApi } from "../shared/types/DadosApi";
import { enderecoApiIene } from "../shared/vars.js";

const intervalo = 3000;

async function carregarCotacoes() {
  try {
    const respostaApi = await fetch(enderecoApiIene);
    const dados = (await respostaApi.json()) as DadosApi;
    postMessage(dados["BRLJPY"]);
  } catch (error) {
    console.error("ERRO:", error);
  }
}

addEventListener("message", () => {
  carregarCotacoes();
  setInterval(() => {
    carregarCotacoes();
  }, intervalo);
});
