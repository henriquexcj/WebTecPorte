

/**
 * A classe Chamado atua como um contêiner de dados. O seu Builder cuida da construção.
 */
class Chamado {
    constructor(){
        this.idChamado = null;
        this.userID = null;
        this.nomeAluno = '';
        this.raAluno = '';
        this.emailAluno = '';
        this.curso = '';
        this.status = 'Aberto'; //valor padrão
        this.prioridade = 'Baixa';
        this.categoria = '';
        this.tituloChamado = '';
        this.descricaoChamado = '';
        this.dataCriacao = new Date().toDateString(); //valor padrão
        this.dataAtualizacao = new Date().toDateString(); //valor padrão
    }
}

/**
 * Implementação do Padrão Builder para construir objetos Chamado.
 * Esta classe permite a criação de um objeto complexo (Chamado) passo a passo, de forma legível
 */
class BuilderChamado {
    /**
     * Cria um novo chamado no qual será construido
     */
    constructor (){
        this.chamado = new Chamado();
    }

    /**
     * Define o nome do aluno
     * @param {string} nomeAluno - Nome do aluno que fez o chamado
     * @returns {BuilderChamado} Retorna 'this' para permitir encadeamento.
     */
    definirAluno(nomeAluno){
        this.chamado.nomeAluno = nomeAluno;
        return this;
    }


    definirRaAluno(raAluno){ //Verificar se esse RA existe antes de definir, mas ai eu posso fazer isso no Controller
        this.chamado.raAluno = raAluno;
        return this;
    }

    definirCurso(curso){ 
        this.chamado.curso = curso;
        return this;
    }

    definirEmail(emailAluno){
        this.chamado.emailAluno = emailAluno;
        return this;
    }

    definirId(idChamado){ //Pegar do banco de dados
        this.chamado.idChamado = idChamado;
        return this;
    }

    definirStatus(status){ //Não sei onde definir, no banco de dados?
        this.chamado.status = status;
        return this;
    }

    definirPrioridade(prioridade){ // Como que isso vai ser definido??
        this.chamado.prioridade = prioridade;
        return this;
    }

    definirCategoria(categoria){
        this.chamado.categoria = categoria;
        return this;
    }

    definirTituloChamado(tituloChamado){
        this.chamado.tituloChamado = tituloChamado;
        return this;
    }

    definirDescricaoChamado(descricaoChamado){
        this.chamado.descricaoChamado = descricaoChamado;
        return this;
    }

    definirDataCriacao(dataCriacao){ //Pegar do banco de dados, ele define sozinho
        this.chamado.dataCriacao = dataCriacao;
    }

    definirDataAtualizacao(dataAtualizacao){ //Pegar do banco de dados, não como fazer pra ficar definindo a cada atualização.
        this.chamado.dataAtualizacao = dataAtualizacao
    }

    Build(){
        return this.chamado;
    }
}

export class ControllerChamado {
    constructor(db, auth, userId, appId){
        this.db = db;
        this.auth = auth;
        this.userId = userId;
        this.appId = appId;

        //Caminho da coleção no Firestore
        const collectionPath = `/artifacts/${this.appId}/users/${this.userId}/Chamados`;
        this.chamadosCollectionRef = collection(this.db, collectionPath);

        this.chamadoAtualId = null; //Guarda o ID do doc para editar
        this.chamadoAtualChamadoid = null; //Guarda o ID do chamado
    }

    selectValueByid(id) {
        const element = document.getElementById(id);

        if(element) {
            return element.value
        }

        console.warn(`Elemento com ID '${id}' não foi encontrado no DOM.`);
        return '';
    }

    coletarDados(){
        let nomeAluno = this.selectValueByid('studentName');
        let emailAluno = this.selectValueByid('studentEmail');
        let categoria = this.selectValueByid('categoria');
        let raAluno = this.selectValueByid('ra');
        let curso = this.selectValueByid('studentArea');
        let prioridade = this.selectValueByid('priority');
        let tituloChamado = this.selectValueByid('call-title');
        let description = this.selectValueByid('description');

        let builderChamado = new BuilderChamado();
        builderChamado.definirAluno(nomeAluno)
            .definirRaAluno(raAluno)
            .definirEmail(emailAluno)
            .definirCurso(curso)
            .definirCategoria(categoria)
            .definirPrioridade(prioridade)
            .definirTituloChamado(tituloChamado)
            .definirDescricaoChamado(description);
        
        this.adicionar(builderChamado.Build());
        return builderChamado.Build();
    }

