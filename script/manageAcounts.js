
class RegisterController {
    $(id){
        return document.getElementById(id);
    }

    async execute(){
        const user = this.pickupData();
        if (!user) return;
        console.log('objeto do usuario criado com sucesso');
        
        const btn = this.$('btn_cadastrar');
        if (btn) btn.disabled = true;

        this.addOnDB(user);

        if (btn) btn.disabled = true;
    }

    async addOnDB(user){
        const novoUsuario = {
            nome: user.nome,
            email: user.email,
            senha: user.senha,
            papel: user.papel
        };
        console.log('informações do objeto recuperadas', novoUsuario);
        
        try {
            const resposta = await fetch("https://localhost:5051/api/Auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(novoUsuario)
        });

        if(!resposta.ok){
            const erro = await resposta.text();
            console.error("Erro ao registar: ", erro);
            //document.getElementById('mensagem').textContent = "Erro ao registrar: " + erro;
            alert("Erro ao registrar: " + erro)
            return;
        }

        const data = await resposta.json();
        console.log(data);
        this.limparCampos();
        //document.getElementById('mensagem').textContent = "Usuário resgistrado com sucesso!";
        alert("Usuário resgistrado com sucesso!");
        } catch (erro) {
            console.error("Erro de conexão: ", erro);
            //document.getElementById('mensagem').textContent = "Falha ao conectar com o servidor.";
            alert("Falha ao conectar com o servidor.");
        }
    }

    pickupData(){
        const nome = this.$('nomecompleto').value;
        const curso = this.$('curso').value;
        const email = this.$('c_email').value;
        const senha1 = this.$('c_senha').value;
        const senha2 = this.$('c_confirmar_senha').value;
        
        if(this.verifyPassword(senha1, senha2)){
            if (curso){
                return this.newUser({nome: nome, email: email, curso: curso, senha: senha1});
            } else {
                return this.newUser({nome: nome, email: email, senha: senha1});
            }
        }
        return null;
    }

    verifyPassword(senha1, senha2){
        if (senha1 === senha2)
            return true;

        //document.getElementById('mensagem').textContent = "Senhas diferentes, tente novamente.";
        alert('As senhas são diferentes, escreva de novo.');
        return false;
    }

    newUser(data){
        const userBuilder =  new UserBuilder()
            .definirNome(data.nome)
            .definirEmail(data.email)
            .definirSenha(data.senha)
            .definirDataCadastro(new Date());
        
        if(data.curso)
            userBuilder.definirPapel('Aluno')
                .definirCurso(data.curso)
        else
            userBuilder.definirPapel('Funcionario');


        return userBuilder.Build();
    }

    limparCampos(){
        this.$('nomecompleto').value = '';
        this.$('c_email').value = '';
        this.$('curso').value = "";
        this.$('c_senha').value = '';
        this.$('c_confirmar_senha').value = '';
    }
}

class LoginController {
    constructor(){
        this.atualUser = null;
    }
    $(id){
        return document.getElementById(id).value;
    }

    async execute(){
        const login = this.pickupInfo()
        if (login){
            await this.verifyAccount(login.email, login.senha);

            if (this.atualUser){
                this.redirect(this.atualUser.papel);
            }
            else
                console.log('Login ok, mas não está carregando os dados.');
        }
    }
    
    
    pickupInfo(){
        const email = this.$('email');
        const senha = this.$('loginPass');

        if (!email || !senha){
            alert('Por favor, preencha e-mail e senha.')
            return null;
        }
        return {email: email, senha: senha};
    }

    decodeJWT(token) {
        try {
            if (!token) {
                console.warn("Token não encontrado no localStorage.");
                return null;
            }

            const payload = token.split('.')[1];
            const decoded = JSON.parse(atob(payload));

            return {
                email: decoded.email || decoded.sub,
                papel: decoded.papel || decoded.role,
                id: decoded.id
            };
        } catch (erro) {
            console.error("Erro ao decodificar o token JWT: ", erro);
            return null;
        }
    }

