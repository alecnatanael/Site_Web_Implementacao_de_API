const URL_API = "http://app.professordaniloalves.com.br";

/* MENU */
$('.scrollSuave').click(() => {
    $('html, body').animate(
        { scrollTop: $(event.target.getAttribute('href')).offset().top - 100 }, 500);
});

// Somente se de acordo com os termos o botão é liberado
$('#cadastroDeAcordo').change(function () {
    $('#btnSubmitCadastro').attr("disabled", !this.checked)
})


/* ENVIAR CADASTRO */
const formularioCadastro = document.getElementById("formCadastro");
//formularioCadastro.addEventListener("submit", validarCadastro, true)
formularioCadastro.addEventListener("submit", enviarFormularioCadastro, true);


function enviarFormularioCadastro(event) {
    event.preventDefault();
    //alert("Requer implementação...");
    
    $("#formCadastro .invalid-feedback").remove(); // remover campo marcado com 'invalid-feedback'
    $("#formCadastro .is-invalid").removeClass("is-invalid"); // remover a classe 'is-invalid' dos campos marcados com ela

    fetch(URL_API + "/api/v1/cadastro", {
        method: "POST",
        headers: new Headers({
            Accept: "application/json",
            'Content-Type': "application/json",
        }),
        body: JSON.stringify({
            nomeCompleto: document.getElementById('cadastroNomeCompleto').value,
            dataNascimento: document.getElementById('cadastroDataNascimento').value,
            sexo: document.querySelector("[name=cadastroSexo]:checked").value,
            cep: document.getElementById('cadastroCep').value.replace("-", ""),
            cpf: document.getElementById('cadastroCpf').value.replace("-", "").replace(".", "").replace(".", ""),
            uf: document.getElementById('cadastroUf').value,
            cidade: document.getElementById('cadastroCidade').value,
            logradouro: document.getElementById('cadastroLogradouro').value,
            numeroLogradouro: document.getElementById('cadastroNumeroLogradouro').value,
            email: document.getElementById('cadastroEmail').value
        })
    })
    .then(response => {
        return new Promise((myResolve, myReject) => {
            response.json().then(json => {
                myResolve({ "status": response.status, json });
            });
        });
    }).then(response => {
        if (response && response.json.errors) {
            Object.entries(response.json.errors).forEach((obj, index) => {
                const field = obj[0]; //obj[0] é o campo em questão
                const id = "cadastro" + field.charAt(0).toUpperCase() + field.substring(1); // formatando o nome para encaixar na lógica do id
                const texto = obj[1][0];
                criarDivDeCampoInvalido(id, texto, index == 0); // criar o design no campo que deu inválido
            })
        } else {
            console.log(response)
            apagarCadastro()
        }
    }).catch(err => {
        alert('Ocorreu um erro não tratado!')
        console.log(err);
    });
}

// Apagar campos do cadastro
function apagarCadastro() {
    document.getElementById("cadastroNomeCompleto").value = null;
    document.getElementById("cadastroDataNascimento").value = null;
    document.getElementById("cadastroCep").value = null;
    document.getElementById("cadastroCpf").value = null;
    document.getElementById("cadastroUf").value = null;
    document.getElementById("cadastroCidade").value = null;
    document.getElementById("cadastroLogradouro").value = null;
    document.getElementById("cadastroNumeroLogradouro").value = null;
    document.getElementById("cadastroEmail").value = null;
    document.getElementById('cadastroDeAcordo').checked = false;
    document.getElementById('btnSubmitCadastro').disabled = true;
    document.querySelector("#cadastroFeminino").checked = 'F'
}

// Validar cadastro

/*function validarCadastro() {
    const campoCadastro = 
    fetch(URL_API + "/api/v1/cadastro/validar/documento/" + campoCadastro, {
        method: "GET",
            headers: new Headers({
                Accept: "application/json",
                'Content-Type': "application/json",
            })
    })
    .then(response => {
        return response.json();
    })
}*/

/* FIM ENVIAR CADASTRO */

// Função de gerar desenho do campo inválido
function criarDivDeCampoInvalido(idItem, textoErro, isFocarNoCampo) {
    const el = document.getElementById(idItem);
    isFocarNoCampo && el.focus();
    el.classList.add("is-invalid");
    const node = document.createElement("div");
    const textnode = document.createTextNode(textoErro);
    node.appendChild(textnode);
    const elDiv = el.parentElement.appendChild(node);
    elDiv.classList.add("invalid-feedback");
}



/* CRIAR LISTA DE ESTADOS */

