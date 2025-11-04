import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";

import { getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

import {getFirestore,
    doc,
    setDoc,
    getDoc,
    addDoc,
    collection,
    query,
    limit,
    orderBy,
    getDocs,
    startAfter
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";



// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBG_PNzb1E1kKQT_Tl55oKa9aQJ3LJz6Jw",
  authDomain: "tecporte-89d32.firebaseapp.com",
  projectId: "tecporte-89d32",
  storageBucket: "tecporte-89d32.firebasestorage.app",
  messagingSenderId: "324186749183",
  appId: "1:324186749183:web:85e42b67eb766ca86eb4ca"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export class RegisterController {
    $(id){
        return document.getElementById(id).value;
    }

    async execute(){
        this.user = this.pickupData();
        if (!this.user) return;
        
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, this.user.email, this.user.senha);
            
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                nome: this.user.nome,
                email: this.user.email,
                curso: this.user.curso || null,
                dataCadastro: this.user.dataCadastro,
                papel: this.user.papel
            }); 

            alert('Conta criada e salva com sucesso!');
        } catch (error){
            let mensagemErro = "Ocorreu um erro desconhecido.";
        
            switch(error.code) {
                case 'auth/email-already-in-use':
                    mensagemErro = 'O e-mail fornecido já está em uso.';
                    break;
                case 'auth/weak-password':
                    mensagemErro = 'A senha deve ter pelo menos 6 caracteres.';
                    break;
                default:
                    mensagemErro = error.message;
            }
            console.error("Erro ao criar conta:", error.code, error.message);
            alert(`Erro ao cadastrar: ${mensagemErro}`);
        }
    }

    pickupData(){
        this.nome = this.$('nomecompleto');
        this.curso = this.$('curso');
        this.email = this.$('c_email');
        this.senha1 = this.$('c_senha');
        this.senha2 = this.$('c_confirmar_senha');
        
        if(this.verifyPassword(this.senha1, this.senha2))
            return this.newUser();
        return;
    }

    verifyPassword(senha1, senha2){
        if (senha1 == senha2)
            return true;

        alert('As senhas são diferentes, escreva de novo.');
        return false;
    }

    newUser(){
        let user = new UserBuilder()
        .definirNome(this.nome)
        .definirCurso(this.curso)
        .definirEmail(this.email)
        .definirSenha(this.senha2)
        .definirPapel('Funcionário')
        .definirDataCadastro(new Date().toLocaleDateString())
        .Build();

        return user;
    }

}

class LoginController {
    constructor(){
        this.AtualUser = null;
    }
    $(id){
        return document.getElementById(id).value;
    }

    async execute(){
        if (this.pickupInfo()){
            await this.verifyAccount();
            if (this.AtualUser){
                this.redirect(this.AtualUser.papel);
                let changeText = new ChangeText();
                changeText.changeText(this.AtualUser);
            }
            else
                console.log('Login ok, mas não está carregando os dados.');
        }
    }
    
    pickupInfo(){
        this.email = this.$('email');
        this.senha = this.$('loginPass');

        if (!this.email || !this.senha){
            alert('Por favor, preencha e-mail e senha.')
            return false;
        }
        return true;
    }

    async verifyAccount(){
        try{
            console.log('Tentando fazer login com: ', this.email);
            
            const userCredential = await signInWithEmailAndPassword(auth, this.email, this.senha);

            const user = userCredential.user;
            console.log('Login bem-sucedido! UID: ', user.uid);
            alert('Login realizado com sucesso! Redirecionando...')
            
            await this.pickupDataOnDB(user.uid);
            
        } catch (error) {
            console.error('Deu erro no login', error.code, error.message);

            let mensagemErro = 'Ocorreu um erro ao tentar fazer login.';

            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential')
                mensagemErro = 'E-mail ou senha incorretos. Tente novamente.';
            
            alert(mensagemErro);
        }
    }

    redirect(papel){
        switch(papel){
            case 'Funcionário': 
                window.location.href = '/pages/employee/main.html';
                break;
            case 'Aluno':
                window.location.href = '';
                break;
            default: 
                console.log('Erro ao redirecionar a página.');
                break;
        }
    }