    async verifyAccount(email, senha){
        //document.getElementById('mensagem').textContent = "Aguarde..."
        try{
            console.log('Tentando fazer login com: ', email);
            
            const resposta = await fetch("https://localhost:5051/api/Auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({email, senha})
            });

            if (!resposta.ok) {
                const erro = await resposta.text();
                throw new Error(erro);
            }

            const data = await resposta.json();

            localStorage.setItem("token", data.token);
            //document.getElementById('mensagem').textContent = "Login realizado com sucesso!";

            const userData = this.decodeJWT(data.token);
            if (userData) {
                this.atualUser = userData;
            } else {
                console.warn("Token inválido ou sem dados de usuário.");
            }

            //await this.pickupDataOnDB(user.uid);
        } catch (error) {
            console.error('Erro no login: ', error);
            document.getElementById('mensagem').textContent = 'Erro: ' + error.message;
        }
    }

    redirect(papel){
        switch(papel){
            case 'Funcionario':
            case 'Funcionário': 
                window.location.href = '/pages/employee/main.html';
                break;
            case 'Aluno':
                window.location.href = '/pages/student/main.html';
                break;
            default: 
                console.log('Erro ao redirecionar a página.');
                window.location.href = '../pages/login.html'
                break;
        }
    }

    verifyLocalStorage(){
        const userData = this.decodeJWT(localStorage.getItem('token'));
        
        const currentPath = window.location.pathname;

        if(userData){
            this.atualUser = userData;       
            //console.log('Usuário recuperado do localStorage', this.atualUser);
                //se o usuário possui dados ele será direcionado para usa página, fazendo um login automatico
            if (currentPath.includes('login.html') || currentPath.includes('cadastro.html'))
                this.redirect(this.atualUser.papel);

            //mantém um Aluno nas páginas de aluno
            if (this.atualUser.papel === 'Aluno' && (!currentPath.includes('student') && !currentPath.includes('redefinirSenhar.html')))
                this.redirect(this.atualUser.papel);

            //matém um Funcionario nas páginas de Funcionario
            if (this.atualUser.papel === 'Funcionário' && (!currentPath.includes('employee') && !currentPath.includes('redefinirSenhar.html')))
                this.redirect(this.atualUser.papel);

        } //Se o usuário não houver dados ele será direcionado para as páginas de login
        else if (!currentPath.includes('/login.html') && !currentPath.includes('/cadastro.html') && !currentPath.includes('/redefinirSenha.html'))
            window.location.href = '/pages/login.html';
    }

    async logout() {
        localStorage.removeItem('token');
        console.log('Sessão encerrada');
        this.redirect(null);
    }
}

class User {}

class UserBuilder {
    constructor(){
        this.user = new User();
    }

    definirNome(nome){
        this.user.nome = nome;
        return this;
    }

    definirCurso(curso){
        this.user.curso = curso;
        //tem que definir o id do curso
        return this;
    }

    definirEmail(email){
        this.user.email = email;
        return this;
    }

    definirSenha(senha){
        this.user.senha = senha;
        return this;
    }

    definirRA(ra){
        this.user.ra = ra;
        return this;
    }

    definirDataCadastro(dataCadastro){
        this.user.dataCadastro = dataCadastro;
        return this;
    }

    definirPapel(papel){
        this.user.papel = papel;
        return this;
    }

    definirId(id){
        this.user.id = id;
        return this;
    }

    Build(){
        return this.user;
    }
}

const registerController = new RegisterController();
const loginController = new LoginController();

const btnCadastro = document.getElementById('btn_cadastrar');
if (btnCadastro){
    btnCadastro.addEventListener('click', async (event) =>{
        event.preventDefault();
        registerController.execute();
    });
}

const btnLogar = document.querySelector('.btn_entrar');
if (btnLogar) {
    btnLogar.addEventListener('click', async (event) => {
        event.preventDefault();
        loginController.execute();
    });
}

const btnLogout = document.querySelector('.btn-logout');
if (btnLogout) {
    btnLogout.addEventListener('click', () => {
        loginController.logout();
    });
}

loginController.verifyLocalStorage();

//------------------------------------------------------------
// ----------------------CHAMADOS-------------------------------
//------------------------------------------------------------

/**
 * A classe Chamado atua como um contêiner de dados. O seu Builder cuida da construção.
 */
