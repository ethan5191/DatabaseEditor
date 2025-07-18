import {queryDB} from "../backend/dbManager";

const groups = ["color", "rankings"];

//Should only be responsible for loading the data from the database I believe.
export function loadAdmin() {
    let updateTeams = ([]);
    updateTeams.push(loadColors());
    // updateTeams.push(loadRanking());
    return updateTeams;
}

//Loads the team colors object along with the team name from the Teams table.
function loadColors() {
    const teams = queryDB(`
        select T.TeamName, TC.*
        from Teams T
                 inner join Teams_Colours TC on T.TeamID = TC.TeamID;`, 'allRows');
    const updateTeams = ([]);
    teams.forEach((team) => {
        const teamObj = {};
        team.forEach((element, index) => {
            let param = (index === 0 ? 'TeamName' : (index === 1 ? 'ColourID' : (index === 2) ? 'TeamID' : 'Colour'));
            teamObj[param] = element;
        })
        updateTeams.push(teamObj);
    })
    return updateTeams;
}

//Loads the team name and predicted ranking from the Teams table.
function loadRanking() {
    const rankings = queryDB(`
        select TeamName, PredictedRanking
        from Teams
        where Formula = 1;`, "allRows");
    const updateRankings = ([]);
    rankings.forEach((ranking) => {
        const teamObj = {};
        ranking.forEach((element, index) => {
            let param = (index === 0) ? 'TeamName' : 'PredictedRanking';
            teamObj[param] = element;
        })
        updateRankings.push(teamObj);
    })
    return updateRankings;
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
                let teamDiv = document.createElement('div');
                let idName = element.TeamName + "-div";
                if (document.getElementById(idName)) {
                    idName = idName + count;
                    count++;
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
    let teamH3 = document.createElement('h3');
    teamH3.textContent = 'Teams';
    teamH3.className = 'teamH3';
    let colorH3 = document.createElement('h3');
    colorH3.textContent = 'Colors';
    let rankingsH3 = document.createElement('h3');
    rankingsH3.textContent = 'Rankings';
    headerDiv.appendChild(teamH3);
    headerDiv.appendChild(colorH3);
    // headerDiv.appendChild(rankingsH3);
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
