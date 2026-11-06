const chapas = {
    10: "Inovação",
    20: "Futuro",
    30: "Transformação"
};
const chaveArmazenamento = "urnaEscolar.estado.v1";
const prazoVotacao = new Date("2026-11-06T09:25:00-03:00");

const formIdentificacao = document.getElementById("formIdentificacao");
const campoCodigo = document.getElementById("codigoAluno");
const mensagem = document.getElementById("mensagem");
const mensagemArmazenamento = document.getElementById("mensagem-armazenamento");
const etapaIdentificacao = document.getElementById("etapaIdentificacao");
const etapaVotacao = document.getElementById("etapaVotacao");
const formVotacao = document.getElementById("form-votacao");
const campoChapa = document.getElementById("chapa");
const mensagemVoto = document.getElementById("mensagem-voto");
const etapaRevisao = document.getElementById("etapaRevisao");
const resumoVoto = document.getElementById("resumo-voto");
const etapaConclusao = document.getElementById("etapaConclusao");
const etapaResultado = document.getElementById("etapaResultado");
const statusPrazo = document.getElementById("status-prazo");
const resultadoVencedora = document.getElementById("resultado-vencedora");
const resultadoContagens = document.getElementById("resultado-contagens");
const passos = [
    document.getElementById("passo-identificacao"),
    document.getElementById("passo-escolha"),
    document.getElementById("passo-revisao"),
    document.getElementById("passo-conclusao")
];

function criarEstadoInicial() {
    return {
        version: 1,
        codigosQueVotaram: [],
        votos: { 10: 0, 20: 0, 30: 0 }
    };
}

function validarEstado(estado) {
    if (
        estado === null ||
        typeof estado !== "object" ||
        estado.version !== 1 ||
        !Array.isArray(estado.codigosQueVotaram) ||
        estado.codigosQueVotaram.some(codigo =>
            typeof codigo !== "string" || codigo.length === 0 || codigo !== codigo.trim().toUpperCase()
        ) ||
        new Set(estado.codigosQueVotaram).size !== estado.codigosQueVotaram.length ||
        estado.votos === null ||
        typeof estado.votos !== "object"
    ) {
        return false;
    }

    const numerosChapas = Object.keys(chapas);
    return Object.keys(estado.votos).length === numerosChapas.length &&
        numerosChapas.every(numero =>
            Number.isSafeInteger(estado.votos[numero]) && estado.votos[numero] >= 0
        ) &&
        numerosChapas.reduce((total, numero) => total + estado.votos[numero], 0) ===
            estado.codigosQueVotaram.length;
}

function carregarEstado() {
    try {
        const salvo = localStorage.getItem(chaveArmazenamento);
        if (salvo === null) {
            return criarEstadoInicial();
        }

        const estado = JSON.parse(salvo);
        if (!validarEstado(estado)) {
            throw new Error("Os dados salvos não correspondem ao formato esperado.");
        }
        return estado;
    } catch (erro) {
        console.error("Não foi possível carregar os dados da urna.", erro);
        mensagemArmazenamento.textContent =
            "Não foi possível carregar os dados salvos da urna. A votação foi bloqueada para evitar inconsistências.";
        mensagemArmazenamento.hidden = false;
        return null;
    }
}

let estado = carregarEstado();
let codigoEleitorAtual = null;
let numeroChapaSelecionada = null;
let votacaoFoiEncerrada = false;
let intervaloPrazo;

function atualizarEtapa(etapaAtual) {
    passos.forEach((passo, indice) => {
        if (indice === etapaAtual) {
            passo.setAttribute("aria-current", "step");
        } else {
            passo.removeAttribute("aria-current");
        }
    });
}

function mostrarEtapa(etapa, indicePasso, titulo) {
    etapaIdentificacao.hidden = etapa !== etapaIdentificacao;
    etapaVotacao.hidden = etapa !== etapaVotacao;
    etapaRevisao.hidden = etapa !== etapaRevisao;
    etapaConclusao.hidden = etapa !== etapaConclusao;
    atualizarEtapa(indicePasso);
    titulo.focus();
}

function encerrarVotacao() {
    if (votacaoFoiEncerrada) {
        return;
    }

    votacaoFoiEncerrada = true;
    codigoEleitorAtual = null;
    numeroChapaSelecionada = null;
    etapaIdentificacao.hidden = true;
    etapaVotacao.hidden = true;
    etapaRevisao.hidden = true;
    etapaConclusao.hidden = true;
    etapaResultado.hidden = false;
    statusPrazo.textContent = "Votação encerrada às 9h25.";
    statusPrazo.classList.add("encerrado");
    atualizarEtapa(3);

    if (estado === null) {
        resultadoVencedora.textContent = "Não foi possível apurar os votos salvos neste navegador.";
    } else {
        const maiorTotal = Math.max(...Object.values(estado.votos));
        if (maiorTotal === 0) {
            resultadoVencedora.textContent = "Nenhuma chapa recebeu votos.";
        } else {
            const vencedoras = Object.keys(chapas).filter(
                numero => estado.votos[numero] === maiorTotal
            );
            resultadoVencedora.textContent = vencedoras.length === 1
                ? `Chapa mais votada: ${vencedoras[0]} — ${chapas[vencedoras[0]]}, com ${maiorTotal} voto(s).`
                : `Empate entre as chapas ${vencedoras.map(
                    numero => `${numero} — ${chapas[numero]}`
                ).join(", ")}, com ${maiorTotal} voto(s) cada.`;
        }

        resultadoContagens.replaceChildren();
        Object.keys(chapas).forEach(numero => {
            const item = document.createElement("li");
            item.textContent = `${numero} — ${chapas[numero]}: ${estado.votos[numero]} voto(s)`;
            resultadoContagens.appendChild(item);
        });
    }

    document.getElementById("resultado-heading").focus();
    clearInterval(intervaloPrazo);
}

