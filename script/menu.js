//Classe que faz adiciona a classe active aos elementos (usada, principalmente, para trazer janelas para a tela).
class PushPopup {
    //identifica qual o elemento e retorna ele
    //caso o elemento não exista ele retorna uma mensagem de erro e encerra o método.
    select(className) {
        const elemento = document.querySelector(className)
        
        if (!elemento) {
            console.log(`Elemento ${className} não encontrado`);
            return;
        }
        return elemento;

    }

    //adiciona a classe active ao elemento resignado
    pushPopup(className){
        const popup = this.select(className);
        
        popup.classList.toggle('active');
    }
}

const pushPopup = new PushPopup();

//---------------SIDE BAR------------------------
//busca o sidebar e o botão que puxa ele
const btnMenu = document.querySelector('.menu');
if(btnMenu){
    btnMenu.addEventListener('click', () => {
        pushPopup.pushPopup('nav');
        btnMenu.classList.toggle('none');
        //menu.classList.toggle('active');
        //sidebar.classList.toggle('active');
    });
}



const btnCloseMenu = document.querySelector('.close-nav');
if(btnCloseMenu){
    btnCloseMenu.addEventListener('click', () => {
        pushPopup.pushPopup('nav');
        btnMenu.classList.toggle('none');
    });
}




//-----------------SETTINGS-----------------------
const btnSettings = document.querySelector('.btn-settings');
if(btnSettings){
    btnSettings.addEventListener('click', () => {
        pushPopup.pushPopup('.settings-itens');
    });
}



const btnCloseSettings = document.querySelector('.close-settings');
if(btnCloseSettings){
    btnCloseSettings.addEventListener('click', () => {
        pushPopup.pushPopup('.settings-itens');
    });
}



//filter

//------------------MUDAR TEMA-----------------------
class AddClasses {
    select(classElement) {
        const elemento = document.querySelector(classElement)
        
        if (!elemento) {
            console.log(`Elemento ${classElement} não encontrado`);
            return;
        }
        return elemento;
    }

    addDarkLightMode(classElement) {
        const elemento = this.select(classElement);
        elemento.classList.toggle('light-mode');
        elemento.classList.toggle('dark-mode');
    }
}
const  addClasses = new AddClasses();

const btnChangeTheme = document.querySelector('.change-theme');
if(btnChangeTheme){
    btnChangeTheme.addEventListener('click', () =>{
        addClasses.addDarkLightMode('.settings-itens');
        addClasses.addDarkLightMode('main');
        addClasses.addDarkLightMode('.newcall-box');
        addClasses.addDarkLightMode('.details-chamado');
    });

}
//------------NOVOS CHAMADOS-----------------------
//procura o botão de adicionar chamados
const btnPushNewCall = document.querySelector('.pushnewcallbox');
if(btnPushNewCall){
    //adiciona um evento de click que coloca a classe active do popup de criar chamados no botão de Adicionar chamados
    btnPushNewCall.addEventListener('click', () => {
        pushPopup.pushPopup('.newcall-box');
    });
}



//procura o botão de cancelar chamados
const btnCancelarNewCall = document.querySelector('.btn_cancel')
if(btnCancelarNewCall){
    //adiciona um evento de click que tira a classe active do popup de criar chamados no botão de cancelar
    btnCancelarNewCall.addEventListener('click', () => {
        pushPopup.pushPopup('.newcall-box');
    });
}



const btnCreateNewCall = document.getElementById('addCall');
if(btnCreateNewCall){
    btnCreateNewCall.addEventListener('click', async (event) => {
        event.preventDefault();
        pushPopup.pushPopup('.newcall-box');
    });
}

//----------------------ABRINDO CHAMADO------------------------