    async pickupDataOnDB(uid){
        try {
            const docSnap = await getDoc(doc(db, "users", uid));
            if(docSnap.exists()){
                console.log("Dados do usuário encontrados: ", docSnap.data());

                const {
                    nome,
                    curso,
                    dataCadastro,
                    email,
                    papel,
                } = docSnap.data();

                this.AtualUser = new UserBuilder()
                    .definirNome(nome)
                    .definirEmail(email)
                    .definirCurso(curso)
                    .definirPapel(papel)
                    .definirDataCadastro(dataCadastro)
                    .Build();

                console.log(this.AtualUser);
                console.log(this.AtualUser.papel);

                localStorage.setItem('perfilUsuarioTecPorte', JSON.stringify(this.AtualUser));

                return docSnap.data();

            } else {
                console.log("Nenhum documento de perfil encontrado para este usuário!");
                return null;
            }
        } catch (error) {
            console.error("Erro ao buscar dados do Firestore: ", error);
            return null;
        }
    }

    verifyLocalStorage(){
        let user = localStorage.getItem('perfilUsuarioTecPorte');
        const currentPath = window.location.pathname;
        if(user){
            this.AtualUser = JSON.parse(user);            
            console.log('Usuário recuperado do localStorage');
            if (currentPath.includes('login.html') || currentPath.includes('cadastro.html'))
                this.redirect(this.AtualUser.papel);
        }
        else if (!currentPath.includes('/login.html') && !currentPath.includes('/cadastro.html') && !currentPath.includes('/redefinirSenha.html'))
            window.location.href = '/pages/login.html';
    }

