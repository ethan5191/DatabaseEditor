import {queryDB} from "../backend/dbManager";

const groups = ["color", "rankings"];
const headers = ['Teams', 'Colors', 'Rankings'];

//Should only be responsible for loading the data from the database I believe.
export function loadAdmin() {
    let updateTeams = ([]);
    updateTeams.push(loadData());
    return updateTeams;
}

//Loads team data
function loadData() {
    const teams = queryDB(`
        select T.TeamName, TC.*, T.PredictedRanking
        from Teams T
                 inner join Teams_Colours TC on T.TeamID = TC.TeamID;`, 'allRows');
    const updateTeams = ([]);
    teams.forEach((team) => {
        const teamObj = {};
        team.forEach((element, index) => {
            let param = (index === 0 ? 'TeamName' : (index === 1 ? 'ColourID' : (index === 2) ? 'TeamID' : (index === 3) ? 'Colour' : 'PredictedRanking'));
            teamObj[param] = element;
        })
        updateTeams.push(teamObj);
    })
    return updateTeams;
}

//Responsible for actually updating the UI.
export function updateAdminUI(data) {
    const parentDiv = document.querySelector("#admin_div");
    if (parentDiv) {
        parentDiv.appendChild(createHeaderDiv());
        const br = document.createElement('br');
        let count = 0;
        data.forEach((elementsList) => {
            elementsList.forEach((element) => {
                let showRanking = true;
                let teamDiv = document.createElement('div');
                let idName = element.TeamName + "-div";
                if (document.getElementById(idName)) {
                    idName = idName + count;
                    count++;
                    showRanking = false;
                }
                teamDiv.id = idName;
                teamDiv.classList.add('adminTeam');
                let label = document.createElement('label');
                label.textContent = element.TeamName;
                let input = document.createElement('input');
                input.value = element.Colour;
                input.id = "color" + "-" + element.ColourID;
                label.htmlFor = input.id;
                teamDiv.appendChild(label);
                teamDiv.appendChild(input);
                if (showRanking) {
                    let rankings = document.createElement('select');
                    rankings.id = "rankings" + "-" + element.PredictedRanking;
                    for (let i = 1; i <= 11; i++) {
                        const optionElement = document.createElement('option');
                        optionElement.value = i;
                        optionElement.textContent = i;
                        if (i === element.PredictedRanking) {
                            optionElement.selected = true;
                        }
                        rankings.appendChild(optionElement);
                    }
                    teamDiv.appendChild(rankings);
                }
                parentDiv.appendChild(teamDiv);
                parentDiv.appendChild(br);
            })
        })
        parentDiv.appendChild(createButtonDiv());

        // Since this button is dynamically added, its eventListener must be added here.
        document.getElementById("confirmAdmin").addEventListener('click', function () {
            const adminDiv = document.querySelector("#admin_div");
            const teamDivs = adminDiv.querySelectorAll(':scope > div');
            let dataArray = ([]);
            teamDivs.forEach((div) => {
                const input = div.querySelector('input[id*="color"]');
                if (input) {
                    const parts = input.id.split('-');
                    const id = parts.pop();
                    const data = {
                        ColourID: id,
                        Colour: input.value
                    }
                    dataArray.push(data);
                }
            })
            callCommand(dataArray, parentDiv);
        })
    }
}

//Creates the headerDiv for the different columns.
function createHeaderDiv() {
    let headerDiv = document.createElement('div');
    headerDiv.className = 'admin_div';
    headerDiv.id = 'header-div';
    headers.forEach((header) => {
        let h = document.createElement('h3');
        h.className = 'teamH3';
        h.textContent = header;
        headerDiv.appendChild(h);
    })
    return headerDiv;
}

//Creates the confirm button and its div
function createButtonDiv() {
    let buttonDiv = document.createElement('div');
    buttonDiv.className = 'pos-relative';
    let confirmAdminBtn = document.createElement('button');
    confirmAdminBtn.className = "btn btn-primary custom-confirm";
    confirmAdminBtn.id = "confirmAdmin";
    confirmAdminBtn.textContent = "Confirm";
    buttonDiv.appendChild(confirmAdminBtn);
    let dropdownLineDiv = document.createElement('div');
    dropdownLineDiv.className = "dropdown-line";
    buttonDiv.appendChild(dropdownLineDiv);
    return buttonDiv;
}

//Calls the command logic with the necessary params and replaces the parent divs children.
function callCommand(dataArray, parentDiv) {
    //For an unknown reason I am unable to just import command.js at the top. Have to do it as a dynamic import
    //as importing it normally was causing a document is undefined error.
    import("../backend/command.js").then(module => {
        //calls editColor in the worker.js file, which handles calling the utils logic.
        const Command = new module.Command("editColor", dataArray);
        Command.execute();
        //Replace the content of the screen, so it doesn't duplicate itself.
        parentDiv.replaceChildren();
    })
}