popularListaEstados();

function popularListaEstados() {
    fetch(URL_API + "/api/v1/endereco/estados", {
        headers: new Headers({
            Accept: "application/json"
        })
    })
    .then(response => {
        return response.json();
    }).then(estados => {
        const elSelecetUF = document.getElementById("cadastroUf");
        estados.forEach((estado) => {
            elSelecetUF.appendChild(criarOption(estado.uf, estado.nome));
        })
    }).catch(err => {
        alert("Erro ao salvar cadastro");
        console.log(err);
    })

}

function criarOption(valor, texto) {
    const node = document.createElement("option");
    const textnode = document.createTextNode(texto)
    node.appendChild(textnode);
    node.value = valor;
    return node;
}

/* FIM CRIAR LISTA DE ESTADOS */


/* PREENCHER ENDEREÇO */
function popularEnderecoCadastro(){
    //alert("Requer implementação...");
    $(".invalid-feedback").remove(); // remover campo marcado com 'invalid-feedback'
    $(".is-invalid").removeClass("is-invalid"); // remover a classe 'is-invalid' dos campos marcados com ela

    const campoCep = document.getElementById('cadastroCep')
    const cepFormatado = campoCep.value.replace("-", "")
    //if (cepFormatado.length == 8) {
        fetch(URL_API + '/api/v1/endereco/' + cepFormatado, {
            method: "GET",
            headers: new Headers({
                Accept: "application/json",
                'Content-Type': "application/json",
            })
        })
        .then(response => {
            return response.json();
        }).then(dadosCep => {
            if (dadosCep && !dadosCep.message){
                let campoLogradouro = document.getElementById('cadastroLogradouro')
                let campoEstado = document.getElementById('cadastroUf')
                let campoCidade = document.getElementById('cadastroCidade')

                campoLogradouro.value = dadosCep.logradouro ? dadosCep.logradouro : "" ;
                campoEstado.value = dadosCep.uf ? dadosCep.uf : "" ;
                campoCidade.value = dadosCep.localidade ? dadosCep.localidade : "" ;

            } else {
                //alert(dadosCep.message)
                criarDivDeCepCampoInvalido('cadastroCep', dadosCep.message)
                    
                
                console.log(dadosCep.message)
            }
        })
        .catch(err => {
            criarDivDeCepCampoInvalido('cadastroCep', 'Por favor preencha com um valor válido!')
            //alert('O CEP deve ser preenchido!');
            console.log(err);
        })
   // } 
}
/* FIM PREENCHER ENDEREÇO */

function criarDivDeCepCampoInvalido(idItem, textoErro) {
    const el = document.getElementById(idItem);
    //el.focus();
    el.classList.add("is-invalid");
    const node = document.createElement("div");
    const textnode = document.createTextNode(textoErro);
    node.appendChild(textnode);
    const elDiv = el.parentElement.appendChild(node);
    elDiv.classList.add("invalid-feedback");
}

/* IMC */

$('#btnCalcularIMC').click(() => {
    $("#resultadoIMC").html("");
    $("#formImc .invalid-feedback").remove();
    $("#formImc .is-invalid").removeClass("is-invalid");

    fetch(URL_API + "/api/v1/imc/calcular", {
        method: "POST",
        headers: new Headers({
            Accept: "application/json",
            'Content-Type': "application/json",
        }),
        body: JSON.stringify({
            peso: document.getElementById("pesoImc").value,
            altura: document.getElementById("alturaImc").value,
        })
    })
        .then(response => {
            return new Promise((myResolve, myReject) => {
                response.json().then(json => {
                    myResolve({ "status": response.status, json });
                });
            });
        }).then(response => {
            if (response && response.json.errors) {
                Object.entries(response.json.errors).forEach((obj, index) => {
                    const id = parseIdImc(obj[0]);
                    const texto = obj[1][0];
                    criarDivDeCampoInvalido(id, texto, index == 0);
                })
            } else {
                $("#resultadoIMC").html(response.json.message);
                $('#modalResultadoIMC').modal('show');
                apagarIMC()
            }
        }).catch(err => {
            $("#resultadoIMC").html("Ocorreu um erro ao tentar calcular seu IMC.");
            $('#modalResultadoIMC').modal('show');
            console.log(err);
        });

});

function parseIdImc(id) {
    return id + "Imc";
}

// Apagar dados do IMC
function apagarIMC() {
    document.getElementById('pesoImc').value = null
    document.getElementById('alturaImc').value = null
}

/* FIM IMC */