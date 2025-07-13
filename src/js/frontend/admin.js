import {queryDB} from "../backend/dbManager";

//Should only be responsible for loading the data from the database I believe.
export function loadAdmin() {
    // const columns = queryDB('PRAGMA table_info(Teams);', 'allRows');
    // const columnNames = ([]);
    // columns.forEach((column, index) => {
    //     columnNames[index] = column[1];
    // })
    // console.log(columnNames);
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
        // const teamObj = {};
        // team.forEach((element, index) => {
        //     let param = columnNames[index];
        //     teamObj[param] = element;
        // })
        // updateTeams.push(teamObj);
    })
    return updateTeams;
}

//Responsible for actually updating the UI.
export function updateAdminUI(data) {
    const parentDiv = document.querySelector("#admin_div");
    if (parentDiv) {
        let headerDiv = document.createElement('div');
        headerDiv.className = 'admin_div';
        headerDiv.id = 'header-div';
        let emptyH3 = document.createElement('h3');
        emptyH3.textContent = 'Teams';
        emptyH3.className = 'emptyH3';
        let colorH3 = document.createElement('h3');
        colorH3.textContent = 'Colors';
        headerDiv.appendChild(emptyH3);
        headerDiv.appendChild(colorH3);
        parentDiv.appendChild(headerDiv);
        const br = document.createElement('br');
        let count = 0;
        data.forEach((team) => {
            let teamDiv = document.createElement('div');
            let idName = team.TeamName + "-div";
            if (document.getElementById(idName)) {
                idName = idName + count;
                count++;
            }
            teamDiv.id = idName;
            teamDiv.classList.add('adminTeam');
            let label = document.createElement('label');
            label.textContent = team.TeamName;
            let input = document.createElement('input');
            input.value = team.Colour;
            input.id = team.ColourID;
            label.htmlFor = input.id;
            teamDiv.appendChild(label);
            teamDiv.appendChild(input);
            parentDiv.appendChild(teamDiv);
            parentDiv.appendChild(br);
        })
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
        parentDiv.appendChild(buttonDiv);

        // Since this button is dynamically added, its eventListener must be added here.
        document.getElementById("confirmAdmin").addEventListener('click', function () {
            const adminDiv = document.querySelector("#admin_div");
            const teamDivs = adminDiv.querySelectorAll(':scope > div');
            let dataArray = ([]);
            teamDivs.forEach((div) => {
                const input = div.querySelector('input');
                if (input) {
                    const data = {
                        ColourID: input.id,
                        Colour: input.value
                    }
                    dataArray.push(data);
                }
            })
            //For an unknown reason I am unable to just import command.js at the top. Have to do it as a dynamic import
            //as importing it normally was causing a document is undefined error.
            import("../backend/command.js").then(module => {
                //calls editColor in the worker.js file, which handles calling the utils logic.
                const Command = new module.Command("editColor", dataArray);
                Command.execute();
                //Replace the content of the screen, so it doesn't duplicate itself.
                parentDiv.replaceChildren();
            })
        })
    }
}
