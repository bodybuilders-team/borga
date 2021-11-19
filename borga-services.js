'use strict';

module.exports = function (data_ext, data_int) {

    async function addGameToGroup(userId, groupName, gameName){
        const game = await data_ext.getGameByName(gameName)
        return data_int.addGameToGroup(userId, groupName, game)
    }

	return {
        searchGameByName: data_ext.getGameByName,

        createGroup: data_int.createGroup,
        editGroup: data_int.editGroup,
        listUserGroups: data_int.listUserGroups,
        deleteGroup: data_int.deleteGroup,
        getGroupDetails: data_int.getGroupDetails,
        addGameToGroup: data_int.addGameToGroup,
        removeGameFromGroup: data_int.removeGameFromGroup,
        getPopularGames: {},

        createNewUser: data_int.createNewUser,
	};
}