    adicionar(chamado){
        const tbody = this.selectValueByid('tbody');
        let tr = tbody.insertRow();

        let td_titulo = tr.insertCell();
        let td_status = tr.insertCell();
        let td_prioridade = tr.insertCell();
        let td_idChamado = tr.insertCell();
        let td_data = tr.insertCell();
        let td_dataAtualizacao = tr.insertCell();
        let td_acoes = tr.insertCell();

        td_titulo.innerText = chamado.tituloChamado;
        td_status.innerText = chamado.status;
        td_prioridade.innerText = chamado.prioridade;
        td_idChamado.innerText = chamado.idChamado;
        td_data.innerText = new Date(chamado.dataCriacao).toLocaleDateString('pt-BR');
        td_dataAtualizacao.innerText = new Date(chamado.dataAtualizacao).toLocaleDateString('pt-BR');

        td_description.classList.add('left');

        switch(td_status.innerText){
            case 'Aberto': 
                td_status.classList.add('aberto');
                break;
            case 'Em andamento': 
                td_status.classList.add('em-andamento');
                break;
            case 'Aguardando resposta': 
                td_status.classList.add('aguardando-resposta');
                break;
            case 'Resolvido': 
                td_status.classList.add('resolvido');
                break;
            case 'Fechado': 
                td_status.classList.add('fechado');
                break;
            case 'Concluído':
            case 'Concluido':
                td_status.classList.add('concluido');
                break;
            default: 
                console.warn('Erro ao tentar identificar o status.');
                break;
        }

        switch(td_prioridade.innerText){
            case 'Baixa':
                td_prioridade.classList.add('baixa');
                break;
            case 'Média':
            case 'Media':
                td_prioridade.classList.add('media');
                break;
            case 'Alta':
                td_prioridade.classList.add('alta');
                break;
            case 'Urgente':
                td_prioridade.classList.add('urgente');
                break;
            default:
                console.warn('Erro ao tentar identificar a prioridade');
                break;
        }
    }

    startRealtimeListener(){
        onSnapshot(this.chamadosCollectionRef, (snapshot) => {
            const chamadosList = snapshot.docs.map(doc => {
                const data = doc.data();
                data.docId = doc.id;
                return data;
            });
            this.loadChamados(chamadosList);
        }, (error) => {
            console.error("Erro ao ouvir os chamados: ", error);
        });
    }

    loadChamados(chamadosList){
        const tbody = document.getElementById('tbody');
        if (!tbody) return;

        tbody.innerHTML = '';
        chamadosList.forEach(chamado =>{
            this.adicionar(chamado);
        })
    }

    //ainda não como isso vai funcionar, mas da pra fazer tipo uns 20 por página, sla.
    buscarChamadosBD(deQuanto, aQuanto){
        //código pra buscar
        let arrayChamados = [];
        for(deQuanto; deQuanto < aQuanto; deQuanto++){
            //api
            arrayChamados.push(chamado)
        }
        return arrayChamados;
    }
}

//gerenciar a api que conecta no banco
class ManageBDAPI {
    post(){

    }

    get(){

    }
}

const controllerChamado = new ControllerChamado();

//melhorar esse addEventListener ai
const btnAddCall = document.getElementById('addCall');
btnAddCall.addEventListener('click', () => {
    controllerChamado.coletarDados();
    
    document.getElementById('studentName').value = '';
    document.getElementById('studentEmail').value = '';
    document.getElementById('categoria').value = '';
    document.getElementById('ra').value = '';
    document.getElementById('studentArea').value = '';
    document.getElementById('priority').value = 'low';
    document.getElementById('call-title').value = '';
    document.getElementById('description').value = '';
});

//quando cancela fecha a janela e define todos os campos para ficarem vazios
const btnCancelCall = document.querySelector('.btn_cancel');
btnCancelCall.addEventListener('click', () => {
    document.getElementById('studentName').value = '';
    document.getElementById('studentEmail').value = '';
    document.getElementById('categoria').value = '';
    document.getElementById('ra').value = '';
    document.getElementById('studentArea').value = '';
    document.getElementById('priority').value = 'low';
    document.getElementById('call-title').value = '';
    document.getElementById('description').value = '';
});