function CurrencyFormatter(value) {
    return `${value.toString()}`.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

const address = "http://10.0.0.154:5000";

async function getTransactions() {
    let response = await fetch(address + "/transaction");
    let result = await response.json();
    let data = result["data"];
    let list = document.getElementById("transactions");
    list.innerHTML = "";
    console.log(list.innerHTML);
    data["transactions"].forEach(transaction => {
        let receive = transaction["receiverUID"] == -1;
        list.insertAdjacentHTML("beforeend", `
            <div class="mt-1 transaction text-white d-flex">
                <div class="p-2 d-flex flex-column">
                    <span class="quantity">${receive ? "B$" : "- B$"} ${CurrencyFormatter(transaction["quantity"])}</span>
                    <span>${receive ? "De: " + transaction["origin"] : "Para: " + transaction["receiver"]}</span>
                    <span>${transaction["type"]}</span>
                </div>
                <div class="${receive ? "green" : "red"} d-flex"/>
            </div>
        `);
    });
}

async function setLost(lost) {
    let uid = document.getElementById("playerlist").value;
    let response = await fetch(`${address}/lost?uid=${uid}&lost=${lost}`, { method: "POST" });
    let result = await response.json();
    if (result["result"] == "OK") {
        alert("Estado alterado com sucesso.");
    } else
        alert(result["message"]);
}

async function setHabeasCorpus(operation) {
    let uid = document.getElementById("playerlist").value;
    let response = await fetch(`${address}/habeascorpus?uid=${uid}&operation=${operation}`, { method: "POST" });
    let result = await response.json();
    if (result["result"] == "OK") {
        alert("Estado alterado com sucesso.");
    } else
        alert(result["message"]);
}

async function getPlayers() {
    let response = await fetch(address + "/players");
    let result = await response.json();
    let data = result["data"];
    let list = document.getElementById("pixselect");
    let players = document.getElementById("playerlist");
    list.innerHTML = "";
    players.innerHTML = "";
    data["players"].forEach(player => {
        list.insertAdjacentHTML("beforeend", `
                <option value="${player["uid"]}">${player["name"]}</option>
        `);
        players.insertAdjacentHTML("beforeend", `
                <option value="${player["uid"]}">${player["name"]}</option>
        `);
    });
    getData();
}

async function setTransaction() {
    let quantity = document.getElementById("pixquantity").value;
    let uid = document.getElementById("pixselect").value;
    let response = await fetch(`${address}/transaction?origin=-1&quantity=${quantity}&receiver=${uid}`, { method: "POST" });
    let result = await response.json();
    if (result["result"] == "OK") {
        alert("Enviado com sucesso.");
    } else
        alert(result["message"]);
}

async function getData() {
    let uid = document.getElementById("playerlist").value;
    let response = await fetch(`${address}/data?uid=${uid}`);
    let result = await response.json();
    let data = result["data"]["data"];
    for (const [key, value] of Object.entries(data)) {
        document.getElementById(key).innerText = value;
    }
}

async function movePlayer() {
    let uid = document.getElementById("playerlist").value;
    let newPosition = document.getElementById("movement").value;
    let response = await fetch(`${address}/move?uid=${uid}&position=${newPosition}`, { method: "POST" });
    let result = await response.json();
    if (result["result"] == "ERROR")
        alert(result["message"]);
    else
        alert("Player movimentado com sucesso.")
}

async function getTurn() {
    let response = await fetch(address + "/turn");
    let result = await response.json();
    let data = result["data"]["player"];
    document.getElementById("turnname").innerText = data["name"];
    document.getElementById("diceturn").innerText = data["dice"];
    document.getElementById("positionturn").innerText = data["position"];
}

function main() {
    getTransactions();
    getPlayers();
    getTurn();
    const socket = io(address + "/", { origins: ['*'] });
    socket.on("message", () => {
        getTransactions();
        getPlayers();
        getTurn();
    });
    socket.on("connect", () => {
        console.log(socket.id); // "G5p5..."
    });
}

main();