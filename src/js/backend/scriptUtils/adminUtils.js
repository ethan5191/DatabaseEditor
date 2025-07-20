import {queryDB} from "../dbManager";

//Handles the actual updating of the team colors based on user input. All teams are passed, even if there are no changes.
export function editColor(data) {
    data.forEach(element => {
        if (element.Colour) {
            queryDB(`
                UPDATE Teams_Colours
                SET Colour = ${element.Colour}
                WHERE ColourID = ${element.ColourID}
            `);
        }
    })
}

//Handles logic for updating the rankings.
export function editRankings(data) {
    data.forEach(element => {
        if (element.TeamID && element.PredictedRanking) {
            queryDB(`
                UPDATE Teams
                SET PredictedRanking = ${element.PredictedRanking}
                WHERE TeamID = ${element.TeamID}
            `)
        }
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