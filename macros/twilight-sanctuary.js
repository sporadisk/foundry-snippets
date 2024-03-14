// Temporary-hitpoint macro for Twilight Domain Cleric's Twilight Sanctuary
// Install by adding the script to the macro bar (see https://foundryvtt.com/article/macros/ )
// Usage:
// 1. Select the cleric
// 2. Target all characters that should receive temp HP
// 3. Run the macro
// This is a tweaked version of /u/MaxPat's script from 2022:
// Original: https://www.reddit.com/r/FoundryVTT/comments/y0qven/comment/irxmrhg/
// Class and feature documentation: https://www.dndbeyond.com/classes/cleric#TwilightDomain
function getCleric() {
    var controlledTokens = canvas.tokens.controlled;

    if (controlledTokens.length == 1)
    {
        let cleric = controlledTokens[0]
        let clericLevel = cleric.actor.classes?.cleric?.spellcasting.levels; 
        if (clericLevel == undefined) {
            console.log("the selected character isn't a cleric!")
            return null
        }
        console.log("Cleric level: " + clericLevel)
        return cleric
    }
}

const cleric = getCleric()

if (cleric != null)
{
    game.user.targets.forEach(target => {
        UpdateTempHP(target)
    })
}

async function UpdateTempHP(token)
{
    let current_tempHP = token.actor.system?.attributes?.hp?.temp;

    let distance = canvas.grid.measureDistance(token, cleric)

    // Make sure targets are inside the bubble
    if (distance > 30) {
        console.log(token.actor.name + " is outside the Twilight Sanctuary radius: Distance is " + distance.toPrecision(4) + " ft")
        return
    }
    

    // Roll Twilight Sanctuary temporary hit points
    let healRoll = new Roll('1d6 + @classes.cleric.levels', cleric.actor.getRollData()).evaluate({async: false});

    healRoll.toMessage({
        user: game.user._id,
        speaker: ChatMessage.getSpeaker(),
        flavor: "Twilight Sanctuary - Temp HP"
    });

    // Check if new roll is higher than old temp HP
    let new_tempHP = parseInt(healRoll.total);

    if (current_tempHP > new_tempHP)
    {
        new_tempHP = current_tempHP;
    }

    console.log("granting temporary HP to " + token.actor.name);

    await token.actor.update({'system.attributes.hp.temp': new_tempHP});
}