class Chamado {
    constructor(){
        this.id = null;
        this.usuarioId = null;
        this.nomeAluno = '';
        this.raAluno = '';
        this.emailAluno = '';
        this.curso = '';
        this.status = 'Aberto'; //valor padrão
        this.prioridade = 'Baixa'; //valor padrão
        this.categoria = '';
        this.titulo = '';
        this.descricao = '';
        this.dataCriacao = new Date(); //valor padrão
        this.dataAtualizacao = new Date(); //valor padrão
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

    definirUsuarioId(usuarioId){
        this.chamado.usuarioId = usuarioId;
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

    definirId(id){ //Pegar do banco de dados
        this.chamado.id = id;
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
        let categoriaID;
        switch (categoria){
            case 'Acesso': 
                categoriaID = 1;
                break;
            case 'Financeiro':
                categoriaID = 2;
                break;
            case 'Email': 
                categoriaID = 3;
                break; 
            case 'Rede':
                categoriaID = 4;
                break;
            case 'Hardware':
                categoriaID = 5;
                break;
            case 'Software':
                categoriaID = 6;
                break;
            case 'Outros':
                categoriaID = 7;
                break;
            default:
                console.error('Categoria não identificada');
                return;
        }
        this.chamado.categoriaID = categoriaID;
        return this;
    }

    definirTitulo(titulo){
        this.chamado.titulo = titulo;
        return this;
    }

    definirDescricao(descricao){
        this.chamado.descricao = descricao;
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

class ControllerChamado {
    constructor(){
        this.numberPage = 0;
        this.cursorHistory = [null];
    }

    execute(){
        this.createChamado();
        this.CarregarChamados();
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
        let categoria = this.selectValueByid('formCategoria');
        let raAluno = this.selectValueByid('ra');
        let curso = this.selectValueByid('studentArea');
        let titulo = this.selectValueByid('call-title');
        let prioridade = this.definirPrioridade(titulo);
        let description = this.selectValueByid('formDescription');

        let builderChamado = new BuilderChamado();
        builderChamado
            .definirUsuarioId(loginController.atualUser.id)
            .definirCategoria(categoria)
            .definirTitulo(titulo)
            .definirDescricao(description)
            .definirPrioridade(prioridade);

        return builderChamado.Build();
    }

    adicionar(chamado){
        const tbody = document.getElementById('tbody');
        if (!tbody){
            console.error('Não foi possível encontrar o tbody');
            return;
        }
        let tr = tbody.insertRow();
        tr.classList.add('linha-clicavel');
        tr.addEventListener('click', () => {
            this.abrirDetalhesDoChamado(chamado);
        });


        let td_titulo = tr.insertCell();
        let td_status = tr.insertCell();
        let td_prioridade = tr.insertCell();
        let td_idChamado = tr.insertCell();
        let td_dataCriacao = tr.insertCell();
        let td_dataAtualizacao = tr.insertCell();
        //let td_acoes = tr.insertCell();

        td_titulo.innerHTML = `<p>${chamado.titulo}</p>`;
        td_status.innerHTML = `<p>${chamado.status}</p>`;
        td_prioridade.innerHTML = `<p>${chamado.prioridade}</p>`;
        td_idChamado.innerHTML = `<p>${chamado.id}</p>`;
        td_dataCriacao.innerHTML = `<p>${chamado.dataCriacao.toLocaleString('pt-BR')}</p>`;
        td_dataAtualizacao.innerHTML = `<p>${chamado.dataAtualizacao.toLocaleString('pt-BR')}</p>`;
        
        td_titulo.classList.add('left');

        switch(chamado.status){
            case 'Aberto': 
                td_status.classList.add('aberto');
                break;
            case 'Em andamento': 
                td_status.classList.add('em-andamento');
                break;
            case 'Resolvido': 
                td_status.classList.add('resolvido');
                break;
            default: 
                console.warn('Erro ao tentar identificar o status.');
                break;
        }

        switch(chamado.prioridade){
            case 'Baixa':
                td_prioridade.classList.add('baixa');
                break;
            case 'Média':
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

    async createChamado(){
        const token = localStorage.getItem('token');

        let chamado = this.coletarDados();
        
        if (!chamado) {
            console.error('sem chamado!?');
            return;
        }

        const chamadoFormatado = {
            UsuarioID: chamado.usuarioId,
            CategoriaID: chamado.categoriaID,
            Titulo: chamado.titulo,
            Descricao: chamado.descricao,
            Status: chamado.status,
            Prioridade: chamado.prioridade
        };

        try {
            const resposta = await fetch("https://localhost:5051/api/Chamados", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(chamadoFormatado)
            });

            if (!resposta.ok) {
                const erro = await resposta.json();
                console.error("Erro no servidor: ", erro);
                throw new Error(erro.error || "Erro ao criar chamado");
            }

            const data = await resposta.json();
            console.log("Chamado criado: ", data);
            //document.getElementById('mensagem').textContent = "Chamado criado com secesso!";
            alert("Chamado criado com sucesso!");

            this.CarregarChamados();
        } catch (erro) {
            console.error("Erro ao criar chamado: ", erro);
            //document.getElementById('mensagem').textContent = erro.message;
            alert(erro.message)
        }
    }

    clearTable(){
        const tbody = document.getElementById('tbody');
        tbody.innerText = '';
    }

    async CarregarChamados(){
        this.clearTable();

        const token = localStorage.getItem('token');

        try {
            const resposta = await fetch("https://localhost:5051/api/Chamados", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!resposta.ok) throw new Error("Erro ao carregar chamados");

            const data = await resposta.json();            
            data.forEach(ch => {
                const chamadoAdaptado = {
                    id: ch.id,
                    titulo: ch.titulo,
                    descricao: ch.descricao,
                    prioridade: ch.prioridade,
                    categoriaID: ch.categoriaID,
                    status: ch.status,
                    usuarioId: ch.usuarioID,
                    dataCriacao: new Date(ch.dataCriacao),
                    dataAtualizacao: new Date(ch.dataAtualizacao)
                };
                this.adicionar(chamadoAdaptado);                
            });
            console.log('Chamados carregados');
        } catch (erro) {
            console.error('Erro ao carregar chamados: ', erro);
            //document.getElementById('mensagem').textContent = 'Erro ao buscar chamados: ' + erro.message;
            alert('Erro ao buscar chamados: ' + erro.message);
        }
    }

    atualizarControles(isLastPage){
        const btnNextPageTable = document.getElementById('btn-next-table');
        const btnReturnPageTable = document.getElementById('btn-return-table');
        const pageNumberElement = document.getElementById('page-table');

        const nextDisable = isLastPage;
        if (btnNextPageTable){
            btnNextPageTable.disabled = nextDisable;
            btnNextPageTable.classList.toggle('disable', nextDisable);
        }

        const returnDisabled = this.numberPage === 0;
        if (btnReturnPageTable) {
            btnReturnPageTable.disabled = returnDisabled;
            btnReturnPageTable.classList.toggle('disable', returnDisabled);
        }

        if(pageNumberElement) {
            pageNumberElement.textContent = this.numberPage + 1;
        }
    }

    async abrirDetalhesDoChamado(chamado){
        const detailChamadoBox = document.querySelector('.details-chamado');
        if (!detailChamadoBox) {
            console.error('Não foi encontrado o Popup de detalhes do chamado.');
            return;
        }

        try {
            const response = await fetch(`https://localhost:5051/api/chamados/${chamado.id}`);

            if (!response.ok) {
                throw new Error(`Erro ao buscar detalhes do chamado (HTTP ${response.status})`);
            }

            const dados = await response.json();

            this.chamado = chamado;
            this.verificarResolvido(chamado);
            document.getElementById('tituloChamado').textContent = dados.titulo;
            document.getElementById('nomeAluno').textContent = dados.nomeUsuario;
            document.getElementById('raAluno').textContent = dados.ra;
            document.getElementById('cursoAluno').textContent = dados.curso; //Esse tem que mudar pra ficar bonitinho na vizualização;
            document.getElementById('emailAluno').textContent = dados.emailUsuario;
            document.getElementById('idChamado').textContent = dados.id;
            document.getElementById('categoria').textContent = dados.categoria;
            document.getElementById('status').textContent = dados.status;
            document.getElementById('prioridade').textContent = dados.prioridade;
            document.getElementById('description').textContent = dados.descricao;

            detailChamadoBox.classList.toggle('active');

            window.onclick = (event) => {
                if (event.target == detailChamadoBox) {
                    detailChamadoBox.classList.remove('active');
                }
            }

            msgController.buscarMensagens(chamado.id);
            msgController.initEventListeners(chamado.id);
        } catch (erro) {
            console.error('Erro ao abrir detalhes do chamado: ', erro);
            alert('Não foi possível carregar os detalhes do chamado. Tente novamente.');
        }
    }

    definirPrioridade(titulo){
        const tituloNormalizado = titulo.toLowerCase();

        const palavrasChave = {
            'Urgente': ["urgente", "parado", "nao funciona", "não funciona", "emergencia", "crítico", "bloqueado", "travou", "imediato"],
            'Alta': ["erro", "lento", "travando", "problema", "falha", "bug", "acidente"],
            'Média': ["ajuda", "dificuldade", "atraso", "duvida", "acesso", "instalar", "configurar"]
        };

        let prioridadeAutomatica = 'Baixa';

        for (const keyword of palavrasChave['Urgente']){
            if (tituloNormalizado.includes(keyword)) {
                prioridadeAutomatica = 'Urgente';
                return prioridadeAutomatica;
            }
        }

        for (const keyword of palavrasChave['Alta']){
            if (tituloNormalizado.includes(keyword)) {
                prioridadeAutomatica = 'Alta';
                return prioridadeAutomatica;
            }
        }

        for (const keyword of palavrasChave['Média']){
            if (tituloNormalizado.includes(keyword)) {
                prioridadeAutomatica = 'Média';
                return prioridadeAutomatica;
            }
        }

        return prioridadeAutomatica;
    }

    async atualizarChamado(status = null){
        if (!this.chamado?.id) {
            console.error("Erro: id não definido!");
            return;
        }

        const token = localStorage.getItem("token");

        const chamadoFormatado = {
            ID: this.chamado.id,
            UsuarioID: this.chamado.usuarioId,
            CategoriaID: this.chamado.categoriaID,
            Titulo: this.chamado.titulo,
            Descricao: this.chamado.descricao,
            Status: status || this.chamado.status,
            Prioridade: this.chamado.prioridade
        };
        console.log(chamadoFormatado);
        
        try {
            const response = await fetch(`https://localhost:5051/api/chamados/${this.chamado.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(chamadoFormatado)
            });

            if(!response.ok){
                const erro = await response.text();
                throw new Error(`Erro ao atualizar chamado: ${erro}`);
            }

            if (response.status === 204){
                console.log("Chamado atualizado com sucesso!");
                
            }

            const text = await response.text();
            if (text) {
                const chamadoAtualizado = await response.json();
                console.log("Chamado atualizado: ", chamadoAtualizado);
                this.chamado = chamadoAtualizado;
            }
            

        } catch (error) {
            console.error("Erro ao tentar atualizar o documento do chamado: ", error);
            
        }
    }

    verificarResolvido(chamado){
        if(chamado.status === 'Resolvido'){
            this.fecharbtnFinalizarChamado();
            this.fecharControlesDoChat();
            this.fecharChatIA();
        } else {
            this.abrirbtnFinalizarChamado();
            this.abrirControlesDoChat();
            this.abrirChatIA();
        }
    }

    fecharbtnFinalizarChamado(){
        const btnFinalizarChamado = document.getElementById('finalizarCadastro');
        if (btnFinalizarChamado){
            btnFinalizarChamado.classList.add('resolvido-config');
        }
    }

    abrirbtnFinalizarChamado(){
        const btnFinalizarChamado = document.getElementById('finalizarCadastro');
        if (btnFinalizarChamado && btnFinalizarChamado.classList.contains('resolvido-config')){
            btnFinalizarChamado.classList.remove('resolvido-config');
        }
    }

    fecharControlesDoChat(){
        const controlsChat = document.getElementById('controls-chat');
        if (controlsChat){
            controlsChat.classList.add('resolvido-config');
        }
    }

    abrirControlesDoChat(){
        const controlsChat = document.getElementById('controls-chat');
        if (controlsChat && controlsChat.classList.contains('resolvido-config')){
            controlsChat.classList.remove('resolvido-config');
        }
    }

    fecharChatIA(){
        const iaBox = document.querySelector('.ia-box');
        if (iaBox) {
            iaBox.classList.add('resolvido-config');
        }
    }

    abrirChatIA(){
        const iaBox = document.querySelector('.ia-box');
        if (iaBox && iaBox.classList.contains('resolvido-config')) {
            iaBox.classList.remove('resolvido-config');
        }
    }
}


const controllerChamado = new ControllerChamado();


const btnAddCall = document.getElementById('addCall');
if (btnAddCall){
    btnAddCall.addEventListener('click', () => {
        controllerChamado.execute();
        
        document.getElementById('studentName').value = '';
        document.getElementById('studentEmail').value = '';
        document.getElementById('formCategoria').value = '';
        document.getElementById('ra').value = '';
        document.getElementById('studentArea').value = '';
        document.getElementById('call-title').value = '';
        document.getElementById('formDescription').value = '';
    });
}

//quando cancela fecha a janela e define todos os campos para ficarem vazios
const btnCancelCall = document.querySelector('.btn_cancel');
if (btnCancelCall){
    btnCancelCall.addEventListener('click', () => {
        document.getElementById('studentName').value = '';
        document.getElementById('studentEmail').value = '';
        document.getElementById('fromCategoria').value = '';
        document.getElementById('ra').value = '';
        document.getElementById('studentArea').value = '';
        document.getElementById('call-title').value = '';
        document.getElementById('formDescription').value = '';
    });
}

const tbody = document.getElementById('tbody');
if (tbody){
    document.addEventListener('DOMContentLoaded', async () => {
        //const { nextCursor, isLastPage } = await controllerChamado.CarregarChamados();

        //controllerChamado.cursorHistory.push(nextCursor);

        //controllerChamado.atualizarControles(isLastPage);
        await controllerChamado.CarregarChamados();
    });
}

const btnCloseDetailsChamado = document.querySelector('.close-details-chamado');
if (btnCloseDetailsChamado){
    btnCloseDetailsChamado.addEventListener('click', () => {
        const detailChamadoBox = document.querySelector('.details-chamado');
        if (!detailChamadoBox) {
            console.error('Não foi encontrado o Popup de detalhes do chamado.');
            return;
        }
        detailChamadoBox.classList.toggle('active');
        const chatIA = document.querySelector('.chat-ia');
        if(chatIA && chatIA.classList.contains('active')){
            chatIA.classList.remove('active');
            const respostaIA = document.getElementById('resposta-ia');
            respostaIA.textContent = '';
        }
        controllerChamado.CarregarChamados();
    });
}

const btnReturnPageTable = document.getElementById('btn-return-table');
if(btnReturnPageTable){
    btnReturnPageTable.addEventListener('click', async () =>{
        if (controllerChamado.numberPage > 0) {
            controllerChamado.numberPage--;
        }

        const startCursor = controllerChamado.cursorHistory[controllerChamado.numberPage];

        const { isLastPage } = await controllerChamado.CarregarChamados(startCursor);

        controllerChamado.atualizarControles(isLastPage);
    });
}

const btnNextPageTable = document.getElementById('btn-next-table');
if (btnNextPageTable){
    btnNextPageTable.addEventListener('click', async () => {
        const newPageIndex = controllerChamado.numberPage + 1;

        let startCursor = controllerChamado.cursorHistory[newPageIndex];

        if(!startCursor) {
            startCursor = controllerChamado.cursorHistory[controllerChamado.numberPage];
        }

        const { nextCursor, isLastPage} = await controllerChamado.CarregarChamados(startCursor);

        controllerChamado.numberPage = newPageIndex;

        if (newPageIndex >= controllerChamado.cursorHistory.length && !isLastPage)
            controllerChamado.cursorHistory.push(nextCursor);

        controllerChamado.atualizarControles(isLastPage);
    });
}

const btnFinalizarChamado = document.getElementById('finalizarCadastro');
if (btnFinalizarChamado) {
    btnFinalizarChamado.addEventListener('click', async () => {
        await controllerChamado.atualizarChamado('Resolvido');
        //alert('Chamado resolvido com sucesso!');

        const detailChamadoBox = document.querySelector('.details-chamado');
        if (!detailChamadoBox) {
            console.error('Não foi encontrado o Popup de detalhes do chamado.');
            return;
        }
        detailChamadoBox.classList.toggle('active');

        controllerChamado.CarregarChamados();
    });
}

const btnRefreshChamado = document.querySelector('.btn_refresh');
if (btnRefreshChamado) {
    btnRefreshChamado.addEventListener('click', () => {
        controllerChamado.CarregarChamados();
    });
}



//------------------------------------------------------------
//---------------------EXIBIÇÃO DE TELA-----------------------
//------------------------------------------------------------

class ChangeText{
    changeText(user){
        const elementProfileName = document.getElementById('pg_name');
        if (elementProfileName && user.email)
            elementProfileName.textContent = user.email;
        else 
            elementProfileName.textContent = 'Error Name'

        const elementProfileFunction = document.getElementById('pg_function');
        if (elementProfileFunction && user.papel)
            elementProfileFunction.textContent = user.papel;
        else
            elementProfileFunction.textContent = 'Error Function';
    }
}

const changeText = new ChangeText();
if (loginController.atualUser)
    changeText.changeText(loginController.atualUser);

//------------------------------------------------------------
//------------------------CHAT ONLINE-------------------------
//------------------------------------------------------------

class Msg {}

class MsgBuilder {
    constructor(){
        this.msg = new Msg();
    }

    definirChamadoId(chamadoId){
        this.msg.chamadoId = chamadoId;
        return this;
    }

    definirUsuarioId(usuarioId){
        this.msg.usuarioId = usuarioId;
        return this;
    }

    definirMensagem(mensagem){
        this.msg.mensagem = mensagem;
        return this;
    }

    definirDataEnvio(dataEnvio){
        this.msg.dataEnvio = dataEnvio;
        return this;
    }

    build(){
        if (!this.msg.usuarioId || !this.msg.chamadoId || !this.msg.mensagem) {
            console.error("Tentativa de construir mensaegm incompleta.");
            return null;
        }
        return this.msg;
    }
}

class MsgController {
    constructor( loginController){
        this.loginController = loginController;
    }


    /**
     * @description Ponto de entrada para anexar listeners aos botões
     * @param {string} chamadoId - O Id do chamado que está sendo resolvido
     */
    initEventListeners(chamadoId) {
        const btnEnviarMsg = document.getElementById('enviar-msg');
        if (btnEnviarMsg){
            btnEnviarMsg.onclick = () => {
                this.enviarMensagem(chamadoId);
                this.buscarMensagens(chamadoId);
            };
        }
    }

    /**
     * Envia uma nova mensagem para o Firestore.
     * @param {string} chamadoId - O Id do chamado para o qual a mensagem será enviada.
     */
    async enviarMensagem(chamadoId){
        const infos = this.lerMensagem(chamadoId);
        if (!infos) {
            console.warn('Mensagem vazia ou dados de sessão ausentes. Não foi enviado.');
            return;
        }

        const mensagem = this.criarMensagem(infos);
        if(!mensagem){
            console.log('Erro ao tentar criar o objeto da mensagem.');
            return;
        }

        try {
            const response = await fetch("https://localhost:5051/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    ChamadoID: mensagem.chamadoId,
                    UsuarioID: mensagem.usuarioId,
                    Mensagem: mensagem.mensagem

                })
            });

            if (!response.ok) throw new Error("Erro ao enviar mensagem");

            const data = await response.json();
            console.log("Mensagem enviada: ", data);
            
            document.getElementById('escrever-msg').value = '';
            if(loginController.atualUser.papel == 'Funcionario' && controllerChamado.chamado.status != 'Em andamento')
                controllerChamado.atualizarChamado('Em andamento')

        } catch (error){
            console.error("Erro ao enviar a mensagem:", error);
        }
    }

    /**
     * @description Lê os dados do DOM para criar uma mensagem.
     * @param {string} chamadoId - O Id do chamado atual.
     * @returns {Object | null} Um objeto com os dados ou null se falhar.
     */
    lerMensagem(chamadoId){
        const inputMsg = document.getElementById('escrever-msg');
        const mensagem = inputMsg ? inputMsg.value.trim() : null;

        if(!mensagem){
            console.error('A mesagem está vazia.');
            //mostrar um erro visual para o usuário
            return null;
        }

        if(!chamadoId){
            console.error('Erro ao tentar ler o id do Chamado.');
            return null;
        }
            
        const usuarioId = this.loginController.atualUser?.id;
        if (!usuarioId) {
            console.error('Erro ao tentar identificar o id do usuário.');
            return null;
        }

        return {mensagem, chamadoId, usuarioId};
    }

    /**
     * @description Constrói o objeto Msg usando o MsgBuilder.
     * @param {Object} infos - O objeto retornado por lerMensagem, ou para mandar uma mensagem nova.
     * @returns {Msg} O objeto Msg construído.
     */
    criarMensagem(infos){
        const mensagem = new MsgBuilder().definirChamadoId(infos.chamadoId)
            .definirUsuarioId(infos.usuarioId)
            .definirMensagem(infos.mensagem)
            .definirDataEnvio(new Date())
            .build();

        return mensagem;
    }

    /**
     * @description Configura o listener (onSnapshot) para carregar e ouvir novas mensagens.
     * @param {string} chamadoId - O Id do chamado que o susário está vendo.
     */
    async buscarMensagens(chamadoId){
        if (chatInterval){
            clearInterval(chatInterval);
            chatInterval = null;
        }

        const chatDisplay = document.getElementById('ver-msg');
        chatDisplay.innerHTML = '';

        try {
            const response = await fetch(`https://localhost:5051/api/chat/${chamadoId}`, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });

            if (response.status === 404) {
                console.log("Ainda não há mensagens para este chamado.");
                return[];
            }
            if (!response.ok) throw new Error("Erro ao buscar mensagens");

            const popupDetailsChamado = document.querySelector('.details-chamado');
            const mensagens = await response.json();

            mensagens.forEach(msg => {                
                this.adicionarMensagem({
                    mensagem: msg.mensagem,
                    usuarioId: msg.usuarioID,
                    dataEnvio: new Date(msg.dataEnvio)
                });
            });

            window.chamadoAtivoId = chamadoId;
            if(popupDetailsChamado.classList.contains('active')){
                
                chatInterval = setInterval( async () => {
                    if (window.chamadoAtivoId !== chamadoId) 
                        this.buscarMensagens(chamadoId);
                }, 3000);
            } else
                clearInterval(chatInterval)
             

            
        } catch (erro) {
            console.error("Erro ao buscar mensagens: ", erro);
        }
    }

    /**
     * @description Adiciona as mensagens na tela
     * @param {Msg} mensagem - A mensagem que buscada no banco de dados do buscarMensagem
     */
    adicionarMensagem(mensagem){
        const chatDisplay = document.getElementById('ver-msg');
        if (!chatDisplay) {
            console.error('Não foi possível identificar a área do chat.');
            return;
        }

        const currentUserId = this.loginController.atualUser.id;
        const isCurrentUser = mensagem.usuarioId == currentUserId;
        

        const messageWrapper = document.createElement('div');
        messageWrapper.classList.add('balao-de-fala');
        messageWrapper.classList.add(isCurrentUser ? 'usuario-atual' : 'outro-usuario');

        const txt = document.createElement('p');
        txt.classList.add('mensagem-txt');
        txt.textContent = mensagem.mensagem;

        const dataMsg = document.createElement('span');
        dataMsg.classList.add('message-time');

        const timeStr = mensagem.dataEnvio && typeof mensagem.dataEnvio.toLocaleString === 'function' ? mensagem.dataEnvio.toLocaleString('pt-BR') : '';

        dataMsg.textContent = timeStr;

        messageWrapper.appendChild(txt);
        messageWrapper.appendChild(dataMsg);
        chatDisplay.appendChild(messageWrapper);
    }
}
let chatInterval = null;
const msgController = new MsgController(loginController);


//------------------------------------------------------------------
//---------------------------GEMINI AI------------------------------
//------------------------------------------------------------------

//import { ConsultarIA } from "./index.js";

const displayResposta = document.getElementById('resposta-ia');

const btnConsultarIA = document.getElementById('consultarIA');
if (btnConsultarIA) {
    btnConsultarIA.addEventListener('click', () => {
        const pergunta = document.getElementById('description').textContent;

        
        displayResposta.textContent = 'Consultando IA...';

        fetch('http://localhost:3000/resposta-ia', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify ({
                prompt: pergunta
            })
        })
            .then(res => res.json())
            .then(dados => {
                displayResposta.innerHTML = dados.resposta
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/\n/g, '<br>');

            })
            .catch(err => console.error('Erro:', err));

        const chatIA = document.querySelector('.chat-ia');
        if (chatIA) {
            chatIA.classList.add('active');
        }
        const displayDadosChamado = document.querySelector('.dados-chamado');
        if (displayDadosChamado) {
            displayDadosChamado.scrollTop = displayDadosChamado.scrollHeight
        }
    });
}

const simRespondido = document.getElementById('sim-respondido');
if (simRespondido) {
    simRespondido.addEventListener('click', () => {
        controllerChamado.atualizarChamado('Resolvido');
        controllerChamado.verificarResolvido();
        alert('O chamado foi marcado como resolvido. As opções de interação foram desativadas.');
        
    });
}

const naoRespondido = document.getElementById('nao-respondido');
if (naoRespondido) {
    naoRespondido.addEventListener('click', () => {
        controllerChamado.fecharChatIA();
        alert('Entendido. Por favor, utilize o chat principal para detalhar sua dúvida.');
    });
}

