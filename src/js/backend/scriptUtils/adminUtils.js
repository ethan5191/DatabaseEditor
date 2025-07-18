import {queryDB} from "../dbManager";

//Handles the actual updating of the team colors based on user input. All teams are passed, even if there are no changes.
export function editColor(data) {
    data.forEach(element => {
        queryDB(`
            UPDATE Teams_Colours
            SET Colour = ${element.Colour}
            WHERE ColourID = ${element.ColourID}
        `);
    })
}

//For some reason this is causing errors, its like I cannot update the TeamName column on the Teams table.
export function editTeamName(data) {
    data.forEach(element => {
        if (element.TeamName && element.TeamID) {
            queryDB(`
            UPDATE Teams
            SET TeamName = ${element.TeamName}
            WHERE TeamID = ${element.TeamID}`)
        }
    })
}