// Para ter acesso a todos botões de notificação
let enableNotificationsButtons = document.querySelectorAll('.btn.btn-outline-light');


// Verificar se o navegador suporta ServiceWorker e registar SW
if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js')
        .then(function () {
            console.log('Service worker registered!');
        }).catch(function (err) {
            console.log(err);
        });
};

// Verificar se tem permissão
function displayConfirmNotification() {
    // Verificar se o ServiceWorker tem suporte no navegador
    if ('serviceWorker' in navigator) {

        // chamar uma nova notificação
        let options = {
            body: 'You successfully subscribed to our Notification servive!',
            icon: '/src/images/icons/icon-192x192.png',
            dir: 'ltr',
            vibrate: [100, 50, 200],
            badge: '/src/images/icons/icon-192x192.png',
            actions: [
                { action: 'confirm', title: 'Okay', icon: '/src/images/verificar.png' },
                { action: 'cancel', title: 'Cancel', icon: '/src/images/close.png' }
            ]
        };

        navigator.serviceWorker.ready
            .then(function (swreg) {
                swreg.showNotification('Sucessfully subscribed (from SW)!', options);

            });
    }
};

function askForNotificationPermission() {
    // Permissão para enviar ou exibir notificações
    Notification.requestPermission(function (result) {
        console.log('User Choice', result);
        // resultado negado
        if (result !== 'granted') {
            console.log('No notification permission granted! ');
        } else {

            //configurePushsub();
            displayConfirmNotification();
        }
    });
};

// Mostrar o botão de notificação caso o navegador tenha suporte
if ('Notification' in window && 'serviceWorker' in navigator) {
    // manipular todos os botões de notificações
    for (let i = 0; i < enableNotificationsButtons.length; i++) {
        enableNotificationsButtons[i].style.display = 'inline-block';
        enableNotificationsButtons[i].addEventListener('click', askForNotificationPermission);
    }
};

class Mylist {
    constructor(name, quantity) {
        this.name = name
        this.quantity = quantity
    }

    // Método para validar dados 
    validateData() {
        // Recuperar todos atributos do objeto
        for (let i in this) {
            if (this[i] == undefined || this[i] == '' || this[i] == null) {
                return false
            }
        }
        return true
    }
};

// Classe para criação da Base de dados
class Bd {

    //método constructor para verificar se existe o id
    constructor() {
        let id = localStorage.getItem('id')

        // Caso não exista o id, passamos o valor da chave 
        if (id === null) {
            localStorage.setItem('id', 0)
        }

    };

    // Função para verificar se já existe um id em localStorage
    getId() {
        let nextId = localStorage.getItem('id')

        // o retorno será o id atualizado + 1
        return parseInt(nextId) + 1;
    };

    // método gravar do qual recebe um parâmetro e insere esse parâmetro no LocalStorage
    record(l) {

        let id = this.getId()

        localStorage.setItem(id, JSON.stringify(l))

        // para atualizar o valor contido dentro da chave id
        localStorage.setItem('id', id)
    };

    // Criar um método para recuperar os registos 
    recoverAllRecords() {

        // Array de filmes 
        let lists = Array()

        let id = localStorage.getItem('id')

        //recuperar minha lista de filmes cadastrado em localStorage
        for (let i = 1; i <= id; i++) {

            // recuperar o filme
            let list = JSON.parse(localStorage.getItem(i)) // JSON.parse para converter JSON em objeto literal

            // Verificar se existe a possibilidade de haver índices que foram pulados / removidos
            if (list === null) {
                continue
            }

            // Incluir o método id para recuperar os dados 
            list.id = i
            // Método push para passar os valores para o array 
            lists.push(list)
        }

        return lists;
    };

    remove(id) {
        localStorage.removeItem(id)
    }

};

// Instanciar o objeto
let bd = new Bd()

function registerList() {


    let name = document.getElementById('name')
    let quantity = document.getElementById('quantity')


    let myList = new Mylist(
        name.value,
        quantity.value,
    )

    // dialog sucess 
    if (myList.validateData()) {
        // Chamar o objeto, executar o método record e passar o objeto mylist como parâmetro
        bd.record(myList)

        // Para criar o modal de sucesso de forma programática
        document.getElementById('modal_title').innerHTML = 'Successful registration'
        document.getElementById('div_title').className = 'modal-header text-success'
        document.getElementById('modal_content').innerHTML = 'Successfully registered'
        document.getElementById('modal_btn').innerHTML = 'Back'
        document.getElementById('modal_btn').className = 'btn btn-success'

        // Para Limpar os Campos 
        name.value = ''
        quantity.value = ''


    } else {
        // error

        // modal de erro  
        document.getElementById('modal_title').innerHTML = 'Error'
        document.getElementById('div_title').className = 'modal-header text-danger'
        document.getElementById('modal_content').innerHTML = 'Error, please check that all fields have been filled in correctly.'
        document.getElementById('modal_btn').innerHTML = 'Back and correct'
        document.getElementById('modal_btn').className = 'btn btn-danger'

        // FALTA VERIFICAR COMO CHAMAR A MODAL VIA JAVASCRIPT

        document.addEventListener("DOMContentLoaded", function () {
            let btn = document.getElementById("exampleModal");

            btn.addEventListener("click", function () {
                let myModal = new bootstrap.Modal(document.getElementById("modal_bnt"));
                myModal.show();
            });
        });

    }
};

// percorrer o array, listando cada item de forma dinâmica
function loadMyList(lists = Array()) {

    if (lists.length == 0) {
        lists = bd.recoverAllRecords()
    };

    // Selecionar o elemento tbody
    let shoppingList = document.getElementById('shoppingList');
    shoppingList.innerHTML = ''

    // Percorrer o array lists 
    lists.forEach(function (l) {


        // Criar a linha  
        let row = shoppingList.insertRow();
        row.className = 'justify-content-center containeir-marcador'


        // Criar as colunas 
        row.insertCell(0).innerHTML = `${l.name} (${l.quantity})`

        // criar o botão de exclusão
        let btn = document.createElement('button')
        btn.className = 'btn btn-danger'
        btn.innerHTML = 'x'
        btn.id = `id_item_${l.id}`
        btn.onclick = function () {
            // remover a despesa 
            let id = this.id.replace('id_item_', '')

            bd.remove(id)
            window.location.reload() // Para atualizar a página 
        }
        row.insertCell(1).append(btn)

        console.log(l);
    })

};

function insertList() {
    let name = document.getElementById('name').value
    let quantity = document.getElementById('quantity').value

    let list = new Mylist(name, quantity)

    // recuperar bd  
    let lists = bd.recoverAllRecords(list)

    loadMyList(lists, true)

}






