'use strict';


/**
 * Gets all the delete/remove buttons and execute the respective operations calling the API. 
 */
function setupForList() {
    const GROUP_ID_LENGTH = 36;
    const GAME_ID_LENGTH = 10;


    const deleteButtons = document.querySelectorAll('.cls-del-group-btn');
    const removeButtons = document.querySelectorAll('.cls-rmv-game-btn');

    deleteButtons.forEach(delBtn => {
        delBtn.onclick = onDeleteGroup;
    });

    removeButtons.forEach(rmvBtn => {
        rmvBtn.onclick = onRemoveGame;
    });

    return;


    /**
     * Deletes a group from a user.
     */
    async function onDeleteGroup() {
        const groupPath = this.id.substring(8);

        try {
            await apiDeleteGroup(groupPath);
        } catch (err) {
            alert(err);
        }
    }


    /**
     * Deletes a group from a user, calling the respective API operation.
     * @param {String} groupPath 
     */
    async function apiDeleteGroup(groupPath) {
        const delReqRes = await fetch(`/api/${groupPath}`, { method: 'DELETE' });

        if (delReqRes.status === 200) {
            window.location.href = groupPath.slice(0, -GROUP_ID_LENGTH);
            return;
        }

        throw Error(
            `Failed to delete group with path ${groupPath}\n` +
            delReqRes.status + ' ' + delReqRes.statusText
        );
    }


    /**
     * Removes a game from a group from a user.
     */
    async function onRemoveGame() {
        const selectedGame = document.querySelector('#gameSelection');
        const gamePath = this.id.substring(8) + selectedGame.value;

        try {
            await apiRemoveGame(gamePath);
        } catch (err) {
            alert(err);
        }
    }


    /**
     * Removes a game from a group from a user, calling the respective API operation. 
     * @param {String} groupPath 
     */
    async function apiRemoveGame(gamePath) {
        const rmvReqRes = await fetch(`/api/${gamePath}`, { method: 'DELETE' });

        if (rmvReqRes.status === 200) {
            window.location.href = gamePath.slice(0, -GAME_ID_LENGTH - "/games/".length);
            return;
        }

        throw Error(
            `Failed to remove game with path ${gamePath}\n` +
            rmvReqRes.status + ' ' + rmvReqRes.statusText
        );
    }
}
