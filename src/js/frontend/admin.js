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
    console.log(teams);
    teams.forEach((team) => {
        const teamObj = {};
        team.forEach((element, index) => {
            let param = (index === 0 ?  'TeamName' : (index === 1 ? 'ColourID' : (index === 2) ? 'TeamID' : 'Colour'));
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
    console.log(data);
    const parentDiv = document.querySelector("#admin_div");
    if (parentDiv) {
        const br = document.createElement('br');
        data.forEach((team) => {
            let teamDiv = document.createElement('div');
            teamDiv.id = team.TeamName;
            teamDiv.classList.add('adminTeam');
            let label = document.createElement('label');
            label.textContent = team.TeamName;
            let input = document.createElement('input');
            input.value =team.Colour;
            teamDiv.appendChild(label);
            teamDiv.appendChild(input);
            parentDiv.appendChild(teamDiv);
            parentDiv.appendChild(br);
        })
    }
}