function atualizarPrazo() {
    const restante = prazoVotacao.getTime() - Date.now();
    if (restante <= 0) {
        encerrarVotacao();
        return;
    }

    const segundos = Math.ceil(restante / 1000);
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = String(segundos % 60).padStart(2, "0");
    statusPrazo.textContent = `Votação aberta até 9h25 · faltam ${minutos}:${segundosRestantes}`;
}

formIdentificacao.addEventListener("submit", function(event) {
    event.preventDefault();
    atualizarPrazo();
    if (estado === null || votacaoFoiEncerrada) {
        return;
    }

    const codigo = campoCodigo.value.trim().toUpperCase();
    if (codigo.length === 0) {
        mensagem.textContent = "Digite um código para continuar.";
        campoCodigo.focus();
        return;
    }

    if (estado.codigosQueVotaram.includes(codigo)) {
        mensagem.textContent = "Este código já foi utilizado neste navegador. Cada código pode votar uma vez. Se precisar de ajuda, procure a equipe responsável.";
        campoCodigo.focus();
        return;
    }

    codigoEleitorAtual = codigo;
    mensagem.textContent = "";
    campoChapa.value = "";
    mensagemVoto.textContent = "";
    mostrarEtapa(etapaVotacao, 1, document.getElementById("escolha-heading"));
});

formVotacao.addEventListener("submit", function(event) {
    event.preventDefault();
    atualizarPrazo();
    if (estado === null || votacaoFoiEncerrada || codigoEleitorAtual === null) {
        return;
    }

    const numero = Number(campoChapa.value);
    if (!Object.hasOwn(chapas, numero)) {
        mensagemVoto.textContent = "Número inválido. Escolha a chapa 10, 20 ou 30.";
        campoChapa.focus();
        return;
    }

    numeroChapaSelecionada = numero;
    resumoVoto.textContent =
        `Você escolheu a chapa ${numero} — ${chapas[numero]}.`;
    mostrarEtapa(etapaRevisao, 2, document.getElementById("revisao-heading"));
});

document.getElementById("alterar-voto").addEventListener("click", function() {
    mostrarEtapa(etapaVotacao, 1, document.getElementById("escolha-heading"));
    campoChapa.focus();
});

document.getElementById("confirmar-voto").addEventListener("click", function() {
    atualizarPrazo();
    if (
        estado === null ||
        votacaoFoiEncerrada ||
        codigoEleitorAtual === null ||
        numeroChapaSelecionada === null
    ) {
        resumoVoto.textContent = "Não foi possível confirmar. Volte à identificação e tente novamente.";
        return;
    }

    const proximoEstado = {
        version: 1,
        codigosQueVotaram: [...estado.codigosQueVotaram, codigoEleitorAtual],
        votos: {
            ...estado.votos,
            [numeroChapaSelecionada]: estado.votos[numeroChapaSelecionada] + 1
        }
    };

    try {
        localStorage.setItem(chaveArmazenamento, JSON.stringify(proximoEstado));
    } catch (erro) {
        console.error("Não foi possível salvar o voto.", erro);
        mensagemArmazenamento.textContent =
            "Não foi possível salvar o voto neste navegador. Seu voto não foi registrado; procure a equipe responsável.";
        mensagemArmazenamento.hidden = false;
        mensagemArmazenamento.focus();
        return;
    }

    estado = proximoEstado;
    codigoEleitorAtual = null;
    numeroChapaSelecionada = null;
    mostrarEtapa(etapaConclusao, 3, document.getElementById("conclusao-heading"));
});

function cancelarVotacao() {
    codigoEleitorAtual = null;
    numeroChapaSelecionada = null;
    formVotacao.reset();
    campoCodigo.value = "";
    mensagem.textContent =
        "Votação cancelada. Nenhum voto foi registrado. Identifique-se para começar novamente.";
    mensagemVoto.textContent = "";
    mostrarEtapa(etapaIdentificacao, 0, document.getElementById("identificacao-heading"));
    campoCodigo.focus();
}

document.getElementById("cancelar-votacao").addEventListener("click", cancelarVotacao);
document.getElementById("cancelar-revisao").addEventListener("click", cancelarVotacao);

document.getElementById("proximo-eleitor").addEventListener("click", function() {
    atualizarPrazo();
    if (votacaoFoiEncerrada) {
        return;
    }

    formIdentificacao.reset();
    campoCodigo.value = "";
    mensagem.textContent = "";
    mostrarEtapa(etapaIdentificacao, 0, document.getElementById("identificacao-heading"));
    campoCodigo.focus();
});

atualizarPrazo();
if (!votacaoFoiEncerrada) {
    intervaloPrazo = setInterval(atualizarPrazo, 1000);
}
document.addEventListener("visibilitychange", function() {
    if (!document.hidden) {
        atualizarPrazo();
    }
});
