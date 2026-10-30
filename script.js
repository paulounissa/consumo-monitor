// 1. Dicionário de dados atualizado com 10 máquinas
const especificacoesMaquinas = {
    // === CÁLCULO POR HORA ===
    "minicarregadeira_sr175b": { nome: "Minicarregadeira CASE SR175B", tipoCalculo: "hora", consumoBase: 6.0, textoLabel: "Horas Trabalhadas (h):" },
    "retroescavadeira_580n": { nome: "Retroescavadeira CASE 580N", tipoCalculo: "hora", consumoBase: 8.0, textoLabel: "Horas Trabalhadas (h):" },
    "motoniveladora_865b": { nome: "Motoniveladora Case 865B", tipoCalculo: "hora", consumoBase: 16.0, textoLabel: "Horas Trabalhadas (h):" },
    "escavadeira_cat320": { nome: "Escavadeira Hidráulica CAT 320", tipoCalculo: "hora", consumoBase: 15.5, textoLabel: "Horas Trabalhadas (h):" },
    "pa_carregadeira_l120h": { nome: "Pá Carregadeira Volvo L120H", tipoCalculo: "hora", consumoBase: 14.0, textoLabel: "Horas Trabalhadas (h):" },
    "retroescavadeira_3cx": { nome: "Retroescavadeira JCB 3CX", tipoCalculo: "hora", consumoBase: 7.5, textoLabel: "Horas Trabalhadas (h):" },
    "minicarregadeira_s530": { nome: "Minicarregadeira Bobcat S530", tipoCalculo: "hora", consumoBase: 5.5, textoLabel: "Horas Trabalhadas (h):" },
    "rolo_compactador_ca250": { nome: "Rolo Compactador Dynapac CA250", tipoCalculo: "hora", consumoBase: 11.0, textoLabel: "Horas Trabalhadas (h):" },
    
    // === CÁLCULO POR KM ===
    "caminhao_vw24280": { nome: "Caminhão VW 24.280 Basculante", tipoCalculo: "km", consumoBase: 2.5, textoLabel: "Quilometragem Rodada (km):" },
    "caminhao_atego2730": { nome: "Caminhão MB Atego 2730 Basculante", tipoCalculo: "km", consumoBase: 2.2, textoLabel: "Quilometragem Rodada (km):" }
};

const fatorEmissaoCO2 = 2.68; // kg de CO2 por litro de diesel S10

// Evento para mudar o texto da Label dinamicamente (Horas vs Km)
document.getElementById('modelo').addEventListener('change', function() {
    const dadosModelo = especificacoesMaquinas[this.value];
    document.getElementById('label-quantidade').innerText = dadosModelo.textoLabel;
    
    // Esconde resultados anteriores ao trocar de máquina
    document.getElementById('resultados').classList.add('oculto');
    document.getElementById('btn-exportar').classList.add('oculto');
});

// Formatação de moeda (R$)
const formatarMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

// Função principal de cálculo
function calcular() {
    const modeloSelecionado = document.getElementById('modelo').value;
    const quantidade = parseFloat(document.getElementById('quantidade').value);
    const precoDiesel = parseFloat(document.getElementById('preco-diesel').value);
    const msgErro = document.getElementById('msg-erro');

    // Validação com feedback visual na tela
    if (isNaN(quantidade) || quantidade <= 0 || isNaN(precoDiesel) || precoDiesel <= 0) {
        msgErro.classList.remove('oculto');
        document.getElementById('resultados').classList.add('oculto');
        document.getElementById('btn-exportar').classList.add('oculto');
        return;
    }
    
    msgErro.classList.add('oculto');

    const dadosModelo = especificacoesMaquinas[modeloSelecionado];
    let litrosConsumidos = 0;

    if (dadosModelo.tipoCalculo === "hora") {
        litrosConsumidos = quantidade * dadosModelo.consumoBase;
    } else if (dadosModelo.tipoCalculo === "km") {
        litrosConsumidos = quantidade / dadosModelo.consumoBase;
    }

    const custoTotal = litrosConsumidos * precoDiesel;
    const emissaoCO2 = litrosConsumidos * fatorEmissaoCO2;

    // Injeta os valores
    document.getElementById('res-litros').innerText = litrosConsumidos.toFixed(1).replace('.', ',');
    document.getElementById('res-custo').innerText = formatarMoeda.format(custoTotal);
    document.getElementById('res-co2').innerText = emissaoCO2.toFixed(1).replace('.', ',');

    // Mostra resultados
    document.getElementById('resultados').classList.remove('oculto');
    document.getElementById('btn-exportar').classList.remove('oculto');
}

// Exportar CSV
function exportarCSV() {
    const selectModelo = document.getElementById('modelo');
    const nomeMaquina = selectModelo.options[selectModelo.selectedIndex].text;
    const quantidade = document.getElementById('quantidade').value;
    const litros = document.getElementById('res-litros').innerText;
    const custo = document.getElementById('res-custo').innerText.replace('R$', '').trim();
    const co2 = document.getElementById('res-co2').innerText;
    
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const cabecalho = "Data,Equipamento,Uso (h/km),Combustivel (L),Custo Operacional (R$),Emissao CO2 (kg)\n";
    const linhaDeDados = `${dataAtual},"${nomeMaquina}",${quantidade},"${litros}","${custo}","${co2}"\n`;
    
    const conteudoCSV = "\uFEFF" + cabecalho + linhaDeDados;
    const blob = new Blob([conteudoCSV], { type: 'text/csv;charset=utf-8;' });
    const urlVirtual = URL.createObjectURL(blob);
    
    const linkDownload = document.createElement("a");
    linkDownload.setAttribute("href", urlVirtual);
    linkDownload.setAttribute("download", `relatorio_${dataAtual.replace(/\//g, '-')}.csv`);
    
    linkDownload.style.visibility = 'hidden';
    document.body.appendChild(linkDownload);
    linkDownload.click();
    document.body.removeChild(linkDownload);
}