    async logout() {
        try {
            localStorage.removeItem('perfilUsuarioTecPorte');
            console.log('Dados do perfil removidos do localStorage.');

            await signOut(auth);
            console.log('Sessão do Firebase encerrada com sucesso.');

            window.location.href = '/pages/login.html';
        } catch (error) {
            console.error('Erro durante o logout: ', error);
            alert('Ocorreu um erro ao tentar fazer logout. Tente Novamente.');
            
            localStorage.removeItem('perfilUsuarioTecPorte');
            window.location.href = '/pages/login.html';
        }
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

    Build(){
        return this.user;
    }
}

let registerController = new RegisterController();
let loginController = new LoginController();

const btnCadastro = document.querySelector('.btn_cadastrar');
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
        this.dataCriacao = new Date(); //valor padrão
        this.dataAtualizacao = new Date(); //valor padrão
    }

    toFirestore(){
        return {
            userID: this.userID,
            nomeAluno: this.nomeAluno,
            raAluno: this.raAluno,
            emailAluno: this.emailAluno,
            curso: this.curso,
            status: this.status,
            prioridade: this.prioridade,
            categoria: this.categoria,
            tituloChamado: this.tituloChamado,
            descricaoChamado: this.descricaoChamado,
            dataCriacao: this.dataCriacao,
            dataAtualizacao: this.dataAtualizacao
        };
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
        let nomeAluno = this.selectValueByid('studentName');
        let emailAluno = this.selectValueByid('studentEmail');
        let categoria = this.selectValueByid('formCategoria');
        let raAluno = this.selectValueByid('ra');
        let curso = this.selectValueByid('studentArea');
        let prioridade = this.selectValueByid('priority');
        let tituloChamado = this.selectValueByid('call-title');
        let description = this.selectValueByid('formDescription');

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
        let td_data = tr.insertCell();
        let td_dataAtualizacao = tr.insertCell();
        //let td_acoes = tr.insertCell();

        td_titulo.innerHTML = `<p>${chamado.tituloChamado}</p>`;
        td_status.innerHTML = `<p>${chamado.status}</p>`;
        td_prioridade.innerHTML = `<p>${chamado.prioridade}</p>`;
        td_idChamado.innerHTML = `<p>${chamado.idChamado}</p>`;
        td_data.innerHTML = `<p>${chamado.dataCriacao}</p>`;
        td_dataAtualizacao.innerHTML = `<p>${chamado.dataAtualizacao}</p>`;

        td_titulo.classList.add('left');

        switch(chamado.status){
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
        let chamado = this.coletarDados();
        if (!chamado) {
            console.error('sem chamado!?');
            return;
        }
        const chamadosCollectionRef = collection(db, "chamados");
        if (!chamadosCollectionRef){
            console.error('Amigão não deu certo essa conexão com o banco ai');
            return;
        }

        try {
            let docRef = await addDoc(chamadosCollectionRef, chamado.toFirestore()); 
            console.log('Id do chamado: ', docRef.id);
            
        } catch (error){
            console.error("Erro ao adicionar o chamado:", error);
        }
    }

    clearTable(){
        const tbody = document.getElementById('tbody');
        tbody.innerText = '';
    }

    async CarregarChamados(startAfterDoc = null){
        this.clearTable();

        const PAGE_SIZE = 10;

        const chamadosCollectionRef = collection(db, "chamados");

        let q = query(chamadosCollectionRef, orderBy('dataCriacao', 'desc'), limit(PAGE_SIZE));

        if (startAfterDoc) {
            q = query(chamadosCollectionRef, orderBy('dataCriacao', 'desc'), startAfter(startAfterDoc), limit(PAGE_SIZE));
        }

        try {
            const querySnaptshot = await getDocs(q);

            querySnaptshot.forEach((doc) => {
                const dados = doc.data();
                dados.idChamado = doc.id;
                this.adicionar(dados);
            });

            const isLastPage = querySnaptshot.docs.length < PAGE_SIZE;
            const nextCursor = isLastPage ? null : querySnaptshot.docs[querySnaptshot.docs.length - 1];

            return { nextCursor, isLastPage };
        } catch (error) {
            console.error("Erro ao buscar chamados:", error);
            return {nextCursor: null, isLastPage: true};
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

    abrirDetalhesDoChamado(chamado){
        const detailChamadoBox = document.querySelector('.details-chamado');
        if (!detailChamadoBox) {
            console.error('Não foi encontrado o Popup de detalhes do chamado.');
            return;
        }

        document.getElementById('tituloChamado').textContent = chamado.tituloChamado;
        document.getElementById('nomeAluno').textContent = chamado.nomeAluno;
        document.getElementById('raAluno').textContent = chamado.raAluno;
        document.getElementById('cursoAluno').textContent = chamado.curso; //Esse tem que mudar pra ficar bonitinho na vizualização;
        document.getElementById('emailAluno').textContent = chamado.emailAluno;
        document.getElementById('idChamado').textContent = chamado.idChamado;
        document.getElementById('categoria').textContent = chamado.categoria;
        document.getElementById('status').textContent = chamado.status;
        document.getElementById('prioridade').textContent = chamado.prioridade;
        document.getElementById('description').textContent = chamado.descricaoChamado;

        detailChamadoBox.classList.toggle('active');
        window.onclick = (event) => {
            if (event.target == detailChamadoBox) {
                detailChamadoBox.classList.remove('active');
            }
        }
    }
}


const controllerChamado = new ControllerChamado();

//melhorar esse addEventListener ai
const btnAddCall = document.getElementById('addCall');
if (btnAddCall){
    btnAddCall.addEventListener('click', () => {
        controllerChamado.execute();
        
        document.getElementById('studentName').value = '';
        document.getElementById('studentEmail').value = '';
        document.getElementById('formCategoria').value = '';
        document.getElementById('ra').value = '';
        document.getElementById('studentArea').value = '';
        document.getElementById('priority').value = 'low';
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
        document.getElementById('categoria').value = '';
        document.getElementById('ra').value = '';
        document.getElementById('studentArea').value = '';
        document.getElementById('priority').value = 'low';
        document.getElementById('call-title').value = '';
        document.getElementById('formDescription').value = '';
    });
}

const tbody = document.getElementById('tbody');
if (tbody){
    document.addEventListener('DOMContentLoaded', async () => {
        const { nextCursor, isLastPage } = await controllerChamado.CarregarChamados();

        controllerChamado.cursorHistory.push(nextCursor);

        controllerChamado.atualizarControles(isLastPage);
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



//------------------------------------------------------------
//---------------------EXIBIÇÃO DE TELA-----------------------
//------------------------------------------------------------

class ChangeText{
    changeText(user){
        const elementProfileName = document.getElementById('pg_name');
        if (elementProfileName && user.nome)
            elementProfileName.textContent = user.nome;
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
if (loginController.AtualUser)
    changeText.changeText(loginController.AtualUser);