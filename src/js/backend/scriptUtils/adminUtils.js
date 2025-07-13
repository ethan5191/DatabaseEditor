import {queryDB} from "../dbManager";

//Handles the actual updating of the team colors based on user input. All teams are passed, even if there are no changes.
export function editColor(data) {
    console.log("Inside editColor in adminUtils ", data);
    data.forEach(element => {
        queryDB(`
            UPDATE Teams_Colours
            SET Colour = ${element.Colour}
            WHERE ColourID = ${element.ColourID}
        `);
    })

}